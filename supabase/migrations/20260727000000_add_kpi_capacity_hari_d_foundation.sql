-- Sprint B (backend-only): data foundation for Production KPI, Capacity,
-- Operator Performance, and Hari D (daily production capacity calendar).
--
-- Explicitly OUT of scope here (per the locked Sprint B brief): Service
-- Engine, SLA Engine, Standard/Fast/Very Fast logic, a new Estimated
-- Completion engine, Queue Optimization, AI Prediction. Nothing below
-- assigns orders to dates, computes due dates, or classifies service
-- level -- it only exposes read models over data that already exists
-- (production_stage_records, production_operators) plus one new
-- owner-configurable calendar table for future engines to consume.
--
-- All four RPC groups follow the existing codebase convention of default
-- PUBLIC EXECUTE grants (see get_production_packet / assign_stage_operator)
-- -- access control for owner-facing screens happens at the app routing
-- layer, not at the RPC grant level, in this codebase.

-- ============================================================
-- Capacity Foundation: owner-settable max concurrent jobs per operator
-- ============================================================

alter table public.production_operators
  add column if not exists max_concurrent_capacity integer not null default 3;

comment on column public.production_operators.max_concurrent_capacity is
  'Owner-settable ceiling on how many stage records this operator can have assigned/in-progress at once. Used by get_operator_capacity() to compute utilization.';

-- Current load vs. max capacity per active operator. "Active job" = a stage
-- record this operator is assigned to or has started, not yet completed.
create or replace function public.get_operator_capacity()
returns table (
  operator_id uuid,
  nama text,
  max_concurrent_capacity integer,
  active_jobs bigint,
  utilization_pct numeric
)
language sql
security definer
set search_path to 'public'
as $$
  select
    po.id,
    po.nama,
    po.max_concurrent_capacity,
    count(r.id) filter (
      where r.status in ('pending', 'in_progress')
        and (r.assigned_operator_id = po.id or r.operator_id = po.id)
    ) as active_jobs,
    round(
      count(r.id) filter (
        where r.status in ('pending', 'in_progress')
          and (r.assigned_operator_id = po.id or r.operator_id = po.id)
      )::numeric
      / nullif(po.max_concurrent_capacity, 0) * 100,
      1
    ) as utilization_pct
  from public.production_operators po
  left join public.production_stage_records r
    on r.assigned_operator_id = po.id or r.operator_id = po.id
  where po.is_active = true
  group by po.id, po.nama, po.max_concurrent_capacity
  order by po.nama;
$$;

-- Owner sets an operator's max concurrent capacity. Mirrors the
-- admin/owner-only write policies used elsewhere (e.g. material_cost_templates)
-- as an app-level convention -- enforced here defensively even though this
-- codebase does not currently gate RPC execution by role at the grant level.
create or replace function public.set_operator_capacity(
  p_operator_id uuid,
  p_max_concurrent_capacity integer
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if p_max_concurrent_capacity < 0 then
    raise exception 'max_concurrent_capacity must be >= 0';
  end if;

  update public.production_operators
  set max_concurrent_capacity = p_max_concurrent_capacity,
      updated_at = now()
  where id = p_operator_id;

  if not found then
    raise exception 'Operator not found';
  end if;
end;
$$;

-- ============================================================
-- Operator Performance Foundation
-- ============================================================

-- Historical throughput/quality per operator, derived purely from
-- production_stage_records.operator_id (the "actually did the work" column,
-- distinct from assigned_operator_id). alter_rate is a quality proxy: share
-- of decided stage records this operator's work was sent back on.
create or replace function public.get_operator_performance()
returns table (
  operator_id uuid,
  nama text,
  completed_jobs bigint,
  avg_duration_minutes numeric,
  alter_count bigint,
  approved_count bigint,
  alter_rate_pct numeric
)
language sql
security definer
set search_path to 'public'
as $$
  select
    po.id,
    po.nama,
    count(r.id) filter (where r.status = 'completed') as completed_jobs,
    round(
      avg(
        extract(epoch from (r.completed_at - r.started_at)) / 60
      ) filter (
        where r.status = 'completed' and r.started_at is not null and r.completed_at is not null
      )::numeric,
      1
    ) as avg_duration_minutes,
    count(r.id) filter (where r.decision = 'alter') as alter_count,
    count(r.id) filter (where r.decision = 'approved') as approved_count,
    round(
      count(r.id) filter (where r.decision = 'alter')::numeric
      / nullif(count(r.id) filter (where r.decision is not null), 0) * 100,
      1
    ) as alter_rate_pct
  from public.production_operators po
  left join public.production_stage_records r on r.operator_id = po.id
  group by po.id, po.nama
  order by po.nama;
$$;

-- ============================================================
-- KPI Foundation: production-wide aggregates over existing stage records
-- ============================================================

-- "Current stage" of an order here means its single most-recently-touched
-- pending/in_progress stage record. This is a read-model approximation for
-- reporting, not the authoritative next-action logic -- that remains
-- getCurrentStageRecord() in stageConfig.ts on the client.
create or replace function public.get_production_kpis()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'active_orders', (
      select count(distinct order_id)
      from public.production_stage_records
      where order_id not in (
        select order_id from public.production_stage_records
        where stage = 'shipping' and status = 'completed'
      )
    ),
    'completed_orders_7d', (
      select count(*)
      from public.production_stage_records
      where stage = 'shipping' and status = 'completed'
        and completed_at >= now() - interval '7 days'
    ),
    'completed_orders_30d', (
      select count(*)
      from public.production_stage_records
      where stage = 'shipping' and status = 'completed'
        and completed_at >= now() - interval '30 days'
    ),
    'stage_backlog', (
      select coalesce(jsonb_object_agg(stage, cnt), '{}'::jsonb)
      from (
        select stage, count(*) as cnt
        from (
          select distinct on (order_id) order_id, stage, status
          from public.production_stage_records
          where status in ('pending', 'in_progress')
          order by order_id, created_at desc
        ) current_per_order
        group by stage
      ) backlog
    ),
    'avg_stage_duration_hours', (
      select coalesce(jsonb_object_agg(stage, avg_hours), '{}'::jsonb)
      from (
        select stage,
          round(avg(extract(epoch from (completed_at - started_at)) / 3600)::numeric, 1) as avg_hours
        from public.production_stage_records
        where status = 'completed' and started_at is not null and completed_at is not null
        group by stage
      ) durations
    ),
    'avg_order_cycle_time_days', (
      select round(avg(extract(epoch from (last_completed - first_started)) / 86400)::numeric, 1)
      from (
        select order_id,
          min(started_at) as first_started,
          max(completed_at) filter (where stage = 'shipping' and status = 'completed') as last_completed
        from public.production_stage_records
        group by order_id
      ) cycle
      where last_completed is not null
    )
  ) into v_result;

  return v_result;
end;
$$;

-- ============================================================
-- Hari D Foundation: owner-configurable daily production capacity calendar
-- ============================================================

-- Pure capacity data -- no order is linked to a date here. Assigning orders
-- to a Hari D slot and computing remaining capacity is future Service/SLA
-- Engine work, not this migration.
create table if not exists public.production_capacity_calendar (
  id uuid primary key default gen_random_uuid(),
  calendar_date date not null unique,
  max_orders integer not null default 5,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.production_capacity_calendar is
  'Hari D foundation: owner-settable max new-order capacity per calendar date. Not yet consumed by any allocation/SLA logic.';

alter table public.production_capacity_calendar enable row level security;

create policy "All staff can read capacity calendar"
  on public.production_capacity_calendar
  for select
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()));

create or replace function public.get_capacity_calendar(p_start date, p_end date)
returns setof public.production_capacity_calendar
language sql
security definer
set search_path to 'public'
as $$
  select * from public.production_capacity_calendar
  where calendar_date between p_start and p_end
  order by calendar_date;
$$;

create or replace function public.set_capacity_calendar_day(
  p_date date,
  p_max_orders integer,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if p_max_orders < 0 then
    raise exception 'max_orders must be >= 0';
  end if;

  insert into public.production_capacity_calendar (calendar_date, max_orders, notes)
  values (p_date, p_max_orders, p_notes)
  on conflict (calendar_date) do update
    set max_orders = excluded.max_orders,
        notes = excluded.notes,
        updated_at = now();
end;
$$;
