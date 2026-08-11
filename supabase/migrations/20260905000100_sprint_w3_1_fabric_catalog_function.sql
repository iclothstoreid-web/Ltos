-- Sprint W3-1 — public read surface for the Fabric Explorer (/fabric,
-- unauthenticated marketing route). `materials` itself stays staff-only
-- (its RLS from 20260720000000 is untouched) -- stock/price/supplier/
-- location are business-sensitive and must never reach anon.
--
-- Originally written as a `fabric_catalog_public` view in the companion
-- migration (20260905000000). Supabase's own security linter flags any
-- SECURITY DEFINER view as an ERROR -- the exact category the Sprint S2
-- audit already fixed on current_queue/order_timeline
-- (20260903000100_sprint_s2_fix_security_definer_views.sql) -- and this
-- project's Database Rules explicitly say to prefer RPCs over ad-hoc
-- views. Replaced with a SECURITY DEFINER function instead, same
-- restriction as the view had: only published rows, hard column
-- allowlist (no stock, price, supplier, sku, or location ever leaves it).

drop view if exists public.fabric_catalog_public;

create or replace function public.list_fabric_catalog()
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
  published boolean
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
    m.hero_image, m.video_url, m.published
  from public.materials m
  where m.published = true
    and m.slug is not null
    and m.fabric_category is not null;
$$;

revoke all on function public.list_fabric_catalog() from public;
grant execute on function public.list_fabric_catalog() to anon, authenticated;
