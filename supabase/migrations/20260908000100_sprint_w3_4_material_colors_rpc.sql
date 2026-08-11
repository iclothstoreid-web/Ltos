-- Sprint W3-4 (DNA Color + Design Studio Integration) — public read surface
-- for a material's colors. `material_colors` and `dna_colors` are both
-- staff-only under RLS ("Staff can read ..."), same original pattern
-- `materials` had before W3-1 — untouched here, per "JANGAN mengubah DNA
-- Color system". This is a new, additive, narrowly-scoped SECURITY
-- DEFINER RPC (same established pattern as list_fabric_catalog /
-- list_active_design_master_options), not an RLS change.
--
-- Column allowlist deliberately excludes:
--   - supplier_color_code / supplier_color_name / stock (material_colors)
--     -- internal supplier/inventory detail, same reasoning list_fabric_
--     catalog() already applies to materials' own price/stock/supplier.
--   - prompt / lab / hsv (dna_colors) -- `prompt` is the literal AI
--     render-pipeline instruction fragment, not customer-facing copy; the
--     brief's "color character / prompt text" example ("Navy — Deep,
--     elegant, authoritative") reads as `character`, the column already
--     meant for display, not the internal `prompt` field. lab/hsv are
--     extra colorimetric formats the brief never asks the UI to show.
--
-- Scoped to materials.published = true so color data can never be probed
-- for a material that isn't itself publicly visible yet.
-- "character" is a reserved SQL type keyword — must be quoted wherever it
-- appears as an identifier (both here and in the SELECT list below).
create or replace function public.list_material_colors(p_material_id uuid)
returns table (
  id uuid,
  dna_color_id uuid,
  name text,
  slug text,
  hex text,
  rgb text,
  family text,
  "character" text,
  reference_image text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    mc.id, mc.dna_color_id, dc.name, dc.slug, dc.hex, dc.rgb, dc.family,
    dc."character", dc.reference_image
  from public.material_colors mc
  join public.dna_colors dc on dc.id = mc.dna_color_id
  where mc.material_id = p_material_id
    and mc.is_active = true
    and dc.status = 'active'
    and exists (
      select 1 from public.materials m
      where m.id = p_material_id and m.published = true
    )
  order by dc.name asc;
$$;

revoke all on function public.list_material_colors(uuid) from public;
grant execute on function public.list_material_colors(uuid) to anon, authenticated;

-- Sprint W3-4 §10 — Color-aware Related Materials. Returns the published
-- materials that also carry a given DNA Color, so getRelatedMaterials()
-- can boost materials sharing the currently-viewed material's selected
-- color without an N-query fan-out per candidate.
create or replace function public.list_material_ids_for_color(p_dna_color_id uuid)
returns table (material_id uuid)
language sql
security definer
set search_path = public
stable
as $$
  select distinct mc.material_id
  from public.material_colors mc
  join public.dna_colors dc on dc.id = mc.dna_color_id
  join public.materials m on m.id = mc.material_id
  where mc.dna_color_id = p_dna_color_id
    and mc.is_active = true
    and dc.status = 'active'
    and m.published = true;
$$;

revoke all on function public.list_material_ids_for_color(uuid) from public;
grant execute on function public.list_material_ids_for_color(uuid) to anon, authenticated;
