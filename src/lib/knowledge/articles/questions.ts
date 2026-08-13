import type { KnowledgeArticle } from '../types'

// Sprint W6-10 — FAQ Domination Layer. 24 short, question-first pages —
// deliberately much shorter than the 58 deep-guide articles (target:
// featured snippets / People Also Ask / AI Overview, which reward a
// direct, self-contained answer near the top, not 1,500 words). Each page
// still uses the full KnowledgeArticle schema and links back to the
// relevant deep-dive article for readers who want more depth.
export const QUESTION_ARTICLES: KnowledgeArticle[] = [
  {
    slug: 'what-is-thobe',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Apa Itu Thobe?',
    navLabel: 'Apa Itu Thobe',
    metaDescription: 'Thobe adalah pakaian panjang menyeluruh dari bahu hingga mata kaki yang umum dikenakan pria muslim. Penjelasan singkat dan langsung.',
    dek: 'Jawaban singkat untuk pertanyaan paling dasar tentang thobe.',
    definition:
      'Thobe adalah pakaian panjang satu potongan menyeluruh dari bahu hingga mata kaki, umumnya berkerah dan berlengan panjang, yang dikenakan pria muslim untuk ibadah, acara formal, maupun pemakaian harian.',
    quickAnswer:
      'Thobe adalah pakaian panjang menyeluruh dari bahu hingga mata kaki, berbeda dari kemeja atau jubah karena dikenakan sebagai satu potongan tanpa sekat di pinggang.',
    keyTakeaways: [
      'Thobe dikenakan sebagai satu potongan menyeluruh, bukan atasan dan bawahan terpisah',
      'Berbeda dari kemeja karena mencakup titik ukur tambahan seperti panjang badan total',
      'Digunakan untuk ibadah, acara formal, maupun pemakaian harian tergantung bahan dan gaya',
      'Nama dan detail potongan bervariasi antar budaya (Saudi, Emirati, Kuwaiti)',
    ],
    sections: [
      {
        heading: 'Ringkasan',
        block: {
          kind: 'paragraphs',
          items: [
            'Karena dikenakan sebagai satu potongan penuh, proporsi setiap titik ukur pada thobe — lingkar leher, lebar bahu, lingkar dada, panjang lengan, dan panjang badan — harus selaras satu sama lain agar hasil akhirnya terlihat proporsional.',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah thobe sama dengan jubah?', answer: 'Istilah keduanya sering dipakai bergantian, meski "jubah" kadang merujuk pada pakaian yang lebih longgar atau berbeda konstruksinya tergantung konteks budaya.' },
      { question: 'Apa perbedaan thobe dan kemeja?', answer: 'Thobe adalah satu potongan menyeluruh dari bahu hingga mata kaki, sementara kemeja hanya menutupi tubuh bagian atas dan dipadukan dengan celana terpisah.' },
    ],
    relatedArticles: [
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'measurements', slug: 'how-to-measure-body' },
    ],
    relatedCategories: ['fabrics', 'styling'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'bespoke-vs-tailor',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Apa Beda Bespoke dan Tailor Biasa?',
    navLabel: 'Bespoke vs Tailor',
    metaDescription: 'Bespoke berarti pola dibuat baru dari nol untuk Anda, sementara tailor biasa sering menyesuaikan pola yang sudah ada. Penjelasan singkat.',
    dek: 'Jawaban singkat tentang perbedaan bespoke dan jasa jahit/tailor pada umumnya.',
    definition:
      'Bespoke berarti pola pakaian dibuat baru dari nol berdasarkan pengukuran individu, sementara "tailor" secara umum bisa merujuk pada berbagai tingkat layanan jahit, dari menyesuaikan pola siap pakai hingga benar-benar bespoke.',
    quickAnswer:
      'Bespoke secara teknis berarti pola dibuat baru dari nol khusus untuk Anda, sementara istilah "tailor" atau "penjahit" bisa mencakup layanan yang jauh lebih sederhana seperti hanya mengubah ukuran pakaian jadi.',
    keyTakeaways: [
      'Bespoke = pola baru dari nol; tailor umum bisa berarti sekadar mengubah ukuran pakaian jadi',
      'Tanyakan langsung apakah pola benar-benar dibuat baru sebelum memesan',
      'Bespoke umumnya melibatkan lebih banyak sesi fitting',
      'Harga bespoke umumnya lebih tinggi karena proses yang lebih menyeluruh',
    ],
    sections: [
      {
        heading: 'Ringkasan',
        block: {
          kind: 'paragraphs',
          items: [
            'Istilah "tailor" di pasar sangat luas — mulai dari jasa permak sederhana hingga atelier bespoke penuh. Kejelasan proses (apakah pola dibuat baru atau disesuaikan) adalah cara paling akurat membedakan keduanya, bukan sekadar nama layanan.',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah semua tailor menawarkan bespoke?', answer: 'Tidak. Banyak tailor menawarkan jasa permak atau made-to-measure, bukan bespoke penuh dengan pola baru dari nol.' },
      { question: 'Bagaimana cara memastikan saya mendapat layanan bespoke sesungguhnya?', answer: 'Tanyakan secara spesifik apakah pola dibuat baru dari pengukuran Anda, dan berapa kali sesi fitting yang disertakan.' },
    ],
    relatedArticles: [
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'tailoring', slug: 'bespoke-vs-made-to-measure' },
    ],
    relatedCategories: ['tailoring'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'linen-for-hot-weather',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Apakah Linen Cocok untuk Cuaca Panas?',
    navLabel: 'Linen untuk Cuaca Panas',
    metaDescription: 'Linen sangat cocok untuk cuaca panas karena sirkulasi udaranya tinggi, meski mudah kusut. Penjelasan singkat kelebihan dan kekurangannya.',
    dek: 'Jawaban singkat soal kecocokan linen untuk iklim panas.',
    definition:
      'Linen sangat cocok untuk cuaca panas karena serat berongganya menyalurkan panas keluar dari tubuh dan menyerap kelembapan dengan baik, meski memiliki kekurangan mudah kusut.',
    quickAnswer:
      'Ya, linen adalah salah satu bahan tersejuk untuk cuaca panas berkat sirkulasi udaranya yang tinggi, dengan trade-off bahan ini mudah kusut dibanding katun atau polyester.',
    keyTakeaways: [
      'Linen memiliki sirkulasi udara tertinggi di antara bahan alami umum',
      'Menyerap kelembapan hingga 20% dari beratnya tanpa terasa basah',
      'Mudah kusut — pertimbangan penting jika perlu tampilan rapi sepanjang hari',
      'Katun Jepang adalah alternatif jika ingin kesejukan tanpa kerutan seekstrem linen',
    ],
    sections: [
      {
        heading: 'Ringkasan',
        block: {
          kind: 'paragraphs',
          items: [
            'Untuk aktivitas outdoor atau perjalanan seperti umrah di cuaca sangat panas, linen adalah pilihan yang sangat direkomendasikan. Untuk acara formal yang menuntut tampilan rapi berjam-jam, pertimbangkan alternatif seperti katun Jepang atau premium cotton.',
          ],
        },
      },
    ],
    whenToChoose: 'Pilih linen jika prioritas utama Anda adalah kesejukan maksimal dan Anda tidak keberatan dengan tampilan kerutan alami sebagai bagian dari karakter bahan.',
    faq: [
      { question: 'Apakah linen cocok untuk umrah?', answer: 'Sangat cocok — linen adalah salah satu bahan yang direkomendasikan untuk cuaca panas Mekkah dan Madinah.' },
      { question: 'Apa alternatif linen yang tidak mudah kusut?', answer: 'Katun Jepang atau premium cotton memberi sirkulasi udara yang baik dengan ketahanan kusut yang jauh lebih baik.' },
    ],
    relatedArticles: [
      { category: 'fabrics', slug: 'linen' },
      { category: 'umrah', slug: 'best-fabric' },
    ],
    relatedFabrics: [{ category: 'fabrics', slug: 'linen' }],
    relatedCategories: ['fabrics'],
    tags: { season: ['panas'] },
  },
  {
    slug: 'how-long-custom-thobe',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Berapa Lama Proses Membuat Thobe Custom?',
    navLabel: 'Lama Proses Thobe Custom',
    metaDescription: 'Proses thobe custom bespoke umumnya memakan waktu 2-3 minggu, atau 6-8 minggu untuk kebutuhan pernikahan. Penjelasan singkat timeline-nya.',
    dek: 'Jawaban singkat soal berapa lama proses thobe bespoke berlangsung.',
    definition:
      'Proses thobe custom bespoke umumnya memakan waktu 2-3 minggu dari konsultasi hingga selesai, atau 6-8 minggu jika kebutuhannya untuk acara khusus seperti pernikahan yang melibatkan koordinasi tambahan.',
    quickAnswer:
      'Thobe custom bespoke standar umumnya selesai dalam 2-3 minggu, sementara untuk kebutuhan pernikahan disarankan memesan 6-8 minggu sebelum hari-H untuk ruang fitting dan penyesuaian ekstra.',
    keyTakeaways: [
      'Thobe custom standar: 2-3 minggu dari konsultasi hingga selesai',
      'Thobe pernikahan: disarankan 6-8 minggu untuk ruang fitting tambahan',
      'Bahan premium bisa menambah waktu produksi',
      'Selalu sisakan waktu cadangan sebelum tanggal acara',
    ],
    sections: [
      {
        heading: 'Ringkasan',
        block: {
          kind: 'paragraphs',
          items: [
            'Timeline ini mencakup konsultasi, pengukuran, pembentukan pola, produksi, dan fitting akhir — memesan lebih awal dari perkiraan minimum selalu lebih aman dibanding memesan tepat mepet.',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah bisa dipercepat jika mendesak?', answer: 'Tergantung kompleksitas dan ketersediaan bahan — diskusikan urgensi Anda langsung saat konsultasi.' },
      { question: 'Kenapa thobe pernikahan butuh waktu lebih lama?', answer: 'Karena umumnya melibatkan bahan premium, detail tambahan, dan kebutuhan koordinasi dengan couple/family outfit.' },
    ],
    relatedArticles: [
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'wedding', slug: 'timeline-custom-wedding' },
    ],
    relatedCategories: ['tailoring', 'wedding'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'how-many-thobes-for-umrah',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Berapa Banyak Thobe untuk Umrah?',
    navLabel: 'Jumlah Thobe Umrah',
    metaDescription: 'Untuk umrah 9-14 hari dengan akses cuci, 3-4 thobe umumnya cukup. Penjelasan singkat cara menghitung kebutuhan Anda.',
    dek: 'Jawaban singkat soal jumlah thobe ideal untuk perjalanan umrah.',
    definition:
      'Untuk perjalanan umrah standar 9-14 hari dengan akses mencuci di penginapan, 3-4 thobe umumnya cukup, ditambah 1 potong cadangan untuk kondisi tak terduga.',
    quickAnswer:
      '3-4 thobe cukup untuk umrah 9-14 hari jika penginapan menyediakan akses mencuci; tambahkan 1-2 potong lagi jika perjalanan lebih panjang atau tanpa akses laundry.',
    keyTakeaways: [
      '3-4 thobe cukup untuk 9-14 hari dengan akses cuci',
      '5-6 thobe untuk perjalanan lebih panjang atau tanpa akses laundry',
      'Selalu sisipkan 1 potong cadangan untuk kondisi tak terduga',
      'Bahan ringan seperti katun Jepang memudahkan membawa lebih banyak potong',
    ],
    sections: [
      {
        heading: 'Ringkasan',
        block: {
          kind: 'paragraphs',
          items: [
            'Aturan praktis: bagi jumlah hari perjalanan dengan tiga (asumsi rotasi cuci setiap 2-3 hari), lalu tambahkan satu sebagai cadangan.',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah 3 thobe cukup untuk umrah 10 hari?', answer: 'Cukup jika ada akses mencuci di penginapan dan Anda nyaman dengan rotasi cuci setiap 2-3 hari.' },
    ],
    relatedArticles: [
      { category: 'umrah', slug: 'how-many-thobes' },
      { category: 'umrah', slug: 'packing-guide' },
    ],
    relatedCategories: ['umrah'],
    tags: { occasion: ['umrah'] },
  },
  {
    slug: 'slim-fit-vs-regular-fit',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Apa Beda Slim Fit dan Regular Fit Thobe?',
    navLabel: 'Slim vs Regular Fit',
    metaDescription: 'Slim fit lebih mengikuti garis tubuh dengan kelonggaran 4-5cm, regular fit lebih longgar dengan kelonggaran 6-7cm. Penjelasan singkat.',
    dek: 'Jawaban singkat soal perbedaan slim fit dan regular fit.',
    definition:
      'Slim fit mengikuti garis tubuh lebih dekat dengan kelonggaran 4-5cm dari ukuran badan asli, sementara regular fit lebih longgar dengan kelonggaran 6-7cm untuk kenyamanan gerak sehari-hari.',
    quickAnswer:
      'Slim fit cocok untuk postur athletic/slim yang ingin tampilan terstruktur, sementara regular fit lebih fleksibel dan nyaman untuk sebagian besar bentuk tubuh dan aktivitas harian termasuk sholat.',
    keyTakeaways: [
      'Slim fit: kelonggaran 4-5cm, kesan terstruktur',
      'Regular fit: kelonggaran 6-7cm, paling umum dan fleksibel',
      'Regular/relaxed fit umumnya lebih nyaman untuk gerakan sholat',
      'Pilihan fit tidak bersifat permanen — bisa berbeda tiap pesanan',
    ],
    sections: [
      {
        heading: 'Ringkasan',
        block: { kind: 'paragraphs', items: ['Ada pilihan ketiga, relaxed fit, dengan kelonggaran 8cm ke atas, ideal untuk cuaca panas atau postur full-body.'] },
      },
    ],
    whenToChoose: 'Pilih slim fit untuk kesan formal-terstruktur, regular fit sebagai pilihan default paling aman, atau relaxed fit untuk kenyamanan maksimal di cuaca panas.',
    faq: [{ question: 'Fit mana yang paling umum dipilih?', answer: 'Regular fit adalah pilihan paling umum karena nyaman untuk sebagian besar bentuk tubuh dan aktivitas harian.' }],
    relatedArticles: [
      { category: 'measurements', slug: 'slim-vs-regular-fit' },
      { category: 'measurements', slug: 'chest' },
    ],
    relatedCategories: ['measurements'],
    tags: { fit: ['slim', 'regular'] },
  },
  {
    slug: 'how-to-measure-chest',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Bagaimana Cara Mengukur Lingkar Dada?',
    navLabel: 'Cara Mengukur Dada',
    metaDescription: 'Lingkarkan meteran di bagian dada terlebar, biasanya setinggi puting, tanpa menahan napas. Panduan singkat langkah demi langkah.',
    dek: 'Jawaban singkat cara mengukur lingkar dada dengan benar.',
    definition:
      'Lingkar dada diukur dengan melingkarkan meteran di bagian dada terlebar (biasanya setinggi puting), memastikan meteran sejajar di depan dan belakang, sambil bernapas normal tanpa menahan napas.',
    quickAnswer:
      'Lingkarkan meteran di bagian dada terlebar, pastikan sejajar dan tidak melorot di punggung, lalu baca angka sambil bernapas normal — jangan menahan napas saat diukur.',
    keyTakeaways: [
      'Ukur di bagian dada terlebar, biasanya setinggi puting',
      'Pastikan meteran sejajar horizontal, tidak melorot di punggung',
      'Bernapas normal, jangan menahan napas saat diukur',
      'Idealnya minta bantuan orang lain untuk hasil paling akurat',
    ],
    sections: [
      {
        heading: 'Ringkasan',
        block: { kind: 'paragraphs', items: ['Setelah mendapat ukuran badan asli, kelonggaran tambahan (4-8cm tergantung fit) akan ditambahkan saat pembentukan pola.'] },
      },
    ],
    faq: [{ question: 'Apakah boleh mengukur sendiri tanpa bantuan?', answer: 'Bisa, meski hasil paling akurat didapat dengan bantuan orang lain untuk memastikan meteran sejajar di bagian punggung yang sulit dijangkau sendiri.' }],
    relatedArticles: [
      { category: 'measurements', slug: 'chest' },
      { category: 'measurements', slug: 'how-to-measure-body' },
    ],
    relatedCategories: ['measurements'],
    tags: {},
  },
  {
    slug: 'best-fabric-for-wedding',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Bahan Apa yang Terbaik untuk Thobe Pernikahan?',
    navLabel: 'Bahan Terbaik Pernikahan',
    metaDescription: 'Wool blend dan katun Mesir adalah dua bahan terbaik untuk thobe pernikahan — masing-masing untuk kesan formal terstruktur vs kelembutan.',
    dek: 'Jawaban singkat soal bahan terbaik untuk thobe pernikahan.',
    definition:
      'Wool blend dan katun Mesir adalah dua bahan yang paling direkomendasikan untuk thobe pernikahan — wool blend untuk kesan formal paling terstruktur, katun Mesir untuk kelembutan dan kenyamanan sepanjang acara yang panjang.',
    quickAnswer:
      'Wool blend memberi kesan formal paling elegan untuk pernikahan, sementara katun Mesir menawarkan kelembutan dan kenyamanan lebih untuk acara yang berlangsung berjam-jam seperti resepsi.',
    keyTakeaways: [
      'Wool blend: kesan formal-terstruktur paling elegan',
      'Katun Mesir: kelembutan dan kenyamanan sepanjang acara panjang',
      'Pertimbangkan durasi acara saat memilih antara keduanya',
      'Kedua bahan cocok untuk akad maupun resepsi',
    ],
    sections: [
      {
        heading: 'Ringkasan',
        block: { kind: 'paragraphs', items: ['Untuk resepsi yang berlangsung berjam-jam dengan banyak sesi foto, kombinasi keduanya (wool blend untuk akad, katun Mesir untuk resepsi) juga umum dipilih.'] },
      },
    ],
    comparisonTable: {
      caption: 'Wool blend vs katun Mesir untuk pernikahan',
      headers: ['Bahan', 'Kesan', 'Paling Cocok'],
      rows: [
        ['Wool Blend', 'Formal, terstruktur', 'Akad, resepsi malam ber-AC'],
        ['Katun Mesir', 'Lembut, nyaman', 'Resepsi panjang, cuaca hangat'],
      ],
    },
    faq: [{ question: 'Bisakah menggunakan bahan berbeda untuk akad dan resepsi?', answer: 'Sangat umum — banyak pengantin memilih wool blend untuk akad dan katun Mesir untuk resepsi yang lebih panjang.' }],
    relatedArticles: [
      { category: 'wedding', slug: 'premium-thobe-wedding' },
      { category: 'fabrics', slug: 'egyptian-cotton' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'wool-blend' },
      { category: 'fabrics', slug: 'egyptian-cotton' },
    ],
    relatedCategories: ['wedding', 'fabrics'],
    tags: { occasion: ['pernikahan'] },
  },
  {
    slug: 'what-is-egyptian-cotton',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Apa Itu Katun Mesir?',
    navLabel: 'Apa Itu Katun Mesir',
    metaDescription: 'Katun Mesir adalah katun dengan serat extra-long staple dari lembah Nil, dikenal sangat lembut dan tahan lama. Penjelasan singkat.',
    dek: 'Jawaban singkat soal apa itu katun Mesir dan kenapa dianggap premium.',
    definition:
      'Katun Mesir adalah katun dengan serat extra-long staple (serat sangat panjang) yang secara historis ditanam di lembah Sungai Nil, menghasilkan benang lebih halus, kuat, dan lembut dibanding katun standar.',
    quickAnswer:
      'Katun Mesir adalah katun premium dengan serat panjang (extra-long staple) yang menghasilkan kelembutan dan daya tahan di atas rata-rata katun biasa.',
    keyTakeaways: [
      'Ciri utamanya adalah serat extra-long staple',
      'Semakin panjang serat, semakin halus dan kuat benang yang dihasilkan',
      'Kelembutannya justru meningkat seiring pencucian, bukan aus',
      'Berada di segmen harga premium dibanding katun standar',
    ],
    sections: [
      { heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Katun Mesir sering dianggap tolok ukur kualitas katun dunia karena kombinasi kelembutan dan daya tahannya.'] } },
    ],
    faq: [{ question: 'Apakah katun Mesir selalu dari Mesir?', answer: 'Istilah ini merujuk pada jenis serat extra-long staple, yang secara historis dan mayoritas ditanam di Mesir, meski kini juga dibudidayakan di sejumlah wilayah lain.' }],
    relatedArticles: [
      { category: 'fabrics', slug: 'egyptian-cotton' },
      { category: 'fabrics', slug: 'japanese-cotton' },
    ],
    relatedFabrics: [{ category: 'fabrics', slug: 'egyptian-cotton' }],
    relatedCategories: ['fabrics'],
    tags: {},
  },
  {
    slug: 'how-to-wash-thobe',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Bagaimana Cara Mencuci Thobe yang Benar?',
    navLabel: 'Cara Mencuci Thobe',
    metaDescription: 'Cuci thobe sesuai jenis bahannya — umumnya air dingin hingga hangat, siklus lembut, tanpa pemutih. Panduan singkat per jenis bahan.',
    dek: 'Jawaban singkat cara mencuci thobe agar bahan tetap awet.',
    definition:
      'Cara mencuci thobe yang benar bergantung pada jenis bahannya — sebagian besar bahan katun dan linen aman dicuci dengan air dingin hingga hangat pada siklus normal, sementara wool blend lebih aman dengan dry clean atau siklus paling lembut.',
    quickAnswer:
      'Cuci thobe berbahan katun/linen dengan air dingin hingga hangat siklus normal tanpa pemutih; untuk wool blend, gunakan dry clean atau siklus paling lembut dengan air dingin.',
    keyTakeaways: [
      'Katun dan linen: air dingin-hangat, siklus normal, tanpa pemutih',
      'Wool blend: dry clean direkomendasikan, atau siklus paling lembut',
      'Hindari air panas yang berisiko menyusutkan hampir semua jenis bahan',
      'Selalu cek panduan perawatan spesifik bahan sebelum mencuci',
    ],
    sections: [
      { heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Kesalahan paling umum adalah menyamaratakan cara mencuci untuk semua jenis bahan, padahal setiap bahan punya karakteristik berbeda terhadap air panas dan bahan kimia.'] } },
    ],
    faq: [{ question: 'Apakah semua thobe boleh dicuci dengan mesin cuci?', answer: 'Sebagian besar boleh dengan siklus normal, namun bahan seperti wool blend lebih aman dengan dry clean atau siklus paling lembut.' }],
    relatedArticles: [
      { category: 'care', slug: 'wash-linen' },
      { category: 'care', slug: 'dry-clean-vs-hand-wash' },
    ],
    relatedCategories: ['care'],
    tags: { service: ['care'] },
  },
  {
    slug: 'what-is-interlining',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Apa Itu Interlining pada Thobe?',
    navLabel: 'Apa Itu Interlining',
    metaDescription: 'Interlining adalah lapisan kain tersembunyi di kerah dan manset yang memberi struktur. Penjelasan singkat fungsi dan pentingnya.',
    dek: 'Jawaban singkat soal fungsi interlining pada thobe.',
    definition:
      'Interlining adalah lapisan kain tambahan tersembunyi di antara kain luar dan lapisan dalam pada kerah, manset, dan plaket kancing, berfungsi memberi struktur dan mempertahankan bentuk area tersebut.',
    quickAnswer:
      'Interlining adalah lapisan tersembunyi yang membuat kerah thobe tetap tegak rapi dan manset mempertahankan bentuknya, alih-alih terasa lembek.',
    keyTakeaways: [
      'Fungsi utamanya memberi struktur pada kerah, manset, dan plaket kancing',
      'Tanpa interlining, area ini akan terasa lembek dan mudah kehilangan bentuk',
      'Kualitas interlining sama pentingnya dengan kualitas kain utama',
      'Interlining murah cenderung terpisah dari kain luar setelah beberapa kali dicuci',
    ],
    sections: [{ heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Interlining jarang terlihat langsung namun sangat memengaruhi tampilan akhir kerah dan manset thobe.'] } }],
    faq: [{ question: 'Bagaimana cara tahu interlining thobe saya berkualitas baik?', answer: 'Kerah yang tetap tegak rapi setelah beberapa kali dicuci, tanpa bergelembung, adalah tanda interlining berkualitas baik.' }],
    relatedArticles: [
      { category: 'tailoring', slug: 'interlining-guide' },
      { category: 'tailoring', slug: 'collar-construction' },
    ],
    relatedCategories: ['tailoring'],
    tags: {},
  },
  {
    slug: 'how-much-does-bespoke-thobe-cost',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Berapa Biaya Thobe Bespoke?',
    navLabel: 'Biaya Thobe Bespoke',
    metaDescription: 'Biaya thobe bespoke bervariasi tergantung bahan, tingkat detail, dan tier layanan — konsultasikan langsung untuk estimasi akurat.',
    dek: 'Jawaban singkat soal cara mengetahui biaya thobe bespoke Anda.',
    definition:
      'Biaya thobe bespoke bervariasi tergantung pilihan bahan, tingkat detail jahitan, dan tier layanan (standar atau premium) — tidak ada angka tunggal yang berlaku untuk semua pesanan karena setiap thobe dibuat sesuai preferensi individual.',
    quickAnswer:
      'Biaya thobe bespoke tidak memiliki angka tetap karena bergantung pada bahan dan tingkat detail yang dipilih — cara paling akurat mengetahuinya adalah melalui konsultasi langsung atau estimasi harga di Design Studio.',
    keyTakeaways: [
      'Biaya bervariasi berdasarkan pilihan bahan dan tingkat detail',
      'Tier premium (jahitan tangan lebih ekstensif) menambah biaya',
      'Design Studio menyediakan estimasi harga langsung berdasarkan pilihan Anda',
      'Konsultasi gratis adalah cara paling akurat mendapat estimasi sesuai kebutuhan spesifik',
    ],
    sections: [
      {
        heading: 'Ringkasan',
        block: {
          kind: 'paragraphs',
          items: [
            'Kami tidak mempublikasikan daftar harga tetap karena setiap thobe bespoke dibuat sesuai kombinasi bahan dan detail yang dipilih klien — gunakan Design Studio untuk melihat estimasi langsung berdasarkan pilihan Anda.',
          ],
        },
      },
    ],
    faq: [{ question: 'Apakah ada cara melihat estimasi harga tanpa konsultasi dulu?', answer: 'Ya, Design Studio kami menyediakan estimasi harga langsung berdasarkan bahan dan detail yang Anda pilih.' }],
    relatedArticles: [
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'fabrics', slug: 'premium-cotton' },
    ],
    relatedCategories: ['tailoring'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'can-i-wash-wool-blend-at-home',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Bisakah Wool Blend Dicuci di Rumah?',
    navLabel: 'Cuci Wool Blend di Rumah',
    metaDescription: 'Wool blend bisa dicuci di rumah dengan siklus paling lembut dan air dingin, namun dry clean lebih direkomendasikan untuk proporsi wool tinggi.',
    dek: 'Jawaban singkat soal mencuci wool blend sendiri di rumah.',
    definition:
      'Wool blend bisa dicuci di rumah dengan siklus paling lembut dan air dingin, meski dry clean tetap lebih direkomendasikan terutama untuk wool blend dengan proporsi wool tinggi (di atas 50%).',
    quickAnswer:
      'Bisa, dengan siklus paling lembut mesin cuci dan air dingin tanpa memeras agresif — namun dry clean lebih aman terutama untuk wool blend proporsi wool tinggi atau thobe formal bernilai tinggi.',
    keyTakeaways: [
      'Siklus paling lembut + air dingin jika mencuci sendiri di rumah',
      'Jangan memeras atau memutar kain secara agresif',
      'Dry clean lebih aman untuk proporsi wool tinggi (di atas 50%)',
      'Hindari mesin pengering suhu tinggi',
    ],
    sections: [{ heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Untuk thobe wool blend bernilai tinggi seperti untuk pernikahan, dry clean profesional sepadan dengan biayanya dibanding risiko kesalahan mencuci sendiri.'] } }],
    faq: [{ question: 'Apa yang terjadi jika wool blend dicuci dengan air panas?', answer: 'Berisiko menyusut dan kehilangan struktur kainnya — selalu gunakan air dingin.' }],
    relatedArticles: [
      { category: 'care', slug: 'wool-blend-care' },
      { category: 'care', slug: 'dry-clean-vs-hand-wash' },
    ],
    relatedCategories: ['care'],
    tags: { service: ['care'] },
  },
  {
    slug: 'what-color-thobe-for-akad',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Warna Thobe Apa yang Cocok untuk Akad?',
    navLabel: 'Warna Thobe Akad',
    metaDescription: 'Navy, krem gelap, atau putih gading adalah warna paling direkomendasikan untuk akad nikah karena kesan khidmat dan tenang.',
    dek: 'Jawaban singkat soal warna thobe yang tepat untuk akad nikah.',
    definition:
      'Navy, krem gelap, atau putih gading adalah warna yang paling direkomendasikan untuk akad nikah karena memberi kesan khidmat dan tenang, sesuai suasana sakral prosesi ijab kabul.',
    quickAnswer:
      'Navy adalah pilihan paling umum dan aman untuk akad nikah karena elegan tanpa terlalu mencolok, dengan krem gelap dan putih gading sebagai alternatif yang sama-sama khidmat.',
    keyTakeaways: [
      'Navy: pilihan paling umum, elegan dan netral',
      'Krem gelap: hangat, cocok untuk akad bernuansa tradisional',
      'Putih gading: klasik, cocok untuk akad bernuansa religius kental',
      'Hindari warna terlalu terang atau mencolok yang mengurangi kesan khidmat',
    ],
    sections: [{ heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Warna untuk akad umumnya dipilih lebih tenang dibanding warna untuk resepsi, yang bisa lebih berani dan berlapis.'] } }],
    faq: [{ question: 'Apakah warna akad harus berbeda dari warna resepsi?', answer: 'Tidak wajib, namun umum dan direkomendasikan karena keduanya menuntut kesan yang berbeda.' }],
    relatedArticles: [
      { category: 'wedding', slug: 'akad-pria' },
      { category: 'wedding', slug: 'color-guide' },
    ],
    relatedCategories: ['wedding'],
    tags: { occasion: ['pernikahan', 'akad'] },
  },
  {
    slug: 'how-to-remove-wrinkles-without-iron',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Cara Menghilangkan Kerutan Thobe Tanpa Setrika?',
    navLabel: 'Kerutan Tanpa Setrika',
    metaDescription: 'Gantung thobe di kamar mandi saat mandi air panas, atau semprot air tipis lalu regangkan kain — dua trik praktis tanpa setrika.',
    dek: 'Jawaban singkat cara merapikan thobe tanpa alat setrika.',
    definition:
      'Kerutan thobe bisa dihilangkan tanpa setrika dengan menggantungnya di kamar mandi saat mandi air panas selama 10-15 menit, atau menyemprotkan air tipis lalu meregangkan kain dengan tangan.',
    quickAnswer:
      'Gantung thobe di kamar mandi selama mandi air panas berlangsung — uap air akan merilekskan kerutan tanpa perlu setrika, cara paling praktis saat bepergian.',
    keyTakeaways: [
      'Uap kamar mandi air panas merilekskan kerutan dalam 10-15 menit',
      'Semprotan air tipis + regangkan kain juga cukup efektif',
      'Steamer genggam portable adalah investasi praktis untuk yang sering bepergian',
      'Efektif untuk kerutan ringan, bukan kerutan yang sudah mengeras lama',
    ],
    sections: [{ heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Pencegahan tetap lebih baik — gantung thobe segera setelah dipakai agar kerutan tidak sempat mengeras.'] } }],
    faq: [{ question: 'Apakah teknik ini cocok saat bepergian atau umrah?', answer: 'Sangat cocok, terutama saat menginap di hotel tanpa akses setrika.' }],
    relatedArticles: [
      { category: 'care', slug: 'remove-wrinkles' },
      { category: 'umrah', slug: 'packing-guide' },
    ],
    relatedCategories: ['care'],
    tags: { service: ['care'] },
  },
  {
    slug: 'what-is-made-to-measure',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Apa Itu Made-to-Measure?',
    navLabel: 'Apa Itu Made-to-Measure',
    metaDescription: 'Made-to-measure adalah pakaian yang disesuaikan dari pola dasar standar dengan ukuran individu, berbeda dari bespoke yang membuat pola baru.',
    dek: 'Jawaban singkat soal apa itu made-to-measure.',
    definition:
      'Made-to-measure adalah metode pembuatan pakaian yang menyesuaikan pola dasar (block pattern) standar yang sudah ada dengan ukuran individu, berbeda dari bespoke yang membentuk pola benar-benar baru dari nol.',
    quickAnswer:
      'Made-to-measure menyesuaikan pola standar yang sudah ada dengan ukuran Anda, sementara bespoke membentuk pola benar-benar baru — made-to-measure umumnya lebih cepat dan terjangkau.',
    keyTakeaways: [
      'Made-to-measure = pola dasar standar yang disesuaikan, bukan dibuat baru',
      'Umumnya lebih cepat dan lebih terjangkau dibanding bespoke penuh',
      'Cocok untuk proporsi tubuh yang relatif standar',
      'Tetap jauh lebih personal dibanding ready-to-wear',
    ],
    sections: [{ heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Untuk proporsi tubuh yang sangat tidak umum, bespoke penuh memberi ruang penyesuaian yang lebih luas dibanding made-to-measure.'] } }],
    faq: [{ question: 'Apakah made-to-measure lebih murah dari bespoke?', answer: 'Umumnya ya, karena tidak memerlukan pembentukan pola dari nol seperti bespoke penuh.' }],
    relatedArticles: [
      { category: 'tailoring', slug: 'bespoke-vs-made-to-measure' },
      { category: 'tailoring', slug: 'what-is-bespoke' },
    ],
    relatedCategories: ['tailoring'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'how-often-should-i-measure-my-body',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Seberapa Sering Perlu Mengukur Ulang Badan?',
    navLabel: 'Frekuensi Ukur Ulang Badan',
    metaDescription: 'Ukur ulang badan jika berat berubah 3-5kg, ada perubahan massa otot, atau sudah lebih dari setahun sejak pengukuran terakhir.',
    dek: 'Jawaban singkat soal kapan sebaiknya mengukur ulang badan.',
    definition:
      'Pengukuran ulang badan disarankan jika terjadi perubahan berat badan lebih dari 3-5kg, perubahan massa otot signifikan, atau sudah lebih dari satu tahun sejak pengukuran terakhir.',
    quickAnswer:
      'Ukur ulang badan Anda jika berat badan berubah 3-5kg atau lebih, mengalami perubahan massa otot signifikan, atau sudah lebih dari setahun sejak pengukuran terakhir.',
    keyTakeaways: [
      'Perubahan berat badan 3-5kg adalah pemicu utama untuk ukur ulang',
      'Program olahraga intensif yang mengubah massa otot juga memerlukan ukur ulang',
      'Jeda lebih dari setahun sejak pengukuran terakhir adalah alasan umum lainnya',
      'Fitter tetap mengonfirmasi ulang titik ukur utama untuk setiap pesanan baru',
    ],
    sections: [{ heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Meski sudah memiliki Digital Body Profile tersimpan, konfirmasi ulang tetap dilakukan untuk memastikan hasil produksi presisi.'] } }],
    faq: [{ question: 'Apakah Digital Body Profile saya akan hilang jika tidak diukur ulang?', answer: 'Tidak, data tetap tersimpan — pengukuran ulang hanya diperlukan jika ada perubahan signifikan pada tubuh Anda.' }],
    relatedArticles: [
      { category: 'measurements', slug: 'how-to-measure-body' },
      { category: 'measurements', slug: 'thobe-size-guide' },
    ],
    relatedCategories: ['measurements'],
    tags: {},
  },
  {
    slug: 'is-linen-good-for-umrah',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Apakah Linen Bagus untuk Umrah?',
    navLabel: 'Linen untuk Umrah',
    metaDescription: 'Linen sangat direkomendasikan untuk umrah karena sirkulasi udaranya tinggi, cocok untuk cuaca panas Mekkah dan Madinah.',
    dek: 'Jawaban singkat soal kecocokan linen untuk perjalanan umrah.',
    definition:
      'Linen sangat direkomendasikan untuk umrah karena sirkulasi udaranya yang tinggi membantu kenyamanan selama ibadah intensif di cuaca panas Mekkah dan Madinah.',
    quickAnswer:
      'Ya, linen adalah salah satu bahan terbaik untuk umrah berkat sirkulasi udara tinggi, meski perlu diimbangi dengan bahan lain seperti katun Jepang jika Anda ingin tampilan lebih tahan kusut.',
    keyTakeaways: [
      'Sirkulasi udara linen sangat membantu kenyamanan di cuaca panas umrah',
      'Kombinasikan dengan katun Jepang untuk variasi tampilan yang lebih rapi',
      'Cepat kering, memudahkan rotasi cuci selama perjalanan',
      'Kerutan alami linen adalah trade-off yang wajar untuk kesejukannya',
    ],
    sections: [{ heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Banyak jamaah membawa kombinasi linen dan katun Jepang agar mendapat keseimbangan kesejukan dan kepraktisan.'] } }],
    faq: [{ question: 'Apakah semua thobe umrah sebaiknya berbahan linen?', answer: 'Tidak harus — kombinasi dengan katun Jepang atau katun Mesir memberi variasi yang lebih seimbang antara kesejukan dan kerapian.' }],
    relatedArticles: [
      { category: 'umrah', slug: 'best-fabric' },
      { category: 'fabrics', slug: 'linen' },
    ],
    relatedFabrics: [{ category: 'fabrics', slug: 'linen' }],
    relatedCategories: ['umrah', 'fabrics'],
    tags: { occasion: ['umrah'] },
  },
  {
    slug: 'what-to-wear-for-wedding-reception',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Apa yang Harus Dipakai untuk Resepsi Pernikahan?',
    navLabel: 'Outfit Resepsi Pernikahan',
    metaDescription: 'Untuk resepsi, pilih bahan premium seperti wool blend atau katun Mesir dengan aksesori yang lebih lengkap dibanding akad.',
    dek: 'Jawaban singkat soal outfit yang tepat untuk resepsi pernikahan.',
    definition:
      'Untuk resepsi pernikahan, pilih bahan premium seperti wool blend atau katun Mesir dengan warna yang selaras tema dekorasi, dipadukan aksesori yang lebih lengkap dibanding akad untuk kesan meriah yang sesuai momen perayaan.',
    quickAnswer:
      'Pilih bahan premium (wool blend atau katun Mesir), warna yang selaras tema dekorasi, dan bisht berkualitas tinggi sebagai aksesori utama untuk tampil maksimal di resepsi.',
    keyTakeaways: [
      'Bahan premium yang terlihat bagus dari jarak dekat maupun jarak foto',
      'Warna selaras tema dekorasi, bukan sekadar preferensi pribadi',
      'Bisht berkualitas tinggi sebagai elemen aksesori utama',
      'Pertimbangkan durasi acara — pilih bahan yang tahan kusut berjam-jam',
    ],
    sections: [{ heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Resepsi memberi ruang lebih besar untuk tampilan mewah dibanding akad yang menuntut kesederhanaan khidmat.'] } }],
    faq: [{ question: 'Apakah warna outfit resepsi harus sesuai tema dekorasi?', answer: 'Sangat direkomendasikan — warna yang selaras tema menciptakan kesan visual yang lebih kuat di foto.' }],
    relatedArticles: [
      { category: 'wedding', slug: 'resepsi-pria' },
      { category: 'wedding', slug: 'premium-thobe-wedding' },
    ],
    relatedCategories: ['wedding'],
    tags: { occasion: ['pernikahan', 'resepsi'] },
  },
  {
    slug: 'how-to-choose-thobe-color',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Bagaimana Cara Memilih Warna Thobe?',
    navLabel: 'Cara Memilih Warna Thobe',
    metaDescription: 'Pertimbangkan acara, bahan, dan preferensi pribadi saat memilih warna thobe — navy adalah pilihan paling serbaguna.',
    dek: 'Jawaban singkat soal cara memilih warna thobe yang tepat.',
    definition:
      'Cara memilih warna thobe yang tepat mempertimbangkan tiga faktor utama — jenis acara yang dituju, bahan yang dipilih, dan preferensi pribadi — dengan navy sebagai pilihan paling serbaguna jika Anda ragu.',
    quickAnswer:
      'Pertimbangkan acara (formal butuh warna gelap netral, santai bisa warna earthy), lalu sesuaikan dengan bahan dan preferensi pribadi — navy adalah pilihan paling aman jika masih ragu.',
    keyTakeaways: [
      'Acara formal: navy, hitam, atau krem gelap',
      'Acara santai: olive, krem, atau abu-abu muda',
      'Ibadah: putih atau krem netral',
      'Navy adalah pilihan paling serbaguna lintas acara',
    ],
    sections: [{ heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Warna gelap secara umum menyerap lebih banyak panas, pertimbangan penting untuk aktivitas outdoor di cuaca panas.'] } }],
    faq: [{ question: 'Apakah warna thobe memengaruhi pilihan bahan?', answer: 'Secara tidak langsung — warna gelap sering dipadukan dengan bahan berstruktur seperti wool blend, sementara putih umum pada bahan breathable seperti katun atau linen.' }],
    relatedArticles: [
      { category: 'styling', slug: 'navy-thobe' },
      { category: 'wedding', slug: 'color-guide' },
    ],
    relatedCategories: ['styling'],
    tags: {},
  },
  {
    slug: 'what-is-digital-body-profile',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Apa Itu Digital Body Profile?',
    navLabel: 'Apa Itu Digital Body Profile',
    metaDescription: 'Digital Body Profile adalah data ukuran badan Anda yang terverifikasi fitter dan tersimpan untuk pesanan thobe berikutnya.',
    dek: 'Jawaban singkat soal apa itu Digital Body Profile.',
    definition:
      'Digital Body Profile adalah data ukuran badan Anda yang telah diverifikasi langsung oleh fitter dan tersimpan sebagai acuan produksi untuk pesanan thobe bespoke berikutnya, sehingga Anda tidak perlu diukur ulang dari nol setiap kali memesan.',
    quickAnswer:
      'Digital Body Profile adalah data ukuran badan Anda yang diverifikasi fitter dan tersimpan, memungkinkan pesanan thobe berikutnya tanpa perlu pengukuran ulang dari nol.',
    keyTakeaways: [
      'Data ukuran diverifikasi langsung oleh fitter, bukan estimasi',
      'Tersimpan untuk digunakan di pesanan-pesanan berikutnya',
      'Berbeda dari estimasi online yang hanya perkiraan awal',
      'Tetap dikonfirmasi ulang oleh fitter jika ada perubahan signifikan pada tubuh',
    ],
    sections: [{ heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Digital Body Profile berbeda dari Body Profile Estimator online — yang satu adalah data produksi terverifikasi, yang lain adalah estimasi awal berbasis tinggi dan berat badan.'] } }],
    faq: [{ question: 'Apakah Digital Body Profile sama dengan estimasi ukuran online?', answer: 'Tidak. Estimasi online adalah perkiraan awal, sementara Digital Body Profile adalah data terverifikasi langsung oleh fitter yang digunakan untuk produksi.' }],
    relatedArticles: [
      { category: 'measurements', slug: 'how-to-measure-body' },
      { category: 'tailoring', slug: 'what-is-bespoke' },
    ],
    relatedCategories: ['measurements'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'how-to-store-thobe',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Bagaimana Cara Menyimpan Thobe yang Benar?',
    navLabel: 'Cara Menyimpan Thobe',
    metaDescription: 'Gunakan hanger berbahu lebar, simpan di lemari bebas kelembapan, dan beri jarak cukup antar pakaian.',
    dek: 'Jawaban singkat cara menyimpan thobe agar tetap awet.',
    definition:
      'Thobe sebaiknya disimpan menggunakan hanger berbahu lebar (bukan hanger kawat tipis), di lemari dengan sirkulasi udara baik dan bebas kelembapan berlebih, dengan jarak cukup antar pakaian.',
    quickAnswer:
      'Gunakan hanger berbahu lebar, simpan di lemari bebas kelembapan dengan sirkulasi udara baik, dan beri jarak cukup antar pakaian agar kain tidak tertekan.',
    keyTakeaways: [
      'Hanger berbahu lebar mencegah lekukan permanen di bahu',
      'Lemari bebas kelembapan mencegah jamur dan bau apek',
      'Beri jarak cukup antar pakaian, jangan terlalu padat',
      'Untuk penyimpanan jangka panjang, gunakan kantong kain yang bernapas, bukan plastik',
    ],
    sections: [{ heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Investasi kecil pada hanger berkualitas berdampak besar dalam menjaga bentuk thobe premium selama bertahun-tahun.'] } }],
    faq: [{ question: 'Apakah thobe boleh disimpan dalam plastik?', answer: 'Sebaiknya dihindari untuk penyimpanan jangka panjang karena plastik menjebak kelembapan — gunakan kantong kain yang bisa bernapas.' }],
    relatedArticles: [
      { category: 'care', slug: 'store-premium-garments' },
      { category: 'care', slug: 'extend-garment-life' },
    ],
    relatedCategories: ['care'],
    tags: { service: ['care'] },
  },
  {
    slug: 'what-fabric-is-best-for-daily-wear',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Bahan Apa yang Terbaik untuk Pemakaian Harian?',
    navLabel: 'Bahan Terbaik Harian',
    metaDescription: 'Premium cotton adalah bahan paling serbaguna untuk pemakaian harian, seimbang antara kenyamanan, daya tahan, dan sirkulasi udara.',
    dek: 'Jawaban singkat soal bahan terbaik untuk thobe harian.',
    definition:
      'Premium cotton adalah bahan paling direkomendasikan untuk pemakaian harian karena keseimbangannya antara kenyamanan, daya tahan, dan sirkulasi udara, cocok untuk berbagai aktivitas dari rumah hingga kantor.',
    quickAnswer:
      'Premium cotton adalah pilihan paling serbaguna untuk pemakaian harian, dengan linen sebagai alternatif jika Anda memprioritaskan kesejukan maksimal di cuaca sangat panas.',
    keyTakeaways: [
      'Premium cotton: keseimbangan terbaik untuk kebutuhan harian',
      'Linen: alternatif untuk kesejukan maksimal, trade-off mudah kusut',
      'Katun Jepang: pilihan jika ingin kualitas lebih tinggi untuk harian',
      'Hindari bahan tebal seperti wool blend untuk pemakaian harian di iklim tropis',
    ],
    sections: [{ heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Bahan harian idealnya mudah dirawat karena frekuensi pencucian yang lebih tinggi dibanding thobe formal atau khusus acara.'] } }],
    faq: [{ question: 'Apakah premium cotton cocok untuk cuaca tropis?', answer: 'Sangat cocok — sirkulasi udaranya baik dan cukup tahan lama untuk pemakaian sehari-hari di iklim tropis.' }],
    relatedArticles: [
      { category: 'fabrics', slug: 'premium-cotton' },
      { category: 'styling', slug: 'casual-thobe' },
    ],
    relatedFabrics: [{ category: 'fabrics', slug: 'premium-cotton' }],
    relatedCategories: ['fabrics', 'styling'],
    tags: {},
  },
  {
    slug: 'how-to-pack-thobe-for-travel',
    category: 'questions',
    eyebrow: 'Pertanyaan Umum',
    title: 'Bagaimana Cara Packing Thobe agar Tidak Kusut?',
    navLabel: 'Cara Packing Thobe',
    metaDescription: 'Lipat thobe mengikuti garis alami kain, susun di lapisan tengah koper, dan pisahkan dari sepatu atau barang berat.',
    dek: 'Jawaban singkat cara packing thobe untuk perjalanan.',
    definition:
      'Thobe sebaiknya dilipat memanjang mengikuti garis alami kain (bukan dilipat menyilang), disusun di lapisan tengah koper terlindung dari barang berat, dan dipisahkan dari sepatu atau perlengkapan mandi.',
    quickAnswer:
      'Lipat thobe mengikuti garis bahu dan lengan, susun di lapisan tengah koper dengan pelapis pakaian lembut, dan hindari kontak langsung dengan sepatu atau barang berat lainnya.',
    keyTakeaways: [
      'Lipat memanjang mengikuti garis alami kain, bukan menyilang',
      'Susun di lapisan tengah koper, bukan paling bawah atau paling atas',
      'Pisahkan dari sepatu dan perlengkapan mandi',
      'Gunakan garment bag terpisah untuk thobe premium',
    ],
    sections: [{ heading: 'Ringkasan', block: { kind: 'paragraphs', items: ['Untuk perjalanan seperti umrah dengan banyak thobe, sisipkan kantong kain terpisah untuk thobe yang sudah dipakai agar tidak mencampuri yang masih bersih.'] } }],
    faq: [{ question: 'Apakah perlu garment bag khusus?', answer: 'Tidak wajib, namun sangat membantu terutama untuk thobe premium atau momen khusus selama perjalanan.' }],
    relatedArticles: [
      { category: 'umrah', slug: 'packing-guide' },
      { category: 'care', slug: 'remove-wrinkles' },
    ],
    relatedCategories: ['umrah', 'care'],
    tags: { occasion: ['umrah'], service: ['care'] },
  },
]
