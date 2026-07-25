-- Sprint L Phase 2: Capacity Engine dedup. Per audit, the per-divisi
-- "capacity = sum(max_concurrent_capacity) of Aktif operators" / "load =
-- count of active stage records" pair was hand-copied in two places
-- (compute_daily_capacity, get_divisi_kpi_list) with identical join logic,
-- and a third, independent re-derivation of total operator capacity lived
-- inside compute_service_validation_signals' Signal 3. None called each
-- other, so a future schema change (e.g. the divisi text->division_id
-- migration) had to be applied by hand in multiple places -- exactly the
-- bug class 20260810000000 already fixed once for the divisi-text drift.
--
-- This migration does not change any computed value and does not introduce
-- a new source of truth -- compute_daily_capacity() (MIN-headroom across
-- staffed, non-Fitting production divisi) remains the one engine behind the
-- Capacity Calendar and resolve_hari_d. It only extracts the shared
-- per-divisi capacity/load query both compute_daily_capacity() and
-- get_divisi_kpi_list() already independently computed, and points
-- compute_service_validation_signals() at the existing get_operator_capacity()
-- read model instead of querying production_operators directly a third time.
--
-- get_capacity_dashboard() (all-divisi operator sum, including Fitting) is
-- deliberately left as-is -- it answers a different question ("how much
-- operator headcount capacity exists") than compute_daily_capacity()
-- ("how many new orders can start production today"). Confirmed with the
-- user: keep both numbers, dedupe the underlying SQL, fix the labels
-- instead of merging the two metrics.

-- ============================================================
-- Shared per-divisi capacity/load snapshot (staffed + unstaffed, active,
-- non-Fitting production divisi). capacity is NULL when a divisi has zero
-- Aktif operators -- callers that need "staffed only" (compute_daily_capacity)
-- filter on capacity is not null; callers that need "all divisi, zero-filled"
-- (get_divisi_kpi_list) coalesce it themselves, same as before.
-- ============================================================
create or replace function public.get_divisi_capacity_snapshot()
returns table (
  division_id uuid,
  capacity bigint,
  load bigint
)
language sql
security definer
set search_path to 'public'
as $$
  with production_divisi as (
    select id from public.master_divisions
    where is_active = true and name <> 'Fitting'
  ),
  divisi_capacity as (
    select po.division_id, sum(po.max_concurrent_capacity) as capacity
    from public.production_operators po
    where po.is_active = true
      and po.division_id in (select id from production_divisi)
    group by po.division_id
  ),
  divisi_load as (
    select po.division_id, count(r.id) as load
    from public.production_operators po
    join public.production_stage_records r
      on (r.assigned_operator_id = po.id or r.operator_id = po.id)
      and r.status in ('pending', 'in_progress')
    where po.division_id in (select id from production_divisi)
    group by po.division_id
  )
  select pd.id as division_id, dc.capacity, coalesce(dl.load, 0)::bigint as load
  from production_divisi pd
  left join divisi_capacity dc on dc.division_id = pd.id
  left join divisi_load dl on dl.division_id = pd.id;
$$;

grant execute on function public.get_divisi_capacity_snapshot() to authenticated;

-- compute_daily_capacity(): same MIN(capacity - load) across staffed divisi
-- only, now sourced from the shared snapshot instead of its own copy of the
-- capacity/load joins.
create or replace function public.compute_daily_capacity(p_date date default current_date)
returns integer
language sql
security definer
set search_path to 'public'
as $$
  select coalesce(min(capacity - load), 0)::integer
  from public.get_divisi_capacity_snapshot()
  where capacity is not null;
$$;

-- get_divisi_kpi_list(): capacity/load CTEs now read from the same shared
-- snapshot instead of re-joining production_operators/production_stage_records
-- a second time. headcount/efficiency/throughput CTEs are unrelated metrics
-- and are unchanged.
drop function if exists public.get_divisi_kpi_list();

create or replace function public.get_divisi_kpi_list()
returns table (
  divisi text,
  division_id uuid,
  jumlah_sdm bigint,
  total_capacity bigint,
  active_jobs bigint,
  capacity_utilization_pct numeric,
  avg_efficiency_pct numeric,
  throughput_hari_ini bigint,
  throughput_minggu_ini bigint
)
language sql
security definer
set search_path to 'public'
as $$
  select divisi, division_id, jumlah_sdm, total_capacity, active_jobs,
    capacity_utilization_pct, avg_efficiency_pct, throughput_hari_ini, throughput_minggu_ini
  from (
    with production_divisi as (
      select id, name, sort_order from public.master_divisions
      where is_active = true and name <> 'Fitting'
    ),
    headcount as (
      select po.division_id, count(*) as jumlah_sdm
      from public.production_operators po
      where po.is_active = true and po.division_id in (select id from production_divisi)
      group by po.division_id
    ),
    capacity_load as (
      select division_id, capacity as total_capacity, load as active_jobs
      from public.get_divisi_capacity_snapshot()
    ),
    efficiency as (
      select po.division_id, avg(100 - perf.alter_rate_pct) as avg_efficiency_pct
      from public.production_operators po
      join public.get_operator_performance() perf on perf.operator_id = po.id
      where po.is_active = true
        and po.division_id in (select id from production_divisi)
        and perf.alter_rate_pct is not null
      group by po.division_id
    ),
    throughput as (
      select po.division_id,
        count(*) filter (where r.completed_at::date = current_date) as throughput_hari_ini,
        count(*) filter (where r.completed_at >= date_trunc('week', current_date)) as throughput_minggu_ini
      from public.production_operators po
      join public.production_stage_records r on r.operator_id = po.id and r.status = 'completed'
      where po.division_id in (select id from production_divisi)
      group by po.division_id
    )
    select
      pd.sort_order as _sort,
      pd.name as divisi,
      pd.id as division_id,
      coalesce(hc.jumlah_sdm, 0) as jumlah_sdm,
      coalesce(cl.total_capacity, 0) as total_capacity,
      coalesce(cl.active_jobs, 0) as active_jobs,
      case when coalesce(cl.total_capacity, 0) = 0 then null
        else round(coalesce(cl.active_jobs, 0)::numeric / cl.total_capacity * 100, 1)
      end as capacity_utilization_pct,
      round(eff.avg_efficiency_pct, 1) as avg_efficiency_pct,
      coalesce(th.throughput_hari_ini, 0) as throughput_hari_ini,
      coalesce(th.throughput_minggu_ini, 0) as throughput_minggu_ini
    from production_divisi pd
    left join headcount hc on hc.division_id = pd.id
    left join capacity_load cl on cl.division_id = pd.id
    left join efficiency eff on eff.division_id = pd.id
    left join throughput th on th.division_id = pd.id

    union all

    select
      999 as _sort,
      'Belum Terhubung ke Divisi' as divisi,
      null::uuid as division_id,
      count(*) as jumlah_sdm,
      coalesce(sum(po.max_concurrent_capacity), 0) as total_capacity,
      0::bigint as active_jobs,
      null::numeric as capacity_utilization_pct,
      null::numeric as avg_efficiency_pct,
      0::bigint as throughput_hari_ini,
      0::bigint as throughput_minggu_ini
    from public.production_operators po
    where po.is_active = true and po.division_id is null
    having count(*) > 0
  ) t
  order by _sort, divisi;
$$;

grant execute on function public.get_divisi_kpi_list() to authenticated;

-- compute_service_validation_signals(): Signal 3 (KPI vs. total operator
-- capacity) re-queried production_operators directly instead of reusing
-- get_operator_capacity(), the read model every other capacity consumer
-- (get_capacity_dashboard, get_bottleneck_dashboard) already goes through.
-- Same filter (is_active = true), same result -- just one fewer independent
-- copy of "sum active operators' max_concurrent_capacity".
create or replace function public.compute_service_validation_signals(p_service_level text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_hari_d date;
  v_calendar_max integer;
  v_calendar_committed integer;
  v_hari_d_status text;
  v_active_operator_count integer;
  v_avg_utilization numeric;
  v_capacity_status text;
  v_total_backlog numeric;
  v_total_capacity numeric;
  v_kpi_ratio numeric;
  v_kpi_status text;
  v_overall text;
  v_reasons jsonb := '[]'::jsonb;
  v_sla_working_days integer;
begin
  if p_service_level not in ('standard', 'fast', 'very_fast') then
    raise exception 'Unknown service_level: %', p_service_level;
  end if;

  v_hari_d := public.resolve_hari_d(current_date);
  if v_hari_d is null then
    v_hari_d_status := 'red';
    v_reasons := v_reasons || jsonb_build_array('Tidak ada slot kapasitas tersedia dalam 90 hari ke depan');
  else
    select max_orders into v_calendar_max
    from public.production_capacity_calendar
    where calendar_date = v_hari_d;

    if v_calendar_max is null then
      v_hari_d_status := 'yellow';
      v_reasons := v_reasons || jsonb_build_array('Kapasitas harian belum diatur untuk tanggal ini');
    else
      select count(*) into v_calendar_committed
      from public.orders where hari_d = v_hari_d;

      if v_calendar_committed::numeric / nullif(v_calendar_max, 0) >= 0.8 then
        v_hari_d_status := 'yellow';
        v_reasons := v_reasons || jsonb_build_array('Kapasitas hari tersebut hampir penuh');
      else
        v_hari_d_status := 'green';
      end if;
    end if;
  end if;

  select count(*), avg(utilization_pct)
    into v_active_operator_count, v_avg_utilization
  from public.get_operator_capacity();

  if coalesce(v_active_operator_count, 0) = 0 or coalesce(v_avg_utilization, 0) >= 100 then
    v_capacity_status := 'red';
    v_reasons := v_reasons || jsonb_build_array('Rata-rata operator sudah di atas kapasitas maksimum');
  elsif v_avg_utilization >= 70 then
    v_capacity_status := 'yellow';
    v_reasons := v_reasons || jsonb_build_array('Rata-rata operator mendekati kapasitas maksimum');
  else
    v_capacity_status := 'green';
  end if;

  select coalesce(sum(value::numeric), 0) into v_total_backlog
  from jsonb_each_text((public.get_production_kpis() ->> 'stage_backlog')::jsonb);

  select coalesce(sum(max_concurrent_capacity), 0) into v_total_capacity
  from public.get_operator_capacity();

  if v_total_capacity = 0 then
    v_kpi_status := 'red';
    v_reasons := v_reasons || jsonb_build_array('Tidak ada kapasitas operator aktif untuk menampung antrean');
  else
    v_kpi_ratio := v_total_backlog / v_total_capacity;
    if v_kpi_ratio >= 1.5 then
      v_kpi_status := 'red';
      v_reasons := v_reasons || jsonb_build_array('Antrean produksi jauh melebihi total kapasitas operator');
    elsif v_kpi_ratio >= 1.0 then
      v_kpi_status := 'yellow';
      v_reasons := v_reasons || jsonb_build_array('Antrean produksi mendekati total kapasitas operator');
    else
      v_kpi_status := 'green';
    end if;
  end if;

  v_overall := case
    when 'red' in (v_hari_d_status, v_capacity_status, v_kpi_status) then 'red'
    when 'yellow' in (v_hari_d_status, v_capacity_status, v_kpi_status) then 'yellow'
    else 'green'
  end;

  select working_days into v_sla_working_days
  from public.service_sla_rules where service_level = p_service_level;

  return jsonb_build_object(
    'service_level', p_service_level,
    'hari_d', v_hari_d,
    'estimated_completion', case when v_hari_d is not null
      then public.add_working_days(v_hari_d, v_sla_working_days)
      else null
    end,
    'overall_status', v_overall,
    'signals', jsonb_build_object(
      'hari_d', v_hari_d_status,
      'capacity', v_capacity_status,
      'kpi', v_kpi_status
    ),
    'reasons', v_reasons
  );
end;
$$;
