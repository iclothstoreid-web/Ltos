import type { KnowledgeArticle } from '../types'

// Sprint Y — Digital Bespoke Tailoring content cluster. 1 cornerstone + 14
// supporting articles across 4 sub-clusters (Custom Thobe Online, Video
// Call Fitting, Home Visit, Design Studio), all under the 'design-studio'
// category. Same architecture as every other cluster — no new component,
// no new route — and every claim here is either already established
// elsewhere in this codebase (2-3 week production timeline, WhatsApp as
// the real booking channel, Digital Body Profile from fitter measurement)
// or a direct restatement of what this sprint's own brief describes as the
// real service (video call fitting, home visit bringing fabric book/
// samples/tablet/alat ukur, showroom experience) — nothing fabricated
// beyond that (no invented service-area radius, no invented fee, no
// invented named staff).
export const DESIGN_STUDIO_ARTICLES: KnowledgeArticle[] = [
  // ---------------------------------------------------------------------
  // CORNERSTONE
  // ---------------------------------------------------------------------
  {
    slug: 'bespoke-tanpa-harus-datang-ke-bandung',
    category: 'design-studio',
    eyebrow: 'Digital Bespoke Tailoring',
    title: 'Bespoke Tailoring Tanpa Harus Datang ke Bandung',
    navLabel: 'Bespoke Tanpa Harus ke Bandung',
    metaDescription:
      'Bagaimana Digital Bespoke Tailoring dari Local Tailor memungkinkan Anda memesan thobe custom tanpa datang langsung ke Bandung — lewat video call fitting, Design Studio, dan home visit.',
    dek: 'Jarak bukan lagi alasan untuk melewatkan bespoke tailoring — inilah bagaimana prosesnya bekerja dari mana saja.',
    definition:
      'Digital Bespoke Tailoring adalah pendekatan Local Tailor yang memindahkan seluruh proses bespoke tailoring — konsultasi, pemilihan desain, hingga panduan pengukuran — ke video call, Design Studio online, dan layanan home visit, sehingga pelanggan di luar kota, luar pulau, maupun luar negeri tetap bisa memesan thobe custom tanpa datang langsung ke Bandung.',
    quickAnswer:
      'Bisa. Melalui video call fitting gratis dan Design Studio online, Anda dapat berkonsultasi, memilih desain, dan memulai proses bespoke sepenuhnya dari jarak jauh — pengukuran final dikonfirmasi lewat home visit atau saat Anda berkunjung ke workshop.',
    keyTakeaways: [
      'Konsultasi, pemilihan desain, dan panduan pengukuran bisa dilakukan sepenuhnya via video call',
      'Design Studio menunjukkan kombinasi Model, Kerah, Manset, Material, dan Warna secara real-time',
      'Home visit tersedia untuk keluarga, pasangan, wedding, corporate, dan kebutuhan VIP',
      'Produksi dan quality control tetap berlangsung di workshop Bandung yang sama seperti pesanan langsung',
      'Pengiriman menjangkau seluruh Indonesia maupun luar negeri setelah garmen selesai',
    ],
    sections: [
      {
        heading: 'Masalah Jarak dalam Bespoke Tailoring Tradisional',
        block: {
          kind: 'paragraphs',
          items: [
            'Bespoke tailoring secara tradisional selalu mengasumsikan satu hal: pelanggan bisa datang langsung ke tailor, lebih dari sekali — untuk konsultasi awal, untuk diukur, dan untuk fitting sebelum garmen selesai. Asumsi ini bekerja baik untuk pelanggan yang tinggal di kota yang sama dengan workshop, tapi menjadi hambatan nyata bagi pelanggan di luar kota, luar pulau, atau luar negeri yang justru sering kali paling membutuhkan hasil bespoke — misalnya untuk acara pernikahan atau umrah yang jadwalnya sudah ditetapkan jauh hari.',
            'Akibatnya, banyak calon pelanggan yang tidak sempat datang ke Bandung akhirnya memilih thobe ready-to-wear meski sebenarnya menginginkan hasil bespoke, semata karena jarak dianggap sebagai penghalang mutlak.',
          ],
        },
      },
      {
        heading: 'Bagaimana Tailor Tradisional Bekerja',
        block: {
          kind: 'list',
          items: [
            'Pelanggan datang langsung untuk sesi konsultasi tatap muka',
            'Pengukuran dilakukan di tempat oleh tailor atau fitter',
            'Pemilihan bahan terbatas pada apa yang secara fisik tersedia di lokasi saat itu',
            'Fitting dan penyesuaian akhir membutuhkan kunjungan tambahan',
          ],
        },
      },
      {
        heading: 'Bagaimana Digital Bespoke Tailoring Bekerja',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Video Call Fitting',
            block: {
              kind: 'paragraphs',
              items: [
                'Sesi video call gratis menggantikan kunjungan konsultasi pertama — membahas kebutuhan, memandu Anda memilih desain di Design Studio, memberi panduan pengukuran mandiri, dan memeriksa ukuran awal sebelum desain difinalisasi. Cocok untuk pelanggan di luar kota, luar pulau, luar negeri, atau siapa pun yang jadwalnya padat.',
              ],
            },
          },
          {
            heading: 'Home Visit',
            block: {
              kind: 'paragraphs',
              items: [
                'Untuk pengalaman yang lebih personal, tim kami dapat datang membawa fabric book, sample komponen, tablet Design Studio, dan alat ukur — cocok untuk keluarga, pasangan, kebutuhan wedding, corporate, maupun VIP yang menginginkan sesi tatap muka tanpa harus ke workshop.',
              ],
            },
          },
          {
            heading: 'Produksi dan Pengiriman',
            block: {
              kind: 'paragraphs',
              items: [
                'Setelah desain disetujui dan ukuran dikonfirmasi, produksi berlangsung di workshop Bandung yang sama — melewati tahap pola, potong, jahit, dan quality control — sebelum dikirim ke alamat Anda di seluruh Indonesia maupun luar negeri.',
              ],
            },
          },
        ],
      },
    ],
    comparisonTable: {
      caption: 'Tailor Tradisional vs Digital Bespoke Tailoring',
      headers: ['Tahap', 'Tailor Tradisional', 'Digital Bespoke Tailoring'],
      rows: [
        ['Konsultasi', 'Wajib tatap muka di lokasi', 'Video call gratis dari mana saja'],
        ['Pemilihan desain', 'Terbatas pada stok fisik di tempat', 'Design Studio — kombinasi real-time'],
        ['Pengukuran', 'Satu-satunya opsi: datang langsung', 'Panduan via video call, dikonfirmasi home visit/showroom'],
        ['Pengalaman personal', 'Hanya di lokasi tailor', 'Home visit untuk wedding/keluarga/corporate/VIP'],
        ['Jangkauan', 'Terbatas pada kota yang sama', 'Seluruh Indonesia dan luar negeri'],
      ],
    },
    faq: [
      {
        question: 'Apakah hasil bespoke tanpa datang ke Bandung sama akuratnya?',
        answer:
          'Desain dan estimasi ukuran dari video call fitting sangat mendekati, namun pengukuran final untuk produksi tetap dikonfirmasi langsung oleh fitter — baik lewat home visit maupun kunjungan ke workshop — sehingga Digital Body Profile Anda tetap akurat.',
      },
      {
        question: 'Apakah Digital Bespoke Tailoring hanya untuk pelanggan luar Bandung?',
        answer:
          'Tidak. Layanan ini juga cocok untuk pelanggan di Bandung yang jadwalnya padat — showroom experience tetap tersedia bagi yang ingin datang langsung.',
      },
      {
        question: 'Berapa lama proses dari konsultasi hingga thobe selesai?',
        answer: 'Umumnya 2-3 minggu dari konsultasi hingga selesai, tergantung kompleksitas desain dan bahan yang dipilih.',
      },
      {
        question: 'Apakah video call fitting benar-benar gratis?',
        answer: 'Ya, sesi video call fitting tidak dikenakan biaya — Anda hanya membayar untuk garmen bespoke yang benar-benar dipesan.',
      },
      {
        question: 'Bagaimana cara memulai proses ini?',
        answer: 'Booking Free Video Call melalui WhatsApp, atau mulai menjelajahi kombinasi desain langsung di Design Studio.',
      },
      {
        question: 'Apakah home visit dikenakan biaya tambahan?',
        answer: 'Ketersediaan dan detail home visit dikonfirmasi saat Anda menghubungi kami — sampaikan kota dan kebutuhan Anda saat booking.',
      },
      {
        question: 'Apakah bisa mengirim thobe ke luar negeri?',
        answer: 'Ya, garmen yang sudah selesai diproduksi dapat dikirim ke alamat Anda di luar negeri sesuai kesepakatan saat konsultasi.',
      },
      {
        question: 'Apa bedanya Design Studio dengan katalog thobe online biasa?',
        answer:
          'Design Studio bukan katalog produk jadi — ini titik awal proses bespoke, tempat kombinasi Model, Kerah, Manset, Material, dan Warna Anda menentukan pola personal yang akan dibentuk, bukan memilih dari stok yang sudah ada.',
      },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'custom-thobe-online-panduan-lengkap' },
      { category: 'design-studio', slug: 'fitting-video-call-apakah-akurat' },
      { category: 'design-studio', slug: 'layanan-home-visit-bandung' },
      { category: 'design-studio', slug: 'apa-itu-design-studio-local-tailor' },
    ],
    relatedCategories: ['tailoring', 'measurements'],
    tags: { service: ['bespoke', 'digital-bespoke-tailoring'], audience: ['luar-kota', 'luar-negeri', 'wedding', 'corporate'] },
  },

  // ---------------------------------------------------------------------
  // CLUSTER: Custom Thobe Online
  // ---------------------------------------------------------------------
  {
    slug: 'cara-pesan-custom-thobe-luar-kota',
    category: 'design-studio',
    eyebrow: 'Custom Thobe Online',
    title: 'Cara Pesan Thobe Custom dari Luar Kota',
    navLabel: 'Pesan dari Luar Kota',
    metaDescription: 'Langkah demi langkah memesan thobe custom dari luar kota — dari booking video call hingga thobe dikirim ke alamat Anda.',
    dek: 'Panduan langkah demi langkah memesan thobe bespoke tanpa perlu datang ke Bandung.',
    definition:
      'Memesan thobe custom dari luar kota berarti menjalani seluruh proses bespoke — konsultasi, desain, dan panduan ukur — lewat video call dan Design Studio, dengan produksi tetap dikerjakan di workshop Bandung.',
    quickAnswer:
      'Booking Free Video Call via WhatsApp, jelajahi kombinasi desain di Design Studio, ikuti panduan pengukuran, lalu tunggu produksi dan pengiriman ke kota Anda.',
    keyTakeaways: [
      'Prosesnya sama persis dengan pelanggan Bandung, hanya konsultasinya dilakukan jarak jauh',
      'Design Studio membantu memvisualisasikan kombinasi sebelum diputuskan',
      'Pengukuran dikonfirmasi via panduan video call atau home visit bila tersedia di kota Anda',
      'Thobe selesai dikirim langsung ke alamat Anda',
    ],
    sections: [
      {
        heading: 'Langkah-Langkah Memesan dari Luar Kota',
        block: {
          kind: 'steps',
          items: [
            { name: 'Book Free Video Call', text: 'Hubungi kami via WhatsApp untuk menjadwalkan sesi video call fitting gratis.' },
            { name: 'Konsultasi Kebutuhan', text: 'Diskusikan acara, budget, dan preferensi gaya Anda dalam sesi video call.' },
            { name: 'Jelajahi Design Studio', text: 'Pilih Model, Kerah, Manset, Material, dan Warna bersama tim kami secara real-time.' },
            { name: 'Panduan Pengukuran', text: 'Ikuti panduan mengukur badan sendiri, dikonfirmasi oleh tim kami.' },
            { name: 'Finalisasi Desain', text: 'Setujui kombinasi desain final sebelum produksi dimulai.' },
            { name: 'Produksi & Pengiriman', text: 'Thobe diproduksi di Bandung dan dikirim ke alamat Anda setelah quality control.' },
          ],
        },
      },
      {
        heading: 'Yang Perlu Disiapkan Sebelum Video Call',
        block: {
          kind: 'list',
          items: [
            'Perkiraan tanggal acara, jika pesanan terkait acara tertentu',
            'Meteran jahit untuk panduan pengukuran mandiri',
            'Referensi gaya atau warna, jika sudah punya gambaran',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apakah biaya pengiriman ditanggung pelanggan?',
        answer: 'Detail biaya pengiriman dikonfirmasi saat konsultasi, disesuaikan dengan lokasi tujuan Anda.',
      },
      {
        question: 'Berapa lama dari booking hingga thobe sampai?',
        answer: 'Produksi umumnya 2-3 minggu setelah desain difinalisasi, ditambah waktu pengiriman ke kota Anda.',
      },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'bespoke-tanpa-harus-datang-ke-bandung' },
      { category: 'design-studio', slug: 'custom-thobe-online-panduan-lengkap' },
      { category: 'design-studio', slug: 'cara-ukur-badan-sendiri-untuk-thobe' },
    ],
    relatedCategories: ['measurements'],
    tags: { service: ['digital-bespoke-tailoring'], audience: ['luar-kota'] },
  },
  {
    slug: 'jahit-thobe-tanpa-datang-ke-tailor',
    category: 'design-studio',
    eyebrow: 'Custom Thobe Online',
    title: 'Apakah Bisa Jahit Thobe Tanpa Datang ke Tailor?',
    navLabel: 'Jahit Tanpa Datang ke Tailor',
    metaDescription: 'Penjelasan langsung: apakah mungkin menjahit thobe custom tanpa pernah datang langsung ke tailor, dan bagaimana Local Tailor menjawabnya.',
    dek: 'Jawaban langsung untuk pertanyaan yang paling sering muncul dari calon pelanggan luar kota.',
    definition:
      'Ya, memesan thobe custom tanpa datang langsung ke tailor dimungkinkan melalui Digital Bespoke Tailoring — konsultasi dan desain dilakukan jarak jauh, sementara pengukuran final dikonfirmasi lewat home visit atau kunjungan singkat ke workshop.',
    quickAnswer:
      'Bisa. Local Tailor memungkinkan seluruh proses konsultasi dan desain dilakukan tanpa datang ke tailor, lewat video call fitting dan Design Studio online.',
    keyTakeaways: [
      'Konsultasi dan pemilihan desain tidak mengharuskan kehadiran fisik',
      'Pengukuran akhir tetap butuh konfirmasi langsung — lewat home visit atau kunjungan singkat',
      'Prosesnya menghasilkan Digital Body Profile yang sama akuratnya',
      'Produksi tetap dikerjakan oleh tailor yang sama di workshop Bandung',
    ],
    sections: [
      {
        heading: 'Bagian Mana yang Bisa Sepenuhnya Jarak Jauh',
        block: {
          kind: 'list',
          items: [
            'Konsultasi kebutuhan dan preferensi gaya — via video call',
            'Pemilihan Model, Kerah, Manset, Material, dan Warna — via Design Studio',
            'Diskusi budget dan timeline — via video call atau chat',
          ],
        },
      },
      {
        heading: 'Bagian yang Tetap Membutuhkan Konfirmasi Langsung',
        block: {
          kind: 'paragraphs',
          items: [
            'Pengukuran final untuk produksi tetap dikonfirmasi langsung oleh fitter kami — baik saat home visit di kota Anda (jika tersedia) maupun saat Anda berkesempatan mengunjungi workshop. Ini bukan langkah tambahan yang menghambat, melainkan yang memastikan thobe yang jadi benar-benar pas di badan, bukan sekadar estimasi.',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah pengukuran mandiri saja cukup untuk produksi?', answer: 'Pengukuran mandiri membantu sebagai referensi awal, namun tetap dikonfirmasi langsung oleh fitter sebelum produksi dimulai.' },
      { question: 'Apa yang terjadi jika saya salah ukur sendiri?', answer: 'Karena ada tahap konfirmasi oleh fitter, kesalahan kecil pada pengukuran mandiri biasanya masih bisa dikoreksi sebelum produksi.' },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'bespoke-tanpa-harus-datang-ke-bandung' },
      { category: 'design-studio', slug: 'fitting-video-call-apakah-akurat' },
      { category: 'design-studio', slug: 'tailor-datang-ke-rumah-ukur-badan' },
    ],
    relatedCategories: ['measurements'],
    tags: { service: ['digital-bespoke-tailoring'] },
  },
  {
    slug: 'custom-thobe-online-panduan-lengkap',
    category: 'design-studio',
    eyebrow: 'Custom Thobe Online',
    title: 'Custom Thobe Online: Panduan Lengkap',
    navLabel: 'Panduan Lengkap Custom Online',
    metaDescription: 'Panduan lengkap memesan custom thobe online — apa itu Design Studio, video call fitting, home visit, dan bagaimana ketiganya saling melengkapi.',
    dek: 'Satu panduan menyeluruh untuk memahami seluruh alur custom thobe online dari Local Tailor.',
    definition:
      'Custom thobe online adalah proses memesan thobe bespoke yang dimulai dan sebagian besar berlangsung secara digital — via Design Studio dan video call fitting — sebelum produksi fisik dilakukan di workshop Bandung.',
    quickAnswer:
      'Custom thobe online dari Local Tailor menggabungkan tiga elemen: Design Studio untuk memilih desain, video call fitting untuk konsultasi dan panduan ukur, dan opsi home visit untuk pengalaman yang lebih personal.',
    keyTakeaways: [
      'Design Studio adalah titik awal — memilih Model, Kerah, Manset, Material, dan Warna',
      'Video call fitting menggantikan konsultasi tatap muka pertama',
      'Home visit tersedia untuk kebutuhan yang lebih personal (wedding, keluarga, corporate, VIP)',
      'Showroom experience tetap terbuka bagi yang ingin datang langsung',
      'Produksi dan pengiriman menjangkau seluruh Indonesia dan luar negeri',
    ],
    sections: [
      {
        heading: 'Tiga Elemen Custom Thobe Online',
        block: {
          kind: 'table',
          headers: ['Elemen', 'Fungsi', 'Cocok Untuk'],
          rows: [
            ['Design Studio', 'Memilih dan memvisualisasikan kombinasi desain', 'Semua pelanggan'],
            ['Video Call Fitting', 'Konsultasi, panduan ukur, finalisasi desain', 'Luar kota, luar negeri, sibuk'],
            ['Home Visit', 'Sesi tatap muka personal dengan fabric book & alat ukur', 'Keluarga, wedding, corporate, VIP'],
          ],
        },
      },
      {
        heading: 'Alur Lengkap dari Awal hingga Thobe Diterima',
        block: {
          kind: 'steps',
          items: [
            { name: 'Book Session', text: 'Jadwalkan video call fitting gratis via WhatsApp.' },
            { name: 'Video Call', text: 'Konsultasi kebutuhan dan panduan awal pemilihan desain.' },
            { name: 'Design Studio', text: 'Finalisasi kombinasi Model, Kerah, Manset, Material, dan Warna.' },
            { name: 'Approve Design', text: 'Setujui desain final sebelum produksi dimulai.' },
            { name: 'Production', text: 'Pola dibentuk, kain dipotong, dan dijahit di workshop Bandung.' },
            { name: 'Delivery', text: 'Thobe dikirim ke alamat Anda setelah quality control selesai.' },
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah saya wajib memakai ketiga elemen sekaligus?', answer: 'Tidak. Design Studio dan video call fitting adalah dasar setiap pesanan; home visit dan showroom adalah opsi tambahan sesuai kebutuhan Anda.' },
      { question: 'Apa langkah pertama yang harus saya lakukan?', answer: 'Mulai dengan Book Free Video Call, atau langsung jelajahi kombinasi desain di Design Studio jika Anda sudah punya gambaran.' },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'bespoke-tanpa-harus-datang-ke-bandung' },
      { category: 'design-studio', slug: 'apa-itu-design-studio-local-tailor' },
      { category: 'design-studio', slug: 'konsultasi-tailor-online-gratis' },
    ],
    relatedCategories: ['tailoring'],
    tags: { service: ['digital-bespoke-tailoring'] },
  },
  {
    slug: 'bespoke-thobe-dari-rumah',
    category: 'design-studio',
    eyebrow: 'Custom Thobe Online',
    title: 'Bespoke Thobe dari Rumah',
    navLabel: 'Bespoke dari Rumah',
    metaDescription: 'Bagaimana rasanya memesan thobe bespoke tanpa meninggalkan rumah — dari konsultasi video call hingga opsi home visit.',
    dek: 'Seluruh pengalaman bespoke, dibawa langsung ke ruang tamu Anda.',
    definition:
      'Bespoke thobe dari rumah berarti seluruh tahapan awal — konsultasi, pemilihan desain, dan panduan pengukuran — dilakukan tanpa meninggalkan rumah, lewat video call dan Design Studio, dengan opsi home visit untuk sesi tatap muka.',
    quickAnswer:
      'Anda bisa memulai pesanan bespoke sepenuhnya dari rumah lewat video call fitting dan Design Studio; home visit tersedia jika Anda menginginkan sesi tatap muka tanpa keluar rumah.',
    keyTakeaways: [
      'Konsultasi awal dilakukan via video call, tanpa perlu keluar rumah',
      'Design Studio bisa diakses dari perangkat apa pun untuk melihat kombinasi desain',
      'Home visit membawa fabric book, sample komponen, tablet, dan alat ukur langsung ke rumah Anda',
      'Cocok khususnya untuk keluarga yang memesan bersama-sama',
    ],
    sections: [
      {
        heading: 'Apa yang Bisa Dilakukan dari Rumah',
        block: {
          kind: 'list',
          items: [
            'Konsultasi kebutuhan dan preferensi gaya via video call',
            'Menjelajahi dan membandingkan kombinasi desain di Design Studio',
            'Mendiskusikan budget dan timeline dengan tim kami',
          ],
        },
      },
      {
        heading: 'Kapan Home Visit Lebih Cocok Dibanding Video Call Saja',
        block: {
          kind: 'paragraphs',
          items: [
            'Video call sudah cukup untuk sebagian besar kebutuhan, tapi untuk keluarga besar, pasangan yang memesan bersama, atau kebutuhan wedding dan corporate, sesi tatap muka lewat home visit sering terasa lebih personal — Anda bisa langsung menyentuh sample bahan dan melihat kombinasi di tablet Design Studio bersama tim kami.',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah home visit tersedia di semua kota?', answer: 'Ketersediaan home visit tergantung lokasi Anda — sampaikan kota Anda saat booking untuk konfirmasi.' },
      { question: 'Apakah bisa memesan untuk beberapa anggota keluarga sekaligus dari rumah?', answer: 'Bisa — video call atau home visit sama-sama bisa mencakup kebutuhan beberapa anggota keluarga dalam satu sesi.' },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'home-visit-wedding-keluarga' },
      { category: 'design-studio', slug: 'layanan-home-visit-bandung' },
      { category: 'design-studio', slug: 'pengalaman-pesan-video-call' },
    ],
    relatedCategories: ['wedding'],
    tags: { service: ['digital-bespoke-tailoring'], audience: ['keluarga'] },
  },
  {
    slug: 'cara-ukur-badan-sendiri-untuk-thobe',
    category: 'design-studio',
    eyebrow: 'Custom Thobe Online',
    title: 'Cara Ukur Badan Sendiri untuk Thobe',
    navLabel: 'Cara Ukur Badan Sendiri',
    metaDescription: 'Cara mengukur badan sendiri sebagai langkah awal sebelum konsultasi video call fitting untuk pesanan thobe custom online.',
    dek: 'Langkah awal yang bisa Anda lakukan sebelum sesi video call fitting.',
    definition:
      'Mengukur badan sendiri untuk thobe adalah langkah persiapan sebelum video call fitting — hasilnya menjadi referensi awal yang kemudian dikonfirmasi oleh fitter kami sebelum produksi dimulai.',
    quickAnswer:
      'Ukur lingkar leher, lebar bahu, lingkar dada, panjang lengan, dan panjang badan menggunakan meteran jahit, lalu bawa angka ini ke sesi video call fitting untuk dikonfirmasi tim kami.',
    keyTakeaways: [
      'Lima titik ukur utama: lingkar leher, lebar bahu, lingkar dada, panjang lengan, panjang badan',
      'Gunakan meteran jahit kain, bukan meteran logam',
      'Hasil pengukuran mandiri dikonfirmasi ulang saat video call',
      'Panduan lengkap langkah demi langkah tersedia di panduan Cara Mengukur Thobe kami',
    ],
    sections: [
      {
        heading: 'Titik Ukur yang Perlu Disiapkan',
        block: {
          kind: 'list',
          items: [
            'Lingkar leher — untuk ukuran kerah',
            'Lebar bahu — dari ujung bahu kiri ke kanan',
            'Lingkar dada — bagian dada terlebar',
            'Panjang lengan — dari bahu ke pergelangan tangan',
            'Panjang badan — dari bahu hingga panjang thobe yang diinginkan',
          ],
        },
      },
      {
        heading: 'Kenapa Ini Hanya Langkah Awal, Bukan Langkah Final',
        block: {
          kind: 'paragraphs',
          items: [
            'Pengukuran mandiri membantu mempercepat sesi video call fitting karena tim kami sudah punya angka awal untuk didiskusikan. Namun untuk thobe yang benar-benar diproduksi, fitter kami tetap mengonfirmasi ulang titik ukur utama — baik lewat panduan detail saat video call, home visit, maupun kunjungan ke workshop — untuk memastikan Digital Body Profile Anda akurat sebelum kain dipotong.',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah saya perlu bantuan orang lain untuk mengukur sendiri?', answer: 'Disarankan, terutama untuk lebar bahu dan panjang badan bagian belakang — namun tim kami juga memandu Anda langsung saat video call.' },
      { question: 'Apa yang terjadi setelah saya mengirim hasil ukur sendiri?', answer: 'Tim kami akan meninjau dan mengonfirmasi ulang bersama Anda di sesi video call sebelum desain difinalisasi.' },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'fitting-video-call-apakah-akurat' },
      { category: 'measurements', slug: 'how-to-measure-body' },
      { category: 'design-studio', slug: 'cara-pesan-custom-thobe-luar-kota' },
    ],
    relatedCategories: ['measurements'],
    tags: { service: ['digital-bespoke-tailoring'] },
  },

  // ---------------------------------------------------------------------
  // CLUSTER: Video Call Fitting
  // ---------------------------------------------------------------------
  {
    slug: 'fitting-video-call-apakah-akurat',
    category: 'design-studio',
    eyebrow: 'Video Call Fitting',
    title: 'Fitting Thobe Lewat Video Call, Apakah Akurat?',
    navLabel: 'Apakah Video Call Akurat?',
    metaDescription: 'Seberapa akurat fitting thobe lewat video call, dan bagaimana Local Tailor memastikan hasil akhirnya tetap presisi.',
    dek: 'Menjawab keraguan paling umum tentang fitting jarak jauh.',
    definition:
      'Fitting thobe lewat video call adalah sesi konsultasi dan panduan pengukuran jarak jauh yang akurat untuk tahap desain dan estimasi awal, dengan pengukuran final tetap dikonfirmasi langsung oleh fitter sebelum produksi.',
    quickAnswer:
      'Video call fitting akurat untuk konsultasi, pemilihan desain, dan panduan ukur awal — namun pengukuran yang benar-benar dipakai untuk produksi tetap dikonfirmasi langsung oleh fitter kami, sama seperti pesanan tatap muka.',
    keyTakeaways: [
      'Video call efektif untuk konsultasi, desain, dan panduan pengukuran awal',
      'Bukan pengganti penuh pengukuran fisik — hanya tahap awal yang dikonfirmasi ulang',
      'Kombinasi video call + konfirmasi fitter menghasilkan Digital Body Profile yang tetap akurat',
      'Proses ini sama dengan yang digunakan pelanggan di luar kota dan luar negeri',
    ],
    sections: [
      {
        heading: 'Apa yang Dilakukan Saat Video Call Fitting',
        block: {
          kind: 'list',
          items: [
            'Konsultasi kebutuhan dan acara yang dituju',
            'Pemilihan desain bersama di Design Studio',
            'Panduan langkah demi langkah mengukur badan sendiri',
            'Pengecekan awal ukuran berdasarkan hasil pengukuran mandiri',
            'Finalisasi desain sebelum lanjut ke tahap produksi',
          ],
        },
      },
      {
        heading: 'Di Mana Batasan Akurasinya',
        block: {
          kind: 'paragraphs',
          items: [
            'Video call tidak bisa menggantikan sentuhan fisik meteran ke badan Anda — inilah kenapa hasil pengukuran mandiri saat video call selalu dikonfirmasi ulang sebelum produksi, baik melalui home visit maupun kunjungan ke workshop. Batasan ini diakui secara terbuka, bukan disembunyikan, karena justru langkah konfirmasi inilah yang menjaga akurasi akhir.',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah ada risiko ukuran meleset jika hanya video call?', answer: 'Risiko diminimalkan karena ada tahap konfirmasi ulang oleh fitter sebelum produksi — video call bukan langkah tunggal yang menentukan ukuran final.' },
      { question: 'Berapa lama durasi sesi video call fitting?', answer: 'Durasi disesuaikan dengan kompleksitas kebutuhan Anda — umumnya cukup untuk membahas desain dan panduan ukur secara menyeluruh.' },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'pengalaman-pesan-video-call' },
      { category: 'design-studio', slug: 'cara-ukur-badan-sendiri-untuk-thobe' },
      { category: 'design-studio', slug: 'jahit-thobe-tanpa-datang-ke-tailor' },
    ],
    relatedCategories: ['measurements'],
    tags: { service: ['video-call-fitting'] },
  },
  {
    slug: 'pengalaman-pesan-video-call',
    category: 'design-studio',
    eyebrow: 'Video Call Fitting',
    title: 'Pengalaman Pesan Thobe Melalui Video Call',
    navLabel: 'Pengalaman Pesan via Video Call',
    metaDescription: 'Gambaran lengkap seperti apa rasanya memesan thobe custom lewat sesi video call fitting dari awal hingga akhir.',
    dek: 'Gambaran langkah demi langkah apa yang akan Anda alami dalam satu sesi video call.',
    definition:
      'Pengalaman memesan thobe melalui video call adalah rangkaian sesi konsultasi jarak jauh yang membawa Anda dari perkenalan kebutuhan hingga desain final, tanpa perlu bertemu langsung dengan tim tailor.',
    quickAnswer:
      'Sesi video call diawali dengan perkenalan kebutuhan Anda, dilanjutkan eksplorasi desain di Design Studio, panduan pengukuran, dan diakhiri dengan finalisasi desain yang siap diproduksi.',
    keyTakeaways: [
      'Sesi dimulai dari pemahaman kebutuhan dan acara Anda',
      'Design Studio dibuka bersama untuk eksplorasi desain secara langsung',
      'Panduan pengukuran diberikan secara real-time selama sesi',
      'Sesi diakhiri dengan ringkasan desain dan langkah selanjutnya',
    ],
    sections: [
      {
        heading: 'Alur Satu Sesi Video Call Fitting',
        block: {
          kind: 'steps',
          items: [
            { name: 'Perkenalan Kebutuhan', text: 'Tim kami menanyakan acara, budget, dan preferensi gaya Anda.' },
            { name: 'Eksplorasi Design Studio', text: 'Membuka Design Studio bersama untuk mencoba kombinasi Model, Kerah, Manset, Material, dan Warna.' },
            { name: 'Panduan Pengukuran', text: 'Dipandu langkah demi langkah mengukur badan sendiri jika belum dilakukan sebelumnya.' },
            { name: 'Ringkasan & Langkah Selanjutnya', text: 'Menyepakati desain sementara dan jadwal konfirmasi ukuran berikutnya.' },
          ],
        },
      },
      {
        heading: 'Yang Membuat Sesi Ini Terasa Personal',
        block: {
          kind: 'paragraphs',
          items: [
            'Meski dilakukan jarak jauh, sesi video call dirancang sebagai percakapan dua arah, bukan presentasi satu arah — Anda bisa mencoba berbagai kombinasi di Design Studio secara langsung bersama tim kami, sama seperti berada di showroom, hanya saja layarnya ada di antara Anda dan kami.',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah saya perlu menyiapkan sesuatu sebelum sesi?', answer: 'Menyiapkan meteran jahit dan gambaran acara/budget Anda akan membuat sesi lebih efisien, meski tidak wajib.' },
      { question: 'Apakah bisa mengundang anggota keluarga lain ke sesi yang sama?', answer: 'Bisa — sesi video call dapat mencakup beberapa peserta sekaligus, misalnya untuk kebutuhan keluarga atau wedding.' },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'fitting-video-call-apakah-akurat' },
      { category: 'design-studio', slug: 'konsultasi-tailor-online-gratis' },
      { category: 'design-studio', slug: 'apa-itu-design-studio-local-tailor' },
    ],
    relatedCategories: [],
    tags: { service: ['video-call-fitting'] },
  },
  {
    slug: 'konsultasi-tailor-online-gratis',
    category: 'design-studio',
    eyebrow: 'Video Call Fitting',
    title: 'Konsultasi Tailor Online Gratis',
    navLabel: 'Konsultasi Online Gratis',
    metaDescription: 'Detail lengkap layanan konsultasi tailor online gratis dari Local Tailor — apa yang dibahas dan bagaimana cara booking.',
    dek: 'Tidak ada biaya untuk mulai berkonsultasi — inilah yang tercakup di dalamnya.',
    definition:
      'Konsultasi tailor online gratis adalah sesi video call tanpa biaya dengan tim Local Tailor untuk membahas kebutuhan, mengeksplorasi desain, dan mendapat panduan pengukuran sebelum memutuskan untuk memesan.',
    quickAnswer:
      'Ya, konsultasi awal via video call sepenuhnya gratis — Anda hanya membayar untuk garmen bespoke yang benar-benar dipesan setelah desain disepakati.',
    keyTakeaways: [
      'Tidak ada biaya untuk sesi konsultasi awal',
      'Tidak ada kewajiban memesan setelah sesi konsultasi',
      'Mencakup diskusi kebutuhan, eksplorasi desain, dan panduan ukur',
      'Bisa dibooking langsung via WhatsApp',
    ],
    sections: [
      {
        heading: 'Apa yang Termasuk dalam Konsultasi Gratis',
        block: {
          kind: 'list',
          items: [
            'Diskusi kebutuhan dan acara yang dituju',
            'Eksplorasi kombinasi desain di Design Studio',
            'Panduan awal pengukuran mandiri',
            'Estimasi harga berdasarkan pilihan desain',
          ],
        },
      },
      {
        heading: 'Apa yang Tidak Termasuk',
        block: {
          kind: 'paragraphs',
          items: [
            'Konsultasi gratis tidak mencakup produksi garmen — itu baru dimulai setelah Anda menyetujui desain final dan melanjutkan pesanan. Tidak ada tekanan untuk memesan hanya karena sudah mengikuti sesi konsultasi.',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah saya wajib memesan setelah konsultasi?', answer: 'Tidak. Konsultasi adalah langkah bebas kewajiban untuk membantu Anda memutuskan sebelum memesan.' },
      { question: 'Bagaimana cara booking konsultasi gratis?', answer: 'Hubungi kami via WhatsApp untuk menjadwalkan sesi Book Free Video Call.' },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'pengalaman-pesan-video-call' },
      { category: 'design-studio', slug: 'custom-thobe-online-panduan-lengkap' },
      { category: 'design-studio', slug: 'bespoke-tanpa-harus-datang-ke-bandung' },
    ],
    relatedCategories: [],
    tags: { service: ['video-call-fitting'] },
  },

  // ---------------------------------------------------------------------
  // CLUSTER: Home Visit
  // ---------------------------------------------------------------------
  {
    slug: 'layanan-home-visit-bandung',
    category: 'design-studio',
    eyebrow: 'Home Visit',
    title: 'Layanan Tailor Home Visit Bandung',
    navLabel: 'Home Visit Bandung',
    metaDescription: 'Detail layanan home visit dari Local Tailor Bandung — apa yang dibawa tim kami dan siapa yang paling cocok menggunakannya.',
    dek: 'Pengalaman Design Studio dan konsultasi, dibawa langsung ke lokasi Anda.',
    definition:
      'Layanan home visit dari Local Tailor adalah kunjungan tim kami ke lokasi Anda membawa fabric book, sample komponen, tablet Design Studio, dan alat ukur, untuk sesi konsultasi dan pengukuran tatap muka tanpa Anda perlu datang ke workshop.',
    quickAnswer:
      'Home visit menghadirkan tim Local Tailor langsung ke lokasi Anda dengan perlengkapan lengkap — fabric book, sample komponen, tablet Design Studio, dan alat ukur — cocok untuk keluarga, pasangan, wedding, corporate, dan VIP.',
    keyTakeaways: [
      'Tim membawa fabric book, sample komponen, tablet Design Studio, dan alat ukur',
      'Cocok untuk keluarga, pasangan, wedding, corporate, dan kebutuhan VIP',
      'Pengukuran dilakukan langsung di lokasi, bukan estimasi jarak jauh',
      'Ketersediaan tergantung lokasi — dikonfirmasi saat booking',
    ],
    sections: [
      {
        heading: 'Apa yang Dibawa Tim Home Visit',
        block: {
          kind: 'list',
          items: [
            'Fabric book — koleksi bahan fisik untuk dilihat dan disentuh langsung',
            'Sample komponen — contoh kerah, manset, dan detail konstruksi',
            'Tablet Design Studio — untuk mencoba kombinasi desain langsung di lokasi',
            'Alat ukur — untuk pengukuran badan yang presisi',
          ],
        },
      },
      {
        heading: 'Siapa yang Paling Cocok Menggunakan Home Visit',
        block: {
          kind: 'table',
          headers: ['Kebutuhan', 'Kenapa Home Visit Cocok'],
          rows: [
            ['Keluarga', 'Beberapa anggota bisa diukur dan berkonsultasi dalam satu sesi'],
            ['Pasangan', 'Konsultasi desain bersama, termasuk untuk kebutuhan couple'],
            ['Wedding', 'Koordinasi warna dan bahan untuk mempelai dan keluarga besar'],
            ['Corporate', 'Efisien untuk beberapa karyawan sekaligus di satu lokasi'],
            ['VIP', 'Pengalaman personal tanpa perlu menyesuaikan jadwal ke workshop'],
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah home visit tersedia di luar Bandung?', answer: 'Ketersediaan tergantung lokasi Anda — sampaikan kota Anda saat booking untuk konfirmasi jangkauan layanan.' },
      { question: 'Berapa orang yang bisa diukur dalam satu sesi home visit?', answer: 'Bisa mencakup beberapa orang sekaligus, cocok untuk kebutuhan keluarga atau kelompok.' },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'tailor-datang-ke-rumah-ukur-badan' },
      { category: 'design-studio', slug: 'home-visit-wedding-keluarga' },
      { category: 'design-studio', slug: 'bespoke-thobe-dari-rumah' },
    ],
    relatedCategories: ['bandung'],
    tags: { service: ['home-visit'], audience: ['keluarga', 'wedding', 'corporate'] },
  },
  {
    slug: 'tailor-datang-ke-rumah-ukur-badan',
    category: 'design-studio',
    eyebrow: 'Home Visit',
    title: 'Tailor Datang ke Rumah untuk Ukur Badan',
    navLabel: 'Tailor Datang ke Rumah',
    metaDescription: 'Bagaimana proses pengukuran badan berlangsung saat tim Local Tailor datang ke rumah Anda melalui layanan home visit.',
    dek: 'Apa yang terjadi saat sesi pengukuran home visit berlangsung.',
    definition:
      'Tailor datang ke rumah untuk ukur badan adalah bagian dari layanan home visit, di mana fitter kami langsung mengambil pengukuran presisi di lokasi Anda menggunakan alat ukur yang sama seperti di workshop.',
    quickAnswer:
      'Saat home visit, fitter kami mengambil pengukuran badan Anda langsung di lokasi menggunakan alat ukur profesional, menghasilkan Digital Body Profile yang sama akuratnya dengan pengukuran di workshop.',
    keyTakeaways: [
      'Pengukuran dilakukan oleh fitter, bukan estimasi mandiri',
      'Titik ukur yang diambil sama seperti pengukuran di workshop',
      'Hasilnya langsung menjadi Digital Body Profile Anda',
      'Bisa digabung dengan sesi konsultasi desain di Design Studio pada kunjungan yang sama',
    ],
    sections: [
      {
        heading: 'Apa yang Terjadi Selama Sesi Pengukuran',
        block: {
          kind: 'steps',
          items: [
            { name: 'Persiapan', text: 'Fitter menyiapkan alat ukur dan menjelaskan proses singkat kepada Anda.' },
            { name: 'Pengukuran Titik Utama', text: 'Lingkar leher, lebar bahu, lingkar dada, panjang lengan, dan panjang badan diukur langsung.' },
            { name: 'Konfirmasi Bersama', text: 'Hasil ukur dikonfirmasi bersama Anda sebelum dicatat sebagai Digital Body Profile.' },
            { name: 'Lanjut ke Desain', text: 'Jika belum, sesi berlanjut ke eksplorasi desain di tablet Design Studio.' },
          ],
        },
      },
      {
        heading: 'Kenapa Ini Sama Akuratnya dengan di Workshop',
        block: {
          kind: 'paragraphs',
          items: [
            'Alat ukur dan metode yang digunakan fitter saat home visit identik dengan yang digunakan di workshop Bandung — perbedaannya hanya lokasi, bukan proses maupun standar akurasi.',
          ],
        },
      },
    ],
    faq: [
      { question: 'Berapa lama sesi pengukuran home visit?', answer: 'Umumnya berlangsung singkat, cukup untuk mengambil seluruh titik ukur utama dengan teliti — durasi total bisa lebih lama jika digabung dengan konsultasi desain.' },
      { question: 'Apakah hasil ukur home visit disimpan untuk pesanan berikutnya?', answer: 'Ya, hasilnya menjadi Digital Body Profile yang tersimpan dan dapat digunakan lagi untuk pesanan selanjutnya.' },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'layanan-home-visit-bandung' },
      { category: 'measurements', slug: 'how-to-measure-body' },
      { category: 'design-studio', slug: 'cara-ukur-badan-sendiri-untuk-thobe' },
    ],
    relatedCategories: ['measurements'],
    tags: { service: ['home-visit'] },
  },
  {
    slug: 'home-visit-wedding-keluarga',
    category: 'design-studio',
    eyebrow: 'Home Visit',
    title: 'Home Visit untuk Wedding & Keluarga',
    navLabel: 'Home Visit Wedding & Keluarga',
    metaDescription: 'Kenapa layanan home visit sangat cocok untuk kebutuhan wedding dan keluarga besar yang memesan thobe custom bersama-sama.',
    dek: 'Satu kunjungan, satu koordinasi warna dan desain untuk seluruh keluarga.',
    definition:
      'Home visit untuk wedding dan keluarga adalah kunjungan tim Local Tailor untuk mengonsultasikan dan mengukur beberapa anggota keluarga atau rombongan pernikahan sekaligus dalam satu sesi di satu lokasi.',
    quickAnswer:
      'Untuk kebutuhan wedding atau keluarga besar, home visit memungkinkan konsultasi warna, koordinasi desain, dan pengukuran beberapa orang sekaligus tanpa masing-masing harus datang terpisah ke workshop.',
    keyTakeaways: [
      'Satu sesi bisa mencakup pengantin, keluarga inti, dan family outfit sekaligus',
      'Koordinasi warna dan bahan lebih mudah dilakukan saat semua pihak hadir bersama',
      'Setiap anggota tetap diukur dan dipolakan secara personal, bukan disamaratakan',
      'Efisien dari sisi waktu dibanding menjadwalkan kunjungan terpisah',
    ],
    sections: [
      {
        heading: 'Kenapa Home Visit Cocok untuk Wedding',
        block: {
          kind: 'paragraphs',
          items: [
            'Kebutuhan pernikahan sering melibatkan lebih dari satu orang — mempelai pria, ayah, saudara, hingga keluarga inti yang ingin tampil serasi di hari akad atau resepsi. Home visit memungkinkan seluruh pihak ini dikonsultasikan dan diukur dalam satu kunjungan, sehingga koordinasi warna dan gaya lebih mudah diselaraskan dibanding masing-masing memesan terpisah.',
          ],
        },
      },
      {
        heading: 'Kenapa Home Visit Cocok untuk Keluarga',
        block: {
          kind: 'list',
          items: [
            'Tidak perlu menjadwalkan kunjungan berulang ke workshop untuk setiap anggota',
            'Anak-anak dan orang tua bisa diukur dalam suasana yang lebih santai di rumah',
            'Diskusi desain bisa melibatkan seluruh keluarga secara langsung',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah semua anggota keluarga harus punya desain yang sama?', answer: 'Tidak wajib — Anda bisa memilih desain serasi (warna atau bahan yang sama) sambil tetap membedakan detail seperti model atau kerah per individu.' },
      { question: 'Berapa banyak orang yang bisa dilayani dalam satu home visit?', answer: 'Tergantung kebutuhan Anda — sampaikan jumlah orang saat booking agar sesi dijadwalkan dengan durasi yang cukup.' },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'layanan-home-visit-bandung' },
      { category: 'wedding', slug: 'family-outfit' },
      { category: 'design-studio', slug: 'bespoke-thobe-dari-rumah' },
    ],
    relatedCategories: ['wedding'],
    tags: { service: ['home-visit'], occasion: ['pernikahan'], audience: ['keluarga', 'wedding'] },
  },

  // ---------------------------------------------------------------------
  // CLUSTER: Design Studio
  // ---------------------------------------------------------------------
  {
    slug: 'apa-itu-design-studio-local-tailor',
    category: 'design-studio',
    eyebrow: 'Design Studio',
    title: 'Apa Itu Design Studio Local Tailor?',
    navLabel: 'Apa Itu Design Studio?',
    metaDescription: 'Penjelasan lengkap apa itu Design Studio dari Local Tailor — fungsinya, cara kerjanya, dan kenapa ini titik awal setiap pesanan bespoke.',
    dek: 'Mengenal fitur inti di balik setiap pesanan Digital Bespoke Tailoring kami.',
    definition:
      'Design Studio adalah fitur konfigurator online dari Local Tailor tempat pelanggan memilih Model, Kerah, Manset, Material, dan Warna, melihat kombinasi desain, dan mendapat estimasi harga secara real-time sebelum pola personal dibentuk.',
    quickAnswer:
      'Design Studio adalah titik awal setiap pesanan bespoke kami — tempat Anda mengonfigurasi desain thobe dan melihat estimasi harga langsung, baik sendiri maupun didampingi tim kami lewat video call atau home visit.',
    keyTakeaways: [
      'Bukan katalog produk jadi — Design Studio adalah alat konfigurasi desain',
      'Mencakup pilihan Model, Kerah, Manset, Material, dan Warna',
      'Estimasi harga muncul secara real-time saat kombinasi diubah',
      'Bisa digunakan sendiri atau didampingi tim kami via video call/home visit',
    ],
    sections: [
      {
        heading: 'Apa yang Bisa Anda Lakukan di Design Studio',
        block: {
          kind: 'list',
          items: [
            'Memilih model thobe sesuai preferensi Anda',
            'Memilih jenis kerah dan manset',
            'Memilih material dari koleksi bahan yang tersedia',
            'Memilih warna sesuai kombinasi yang tersedia',
            'Melihat kombinasi desain dan estimasi harga secara langsung',
          ],
        },
      },
      {
        heading: 'Bagaimana Design Studio Berbeda dari Toko Online Biasa',
        block: {
          kind: 'paragraphs',
          items: [
            'Toko online konvensional menjual produk yang sudah jadi dalam ukuran standar. Design Studio tidak menjual produk jadi — setiap kombinasi yang Anda pilih menjadi dasar pola personal yang baru dibentuk setelah pengukuran Anda dikonfirmasi, bukan stok yang tinggal dikirim.',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah saya harus menyelesaikan desain sendirian?', answer: 'Tidak. Anda bisa menjelajahi Design Studio sendiri, atau didampingi tim kami secara real-time lewat video call fitting maupun home visit.' },
      { question: 'Apakah harga yang muncul di Design Studio final?', answer: 'Estimasi harga di Design Studio mencerminkan kombinasi yang Anda pilih; harga final dikonfirmasi saat konsultasi berdasarkan detail desain lengkap.' },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'cara-mendesain-thobe-sebelum-dijahit' },
      { category: 'design-studio', slug: 'kenapa-mulai-dari-desain-bukan-jahitan' },
      { category: 'design-studio', slug: 'custom-thobe-online-panduan-lengkap' },
    ],
    relatedCategories: ['fabrics'],
    tags: { service: ['design-studio'] },
  },
  {
    slug: 'cara-mendesain-thobe-sebelum-dijahit',
    category: 'design-studio',
    eyebrow: 'Design Studio',
    title: 'Cara Mendesain Thobe Sebelum Dijahit',
    navLabel: 'Cara Mendesain Thobe',
    metaDescription: 'Langkah demi langkah menggunakan Design Studio untuk merancang thobe Anda sebelum proses jahit dimulai.',
    dek: 'Panduan praktis menggunakan Design Studio dari awal hingga desain siap diproduksi.',
    definition:
      'Mendesain thobe sebelum dijahit berarti menentukan kombinasi Model, Kerah, Manset, Material, dan Warna di Design Studio terlebih dahulu, sehingga pola dan produksi mengikuti desain yang sudah disetujui, bukan sebaliknya.',
    quickAnswer:
      'Buka Design Studio, pilih Model, Kerah, Manset, Material, dan Warna satu per satu sambil melihat pratinjau kombinasi dan estimasi harga, lalu simpan atau lanjutkan ke konsultasi untuk finalisasi.',
    keyTakeaways: [
      'Desain ditentukan sebelum kain dipotong, bukan disesuaikan setelahnya',
      'Setiap pilihan komponen langsung terlihat dalam kombinasi visual',
      'Estimasi harga membantu menyesuaikan pilihan dengan budget',
      'Desain bisa didiskusikan lebih lanjut lewat video call sebelum difinalisasi',
    ],
    sections: [
      {
        heading: 'Langkah Menggunakan Design Studio',
        block: {
          kind: 'steps',
          items: [
            { name: 'Pilih Model', text: 'Tentukan model thobe dasar sebagai fondasi desain.' },
            { name: 'Pilih Kerah', text: 'Sesuaikan jenis kerah dengan preferensi dan acara Anda.' },
            { name: 'Pilih Manset', text: 'Tentukan gaya manset yang melengkapi keseluruhan desain.' },
            { name: 'Pilih Material', text: 'Jelajahi koleksi bahan dan lihat bagaimana teksturnya memengaruhi tampilan.' },
            { name: 'Pilih Warna', text: 'Sesuaikan warna akhir dengan kombinasi yang sudah dipilih.' },
            { name: 'Tinjau & Lanjutkan', text: 'Lihat estimasi harga, lalu lanjutkan ke konsultasi untuk finalisasi.' },
          ],
        },
      },
      {
        heading: 'Tips Sebelum Memulai',
        block: {
          kind: 'list',
          items: [
            'Siapkan gambaran acara yang dituju agar pilihan lebih terarah',
            'Coba beberapa kombinasi sebelum memutuskan — tidak ada batasan mencoba',
            'Gunakan sesi video call jika ingin masukan langsung dari tim kami',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah kombinasi yang saya pilih bisa diubah nanti?', answer: 'Bisa, selama desain belum difinalisasi dan produksi belum dimulai — diskusikan perubahan saat konsultasi.' },
      { question: 'Apakah saya perlu akun untuk menggunakan Design Studio?', answer: 'Tidak — Anda bisa langsung menjelajahi kombinasi desain tanpa proses pendaftaran.' },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'apa-itu-design-studio-local-tailor' },
      { category: 'design-studio', slug: 'kenapa-mulai-dari-desain-bukan-jahitan' },
      { category: 'fabrics', slug: 'premium-cotton' },
    ],
    relatedCategories: ['fabrics'],
    tags: { service: ['design-studio'] },
  },
  {
    slug: 'kenapa-mulai-dari-desain-bukan-jahitan',
    category: 'design-studio',
    eyebrow: 'Design Studio',
    title: 'Kenapa Kami Memulai dari Desain, Bukan Jahitan',
    navLabel: 'Kenapa Mulai dari Desain',
    metaDescription: 'Alasan Local Tailor merancang proses bespoke dimulai dari Design Studio, bukan langsung dari proses jahit seperti tailor pada umumnya.',
    dek: 'Filosofi di balik urutan proses Design Studio sebelum produksi.',
    definition:
      'Local Tailor memulai setiap pesanan dari Design Studio — tahap menentukan dan menyetujui desain lengkap — sebelum proses jahit dimulai, karena keputusan desain yang matang di awal mengurangi revisi dan kesalahan di tahap produksi.',
    quickAnswer:
      'Kami memulai dari desain agar setiap keputusan — model, kerah, manset, material, warna — sudah disepakati sebelum kain dipotong, sehingga produksi berjalan sesuai rencana tanpa revisi besar di tengah jalan.',
    keyTakeaways: [
      'Desain yang matang di awal mengurangi risiko revisi saat produksi',
      'Pelanggan bisa melihat gambaran akhir sebelum kain dipotong',
      'Estimasi harga menjadi jelas sejak awal, bukan berubah di tengah proses',
      'Pendekatan ini konsisten dengan prinsip bespoke: personal sejak keputusan pertama',
    ],
    sections: [
      {
        heading: 'Masalah dari Pendekatan "Jahit Dulu, Sesuaikan Nanti"',
        block: {
          kind: 'paragraphs',
          items: [
            'Sebagian proses tailoring konvensional membiarkan detail desain diputuskan sambil jalan — baru dipertegas saat fitting. Pendekatan ini berisiko menghasilkan revisi besar setelah sebagian pekerjaan sudah dilakukan, memperlambat proses dan berpotensi memengaruhi kualitas hasil akhir.',
          ],
        },
      },
      {
        heading: 'Kenapa Desain Lebih Dulu Lebih Baik',
        block: {
          kind: 'list',
          items: [
            'Anda tahu persis seperti apa hasil akhirnya sebelum produksi dimulai',
            'Tim produksi bekerja dari spesifikasi yang jelas, bukan interpretasi',
            'Perubahan pikiran soal desain lebih mudah dilakukan sebelum kain dipotong dibanding sesudahnya',
            'Estimasi harga dan timeline menjadi lebih akurat sejak awal',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah saya bisa mengubah desain setelah produksi dimulai?', answer: 'Perubahan besar setelah produksi dimulai lebih terbatas — inilah kenapa finalisasi desain di Design Studio dilakukan dengan matang sebelum tahap ini.' },
      { question: 'Apakah pendekatan ini memperlambat proses keseluruhan?', answer: 'Justru sebaliknya — waktu yang digunakan untuk memastikan desain di awal biasanya mempercepat keseluruhan proses karena mengurangi revisi di tengah produksi.' },
    ],
    relatedArticles: [
      { category: 'design-studio', slug: 'apa-itu-design-studio-local-tailor' },
      { category: 'design-studio', slug: 'cara-mendesain-thobe-sebelum-dijahit' },
      { category: 'tailoring', slug: 'what-is-bespoke' },
    ],
    relatedCategories: ['tailoring'],
    tags: { service: ['design-studio'] },
  },
]
