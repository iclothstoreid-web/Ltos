-- Final Security Refactor — Render Final Storage (2026-08-07).
-- Render Final is an internal LTOS asset, not a public one. Scope: this
-- migration only touches the render-finals bucket + render_finals table's
-- image-reference shape. Prompt Architecture / AI Pipeline / Render Engine
-- / Prompt Builder / Component Rules are untouched.
--
-- Store Private, Access by Signed URL:
--   1. render_finals.render_image_url (a public URL) -> render_storage_path
--      (a bare Storage object path; DB is the source of truth for the
--      path, never for a fetchable URL).
--   2. render-finals bucket: public -> private.
--   3. storage.objects SELECT policy on this bucket gets the same
--      staff-role gate INSERT/UPDATE already had (it previously had none —
--      a real gap: with the bucket now private, an ungated SELECT policy
--      would have been the only thing standing between "private" and
--      "public in every way that matters", since creating a signed URL
--      itself requires passing this same policy).
--
-- Backward compatible: backfills render_storage_path from any existing
-- render_image_url before dropping it. Verified via audit immediately
-- before writing this migration: render_finals has 0 rows and the
-- render-finals bucket has 0 objects in production — nothing to migrate.
-- The backfill logic below is written to be correct regardless (safe to
-- run against a non-empty table in any other environment), not because
-- production currently needs it.

alter table render_finals add column if not exists render_storage_path text;

-- Case 1: a real Supabase Storage public URL -> extract the object path
-- (everything after the bucket's public-object prefix).
update render_finals
set render_storage_path = regexp_replace(render_image_url, '^.*/storage/v1/object/public/render-finals/', '')
where render_image_url is not null
  and render_storage_path is null
  and render_image_url like '%/storage/v1/object/public/render-finals/%';

-- Case 2: anything else under the old column (e.g. a data: URI — no real
-- Storage object exists for that content, so there is no path to derive)
-- would be left with render_storage_path still null here. The NOT NULL
-- constraint below turns that into a loud migration failure instead of a
-- silent data loss — if this ever fires, the fix is a manual re-upload for
-- those specific rows before re-running this migration, not deleting them.
alter table render_finals alter column render_storage_path set not null;

alter table render_finals drop column render_image_url;

update storage.buckets set public = false where id = 'render-finals';

drop policy if exists "Staff can read render final images" on storage.objects;

create policy "Staff can read render final images"
  on storage.objects for select
  using (
    bucket_id = 'render-finals'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );
