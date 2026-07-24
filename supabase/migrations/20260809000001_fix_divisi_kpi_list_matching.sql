-- Fixes get_divisi_kpi_list() (20260809000000) against live data found by
-- querying the deployed function immediately after applying it: production
-- master_divisions rows have since been renamed away from the seeded
-- STAGE_LABELS vocabulary (e.g. "Pemotongan Kain" -> "Pemotongan Kain/Sewing",
-- "Penjahitan" -> "Pendjahitan/Sewing" -- note the dropped "j"), but the 8
-- production_operators actually tagged "Pemotongan Kain"/"Penjahitan" (7 of
-- them alone in Penjahitan) were never updated to match. An exact-string
-- join from production_divisi (= master_divisions.name) to
-- production_operators.divisi therefore silently dropped those 8 operators
-- (most of the active roster) from the entire per-divisi breakdown --
-- exactly the kind of undercount this feature exists to fix, just moved to
-- a different failure mode. Same root issue the Capacity Engine's own
-- migration comment already flagged (20260808000000, "one aktif operator is
-- tagged 'Pemeriksaan Kualitas/QC' instead of the seeded 'Pemeriksaan
-- Kualitas'") -- compute_daily_capacity() has this identical exposure today.
--
-- Fix: the divisi list a card is generated for is now the UNION of active
-- master_divisions names (so an unstaffed pipeline stage still shows up as
-- 0 SDM, answering "divisi mana idle/unstaffed") and any distinct divisi
-- text actually in use by an active operator that doesn't match a
-- master_divisions row (so a mistagged/renamed-out-from-under-it operator
-- is never silently dropped from the headcount). Throughput no longer goes
-- through a divisi-name -> stage-key text map at all (that mapping assumed
-- divisi text equals STAGE_LABELS verbatim, the exact assumption live data
-- just disproved) -- it's now computed the same way headcount/capacity/load
-- already are, by operator membership (who actually completed the stage
-- record), which needs no naming convention to hold.
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
    union
    select distinct po.divisi as name, 999 as sort_order
    from public.production_operators po
    where po.is_active = true
      and po.divisi is not null
      and po.divisi <> 'Fitting'
      and po.divisi not in (
        select name from public.master_divisions where is_active = true
      )
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
  -- By operator membership (who completed the stage record), not by a
  -- divisi-name -> stage-key text map -- see header comment.
  throughput as (
    select po.divisi,
      count(*) filter (where r.completed_at::date = current_date) as throughput_hari_ini,
      count(*) filter (where r.completed_at >= date_trunc('week', current_date)) as throughput_minggu_ini
    from public.production_operators po
    join public.production_stage_records r on r.operator_id = po.id and r.status = 'completed'
    where po.divisi in (select name from production_divisi)
    group by po.divisi
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
  order by pd.sort_order, pd.name;
$$;

grant execute on function public.get_divisi_kpi_list() to authenticated;
