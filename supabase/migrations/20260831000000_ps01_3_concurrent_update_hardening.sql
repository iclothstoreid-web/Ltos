-- Sprint PS-01.3: Concurrent Update Hardening
--
-- Scope: close "SELECT/aggregate -> calculate -> UPDATE/INSERT" gaps found
-- in the audit below, using only single-statement atomic SQL, a safety-net
-- UNIQUE constraint, or (where the constraint alone isn't enough) a
-- bounded retry-on-conflict loop inside the SAME function call — no new
-- explicit transactions, no row/advisory locking, no optimistic-lock
-- version columns (that's PS-01.2's tool, not this sprint's). No RPC
-- signature changed: every function below keeps its exact params, return
-- type and error contract.

-- ============================================================
-- 1. recompute_quotation_total() -- Commercial calculation
--
-- Found: `select * into v_row from quotations where id=...` (a snapshot
-- into a PL/pgSQL variable) followed by a SEPARATE `update quotations set
-- total=..., amount=... where id=...` computed from that variable. Today
-- every caller (apply_order_discount, apply_order_kol,
-- set_order_price_override, clear_order_price_override,
-- upsert_order_quotation) happens to call this only right after its own
-- UPDATE to the same row in the same transaction, so the row is already
-- locked and the snapshot is safe in practice -- but the function itself,
-- read in isolation, is the textbook read-calculate-write shape, and nothing
-- stops a future caller from invoking it standalone (it's a public
-- SECURITY DEFINER RPC). Two such standalone calls racing on the same
-- quotation could each compute `total` from a stale pre-state and the
-- later UPDATE would silently overwrite the true current total with a
-- stale number.
--
-- Fix: collapsed into ONE `update ... from (subquery)` statement -- the
-- subquery (which re-reads quotations + commercial_rules) is evaluated as
-- part of the same atomic UPDATE that writes `total`/`amount`, so there is
-- no longer a separate read-into-variable step to go stale. Same
-- calculation, same inputs, same output for every existing caller.
-- ============================================================

create or replace function public.recompute_quotation_total(p_quotation_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  update public.quotations q
  set total = c.computed_total,
      amount = c.computed_total
  from (
    select
      case
        when q2.override_amount is not null then q2.override_amount
        when coalesce(cr.price_rounding_nearest, 0) > 0 then
          round(
            greatest(q2.subtotal - q2.discount_amount - q2.kol_discount_amount, 0)
            / cr.price_rounding_nearest
          ) * cr.price_rounding_nearest
        else greatest(q2.subtotal - q2.discount_amount - q2.kol_discount_amount, 0)
      end as computed_total
    from public.quotations q2
    left join public.commercial_rules cr on cr.id = true
    where q2.id = p_quotation_id
  ) c
  where q.id = p_quotation_id;
end;
$function$;

-- ============================================================
-- 2. add_garment_to_transaction() / duplicate_garment() -- multi-garment
-- sequencing (Production/Commercial: garment_index drives display order,
-- get_transaction_detail/get_open_transactions_for_customer ordering)
--
-- Found: `select coalesce(max(garment_index),0)+1 into v_garment_index
-- from orders where transaction_id=...` followed by a separate `insert
-- into orders (..., garment_index, ...) values (..., v_garment_index,
-- ...)`. Two garments added to the SAME open transaction at nearly the
-- same time (two staff, or a double-click on "Tambah Garment") can both
-- read the same max() before either INSERT commits, and both then insert
-- with the SAME garment_index -- silent duplicate sequence numbers, no
-- error to either caller. Unlike a single-row UPDATE, Postgres's row-level
-- locking gives no protection here: these are two brand-new, different
-- rows, so there's no shared lock to serialize the two computations
-- against.
--
-- Fix: a new UNIQUE constraint on (transaction_id, garment_index) turns a
-- collision from a silent duplicate into a hard, detectable
-- unique_violation; both functions now retry the read-calculate-insert
-- sequence a bounded number of times when that happens, recomputing
-- garment_index fresh each attempt. This still runs inside the one
-- existing function call (one implicit transaction, no new transaction
-- boundary, no explicit lock) -- it just no longer trusts a single stale
-- snapshot. Verified zero existing (transaction_id, garment_index)
-- duplicates before adding the constraint.
-- ============================================================

alter table public.orders
  add constraint orders_transaction_garment_index_key unique (transaction_id, garment_index);

create or replace function public.add_garment_to_transaction(
  p_transaction_id uuid,
  p_customer_id uuid,
  p_order_number text,
  p_customer_token text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_transaction public.transactions;
  v_order public.orders;
  v_garment_index integer;
  v_result jsonb;
  v_attempt integer := 0;
begin
  select * into v_transaction from public.transactions where id = p_transaction_id;
  if v_transaction.id is null then
    raise exception 'Transaksi tidak ditemukan.';
  end if;
  if v_transaction.status != 'open' then
    raise exception 'Transaksi tidak dalam status OPEN. Status saat ini: %', v_transaction.status;
  end if;

  loop
    v_attempt := v_attempt + 1;

    select coalesce(max(garment_index), 0) + 1
    into v_garment_index
    from public.orders
    where transaction_id = p_transaction_id;

    begin
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

      exit;
    exception when unique_violation then
      if v_attempt >= 10 then
        raise exception 'Gagal menetapkan nomor garment setelah beberapa percobaan bersamaan. Coba lagi.';
      end if;
      -- another concurrent add/duplicate just took v_garment_index; loop and recompute
    end;
  end loop;

  select jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'garment_index', v_garment_index,
    'transaction_id', v_transaction.id,
    'transaction_number', v_transaction.transaction_number
  ) into v_result;

  return v_result;
end;
$function$;

create or replace function public.duplicate_garment(
  p_source_order_id uuid,
  p_new_order_number text,
  p_new_customer_token text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_source_order public.orders;
  v_transaction public.transactions;
  v_new_order public.orders;
  v_source_event public.business_events;
  v_snapshot jsonb;
  v_garment_index integer;
  v_result jsonb;
  v_attempt integer := 0;
begin
  select * into v_source_order from public.orders where id = p_source_order_id;
  if v_source_order.id is null then
    raise exception 'Order sumber tidak ditemukan.';
  end if;

  select * into v_transaction from public.transactions where id = v_source_order.transaction_id;
  if v_transaction.id is null then
    raise exception 'Transaksi dari order sumber tidak ditemukan.';
  end if;

  select * into v_source_event from public.business_events
  where order_id = p_source_order_id
    and event_type = 'order.created'
  order by created_at desc
  limit 1;

  if v_source_event.id is null then
    raise exception 'Snapshot order sumber tidak ditemukan.';
  end if;

  v_snapshot := v_source_event.event_data;

  loop
    v_attempt := v_attempt + 1;

    select coalesce(max(garment_index), 0) + 1
    into v_garment_index
    from public.orders
    where transaction_id = v_source_order.transaction_id;

    begin
      insert into public.orders (
        customer_id,
        order_number,
        current_state,
        customer_token,
        transaction_id,
        garment_index,
        duplicated_from_order_id
      ) values (
        v_source_order.customer_id,
        p_new_order_number,
        'order',
        p_new_customer_token,
        v_source_order.transaction_id,
        v_garment_index,
        p_source_order_id
      )
      returning * into v_new_order;

      exit;
    exception when unique_violation then
      if v_attempt >= 10 then
        raise exception 'Gagal menetapkan nomor garment setelah beberapa percobaan bersamaan. Coba lagi.';
      end if;
    end;
  end loop;

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

  select jsonb_build_object(
    'order_id', v_new_order.id,
    'order_number', v_new_order.order_number,
    'garment_index', v_garment_index,
    'transaction_id', v_transaction.id,
    'transaction_number', v_transaction.transaction_number
  ) into v_result;

  return v_result;
end;
$function$;
