-- AI Sales V2: conversation memory, visual execution, owner-learning loop.
-- Additive migration. No customer messages are copied into business-fact tables.

begin;

-- Owner/admin replies are valuable behavioral examples. Expose a read-only view
-- that pairs the customer turn immediately before the human reply with the next
-- customer reaction. The application sanitizes commercial/PII-like tokens before
-- putting any row into an LLM prompt.
create or replace view public.ai_sales_owner_learning_examples
with (security_invoker = true)
as
select
  h.id as source_message_id,
  h.conversation_id,
  prev.text_content as customer_message,
  h.text_content as ideal_reply,
  nxt.text_content as customer_reaction,
  case
    when nxt.text_content ~* '(dp|invoice|pesan|order|transfer|fitting|ukur|lock|gas|ambil|cocok|suka|lanjut|payment|bayar)'
      and nxt.text_content !~* '(tidak jadi|nggak jadi|ga jadi|belum jadi)'
      then 'progressed'
    else 'continued'
  end as outcome,
  case
    when nxt.text_content ~* '(dp|invoice|pesan|order|transfer|fitting|ukur|lock|gas|ambil|cocok|suka|lanjut|payment|bayar)'
      and nxt.text_content !~* '(tidak jadi|nggak jadi|ga jadi|belum jadi)'
      then 92
    else 72
  end::smallint as priority,
  h.created_at
from public.ai_sales_messages h
join lateral (
  select m.text_content
  from public.ai_sales_messages m
  where m.conversation_id = h.conversation_id
    and m.direction = 'inbound'
    and m.role = 'customer'
    and m.text_content is not null
    and m.created_at < h.created_at
  order by m.created_at desc
  limit 1
) prev on true
join lateral (
  select m.text_content
  from public.ai_sales_messages m
  where m.conversation_id = h.conversation_id
    and m.direction = 'inbound'
    and m.role = 'customer'
    and m.text_content is not null
    and m.created_at > h.created_at
  order by m.created_at asc
  limit 1
) nxt on true
where h.direction = 'outbound'
  and h.role = 'human'
  and h.message_type in ('text', 'interactive')
  and h.text_content is not null
  and length(btrim(h.text_content)) between 2 and 1200;

grant select on public.ai_sales_owner_learning_examples to authenticated, service_role;

-- The uploaded R2 library contains many reviewed component references that were
-- never customer-facing because ingestion defaults everything to inactive.
-- Activate only strongly typed design-part categories; leave generic fabrics and
-- ambiguous model-detail assets inactive until owner review.
update public.ai_sales_media_assets
set is_active = true,
    is_starter = false,
    caption = '',
    updated_at = now()
where is_active = false
  and category in ('collar', 'cufflink', 'placket', 'pocket', 'zigzag')
  and image_url ~* '^https://'
  and coalesce(asset_key, '') <> '';

-- Replace the old unconditional Kang-default guidance with context-sensitive
-- address memory. The runtime still keeps the Bandung warmth, but explicit
-- corrections such as "saya akhwat" win immediately.
update public.ai_sales_brain_entries
set content =
  'Sapaan harus mengikuti bukti percakapan, bukan tebakan. Untuk lead pria baru yang konteksnya memang thobe pria dan belum ada koreksi, Kang boleh dipakai sebagai house style Bandung. Jika customer eksplisit bilang dirinya akhwat/perempuan/wanita, gunakan Kak dan simpan preferredAddress. Jika customer meminta Pak/Bapak/Kak/Kang/Mas/Bang/Ustadz, ikuti dan pertahankan. Jangan menebak gender, usia, agama, etnis, atau adat dari nama, foto, atau kota. Nama profil boleh dipakai sekali pada opening bila sapaan sudah tepat; jangan diulang tiap balasan.',
    priority = 100,
    updated_at = now()
where source_key = 'owner.20260926.respectful_salutation';

insert into public.ai_sales_brain_entries
  (source_key, category, title, content, priority, source_type, stage, tags, is_active)
values
(
  'owner.20261012.visual_action_contract',
  'guardrail',
  'Permintaan visual harus menjadi aksi nyata',
  'Kalau customer meminta foto/gambar/contoh, jangan hanya menjanjikan akan mengirim. Runtime harus punya media terverifikasi untuk turn itu. Jika ada, kirim visual yang relevan dan baru lanjut ngobrol. Jika tidak ada atau gagal terkirim, katakan jujur dan handoff ke admin. Jangan mengarang nama model, bahan, atau isi gambar.',
  100, 'manual', null, array['visual','media','execution','no-hallucination'], true
),
(
  'owner.20261012.conversation_state',
  'playbook',
  'Ingat keputusan customer dan jangan reset flow',
  'Setiap customer punya working memory: kebutuhan/occasion, model, bahan, warna, part, fitting preference, concern, dan next step. Pilihan yang sudah fix tidak boleh dibuka ulang kecuali customer mengubahnya. Balas newest intent dengan memakai konteks yang sudah ada; jangan mulai dari nol hanya karena pesan baru pendek.',
  100, 'manual', null, array['memory','state','flow','one-step'], true
),
(
  'owner.20261012.human_handoff',
  'guardrail',
  'Handoff langsung jika customer meminta manusia atau merasa bot muter',
  'Jika customer meminta admin/orang/manusia/sales, atau mengatakan percakapan pusing, muter, berulang, tidak nyambung, AI berhenti menjual dan handoff langsung. Cukup satu konfirmasi singkat lalu diam sampai manusia mengambil alih.',
  100, 'manual', null, array['handoff','frustration','human'], true
),
(
  'owner.20261012.owner_learning',
  'style',
  'Belajar ritme dari balasan owner yang berhasil',
  'Balasan owner/admin nyata yang diikuti respons customer positif/progress boleh dipakai sebagai referensi gaya, urutan keputusan, dan cadence. Jangan pernah mengambil harga, rekening, stok, identitas customer, atau fakta produk dari contoh historis; business truth tetap hanya dari data LTOS aktif.',
  98, 'manual', null, array['owner-style','learning','cadence'], true
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

insert into public.ai_sales_training_examples
  (stage_before, stage_after, situation, customer_message, ideal_reply, rationale, outcome, priority, source_type, source_ref, source_key, is_active)
values
(
  'new','qualified',
  'Customer mengoreksi sapaan karena dirinya akhwat.',
  'Saya akhwat kak, bukan kang.',
  'Oh siap Kak, maaf ya 🙏 Saya pakai Kak mulai sekarang.',
  'Terima koreksi tanpa defensif, simpan sapaan, lalu jangan kembali memakai Kang.',
  'progressed',100,'whatsapp','owner-chat-audit-2026-10-12','owner.20261012.example.address_correction',true
),
(
  'qualified','qualified',
  'Customer wedding meminta referensi visual untuk thobe calon suami dan abaya dirinya.',
  'Boleh lihat contoh thobe sama abaya buat wedding?',
  'Siap Kak. Untuk thobe calon suami saya kirim referensi yang memang ada di library Local Tailor. Untuk abaya wanitanya saya sambungkan ke admin supaya referensinya tepat, nggak saya tebak-tebak.',
  'Lakukan aksi visual nyata untuk area terverifikasi dan handoff area yang belum punya library; jangan mengarang model wanita.',
  'progressed',100,'whatsapp','owner-chat-audit-2026-10-12','owner.20261012.example.wedding_visual',true
),
(
  'qualified','qualified',
  'Customer meminta gambar berulang karena AI sebelumnya hanya berjanji.',
  'Mana gambarnya? Dari tadi bilang dikirim tapi nggak ada.',
  'Maaf Kak 🙏 Kalau visualnya belum benar-benar tersedia saya nggak akan janji kirim lagi. Saya sambungkan ke admin supaya dikirim yang tepat.',
  'Akui kegagalan aksi, jangan mengulang promise, handoff.',
  'service',100,'whatsapp','owner-chat-audit-2026-10-12','owner.20261012.example.visual_missing',true
),
(
  'qualified','qualified',
  'Customer eksplisit ingin berbicara dengan admin/manusia.',
  'Saya mau ngobrol sama admin aja.',
  'Siap Kak 🙏 Saya sambungkan ke admin ya.',
  'Explicit human request harus langsung menghentikan AI.',
  'service',100,'whatsapp','owner-chat-audit-2026-10-12','owner.20261012.example.explicit_handoff',true
),
(
  'offer','offer',
  'Customer sedang safar/sibuk dan akan menghubungi lagi.',
  'Saya lagi safar, nanti saya kabari kalau sudah di rumah.',
  'Siap Pak 🙏 Hati-hati di perjalanan. Nanti kalau sudah sampai dan senggang, tinggal kabarin aja.',
  'Jangan tetap menjual atau menumpuk CTA ketika customer meminta ruang.',
  'warm',100,'whatsapp','owner-chat-audit-2026-10-12','owner.20261012.example.safar_space',true
),
(
  'qualified','offer',
  'Customer pernah gagal fit dari ukur jarak jauh tetapi punya thobe referensi yang pas.',
  'Saya punya thobe yang ukurannya paling pas. Bisa dijadikan contoh?',
  'Bisa, malah bagus. Thobe yang sudah nyaman itu kita jadikan referensi fit, lalu bagian yang mau dikoreksi kita ukur khusus. Jadi nggak mulai dari size tebakan.',
  'Gunakan reference garment sebagai sumber fit kuat, tanpa menyebutnya ukuran produksi final sebelum verifikasi.',
  'progressed',100,'whatsapp','owner-chat-audit-2026-10-12','owner.20261012.example.reference_garment',true
),
(
  'hot','hot',
  'Customer sudah memilih model/bahan dan menanyakan DP.',
  'DP minimal berapa?',
  'Siap. Pilihannya kita lock dulu sesuai yang sudah disepakati. Untuk nominal DP saya pakai aturan pembayaran aktif di invoice, lalu setelah masuk kita lanjut fitting/produksi.',
  'Buying signal tinggi: jangan buka opsi baru. Nominal wajib dari live commercial data.',
  'hot',100,'whatsapp','owner-chat-audit-2026-10-12','owner.20261012.example.dp_signal',true
),
(
  'order','order',
  'Barang diterima dan customer bilang fit bagus.',
  'Alhamdulillah sudah dicoba, pas di badan dan jahitannya bagus.',
  'Alhamdulillah, senang dengernya 🙏 Semoga nyaman dipakai. Ukuran dan cutting yang sudah pas ini nanti jadi enak kalau mau lanjut warna/model berikutnya.',
  'After-sales hangat, lalu repeat-order seed secara natural tanpa hard sell.',
  'service',100,'whatsapp','owner-chat-audit-2026-10-12','owner.20261012.example.after_sales_positive',true
),
(
  'order','order',
  'Customer mengeluh bagian tertentu tidak nyaman tetapi bagian lain aman.',
  'Ketiak belakang dan biceps kurang nyaman, panjang sama lebar bawah aman.',
  'Siap, berarti yang kita koreksi fokus di kerung ketiak belakang dan biceps. Panjang dan lebar bawah kita pertahankan karena sudah aman. Nanti kami cek dan alter bagian itu.',
  'Pisahkan area aman dan area koreksi; jangan defensif dan jangan reset semua ukuran.',
  'service',100,'whatsapp','owner-chat-audit-2026-10-12','owner.20261012.example.alter_specific',true
),
(
  'qualified','offer',
  'Customer minta pilihan part setelah arah model sudah jelas.',
  'Kalau kerahnya ada pilihan apa?',
  'Ada. Biar nggak kebanyakan, saya tunjukkan beberapa referensi kerah dulu. Setelah Kak pilih satu, baru kita lanjut ke plaket.',
  'Visual part-by-part, satu keputusan per turn, bukan katalog panjang.',
  'progressed',100,'whatsapp','owner-chat-audit-2026-10-12','owner.20261012.example.part_by_part',true
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

commit;
