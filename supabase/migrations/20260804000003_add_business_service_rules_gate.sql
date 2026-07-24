-- Sprint K: Business Rules (Capacity Calendar) + Service Rules (SLA) pages
-- are the first ever frontend callers of set_capacity_calendar_day() and
-- set_service_sla_rule() (both shipped Sprint B/C with no UI, confirmed
-- zero callers). Neither had a role check — safe while unreachable, not
-- once a real page calls them. Add the same admin/owner gate every other
-- write RPC in this app already uses, nothing else about their behavior
-- changes.

create or replace function public.set_capacity_calendar_day(p_date date, p_max_orders integer, p_notes text default null)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
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

  insert into public.production_capacity_calendar (calendar_date, max_orders, notes)
  values (p_date, p_max_orders, p_notes)
  on conflict (calendar_date) do update
    set max_orders = excluded.max_orders,
        notes = excluded.notes,
        updated_at = now();
end;
$$;

create or replace function public.set_service_sla_rule(p_service_level text, p_working_days integer)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengatur Service Rules (SLA).';
  end if;

  if p_working_days <= 0 then
    raise exception 'working_days must be > 0';
  end if;

  update public.service_sla_rules
  set working_days = p_working_days, updated_at = now()
  where service_level = p_service_level;

  if not found then
    raise exception 'Unknown service_level: %', p_service_level;
  end if;
end;
$$;
