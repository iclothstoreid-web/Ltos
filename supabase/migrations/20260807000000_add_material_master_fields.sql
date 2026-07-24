-- Sprint K (LOCK V1) §6-7: Material Master.
--
-- "Material Master bukan Inventory... tidak ada stok." Rather than a
-- physical two-table split (FabricSelector, reserveInventory, and
-- EstimasiEditor all currently match materials BY NAME across several
-- files -- splitting would mean rewriting every one of those joins for an
-- organizational distinction that isn't functional today), this keeps the
-- single `materials` table and adds the two missing identity columns. A new
-- admin page (/owner/material-master) edits only identity fields
-- (name/category/supplier/price/default_color/sku/status); stock fields
-- (physical_stock/reserved_stock/min_stock) remain exclusively editable from
-- Inventory's existing Material page, untouched.

alter table public.materials
  add column if not exists supplier text,
  add column if not exists default_color text;

-- Extend the existing column-scoped update grant (20260720000000) to cover
-- the two new identity columns, same admin/owner-only RLS policy as before.
revoke update on public.materials from authenticated;
grant update (
  name, sku, unit, price, min_stock, photo_url, location, category_id,
  is_active, updated_at, supplier, default_color
) on public.materials to authenticated;
