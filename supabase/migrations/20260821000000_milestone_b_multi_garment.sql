-- Milestone B: Multi-Garment Transaction Engine
--
-- Extends the Milestone A transaction foundation to support multiple orders
-- (garments) per transaction. Key changes:
--
-- 1. Transaction status expanded: open, partially_completed, completed,
--    cancelled. Legacy 'closed' values are migrated to 'completed'.
-- 2. orders gains garment_index (per-transaction sequence) and
--    duplicated_from_order_id (origin tracking).
-- 3. New RPCs for managing multi-garment transactions.
--
-- Commercial Engine remains transaction-grain (1 quotation per transaction,
-- payments resolve via transaction_id) — already correct from Milestone A.
-- Production Engine remains order-grain (8 production stages per order) —
-- no changes needed.
--
-- Backward compatibility: existing orders keep working, their transaction
-- status 'closed' is migrated to 'completed'.

-- ============================================================
-- STEP 1: Expand transaction status
-- ============================================================

-- Drop the old constraint first -- it only allows ('open','closed'), so
-- migrating data to 'completed' while it's still active would violate it.
alter table public.transactions
  drop constraint if exists transactions_status_check;

-- Migrate existing 'closed' records to 'completed'
update public.transactions
set status = 'completed'
where status = 'closed';

-- Add the expanded constraint
alter table public.transactions
  add constraint transactions_status_check
  check (status in ('open', 'partially_completed', 'completed', 'cancelled'));

-- ============================================================
-- STEP 2: Add garment_index and duplicated_from_order_id to orders
-- ============================================================

alter table public.orders
  add column if not exists garment_index integer not null default 1;

alter table public.orders
  add column if not exists duplicated_from_order_id uuid
  references public.orders(id);

-- Soft-delete marker for remove_garment_from_transaction (STEP 5). orders.
-- transaction_id was locked NOT NULL in Milestone A (every order belongs to
-- exactly one transaction, permanently) -- nulling it out to "remove" a
-- garment would violate that constraint. A garment removed before
-- production started keeps its transaction_id (audit trail, matches STEP
-- 5's own stated intent) but is excluded from active garment counts via
-- this timestamp instead.
alter table public.orders
  add column if not exists removed_from_transaction_at timestamptz;

-- Backfill garment_index: for each transaction, number its orders sequentially
update public.orders o
set garment_index = sub.seq
from (
  select id, row_number() over (
    partition by transaction_id
    order by created_at, id
  ) as seq
  from public.orders
) sub
where o.id = sub.id;

-- ============================================================
-- STEP 3: RPC — add_garment_to_transaction
-- ============================================================
-- Creates a new order under an existing OPEN transaction.
-- Called when a Fitter adds a garment to a running transaction.

create or replace function public.add_garment_to_transaction(
  p_transaction_id uuid,
  p_customer_id uuid,
  p_order_number text,
  p_customer_token text,
  p_consultation_id uuid default null,
  p_consultation_number text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_transaction public.transactions;
  v_order public.orders;
  v_garment_index integer;
  v_result jsonb;
begin
  -- Validate transaction exists and is OPEN
  select * into v_transaction from public.transactions where id = p_transaction_id;
  if v_transaction.id is null then
    raise exception 'Transaksi tidak ditemukan.';
  end if;
  if v_transaction.status != 'open' then
    raise exception 'Transaksi tidak dalam status OPEN. Status saat ini: %', v_transaction.status;
  end if;

  -- Calculate next garment_index for this transaction
  select coalesce(max(garment_index), 0) + 1
  into v_garment_index
  from public.orders
  where transaction_id = p_transaction_id;

  -- Create the order
  insert into public.orders (
    customer_id,
    order_number,
    current_state,
    customer_token,
    transaction_id,
    garment_index,
    duplicated_from_order_id
  ) values (
    p_customer_id,
    p_order_number,
    'order',
    p_customer_token,
    p_transaction_id,
    v_garment_index,
    null
  )
  returning * into v_order;

  -- Log business event
  insert into public.business_events (
    consultation_id,
    order_id,
    event_type,
    event_data,
    created_by
  ) values (
    p_consultation_id,
    v_order.id,
    'order.created',
    jsonb_build_object(
      'order_number', p_order_number,
      'transaction_id', p_transaction_id,
      'garment_index', v_garment_index,
      'added_to_existing_transaction', true
    ),
    auth.uid()
  );

  -- Build result
  select jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'garment_index', v_garment_index,
    'transaction_id', v_transaction.id,
    'transaction_number', v_transaction.transaction_number
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.add_garment_to_transaction(uuid, uuid, text, text, uuid, text) to authenticated, anon;

-- ============================================================
-- STEP 4: RPC — duplicate_garment
-- ============================================================
-- Copies design/measurement/snapshot from an existing order.
-- Creates a NEW order under the SAME transaction with:
--   - Same design selections (copied from snapshot)
--   - Same measurement data (copied from snapshot)
--   - Same material selections
--   - Same accessories & embroidery
--   - Fresh order_number, QR, customer_token, production_stage_records
--   - duplicated_from_order_id set to source order

create or replace function public.duplicate_garment(
  p_source_order_id uuid,
  p_new_order_number text,
  p_new_customer_token text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_source_order public.orders;
  v_transaction public.transactions;
  v_new_order public.orders;
  v_source_event public.business_events;
  v_snapshot jsonb;
  v_garment_index integer;
  v_result jsonb;
begin
  -- Validate source order exists
  select * into v_source_order from public.orders where id = p_source_order_id;
  if v_source_order.id is null then
    raise exception 'Order sumber tidak ditemukan.';
  end if;

  -- Get the transaction
  select * into v_transaction from public.transactions where id = v_source_order.transaction_id;
  if v_transaction.id is null then
    raise exception 'Transaksi dari order sumber tidak ditemukan.';
  end if;

  -- Get the source order's snapshot
  select * into v_source_event from public.business_events
  where order_id = p_source_order_id
    and event_type = 'order.created'
  order by created_at desc
  limit 1;

  if v_source_event.id is null then
    raise exception 'Snapshot order sumber tidak ditemukan.';
  end if;

  v_snapshot := v_source_event.event_data;

  -- Calculate next garment_index
  select coalesce(max(garment_index), 0) + 1
  into v_garment_index
  from public.orders
  where transaction_id = v_source_order.transaction_id;

  -- Create the new order (fresh production identity)
  insert into public.orders (
    customer_id,
    order_number,
    current_state,
    customer_token,
    transaction_id,
    garment_index,
    duplicated_from_order_id
  ) values (
    v_source_order.customer_id,  -- same customer by default
    p_new_order_number,
    'order',
    p_new_customer_token,
    v_source_order.transaction_id,
    v_garment_index,
    p_source_order_id
  )
  returning * into v_new_order;

  -- Copy the snapshot with updated references
  insert into public.business_events (
    consultation_id,
    order_id,
    event_type,
    event_data,
    created_by
  ) values (
    v_source_event.consultation_id,
    v_new_order.id,
    'order.created',
    jsonb_set(
      v_snapshot,
      '{order_number}',
      to_jsonb(p_new_order_number)
    ),
    auth.uid()
  );

  insert into public.business_events (
    consultation_id,
    order_id,
    event_type,
    event_data,
    created_by
  ) values (
    v_source_event.consultation_id,
    v_new_order.id,
    'order.duplicated',
    jsonb_build_object(
      'source_order_id', p_source_order_id,
      'source_order_number', v_source_order.order_number,
      'new_order_id', v_new_order.id,
      'new_order_number', p_new_order_number,
      'transaction_id', v_source_order.transaction_id,
      'garment_index', v_garment_index
    ),
    auth.uid()
  );

  -- Build result
  select jsonb_build_object(
    'order_id', v_new_order.id,
    'order_number', v_new_order.order_number,
    'garment_index', v_garment_index,
    'transaction_id', v_transaction.id,
    'transaction_number', v_transaction.transaction_number
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.duplicate_garment(uuid, text, text) to authenticated, anon;

-- ============================================================
-- STEP 5: RPC — remove_garment_from_transaction
-- ============================================================
-- Removes an order from a transaction (only if production hasn't started).
-- Soft-deletes via business event; the order record stays for audit.

create or replace function public.remove_garment_from_transaction(
  p_order_id uuid
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_order public.orders;
  v_transaction public.transactions;
  v_has_production boolean;
begin
  -- Validate order exists
  select * into v_order from public.orders where id = p_order_id;
  if v_order.id is null then
    raise exception 'Order tidak ditemukan.';
  end if;

  -- Check if production has started (any stage record exists)
  select exists(
    select 1 from public.production_stage_records
    where order_id = p_order_id
  ) into v_has_production;

  if v_has_production then
    raise exception 'Order sudah masuk produksi dan tidak dapat dihapus. Gunakan Emergency Override jika perlu.';
  end if;

  -- Get the transaction
  select * into v_transaction from public.transactions where id = v_order.transaction_id;

  -- Log the removal event
  insert into public.business_events (
    order_id,
    event_type,
    event_data,
    created_by
  ) values (
    p_order_id,
    'order.removed_from_transaction',
    jsonb_build_object(
      'order_number', v_order.order_number,
      'transaction_id', v_transaction.id,
      'transaction_number', v_transaction.transaction_number,
      'garment_index', v_order.garment_index,
      'customer_id', v_order.customer_id
    ),
    auth.uid()
  );

  -- Mark removed. transaction_id stays populated (it is NOT NULL, locked in
  -- Milestone A) -- this is a soft delete via timestamp, not a
  -- disassociation. get_transaction_detail/get_open_transactions_for_customer
  -- both exclude removed_from_transaction_at IS NOT NULL orders from active
  -- garment counts.
  update public.orders
  set removed_from_transaction_at = now()
  where id = p_order_id;
end;
$$;

grant execute on function public.remove_garment_from_transaction(uuid) to authenticated, anon;

-- ============================================================
-- STEP 6: RPC — get_transaction_detail
-- ============================================================
-- Returns a transaction with all its orders and their current state.

create or replace function public.get_transaction_detail(
  p_transaction_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'transaction_id', t.id,
    'transaction_number', t.transaction_number,
    'status', t.status,
    'commercial_type', t.commercial_type,
    'commercial_type_reason', t.commercial_type_reason,
    'primary_customer_id', t.primary_customer_id,
    'primary_customer_name', c.name,
    'created_at', t.created_at,
    'closed_at', t.closed_at,
    'garment_count', (
      select count(*) from public.orders o
      where o.transaction_id = t.id and o.removed_from_transaction_at is null
    ),
    'unique_customer_count', (
      select count(distinct o.customer_id) from public.orders o
      where o.transaction_id = t.id and o.removed_from_transaction_at is null
    ),
    'orders', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'order_id', o.id,
          'order_number', o.order_number,
          'customer_id', o.customer_id,
          'customer_name', oc.name,
          'current_state', o.current_state,
          'garment_index', o.garment_index,
          'duplicated_from_order_id', o.duplicated_from_order_id,
          'created_at', o.created_at,
          -- Measurement's canonical contract is consultation-driven
          -- (/workspace/measurement/[consultationId], never [orderId]) --
          -- carried here so callers never need a second lookup to navigate
          -- there. Same order_id -> consultation_id resolution
          -- get_fitter_kpi_list()/findOrderIdForConsultation already use
          -- (business_events has no direct FK, just correlated ids on the
          -- same row): the order.created event links exactly one order to
          -- exactly one consultation.
          'consultation_id', (
            select be.consultation_id
            from public.business_events be
            where be.order_id = o.id and be.event_type = 'order.created'
            limit 1
          ),
          'has_production', exists(
            select 1 from public.production_stage_records psr
            where psr.order_id = o.id
          ),
          'production_progress', (
            select case when count(*) = 0 then 0
              else round(
                count(*) filter (where psr2.status = 'completed')::numeric
                / count(*) * 100
              )
            end
            from public.production_stage_records psr2
            where psr2.order_id = o.id
          )
        )
        order by o.garment_index
      )
      from public.orders o
      left join public.customers oc on oc.id = o.customer_id
      where o.transaction_id = t.id and o.removed_from_transaction_at is null
    ), '[]'::jsonb)
  ) into v_result
  from public.transactions t
  left join public.customers c on c.id = t.primary_customer_id
  where t.id = p_transaction_id;

  return v_result;
end;
$$;

grant execute on function public.get_transaction_detail(uuid) to authenticated, anon;

-- ============================================================
-- STEP 7: RPC — get_open_transactions_for_customer
-- ============================================================
-- Returns all OPEN transactions for a customer.
-- Used by Scenario 4 to prompt "Tambahkan ke transaksi yang masih berjalan?"

create or replace function public.get_open_transactions_for_customer(
  p_customer_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_result jsonb;
begin
  select jsonb_agg(
    jsonb_build_object(
      'transaction_id', t.id,
      'transaction_number', t.transaction_number,
      'commercial_type', t.commercial_type,
      'created_at', t.created_at,
      'garment_count', (
        select count(*) from public.orders o
        where o.transaction_id = t.id and o.removed_from_transaction_at is null
      ),
      'orders', (
        select jsonb_agg(
          jsonb_build_object(
            'order_id', o.id,
            'order_number', o.order_number,
            'garment_index', o.garment_index,
            'current_state', o.current_state
          )
          order by o.garment_index
        )
        from public.orders o
        where o.transaction_id = t.id and o.removed_from_transaction_at is null
      )
    )
    order by t.created_at desc
  ) into v_result
  from public.transactions t
  where t.primary_customer_id = p_customer_id
    and t.status = 'open';

  return coalesce(v_result, '[]'::jsonb);
end;
$$;

grant execute on function public.get_open_transactions_for_customer(uuid) to authenticated, anon;

-- ============================================================
-- STEP 8: RPC — update_transaction_status
-- ============================================================
-- Updates the transaction status with validation.
-- Rules:
--   OPEN → PARTIALLY_COMPLETED (when at least one order is completed in production)
--   OPEN → COMPLETED (when all orders are completed)
--   OPEN → CANCELLED (owner override, must have reason)
--   PARTIALLY_COMPLETED → COMPLETED (when remaining orders finish)
--   PARTIALLY_COMPLETED → CANCELLED (owner override)

create or replace function public.update_transaction_status(
  p_transaction_id uuid,
  p_new_status text,
  p_reason text default null
)
returns transactions
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_transaction public.transactions;
  v_current_status text;
  v_valid boolean;
begin
  -- Validate role
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengubah status transaksi.';
  end if;

  -- Validate transaction exists
  select * into v_transaction from public.transactions where id = p_transaction_id;
  if v_transaction.id is null then
    raise exception 'Transaksi tidak ditemukan.';
  end if;

  v_current_status := v_transaction.status;

  -- Validate transition
  v_valid := case
    when v_current_status = 'open' and p_new_status in ('partially_completed', 'completed', 'cancelled') then true
    when v_current_status = 'partially_completed' and p_new_status in ('completed', 'cancelled') then true
    else false
  end;

  if not v_valid then
    raise exception 'Transisi status tidak valid: % → %', v_current_status, p_new_status;
  end if;

  -- Require reason for cancellation
  if p_new_status = 'cancelled' and (p_reason is null or trim(p_reason) = '') then
    raise exception 'Alasan pembatalan wajib diisi.';
  end if;

  -- Update the transaction
  update public.transactions
  set status = p_new_status,
      closed_at = case when p_new_status in ('completed', 'cancelled') then now() else closed_at end
  where id = p_transaction_id
  returning * into v_transaction;

  -- Log the event
  insert into public.business_events (
    event_type,
    event_data,
    created_by
  ) values (
    'transaction.status_changed',
    jsonb_build_object(
      'transaction_id', p_transaction_id,
      'transaction_number', v_transaction.transaction_number,
      'from_status', v_current_status,
      'to_status', p_new_status,
      'reason', p_reason
    ),
    auth.uid()
  );

  return v_transaction;
end;
$$;

grant execute on function public.update_transaction_status(uuid, text, text) to authenticated, anon;

-- ============================================================
-- STEP 9: Fix compute_queue_snapshot for multi-garment transactions
-- ============================================================
-- Pre-existing function (Sprint C, add_production_queue_engine) classifies
-- an order stuck at material_prep with no quotation yet as an 'approval'
-- bottleneck. Its quoted_orders CTE checked `quotations.order_id = o.id`
-- directly -- correct only because every transaction had exactly one order
-- before this migration. Now that add_garment_to_transaction/
-- duplicate_garment can put multiple orders under one transaction sharing
-- one quotation (Milestone A: quotations is transaction-grain, unique on
-- transaction_id), garments #2+ would never match their own order_id in
-- quotations and get permanently misclassified as awaiting price approval
-- even though their transaction already has one. Only quoted_orders'
-- definition changes -- everything else in this function is byte-identical
-- to the version it replaces.

create or replace function public.compute_queue_snapshot()
returns table(order_id uuid, order_number text, customer_name text, service_level text, hari_d date, created_at timestamptz, is_on_hold boolean, current_stage text, current_stage_status text, queue_status text, priority_rank integer, queue_position integer, bottleneck_category text, target_usage_date date, estimation_verdict text)
language sql
security definer
set search_path to 'public'
as $$
  with stage_seq (stage, ord) as (
    values
      ('material_prep', 1), ('pattern_formulation', 2), ('cutting', 3),
      ('sewing', 4), ('qc', 5), ('finishing', 6), ('packing', 7), ('shipping', 8)
  ),
  latest_attempt as (
    select distinct on (r.order_id, r.stage)
      r.order_id, r.stage, r.status, r.operator_id, r.assigned_operator_id,
      r.courier, r.tracking_number
    from public.production_stage_records r
    order by r.order_id, r.stage, r.attempt desc
  ),
  order_stage_status as (
    select o.id as order_id, ss.stage, ss.ord,
      coalesce(la.status, 'pending') as status,
      la.operator_id, la.assigned_operator_id, la.courier, la.tracking_number
    from public.orders o
    cross join stage_seq ss
    left join latest_attempt la on la.order_id = o.id and la.stage = ss.stage
  ),
  current_per_order as (
    select distinct on (order_id)
      order_id, stage as current_stage, status as current_stage_status,
      operator_id, assigned_operator_id, courier, tracking_number
    from order_stage_status
    where status <> 'completed'
    order by order_id, ord
  ),
  quoted_orders as (
    select distinct o2.id as order_id
    from public.orders o2
    join public.quotations q on q.transaction_id = o2.transaction_id
  ),
  operator_capacity as (
    select * from public.get_operator_capacity()
  ),
  latest_event as (
    select distinct on (order_id) order_id, event_data
    from public.business_events
    where event_type = 'order.created' and order_id is not null
    order by order_id, created_at desc
  ),
  classified as (
    select
      o.id as order_id,
      o.order_number,
      c.name as customer_name,
      o.service_level,
      o.hari_d,
      o.created_at,
      o.is_on_hold,
      cpo.current_stage,
      cpo.current_stage_status,
      case
        when o.is_on_hold then 'hold'
        when cpo.current_stage is null then 'completed'
        when cpo.current_stage_status = 'in_progress' then 'in_progress'
        when o.hari_d is not null and o.hari_d > current_date then 'waiting'
        else 'ready'
      end as queue_status,
      case o.service_level
        when 'very_fast' then 1
        when 'fast' then 2
        when 'standard' then 3
        else 4
      end as priority_rank,
      case
        when o.is_on_hold or cpo.current_stage is null then null
        when o.hari_d is not null and o.hari_d > current_date then 'capacity'
        when cpo.current_stage = 'material_prep' and not exists (
          select 1 from quoted_orders qo where qo.order_id = o.id
        ) then 'approval'
        when cpo.current_stage = 'material_prep' then 'material'
        when cpo.current_stage in ('cutting', 'sewing')
          and cpo.assigned_operator_id is null and cpo.operator_id is null
          then 'operator'
        when cpo.current_stage in ('cutting', 'sewing')
          and exists (
            select 1 from operator_capacity oc
            where oc.operator_id = coalesce(cpo.operator_id, cpo.assigned_operator_id)
              and oc.utilization_pct > 100
          ) then 'operator'
        when cpo.current_stage = 'qc' then 'qc'
        when cpo.current_stage = 'finishing' then 'finishing'
        when cpo.current_stage = 'packing' then 'packing'
        when cpo.current_stage = 'shipping'
          and (cpo.courier is null or cpo.tracking_number is null) then 'supplier'
        else null
      end as bottleneck_category,
      nullif(le.event_data -> 'eventInformation' ->> 'targetUsageDate', '')::date as target_usage_date,
      le.event_data -> 'estimationValidation' ->> 'verdict' as estimation_verdict
    from public.orders o
    left join public.customers c on c.id = o.customer_id
    left join current_per_order cpo on cpo.order_id = o.id
    left join latest_event le on le.order_id = o.id
  )
  select
    order_id, order_number, customer_name, service_level, hari_d, created_at, is_on_hold,
    current_stage, current_stage_status, queue_status, priority_rank,
    case when queue_status in ('waiting', 'ready', 'in_progress') then
      (row_number() over (
        partition by (queue_status in ('waiting', 'ready', 'in_progress'))
        order by priority_rank, hari_d nulls last, created_at
      ))::integer
    else null end as queue_position,
    bottleneck_category,
    target_usage_date,
    estimation_verdict
  from classified;
$$;
