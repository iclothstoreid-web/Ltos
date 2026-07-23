-- Sprint D (backend-only): Production Queue Engine, built directly on
-- Sprint B (production_capacity_calendar, get_operator_capacity) and Sprint C
-- (orders.service_level, orders.hari_d, service_sla_rules). No existing RPC
-- signature changes; get_production_packet keeps every existing key and only
-- gains three new ones (see bottom of this file).
--
-- Explicitly OUT of scope here: Auto Scheduling, Queue Optimization, Auto
-- Reordering, AI Recommendation, Machine Learning, automation, additional
-- notifications. "Belum membuat UI baru" -- no src/ changes accompany this
-- migration beyond widening the ProductionPacket TS type to match the RPC's
-- actual (additive) output, same precedent as Sprint C's service_level/hari_d.
--
-- Design note on Hold: there is no existing pause/blocked signal anywhere in
-- this schema (verified -- no such column, no such derivable state from
-- production_stage_records' pending/in_progress/completed + approved/alter).
-- Hold is therefore modeled as one new explicit, human-triggered column
-- (is_on_hold) rather than inferred from QC "alter" (which just reopens a
-- normal pending attempt, indistinguishable from any other pending stage).
-- A manual hold toggle is a standard queue-management primitive, not
-- automation/AI -- nothing here decides *when* to hold, only records that a
-- person did.
--
-- Design note on Queue Position: the brief lists Hari D + Service Level +
-- Status Produksi as position inputs, then separately gives Priority Engine
-- one complete, unambiguous tiebreak chain (service level -> Hari D ->
-- Create Order time) with no mention of status in the ordering itself. Status
-- Produksi is therefore read as the *membership* test (which orders are "in
-- the queue" at all), not a fourth sort key layered on top of Priority
-- Engine's chain: Completed and Hold orders are out of the active queue
-- (queue_position = null); Waiting/Ready/In Progress orders are ranked
-- together, purely by the Priority Engine's chain.

-- ============================================================
-- Hold: explicit, human-set flag (never inferred)
-- ============================================================

alter table public.orders
  add column if not exists is_on_hold boolean not null default false,
  add column if not exists hold_reason text,
  add column if not exists hold_updated_at timestamptz;

comment on column public.orders.is_on_hold is
  'Queue Engine: manually set via set_order_hold() only. True overrides every other queue-status signal for this order.';

create or replace function public.set_order_hold(
  p_order_id uuid,
  p_is_on_hold boolean,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  update public.orders
  set is_on_hold = p_is_on_hold,
      hold_reason = case when p_is_on_hold then p_reason else null end,
      hold_updated_at = now(),
      updated_at = now()
  where id = p_order_id;

  if not found then
    raise exception 'Order not found';
  end if;
end;
$$;

-- ============================================================
-- Queue Engine core: one row per order, classified into exactly one of
-- Waiting / Ready / In Progress / Hold / Completed, plus its Priority Engine
-- rank and its position among currently-active orders.
-- ============================================================

create or replace function public.compute_queue_snapshot()
returns table (
  order_id uuid,
  order_number text,
  service_level text,
  hari_d date,
  created_at timestamptz,
  is_on_hold boolean,
  current_stage text,
  current_stage_status text,
  queue_status text,
  priority_rank integer,
  queue_position integer
)
language sql
security definer
set search_path to 'public'
as $$
  with stage_seq (stage, ord) as (
    values
      ('material_prep', 1), ('pattern_formulation', 2), ('cutting', 3),
      ('sewing', 4), ('qc', 5), ('finishing', 6), ('packing', 7), ('shipping', 8)
  ),
  -- Latest attempt per (order, stage) -- mirrors getCurrentStageRecord's
  -- client-side logic (src/lib/production/stageConfig.ts), done set-based.
  latest_attempt as (
    select distinct on (r.order_id, r.stage) r.order_id, r.stage, r.status
    from public.production_stage_records r
    order by r.order_id, r.stage, r.attempt desc
  ),
  -- Every order x every locked stage; a stage with no row yet (order never
  -- opened in Production, or hasn't reached that stage) reads as 'pending' --
  -- consistent with get_production_packet auto-creating material_prep
  -- pending on first fetch.
  order_stage_status as (
    select o.id as order_id, ss.stage, ss.ord,
      coalesce(la.status, 'pending') as status
    from public.orders o
    cross join stage_seq ss
    left join latest_attempt la on la.order_id = o.id and la.stage = ss.stage
  ),
  -- First not-yet-completed stage, in locked order. No row here at all
  -- means every stage's latest attempt is completed -- order done.
  current_per_order as (
    select distinct on (order_id) order_id, stage as current_stage, status as current_stage_status
    from order_stage_status
    where status <> 'completed'
    order by order_id, ord
  ),
  classified as (
    select
      o.id as order_id,
      o.order_number,
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
      -- Priority Engine: Very Fast (1) > Fast (2) > Standard (3); an order
      -- that never went through the Service Engine (service_level still
      -- null) ranks last, not first.
      case o.service_level
        when 'very_fast' then 1
        when 'fast' then 2
        when 'standard' then 3
        else 4
      end as priority_rank
    from public.orders o
    left join current_per_order cpo on cpo.order_id = o.id
  )
  select
    order_id, order_number, service_level, hari_d, created_at, is_on_hold,
    current_stage, current_stage_status, queue_status, priority_rank,
    case when queue_status in ('waiting', 'ready', 'in_progress') then
      (row_number() over (
        partition by (queue_status in ('waiting', 'ready', 'in_progress'))
        -- Priority Engine's exact tiebreak chain: service level, then
        -- earliest Hari D, then earliest Create Order time.
        order by priority_rank, hari_d nulls last, created_at
      ))::integer
    else null end as queue_position
  from classified;
$$;

-- ============================================================
-- Queue Dashboard Foundation: aggregate counts only, no UI this sprint.
-- ============================================================

create or replace function public.get_queue_dashboard()
returns jsonb
language sql
security definer
set search_path to 'public'
as $$
  select jsonb_build_object(
    'total_waiting', count(*) filter (where queue_status = 'waiting'),
    'total_ready', count(*) filter (where queue_status = 'ready'),
    'total_in_progress', count(*) filter (where queue_status = 'in_progress'),
    'total_hold', count(*) filter (where queue_status = 'hold'),
    'total_completed', count(*) filter (where queue_status = 'completed')
  )
  from public.compute_queue_snapshot();
$$;

-- ============================================================
-- Production Packet: additive only. Every key that existed before this
-- migration (order_id, order_number, created_at, service_level, hari_d,
-- estimated_completion, customer_name, design, locked_measurements,
-- consultation_notes, stage_records, pattern_formulation, progress) is
-- unchanged, in the same place, computed the same way. Only queue_status,
-- priority_level, and queue_position are new.
-- ============================================================

create or replace function public.get_production_packet(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_order record;
  v_snapshot jsonb;
  v_result jsonb;
  v_sla_working_days integer;
  v_queue_status text;
  v_priority_rank integer;
  v_queue_position integer;
begin
  select id, order_number, created_at, service_level, hari_d into v_order
  from public.orders where id = p_order_id;

  if v_order.id is null then
    return null;
  end if;

  if not exists (select 1 from public.production_stage_records where order_id = p_order_id) then
    insert into public.production_stage_records (order_id, stage, attempt, status)
    values (p_order_id, 'material_prep', 1, 'pending');
  end if;

  select event_data into v_snapshot
  from public.business_events
  where order_id = p_order_id and event_type = 'order.created'
  order by created_at desc
  limit 1;

  if v_order.service_level is not null and v_order.hari_d is not null then
    select working_days into v_sla_working_days
    from public.service_sla_rules where service_level = v_order.service_level;
  end if;

  -- Queue Engine (Sprint D) -- computed after the material_prep auto-insert
  -- above so a never-before-opened order is already reflected correctly.
  select queue_status, priority_rank, queue_position
    into v_queue_status, v_priority_rank, v_queue_position
  from public.compute_queue_snapshot()
  where order_id = p_order_id;

  select jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'created_at', v_order.created_at,
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
$$;
