-- Owner-verified Local Tailor showroom address.
-- Keeps fresh environments and future restores aligned with production AI Sales truth.

insert into public.ai_sales_business_facts
  (fact_key, category, label, value, notes, source_note, is_active)
values
  (
    'showroom_address',
    'location',
    'Alamat showroom Local Tailor',
    'Jalan Gamelan No.10, Turangga, Buahbatu, Kota Bandung',
    'Gunakan alamat ini persis saat customer menanyakan lokasi/alamat showroom. Jangan menebak alamat lain.',
    'Owner correction 2026-09-26',
    true
  )
on conflict (fact_key) do update
set category = excluded.category,
    label = excluded.label,
    value = excluded.value,
    notes = excluded.notes,
    source_note = excluded.source_note,
    is_active = true,
    updated_at = now();
