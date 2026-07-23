-- Sprint H (backend-only): Production Intelligence -- decision-support RPCs
-- for the Owner, built entirely on Sprint B-G's existing tables/RPCs. No
-- new table, no existing RPC contract changed, no AI/automation/auto
-- scheduling/new notifications -- every threshold below is a fixed,
-- documented number, same style as Sprint C's compute_service_validation_signals
-- (>=80% capacity, >=70% utilization, >=1.0/1.5 KPI ratio) and Sprint E's
-- get_bottleneck_dashboard (deterministic max/min picks).
--
-- Explicitly OUT of scope: Auto Scheduling, Queue Optimization, AI
-- Recommendation, Machine Learning, automation, new notifications, UI.

-- ============================================================
-- 1. SLA Risk Detection
-- ============================================================

-- Per-order classification. estimated_completion is computed with the exact
-- same formula get_production_packet() already uses (hari_d + SLA working
-- days when the Service Engine has run; created_at + 14 days fallback for
-- pre-Sprint-C orders) -- restated here rather than refactoring
-- get_production_packet's body, since its contract must not change.
-- queue_status comes straight from Sprint D's compute_queue_snapshot()
-- ("which orders are actually active" is already solved there).
--
-- risk_level thresholds (a fraction of the SLA window remaining, not a flat
-- hour count, so Very Fast's 3-day window and Standard's 14-day window are
-- judged on the same relative scale):
--   over_sla -- estimated_completion has already passed
--   risk     -- 20% or less of the total window (hari_d/created_at ->
--               estimated_completion) remains
--   on_track -- otherwise
create or replace function public.get_sla_risk_orders()
returns table (
  order_id uuid,
  order_number text,
  service_level text,
  hari_d date,
  estimated_completion timestamptz,
  queue_status text,
  risk_level text,
  risk_label text,
  hours_remaining numeric
)
language sql
security definer
set search_path to 'public'
as $$
  with base as (
    select
      q.order_id,
      q.order_number,
      q.service_level,
      q.hari_d,
      q.created_at,
      q.queue_status,
      s.working_days as sla_working_days
    from public.compute_queue_snapshot() q
    left join public.service_sla_rules s on s.service_level = q.service_level
    where q.queue_status <> 'completed'
  ),
  computed as (
    select
      order_id, order_number, service_level, hari_d, queue_status,
      case
        when hari_d is not null and sla_working_days is not null
          then (public.add_working_days(hari_d, sla_working_days))::timestamptz
        else created_at + interval '14 days'
      end as estimated_completion,
      case
        when hari_d is not null then hari_d::timestamptz
        else created_at
      end as window_start
    from base
  )
  select
    order_id,
    order_number,
    service_level,
    hari_d,
    estimated_completion,
    queue_status,
    case
      when estimated_completion <= now() then 'over_sla'
      when extract(epoch from (estimated_completion - now()))
        / nullif(extract(epoch from (estimated_completion - window_start)), 0) <= 0.2
        then 'risk'
      else 'on_track'
    end as risk_level,
    case
      when estimated_completion <= now() then '🔴 Over SLA'
      when extract(epoch from (estimated_completion - now()))
        / nullif(extract(epoch from (estimated_completion - window_start)), 0) <= 0.2
        then '🟡 Risk'
      else '🟢 On Track'
    end as risk_label,
    round((extract(epoch from (estimated_completion - now())) / 3600)::numeric, 1) as hours_remaining
  from computed
  order by estimated_completion;
$$;

-- Aggregated counts + the at-risk/over-SLA subset, for Owner Summary and any
-- future dashboard -- built on get_sla_risk_orders() so the classification
-- logic above lives in exactly one place.
create or replace function public.get_sla_risk_summary()
returns jsonb
language sql
security definer
set search_path to 'public'
as $$
  select jsonb_build_object(
    'total_on_track', count(*) filter (where risk_level = 'on_track'),
    'total_risk', count(*) filter (where risk_level = 'risk'),
    'total_over_sla', count(*) filter (where risk_level = 'over_sla'),
    'at_risk_orders', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'order_id', order_id,
          'order_number', order_number,
          'service_level', service_level,
          'hari_d', hari_d,
          'estimated_completion', estimated_completion,
          'risk_level', risk_level,
          'risk_label', risk_label,
          'hours_remaining', hours_remaining
        ) order by estimated_completion
      ) filter (where risk_level in ('risk', 'over_sla')),
      '[]'::jsonb
    )
  )
  from public.get_sla_risk_orders();
$$;

-- ============================================================
-- 2. Capacity Warning
-- ============================================================

-- Three signals, all read-only over data Sprint B/C already produce:
--  - operator_overload: operators from get_operator_capacity() (Sprint B)
--    whose utilization_pct is already over 100%.
--  - capacity_over_100 / capacity_utilization_pct: get_capacity_dashboard()
--    (Sprint E) as-is.
--  - full_capacity_days: upcoming production_capacity_calendar (Sprint B)
--    dates whose committed order count has reached max_orders -- the one
--    genuinely new read here (no existing RPC scans multiple calendar days
--    at once; get_hari_d_dashboard only ever checks a single date).
create or replace function public.get_capacity_warning()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_capacity_dashboard jsonb;
  v_operator_overload jsonb;
  v_full_days jsonb;
begin
  v_capacity_dashboard := public.get_capacity_dashboard();

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'operator_id', operator_id,
        'nama', nama,
        'active_jobs', active_jobs,
        'max_concurrent_capacity', max_concurrent_capacity,
        'utilization_pct', utilization_pct
      ) order by utilization_pct desc
    ),
    '[]'::jsonb
  )
  into v_operator_overload
  from public.get_operator_capacity()
  where utilization_pct > 100;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'calendar_date', pcc.calendar_date,
        'max_orders', pcc.max_orders,
        'committed', committed.cnt
      ) order by pcc.calendar_date
    ),
    '[]'::jsonb
  )
  into v_full_days
  from public.production_capacity_calendar pcc
  join lateral (
    select count(*) as cnt from public.orders o where o.hari_d = pcc.calendar_date
  ) committed on true
  where pcc.calendar_date >= current_date
    and committed.cnt >= pcc.max_orders;

  return jsonb_build_object(
    'capacity_over_100', coalesce((v_capacity_dashboard ->> 'capacity_utilization_pct')::numeric, 0) > 100,
    'capacity_utilization_pct', v_capacity_dashboard -> 'capacity_utilization_pct',
    'operator_overload', v_operator_overload,
    'full_capacity_days', v_full_days
  );
end;
$$;

-- ============================================================
-- 3. Bottleneck Analysis
-- ============================================================
-- "Stage paling lambat / Stage paling banyak backlog / Operator paling
-- sibuk / Operator paling idle" is exactly Sprint E's get_bottleneck_dashboard()
-- -- reused verbatim in get_owner_summary() below, no new function.

-- ============================================================
-- 4. Service Availability
-- ============================================================

-- Whether Standard/Fast/Very Fast can still be sold, using the exact same
-- Hari D + Capacity + KPI signals Sprint C's compute_service_validation_signals
-- already computes for the Consultation Review preview -- called once per
-- service level here instead of duplicating that logic.
create or replace function public.get_service_availability()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_result jsonb := '{}'::jsonb;
  v_level text;
  v_signals jsonb;
begin
  foreach v_level in array array['standard', 'fast', 'very_fast']
  loop
    v_signals := public.compute_service_validation_signals(v_level);
    v_result := v_result || jsonb_build_object(
      v_level,
      v_signals || jsonb_build_object('available', (v_signals ->> 'overall_status') <> 'red')
    );
  end loop;

  return v_result;
end;
$$;

-- ============================================================
-- 5. Owner Summary
-- ============================================================
-- Single read composing all four sections above -- every field comes from
-- an existing or Sprint-H function above, nothing recomputed here.
create or replace function public.get_owner_summary()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  return jsonb_build_object(
    'sla_risk', public.get_sla_risk_summary(),
    'capacity_warning', public.get_capacity_warning(),
    'bottleneck', public.get_bottleneck_dashboard(),
    'service_availability', public.get_service_availability()
  );
end;
$$;
