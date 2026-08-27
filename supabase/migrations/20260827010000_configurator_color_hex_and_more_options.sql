-- Sprint DS-UX follow-up — expose the color swatch hex to the public
-- configurator, so the Color selector can render a real swatch instead of
-- a 3-letter code.
--
-- The hex already exists: design_master_options.metadata->>'hex' is
-- populated for every warna_bahan row (and mirrored in dna_colors.hex).
-- list_active_design_master_options() just never returned it. This adds
-- `color_hex` to the RPC's result — additive, every existing caller reads
-- named columns so nothing breaks. `coalesce(metadata.hex, dna_colors.hex)`
-- so a color linked to a DNA Color but missing its own metadata.hex still
-- resolves.
--
-- Saku / Plaket / Handmade Zig-Zag need NO schema change — they are already
-- rows in design_master_options with photos, already returned by this RPC
-- (it returns all active rows), and already editable in /owner/master-data.
-- Only the frontend needs wiring.

-- Return-type change (added column) requires a drop first. Nothing in SQL
-- depends on it — the only callers are PostgREST `.rpc()` from the app.
drop function if exists public.list_active_design_master_options();

create function public.list_active_design_master_options()
returns table (
  id uuid, category text, name text, price numeric, photo_url text,
  selling_points jsonb, sort_order integer, material_id uuid, dna_color_id uuid,
  color_hex text
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    o.id, o.category, o.name, o.price, o.photo_url, o.selling_points,
    o.sort_order, o.material_id, o.dna_color_id,
    coalesce(o.metadata->>'hex', c.hex) as color_hex
  from public.design_master_options o
  left join public.dna_colors c on c.id = o.dna_color_id
  where o.is_active = true
  order by o.category, o.sort_order;
$$;
