-- Sprint PS-01.1: Race Condition Audit & Atomic Update
--
-- Scope: close every "read -> validate -> update" / "check-then-act" window
-- found in the production status-transition and delivery-confirmation RPCs,
-- by converting each into a single conditional UPDATE (or INSERT ... ON
-- CONFLICT) that only ever lets one concurrent request win. No transactions,
-- no optimistic-locking version columns, no new business rules -- every
-- function below keeps its existing inputs/outputs/error contract, only the
-- concurrency-unsafe internals change. Two flows audited and found to need
-- NO change are documented at the bottom instead of touched.
--
-- start_stage / complete_stage were never previously captured in a
-- migration (see 20260801000000_add_stage_waiting_time.sql's note) -- this
-- is their first tracked definition, pulled verbatim from the live database
-- before editing, then patched.

-- ============================================================
-- 1. Unique constraint backing every ON CONFLICT below.
--    Verified zero existing duplicate (order_id, stage, attempt) rows
--    before adding this -- see audit notes in PS-01.1 report.
-- ============================================================

alter table public.production_stage_records
  add constraint production_stage_records_order_stage_attempt_key
  unique (order_id, stage, attempt);

-- ============================================================
-- 2. start_stage -- "Claim Order Production" / "Start Production" / "QC Start"
--
-- Race found: the existing-row branch did `select ... limit 1` then an
-- unconditional `update ... where id = v_id`, so two concurrent claims
-- (e.g. two kiosks scanning the same order+stage QR at once) both read the
-- same pending row and both updates succeed -- the second silently
-- overwrites the first operator's claim with no error to either caller.
-- The no-existing-row branch had the mirror bug: two concurrent first
-- touches of a stage both pass `if v_id is null` and both insert an
-- attempt=1 row, which the new unique constraint would now reject on one
-- of them, but with a raw duplicate-key error instead of a clean message.
--
-- Fix: both branches replaced with a single conditional write. The insert
-- path uses ON CONFLICT on the new unique key to fall through to the same
-- guarded update; the update path only succeeds when the row is still
-- 'pending' or already belongs to the same operator (idempotent retry, e.g.
-- a kiosk re-scanning after a network timeout keeps working). Whoever loses
-- the race gets a clear exception instead of a silently discarded claim.
-- ============================================================

create or replace function public.start_stage(p_order_id uuid, p_stage text, p_operator_id uuid, p_division text)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_id uuid;
  v_claimed_id uuid;
begin
  select id into v_id
  from public.production_stage_records
  where order_id = p_order_id and stage = p_stage
  order by attempt desc
  limit 1;

  if v_id is null then
    insert into public.production_stage_records (order_id, stage, attempt, status, operator_id, division, started_at)
    values (p_order_id, p_stage, 1, 'in_progress', p_operator_id, p_division, now())
    on conflict (order_id, stage, attempt) do update
      set status = 'in_progress',
          operator_id = excluded.operator_id,
          division = excluded.division,
          started_at = now(),
          updated_at = now()
      where public.production_stage_records.status = 'pending'
         or public.production_stage_records.operator_id = excluded.operator_id
    returning id into v_claimed_id;
  else
    update public.production_stage_records
    set status = 'in_progress',
        operator_id = p_operator_id,
        division = p_division,
        started_at = now(),
        updated_at = now()
    where id = v_id
      and (status = 'pending' or operator_id = p_operator_id)
    returning id into v_claimed_id;
  end if;

  if v_claimed_id is null then
    raise exception 'Tahap ini sudah diklaim/dimulai oleh operator lain.';
  end if;

  return v_claimed_id;
end;
$function$;

-- ============================================================
-- 3. complete_stage -- "Finish Production" / "QC Finish"
--
-- Race found: the closing `update ... where id = p_stage_record_id` had no
-- status guard, so two concurrent completions of the same stage record
-- (double-tap on "Selesai", or a retried request after a timed-out
-- response whose first attempt actually succeeded) both pass every
-- validation and both reach the "insert next stage if not exists" /
-- "insert next alter attempt" logic below -- itself a second
-- check-then-act race that could produce duplicate next-stage rows.
--
-- Fix: the closing UPDATE now carries `and status <> 'completed'` and the
-- function raises if zero rows were affected. Since a stage record can
-- only ever complete once, everything downstream of it (the alter-attempt
-- insert, the next-stage insert) now only ever runs once per record. The
-- two `insert ... if not exists` sites are additionally hardened to
-- `insert ... on conflict do nothing`, backed by the new unique constraint,
-- so they're safe even in the unrelated edge case of two different stage
-- records for the same order racing to seed the same next stage.
-- ============================================================

create or replace function public.complete_stage(
  p_order_id uuid,
  p_stage_record_id uuid,
  p_checklist jsonb,
  p_evidence_url text,
  p_notes text,
  p_decision text default null::text,
  p_alter_category text default null::text,
  p_completed_at timestamp with time zone default null::timestamp with time zone
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_stage text;
  v_stage_order text[] := array['material_prep','pattern_formulation','cutting','sewing','qc','finishing','packing','shipping'];
  v_idx int;
  v_next_stage text;
  v_next_attempt int;
  v_current_attempt int;
  v_rules public.production_rules;
  v_return_stage text;
  v_updated_id uuid;
begin
  select stage, attempt into v_stage, v_current_attempt
  from public.production_stage_records
  where id = p_stage_record_id and order_id = p_order_id;

  if v_stage is null then
    raise exception 'Stage record not found for this order';
  end if;

  select * into v_rules from public.production_rules where id = true;

  if coalesce(v_rules.qr_required, true) and p_completed_at is null then
    raise exception 'Scan QR Penyelesaian wajib dilakukan sebelum menyelesaikan tahap ini (Production Rules).';
  end if;

  if v_stage = 'qc' and coalesce(p_decision, '') <> 'alter' and coalesce(v_rules.qc_checklist_required, true) then
    if p_checklist is null
       or (select count(*) from jsonb_each(p_checklist)) = 0
       or exists (select 1 from jsonb_each(p_checklist) where value = 'false'::jsonb)
    then
      raise exception 'Checklist QC wajib diselesaikan semua sebelum menyatakan Lulus QC (Production Rules).';
    end if;
  end if;

  if v_stage = 'shipping' and coalesce(v_rules.delivery_confirmation_required, true) then
    if not exists (
      select 1 from public.production_stage_records
      where id = p_stage_record_id
        and courier is not null and trim(courier) <> ''
        and tracking_number is not null and trim(tracking_number) <> ''
    ) then
      raise exception 'Data Pengiriman (Kurir & Nomor Resi) wajib diisi sebelum menyelesaikan tahap ini (Production Rules).';
    end if;
  end if;

  update public.production_stage_records
  set status = 'completed',
      completed_at = coalesce(p_completed_at, now()),
      checklist = p_checklist,
      evidence_url = p_evidence_url,
      notes = p_notes,
      decision = p_decision,
      alter_category = p_alter_category,
      updated_at = now()
  where id = p_stage_record_id
    and status <> 'completed'
  returning id into v_updated_id;

  if v_updated_id is null then
    raise exception 'Tahap ini sudah diselesaikan (kemungkinan oleh proses lain yang berjalan bersamaan).';
  end if;

  if p_decision = 'alter' and v_stage = 'qc' then
    v_return_stage := coalesce(v_rules.alter_return_stage, 'sewing');

    select coalesce(max(attempt), 0) + 1 into v_next_attempt
    from public.production_stage_records
    where order_id = p_order_id and stage = v_return_stage;

    if v_next_attempt > coalesce(v_rules.max_alter_attempts, 99) then
      raise exception 'Batas Maksimum Alter (%) untuk tahap % sudah tercapai (Production Rules).', v_rules.max_alter_attempts, v_return_stage;
    end if;

    insert into public.production_stage_records (order_id, stage, attempt, status)
    values (p_order_id, v_return_stage, v_next_attempt, 'pending')
    on conflict (order_id, stage, attempt) do nothing;
  elsif p_decision = 'alter' then
    if v_current_attempt + 1 > coalesce(v_rules.max_alter_attempts, 99) then
      raise exception 'Batas Maksimum Alter (%) untuk tahap % sudah tercapai (Production Rules).', v_rules.max_alter_attempts, v_stage;
    end if;

    insert into public.production_stage_records (order_id, stage, attempt, status)
    values (p_order_id, v_stage, v_current_attempt + 1, 'pending')
    on conflict (order_id, stage, attempt) do nothing;
  else
    select i into v_idx from unnest(v_stage_order) with ordinality as t(s, i) where t.s = v_stage;
    if v_idx is not null and v_idx < array_length(v_stage_order, 1) then
      v_next_stage := v_stage_order[v_idx + 1];
      insert into public.production_stage_records (order_id, stage, attempt, status)
      values (p_order_id, v_next_stage, 1, 'pending')
      on conflict (order_id, stage, attempt) do nothing;
    end if;

    if v_stage = 'shipping' and coalesce(v_rules.auto_close_after_delivered, false) then
      update public.orders
      set current_state = 'follow_up'
      where id = p_order_id and current_state <> 'follow_up';

      if found then
        insert into public.business_events (order_id, event_type, event_data)
        values (p_order_id, 'order.delivered', jsonb_build_object('marked_at', now(), 'source', 'auto_close_after_delivered'));
      end if;
    end if;
  end if;
end;
$function$;

-- ============================================================
-- 4. emergency_override_stage -- same write pattern as complete_stage
--    (not one of the 9 listed flows, but it mutates the same
--    production_stage_records row via the same
--    check-status-then-update-then-insert-next-stage shape, so it is
--    fixed for consistency rather than left as the one inconsistent
--    writer). Guarded the same way: conditional close, ON CONFLICT seed.
-- ============================================================

create or replace function public.emergency_override_stage(p_order_id uuid, p_stage_record_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_stage text;
  v_status text;
  v_stage_order text[] := array['material_prep','pattern_formulation','cutting','sewing','qc','finishing','packing','shipping'];
  v_idx int;
  v_next_stage text;
  v_auto_close boolean;
  v_updated_id uuid;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat melakukan Emergency Override.';
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'Alasan Emergency Override wajib diisi.';
  end if;

  select stage, status into v_stage, v_status
  from public.production_stage_records
  where id = p_stage_record_id and order_id = p_order_id;

  if v_stage is null then
    raise exception 'Stage record not found for this order';
  end if;

  if v_status = 'completed' then
    raise exception 'Tahap ini sudah selesai.';
  end if;

  update public.production_stage_records
  set status = 'completed',
      completed_at = now(),
      decision = 'skipped',
      notes = 'Emergency Override oleh Owner: ' || p_reason,
      updated_at = now()
  where id = p_stage_record_id
    and status <> 'completed'
  returning id into v_updated_id;

  if v_updated_id is null then
    raise exception 'Tahap ini sudah diselesaikan (kemungkinan oleh proses lain yang berjalan bersamaan).';
  end if;

  select i into v_idx from unnest(v_stage_order) with ordinality as t(s, i) where t.s = v_stage;
  if v_idx is not null and v_idx < array_length(v_stage_order, 1) then
    v_next_stage := v_stage_order[v_idx + 1];
    insert into public.production_stage_records (order_id, stage, attempt, status)
    values (p_order_id, v_next_stage, 1, 'pending')
    on conflict (order_id, stage, attempt) do nothing;
  end if;

  if v_stage = 'shipping' then
    select auto_close_after_delivered into v_auto_close
    from public.production_rules where id = true;

    if coalesce(v_auto_close, false) then
      update public.orders
      set current_state = 'follow_up'
      where id = p_order_id and current_state <> 'follow_up';

      if found then
        insert into public.business_events (order_id, event_type, event_data)
        values (p_order_id, 'order.delivered', jsonb_build_object('marked_at', now(), 'source', 'auto_close_after_delivered'));
      end if;
    end if;
  end if;

  insert into public.production_stage_override_audit_log (
    order_id, stage_record_id, stage, reason, overridden_by
  )
  values (p_order_id, p_stage_record_id, v_stage, p_reason, auth.uid());
end;
$function$;

-- ============================================================
-- 5. assign_stage_operator -- "Assign Operator"
--
-- Race found: `update ... where id = p_stage_record_id and order_id =
-- p_order_id` had no guard on the current assignment state, so two owners
-- assigning different operators to the same still-unassigned stage at the
-- same time both succeed -- the second silently overwrites the first,
-- with both getting a success response and both operators separately
-- notified, even though only one assignment is real.
--
-- Fix: guarded to `assigned_operator_id is null`, matching the pattern
-- named in the sprint brief. This makes the first assignment win and the
-- second caller get a clear exception. Scope note: this intentionally
-- means changing an existing assignment now requires clearing it first
-- (no such "unassign" path exists in the app today, so this does not
-- remove any capability currently in use) -- flagged in the PS-01.1 report
-- in case reassignment turns out to be a real workflow need.
-- ============================================================

create or replace function public.assign_stage_operator(p_order_id uuid, p_stage_record_id uuid, p_operator_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_operator_name text;
  v_stage text;
  v_order_number text;
  v_notify boolean;
  v_updated_id uuid;
begin
  select nama into v_operator_name
  from public.production_operators
  where id = p_operator_id;

  if v_operator_name is null then
    raise exception 'Operator not found';
  end if;

  update public.production_stage_records
  set assigned_operator_id = p_operator_id,
      assigned_operator_name = v_operator_name,
      assigned_at = now(),
      updated_at = now()
  where id = p_stage_record_id and order_id = p_order_id
    and assigned_operator_id is null
  returning id, stage into v_updated_id, v_stage;

  if v_updated_id is null then
    if not exists (select 1 from public.production_stage_records where id = p_stage_record_id and order_id = p_order_id) then
      raise exception 'Stage record not found for this order';
    end if;
    raise exception 'Tahap ini sudah ditugaskan ke operator lain.';
  end if;

  select assignment_notification_enabled into v_notify
  from public.notification_rules where id = true;

  if coalesce(v_notify, true) then
    select order_number into v_order_number from public.orders where id = p_order_id;

    insert into public.notifications (order_id, stage_record_id, operator_id, title, body)
    values (
      p_order_id,
      p_stage_record_id,
      p_operator_id,
      'Pekerjaan Baru Ditugaskan',
      format('%s — Tahap: %s', coalesce(v_order_number, ''), v_stage)
    );
  end if;
end;
$function$;

-- ============================================================
-- 6. mark_order_delivered -- "Delivery Confirmation"
--
-- Race found: `select * into v_order ... if v_order.current_state <>
-- 'follow_up' then update ... insert business_events`. Two concurrent
-- calls (e.g. double-tap on "Tandai Delivered") both read the pre-update
-- state, both pass the check, and both insert an 'order.delivered'
-- business_events row -- a duplicate audit-trail entry every time. This is
-- exactly the check-then-act pattern already fixed for the same
-- auto-close side effect inside complete_stage/emergency_override_stage
-- (`update ... where current_state <> 'follow_up'` + `if found`) --
-- mark_order_delivered was the one inconsistent writer of this same
-- state. Brought in line with that existing pattern.
-- ============================================================

create or replace function public.mark_order_delivered(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shipped boolean;
  v_order_exists boolean;
begin
  select exists (
    select 1 from public.production_stage_records
    where order_id = p_order_id and stage = 'shipping' and status = 'completed'
  ) into v_shipped;

  if not v_shipped then
    raise exception 'Tahap Pengiriman belum selesai — tidak dapat menandai Delivered.';
  end if;

  select exists (select 1 from public.orders where id = p_order_id) into v_order_exists;
  if not v_order_exists then
    raise exception 'Order tidak ditemukan.';
  end if;

  update public.orders
  set current_state = 'follow_up'
  where id = p_order_id and current_state <> 'follow_up';

  if found then
    insert into public.business_events (order_id, event_type, event_data, created_by)
    values (p_order_id, 'order.delivered', jsonb_build_object('marked_at', now()), auth.uid());
  end if;

  return jsonb_build_object('order_id', p_order_id, 'current_state', 'follow_up');
end;
$function$;

-- ============================================================
-- 7. get_production_packet -- lazy "seed first stage record" insert
--
-- Race found: `if not exists (select 1 from production_stage_records
-- where order_id = p_order_id) then insert ... material_prep attempt 1`.
-- Two concurrent first-ever packet fetches for the same order (e.g. two
-- kiosk tabs opened at once) both pass the not-exists check and both try
-- to insert -- previously silently created two attempt=1 rows (no unique
-- constraint existed); now backed by the constraint added in step 1, this
-- is converted to a plain idempotent ON CONFLICT DO NOTHING so the second
-- caller no longer hits a raw duplicate-key error.
-- ============================================================

create or replace function public.get_production_packet(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_order record;
  v_snapshot jsonb;
  v_result jsonb;
  v_sla_working_days integer;
  v_queue_status text;
  v_priority_rank integer;
  v_queue_position integer;
begin
  select id, order_number, created_at, service_level, hari_d, current_state into v_order
  from public.orders where id = p_order_id;

  if v_order.id is null then
    return null;
  end if;

  insert into public.production_stage_records (order_id, stage, attempt, status)
  values (p_order_id, 'material_prep', 1, 'pending')
  on conflict (order_id, stage, attempt) do nothing;

  select event_data into v_snapshot
  from public.business_events
  where order_id = p_order_id and event_type = 'order.created'
  order by created_at desc
  limit 1;

  if v_order.service_level is not null and v_order.hari_d is not null then
    select working_days into v_sla_working_days
    from public.service_sla_rules where service_level = v_order.service_level;
  end if;

  select queue_status, priority_rank, queue_position
    into v_queue_status, v_priority_rank, v_queue_position
  from public.compute_queue_snapshot()
  where order_id = p_order_id;

  select jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'created_at', v_order.created_at,
    'current_state', v_order.current_state,
    'service_level', v_order.service_level,
    'hari_d', v_order.hari_d,
    'estimated_completion', case
      when v_order.hari_d is not null and v_sla_working_days is not null
        then (public.add_working_days(v_order.hari_d, v_sla_working_days))::timestamptz
      else v_order.created_at + interval '14 days'
    end,
    'queue_status', v_queue_status,
    'priority_level', v_priority_rank,
    'queue_position', v_queue_position,
    'customer_name', v_snapshot -> 'customer' ->> 'name',
    'design', v_snapshot -> 'design',
    'locked_measurements', v_snapshot -> 'measurement',
    'consultation_notes', v_snapshot ->> 'consultationNotes',
    'fabric_quantity_meters', nullif(v_snapshot ->> 'fabricQuantityMeters', '')::numeric,
    'stage_records', coalesce((
      select jsonb_agg(
        (row_to_json(r)::jsonb) || jsonb_build_object('operator_name', po.nama)
        order by r.created_at
      )
      from public.production_stage_records r
      left join public.production_operators po on po.id = r.operator_id
      where r.order_id = p_order_id
    ), '[]'::jsonb),
    'pattern_formulation', (
      select row_to_json(pf) from public.pattern_formulations pf where pf.order_id = p_order_id
    ),
    'material_preparation', coalesce((
      select jsonb_agg(row_to_json(mpi)::jsonb order by mpi.created_at)
      from public.material_preparation_items mpi
      where mpi.order_id = p_order_id
    ), '[]'::jsonb),
    'progress', (
      select round(
        (count(*) filter (where status = 'completed'))::numeric
        / 8.0, 2
      )
      from (
        select distinct on (stage) stage, status
        from public.production_stage_records
        where order_id = p_order_id
        order by stage, attempt desc
      ) latest
    )
  ) into v_result;

  return v_result;
end;
$function$;

-- ============================================================
-- Audited, no change needed:
--
-- - "Assign Queue": there is no write path. public.compute_queue_snapshot()
--   (and get_production_packet's use of it) is a pure read-only SQL query
--   derived live from production_stage_records/orders on every call -- no
--   stored "claim"/"assignment" state exists to race on.
--
-- - "Payment Confirmation" (record_order_payment): every payment is an
--   independent INSERT (audit-trail row), not a shared mutable resource
--   being read-then-conditionally-written, so the SELECT-then-UPDATE
--   pattern this sprint targets does not apply here. The one
--   check-then-act spot (`if v_quotation.status = 'draft' then update
--   quotations set status = 'approved'`) sets the same idempotent value on
--   every path, so a race there cannot corrupt state. A double-submit
--   creating two payment rows is a client-side idempotency-key concern,
--   not a database race -- out of this sprint's atomic-update scope, noted
--   for a future sprint if it needs handling.
-- ============================================================
