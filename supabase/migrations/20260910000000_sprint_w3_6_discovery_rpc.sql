-- Sprint W3-6 (AI Material Knowledge API + Performance) §12 — the AI
-- Discovery Endpoint needs a catalog-wide list of DNA Color families in
-- use, without an N+1 fan-out (one list_material_colors() call per
-- material). Same additive SECURITY DEFINER pattern as every other public
-- color RPC this project has (list_material_colors,
-- list_material_ids_for_color, list_material_ids_for_color_family) —
-- material_colors/dna_colors RLS stays untouched.
create or replace function public.list_distinct_color_families()
returns table (family text)
language sql
security definer
set search_path = public
stable
as $$
  select distinct dc.family
  from public.material_colors mc
  join public.dna_colors dc on dc.id = mc.dna_color_id
  join public.materials m on m.id = mc.material_id
  where mc.is_active = true
    and dc.status = 'active'
    and m.published = true
    and dc.family is not null
  order by dc.family;
$$;

revoke all on function public.list_distinct_color_families() from public;
grant execute on function public.list_distinct_color_families() to anon, authenticated;
