-- Inventory App sprint: LTOS has never had a material/stock table (see
-- reserveInventory()'s "not implemented" stub in src/lib/order/inventory.ts
-- and FabricSelector's "Stok belum terhubung" badge). This adds the
-- Inventory workspace's schema: a fixed catalog of categories, the items
-- inside them (with generated Available = Physical - Reserved, per the
-- brief's locked formula), and an append-only stock ledger backing
-- "Riwayat Stok". All stock-changing writes go through the three
-- SECURITY DEFINER functions below — direct table UPDATE only ever touches
-- descriptive columns (name/price/location/etc), never physical_stock or
-- reserved_stock, so "Inventory is the only Workspace allowed to change
-- stock" is enforced by grants, not just convention.

create table if not exists public.material_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.material_categories(id),
  name text not null,
  sku text unique,
  unit text not null default 'pcs',
  price numeric not null default 0,
  physical_stock numeric not null default 0,
  reserved_stock numeric not null default 0,
  available_stock numeric generated always as (physical_stock - reserved_stock) stored,
  min_stock numeric not null default 0,
  photo_url text,
  location text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists materials_category_id_idx on public.materials(category_id);

-- Append-only ledger — every physical/reserved stock change is recorded
-- here, whichever of the three functions below made it. This is what
-- "Riwayat Stok" reads, and what a future low-stock report can be derived
-- from without touching `materials` at all.
create table if not exists public.material_stock_movements (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id),
  movement_type text not null check (movement_type = any (array[
    'stock_in', 'stock_out', 'reservation', 'release', 'adjustment'
  ])),
  quantity numeric not null,
  order_id uuid references public.orders(id),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists material_stock_movements_material_id_idx on public.material_stock_movements(material_id);
create index if not exists material_stock_movements_order_id_idx on public.material_stock_movements(order_id);

-- Optional link so Design Studio can eventually join live stock by id
-- instead of matching on name — additive, does not touch the locked
-- category CHECK constraint documented in src/lib/design/masterData.ts.
alter table public.design_master_options
  add column if not exists material_id uuid references public.materials(id);

alter table public.material_categories enable row level security;
alter table public.materials enable row level security;
alter table public.material_stock_movements enable row level security;

-- Categories: Inventory workspace (admin/owner) only — Fitter never
-- browses the catalog directly, only reads material stock by name.
create policy "Admin or owner can read material categories"
  on public.material_categories for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Admin or owner can create material categories"
  on public.material_categories for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

-- Materials: readable by all staff (admin/owner run the Inventory
-- workspace, artisan reads it for the Fitter material picker's live
-- stock badge, per the brief's "Fitter hanya READ" rule). Direct UPDATE
-- is column-restricted below to descriptive fields only — physical_stock/
-- reserved_stock only ever change via the SECURITY DEFINER functions.
create policy "Staff can read materials"
  on public.materials for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );

create policy "Admin or owner can create materials"
  on public.materials for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Admin or owner can update materials"
  on public.materials for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

revoke update on public.materials from authenticated;
grant update (name, sku, unit, price, min_stock, photo_url, location, category_id, is_active, updated_at)
  on public.materials to authenticated;

-- Stock ledger: Inventory workspace only reads it (Riwayat Stok); nobody
-- inserts into it directly, only the SECURITY DEFINER functions below
-- (which run as the function owner and bypass RLS/grants entirely).
create policy "Admin or owner can read stock movements"
  on public.material_stock_movements for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

insert into public.material_categories (name, sort_order) values
  ('Bahan', 1),
  ('Benang', 2),
  ('Kain Keras', 3),
  ('Tricot', 4),
  ('Furing', 5),
  ('Sleting', 6),
  ('Aksesoris', 7),
  ('Minyak Mesin', 8),
  ('ATK', 9)
on conflict (name) do nothing;

insert into storage.buckets (id, name, public)
values ('material-photos', 'material-photos', true)
on conflict (id) do nothing;

create policy "Staff can read material photos"
  on storage.objects for select
  using (bucket_id = 'material-photos');

create policy "Admin or owner can upload material photos"
  on storage.objects for insert
  with check (
    bucket_id = 'material-photos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Admin or owner can update material photos"
  on storage.objects for update
  using (
    bucket_id = 'material-photos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

-- Stock Masuk / Stock Keluar / Adjustment — the only path that ever moves
-- physical_stock. Explicit role check inside (not just relying on the
-- revoked-UPDATE grant above) since SECURITY DEFINER bypasses RLS/grants.
-- Emits `inventory.low_stock` on business_events when Available crosses at
-- or below Minimum Stock, per the brief's LOW STOCK rule — Command Center
-- and the WhatsApp-to-Finance stub both read that event.
create or replace function public.inventory_adjust_stock(
  p_material_id uuid,
  p_movement_type text,
  p_quantity numeric,
  p_notes text default null
)
returns public.materials
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_delta numeric;
  v_material public.materials;
begin
  select role into v_role from public.profiles where id = auth.uid();
  if v_role is null or v_role not in ('admin', 'owner') then
    raise exception 'Not authorized to adjust stock';
  end if;

  if p_movement_type not in ('stock_in', 'stock_out', 'adjustment') then
    raise exception 'Invalid movement_type for inventory_adjust_stock: %', p_movement_type;
  end if;

  v_delta := case when p_movement_type = 'stock_out' then -p_quantity else p_quantity end;

  update public.materials
  set physical_stock = physical_stock + v_delta,
      updated_at = now()
  where id = p_material_id
  returning * into v_material;

  if v_material.id is null then
    raise exception 'Material not found: %', p_material_id;
  end if;

  insert into public.material_stock_movements (material_id, movement_type, quantity, notes, created_by)
  values (p_material_id, p_movement_type, p_quantity, p_notes, auth.uid());

  if v_material.available_stock <= v_material.min_stock then
    insert into public.business_events (event_type, event_data, created_by)
    values (
      'inventory.low_stock',
      jsonb_build_object(
        'material_id', v_material.id,
        'name', v_material.name,
        'available_stock', v_material.available_stock,
        'min_stock', v_material.min_stock
      ),
      auth.uid()
    );
  end if;

  return v_material;
end;
$$;

revoke all on function public.inventory_adjust_stock(uuid, text, numeric, text) from public;
grant execute on function public.inventory_adjust_stock(uuid, text, numeric, text) to authenticated;

-- Material Reservation — called from Fitter's Create Order flow
-- (src/lib/order/createOrder.ts, authenticated artisan/admin/owner
-- session). Matches by name (best-effort: an unmatched fabric/color must
-- never block order creation, so this returns null rather than raising).
-- Does not touch physical_stock, only reserved_stock, per the brief's
-- "Belum keluar gudang. Belum mengurangi Stock Fisik." rule.
create or replace function public.reserve_material_for_order(
  p_order_id uuid,
  p_material_name text,
  p_quantity numeric
)
returns public.materials
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_material public.materials;
begin
  select role into v_role from public.profiles where id = auth.uid();
  if v_role is null or v_role not in ('admin', 'owner', 'artisan') then
    raise exception 'Not authorized to reserve material';
  end if;

  select * into v_material
  from public.materials
  where lower(name) = lower(p_material_name) and is_active
  limit 1;

  if v_material.id is null then
    return null;
  end if;

  update public.materials
  set reserved_stock = reserved_stock + p_quantity,
      updated_at = now()
  where id = v_material.id
  returning * into v_material;

  insert into public.material_stock_movements (material_id, movement_type, quantity, order_id, created_by)
  values (v_material.id, 'reservation', p_quantity, p_order_id, auth.uid());

  return v_material;
end;
$$;

revoke all on function public.reserve_material_for_order(uuid, text, numeric) from public;
grant execute on function public.reserve_material_for_order(uuid, text, numeric) to authenticated;

-- Release Reservation — called from the Production kiosk (no login
-- session, same reasoning as complete_stage in src/lib/production/client.ts)
-- right after "Persiapan Material" (the brief's "Persiapan Barang") is
-- marked selesai. Zeroes out this order's open reservations and deducts
-- the same quantity from physical_stock, per the brief's example:
-- Physical 20 / Reserved 2.8 -> Physical 17.2 / Reserved 0.
create or replace function public.release_material_reservation(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_material public.materials;
begin
  for r in
    select material_id, sum(quantity) as qty
    from public.material_stock_movements
    where order_id = p_order_id and movement_type = 'reservation'
    group by material_id
    having sum(quantity) > coalesce((
      select sum(quantity) from public.material_stock_movements
      where order_id = p_order_id and movement_type = 'release' and material_id = material_stock_movements.material_id
    ), 0)
  loop
    update public.materials
    set reserved_stock = greatest(reserved_stock - r.qty, 0),
        physical_stock = greatest(physical_stock - r.qty, 0),
        updated_at = now()
    where id = r.material_id
    returning * into v_material;

    insert into public.material_stock_movements (material_id, movement_type, quantity, order_id)
    values (r.material_id, 'release', r.qty, p_order_id);

    if v_material.available_stock <= v_material.min_stock then
      insert into public.business_events (event_type, event_data)
      values (
        'inventory.low_stock',
        jsonb_build_object(
          'material_id', v_material.id,
          'name', v_material.name,
          'available_stock', v_material.available_stock,
          'min_stock', v_material.min_stock
        )
      );
    end if;
  end loop;
end;
$$;

revoke all on function public.release_material_reservation(uuid) from public;
grant execute on function public.release_material_reservation(uuid) to anon, authenticated;
