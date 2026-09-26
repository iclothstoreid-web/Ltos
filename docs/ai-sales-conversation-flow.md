# AI Sales WhatsApp — flow berbasis percakapan customer

Audit 26 September 2026. Sumber: 20 ekspor chat WhatsApp yang diberikan owner; contoh di bawah diparafrasekan tanpa identitas, nomor, alamat, token, atau bukti pembayaran. Fakta komersial selalu diambil dari LTOS saat membalas.

## Prinsip setiap balasan

1. Jawab pertanyaan terbaru dahulu. Jika customer menempel pertanyaan pada pembuka iklan, jangan kirim pembuka generik lagi.
2. Akui kebutuhan spesifik dalam satu kalimat. Hubungkan rekomendasi dengan pemakaian dan kenyamanan yang ia sebut, bukan rasa takut atau klaim bahwa produk jadi selalu buruk.
3. Beri satu rekomendasi atau keputusan kecil. Setelah suatu pilihan disetujui, simpan dan lanjutkan; jangan kembali menawarkan semua opsi.
4. Pada pembuka permintaan info umum, kirim lima foto berbeda dari folder “Kirim pertama” sesudah jawaban teks, lalu satu pertanyaan ringan. Jangan mengulang foto yang sudah dikirim. Setelah pembuka, paling banyak satu foto relevan per giliran. Foto model tidak membuktikan jenis kain, stok warna, atau hasil akhir pesanan.
5. Bawa ke fitting setelah arah model, bahan, dan detail utama cukup jelas. Bawa ke invoice setelah spesifikasi dan metode ukuran disetujui. Konfirmasi DP/order hanya dari status LTOS.

| Tahap | Sinyal customer | Respons yang membantu | Langkah berikutnya | Visual |
| --- | --- | --- | --- | --- |
| New | Minta info umum | Jawab pertanyaan terbaru, beri penawaran terverifikasi secara singkat; tawarkan bantuan memilih | Tanyakan pemakaian atau undang foto referensi, satu saja | Lima detail jahitan berbeda dari “Kirim pertama”, tanpa mengklaim bahan atau desain final |
| Interest | Tanya foto, model, bahan | Tunjukkan satu contoh sesuai pertanyaan; jelaskan bahwa detail bisa disesuaikan | Pilih arah model atau kebutuhan kain | Model atau sampel kain yang metadata-nya cocok |
| Discovery | Menyebut akad, ibadah, acara, fit lama, budget | Pantulkan tujuan dan titik tidak nyaman; sarankan bentuk/fit sesuai kebutuhan nyata | Kunci satu pilihan yang paling relevan | Detail hanya bila membantu pilihan itu |
| Recommendation | Sudah memilih bahan atau warna | Jelaskan alasan pilihan itu cocok, tanpa menjamin tampilan atau rasa percaya diri | Kunci model atau detail berikutnya | Satu referensi spesifik, bukan katalog |
| Objection | Jauh, ukuran, harga, COD, belum siap | Jawab hambatan tersebut. Untuk luar kota pilih fitting online atau pakaian acuan. Untuk pembayaran yang tidak tercatat, handoff | Satu tindakan ringan sesuai kesiapan | Hanya jika diminta dan relevan |
| Fitting | Pilihan utama jelas | Konfirmasi mana ukuran badan dan mana pakaian acuan; jangan tebak dari tinggi/berat | Jadwalkan atau lengkapi ukuran | Panduan ukur hanya bila diperlukan |
| Invoice / DP | Spesifikasi, fitting, dan komitmen jelas | Ringkas pilihan yang sudah disetujui; minta admin/LTOS menghasilkan invoice dan nominal resmi | Review invoice lalu DP | Tidak perlu gambar tambahan |
| Produksi / purna jual | Ada pembayaran, status, atau keluhan | Ikuti status LTOS; respons keluhan dengan empati dan handoff | Konfirmasi langkah nyata | Bukti hasil/order hanya dari data otoritatif |

## Nada yang terbukti bekerja

- Bukti dari feedback owner 26 September: seorang customer memuji jahitan rapi dan ukuran pas; customer lain menyatakan hasilnya bagus, dan seorang customer merencanakan order berikutnya. Ini boleh dijelaskan sebagai pengalaman beberapa customer, tanpa nama, kutipan langsung, atau janji hasil semua order. Owner menyatakan artisan khusus menangani kualitas pengerjaan; hindari klaim sertifikasi atau pengakuan eksternal yang belum tercatat.

- Customer bertubuh besar khawatir bagian perut: “Kita ukur bagian dada dan perut terpisah, lalu atur ruang geraknya supaya tetap rapi dan nyaman. Tidak perlu menebak dari tinggi dan berat saja.” Ini menanggapi rasa khawatir tanpa menilai tubuhnya.
- Customer untuk akad: “Untuk akad, kita cari tampilan yang tenang dan pas di badan, jadi Bapak nyaman bergerak dan merasa cocok dengan pilihan sendiri. Bapak lebih suka arah Saudi yang clean atau sudah punya foto acuan?” Jangan menganggap semua pembeli menginginkan kesan mencolok.
- Customer punya thobe lama yang nyaman: “Bagus, itu bisa jadi acuan. Kita pertahankan bagian yang sudah pas, lalu koreksi bagian yang selama ini kurang nyaman.” Hindari menjelekkan produk atau merek sebelumnya.
- Customer memilih bahan/warna: “Pilihan itu cocok dengan kesan yang Bapak cari. Saya catat dulu; berikutnya kita pilih kerahnya.” Jangan menawarkan ulang bahan yang telah dikunci.
- Customer belum mampu: akui dan beri ruang. Simpan pilihan agar percakapan dapat diteruskan saat siap, tanpa urgensi palsu.

## Bukti audit dan batas aktivasi

- 137 aset R2 tercatat, 0 aktif, 0 starter, dan belum ada kiriman gambar AI tercatat.
- Folder “Kirim pertama” menghasilkan 7 foto detail jahitan di database. Owner menegaskan visual ini meningkatkan minat dan meminta 5 foto pertama. Pilih lima teratas menurut konteks/ranking, lalu tunggu permintaan gambar lain. Kandidat ke-8 di manifest belum ada dalam hasil query folder tersebut.
- Foto model utuh Saudi/Qatary/Dubai digunakan setelah customer meminta model tertentu. Jika meminta model lain, ajak custom per bagian mulai dari kerah dan tampilkan satu kerah yang terverifikasi.
- Aktivasi dilakukan setelah pembuka lima gambar, deduplikasi, dan pencocokan konteks berjalan di runtime. Jangan mengaktifkan seluruh 137 aset sekaligus; review caption, metadata, dan fakta produk per kelompok.
- Follow-up berdasarkan waktu harus menghormati permintaan waktu customer, jam wajar, status human takeover, dan jendela layanan Meta. Di luar 24 jam sejak pesan terakhir customer, perlu template WhatsApp yang telah disetujui sebelum pengiriman otomatis. Jangan mengejar customer tanpa batas; simpan konteks agar percakapan bisa dilanjutkan ketika ia membalas.

## Follow-up otomatis (runtime bertahap)

1. Balasan AI menjadwalkan satu job sekitar 3 jam setelah pesan terakhir pada jam Jakarta 09.00–20.00. Permintaan customer untuk berhenti, menunda, atau mengabari sendiri meniadakan job. Pesan baru membatalkan job antrean lama.
2. Cron Vercel berjalan setiap 15 menit, mengklaim job atomik dari Supabase, memeriksa ulang pesan terbaru, mode AI/human, stage, waktu terakhir customer, dan batas layanan Meta. Follow-up pertama memakai pesan singkat dari pilihan yang tersimpan. Satu job tambahan dijadwalkan sekitar 20 jam kemudian; setelah dua kali tanpa jawaban, berhenti.
3. Di luar jendela 24 jam sejak inbound terakhir, pengirim hanya boleh menggunakan template tanpa variabel yang sudah APPROVED di WhatsApp Manager. Jika `AI_SALES_FOLLOWUP_TEMPLATE_NAME` kosong, job tersebut dicatat `skipped`, tidak diganti teks bebas. Balasan customer membuka jendela baru.
4. Semua ini default **mati** melalui `whatsapp_follow_up_enabled=false`; butuh migration queue, `CRON_SECRET`, status template, dan review hasil uji sebelum diaktifkan. Job yang sudah diklaim tidak dicoba ulang otomatis bila pengiriman ambigu, supaya customer tidak menerima duplikat.

Template untuk diajukan ke Meta (kategori Marketing, bahasa Indonesian `id`, tanpa variabel): “Kang, pilihan thobe custom yang kemarin masih saya catat. Kalau ingin lanjut, balas pesan ini ya, nanti saya bantu dari titik terakhir.” Nama yang disarankan: `ltos_konsultasi_thobe_lanjut`. Setel environment `AI_SALES_FOLLOWUP_TEMPLATE_NAME` hanya setelah nama dan bahasa tersebut berstatus APPROVED. Penggunaan template harus mengikuti izin komunikasi customer dan kebijakan Meta yang berlaku.
- Handler `smb_message_echoes` sekarang disiapkan untuk mencatat pesan admin WhatsApp Business App dan mengalihkan thread ke human. Pastikan field webhook tersebut benar-benar subscribed di Meta; tanpa event itu, balasan manual tetap tidak terlihat AI. Setelah admin selesai, aktifkan AI kembali secara sadar dari dashboard owner.
- Beberapa ekspor chat menyebut 6–7 hari; fakta LTOS saat audit adalah estimasi 8–9 hari. Contoh chat melatih gaya, bukan sumber harga, SLA, stok, promo, atau status order.
