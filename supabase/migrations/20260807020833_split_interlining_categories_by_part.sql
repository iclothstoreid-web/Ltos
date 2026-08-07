-- Sprint: Kain Keras / Interlining Panel Refactor by Garment Part
--
-- Business requirement: Persiapan Bahan's Interlining selection must be
-- split by garment part (Kerah / Plaket / Manset) instead of one mixed
-- dropdown. Persiapan Bahan (MaterialPreparationCard.tsx) already renders
-- one dropdown row per active Material Category automatically -- that was
-- the entire point of 20260819010000_refine_material_preparation_dynamic_
-- categories.sql (category-driven, no fixed item list, no code change
-- needed to add/split a category). So this is a pure Inventory master-data
-- change, not a code or schema change: material_categories/materials
-- structure, save_material_preparation, _inventory_apply_movement, and the
-- Persiapan Bahan/Reserve Material workflow are all untouched.
--
-- Before this migration, all interlining materials lived under one
-- "Kain Keras" category, including two real-stock Kerah variants
-- ("interlining kerah daun" 216 pcs, "interlining kerah shanghai" 433 pcs)
-- and several zero-stock duplicates left over from an earlier bulk import
-- (generic "Interlining Kerah", generic "Interlining Shanghai").

-- 1. Reuse the existing "Kain Keras" category row as "Interlining Kerah"
--    (keeps its id, so any in-flight order's material_preparation_items
--    still referencing this category_id stay valid -- those rows already
--    hold their own point-in-time category_name text snapshot, so past
--    "Kain Keras" reservations keep displaying correctly unchanged).
update material_categories
set name = 'Interlining Kerah'
where id = '1b5bdc5e-923b-42d2-b26b-705fac86455e';

-- 2. Make room in sort_order for two new categories right after Interlining
--    Kerah (3), before Tricot (was 4).
update material_categories
set sort_order = sort_order + 2
where sort_order >= 4;

-- 3. New part-scoped categories.
insert into material_categories (name, sort_order) values
  ('Interlining Plaket', 4),
  ('Interlining Manset', 5);

-- 4. Move the existing Plaket/Manset materials into their own category.
update materials
set category_id = (select id from material_categories where name = 'Interlining Plaket')
where id = '9d4c1d1e-cd85-4010-9053-f8c19ebd84a1'; -- "Interlining Plaket"

update materials
set category_id = (select id from material_categories where name = 'Interlining Manset')
where id = 'f1770299-5008-46bc-ba9a-b0e4f1ad345c'; -- "Interlining Manset"

-- 5. Normalize the two real Kerah variants' display names to the locked
--    business-rule wording (stay under Interlining Kerah, real stock kept
--    as-is -- 216 / 433 pcs, not touched).
update materials set name = 'Interlining Kerah Daun' where id = 'b2eb2cd9-84a4-487c-bb36-98466f8e2f39';
update materials set name = 'Interlining Kerah Shanghai' where id = '059adc0d-e114-47de-a276-c12244234bf3';

-- 6. Deactivate the redundant zero-stock duplicates so they don't surface as
--    extra, unwanted options in Interlining Kerah's dropdown. is_active =
--    false, not deleted -- ledger/history integrity for any past movement
--    referencing these ids is untouched.
update materials
set is_active = false
where id in (
  'f43e9f5e-d054-48c7-8564-c3f4d6e38e99', -- generic "Interlining Kerah", 0 stock, superseded by Daun/Shanghai
  '294be3e7-f01e-4290-b764-0e7c30dce6c3'  -- generic "Interlining Shanghai", 0 stock, duplicate of Kerah Shanghai
);
