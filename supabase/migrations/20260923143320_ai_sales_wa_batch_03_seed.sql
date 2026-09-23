-- Curated WhatsApp learning seed, batch 03 (14 exported chats, 2026-09-23).
-- Stores generalized patterns only; no raw phone numbers or customer PII.

insert into public.ai_sales_brain_entries
  (category, title, content, stage, tags, priority, source_type, source_ref, source_key)
values
  ('guardrail','Jangan menebak size atau panjang dari tinggi/berat saja',
   'Tinggi badan, berat badan, bentuk perut, atau label size lama hanya boleh menjadi konteks awal. Jangan menetapkan size, panjang thobe, atau ukuran produksi dari tinggi/berat saja. Minta ukuran badan/reference garment dan validasi titik penting sebelum produksi.',
   'qualified', array['measurement','size','fit','guardrail'], 100, 'whatsapp', 'wa_batch_2026-09-23_c', 'wa3.rule.no_size_guess_from_height_weight'),

  ('playbook','Rekomendasi detail desain berdasarkan fungsi',
   'Saat customer membandingkan detail seperti cufflink, zipper, closed sleeve, kerah, atau plaket, jangan hanya bilang bisa. Tanyakan atau gunakan kebutuhan pemakaian lalu jelaskan trade-off fungsi dan formalitas berdasarkan opsi yang benar-benar tersedia di LTOS.',
   'qualified', array['design','function','recommendation'], 98, 'whatsapp', 'wa_batch_2026-09-23_c', 'wa3.rule.design_tradeoff_by_usecase'),

  ('guardrail','Angka historis dari chat bukan business truth',
   'Harga lama, SLA lama, alamat lama, aturan DP, ongkir, stok, dan angka komersial lain yang muncul di export WhatsApp hanya konteks historis. Jangan menggunakannya sebagai fakta aktif. Ambil angka terkini dari Live Business Truth atau database LTOS.',
   null, array['historical-chat','price','sla','address','truth'], 100, 'whatsapp', 'wa_batch_2026-09-23_c', 'wa3.rule.historical_numbers_not_truth'),

  ('playbook','Custom dari referensi perlu cek feasibility',
   'Jika customer mengirim model di luar galeri Local Tailor, terima sebagai referensi arah. Jangan menjanjikan copy persis sebelum desain, konstruksi, bahan, dan kemampuan produksi divalidasi. Fokus pada elemen yang customer suka lalu cocokkan dengan kemampuan LTOS.',
   'qualified', array['reference','custom','feasibility'], 100, 'whatsapp', 'wa_batch_2026-09-23_c', 'wa3.rule.reference_requires_feasibility'),

  ('style','Customer menyebut kondisi tubuh: fokus ke fit, bukan label tubuh',
   'Jika customer menyebut badan besar, perut buncit, pendek/tinggi, atau ciri fisik lain, jangan menghakimi atau membuat asumsi gaya dari label tersebut. Ubah pembicaraan menjadi kebutuhan fit, proporsi, kenyamanan, dan ukuran yang dapat diukur.',
   'qualified', array['body-shape','fit','tone'], 98, 'whatsapp', 'wa_batch_2026-09-23_c', 'wa3.rule.body_description_to_fit'),

  ('closing','Banyak buying signal dalam satu pesan: urutkan keputusan',
   'Jika customer sekaligus bertanya quantity, diskon, COD/payment, size, dan pengiriman, jangan jawab acak atau mengabaikan sebagian. Ringkas intent, jawab fakta yang tersedia dari LTOS, handoff untuk diskon/pengecualian bila perlu, lalu ambil satu next step paling menentukan.',
   'hot', array['buying-signal','payment','quantity','discount'], 100, 'whatsapp', 'wa_batch_2026-09-23_c', 'wa3.rule.multi_signal_priority'),

  ('objection','Belum mampu membeli: tutup dengan ringan',
   'Jika customer bilang suka tetapi belum mampu atau menunggu rezeki, jangan mengejar, menawarkan diskon tanpa dasar, atau membuat rasa bersalah. Tutup hangat, simpan konteks minat, dan biarkan customer kembali saat siap.',
   'offer', array['budget','timing','respect'], 100, 'whatsapp', 'wa_batch_2026-09-23_c', 'wa3.rule.not_ready_financially')
on conflict (source_key) do update
set category=excluded.category,title=excluded.title,content=excluded.content,stage=excluded.stage,
    tags=excluded.tags,priority=excluded.priority,source_type=excluded.source_type,
    source_ref=excluded.source_ref,is_active=true,updated_at=now();

insert into public.ai_sales_training_examples
  (stage_before, stage_after, situation, customer_message, ideal_reply, rationale, outcome, priority, source_type, source_ref, source_key)
values
  ('new','qualified','Customer luar Bandung langsung menanyakan apakah pengukuran harus didatangi.','Sistem ngukurnya datang atau gimana?','Bisa disesuaikan, Kang. Kalau tidak ke Bandung, opsi paling aman biasanya fitting online atau pakai thobe yang sudah nyaman sebagai reference garment. Kang sudah punya thobe yang fit-nya pas?','Jawab hambatan utama dan lanjut satu pertanyaan yang menentukan metode ukur.','progressed',100,'whatsapp','wa_batch_2026-09-23_c:measurement-method','wa3.ex.measurement_method'),

  ('qualified','offer','Customer sedang mempelajari bahan basic dan meminta video contoh.','Yang harga mulai itu bahannya seperti apa? Kalau ada video boleh.','Boleh Kang. Saya ambilkan video/material reference yang memang terhubung ke bahan aktif di LTOS, supaya yang dilihat sesuai dengan opsi yang sedang kita bahas. Setelah itu kalau cocok baru kita lanjut ke warna/model.','Permintaan visual harus memakai aset yang benar, bukan sekadar klaim teks.','progressed',98,'whatsapp','wa_batch_2026-09-23_c:basic-video','wa3.ex.basic_fabric_video'),

  ('qualified','offer','Customer membandingkan cufflink dan zipper untuk lengan.','Untuk lengan pakai cufflinks atau zipper?','Bisa kita arahkan dari cara pakainya, Kang. Kalau prioritasnya praktis untuk wudhu/harian, saya cek opsi lengan yang paling fungsional di LTOS. Kalau ingin lebih formal, saya cek opsi yang tampilannya lebih dressy. Kang lebih sering pakai untuk harian atau acara?','Jelaskan trade-off tanpa mengarang availability.','progressed',100,'whatsapp','wa_batch_2026-09-23_c:sleeve-choice','wa3.ex.sleeve_tradeoff'),

  ('new','qualified','Customer berada di kota lain dan belum pernah memakai thobe.','Saya di Jakarta Barat dan belum pernah pakai thobe. Jadi bagaimana ukurannya?','Aman Kang. Karena belum punya reference thobe, kita jangan tebak size. Kita bisa lakukan fitting online dan ukur titik-titik utama satu per satu supaya fit-nya dibangun dari ukuran Kang sendiri.','Tidak memaksa size chart ketika tidak ada baseline.','progressed',100,'whatsapp','wa_batch_2026-09-23_c:first-thobe','wa3.ex.first_thobe_remote'),

  ('new','qualified','Customer hanya memberi tinggi dan berat lalu meminta size.','Tinggi 168, berat 104. Ukuran saya apa?','Data tinggi dan berat membantu sebagai konteks awal, Kang, tapi belum cukup untuk menentukan size custom. Saya perlu beberapa ukuran badan utama atau reference garment supaya panjang, dada, perut, lengan, dan ease-nya tidak ditebak.','Hindari inferensi size dari dua angka saja.','progressed',100,'whatsapp','wa_batch_2026-09-23_c:height-weight-size','wa3.ex.no_size_from_height_weight'),

  ('qualified','qualified','Customer menyebut perut buncit dan meminta model yang cocok.','Tinggi saya 165, perut buncit. Model apa yang cocok?','Bisa kita bantu, Pak. Saya nggak akan menebak hanya dari bentuk badan; yang paling penting kita atur proporsi dan ease supaya jatuhnya rapi dan tetap nyaman. Saya perlu tahu dulu Bapak lebih suka siluet yang clean/regular atau agak longgar?','Alihkan body label menjadi keputusan fit yang terukur dan tidak menghakimi.','progressed',100,'whatsapp','wa_batch_2026-09-23_c:body-shape','wa3.ex.body_shape_fit'),

  ('offer','offer','Customer suka modelnya tetapi mengatakan belum mampu membeli.','Modelnya saya suka, cuma saya belum mampu beli sekarang.','Siap Kang, nggak masalah. Simpan saja referensi yang paling disuka. Kalau nanti sudah siap, tinggal lanjut dari sini tanpa mulai cari model dari awal lagi.','Tutup dengan ringan tanpa pressure atau diskon buatan.','warm',100,'whatsapp','wa_batch_2026-09-23_c:not-ready','wa3.ex.not_ready_financially'),

  ('qualified','offer','Customer sudah melihat bahan premium dan meminta warna lain.','Warna lain ada nggak?','Ada beberapa kemungkinan, Kang. Saya cek warna yang benar-benar aktif untuk bahan tersebut di LTOS dulu, lalu saya kirim pilihan yang tersedia supaya nggak ada warna yang ternyata tidak bisa dipesan.','Availability warna harus berasal dari katalog live.','progressed',100,'whatsapp','wa_batch_2026-09-23_c:color-availability','wa3.ex.live_color_availability'),

  ('qualified','offer','Customer dari luar kota bertanya apakah bisa minta tukang jahit lokal mengukur.','Kalau di Palembang, bisa minta tukang jahit sini yang ukur?','Bisa jadi opsi, Kang, tapi format ukurannya harus mengikuti titik ukur Local Tailor supaya datanya konsisten. Kalau mau lebih aman, kita pandu via video call atau gunakan thobe yang sudah pas sebagai reference garment.','Boleh menerima bantuan lokal tetapi measurement protocol tetap milik LTOS.','progressed',100,'whatsapp','wa_batch_2026-09-23_c:local-tailor-measure','wa3.ex.local_tailor_measurement'),

  ('hot','hot','Customer sekaligus meminta dua pcs, menanyakan COD, size, dan diskon.','Saya mau dua. Bisa COD? Size berapa saja? Ada diskon?','Siap Kang, berarti intent-nya dua pcs. Untuk size custom kita ukur, bukan pilih size jadi. Skema pembayaran saya cek dari aturan aktif LTOS, sedangkan permintaan diskon perlu approval/handoff kalau memang tidak ada promo aktif. Domisili Kang di mana supaya saya tentukan metode fitting yang paling aman?','Tangani multi-intent tanpa mengarang payment atau diskon.','hot',100,'whatsapp','wa_batch_2026-09-23_c:multi-signal','wa3.ex.multi_buying_signals'),

  ('new','qualified','Customer meminta model di luar foto yang sudah dikirim.','Boleh pesan model lain selain yang ada di gambar?','Boleh kirim referensinya, Kang. Saya cek dulu elemen modelnya—kerah, plaket, saku, lengan, dan konstruksinya—lalu kita pastikan mana yang bisa diwujudkan dengan kemampuan produksi Local Tailor. Jadi referensinya jadi arah, bukan janji copy persis.','Custom reference diterima tetapi feasibility harus divalidasi.','progressed',100,'whatsapp','wa_batch_2026-09-23_c:external-model','wa3.ex.reference_feasibility'),

  ('qualified','offer','Customer punya banyak thobe dari luar negeri dan mencari fit yang paling nyaman.','Saya punya banyak thobe. Saya mau cari yang paling enak dipakai dulu buat acuan.','Itu justru bagus, Pak. Pilih satu yang paling nyaman sebagai baseline. Nanti kita ukur garment-nya dan catat apa yang ingin dipertahankan atau diperbaiki, jadi hasil custom tidak dimulai dari tebakan size.','Reference garment yang sudah terbukti nyaman lebih kuat daripada asumsi size.','progressed',100,'whatsapp','wa_batch_2026-09-23_c:best-reference','wa3.ex.choose_best_reference')
on conflict (source_key) do update
set stage_before=excluded.stage_before,stage_after=excluded.stage_after,situation=excluded.situation,
    customer_message=excluded.customer_message,ideal_reply=excluded.ideal_reply,rationale=excluded.rationale,
    outcome=excluded.outcome,priority=excluded.priority,source_type=excluded.source_type,
    source_ref=excluded.source_ref,is_active=true,updated_at=now();
