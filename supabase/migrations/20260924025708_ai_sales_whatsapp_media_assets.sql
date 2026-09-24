create table if not exists public.ai_sales_media_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique,
  category text not null
    check (category = any (array[
      'model','model_detail','fabric','color_reference','collar','cufflink',
      'placket','pocket','cutting','zigzag','kabak','other'
    ])),
  title text not null,
  image_url text not null,
  caption text not null default '',
  tags text[] not null default '{}'::text[],
  trigger_terms text[] not null default '{}'::text[],
  model_family text,
  fabric_name text,
  color_name text,
  part_name text,
  is_starter boolean not null default false,
  starter_rank smallint
    check (starter_rank is null or starter_rank between 1 and 20),
  priority smallint not null default 50
    check (priority between 0 and 100),
  is_active boolean not null default true,
  source_folder text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_sales_media_assets_active_category_idx
  on public.ai_sales_media_assets(is_active, category, priority desc);

create index if not exists ai_sales_media_assets_starter_idx
  on public.ai_sales_media_assets(is_active, is_starter, starter_rank, priority desc);

create index if not exists ai_sales_media_assets_tags_gin_idx
  on public.ai_sales_media_assets using gin(tags);

create index if not exists ai_sales_media_assets_trigger_terms_gin_idx
  on public.ai_sales_media_assets using gin(trigger_terms);

alter table public.ai_sales_media_assets enable row level security;

revoke all on table public.ai_sales_media_assets from anon;
grant select, insert, update, delete on table public.ai_sales_media_assets to authenticated;
grant all on table public.ai_sales_media_assets to service_role;

drop policy if exists "Owner can manage AI sales media assets" on public.ai_sales_media_assets;
create policy "Owner can manage AI sales media assets"
  on public.ai_sales_media_assets for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = any (array['admin','owner'])
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = any (array['admin','owner'])
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ai-sales-media',
  'ai-sales-media',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
