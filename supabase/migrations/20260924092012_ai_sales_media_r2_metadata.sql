alter table public.ai_sales_media_assets
  add column if not exists storage_provider text not null default 'r2'
    check (storage_provider = any (array['r2','supabase','external'])),
  add column if not exists storage_key text,
  add column if not exists source_sha256 text,
  add column if not exists byte_size bigint
    check (byte_size is null or byte_size >= 0);

create index if not exists ai_sales_media_assets_storage_key_idx
  on public.ai_sales_media_assets(storage_provider, storage_key);

create unique index if not exists ai_sales_media_assets_source_sha256_unique_idx
  on public.ai_sales_media_assets(source_sha256)
  where source_sha256 is not null;
