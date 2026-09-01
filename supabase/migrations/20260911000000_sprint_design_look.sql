-- Sprint Design Look — a curated whole-garment PRESET / inspiration layer.
--
-- A Design Look is NOT a base model (model_thobe stays Najd/Zayed/Sadu/Safa/
-- Rayyan/Mizan). It is a stored visual combination: a photo, customer-facing
-- copy, and a mapping of only the design components that can actually be
-- proven from its reference image. Picking a Look pre-fills exactly those
-- pilihan and nothing else — every one stays freely changeable afterwards.
--
-- It reuses design_master_options purely for its catalog shape (name,
-- photo_url, selling_points, metadata, sort_order, is_active) and the
-- existing Master Data admin / Gallery plumbing. It is the one category that
-- is deliberately NOT a Design Studio pilihan field (no slot in
-- DesignSelections / DesignConfig / CATEGORY_BY_FIELD). See
-- src/lib/design/designLooks.ts.
--
-- The component mapping lives in metadata jsonb under flat `look_*` keys
-- (readable in the existing key=value admin editor):
--   look_model, look_lookCutting, look_fabric, look_color, look_collar,
--   look_cuff, look_plaket, look_pocket, look_button, look_embroidery,
--   look_handmadeZigzag   -> value is the master-data option NAME
--   tagline               -> one-line card subtitle
--   featured              -> "true" to surface in the homepage teaser

-- 1 ── Extend the category allowlist (the one sanctioned way to add a
--      category — there is no "+ Kategori Baru" UI).
alter table public.design_master_options
  drop constraint design_master_options_category_check;

alter table public.design_master_options
  add constraint design_master_options_category_check
  check (category = any (array[
    'model_thobe','look_cutting','kerah','manset','plaket','saku',
    'bahan','warna_bahan','aksesori','bordir','handmade_zigzag','design_look'
  ]));

-- 2 ── Public read surface for anonymous /design-studio + homepage visitors.
--
--      SECURITY DEFINER is REQUIRED here, and verified — not cargo-culted:
--      design_master_options' only SELECT policy ("All staff can read design
--      master options") requires an authenticated staff auth.uid(), so anon
--      cannot read the table at all. And the table carries columns that must
--      never reach anon (internal_notes, ai_dna, render_recipe,
--      construction_type). A SECURITY INVOKER function would need a
--      table-wide anon SELECT policy, which would expose every one of those
--      columns for design_look rows through the PostgREST REST API. This
--      function instead runs as owner with a hard column allowlist — the
--      same audited pattern as list_active_design_master_options() and
--      list_fabric_catalog(). No RLS change; zero REST exposure. metadata is
--      included because a design_look row's metadata only ever holds the
--      intended public keys above (tagline / featured / look_*).
create or replace function public.list_active_design_looks()
returns table (
  id uuid,
  name text,
  photo_url text,
  selling_points jsonb,
  sort_order integer,
  metadata jsonb
)
language sql
security definer
set search_path = public
stable
as $$
  select o.id, o.name, o.photo_url, o.selling_points, o.sort_order, o.metadata
  from public.design_master_options o
  where o.category = 'design_look' and o.is_active = true
  order by o.sort_order;
$$;

revoke all on function public.list_active_design_looks() from public;
grant execute on function public.list_active_design_looks() to anon, authenticated;
