-- Sprint K: Operator Management (CRUD, Divisi, Aktif/Libur/Cuti/Nonaktif, Soft Delete)
--
-- production_operators gains `divisi` (free text, matches DIVISION_OPTIONS in
-- src/lib/production/stageConfig.ts) and `status` (aktif/libur/cuti/nonaktif).
-- `is_active` (already read by every existing RPC: search_operators,
-- list_active_operators, get_operator_capacity, get_operator_performance's
-- callers, etc.) is kept in sync with `status` via trigger so none of that
-- existing capacity/KPI logic needs to be touched or duplicated — an
-- operator marked Libur/Cuti/Nonaktif simply stops counting as available
-- capacity everywhere it already mattered. Hard delete is forbidden; a
-- soft_delete just forces status='nonaktif' and stamps deleted_at.

alter table public.production_operators
  add column if not exists divisi text,
  add column if not exists status text not null default 'aktif',
  add column if not exists deleted_at timestamptz;

alter table public.production_operators
  add constraint production_operators_status_check
  check (status in ('aktif', 'libur', 'cuti', 'nonaktif'));

update public.production_operators
  set status = case when is_active then 'aktif' else 'nonaktif' end
  where status = 'aktif' and is_active = false;

create or replace function public.sync_operator_is_active()
returns trigger
language plpgsql
as $$
begin
  new.is_active := (new.status = 'aktif' and new.deleted_at is null);
  return new;
end;
$$;

drop trigger if exists trg_sync_operator_is_active on public.production_operators;
create trigger trg_sync_operator_is_active
  before insert or update on public.production_operators
  for each row execute function public.sync_operator_is_active();

-- Re-run the sync once more now that the trigger exists, so existing rows'
-- is_active reflects the backfilled status exactly.
update public.production_operators set status = status;

-- search_operators / upsert_operator / list_active_operators gain an
-- optional p_divisi filter (default null = unchanged behavior) so existing
-- callers (OperatorAutocomplete, AssignOperatorModal) keep working
-- untouched while new callers can filter by divisi.
create or replace function public.search_operators(p_query text, p_divisi text default null)
returns setof production_operators
language sql
security definer
set search_path to 'public'
as $$
  select * from public.production_operators
  where is_active = true
    and nama ilike '%' || p_query || '%'
    and (p_divisi is null or divisi = p_divisi)
  order by nama
  limit 10;
$$;

create or replace function public.upsert_operator(p_nama text, p_divisi text default null)
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

  insert into public.production_operators (nama, divisi) values (v_clean, p_divisi)
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.list_active_operators(p_divisi text default null)
returns setof production_operators
language sql
security definer
set search_path to 'public'
as $$
  select * from public.production_operators
  where is_active = true
    and (p_divisi is null or divisi = p_divisi)
  order by nama;
$$;

-- Admin CRUD list — every non-deleted operator regardless of status, for
-- the new Operator Management page. Distinct from list_active_operators
-- (aktif only, used by kiosk pickers).
create or replace function public.list_all_operators()
returns setof production_operators
language sql
security definer
set search_path to 'public'
as $$
  select * from public.production_operators
  where deleted_at is null
  order by nama;
$$;

create or replace function public.create_operator(p_nama text, p_divisi text default null)
returns production_operators
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.production_operators;
begin
  insert into public.production_operators (nama, divisi)
  values (trim(p_nama), p_divisi)
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.update_operator(p_operator_id uuid, p_nama text, p_divisi text)
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
  set nama = trim(p_nama), divisi = p_divisi
  where id = p_operator_id and deleted_at is null
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Operator tidak ditemukan.';
  end if;

  return v_row;
end;
$$;

create or replace function public.set_operator_status(p_operator_id uuid, p_status text)
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
    raise exception 'Hanya Admin/Owner yang dapat mengubah status operator.';
  end if;

  if p_status not in ('aktif', 'libur', 'cuti', 'nonaktif') then
    raise exception 'Status tidak valid: %', p_status;
  end if;

  update public.production_operators
  set status = p_status
  where id = p_operator_id and deleted_at is null
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Operator tidak ditemukan.';
  end if;

  return v_row;
end;
$$;

-- RULE "Jangan hard delete operator. Gunakan soft delete." — this never
-- issues a DELETE; it only stamps deleted_at and forces status='nonaktif'
-- (which the sync trigger also turns into is_active=false), so the
-- operator's whole history (production_stage_records, consultations)
-- stays intact and queryable.
create or replace function public.soft_delete_operator(p_operator_id uuid)
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
    raise exception 'Hanya Admin/Owner yang dapat menghapus operator.';
  end if;

  update public.production_operators
  set status = 'nonaktif', deleted_at = now()
  where id = p_operator_id;
end;
$$;

grant execute on function public.search_operators(text, text) to authenticated, anon;
grant execute on function public.upsert_operator(text, text) to authenticated, anon;
grant execute on function public.list_active_operators(text) to authenticated, anon;
grant execute on function public.list_all_operators() to authenticated, anon;
grant execute on function public.create_operator(text, text) to authenticated, anon;
grant execute on function public.update_operator(uuid, text, text) to authenticated, anon;
grant execute on function public.set_operator_status(uuid, text) to authenticated, anon;
grant execute on function public.soft_delete_operator(uuid) to authenticated, anon;
