-- Sprint W3-4 — fixes a pre-existing bug discovered while building Design
-- Studio deep-linking, unrelated to DNA Color itself but a hard blocker for
-- it: the public /design-studio configurator's catalog endpoint
-- (GET /api/design/options -> getConfiguratorCatalog() ->
-- fetchActiveMasterOptions()) reads design_master_options with a plain
-- anonymous-context client, but that table's only SELECT policy
-- ("All staff can read design master options") requires
-- `exists (select 1 from profiles where profiles.id = auth.uid())` --
-- always false for an anonymous visitor. Verified live: curl against the
-- deployed /api/design/options returns every field as an empty array.
-- Sprint W2 shipped a public configurator whose catalog has been silently
-- empty for every real customer since.
--
-- Fix follows this project's own established pattern (list_fabric_catalog,
-- W3-1) instead of loosening RLS directly: RLS stays untouched (Design
-- Studio's own staff-authenticated reads are completely unaffected), and a
-- new SECURITY DEFINER RPC exposes only the same safe columns
-- toConfiguratorOption() (src/lib/configurator/mapping.ts) already forwards
-- to the browser -- never internal_notes/ai_dna/render_recipe, which a
-- broad "add an anon SELECT policy" fix would have exposed via the public
-- REST API to anyone with the anon key (i.e. everyone), not just through
-- this one route's careful redaction.
--
-- material_id/dna_color_id are included (harmless UUIDs, no business
-- content) because W3-4's Design Studio deep-link needs them to match a
-- Fabric Explorer material/color slug to the option that represents it in
-- the configurator's catalog.
create or replace function public.list_active_design_master_options()
returns table (
  id uuid,
  category text,
  name text,
  price numeric,
  photo_url text,
  selling_points jsonb,
  sort_order integer,
  material_id uuid,
  dna_color_id uuid
)
language sql
security definer
set search_path = public
stable
as $$
  select
    o.id, o.category, o.name, o.price, o.photo_url, o.selling_points,
    o.sort_order, o.material_id, o.dna_color_id
  from public.design_master_options o
  where o.is_active = true
  order by o.category, o.sort_order;
$$;

revoke all on function public.list_active_design_master_options() from public;
grant execute on function public.list_active_design_master_options() to anon, authenticated;
