-- Sprint W3-5 (SEO, Product Schema, Internal Linking) §6 — "same color
-- family" internal linking needs to find other published materials that
-- carry a color from the same dna_colors.family as the material currently
-- being viewed. Same additive SECURITY DEFINER pattern as
-- list_material_ids_for_color (W3-4) — material_colors/dna_colors RLS
-- stays untouched.
create or replace function public.list_material_ids_for_color_family(p_family text)
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
  where dc.family = p_family
    and mc.is_active = true
    and dc.status = 'active'
    and m.published = true;
$$;

revoke all on function public.list_material_ids_for_color_family(text) from public;
grant execute on function public.list_material_ids_for_color_family(text) to anon, authenticated;
