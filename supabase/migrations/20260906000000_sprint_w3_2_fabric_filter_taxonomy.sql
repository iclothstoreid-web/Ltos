-- Sprint W3-2 (Fabric Explorer + Filter System).
--
-- Locks down canonical slug vocabularies for texture/season/price_tier —
-- the exact value sets the brief enumerates (Smooth/Crisp/Soft/Structured/
-- Matte/Lustrous; Tropical/Summer/All Season/Formal; Basic/Premium/Luxury),
-- stored as lowercase/underscore slugs (matches fabric_category's existing
-- convention from W3-1). Additive only, same as W3-1's own
-- materials_fabric_category_check -- the catalog is still empty so there's
-- no existing data to violate. luxury_level is deliberately left
-- unconstrained: the brief lists it as a sort criterion but never gives it
-- an explicit value set the way it does for price_tier.
--
-- "Weight" (Lightweight/Medium/Heavy) has no column of its own -- it's a
-- band derived from weight_gsm at query time (see the CASE expression
-- below), same as how the old list_fabric_catalog() derived `category`
-- from fabric_category. Thresholds (<150 / 150-250 / >250 gsm) are a
-- reasonable apparel-fabric convention, not something specified anywhere
-- in either sprint brief -- flagged in the sprint report for the user to
-- confirm/adjust once real fabric data is entered.

alter table public.materials
  add constraint materials_texture_check
  check (texture is null or texture = any (array[
    'smooth', 'crisp', 'soft', 'structured', 'matte', 'lustrous'
  ]));

alter table public.materials
  add constraint materials_season_check
  check (season is null or season = any (array[
    'tropical', 'summer', 'all_season', 'formal'
  ]));

alter table public.materials
  add constraint materials_price_tier_check
  check (price_tier is null or price_tier = any (array[
    'basic', 'premium', 'luxury'
  ]));

-- Replaces the zero-argument list_fabric_catalog() from
-- 20260905000100_sprint_w3_1_fabric_catalog_function.sql with a filtered/
-- sorted/paginated version. Dropped explicitly first since Postgres
-- resolves functions by (name, arg types) -- a same-name function with a
-- different signature would just add an overload, not replace the old one.
drop function if exists public.list_fabric_catalog();

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
    -- Window count (pre-LIMIT, post-WHERE) so callers know the true match
    -- total for "Showing N of M" / whether a Load More link should render,
    -- without a second round trip.
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
    -- Dynamic sort: exactly one of these four evaluates non-null per query
    -- (p_sort is a single value for the whole call), the other three are
    -- NULL for every row and so contribute nothing to the ordering. Falls
    -- through to created_at asc when p_sort is 'featured' or unrecognized
    -- -- catalog insertion order, since there's no dedicated "featured"
    -- flag/column in Material Master.
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
