-- DNA Color Library V1 — Reference Swatch storage bucket.
--
-- dna_colors.reference_image (added 20260821000000_add_dna_color_repository.sql)
-- has always been a bare text URL, with no bucket ever created for it — the
-- admin UI (DnaColorManager.tsx) exposes it as a plain URL text field, not an
-- upload widget, because nothing has ever populated it. This migration adds
-- the bucket so the DNA Color Library V1 seed script has somewhere real to
-- upload generated 512x512 solid-color swatches.
--
-- INSERT policy is intentionally ungated (no admin/owner check), matching
-- this codebase's own existing precedent for 'production-packing-video'
-- (20260723000000_add_packing_video.sql) — a bucket nothing in the running
-- app currently writes to interactively (no upload widget exists for this
-- field yet), used only by the one-time seed script via the anon key. If a
-- real upload UI is ever added for this field, gate this policy down to
-- admin/owner then, the same way 'material-photos' and 'consultation-photos'
-- already are.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dna-color-swatches', 'dna-color-swatches', true, 1048576, array['image/png'])
on conflict (id) do nothing;

create policy "Anyone can read DNA color swatches"
  on storage.objects for select
  using (bucket_id = 'dna-color-swatches');

create policy "Seed script can upload DNA color swatches"
  on storage.objects for insert
  with check (bucket_id = 'dna-color-swatches');
