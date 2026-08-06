-- Render Final Storage (2026-08-07) — minimal, deliberately non-scalable
-- storage for the ONE current AI (or manually-replaced) render Owner has
-- reviewed for a consultation. No versioning, no history, no prompt
-- snapshot, no audit trail — one row per consultation, always overwritten
-- in place. Production/Customer Journey/other workspaces only ever need to
-- read `render_image_url`; they have no reason to know whether it came from
-- AI generation or a manual Replace.
create table if not exists render_finals (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null unique references consultations(id) on delete cascade,
  customer_photo_url text not null,
  render_image_url text not null,
  render_status text not null default 'draft' check (render_status in ('draft', 'approved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table render_finals is
  'One row per consultation — the current Render Final (Preview/Download/Replace/Approve workflow in Design Studio). Always overwritten in place on Replace/re-generate, never versioned.';

alter table render_finals enable row level security;

-- Same staff role set (admin/owner/artisan) as every other Design
-- Studio-adjacent table (consultations, render_history, measurements) — no
-- separate "Owner-only Approve" gate at the DB level; Design Studio is a
-- staff tool, matching existing precedent throughout this schema.
create policy "Staff can read render finals"
  on render_finals for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );

create policy "Staff can create render finals"
  on render_finals for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );

create policy "Staff can update render finals"
  on render_finals for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );

-- Storage — same public-bucket + role-gated-write shape as
-- 'consultation-photos' (20260719000000_add_master_data_price_and_categories.sql).
-- Manual Replace uploads use a deterministic path (consultationId-keyed,
-- upsert: true — see src/lib/design/renderFinal.ts) so re-uploading always
-- overwrites the same Storage object; no versioning at the Storage layer
-- either.
insert into storage.buckets (id, name, public)
values ('render-finals', 'render-finals', true)
on conflict (id) do nothing;

create policy "Staff can read render final images"
  on storage.objects for select
  using (bucket_id = 'render-finals');

create policy "Staff can upload render final images"
  on storage.objects for insert
  with check (
    bucket_id = 'render-finals'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );

create policy "Staff can update render final images"
  on storage.objects for update
  using (
    bucket_id = 'render-finals'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );
