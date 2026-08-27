-- Sprint DS-UX Scope B — Owner OS Content / Media CMS foundation.
--
-- Website public content (Media Library, Journal articles, Gallery,
-- Homepage image slots) has until now lived entirely in code
-- (src/lib/marketing/assets.ts hardcoded URLs, /journal placeholder,
-- /gallery reusing the design_master_options RPC). This migration adds the
-- four backing tables + a dedicated public `website-media` Storage bucket,
-- with the same RLS shape every staff-managed table in this project uses:
-- staff-only writes gated on profiles.role, and public/anon read ONLY
-- through SECURITY DEFINER RPCs that filter to published/active rows.
--
-- Nothing here touches design_master_options, the configurator, pricing,
-- estimator, or the existing knowledge-article cluster (deliberately left
-- as hardcoded TS — it is SEO-critical and out of scope).

-- ---------------------------------------------------------------------------
-- Storage bucket: website-media (public — served through the same
-- /storage/v1/render/image/public/ transform endpoint the rest of the site
-- already uses; "public" here means the raw object is fetchable, exactly
-- like master-data-photos. Draft-article exposure is controlled at the RPC
-- layer, not by hiding the image file.)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'website-media',
  'website-media',
  true,
  20971520, -- 20 MB
  array['image/jpeg','image/png','image/webp','image/avif','image/gif']
)
on conflict (id) do nothing;

-- Anyone can read objects (public bucket); only staff (admin/owner) can
-- write/update/delete. Mirrors the implicit policy set on the older public
-- buckets, made explicit here.
drop policy if exists "website-media public read" on storage.objects;
create policy "website-media public read"
  on storage.objects for select
  using (bucket_id = 'website-media');

drop policy if exists "website-media staff write" on storage.objects;
create policy "website-media staff write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'website-media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = any (array['admin','owner']))
  );

drop policy if exists "website-media staff update" on storage.objects;
create policy "website-media staff update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'website-media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = any (array['admin','owner']))
  );

drop policy if exists "website-media staff delete" on storage.objects;
create policy "website-media staff delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'website-media'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = any (array['admin','owner']))
  );

-- ---------------------------------------------------------------------------
-- Helper: is the current auth.uid() a content manager?
-- ---------------------------------------------------------------------------
create or replace function public.is_content_manager()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin','owner'])
  );
$$;

-- ---------------------------------------------------------------------------
-- website_media — central asset registry
-- ---------------------------------------------------------------------------
create table if not exists public.website_media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  title text not null,
  alt_text text not null default '',
  caption text,
  category text not null default 'general'
    check (category in ('homepage','gallery','fabric','journal','location','craftsmanship','appointment','general')),
  width integer,
  height integer,
  byte_size bigint,
  mime_type text,
  status text not null default 'active' check (status in ('active','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists website_media_category_idx on public.website_media (category, status, created_at desc);

alter table public.website_media enable row level security;

drop policy if exists "website_media staff read" on public.website_media;
create policy "website_media staff read" on public.website_media
  for select using (public.is_content_manager());

drop policy if exists "website_media staff insert" on public.website_media;
create policy "website_media staff insert" on public.website_media
  for insert with check (public.is_content_manager());

drop policy if exists "website_media staff update" on public.website_media;
create policy "website_media staff update" on public.website_media
  for update using (public.is_content_manager()) with check (public.is_content_manager());

drop policy if exists "website_media staff delete" on public.website_media;
create policy "website_media staff delete" on public.website_media
  for delete using (public.is_content_manager());

-- ---------------------------------------------------------------------------
-- journal_articles
-- ---------------------------------------------------------------------------
create table if not exists public.journal_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  cover_media_id uuid references public.website_media(id) on delete set null,
  body text not null default '',
  category text not null default 'journal',
  tags text[] not null default '{}',
  author text not null default 'Local Tailor',
  status text not null default 'draft' check (status in ('draft','published')),
  seo_title text,
  meta_description text,
  og_media_id uuid references public.website_media(id) on delete set null,
  canonical_url text,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists journal_articles_status_idx on public.journal_articles (status, published_at desc);

alter table public.journal_articles enable row level security;

drop policy if exists "journal_articles staff read" on public.journal_articles;
create policy "journal_articles staff read" on public.journal_articles
  for select using (public.is_content_manager());

drop policy if exists "journal_articles staff insert" on public.journal_articles;
create policy "journal_articles staff insert" on public.journal_articles
  for insert with check (public.is_content_manager());

drop policy if exists "journal_articles staff update" on public.journal_articles;
create policy "journal_articles staff update" on public.journal_articles
  for update using (public.is_content_manager()) with check (public.is_content_manager());

drop policy if exists "journal_articles staff delete" on public.journal_articles;
create policy "journal_articles staff delete" on public.journal_articles
  for delete using (public.is_content_manager());

-- ---------------------------------------------------------------------------
-- gallery_items
-- ---------------------------------------------------------------------------
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.website_media(id) on delete cascade,
  caption text,
  category text not null default 'general',
  sort_order integer not null default 0,
  featured boolean not null default false,
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists gallery_items_order_idx on public.gallery_items (status, sort_order, created_at);

alter table public.gallery_items enable row level security;

drop policy if exists "gallery_items staff read" on public.gallery_items;
create policy "gallery_items staff read" on public.gallery_items
  for select using (public.is_content_manager());

drop policy if exists "gallery_items staff insert" on public.gallery_items;
create policy "gallery_items staff insert" on public.gallery_items
  for insert with check (public.is_content_manager());

drop policy if exists "gallery_items staff update" on public.gallery_items;
create policy "gallery_items staff update" on public.gallery_items
  for update using (public.is_content_manager()) with check (public.is_content_manager());

drop policy if exists "gallery_items staff delete" on public.gallery_items;
create policy "gallery_items staff delete" on public.gallery_items
  for delete using (public.is_content_manager());

-- ---------------------------------------------------------------------------
-- homepage_media_slots — one row per fixed, known slot
-- ---------------------------------------------------------------------------
create table if not exists public.homepage_media_slots (
  slot_key text primary key
    check (slot_key in ('hero','fabric_highlight','craftsmanship','gallery_preview','appointment','consultation')),
  media_id uuid references public.website_media(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.homepage_media_slots enable row level security;

drop policy if exists "homepage_media_slots staff read" on public.homepage_media_slots;
create policy "homepage_media_slots staff read" on public.homepage_media_slots
  for select using (public.is_content_manager());

drop policy if exists "homepage_media_slots staff insert" on public.homepage_media_slots;
create policy "homepage_media_slots staff insert" on public.homepage_media_slots
  for insert with check (public.is_content_manager());

drop policy if exists "homepage_media_slots staff update" on public.homepage_media_slots;
create policy "homepage_media_slots staff update" on public.homepage_media_slots
  for update using (public.is_content_manager()) with check (public.is_content_manager());

drop policy if exists "homepage_media_slots staff delete" on public.homepage_media_slots;
create policy "homepage_media_slots staff delete" on public.homepage_media_slots
  for delete using (public.is_content_manager());

-- Seed the six known slots so the Homepage manager always has a full grid.
insert into public.homepage_media_slots (slot_key)
values ('hero'), ('fabric_highlight'), ('craftsmanship'), ('gallery_preview'), ('appointment'), ('consultation')
on conflict (slot_key) do nothing;

-- ---------------------------------------------------------------------------
-- Public read RPCs (SECURITY DEFINER) — the ONLY anon-reachable surface.
-- Each returns a Storage object PATH (never a URL); the app builds the
-- public/transform URL client- or server-side, same pattern as
-- src/lib/configurator/mapping.ts.
-- ---------------------------------------------------------------------------
create or replace function public.list_published_journal_articles()
returns table (
  slug text, title text, excerpt text, category text, tags text[],
  author text, published_at timestamptz, cover_path text
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select a.slug, a.title, a.excerpt, a.category, a.tags, a.author, a.published_at,
         m.storage_path as cover_path
  from public.journal_articles a
  left join public.website_media m on m.id = a.cover_media_id
  where a.status = 'published'
  order by a.published_at desc nulls last, a.created_at desc;
$$;

create or replace function public.get_published_journal_article(p_slug text)
returns table (
  slug text, title text, excerpt text, body text, category text, tags text[],
  author text, published_at timestamptz, updated_at timestamptz,
  seo_title text, meta_description text, canonical_url text,
  cover_path text, cover_alt text, og_path text
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select a.slug, a.title, a.excerpt, a.body, a.category, a.tags, a.author,
         a.published_at, a.updated_at, a.seo_title, a.meta_description, a.canonical_url,
         cm.storage_path as cover_path, cm.alt_text as cover_alt,
         om.storage_path as og_path
  from public.journal_articles a
  left join public.website_media cm on cm.id = a.cover_media_id
  left join public.website_media om on om.id = a.og_media_id
  where a.status = 'published' and a.slug = p_slug
  limit 1;
$$;

create or replace function public.list_active_gallery_items()
returns table (
  id uuid, caption text, category text, sort_order integer, featured boolean,
  media_path text, media_alt text
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select g.id, g.caption, g.category, g.sort_order, g.featured,
         m.storage_path as media_path, m.alt_text as media_alt
  from public.gallery_items g
  join public.website_media m on m.id = g.media_id
  where g.status = 'active' and m.status = 'active'
  order by g.featured desc, g.sort_order asc, g.created_at asc;
$$;

create or replace function public.get_homepage_media_slots()
returns table (slot_key text, media_path text, media_alt text)
language sql
stable
security definer
set search_path to 'public'
as $$
  select s.slot_key, m.storage_path as media_path, m.alt_text as media_alt
  from public.homepage_media_slots s
  left join public.website_media m on m.id = s.media_id and m.status = 'active';
$$;

grant execute on function public.list_published_journal_articles() to anon, authenticated;
grant execute on function public.get_published_journal_article(text) to anon, authenticated;
grant execute on function public.list_active_gallery_items() to anon, authenticated;
grant execute on function public.get_homepage_media_slots() to anon, authenticated;

-- is_content_manager() is an RLS helper only, never an API — keep it off
-- the anon PostgREST surface. `authenticated` still needs EXECUTE for the
-- policies above to evaluate. (The four read RPCs above are deliberately
-- anon-executable, same as list_active_design_master_options().)
revoke execute on function public.is_content_manager() from anon, public;
