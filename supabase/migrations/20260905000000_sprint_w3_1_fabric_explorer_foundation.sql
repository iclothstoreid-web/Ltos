-- Sprint W3-1 (Fabric Explorer Foundation & Material Master Integration).
--
-- The brief's Fabric Explorer field list (slug, composition, weight_gsm,
-- texture, breathability, wrinkle_resistance, luxury_level, season,
-- care_instruction, price_tier, hero_image, video_url, published) has no
-- home anywhere in the schema today -- confirmed by grep across every
-- migration and src/lib/inventory/types.ts. Resolving the brief's own
-- "don't touch the schema" line against its own field list was flagged to
-- and decided by the user: additive columns on the existing `materials`
-- table (same precedent as Sprint K LOCK V1 adding supplier/default_color),
-- nothing renamed or removed.
--
-- `fabric_category` is deliberately a new column, not a reuse of
-- `category_id` -- that FK points at material_categories (Bahan/Benang/
-- Kain Keras/... -- Inventory's supply-type taxonomy), which is a
-- different classification from the Fabric Explorer's fiber-type taxonomy
-- (Cotton/Linen/Wool/Rayon/Polyester/Blend). Keeping them separate avoids
-- collapsing two unrelated category systems into one column.

alter table public.materials
  add column if not exists slug text,
  add column if not exists fabric_category text,
  add column if not exists composition text,
  add column if not exists weight_gsm integer,
  add column if not exists texture text,
  add column if not exists breathability text,
  add column if not exists wrinkle_resistance text,
  add column if not exists luxury_level text,
  add column if not exists season text,
  add column if not exists care_instruction text,
  add column if not exists price_tier text,
  add column if not exists hero_image text,
  add column if not exists video_url text,
  add column if not exists published boolean not null default false;

alter table public.materials
  add constraint materials_fabric_category_check
  check (fabric_category is null or fabric_category = any (array[
    'cotton', 'linen', 'wool', 'rayon', 'polyester', 'blend'
  ]));

-- Partial unique index (not a table constraint) so existing rows with no
-- slug yet (null) don't collide with each other.
create unique index if not exists materials_slug_unique_idx
  on public.materials (slug) where slug is not null;

-- Extend the existing column-scoped update grant (20260720000000,
-- extended again by Sprint K LOCK V1) to cover the new Fabric Explorer
-- identity fields, so a future Material Master admin UI can edit them
-- without another migration. Same admin/owner-only RLS policy as before
-- (public.materials for update already scoped to admin/owner) --
-- untouched here.
-- default_color was dropped from this table by
-- 20260824000000_drop_materials_default_color.sql -- omitted here, not
-- re-added.
revoke update on public.materials from authenticated;
grant update (
  name, sku, unit, price, min_stock, photo_url, location, category_id,
  is_active, updated_at, supplier,
  slug, fabric_category, composition, weight_gsm, texture, breathability,
  wrinkle_resistance, luxury_level, season, care_instruction, price_tier,
  hero_image, video_url, published
) on public.materials to authenticated;

-- Public read surface for the Fabric Explorer (/fabric, unauthenticated
-- marketing route) lives in the companion migration
-- 20260905000100_sprint_w3_1_fabric_catalog_function.sql, as a SECURITY
-- DEFINER function rather than a view -- see that file for why.
