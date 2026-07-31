-- DNA Color Library V1 — the swatch bucket (20260823020000) only had SELECT
-- and INSERT policies; upserting an already-uploaded swatch (Storage's
-- `x-upsert: true`, used so scripts/seed-dna-colors.ts is safe to re-run —
-- the brief's own "Harus aman dijalankan berkali-kali" requirement) needs an
-- UPDATE policy for the overwrite path, not just INSERT for the first write.
-- Found live: re-running the seed script against an already-populated bucket
-- failed with "new row violates row-level security policy" on every color
-- whose file already existed. Same ungated shape as the INSERT policy — see
-- that migration's comment for why this bucket is intentionally left open.
create policy "Seed script can update DNA color swatches"
  on storage.objects for update
  using (bucket_id = 'dna-color-swatches')
  with check (bucket_id = 'dna-color-swatches');
