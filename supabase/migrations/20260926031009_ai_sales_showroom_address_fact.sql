-- Owner-confirmed showroom address; never derive a street address from city.
insert into public.ai_sales_business_facts
  (fact_key, category, label, value, notes, is_active, source_note)
values
  ('showroom_address', 'location', 'Alamat showroom Local Tailor',
   'Jl. Gamelan No. 10, Turangga, Buahbatu, Kota Bandung, Jawa Barat',
   'Jawab persis. Jangan menambahkan nomor lain, patokan, pin, atau jam buka yang belum terverifikasi. Konfirmasi waktu bila customer ingin berkunjung.',
   true, 'Owner-confirmed WhatsApp correction 2026-09-26')
on conflict (fact_key) do update
set category = excluded.category,
    label = excluded.label,
    value = excluded.value,
    notes = excluded.notes,
    is_active = true,
    source_note = excluded.source_note,
    updated_at = now();
