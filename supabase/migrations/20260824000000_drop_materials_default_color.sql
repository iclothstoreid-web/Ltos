-- Material Color Architecture Fix — materials.default_color was a
-- pre-Material-Colors free-text color field, added by
-- 20260807000000_add_material_master_fields.sql. No UI has written to it
-- since Material Color moved to the material_colors bridge table
-- (20260821000000_add_dna_color_repository.sql), and it holds zero non-null
-- rows in production, so this drops it outright rather than migrating dead
-- data. Color for a Material now lives exclusively in material_colors.
alter table public.materials
  drop column if exists default_color;

-- Same cleanup for the other dead pre-Material-Colors color field: a
-- 'warna' key some 'bahan' design_master_options rows still carry in their
-- free-form metadata (comma-joined names, e.g. "Black,Navy"). Only one row
-- has it in production and it isn't linked to any materials row
-- (material_id is null), so there is no material_colors target to migrate
-- it into — just drop the dead key. See MATERIAL_LEGACY_WARNA_KEY in
-- src/lib/design/masterData.ts for the UI-side reservation that keeps it
-- from ever being re-written.
update public.design_master_options
set metadata = metadata - 'warna'
where category = 'bahan' and metadata ? 'warna';
