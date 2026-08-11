-- Sprint W3-3 (Fabric Detail Pages + Zoom + Video).
--
-- Three more additive columns on materials, same precedent as W3-1/W3-2 —
-- nothing renamed or removed, existing columns untouched.
--
-- gallery_images: the detail page's Image Gallery needs more than one
-- photo per material; hero_image alone (the only image column that has
-- ever existed) can't back a thumbnail selector. Nullable array — the
-- gallery falls back to [hero_image] when empty (see
-- getMaterialGallery() in src/lib/materials/materialRepository.ts).
--
-- specifications: the brief's "Fabric Specifications" section (Best For,
-- Recommended Garments, Climate, Occasion, Drape Character, Structure,
-- Comfort, Durability) has no matching columns anywhere and the brief
-- itself anticipates the data may not exist yet ("Jika belum tersedia,
-- gunakan fallback yang aman") -- one flexible jsonb column, same pattern
-- design_master_options.metadata already uses elsewhere in this codebase
-- for free-form spec fields, rather than 8 new single-purpose columns.
--
-- use_cases: the brief's "Ideal for: Daily Thobe / Formal Thobe / ..."
-- list. A simple text array for explicit admin-entered tags; falls back
-- to a small set derived from season/price_tier when empty (see
-- getMaterialUseCases()).
alter table public.materials
  add column if not exists gallery_images text[],
  add column if not exists specifications jsonb,
  add column if not exists use_cases text[];

-- Extend the update grant to cover the three new columns, same as every
-- prior sprint's column additions.
revoke update on public.materials from authenticated;
grant update (
  name, sku, unit, price, min_stock, photo_url, location, category_id,
  is_active, updated_at, supplier,
  slug, fabric_category, composition, weight_gsm, texture, breathability,
  wrinkle_resistance, luxury_level, season, care_instruction, price_tier,
  hero_image, video_url, published,
  gallery_images, specifications, use_cases
) on public.materials to authenticated;

-- list_fabric_catalog()'s RETURNS TABLE shape is changing (three new
-- output columns) -- Postgres does not allow CREATE OR REPLACE to change
-- a function's return type, even with an identical parameter list, so the
-- old version must be dropped first (same as the W3-2 migration's own
-- view -> function replacement).
drop function if exists public.list_fabric_catalog(text, text, text, text, text, text, text, integer, integer);

create or replace function public.list_fabric_catalog(
  p_search text default null,
  p_category text default null,
  p_texture text default null,
  p_weight_class text default null,
  p_season text default null,
  p_price_tier text default null,
  p_sort text default 'featured',
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id uuid,
  slug text,
  name text,
  category text,
  composition text,
  weight_gsm integer,
  texture text,
  breathability text,
  wrinkle_resistance text,
  luxury_level text,
  season text,
  care_instruction text,
  price_tier text,
  hero_image text,
  video_url text,
  published boolean,
  gallery_images text[],
  specifications jsonb,
  use_cases text[],
  total_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    m.id, m.slug, m.name, m.fabric_category as category, m.composition,
    m.weight_gsm, m.texture, m.breathability, m.wrinkle_resistance,
    m.luxury_level, m.season, m.care_instruction, m.price_tier,
    m.hero_image, m.video_url, m.published,
    m.gallery_images, m.specifications, m.use_cases,
    count(*) over() as total_count
  from public.materials m
  where m.published = true
    and m.slug is not null
    and m.fabric_category is not null
    and (p_search is null or p_search = '' or (
      m.name ilike '%' || p_search || '%'
      or m.fabric_category ilike '%' || p_search || '%'
      or m.composition ilike '%' || p_search || '%'
      or m.texture ilike '%' || p_search || '%'
    ))
    and (p_category is null or m.fabric_category = p_category)
    and (p_texture is null or m.texture = p_texture)
    and (p_season is null or m.season = p_season)
    and (p_price_tier is null or m.price_tier = p_price_tier)
    and (p_weight_class is null or (
      case
        when m.weight_gsm is null then null
        when m.weight_gsm < 150 then 'lightweight'
        when m.weight_gsm <= 250 then 'medium'
        else 'heavy'
      end
    ) = p_weight_class)
  order by
    case when p_sort = 'name_asc' then m.name end asc,
    case when p_sort = 'name_desc' then m.name end desc,
    case when p_sort = 'luxury_level' then (
      case lower(coalesce(m.luxury_level, ''))
        when 'luxury' then 3
        when 'premium' then 2
        when 'basic' then 1
        when 'standard' then 1
        else 0
      end
    ) end desc,
    case when p_sort = 'weight' then m.weight_gsm end asc,
    m.created_at asc
  limit greatest(least(coalesce(p_limit, 24), 500), 1)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

revoke all on function public.list_fabric_catalog(text, text, text, text, text, text, text, integer, integer) from public;
grant execute on function public.list_fabric_catalog(text, text, text, text, text, text, text, integer, integer) to anon, authenticated;
