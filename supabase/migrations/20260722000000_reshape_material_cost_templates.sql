-- Estimasi Biaya (replaces the plain Kalkulator tab) needs a richer
-- template shape than the generic label/qty/unitPrice rows the previous
-- migration set up: material rows now reference category_id + material_id
-- + qty only (never a stored price — "Harga Material selalu berasal dari
-- Inventory" is enforced by always resolving price/unit live against the
-- current materials list on load, so a template can never go stale), plus
-- a separate Biaya Tambahan list and the Estimasi Harga Jual/Catatan
-- fields. Table had 0 rows when this ran (shipped minutes earlier in the
-- same sprint), so this reshapes in place instead of leaving components
-- (the old shape) around unused.
alter table public.material_cost_templates drop column if exists components;
alter table public.material_cost_templates
  add column if not exists material_rows jsonb not null default '[]'::jsonb,
  add column if not exists additional_costs jsonb not null default '[]'::jsonb,
  add column if not exists harga_jual numeric,
  add column if not exists catatan text;
