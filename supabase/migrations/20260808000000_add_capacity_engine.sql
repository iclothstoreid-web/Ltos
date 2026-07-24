-- Sprint K (LOCK V1) §12-16: Capacity Engine + Override audit log.
--
-- Today production_capacity_calendar.max_orders is 100% manual (owner types
-- a number per date) and resolve_hari_d() treats "no row" as UNLIMITED
-- capacity. This migration makes capacity a computed OUTPUT ENGINE instead:
--   divisi_capacity  = sum(max_concurrent_capacity) of Aktif operators in
--                      that divisi
--   divisi_load      = count of active (pending/in_progress) stage records
--                      assigned to an operator in that divisi
--   divisi_headroom  = divisi_capacity - divisi_load
--   daily_new_order_cap = MIN(divisi_headroom) across STAFFED production
--                      divisi only -- confirmed against live data
--                      (production_capacity_calendar has 0 rows; several
--                      production divisions -- Packing, Pengiriman -- have
--                      zero operators currently tagged, and one aktif
--                      operator is tagged "Pemeriksaan Kualitas/QC" instead
--                      of the seeded "Pemeriksaan Kualitas"). Bottlenecking
--                      across ALL divisions would make computed capacity 0
--                      everywhere today and permanently break
--                      resolve_hari_d for this already-live app. Divisions
--                      with zero aktif operators are skipped from the MIN
--                      (not treated as a hard-zero bottleneck) until
--                      someone is actually tagged there -- confirmed with
--                      the user.
-- Libur/Cuti/Nonaktif are automatically excluded -- the status='aktif'
-- filter is the entire mechanism, same trick sync_operator_is_active
-- already relies on elsewhere.
--
-- max_orders on production_capacity_calendar becomes override-only: null =
-- "use the computed engine", non-null = "owner override in effect". A
-- reason is now mandatory on every override, and every write is logged to
-- a new append-only capacity_override_audit_log (modeled on business_events'
-- shape -- the closest existing audit-trail analog; there is no dedicated
-- audit_log table anywhere in this codebase). No backfill needed: the table
-- has 0 rows today (confirmed live).

alter table public.production_capacity_calendar
  alter column max_orders drop not null,
  alter column max_orders drop default,
  add column if not exists override_reason text,
  add column if not exists overridden_by uuid references public.profiles(id),
  add column if not exists overridden_at timestamptz;

create table if not exists public.capacity_override_audit_log (
  id uuid primary key default gen_random_uuid(),
  calendar_date date not null,
  old_max_orders integer,
  new_max_orders integer,
  reason text not null,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz not null default now()
);

create index if not exists idx_capacity_override_audit_log_date
  on public.capacity_override_audit_log(calendar_date);

alter table public.capacity_override_audit_log enable row level security;

create policy "All staff can read capacity override audit log"
  on public.capacity_override_audit_log for select
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()));

-- Computed capacity for a date. p_date is currently unused (accepted for a
-- stable, date-based call signature matching get_capacity_calendar's range
-- iteration) -- there is no per-day operator work schedule in this app yet
-- (Libur/Cuti is a manually-toggled CURRENT status, not a scheduled date
-- range, per Sprint K), so this is a live snapshot of today's operator
-- state applied uniformly to every date, not a true per-date forecast.
create or replace function public.compute_daily_capacity(p_date date default current_date)
returns integer
language sql
security definer
set search_path to 'public'
as $$
  with production_divisi as (
    select name from public.master_divisions
    where is_active = true and name <> 'Fitting'
  ),
  divisi_capacity as (
    select po.divisi, sum(po.max_concurrent_capacity) as capacity
    from public.production_operators po
    where po.status = 'aktif' and po.deleted_at is null
      and po.divisi in (select name from production_divisi)
    group by po.divisi
  ),
  divisi_load as (
    select po.divisi, count(r.id) as load
    from public.production_operators po
    join public.production_stage_records r
      on (r.assigned_operator_id = po.id or r.operator_id = po.id)
      and r.status in ('pending', 'in_progress')
    where po.divisi in (select name from production_divisi)
    group by po.divisi
  )
  -- Only divisi with >=1 aktif operator enter the MIN() -- an unstaffed
  -- divisi is not yet a trackable bottleneck, it's a data-tagging gap.
  select coalesce(min(dc.capacity - coalesce(dl.load, 0)), 0)::integer
  from divisi_capacity dc
  left join divisi_load dl on dl.divisi = dc.divisi;
$$;

grant execute on function public.compute_daily_capacity(date) to authenticated;

-- Signature changed (new required p_reason param) -- must drop the old
-- 3-arg overload explicitly or it survives alongside the new one as a dead,
-- unreasoned write path (the exact "orphaned RPC overload" bug Sprint K's
-- own consistency audit caught once before).
drop function if exists public.set_capacity_calendar_day(date, integer, text);

-- Override write path -- reason now mandatory, every call logged.
create or replace function public.set_capacity_calendar_day(
  p_date date,
  p_max_orders integer,
  p_reason text,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_old_max_orders integer;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengatur Kalender Kapasitas.';
  end if;

  if p_max_orders < 0 then
    raise exception 'max_orders must be >= 0';
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'Alasan override wajib diisi.';
  end if;

  select max_orders into v_old_max_orders
  from public.production_capacity_calendar
  where calendar_date = p_date;

  insert into public.production_capacity_calendar (
    calendar_date, max_orders, notes, override_reason, overridden_by, overridden_at
  )
  values (p_date, p_max_orders, p_notes, p_reason, auth.uid(), now())
  on conflict (calendar_date) do update
    set max_orders = excluded.max_orders,
        notes = excluded.notes,
        override_reason = excluded.override_reason,
        overridden_by = excluded.overridden_by,
        overridden_at = excluded.overridden_at,
        updated_at = now();

  insert into public.capacity_override_audit_log (
    calendar_date, old_max_orders, new_max_orders, reason, changed_by
  )
  values (p_date, v_old_max_orders, p_max_orders, p_reason, auth.uid());
end;
$$;

-- Return type changed (setof production_capacity_calendar -> a computed
-- table shape) -- CREATE OR REPLACE cannot change a function's return type,
-- must drop first.
drop function if exists public.get_capacity_calendar(date, date);

-- Returns both the computed value and the effective (override-wins) value
-- per date, plus whether an override is in effect -- so the UI can show
-- "Computed: 8 - Override: 5 (reason: Listrik padam)".
create or replace function public.get_capacity_calendar(p_start date, p_end date)
returns table (
  calendar_date date,
  computed_max_orders integer,
  effective_max_orders integer,
  is_override boolean,
  override_reason text,
  overridden_by uuid,
  overridden_at timestamptz,
  notes text
)
language sql
security definer
set search_path to 'public'
as $$
  -- generate_series over `date` bounds implicitly produces `timestamp` --
  -- must cast to `date` at every use site (both the compute_daily_capacity
  -- calls and the join) or Postgres can't resolve the function/comparison.
  select
    gs.d::date as calendar_date,
    public.compute_daily_capacity(gs.d::date) as computed_max_orders,
    coalesce(pcc.max_orders, public.compute_daily_capacity(gs.d::date)) as effective_max_orders,
    pcc.max_orders is not null as is_override,
    pcc.override_reason,
    pcc.overridden_by,
    pcc.overridden_at,
    pcc.notes
  from generate_series(p_start::timestamp, p_end::timestamp, interval '1 day') gs(d)
  left join public.production_capacity_calendar pcc on pcc.calendar_date = gs.d::date
  order by gs.d;
$$;

-- resolve_hari_d now sources headroom from the computed/override split
-- above instead of the old "no row = unlimited" shortcut.
create or replace function public.resolve_hari_d(p_search_start date default current_date)
returns date
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_date date := p_search_start;
  v_override integer;
  v_effective integer;
  v_committed integer;
  v_attempts integer := 0;
begin
  loop
    v_attempts := v_attempts + 1;
    exit when v_attempts > 90;

    if extract(dow from v_date) = 0 then
      v_date := v_date + 1;
      continue;
    end if;

    select max_orders into v_override
    from public.production_capacity_calendar
    where calendar_date = v_date;

    v_effective := coalesce(v_override, public.compute_daily_capacity(v_date));

    select count(*) into v_committed
    from public.orders
    where hari_d = v_date;

    if v_committed < v_effective then
      return v_date;
    end if;

    v_date := v_date + 1;
  end loop;

  return null;
end;
$$;

grant execute on function public.get_capacity_calendar(date, date) to authenticated;
grant execute on function public.set_capacity_calendar_day(date, integer, text, text) to authenticated;
