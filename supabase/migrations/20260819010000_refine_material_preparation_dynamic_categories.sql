-- Sprint: Refinement Material Preparation & Inventory Engine (Post Implementation)
--
-- Two problems in the previous sprint's implementation, per the refinement
-- brief:
--
-- 1. Persiapan Bahan hardcoded 9 named line items (Material, Benang, 3x
--    Sleting, 4x Interlining) as a TypeScript union + a DB check constraint.
--    Adding a new accessory type (Button/Label/Patch/Elastic/...) required a
--    code change + migration. This migration drops that fixed vocabulary in
--    favor of querying `materials`/`material_categories` (already existing,
--    already Owner-CRUD-able per 20260816000000_sprint_l_material_category_crud.sql)
--    by category, so a brand new category Owner adds in Inventory shows up
--    in Persiapan Bahan immediately, no deploy needed.
--
-- 2. Two independent code paths (`inventory_adjust_stock` for Owner's manual
--    Stock Masuk/Keluar/Adjustment, and `save_material_preparation` for
--    Production's consumption) each hand-rolled their own
--    "update physical_stock + insert ledger row + maybe fire inventory.low_stock"
--    logic. Consolidated into one internal engine function,
--    `_inventory_apply_movement()`, that both now call — there is exactly one
--    place left that ever writes `materials.physical_stock` or inserts into
--    `material_stock_movements`.
--
-- Nothing here changes the locked workflow (Fitter specs -> QR -> Production
-- Persiapan Bahan -> Reserve Material -> Inventory -> Design Studio reads
-- live stock) or the business rule (Production is the only inventory
-- consumer). materials/material_categories/material_stock_movements schemas
-- are untouched (no new master table, per the brief) — only
-- material_preparation_items (introduced last sprint, so safe to reshape)
-- gains category_id/category_name in place of the fixed item_key enum.

-- ============================================================
-- 1. Single Inventory Write Path — internal engine
-- ============================================================

-- Not granted to anon/authenticated (see revoke below) — this is an internal
-- helper, only ever called from other SECURITY DEFINER functions in this
-- schema (inventory_adjust_stock, save_material_preparation, and, when it's
-- built, a future return_material RPC — see note at the bottom of this
-- file). Centralizing here means the physical_stock delta, the ledger
-- insert, and the inventory.low_stock event are each written in exactly one
-- place, instead of being copy-pasted per caller.
create or replace function public._inventory_apply_movement(
  p_material_id uuid,
  p_movement_type text,
  p_quantity numeric,
  p_order_id uuid,
  p_notes text,
  p_actor uuid
)
returns public.materials
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_delta numeric;
  v_material public.materials;
begin
  if p_movement_type not in ('stock_in', 'stock_out', 'reservation', 'release', 'adjustment') then
    raise exception 'Invalid movement_type: %', p_movement_type;
  end if;

  -- 'adjustment' carries its own sign via p_quantity (positive = correction
  -- upward, e.g. a Persiapan Bahan reversal putting material back; negative
  -- = correction downward) -- every other type's direction is fixed.
  v_delta := case
    when p_movement_type = 'stock_out' then -p_quantity
    when p_movement_type = 'adjustment' then p_quantity
    else p_quantity
  end;

  update public.materials
  set physical_stock = greatest(physical_stock + v_delta, 0),
      updated_at = now()
  where id = p_material_id
  returning * into v_material;

  if v_material.id is null then
    raise exception 'Material not found: %', p_material_id;
  end if;

  insert into public.material_stock_movements (material_id, movement_type, quantity, order_id, notes, created_by)
  values (p_material_id, p_movement_type, abs(p_quantity), p_order_id, p_notes, p_actor);

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
      p_actor
    );
  end if;

  return v_material;
end;
$$;

revoke all on function public._inventory_apply_movement(uuid, text, numeric, uuid, text, uuid) from public;
comment on function public._inventory_apply_movement is
  'Internal-only inventory write engine -- not exposed to anon/authenticated. Every physical_stock mutation in this app goes through here: Owner manual Stock Masuk/Keluar/Adjustment (inventory_adjust_stock) and Production consumption (save_material_preparation) are both thin, role-checked wrappers around this one function.';

-- Owner/Admin's manual Stock Masuk/Keluar/Adjustment -- same role gate and
-- movement_type restriction as before, now delegating the actual mutation.
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
begin
  select role into v_role from public.profiles where id = auth.uid();
  if v_role is null or v_role not in ('admin', 'owner') then
    raise exception 'Not authorized to adjust stock';
  end if;

  if p_movement_type not in ('stock_in', 'stock_out', 'adjustment') then
    raise exception 'Invalid movement_type for inventory_adjust_stock: %', p_movement_type;
  end if;

  return public._inventory_apply_movement(p_material_id, p_movement_type, p_quantity, null, p_notes, auth.uid());
end;
$$;

-- Grant unchanged from the original migration (CREATE OR REPLACE keeps it),
-- restated here only so this file is self-explanatory.
revoke all on function public.inventory_adjust_stock(uuid, text, numeric, text) from public;
grant execute on function public.inventory_adjust_stock(uuid, text, numeric, text) to authenticated;

-- ============================================================
-- 2. Persiapan Bahan -- category-driven instead of a fixed item list
-- ============================================================

alter table public.material_preparation_items
  add column if not exists category_id uuid references public.material_categories(id),
  add column if not exists category_name text;

-- Backfill existing rows (last sprint's fixed item_key values) so nothing
-- saved under the old scheme is orphaned.
update public.material_preparation_items
set category_name = case item_key
      when 'material' then 'Bahan'
      when 'benang' then 'Benang'
      when 'sleting_jepang_50' then 'Sleting'
      when 'sleting_jepang_25' then 'Sleting'
      when 'sleting_jaket' then 'Sleting'
      when 'interlining_shanghai' then 'Kain Keras'
      when 'interlining_kerah' then 'Kain Keras'
      when 'interlining_plaket' then 'Kain Keras'
      when 'interlining_manset' then 'Kain Keras'
    end
where category_name is null;

update public.material_preparation_items mpi
set category_id = c.id
from public.material_categories c
where mpi.category_id is null and c.name = mpi.category_name;

alter table public.material_preparation_items
  drop constraint if exists material_preparation_items_item_key_check;
alter table public.material_preparation_items drop column if exists item_key;
alter table public.material_preparation_items alter column category_id set not null;

create index if not exists material_preparation_items_category_id_idx
  on public.material_preparation_items(category_id);

comment on table public.material_preparation_items is
  'One row per Material Category selected in Persiapan Bahan, per attempt -- category_id/category_name identify which category the row is for (dynamic, driven by material_categories); material_id/material_name are null for an explicit None. Written only by save_material_preparation().';

-- Kiosk-safe catalog read, now also carrying category_id (needed so the
-- card can group by category and echo it back on save) alongside the
-- category_name it already returned. Same anon-safe SECURITY DEFINER shape
-- as before -- direct SELECT on `materials`/`material_categories` stays
-- RLS-blocked for the no-login kiosk session.
create or replace function public.list_material_catalog_for_preparation()
returns jsonb
language sql
security definer
set search_path to 'public'
stable
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', m.id,
    'name', m.name,
    'category_id', c.id,
    'category_name', c.name,
    'unit', m.unit,
    'available_stock', m.available_stock,
    'min_stock', m.min_stock
  ) order by c.sort_order, m.name), '[]'::jsonb)
  from public.materials m
  join public.material_categories c on c.id = m.category_id
  where m.is_active;
$$;

grant execute on function public.list_material_catalog_for_preparation() to anon, authenticated;

-- Persiapan Bahan's single "Reserve Material" action -- now keyed by
-- category_id/category_name instead of a fixed item_key, and every
-- physical_stock change (both the fresh deduction and the reversal of a
-- prior attempt's deduction, so re-saving with a different quantity never
-- double-deducts) goes through _inventory_apply_movement. The reversal uses
-- 'adjustment' (a positive correction) rather than a bare UPDATE, so it
-- leaves the same ledger trail every other stock change does -- previously
-- this reversal silently touched physical_stock with no movement row at
-- all, which is exactly the kind of second, undocumented writer Task 3/4
-- asked to eliminate.
create or replace function public.save_material_preparation(
  p_order_id uuid,
  p_stage_record_id uuid,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_prior record;
  v_item jsonb;
  v_category_id uuid;
  v_category_name text;
  v_material_id uuid;
  v_material_name text;
  v_quantity numeric;
  v_used boolean;
begin
  if not exists (
    select 1 from public.production_stage_records
    where id = p_stage_record_id and order_id = p_order_id and stage = 'material_prep'
  ) then
    raise exception 'Stage record Persiapan Material tidak ditemukan untuk order ini';
  end if;

  for v_prior in
    select material_id, quantity, category_name
    from public.material_preparation_items
    where stage_record_id = p_stage_record_id and used and material_id is not null and quantity is not null
  loop
    perform public._inventory_apply_movement(
      v_prior.material_id, 'adjustment', v_prior.quantity, p_order_id,
      'Persiapan Bahan dibatalkan/diubah: ' || coalesce(v_prior.category_name, ''), null
    );
  end loop;

  delete from public.material_preparation_items where stage_record_id = p_stage_record_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_category_id := (v_item ->> 'category_id')::uuid;
    v_category_name := v_item ->> 'category_name';
    v_material_id := nullif(v_item ->> 'material_id', '')::uuid;
    v_material_name := v_item ->> 'material_name';
    v_quantity := nullif(v_item ->> 'quantity', '')::numeric;
    v_used := coalesce((v_item ->> 'used')::boolean, false);

    insert into public.material_preparation_items (
      order_id, stage_record_id, category_id, category_name, material_id, material_name, quantity, used
    )
    values (
      p_order_id, p_stage_record_id, v_category_id, v_category_name,
      v_material_id, v_material_name, v_quantity, v_used
    );

    if v_used and v_material_id is not null and v_quantity is not null and v_quantity > 0 then
      perform public._inventory_apply_movement(
        v_material_id, 'stock_out', v_quantity, p_order_id,
        'Persiapan Bahan: ' || coalesce(v_category_name, ''), null
      );
    end if;
  end loop;

  return coalesce((
    select jsonb_agg(row_to_json(mpi)::jsonb order by mpi.created_at)
    from public.material_preparation_items mpi
    where mpi.stage_record_id = p_stage_record_id
  ), '[]'::jsonb);
end;
$$;

grant execute on function public.save_material_preparation(uuid, uuid, jsonb) to anon, authenticated;

-- ============================================================
-- Note for V1.1 (Task 5 -- Return Material backlog, NOT implemented here):
--
-- Order Cancel -> Return Material -> Inventory bertambah -> Ledger tercatat
-- is a straightforward addition once needed: a new `return_material_for_order`
-- RPC that calls `_inventory_apply_movement(material_id, 'adjustment',
-- +quantity, order_id, 'Return Material: <reason>', auth.uid())` per item
-- previously consumed for that order (read from material_preparation_items
-- / material_stock_movements where order_id = the cancelled order). The
-- engine already accepts an order_id and an arbitrary positive/negative
-- adjustment, so no schema or engine change is anticipated -- only a new,
-- thin RPC + whatever Order Cancel UI V1.1 designs. Deliberately not built
-- now, per the brief.
-- ============================================================
