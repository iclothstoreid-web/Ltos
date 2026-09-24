-- Owner correction: custom sizing + sales-facing model/cutting choices.
-- Applied in production as Supabase migration 20260924021834.

insert into public.ai_sales_business_facts
  (fact_key, category, label, value, notes, is_active)
values
  (
    'custom_measurement_policy',
    'service',
    'Ukuran custom sebelum produksi',
    'Semua thobe Local Tailor dibuat dengan ukuran custom. Size ready-made seperti XL hanya boleh menjadi referensi awal, bukan ukuran produksi final. Sebelum produksi customer tetap diukur. Customer area Bandung dapat datang langsung ke studio/showroom Local Tailor. Customer luar Bandung dapat fitting online dengan pengukuran badan via video call atau menggunakan thobe yang ukurannya sudah nyaman sebagai reference garment.',
    'Saat customer menyebut size seperti M/L/XL/XXL atau size angka, jelaskan proses ukuran custom dan arahkan ke metode fitting berdasarkan domisili.',
    true
  ),
  (
    'sales_model_families',
    'service',
    'Pilihan model utama custom thobe',
    'Saudi, Qatary, Emirates Dubai',
    'Pilihan model family sales-facing yang boleh ditawarkan kepada customer.',
    true
  ),
  (
    'sales_cutting_options',
    'service',
    'Pilihan cutting custom thobe',
    'Slim Fit, Semi Slim Fit, Regular Fit',
    'Pilihan cutting sales-facing yang boleh ditawarkan kepada customer.',
    true
  ),
  (
    'sales_custom_parts',
    'service',
    'Bagian thobe yang dapat dicustom',
    'Kerah, saku, manset, plaket, cutting',
    'Pilihan detail spesifik per part harus mengikuti katalog aktif LTOS.',
    true
  )
on conflict (fact_key) do update
set category=excluded.category,
    label=excluded.label,
    value=excluded.value,
    notes=excluded.notes,
    is_active=true,
    updated_at=now();

insert into public.ai_sales_training_examples
  (stage_before, stage_after, situation, customer_message, ideal_reply, rationale, outcome, priority, source_type, source_ref, source_key, is_active)
values
  (
    'qualified',
    'qualified',
    'Customer baru menyebut size ready-made XL setelah menjelaskan kebutuhan pemakaian.',
    'Ukuran XL',
    'Siap Kang. Untuk Local Tailor, XL bisa jadi referensi awal, tapi ukuran akhirnya tetap kita custom sebelum produksi. Kalau Kang di area Bandung bisa ukur langsung di studio/showroom. Kalau di luar Bandung, bisa fitting online lewat video call atau pakai thobe yang ukurannya sudah nyaman sebagai acuan. Kang domisilinya di Bandung atau luar Bandung?',
    'Jangan memperlakukan XL sebagai ukuran produksi final. Jelaskan bahwa sizing dibuat custom dan arahkan ke metode pengukuran berdasarkan lokasi.',
    'progressed',
    100,
    'manual',
    'owner-correction-2026-09-24:size-xl',
    'owner.size_xl_custom_measurement',
    true
  )
on conflict (source_key) do update
set stage_before=excluded.stage_before,
    stage_after=excluded.stage_after,
    situation=excluded.situation,
    customer_message=excluded.customer_message,
    ideal_reply=excluded.ideal_reply,
    rationale=excluded.rationale,
    outcome=excluded.outcome,
    priority=excluded.priority,
    source_type=excluded.source_type,
    source_ref=excluded.source_ref,
    is_active=true,
    updated_at=now();
