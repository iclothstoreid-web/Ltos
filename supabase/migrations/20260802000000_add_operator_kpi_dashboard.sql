-- Sprint G (backend-only additions): Owner OS's new "KPI Operator" menu.
-- Reuses every Sprint B-F RPC as-is -- no existing RPC contract changes:
--   - Dashboard summary section (Total Operator Aktif, Total Order Aktif,
--     Total Order Selesai, Average Production Time, Capacity Utilization,
--     Throughput, Bottleneck) is served entirely by the existing
--     get_kpi_dashboard(), get_capacity_dashboard(), get_bottleneck_dashboard()
--     -- no new RPC needed for that section at all.
--   - The two new functions below compose get_operator_performance() and
--     get_operator_capacity() by joining/selecting against them, rather than
--     reimplementing their avg-duration/alter-rate/utilization math a
--     second time.
--
-- Two new RPCs, both genuinely new aggregations not covered by any existing
-- function (get_operator_performance/get_operator_capacity count STAGE
-- RECORDS, not distinct orders -- "Order Dikerjakan"/"Order Selesai"/
-- "Order Aktif" need a distinct-order count neither exposes; a per-stage
-- breakdown for one operator and their job history are new dimensions too):
--   - get_operator_kpi_list(): one row per operator, for the Daftar Operator
--     table.
--   - get_operator_kpi_detail(p_operator_id): per-operator drill-down --
--     profile, aggregates, Performance per Stage, Riwayat Pekerjaan.
-- No new table -- both are read-only over production_operators and
-- production_stage_records (the only two tables that hold this data).

create or replace function public.get_operator_kpi_list()
returns table (
  operator_id uuid,
  nama text,
  is_active boolean,
  order_dikerjakan bigint,
  order_selesai bigint,
  avg_duration_minutes numeric,
  efficiency_pct numeric,
  capacity_utilization_pct numeric,
  active_jobs bigint,
  max_concurrent_capacity integer,
  status text
)
language sql
security definer
set search_path to 'public'
as $$
  select
    po.id,
    po.nama,
    po.is_active,
    coalesce(orders_touched.cnt, 0) as order_dikerjakan,
    coalesce(orders_done.cnt, 0) as order_selesai,
    perf.avg_duration_minutes,
    case when perf.alter_rate_pct is null then null
      else round(100 - perf.alter_rate_pct, 1)
    end as efficiency_pct,
    cap.utilization_pct as capacity_utilization_pct,
    cap.active_jobs,
    po.max_concurrent_capacity,
    case when not po.is_active then 'Non-aktif' else 'Aktif' end as status
  from public.production_operators po
  left join public.get_operator_performance() perf on perf.operator_id = po.id
  left join public.get_operator_capacity() cap on cap.operator_id = po.id
  left join lateral (
    -- Distinct orders this operator has ever touched, either as the one who
    -- actually did the work (operator_id) or the one currently assigned
    -- (assigned_operator_id) -- same "belongs to this operator" test
    -- get_operator_capacity() uses for active_jobs, just counted as orders.
    select count(distinct r.order_id) as cnt
    from public.production_stage_records r
    where r.operator_id = po.id or r.assigned_operator_id = po.id
  ) orders_touched on true
  left join lateral (
    select count(distinct r.order_id) as cnt
    from public.production_stage_records r
    where r.operator_id = po.id and r.status = 'completed'
  ) orders_done on true
  order by po.nama;
$$;

create or replace function public.get_operator_kpi_detail(p_operator_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_profile record;
  v_perf record;
  v_cap record;
  v_order_aktif bigint;
  v_order_selesai bigint;
  v_result jsonb;
begin
  select id, nama, is_active, max_concurrent_capacity, created_at
    into v_profile
  from public.production_operators
  where id = p_operator_id;

  if v_profile.id is null then
    return null;
  end if;

  select * into v_perf from public.get_operator_performance() where operator_id = p_operator_id;
  select * into v_cap from public.get_operator_capacity() where operator_id = p_operator_id;

  select count(distinct r.order_id) into v_order_aktif
  from public.production_stage_records r
  where (r.operator_id = p_operator_id or r.assigned_operator_id = p_operator_id)
    and r.status in ('pending', 'in_progress');

  select count(distinct r.order_id) into v_order_selesai
  from public.production_stage_records r
  where r.operator_id = p_operator_id and r.status = 'completed';

  select jsonb_build_object(
    'profile', jsonb_build_object(
      'operator_id', v_profile.id,
      'nama', v_profile.nama,
      'is_active', v_profile.is_active,
      'max_concurrent_capacity', v_profile.max_concurrent_capacity,
      'created_at', v_profile.created_at
    ),
    'order_aktif', v_order_aktif,
    'order_selesai', v_order_selesai,
    'avg_duration_minutes', v_perf.avg_duration_minutes,
    'efficiency_pct', case when v_perf.alter_rate_pct is null then null
      else round(100 - v_perf.alter_rate_pct, 1)
    end,
    'capacity', jsonb_build_object(
      'active_jobs', v_cap.active_jobs,
      'max_concurrent_capacity', v_cap.max_concurrent_capacity,
      'utilization_pct', v_cap.utilization_pct
    ),
    -- Performance per Stage: not exposed by get_operator_performance() (which
    -- aggregates across every stage for one operator) -- this groups the
    -- same production_stage_records rows by stage instead, for one operator.
    'performance_per_stage', coalesce((
      select jsonb_object_agg(stage, stats)
      from (
        select
          stage,
          jsonb_build_object(
            'completed_jobs', count(*) filter (where status = 'completed'),
            'avg_duration_minutes', round(
              (avg(extract(epoch from (completed_at - started_at)) / 60)
                filter (where status = 'completed' and started_at is not null and completed_at is not null)
              )::numeric, 1
            ),
            'alter_rate_pct', round(
              (count(*) filter (where decision = 'alter'))::numeric
              / nullif(count(*) filter (where decision is not null), 0) * 100,
              1
            )
          ) as stats
        from public.production_stage_records
        where operator_id = p_operator_id
        group by stage
      ) t
    ), '{}'::jsonb),
    -- Riwayat Pekerjaan: most recent 50 stage records this operator actually
    -- worked, newest first.
    'riwayat_pekerjaan', coalesce((
      select jsonb_agg(row_to_json(t))
      from (
        select
          r.order_id,
          o.order_number,
          r.stage,
          r.started_at,
          r.completed_at,
          case
            when r.started_at is not null and r.completed_at is not null
            then round((extract(epoch from (r.completed_at - r.started_at)) / 60)::numeric)
            else null
          end as duration_minutes
        from public.production_stage_records r
        join public.orders o on o.id = r.order_id
        where r.operator_id = p_operator_id
        order by coalesce(r.started_at, r.created_at) desc
        limit 50
      ) t
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;
