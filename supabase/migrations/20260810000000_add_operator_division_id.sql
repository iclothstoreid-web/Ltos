-- Final audit fix: Operator <-> Master Division was 100% free-text name
-- matching everywhere (production_operators.divisi text, no FK at all) --
-- confirmed by grepping every migration and every frontend call site. This
-- is the exact mechanism behind two live incidents already found this
-- sprint: compute_daily_capacity() silently undercounts a divisi whose
-- production_operators.divisi text doesn't exact-match the current
-- master_divisions.name (documented in 20260808000000's own comment --
-- never fixed), and get_divisi_kpi_list() had the identical bug, patched in
-- 20260809000001 with a text-drift workaround rather than a real fix.
--
-- This migration makes master_divisions the actual single source of truth:
--   1. production_operators.division_id (uuid, FK to master_divisions.id) --
--      the new real join key. No existing row is deleted or reassigned to a
--      different division; `divisi` (the old text column) is left in place,
--      untouched by the backfill itself.
--   2. Backfill division_id for existing rows: first by exact
--      divisi = master_divisions.name match (covers the common case), then
--      two explicit one-time reconciliations for the two specific
--      pre-existing mismatches already confirmed live (not a general fuzzy
--      matcher, no permanent guessing logic): operators tagged the original
--      seeded name ("Penjahitan", "Pemotongan Kain") whose master_divisions
--      row has since been renamed with a "/Sewing" suffix
--      ("Pendjahitan/Sewing", "Pemotongan Kain/Sewing"). Every currently
--      active operator resolves to a real division_id after this step
--      (confirmed against live data before writing this migration).
--   3. `divisi` becomes a read-only mirror of master_divisions.name, kept in
--      sync by two triggers (one on production_operators, one on
--      master_divisions) -- so every existing consumer that still just
--      displays the raw `divisi` text column (Operator Management list,
--      OperatorAutocomplete results, AssignOperatorModal, Fitter KPI) keeps
--      working unchanged AND self-corrects instantly on a future divisi
--      rename, without needing every read site rewritten. Consequence
--      (intentional, not a bug): the two reconciled operators' `divisi` text
--      flips from the stale "Penjahitan"/"Pemotongan Kain" to the division's
--      current canonical name the moment division_id is backfilled -- this
--      *is* the fix, the stale text was the wrong single source of truth.
--   4. compute_daily_capacity() and get_divisi_kpi_list() -- the two
--      functions that GROUP/JOIN by divisi (as opposed to just displaying
--      it) -- are rewritten to key off division_id, so a future rename can
--      never again silently drop an operator from Capacity/Hari D/KPI.
--   5. The operator write/filter RPCs (search_operators, upsert_operator,
--      list_active_operators, create_operator, update_operator) swap their
--      `p_divisi text` parameter for `p_division_id uuid` -- old overloads
--      dropped explicitly first, same "orphaned overload" precaution
--      20260804000004 already established for this exact function group.

alter table public.production_operators
  add column if not exists division_id uuid references public.master_divisions(id);

create index if not exists idx_production_operators_division_id
  on public.production_operators(division_id);

-- Step 2a: exact-name backfill.
update public.production_operators po
set division_id = md.id
from public.master_divisions md
where po.division_id is null
  and po.divisi is not null
  and md.name = po.divisi;

-- Step 2b: one-time reconciliation for the two confirmed live mismatches
-- (master_divisions renamed out from under these operators' stale text).
update public.production_operators po
set division_id = md.id
from public.master_divisions md
where po.division_id is null
  and po.divisi = 'Penjahitan'
  and md.name = 'Pendjahitan/Sewing';

update public.production_operators po
set division_id = md.id
from public.master_divisions md
where po.division_id is null
  and po.divisi = 'Pemotongan Kain'
  and md.name = 'Pemotongan Kain/Sewing';

-- Step 3a: production_operators.divisi mirrors master_divisions.name via
-- division_id -- fires only when division_id is actually being set/changed
-- (column-level trigger), so unrelated writes (set_operator_status, a plain
-- name edit) never touch divisi and can never blank out a still-unresolved
-- legacy value for some future orphaned row.
create or replace function public.sync_operator_divisi_text()
returns trigger
language plpgsql
as $$
begin
  if new.division_id is null then
    new.divisi := null;
  else
    select name into new.divisi from public.master_divisions where id = new.division_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_operator_divisi_text on public.production_operators;
create trigger trg_sync_operator_divisi_text
  before insert or update of division_id on public.production_operators
  for each row execute function public.sync_operator_divisi_text();

-- Backfill above happened before this trigger existed -- run it once more so
-- every already-backfilled row's divisi text reflects its resolved
-- division's current name (the "single source of truth" end state).
update public.production_operators set division_id = division_id where division_id is not null;

-- Step 3b: renaming a division (update_division RPC) cascades to every
-- operator already linked to it -- this is what makes a future rename
-- genuinely harmless everywhere, not just at write time.
create or replace function public.sync_operator_divisi_on_division_rename()
returns trigger
language plpgsql
as $$
begin
  if new.name is distinct from old.name then
    update public.production_operators
    set divisi = new.name
    where division_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_operator_divisi_on_division_rename on public.master_divisions;
create trigger trg_sync_operator_divisi_on_division_rename
  after update of name on public.master_divisions
  for each row execute function public.sync_operator_divisi_on_division_rename();

-- Step 4a: Capacity Engine now keyed by division_id, not divisi text.
create or replace function public.compute_daily_capacity(p_date date default current_date)
returns integer
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
    where po.status = 'aktif' and po.deleted_at is null
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
  select coalesce(min(dc.capacity - coalesce(dl.load, 0)), 0)::integer
  from divisi_capacity dc
  left join divisi_load dl on dl.division_id = dc.division_id;
$$;

-- Step 4b: get_divisi_kpi_list() now keyed by division_id. The
-- 20260809000001 name-drift-union workaround is gone -- replaced by a
-- proper "Belum Terhubung ke Divisi" bucket that only appears (and only
-- ever should, going forward) for an operator whose division_id somehow
-- never got resolved, so nobody is silently dropped either way.
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
    capacity as (
      select po.division_id, sum(po.max_concurrent_capacity) as total_capacity
      from public.production_operators po
      where po.is_active = true and po.division_id in (select id from production_divisi)
      group by po.division_id
    ),
    load as (
      select po.division_id, count(r.id) as active_jobs
      from public.production_operators po
      join public.production_stage_records r
        on (r.assigned_operator_id = po.id or r.operator_id = po.id)
        and r.status in ('pending', 'in_progress')
      where po.is_active = true and po.division_id in (select id from production_divisi)
      group by po.division_id
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
      coalesce(cap.total_capacity, 0) as total_capacity,
      coalesce(ld.active_jobs, 0) as active_jobs,
      case when coalesce(cap.total_capacity, 0) = 0 then null
        else round(coalesce(ld.active_jobs, 0)::numeric / cap.total_capacity * 100, 1)
      end as capacity_utilization_pct,
      round(eff.avg_efficiency_pct, 1) as avg_efficiency_pct,
      coalesce(th.throughput_hari_ini, 0) as throughput_hari_ini,
      coalesce(th.throughput_minggu_ini, 0) as throughput_minggu_ini
    from production_divisi pd
    left join headcount hc on hc.division_id = pd.id
    left join capacity cap on cap.division_id = pd.id
    left join load ld on ld.division_id = pd.id
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

-- Step 4c: get_operator_kpi_list() exposes division_id too, so the KPI
-- Operator dashboard's drill-down can filter by id instead of the display
-- text (belt-and-braces -- divisi text is trigger-synced now, but id is the
-- real key and master_divisions.name has no uniqueness constraint).
drop function if exists public.get_operator_kpi_list();

create or replace function public.get_operator_kpi_list()
returns table (
  operator_id uuid,
  nama text,
  divisi text,
  division_id uuid,
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
    po.division_id,
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

-- Step 5: write/filter RPCs -- p_divisi text -> p_division_id uuid. Old
-- text-arg overloads dropped explicitly (same precaution as
-- 20260804000004_drop_orphaned_operator_rpc_overloads.sql).
drop function if exists public.search_operators(text, text);
create or replace function public.search_operators(p_query text, p_division_id uuid default null)
returns setof production_operators
language sql
security definer
set search_path to 'public'
as $$
  select * from public.production_operators
  where is_active = true
    and nama ilike '%' || p_query || '%'
    and (p_division_id is null or division_id = p_division_id)
  order by nama
  limit 10;
$$;

drop function if exists public.list_active_operators(text);
create or replace function public.list_active_operators(p_division_id uuid default null)
returns setof production_operators
language sql
security definer
set search_path to 'public'
as $$
  select * from public.production_operators
  where is_active = true
    and (p_division_id is null or division_id = p_division_id)
  order by nama;
$$;

drop function if exists public.upsert_operator(text, text);
create or replace function public.upsert_operator(p_nama text, p_division_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_id uuid;
  v_clean text := trim(p_nama);
begin
  select id into v_id from public.production_operators where lower(nama) = lower(v_clean);
  if v_id is not null then
    return v_id;
  end if;

  insert into public.production_operators (nama, division_id) values (v_clean, p_division_id)
  returning id into v_id;

  return v_id;
end;
$$;

drop function if exists public.create_operator(text, text);
create or replace function public.create_operator(p_nama text, p_division_id uuid default null)
returns production_operators
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.production_operators;
begin
  insert into public.production_operators (nama, division_id)
  values (trim(p_nama), p_division_id)
  returning * into v_row;
  return v_row;
end;
$$;

drop function if exists public.update_operator(uuid, text, text);
create or replace function public.update_operator(p_operator_id uuid, p_nama text, p_division_id uuid)
returns production_operators
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.production_operators;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengubah data operator.';
  end if;

  update public.production_operators
  set nama = trim(p_nama), division_id = p_division_id
  where id = p_operator_id and deleted_at is null
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Operator tidak ditemukan.';
  end if;

  return v_row;
end;
$$;

grant execute on function public.search_operators(text, uuid) to authenticated, anon;
grant execute on function public.upsert_operator(text, uuid) to authenticated, anon;
grant execute on function public.list_active_operators(uuid) to authenticated, anon;
grant execute on function public.create_operator(text, uuid) to authenticated, anon;
grant execute on function public.update_operator(uuid, text, uuid) to authenticated, anon;
