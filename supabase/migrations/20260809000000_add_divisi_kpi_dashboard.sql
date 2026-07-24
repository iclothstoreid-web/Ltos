-- KPI Operator audit fix: "Total Operator Aktif" was a flat count(*) over
-- every is_active production_operators row, with zero divisi awareness --
-- Formulasi/Cutting/Sewing/QC/Finishing/Packing/Pengiriman staff were all
-- lumped into one "Operator" number. This migration adds a per-divisi
-- breakdown RPC so the dashboard can answer "berapa SDM tiap divisi",
-- "divisi mana bottleneck/idle/overload" instead of one undifferentiated
-- total. No new table -- reuses production_operators/production_stage_records/
-- master_divisions, and the same divisi_capacity/divisi_load CTEs
-- compute_daily_capacity() (Sprint K Capacity Engine) already established,
-- so headcount/capacity/load numbers here agree with that engine by
-- construction rather than duplicating a second definition of them.
--
-- Fitting is excluded, same boundary compute_daily_capacity() already draws
-- ("production_divisi" = active master_divisions minus Fitting) -- Fitters
-- have their own KPI Fitter page/RPCs (Sprint K), not production stages.
--
-- Throughput per divisi has no existing aggregate to reuse (get_kpi_dashboard's
-- throughput_hari_ini/minggu_ini is workshop-wide, keyed off stage='shipping'
-- only). production_stage_records.stage is an English key (material_prep,
-- pattern_formulation, ...) while divisi is the Indonesian display string an
-- operator is tagged with (Persiapan Material, Formulasi Pola, ...) -- these
-- happen to be the exact same vocabulary as STAGE_LABELS
-- (src/lib/production/stageConfig.ts) and the seeded master_divisions rows
-- (20260805000001_add_master_division.sql), so a stage->divisi VALUES map
-- below is a straight 1:1 lookup, not a guess.
create or replace function public.get_divisi_kpi_list()
returns table (
  divisi text,
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
  with production_divisi as (
    select name, sort_order from public.master_divisions
    where is_active = true and name <> 'Fitting'
  ),
  stage_map(divisi, stage) as (
    values
      ('Persiapan Material', 'material_prep'),
      ('Formulasi Pola', 'pattern_formulation'),
      ('Pemotongan Kain', 'cutting'),
      ('Penjahitan', 'sewing'),
      ('Pemeriksaan Kualitas', 'qc'),
      ('Finishing', 'finishing'),
      ('Packing', 'packing'),
      ('Pengiriman', 'shipping')
  ),
  headcount as (
    select po.divisi, count(*) as jumlah_sdm
    from public.production_operators po
    where po.is_active = true and po.divisi in (select name from production_divisi)
    group by po.divisi
  ),
  capacity as (
    select po.divisi, sum(po.max_concurrent_capacity) as total_capacity
    from public.production_operators po
    where po.is_active = true and po.divisi in (select name from production_divisi)
    group by po.divisi
  ),
  load as (
    select po.divisi, count(r.id) as active_jobs
    from public.production_operators po
    join public.production_stage_records r
      on (r.assigned_operator_id = po.id or r.operator_id = po.id)
      and r.status in ('pending', 'in_progress')
    where po.is_active = true and po.divisi in (select name from production_divisi)
    group by po.divisi
  ),
  efficiency as (
    select po.divisi, avg(100 - perf.alter_rate_pct) as avg_efficiency_pct
    from public.production_operators po
    join public.get_operator_performance() perf on perf.operator_id = po.id
    where po.is_active = true
      and po.divisi in (select name from production_divisi)
      and perf.alter_rate_pct is not null
    group by po.divisi
  ),
  throughput as (
    select
      sm.divisi,
      count(*) filter (where r.completed_at::date = current_date) as throughput_hari_ini,
      count(*) filter (where r.completed_at >= date_trunc('week', current_date)) as throughput_minggu_ini
    from public.production_stage_records r
    join stage_map sm on sm.stage = r.stage
    where r.status = 'completed'
    group by sm.divisi
  )
  select
    pd.name as divisi,
    coalesce(hc.jumlah_sdm, 0) as jumlah_sdm,
    coalesce(cap.total_capacity, 0) as total_capacity,
    coalesce(ld.active_jobs, 0) as active_jobs,
    case when coalesce(cap.total_capacity, 0) = 0 then null
      else round(coalesce(ld.active_jobs, 0)::numeric / cap.total_capacity * 100, 1)
    end as capacity_utilization_pct,
    round(eff.avg_efficiency_pct, 1) as avg_efficiency_pct,
    coalesce(th.throughput_hari_ini, 0) as throughput_hari_ini,
    coalesce(th.throughput_minggu_ini, 0) as throughput_minggu_ini
  from production_divisi pd
  left join headcount hc on hc.divisi = pd.name
  left join capacity cap on cap.divisi = pd.name
  left join load ld on ld.divisi = pd.name
  left join efficiency eff on eff.divisi = pd.name
  left join throughput th on th.divisi = pd.name
  order by pd.sort_order;
$$;

grant execute on function public.get_divisi_kpi_list() to authenticated;

-- get_operator_kpi_list() gains a `divisi` column so the Owner can drill
-- down from a divisi card straight to its members without a second RPC --
-- CREATE OR REPLACE can't add a return column to a table function, so the
-- old signature must be dropped first (same reason 20260808000000 dropped
-- get_capacity_calendar before its return-shape change).
drop function if exists public.get_operator_kpi_list();

create or replace function public.get_operator_kpi_list()
returns table (
  operator_id uuid,
  nama text,
  divisi text,
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
    po.divisi,
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

grant execute on function public.get_operator_kpi_list() to authenticated;
