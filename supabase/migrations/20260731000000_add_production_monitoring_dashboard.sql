-- Sprint E (backend-only): Production Monitoring Dashboard data sources for
-- Owner OS. Built entirely on top of Sprint B (get_operator_capacity,
-- get_production_kpis, production_capacity_calendar), Sprint C
-- (orders.service_level/hari_d, resolve_hari_d), and Sprint D
-- (compute_queue_snapshot, get_queue_dashboard). No new page, no chart, no
-- visualization -- just RPCs. No existing RPC's signature or established
-- keys are removed/renamed; get_queue_dashboard gains two new keys the same
-- additive way Sprint D extended get_production_packet.
--
-- Explicitly OUT of scope: Auto Scheduling, Queue Optimization, AI
-- Recommendation, Machine Learning, automation, additional notifications.
--
-- Limitation, stated plainly rather than papered over: this schema has no
-- status-transition/event log for orders (queue_status is a derived,
-- point-in-time read, not a recorded history), so "Average Waiting Time" and
-- "Average Queue Time" cannot be true historical averages. Both are defined
-- below from the timestamps that do exist (created_at, hari_d) -- see the
-- comments on get_queue_dashboard for the exact definitions chosen.

-- ============================================================
-- 1. KPI Dashboard
-- ============================================================
create or replace function public.get_kpi_dashboard()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_kpis jsonb;
  v_total_aktif integer;
  v_total_selesai integer;
  v_throughput_today integer;
  v_throughput_week integer;
begin
  v_kpis := public.get_production_kpis();

  -- Aktif/Selesai per the Queue Engine's own classification (covers every
  -- order, including ones with no production_stage_records yet), not
  -- get_production_kpis' narrower active_orders (which only sees orders that
  -- already have stage records).
  select
    count(*) filter (where queue_status <> 'completed'),
    count(*) filter (where queue_status = 'completed')
  into v_total_aktif, v_total_selesai
  from public.compute_queue_snapshot();

  select count(*) into v_throughput_today
  from public.production_stage_records
  where stage = 'shipping' and status = 'completed'
    and completed_at::date = current_date;

  -- Calendar week (Senin-Minggu), not a rolling 7 days -- distinct from
  -- get_production_kpis' completed_orders_7d, which is rolling.
  select count(*) into v_throughput_week
  from public.production_stage_records
  where stage = 'shipping' and status = 'completed'
    and completed_at >= date_trunc('week', current_date);

  return jsonb_build_object(
    'total_order_aktif', v_total_aktif,
    'total_order_selesai', v_total_selesai,
    'throughput_hari_ini', v_throughput_today,
    'throughput_minggu_ini', v_throughput_week,
    'average_production_time_days', v_kpis -> 'avg_order_cycle_time_days',
    'average_stage_duration_hours', v_kpis -> 'avg_stage_duration_hours'
  );
end;
$$;

-- ============================================================
-- 2. Capacity Dashboard
-- ============================================================
create or replace function public.get_capacity_dashboard()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_total_operators integer;
  v_total_capacity numeric;
  v_capacity_used numeric;
begin
  select count(*), coalesce(sum(max_concurrent_capacity), 0), coalesce(sum(active_jobs), 0)
    into v_total_operators, v_total_capacity, v_capacity_used
  from public.get_operator_capacity();

  return jsonb_build_object(
    'total_operator_aktif', v_total_operators,
    'total_capacity', v_total_capacity,
    'capacity_used', v_capacity_used,
    'remaining_capacity', v_total_capacity - v_capacity_used,
    'capacity_utilization_pct', case when v_total_capacity = 0 then null
      else round(v_capacity_used / v_total_capacity * 100, 1)
    end
  );
end;
$$;

-- ============================================================
-- 3. Queue Dashboard: additive extension of Sprint D's get_queue_dashboard.
-- The 5 original keys (total_waiting/ready/in_progress/hold/completed) are
-- unchanged in name and computation. Two new keys:
--
-- average_waiting_time_hours -- among orders CURRENTLY in 'waiting', the
-- average scheduled gap between order creation and their locked Hari D
-- (hari_d - created_at). This is a forward-looking "how long do orders
-- typically wait before production starts" metric, not elapsed time.
--
-- average_queue_time_hours -- among all not-yet-completed orders (waiting,
-- ready, in_progress, hold), the average elapsed time since creation
-- (now() - created_at). This is a real-time "how long has this order been
-- sitting in the system so far" metric.
--
-- Neither is a true historical average (no status-transition log exists in
-- this schema to measure actual time spent per status) -- both are the best
-- available approximation from created_at/hari_d alone.
-- ============================================================
create or replace function public.get_queue_dashboard()
returns jsonb
language sql
security definer
set search_path to 'public'
as $$
  with q as (
    select * from public.compute_queue_snapshot()
  )
  select jsonb_build_object(
    'total_waiting', count(*) filter (where queue_status = 'waiting'),
    'total_ready', count(*) filter (where queue_status = 'ready'),
    'total_in_progress', count(*) filter (where queue_status = 'in_progress'),
    'total_hold', count(*) filter (where queue_status = 'hold'),
    'total_completed', count(*) filter (where queue_status = 'completed'),
    'average_waiting_time_hours', (
      select round(avg(extract(epoch from (hari_d::timestamptz - created_at)) / 3600)::numeric, 1)
      from q where queue_status = 'waiting' and hari_d is not null
    ),
    'average_queue_time_hours', (
      select round(avg(extract(epoch from (now() - created_at)) / 3600)::numeric, 1)
      from q where queue_status <> 'completed'
    )
  )
  from q;
$$;

-- ============================================================
-- 4. Hari D Dashboard: capacity snapshot for one calendar date (default
-- today), reusing Sprint B's production_capacity_calendar directly -- same
-- "unconfigured date = open/unlimited" semantics as resolve_hari_d.
-- ============================================================
create or replace function public.get_hari_d_dashboard(p_date date default current_date)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_max_orders integer;
  v_committed integer;
begin
  select max_orders into v_max_orders
  from public.production_capacity_calendar
  where calendar_date = p_date;

  select count(*) into v_committed
  from public.orders where hari_d = p_date;

  return jsonb_build_object(
    'hari_d_saat_ini', p_date,
    'jumlah_slot_tersedia', v_max_orders,
    'slot_terpakai', v_committed,
    'slot_tersisa', case when v_max_orders is null then null else v_max_orders - v_committed end
  );
end;
$$;

-- ============================================================
-- 5. Bottleneck Dashboard: purely derived from get_production_kpis() (stage
-- backlog + stage duration) and get_operator_capacity() (utilization) --
-- no new data collection, per "Gunakan data KPI yang sudah ada". Deterministic
-- max/min picks, no recommendation or prediction.
-- ============================================================
create or replace function public.get_bottleneck_dashboard()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_kpis jsonb;
  v_slowest_stage text;
  v_slowest_stage_hours numeric;
  v_most_backlogged_stage text;
  v_most_backlogged_stage_count numeric;
  v_busiest_operator text;
  v_busiest_operator_pct numeric;
  v_most_idle_operator text;
  v_most_idle_operator_pct numeric;
begin
  v_kpis := public.get_production_kpis();

  select stage, value::numeric into v_slowest_stage, v_slowest_stage_hours
  from jsonb_each_text(coalesce(v_kpis -> 'avg_stage_duration_hours', '{}'::jsonb)) as t(stage, value)
  order by value::numeric desc
  limit 1;

  select stage, value::numeric into v_most_backlogged_stage, v_most_backlogged_stage_count
  from jsonb_each_text(coalesce(v_kpis -> 'stage_backlog', '{}'::jsonb)) as t(stage, value)
  order by value::numeric desc
  limit 1;

  select nama, utilization_pct into v_busiest_operator, v_busiest_operator_pct
  from public.get_operator_capacity()
  where utilization_pct is not null
  order by utilization_pct desc
  limit 1;

  select nama, utilization_pct into v_most_idle_operator, v_most_idle_operator_pct
  from public.get_operator_capacity()
  where utilization_pct is not null
  order by utilization_pct asc
  limit 1;

  return jsonb_build_object(
    'slowest_stage', v_slowest_stage,
    'slowest_stage_avg_hours', v_slowest_stage_hours,
    'most_backlogged_stage', v_most_backlogged_stage,
    'most_backlogged_stage_count', v_most_backlogged_stage_count,
    'busiest_operator', v_busiest_operator,
    'busiest_operator_utilization_pct', v_busiest_operator_pct,
    'most_idle_operator', v_most_idle_operator,
    'most_idle_operator_utilization_pct', v_most_idle_operator_pct
  );
end;
$$;
