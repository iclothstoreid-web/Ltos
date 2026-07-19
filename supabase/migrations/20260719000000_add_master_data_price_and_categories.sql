-- Fitter App sprint: "Update Harga" on every consultation catalog + 2 new
-- catalogs (Bordir, Handmade Zig-Zag). design_master_options already backs
-- every catalog used during consultation (Model/Cutting/Fabric/Collar/
-- Cuff/Pocket/Button/Plaket/Warna Bahan) as one shared table, so this only
-- needs a new `price` column plus widening the locked category CHECK
-- constraint (see masterData.ts's LOCK comment) to admit the 2 new
-- categories. No workflow/business-logic tables touched.
alter table public.design_master_options
  add column if not exists price numeric not null default 0;

alter table public.design_master_options
  drop constraint if exists design_master_options_category_check;

alter table public.design_master_options
  add constraint design_master_options_category_check
  check (category = any (array[
    'model_thobe', 'look_cutting', 'kerah', 'manset', 'plaket', 'saku',
    'bahan', 'warna_bahan', 'aksesori', 'bordir', 'handmade_zigzag'
  ]));

-- Consultation Review sprint: customer photos (Depan/Samping/Belakang) and
-- reference document uploads. Same public-bucket + role-gated-write shape
-- as the existing master-data-photos bucket.
insert into storage.buckets (id, name, public)
values
  ('consultation-photos', 'consultation-photos', true),
  ('consultation-documents', 'consultation-documents', true)
on conflict (id) do nothing;

create policy "Staff can read consultation photos"
  on storage.objects for select
  using (bucket_id = 'consultation-photos');

create policy "Admin, owner, or artisan can upload consultation photos"
  on storage.objects for insert
  with check (
    bucket_id = 'consultation-photos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );

create policy "Admin, owner, or artisan can update consultation photos"
  on storage.objects for update
  using (
    bucket_id = 'consultation-photos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );

create policy "Staff can read consultation documents"
  on storage.objects for select
  using (bucket_id = 'consultation-documents');

create policy "Admin, owner, or artisan can upload consultation documents"
  on storage.objects for insert
  with check (
    bucket_id = 'consultation-documents'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );

create policy "Admin, owner, or artisan can update consultation documents"
  on storage.objects for update
  using (
    bucket_id = 'consultation-documents'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );
