-- LTOS Architecture Lock: DNA Color Repository + Material Color Mapping.
--
-- Splits AI color knowledge (DNA Color) from operational supplier-color
-- mapping (Material Color). Today color only exists as design_master_options
-- rows in category 'warna_bahan' (metadata.hex/metadata.color_family), and
-- the 'bahan' category references chosen colors by joining color NAMES as a
-- comma string (metadata.warna) -- no id-based link, no supplier code, and a
-- second fabric sharing a color would duplicate it rather than reference one
-- shared record.
--
-- 'warna_bahan' is NOT removed as a design_master_options category -- doing
-- so would strip color of the ai_dna/render_recipe/DNA Resolver machinery
-- every other renderable component already has. Instead each dna_colors row
-- gets exactly one mirrored design_master_options row (a 1:1 technical
-- handle for the render pipeline, not the forbidden per-material
-- duplication), linked via the new dna_color_id column. Application code
-- (src/lib/design/dnaColors.ts) keeps the mirror in sync going forward; this
-- migration only backfills the 5 rows that exist today.

create table if not exists public.dna_colors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  family text,
  character text,
  prompt text,
  reference_image text,
  rgb text,
  hex text,
  lab text,
  hsv text,
  version integer not null default 1,
  status text not null default 'draft' check (status = any (array['draft', 'active', 'archived'])),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.design_master_options
  add column if not exists dna_color_id uuid references public.dna_colors(id);

-- Material Color: bridge table. Material = existing `materials` (Inventory
-- Material Master, article-level: Twill/Oxford/Lorenzo). One row per
-- material+color combination actually stocked, carrying the supplier's own
-- code for that combination -- Purchase/PO flow (not built in this repo
-- yet) would read supplier_color_code, never dna_colors directly.
create table if not exists public.material_colors (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id),
  dna_color_id uuid not null references public.dna_colors(id),
  supplier_color_code text not null,
  supplier_color_name text,
  is_active boolean not null default true,
  stock numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (material_id, dna_color_id)
);

create index if not exists material_colors_material_id_idx on public.material_colors(material_id);
create index if not exists material_colors_dna_color_id_idx on public.material_colors(dna_color_id);

alter table public.dna_colors enable row level security;
alter table public.material_colors enable row level security;

-- Same staff-read / admin-owner-write shape as `materials` (20260720000000).
create policy "Staff can read dna colors"
  on public.dna_colors for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );

create policy "Admin or owner can create dna colors"
  on public.dna_colors for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Admin or owner can update dna colors"
  on public.dna_colors for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Staff can read material colors"
  on public.material_colors for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );

create policy "Admin or owner can create material colors"
  on public.material_colors for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Admin or owner can update material colors"
  on public.material_colors for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

-- Backfill: one dna_colors row per existing warna_bahan option, status
-- 'active' (already in production use), slug derived from name. Then link
-- each original row back via dna_color_id -- no deletes, no data loss.
insert into public.dna_colors (name, slug, family, hex, status)
select
  name,
  lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g')),
  metadata ->> 'color_family',
  metadata ->> 'hex',
  'active'
from public.design_master_options
where category = 'warna_bahan'
on conflict (slug) do nothing;

update public.design_master_options dmo
set dna_color_id = dc.id
from public.dna_colors dc
where dmo.category = 'warna_bahan'
  and dmo.dna_color_id is null
  and dc.name = dmo.name;
