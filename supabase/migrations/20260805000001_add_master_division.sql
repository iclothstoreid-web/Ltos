-- Master Division: the divisi picklist (previously hardcoded as
-- OPERATOR_DIVISI_OPTIONS = the 8 production stage labels + 'Fitting' in
-- src/lib/production/stageConfig.ts) becomes real master data. This only
-- covers the OPERATOR's divisi attribute (Operator Management, Production
-- App's "pilih operator" divisi picker) -- it does NOT touch the locked
-- per-stage auto-derived "Divisi: <stage label>" text shown while a stage
-- is in progress (STAGE_LABELS/DIVISION_OPTIONS/DivisionSelect.tsx stay
-- exactly as-is; that's locked production workflow, out of scope per
-- brief). production_operators.divisi stays a plain text column (no FK) --
-- same snapshot-style tolerance as every other free-text field in this
-- app; deactivating a division must never orphan/break an operator who
-- already has that divisi name.

create table public.master_divisions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.master_divisions enable row level security;

-- All staff can read (mirrors production_operators' "All staff can read
-- operators" policy) -- writes are RPC-only (role-checked in-function),
-- same as every Sprint K master-data write, so no INSERT/UPDATE policy is
-- needed here.
create policy "All staff can read divisions"
  on public.master_divisions for select
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()));

-- Seed with the exact same 9 values/order OPERATOR_DIVISI_OPTIONS produced
-- (8 stage labels, in STAGE_ORDER, then Fitting) -- preserves current
-- dropdown behavior exactly, per "tanpa mengubah perilaku aplikasi".
insert into public.master_divisions (name, sort_order) values
  ('Persiapan Material', 0),
  ('Formulasi Pola', 1),
  ('Pemotongan Kain', 2),
  ('Penjahitan', 3),
  ('Pemeriksaan Kualitas', 4),
  ('Finishing', 5),
  ('Packing', 6),
  ('Pengiriman', 7),
  ('Fitting', 8);

-- Read for every dropdown, including the no-login Production kiosk's
-- inline "+ Tambah operator baru" divisi picker -- same anon-grantable
-- SECURITY DEFINER pattern as search_operators/list_active_operators.
create or replace function public.get_active_divisions()
returns setof master_divisions
language sql
security definer
set search_path to 'public'
as $$
  select * from public.master_divisions
  where is_active = true
  order by sort_order;
$$;

-- Admin CRUD list (Master Division page) -- every row, active or not.
create or replace function public.list_all_divisions()
returns setof master_divisions
language sql
security definer
set search_path to 'public'
as $$
  select * from public.master_divisions
  order by sort_order;
$$;

create or replace function public.create_division(p_name text)
returns master_divisions
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.master_divisions;
  v_next_sort integer;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat menambah Divisi.';
  end if;

  select coalesce(max(sort_order), -1) + 1 into v_next_sort from public.master_divisions;

  insert into public.master_divisions (name, sort_order)
  values (trim(p_name), v_next_sort)
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.update_division(p_division_id uuid, p_name text)
returns master_divisions
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.master_divisions;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengubah Divisi.';
  end if;

  update public.master_divisions
  set name = trim(p_name), updated_at = now()
  where id = p_division_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Divisi tidak ditemukan.';
  end if;

  return v_row;
end;
$$;

-- Nonaktifkan (and its symmetric reaktivasi) -- never a DELETE, matching
-- every other soft-delete in this app (production_operators.status,
-- design_master_options.is_active).
create or replace function public.set_division_active(p_division_id uuid, p_is_active boolean)
returns master_divisions
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.master_divisions;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengubah status Divisi.';
  end if;

  update public.master_divisions
  set is_active = p_is_active, updated_at = now()
  where id = p_division_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Divisi tidak ditemukan.';
  end if;

  return v_row;
end;
$$;

-- "Atur urutan tampilan" -- swaps two rows' sort_order, same one-step-at-a-
-- time reorder UX as swapMasterDataOptionOrder (src/lib/design/masterData.ts)
-- for Design Master, done here via RPC since master_divisions has no direct
-- client UPDATE policy (unlike design_master_options).
create or replace function public.swap_division_order(p_division_id_a uuid, p_division_id_b uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_sort_a integer;
  v_sort_b integer;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengubah urutan Divisi.';
  end if;

  select sort_order into v_sort_a from public.master_divisions where id = p_division_id_a;
  select sort_order into v_sort_b from public.master_divisions where id = p_division_id_b;

  if v_sort_a is null or v_sort_b is null then
    raise exception 'Divisi tidak ditemukan.';
  end if;

  update public.master_divisions set sort_order = v_sort_b, updated_at = now() where id = p_division_id_a;
  update public.master_divisions set sort_order = v_sort_a, updated_at = now() where id = p_division_id_b;
end;
$$;

grant execute on function public.get_active_divisions() to authenticated, anon;
grant execute on function public.list_all_divisions() to authenticated;
grant execute on function public.create_division(text) to authenticated;
grant execute on function public.update_division(uuid, text) to authenticated;
grant execute on function public.set_division_active(uuid, boolean) to authenticated;
grant execute on function public.swap_division_order(uuid, uuid) to authenticated;
