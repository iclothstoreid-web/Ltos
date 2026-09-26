update public.ai_sales_media_assets
set caption = '',
    updated_at = now()
where source_folder = 'Kirim pertama';

insert into public.ai_sales_brain_entries (
  source_key, category, title, content, priority, source_type, stage, tags, is_active
)
values (
  'owner.20260926.visual_selling_flow',
  'style',
  'Visual selling: foto dulu, satu hook di akhir',
  'Untuk starter visual, jangan beri caption pada setiap foto. Kirim rangkaian foto bersih agar customer menikmati visual tanpa beban baca, lalu beri satu kalimat pemancing yang ringan di akhir. Foto adalah trigger desire, bukan katalog teknis. Jangan menjelaskan navy/coklat/detail jahitan satu per satu kecuali customer menanyakan foto tertentu.',
  100,
  'manual',
  null,
  array['visual-selling','starter-media','whatsapp','human-cadence'],
  true
)
on conflict (source_key) do update set
  category = excluded.category,
  title = excluded.title,
  content = excluded.content,
  priority = excluded.priority,
  source_type = excluded.source_type,
  stage = excluded.stage,
  tags = excluded.tags,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.ai_sales_training_examples (
  stage_before, stage_after, situation, customer_message, ideal_reply,
  rationale, outcome, priority, source_type, source_ref, source_key, is_active
)
values
(
  'new','qualified',
  'Setelah 5 foto starter terkirim, customer jangan dibebani lima caption teknis. Tutup rangkaian visual dengan satu hook ringan.',
  'Customer baru menerima rangkaian foto detail pengerjaan.',
  'Nah, biasanya dari detail begini customer mulai kebayang thobe yang dia mau. Ada yang paling kena di selera Kang?',
  'Biarkan visual bekerja lebih dulu. Satu hook di akhir lebih mudah diproses dan lebih terasa seperti sales manusia daripada satu deskripsi per foto.',
  'progressed',100,'whatsapp','owner-correction-2026-09-26','owner.20260926.visual.after_starter_pack',true
),
(
  'offer','offer',
  'Customer merasa mahal lalu bilang tidak jadi. Masih ada entry option terverifikasi yang lebih rendah.',
  'Mahal x
Gak jadi ya',
  'Siap Kang, kalau yang berat di budget sebenarnya masih ada Basic Twill Stretch di Rp999.000. Kalau belum dulu juga santai, nanti tinggal lanjut lagi 🙏',
  'Lakukan satu recovery attempt yang relevan tanpa menekan. Jangan langsung menutup dengan template terima kasih selama ada opsi valid yang sesuai keberatan harga.',
  'warm',100,'whatsapp','owner-correction-2026-09-26','owner.20260926.objection.price_exit_recovery',true
)
on conflict (source_key) do update set
  stage_before = excluded.stage_before,
  stage_after = excluded.stage_after,
  situation = excluded.situation,
  customer_message = excluded.customer_message,
  ideal_reply = excluded.ideal_reply,
  rationale = excluded.rationale,
  outcome = excluded.outcome,
  priority = excluded.priority,
  source_type = excluded.source_type,
  source_ref = excluded.source_ref,
  is_active = excluded.is_active,
  updated_at = now();
