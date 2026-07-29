-- Sprint: Pindahkan Konsumsi Inventory ke Production (Persiapan Bahan)
--
-- LOCKED business rule: Inventory hanya boleh berubah dari Production App.
-- Fitter App no longer reserves or consumes inventory -- it only records the
-- material *specification* an order needs (fabric/color snapshot at Create
-- Order, plus the Fitter's manual meter estimate via FabricQuantityField).
-- Production's Persiapan Bahan stage becomes the single place that actually
-- pulls material and reduces stock.
--
-- This retires the old two-step reserve-then-release dance
-- (reserve_material_for_order at Create Order, release_material_reservation
-- at Persiapan Material) -- both are dead code once Fitter stops calling the
-- former (see src/lib/order/inventory.ts removal) and the latter never fires
-- anything real without it. In its place: a single Production-side action,
-- save_material_preparation(), that deducts physical_stock directly for
-- whatever the operator actually reserved, on the same material_stock_movements
-- ledger this app already has (movement_type = 'stock_out', order_id set).
--
-- Old ledger rows with movement_type 'reservation'/'release' stay valid and
-- readable (the check constraint on material_stock_movements is untouched)
-- -- only new inserts of those two types stop happening. No historical
-- physical_stock/reserved_stock value is rewritten by this migration, so
-- existing orders and existing material history keep working unchanged.

drop function if exists public.reserve_material_for_order(uuid, text, numeric);
drop function if exists public.release_material_reservation(uuid);

-- ============================================================
-- Persiapan Bahan -- per-attempt record of what Production picked
-- ============================================================

create table if not exists public.material_preparation_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  stage_record_id uuid not null references public.production_stage_records(id),
  item_key text not null check (item_key = any (array[
    'material', 'benang', 'sleting_jepang_50', 'sleting_jepang_25', 'sleting_jaket',
    'interlining_shanghai', 'interlining_kerah', 'interlining_plaket', 'interlining_manset'
  ])),
  material_id uuid references public.materials(id),
  material_name text,
  quantity numeric,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists material_preparation_items_order_id_idx
  on public.material_preparation_items(order_id);
create index if not exists material_preparation_items_stage_record_id_idx
  on public.material_preparation_items(stage_record_id);

alter table public.material_preparation_items enable row level security;

create policy "Admin or owner can read material preparation items"
  on public.material_preparation_items for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

comment on table public.material_preparation_items is
  'One row per item (Material/Benang/Sleting/Interlining) per Persiapan Bahan attempt -- records what the operator picked, including explicit None (used=false). Written only by save_material_preparation(); the physical_stock deduction it causes is recorded separately on material_stock_movements (movement_type=stock_out, order_id set).';

-- Seed the fixed accessory catalog Persiapan Bahan's card needs (Sleting/
-- Interlining line items) -- these never had a materials row before, so the
-- card would have nothing to match/reserve against otherwise. Guarded by
-- name (materials.name has no unique constraint) so this never creates a
-- duplicate if an admin already added one of these manually.
insert into public.materials (category_id, name, unit)
select c.id, v.name, 'pcs'
from (values
  ('Sleting Jepang 50 cm', 'Sleting'),
  ('Sleting Jepang 25 cm', 'Sleting'),
  ('Sleting Jaket', 'Sleting'),
  ('Interlining Shanghai', 'Kain Keras'),
  ('Interlining Kerah', 'Kain Keras'),
  ('Interlining Plaket', 'Kain Keras'),
  ('Interlining Manset', 'Kain Keras')
) as v(name, category_name)
join public.material_categories c on c.name = v.category_name
where not exists (
  select 1 from public.materials m where lower(m.name) = lower(v.name)
);

-- Kiosk (anon, no login per ADR-011) needs a read path for the Material/
-- Benang dropdowns and the fixed-item stock lookups -- direct table SELECT
-- on `materials` is blocked by its RLS (scoped to authenticated staff roles
-- only), so this mirrors get_production_packet's own SECURITY DEFINER read.
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
    'category_name', c.name,
    'unit', m.unit,
    'available_stock', m.available_stock,
    'min_stock', m.min_stock
  ) order by m.name), '[]'::jsonb)
  from public.materials m
  join public.material_categories c on c.id = m.category_id
  where m.is_active;
$$;

grant execute on function public.list_material_catalog_for_preparation() to anon, authenticated;

-- Persiapan Bahan's single "Reserve Material" action -- the only place left
-- in the app that reduces physical_stock as a consequence of an order
-- (Owner/Admin's manual Stock Masuk/Keluar/Adjustment in Inventory Hub is a
-- separate, untouched management surface, not order-driven). Replaces every
-- item row for this attempt so adjusting a quantity before Setujui and
-- re-saving never double-deducts: this attempt's previous used=true
-- deductions are added back first, the old rows are dropped, then the new
-- selection is applied fresh.
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
  v_material_id uuid;
  v_quantity numeric;
  v_used boolean;
  v_material public.materials;
begin
  if not exists (
    select 1 from public.production_stage_records
    where id = p_stage_record_id and order_id = p_order_id and stage = 'material_prep'
  ) then
    raise exception 'Stage record Persiapan Material tidak ditemukan untuk order ini';
  end if;

  for v_prior in
    select material_id, quantity
    from public.material_preparation_items
    where stage_record_id = p_stage_record_id and used and material_id is not null and quantity is not null
  loop
    update public.materials
    set physical_stock = physical_stock + v_prior.quantity,
        updated_at = now()
    where id = v_prior.material_id;
  end loop;

  delete from public.material_preparation_items where stage_record_id = p_stage_record_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_material_id := nullif(v_item ->> 'material_id', '')::uuid;
    v_quantity := nullif(v_item ->> 'quantity', '')::numeric;
    v_used := coalesce((v_item ->> 'used')::boolean, false);

    insert into public.material_preparation_items (
      order_id, stage_record_id, item_key, material_id, material_name, quantity, used
    )
    values (
      p_order_id, p_stage_record_id, v_item ->> 'item_key',
      v_material_id, v_item ->> 'material_name', v_quantity, v_used
    );

    if v_used and v_material_id is not null and v_quantity is not null and v_quantity > 0 then
      update public.materials
      set physical_stock = greatest(physical_stock - v_quantity, 0),
          updated_at = now()
      where id = v_material_id
      returning * into v_material;

      insert into public.material_stock_movements (material_id, movement_type, quantity, order_id, notes)
      values (v_material_id, 'stock_out', v_quantity, p_order_id, 'Persiapan Bahan: ' || (v_item ->> 'item_key'));

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
-- get_production_packet -- surface fabric quantity estimate + Persiapan
-- Bahan's saved items to the kiosk (CREATE OR REPLACE keeps existing grants)
-- ============================================================

create or replace function public.get_production_packet(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_order record;
  v_snapshot jsonb;
  v_result jsonb;
  v_sla_working_days integer;
  v_queue_status text;
  v_priority_rank integer;
  v_queue_position integer;
begin
  select id, order_number, created_at, service_level, hari_d, current_state into v_order
  from public.orders where id = p_order_id;

  if v_order.id is null then
    return null;
  end if;

  if not exists (select 1 from public.production_stage_records where order_id = p_order_id) then
    insert into public.production_stage_records (order_id, stage, attempt, status)
    values (p_order_id, 'material_prep', 1, 'pending');
  end if;

  select event_data into v_snapshot
  from public.business_events
  where order_id = p_order_id and event_type = 'order.created'
  order by created_at desc
  limit 1;

  if v_order.service_level is not null and v_order.hari_d is not null then
    select working_days into v_sla_working_days
    from public.service_sla_rules where service_level = v_order.service_level;
  end if;

  select queue_status, priority_rank, queue_position
    into v_queue_status, v_priority_rank, v_queue_position
  from public.compute_queue_snapshot()
  where order_id = p_order_id;

  select jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'created_at', v_order.created_at,
    'current_state', v_order.current_state,
    'service_level', v_order.service_level,
    'hari_d', v_order.hari_d,
    'estimated_completion', case
      when v_order.hari_d is not null and v_sla_working_days is not null
        then (public.add_working_days(v_order.hari_d, v_sla_working_days))::timestamptz
      else v_order.created_at + interval '14 days'
    end,
    'queue_status', v_queue_status,
    'priority_level', v_priority_rank,
    'queue_position', v_queue_position,
    'customer_name', v_snapshot -> 'customer' ->> 'name',
    'design', v_snapshot -> 'design',
    'locked_measurements', v_snapshot -> 'measurement',
    'consultation_notes', v_snapshot ->> 'consultationNotes',
    'fabric_quantity_meters', nullif(v_snapshot ->> 'fabricQuantityMeters', '')::numeric,
    'stage_records', coalesce((
      select jsonb_agg(
        (row_to_json(r)::jsonb) || jsonb_build_object('operator_name', po.nama)
        order by r.created_at
      )
      from public.production_stage_records r
      left join public.production_operators po on po.id = r.operator_id
      where r.order_id = p_order_id
    ), '[]'::jsonb),
    'pattern_formulation', (
      select row_to_json(pf) from public.pattern_formulations pf where pf.order_id = p_order_id
    ),
    'material_preparation', coalesce((
      select jsonb_agg(row_to_json(mpi)::jsonb order by mpi.created_at)
      from public.material_preparation_items mpi
      where mpi.order_id = p_order_id
    ), '[]'::jsonb),
    'progress', (
      select round(
        (count(*) filter (where status = 'completed'))::numeric
        / 8.0, 2
      )
      from (
        select distinct on (stage) stage, status
        from public.production_stage_records
        where order_id = p_order_id
        order by stage, attempt desc
      ) latest
    )
  ) into v_result;

  return v_result;
end;
$$;

-- ============================================================
-- Material Detail / Order Detail usage history -- recognize the new direct
-- stock_out-with-order_id consumption as real usage, alongside the legacy
-- reservation/release pair (see src/lib/inventory/materials.ts callers).
-- No SQL change needed here: those two functions aggregate client-side over
-- material_stock_movements and are updated in the same commit as this file.
-- ============================================================
