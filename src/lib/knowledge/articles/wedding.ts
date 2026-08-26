import type { KnowledgeArticle } from '../types'

// Sprint W6-5 — Wedding Cluster. 8 commercial/practical wedding guides,
// deliberately distinct from styling/wedding-thobe-style (pure aesthetic
// styling): this cluster covers booking logistics, couple/family
// coordination, and premium-tier options — real decisions a buyer makes
// before and around ordering, not color/accessory pairing alone.
export const WEDDING_ARTICLES: KnowledgeArticle[] = [
  {
    slug: 'akad-pria',
    category: 'wedding',
    eyebrow: 'Panduan Pernikahan',
    title: 'Thobe Akad Nikah untuk Pria — Panduan Lengkap',
    navLabel: 'Thobe Akad Pria',
    metaDescription:
      'Panduan memilih thobe akad nikah untuk pria — warna, bahan, dan gaya yang tepat untuk momen sakral akad, plus kesalahan umum yang perlu dihindari.',
    dek: 'Akad menuntut kesan khidmat, bukan sekadar formal — panduan memilih thobe yang tepat untuk momen paling sakral dalam pernikahan.',
    definition:
      'Thobe akad nikah adalah thobe yang dikenakan pengantin pria khusus pada prosesi akad nikah, umumnya dipilih dengan warna dan gaya yang lebih khidmat dan tenang dibanding thobe resepsi yang lebih meriah.',
    quickAnswer:
      'Thobe akad nikah paling ideal berwarna netral gelap seperti navy atau krem gelap, berbahan premium seperti katun Mesir atau wool blend, dengan aksesori minimal agar kesan khidmat lebih menonjol dibanding kesan meriah.',
    keyTakeaways: [
      'Akad menuntut kesan khidmat dan tenang, berbeda dari kesan meriah yang lebih cocok untuk resepsi',
      'Warna netral gelap (navy, krem gelap, coklat tua) paling umum dipilih untuk akad',
      'Aksesori sebaiknya minimal — bisht sederhana tanpa detail berlebihan sudah cukup elegan',
      'Pemesanan idealnya dimulai 4–6 minggu sebelum hari-H untuk konsultasi dan fitting yang matang',
      'Bahan harus tetap nyaman dipakai duduk lama selama prosesi ijab kabul dan sesi foto',
    ],
    sections: [
      {
        heading: 'Kenapa Thobe Akad Berbeda dari Thobe Resepsi',
        block: {
          kind: 'paragraphs',
          items: [
            'Akad nikah adalah prosesi sakral yang sarat makna religius — ijab kabul diucapkan di hadapan wali, saksi, dan penghulu, dalam suasana yang tenang dan khidmat, bukan perayaan meriah seperti resepsi. Pilihan thobe untuk momen ini idealnya mencerminkan suasana tersebut: elegan namun tidak berlebihan, formal namun tidak mencolok.',
            'Banyak pengantin pria justru salah kaprah menyamakan thobe akad dengan thobe resepsi — memilih warna atau aksesori yang terlalu ramai untuk momen yang sebenarnya menuntut ketenangan. Memahami perbedaan ini sejak awal konsultasi akan membantu tailor mengarahkan pilihan yang tepat.',
          ],
        },
      },
      {
        heading: 'Panduan Memilih Warna dan Bahan',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Warna yang Direkomendasikan',
            block: {
              kind: 'list',
              items: [
                'Navy — pilihan paling umum, elegan tanpa terlalu berat untuk suasana akad',
                'Krem gelap atau coklat tua — hangat dan tenang, sering dipilih untuk akad bernuansa tradisional',
                'Putih gading (bukan putih terang) — klasik dan sopan, cocok untuk akad bernuansa religius kental',
              ],
            },
          },
          {
            heading: 'Bahan yang Direkomendasikan',
            block: {
              kind: 'paragraphs',
              items: [
                'Katun Mesir memberi kelembutan dan kenyamanan untuk duduk lama selama prosesi, sementara wool blend memberi kesan lebih terstruktur jika akad dilangsungkan di ruangan ber-AC. Hindari bahan yang terlalu mudah kusut seperti linen murni, karena prosesi akad sering berlangsung 30–60 menit dalam posisi duduk.',
              ],
            },
          },
        ],
      },
      {
        heading: 'Rekomendasi Ahli',
        block: {
          kind: 'paragraphs',
          items: [
            'Tailor berpengalaman umumnya menyarankan kesederhanaan yang disengaja untuk thobe akad — satu warna dominan, satu aksesori utama (biasanya bisht ringan), tanpa layering berlebihan. Kesan "tenang tapi berkelas" lebih sulit dicapai daripada kesan "mewah", justru karena harus mengandalkan potongan dan bahan, bukan ornamen.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Memilih warna yang terlalu terang atau mencolok, mengurangi kesan khidmat prosesi',
            'Menggunakan aksesori berlebihan yang lebih cocok untuk resepsi, seperti bisht dengan detail bordir tebal',
            'Memesan terlalu mepet dengan hari-H sehingga tidak ada waktu untuk fitting ulang jika diperlukan',
            'Mengabaikan kenyamanan duduk lama, memilih bahan yang terlalu kaku atau tebal untuk durasi prosesi',
          ],
        },
      },
    ],
    expertNote:
      'Untuk akad, kami selalu menyarankan klien memilih satu warna dominan dan membiarkan potongan serta bahan yang berbicara — kesederhanaan yang disengaja jauh lebih elegan di momen sakral dibanding tampilan yang terlalu ramai.',
    comparisonTable: {
      caption: 'Perbandingan penekanan gaya thobe akad vs thobe resepsi',
      headers: ['Aspek', 'Thobe Akad', 'Thobe Resepsi'],
      rows: [
        ['Kesan yang dituju', 'Khidmat, tenang', 'Meriah, mewah'],
        ['Warna umum', 'Navy, krem gelap, putih gading', 'Navy, hitam, warna tema pernikahan'],
        ['Aksesori', 'Minimal, satu bisht sederhana', 'Lebih lengkap, bisa berlapis'],
      ],
    },
    faq: [
      {
        question: 'Apakah thobe akad dan resepsi harus berbeda?',
        answer:
          'Tidak wajib, namun umum dan direkomendasikan — akad menuntut kesan lebih tenang, sementara resepsi memberi ruang untuk tampilan yang lebih meriah dan berlapis.',
      },
      {
        question: 'Warna apa yang paling aman untuk thobe akad?',
        answer: 'Navy adalah pilihan paling aman — elegan, netral, dan cocok untuk hampir semua tema dekorasi akad.',
      },
      {
        question: 'Berapa lama sebelum akad sebaiknya memesan thobe?',
        answer: 'Idealnya 4–6 minggu sebelumnya, memberi ruang untuk konsultasi, pengukuran, produksi, dan fitting akhir.',
      },
      {
        question: 'Apakah bisht wajib dipakai saat akad?',
        answer:
          'Tidak wajib, namun banyak pengantin pria memilih memakainya untuk menambah kesan formal — pilih model yang sederhana agar tidak mengalihkan perhatian dari kekhidmatan prosesi.',
      },
    ],
    relatedArticles: [
      { category: 'wedding', slug: 'resepsi-pria' },
      { category: 'wedding', slug: 'timeline-custom-wedding' },
      { category: 'styling', slug: 'wedding-thobe-style' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'egyptian-cotton' },
      { category: 'fabrics', slug: 'wool-blend' },
    ],
    relatedCategories: ['tailoring'],
    tags: { occasion: ['pernikahan', 'akad'], audience: ['pria'], service: ['bespoke'] },
  },
  {
    slug: 'resepsi-pria',
    category: 'wedding',
    eyebrow: 'Panduan Pernikahan',
    title: 'Thobe Resepsi untuk Pria — Panduan Lengkap',
    navLabel: 'Thobe Resepsi Pria',
    metaDescription:
      'Panduan memilih thobe resepsi untuk pria — warna, bahan premium, dan aksesori untuk tampil maksimal di hari pernikahan.',
    dek: 'Resepsi adalah momen untuk tampil maksimal — panduan memilih thobe yang berkesan tanpa berlebihan.',
    definition:
      'Thobe resepsi adalah thobe yang dikenakan pengantin pria pada acara resepsi pernikahan, umumnya dipilih dengan warna dan aksesori yang lebih berani dan berlapis dibanding thobe akad, mengingat resepsi adalah momen perayaan yang lebih terbuka dan fotogenik.',
    quickAnswer:
      'Thobe resepsi paling ideal berbahan premium dengan jatuh kain terstruktur seperti wool blend, dipadukan bisht berkualitas tinggi dan aksesori yang lebih lengkap dibanding akad, karena resepsi menuntut tampilan maksimal untuk foto dan interaksi tamu.',
    keyTakeaways: [
      'Resepsi memberi ruang untuk tampilan lebih berani dan berlapis dibanding akad',
      'Bahan harus terlihat premium dari jarak dekat maupun dari jarak foto',
      'Bisht berkualitas tinggi adalah elemen aksesori paling menonjol untuk resepsi',
      'Pertimbangkan tema dekorasi dan durasi acara saat memilih bahan dan warna',
      'Uji ketahanan tampilan thobe untuk durasi acara yang panjang, termasuk sesi foto dan interaksi tamu',
    ],
    sections: [
      {
        heading: 'Karakter Thobe Resepsi',
        block: {
          kind: 'paragraphs',
          items: [
            'Berbeda dari akad yang menuntut kesederhanaan khidmat, resepsi adalah panggung perayaan — pengantin pria berdiri di depan ratusan tamu, difoto dari berbagai sudut, dan berinteraksi sepanjang acara yang bisa berlangsung berjam-jam. Thobe resepsi karenanya perlu bekerja lebih keras: terlihat premium dari dekat maupun dari jarak foto, dan tetap nyaman dipakai berdiri dan berjalan berjam-jam.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Memilih Thobe Resepsi',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Menyesuaikan dengan Tema Dekorasi',
            block: {
              kind: 'paragraphs',
              items: [
                'Warna thobe idealnya selaras dengan palet dekorasi resepsi — bukan harus identik, tapi tidak bertabrakan. Navy dan krem gelap umumnya aman untuk hampir semua tema, sementara warna yang lebih spesifik seperti maroon atau hijau tua bisa dipertimbangkan jika sesuai tema yang lebih personal.',
              ],
            },
          },
          {
            heading: 'Mempertimbangkan Durasi Acara',
            block: {
              kind: 'paragraphs',
              items: [
                'Resepsi bisa berlangsung 4–6 jam, jauh lebih lama dari akad. Pilih bahan yang tetap terlihat rapi meski dipakai berdiri, berjalan, dan berfoto berjam-jam — wool blend dan katun Mesir premium adalah dua pilihan yang paling tahan terhadap durasi panjang tanpa kehilangan bentuk.',
              ],
            },
          },
        ],
      },
      {
        heading: 'Rekomendasi Ahli',
        block: {
          kind: 'paragraphs',
          items: [
            'Investasikan anggaran lebih besar pada bahan dibanding jumlah aksesori — satu bisht berkualitas tinggi dengan jatuh kain yang bagus akan terlihat jauh lebih elegan di foto dibanding banyak aksesori dengan kualitas biasa. Foto pernikahan disimpan seumur hidup, dan kualitas bahan jauh lebih terlihat di foto close-up dibanding kuantitas aksesori.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Memilih bahan yang terlihat bagus di ruangan tapi kurang fotogenik di bawah pencahayaan resepsi',
            'Terlalu banyak aksesori sehingga mengalihkan perhatian dari potongan thobe itu sendiri',
            'Tidak mempertimbangkan kenyamanan berdiri lama, memilih bahan yang terlalu berat atau kaku',
            'Memesan warna yang bentrok dengan tema dekorasi tanpa mengonfirmasi ke tailor terlebih dahulu',
          ],
        },
      },
    ],
    expertNote:
      'Kami selalu menyarankan klien membawa referensi foto tema dekorasi saat konsultasi resepsi — warna yang terlihat bagus sendirian belum tentu selaras dengan latar dekorasi, dan ini jauh lebih mudah dikoreksi di tahap konsultasi dibanding setelah thobe selesai dijahit.',
    comparisonTable: {
      caption: 'Perbandingan bahan populer untuk thobe resepsi',
      headers: ['Bahan', 'Kesan', 'Paling Cocok Untuk'],
      rows: [
        ['Wool Blend', 'Terstruktur, elegan malam hari', 'Resepsi indoor, ber-AC'],
        ['Katun Mesir', 'Lembut, elegan sepanjang hari', 'Resepsi siang atau outdoor teduh'],
        ['Premium Cotton', 'Serbaguna, nyaman', 'Resepsi santai atau semi-formal'],
      ],
    },
    faq: [
      {
        question: 'Apakah thobe resepsi harus lebih mewah dari thobe akad?',
        answer:
          'Umumnya ya, karena resepsi adalah momen perayaan yang lebih terbuka. Namun "lebih mewah" idealnya berarti bahan dan potongan yang lebih premium, bukan sekadar lebih banyak aksesori.',
      },
      {
        question: 'Warna apa yang paling fotogenik untuk thobe resepsi?',
        answer:
          'Navy dan krem gelap paling konsisten terlihat baik di berbagai kondisi pencahayaan resepsi, sementara warna sangat gelap seperti hitam pekat kadang kehilangan detail tekstur di foto dengan pencahayaan redup.',
      },
      {
        question: 'Berapa lama thobe resepsi perlu tetap terlihat rapi?',
        answer:
          'Idealnya sepanjang durasi acara, umumnya 4–6 jam, termasuk sesi berdiri, berjalan, dan berfoto — pilih bahan dengan ketahanan kusut yang baik seperti wool blend atau katun Mesir premium.',
      },
    ],
    relatedArticles: [
      { category: 'wedding', slug: 'akad-pria' },
      { category: 'wedding', slug: 'premium-thobe-wedding' },
      { category: 'styling', slug: 'formal-thobe' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'wool-blend' },
      { category: 'fabrics', slug: 'egyptian-cotton' },
    ],
    relatedCategories: ['styling'],
    tags: { occasion: ['pernikahan', 'resepsi'], audience: ['pria'], service: ['bespoke'] },
  },
  {
    slug: 'couple-muslim',
    category: 'wedding',
    eyebrow: 'Panduan Pernikahan',
    title: 'Panduan Outfit Couple Muslim untuk Pernikahan',
    navLabel: 'Couple Muslim',
    metaDescription:
      'Panduan menyelaraskan outfit pengantin pria dan wanita muslim untuk pernikahan — kombinasi warna, bahan, dan gaya yang serasi tanpa harus identik.',
    dek: 'Serasi tidak berarti identik — panduan menyelaraskan outfit pengantin pria dan wanita untuk tampilan couple yang elegan.',
    definition:
      'Outfit couple muslim untuk pernikahan adalah kombinasi busana pengantin pria dan wanita yang dirancang saling melengkapi secara warna, tema, dan tingkat formalitas, tanpa harus menggunakan bahan atau motif yang benar-benar identik.',
    quickAnswer:
      'Outfit couple muslim yang serasi paling baik dicapai dengan menyamakan satu elemen utama — biasanya warna dasar atau aksen tertentu — sementara detail lain seperti motif dan aksesori tetap disesuaikan dengan gaya masing-masing.',
    keyTakeaways: [
      'Serasi tidak berarti identik — satu elemen bersama (warna atau aksen) sudah cukup untuk kesan couple',
      'Diskusikan palet warna bersama pasangan sebelum masing-masing berkonsultasi dengan tailor/desainer',
      'Pertimbangkan tingkat formalitas yang setara antara outfit pria dan wanita',
      'Bahan tidak harus sama, namun kualitas dan kesan kemewahan sebaiknya seimbang',
      'Lakukan uji visual bersama (foto berdampingan) sebelum hari-H untuk memastikan keserasian',
    ],
    sections: [
      {
        heading: 'Filosofi Serasi Tanpa Identik',
        block: {
          kind: 'paragraphs',
          items: [
            'Kesalahpahaman umum tentang outfit couple adalah anggapan bahwa keduanya harus menggunakan kain atau motif yang persis sama. Pendekatan yang lebih elegan — dan lebih umum dipraktikkan desainer busana pernikahan — adalah menyelaraskan satu elemen kunci (biasanya warna dasar, kadang aksen tertentu seperti bordir atau warna aksesori) sambil membiarkan detail lain mengikuti gaya masing-masing pihak.',
            'Pendekatan ini memberi ruang lebih besar bagi masing-masing pihak untuk memilih siluet dan detail yang paling nyaman dan sesuai karakter pribadi, sambil tetap menghasilkan kesan pasangan yang kompak saat difoto berdampingan.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Menyelaraskan Outfit',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Menentukan Elemen Bersama',
            block: {
              kind: 'list',
              items: [
                'Warna dasar yang sama (misalnya keduanya bernuansa navy atau krem)',
                'Aksen warna yang sama meski warna dasar berbeda (misalnya sama-sama menggunakan aksen emas)',
                'Motif atau tekstur yang senada, meski tidak identik persis',
              ],
            },
          },
          {
            heading: 'Urutan Konsultasi yang Disarankan',
            block: {
              kind: 'paragraphs',
              items: [
                'Sepakati dulu palet warna bersama sebelum masing-masing pihak berkonsultasi terpisah dengan tailor atau desainer masing-masing. Ini menghindari situasi di mana salah satu pihak sudah memesan sementara pihak lain baru mulai konsultasi dengan referensi warna yang berbeda.',
              ],
            },
          },
        ],
      },
      {
        heading: 'Rekomendasi Ahli',
        block: {
          kind: 'paragraphs',
          items: [
            'Bawa contoh kain atau foto referensi outfit pasangan saat konsultasi — ini membantu tailor menyarankan warna thobe yang benar-benar selaras, bukan sekadar "sama-sama gelap" atau "sama-sama terang" yang belum tentu cocok secara nuansa saat difoto berdampingan.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Memesan outfit terpisah tanpa menyepakati palet warna bersama terlebih dahulu',
            'Menyamakan warna secara harfiah tanpa memperhatikan bahwa nuansa warna yang sama bisa terlihat berbeda pada kain berbeda',
            'Mengabaikan keseimbangan tingkat formalitas — outfit yang terlalu sederhana berdampingan dengan yang terlalu mewah akan terlihat tidak seimbang',
            'Tidak melakukan uji visual bersama sebelum hari-H',
          ],
        },
      },
    ],
    expertNote:
      'Saran kami untuk pasangan yang ingin tampil serasi: sepakati satu warna kunci di awal, lalu percayakan detail lainnya pada masing-masing tailor atau desainer — hasil yang terlalu dipaksakan identik justru sering terlihat kurang natural di foto.',
    faq: [
      {
        question: 'Apakah outfit couple muslim harus menggunakan kain yang sama persis?',
        answer:
          'Tidak. Cukup satu elemen bersama seperti warna dasar atau aksen tertentu untuk menciptakan kesan serasi tanpa harus identik.',
      },
      {
        question: 'Bagaimana cara memastikan warna outfit pria dan wanita benar-benar selaras?',
        answer:
          'Bawa contoh kain atau foto referensi saat konsultasi, dan jika memungkinkan, lakukan uji visual berdampingan sebelum kain benar-benar dipotong untuk produksi.',
      },
      {
        question: 'Siapa yang sebaiknya memilih palet warna lebih dulu, pria atau wanita?',
        answer:
          'Tidak ada aturan baku — yang penting palet warna disepakati bersama sebelum masing-masing pihak mulai konsultasi terpisah dengan tailor atau desainernya.',
      },
    ],
    relatedArticles: [
      { category: 'wedding', slug: 'color-guide' },
      { category: 'wedding', slug: 'family-outfit' },
      { category: 'styling', slug: 'wedding-thobe-style' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'egyptian-cotton' },
      { category: 'fabrics', slug: 'wool-blend' },
    ],
    relatedCategories: ['styling'],
    tags: { occasion: ['pernikahan'], audience: ['pasangan'], service: ['bespoke'] },
  },
  {
    slug: 'timeline-custom-wedding',
    category: 'wedding',
    eyebrow: 'Panduan Pernikahan',
    title: 'Timeline Pemesanan Thobe Custom untuk Pernikahan',
    navLabel: 'Timeline Custom Wedding',
    metaDescription:
      'Timeline lengkap pemesanan thobe custom untuk pernikahan — dari konsultasi hingga hari-H, berapa minggu sebelumnya sebaiknya memulai proses.',
    dek: 'Thobe bespoke butuh waktu — panduan timeline lengkap agar tidak terburu-buru menjelang hari-H.',
    definition:
      'Timeline custom wedding adalah rangkaian tahapan waktu dari konsultasi awal hingga thobe pernikahan siap dipakai, mencakup konsultasi, pengukuran, produksi, dan fitting akhir yang masing-masing membutuhkan alokasi waktu tersendiri.',
    quickAnswer:
      'Proses pemesanan thobe custom untuk pernikahan idealnya dimulai 6–8 minggu sebelum hari-H, mencakup konsultasi (minggu 1), pengukuran (minggu 1–2), produksi (minggu 2–5), dan fitting akhir (minggu 6–7), menyisakan waktu cadangan sebelum hari-H.',
    keyTakeaways: [
      'Idealnya mulai proses 6–8 minggu sebelum hari-H, bukan 2–3 minggu',
      'Konsultasi dan pengukuran sebaiknya selesai di 1–2 minggu pertama',
      'Produksi bahan premium bisa memakan waktu lebih lama dibanding bahan standar',
      'Sisakan minimal 1 minggu cadangan sebelum hari-H untuk fitting ulang jika diperlukan',
      'Pesan lebih awal jika memerlukan family outfit atau couple outfit yang butuh koordinasi tambahan',
    ],
    sections: [
      {
        heading: 'Kenapa Timeline Penting untuk Thobe Custom',
        block: {
          kind: 'paragraphs',
          items: [
            'Berbeda dari membeli thobe ready-to-wear yang bisa langsung dipakai, thobe custom melalui proses berlapis — konsultasi untuk menentukan gaya, pengukuran presisi oleh fitter, pembentukan pola, produksi dengan bahan pilihan, hingga fitting akhir untuk memastikan hasil benar-benar pas. Setiap tahap membutuhkan waktu, dan memesan terlalu mepet dengan hari-H akan memaksa salah satu tahap dipercepat, berisiko mengorbankan kualitas hasil akhir.',
          ],
        },
      },
      {
        heading: 'Timeline Lengkap',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Minggu 1: Konsultasi dan Pemilihan Bahan',
            block: {
              kind: 'paragraphs',
              items: [
                'Sesi konsultasi untuk mendiskusikan gaya, warna, dan bahan, sekaligus menyelaraskan dengan tema pernikahan jika ada. Ini juga waktu yang tepat untuk mendiskusikan kebutuhan tambahan seperti couple outfit atau family outfit.',
              ],
            },
          },
          {
            heading: 'Minggu 1–2: Pengukuran',
            block: {
              kind: 'paragraphs',
              items: [
                'Pengukuran langsung oleh fitter untuk membentuk Digital Body Profile yang akurat — tahap ini idealnya tidak digabung dengan konsultasi awal jika Anda masih ragu dengan pilihan bahan, agar tidak terburu-buru mengambil keputusan.',
              ],
            },
          },
          {
            heading: 'Minggu 2–5: Produksi',
            block: {
              kind: 'paragraphs',
              items: [
                'Tahap pembentukan pola, pemotongan, dan penjahitan. Bahan premium seperti wool blend atau katun Mesir bisa membutuhkan waktu produksi sedikit lebih lama dibanding bahan standar karena penanganan yang lebih hati-hati.',
              ],
            },
          },
          {
            heading: 'Minggu 6–7: Fitting Akhir',
            block: {
              kind: 'paragraphs',
              items: [
                'Sesi fitting untuk memastikan thobe benar-benar pas, dengan ruang untuk penyesuaian kecil jika diperlukan sebelum thobe benar-benar selesai.',
              ],
            },
          },
        ],
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Memesan kurang dari 3 minggu sebelum hari-H tanpa mendiskusikan urgensi ke tailor terlebih dahulu',
            'Tidak menyisakan waktu cadangan untuk fitting ulang',
            'Menunda keputusan bahan hingga mendekati hari-H, memperlambat seluruh proses produksi',
            'Lupa memperhitungkan waktu tambahan untuk koordinasi couple atau family outfit',
          ],
        },
      },
    ],
    expertNote:
      'Semakin dekat hari-H, semakin sedikit ruang untuk memperbaiki hal-hal kecil yang sebenarnya wajar terjadi di proses bespoke — kami selalu menyarankan klien memulai konsultasi jauh lebih awal dari yang mereka kira perlu.',
    comparisonTable: {
      caption: 'Perbandingan timeline ideal vs timeline mepet',
      headers: ['Tahap', 'Timeline Ideal', 'Timeline Mepet (Risiko)'],
      rows: [
        ['Konsultasi', 'Minggu 1', 'Minggu 1 (langsung terburu-buru)'],
        ['Pengukuran', 'Minggu 1–2', 'Digabung dengan konsultasi'],
        ['Produksi', 'Minggu 2–5', 'Dipercepat, berisiko kurang presisi'],
        ['Fitting akhir + cadangan', 'Minggu 6–8', 'Tidak ada waktu cadangan'],
      ],
    },
    faq: [
      {
        question: 'Berapa minggu minimal sebelum hari-H sebaiknya mulai memesan thobe pernikahan?',
        answer: 'Idealnya 6–8 minggu, dengan minimal absolut 4 minggu jika desain dan bahan yang dipilih tidak terlalu kompleks.',
      },
      {
        question: 'Apakah bahan premium membutuhkan waktu produksi lebih lama?',
        answer:
          'Umumnya sedikit lebih lama karena penanganan yang lebih hati-hati, terutama untuk bahan seperti wool blend yang membutuhkan presisi lebih tinggi saat dipotong dan dijahit.',
      },
      {
        question: 'Apa yang terjadi jika saya memesan terlalu mepet dengan hari-H?',
        answer:
          'Prosesnya tetap bisa dilakukan namun dengan risiko lebih tinggi — waktu untuk fitting ulang jika diperlukan akan sangat terbatas, dan pilihan bahan tertentu mungkin harus disesuaikan dengan ketersediaan waktu produksi.',
      },
    ],
    relatedArticles: [
      { category: 'wedding', slug: 'akad-pria' },
      { category: 'wedding', slug: 'bespoke-wedding-guide' },
      { category: 'tailoring', slug: 'what-is-bespoke' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'wool-blend' },
      { category: 'fabrics', slug: 'egyptian-cotton' },
    ],
    relatedCategories: ['tailoring'],
    tags: { occasion: ['pernikahan'], service: ['bespoke'] },
  },
  {
    slug: 'color-guide',
    category: 'wedding',
    eyebrow: 'Panduan Pernikahan',
    title: 'Panduan Warna Thobe Pernikahan Berdasarkan Tema',
    navLabel: 'Panduan Warna Pernikahan',
    metaDescription:
      'Panduan memilih warna thobe pernikahan berdasarkan tema dekorasi — kombinasi yang serasi untuk tema klasik, modern, rustic, dan tradisional.',
    dek: 'Warna thobe yang selaras dengan tema dekorasi menciptakan kesan visual yang jauh lebih kuat dalam foto dan kenangan pernikahan.',
    definition:
      'Panduan warna thobe pernikahan adalah referensi memilih warna thobe yang selaras dengan tema dekorasi dan palet warna keseluruhan acara pernikahan, bukan sekadar warna favorit pribadi pengantin.',
    quickAnswer:
      'Warna thobe pernikahan sebaiknya dipilih berdasarkan tema dekorasi acara — navy dan krem gelap cocok untuk hampir semua tema, sementara warna yang lebih spesifik seperti maroon atau hijau tua cocok untuk tema yang lebih personal dan sudah memiliki palet warna jelas.',
    keyTakeaways: [
      'Pilih warna thobe berdasarkan tema dekorasi, bukan hanya preferensi pribadi',
      'Navy dan krem gelap adalah dua warna paling serbaguna lintas tema',
      'Tema klasik/formal cocok dengan navy atau hitam; tema rustic cocok dengan coklat/olive',
      'Hindari warna yang terlalu mirip dengan warna dominan dekorasi latar, agar thobe tetap menonjol di foto',
      'Konsultasikan swatch kain dengan palet warna dekorasi sebelum keputusan final',
    ],
    sections: [
      {
        heading: 'Kenapa Warna Thobe Harus Selaras dengan Tema',
        block: {
          kind: 'paragraphs',
          items: [
            'Foto pernikahan menangkap pengantin dalam konteks latar dekorasi secara keseluruhan — warna thobe yang tidak selaras atau justru terlalu identik dengan warna latar bisa membuat pengantin "menyatu" dengan latar alih-alih menonjol, atau menciptakan kontras yang tidak diinginkan.',
          ],
        },
      },
      {
        heading: 'Panduan Warna per Tema Dekorasi',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Tema Klasik/Formal',
            block: {
              kind: 'paragraphs',
              items: [
                'Navy, hitam, dan krem gelap adalah tiga warna yang paling konsisten cocok dengan tema klasik yang umumnya menggunakan palet emas, putih, dan warna netral gelap.',
              ],
            },
          },
          {
            heading: 'Tema Rustic/Outdoor',
            block: {
              kind: 'paragraphs',
              items: [
                'Coklat tua, olive, dan krem hangat lebih selaras dengan tema rustic yang biasanya menggunakan elemen kayu, dedaunan, dan warna earthy sebagai dekorasi utama.',
              ],
            },
          },
          {
            heading: 'Tema Modern/Minimalis',
            block: {
              kind: 'paragraphs',
              items: [
                'Abu-abu gelap, navy, dan putih gading cocok dengan tema modern yang umumnya mengandalkan palet monokrom dan garis bersih sebagai identitas visual.',
              ],
            },
          },
        ],
      },
      {
        heading: 'Rekomendasi Ahli',
        block: {
          kind: 'paragraphs',
          items: [
            'Bawa swatch kain fisik (bukan hanya foto di layar) saat menentukan warna final, dan bandingkan langsung dengan sampel warna dekorasi jika memungkinkan — warna yang terlihat cocok di layar ponsel sering terlihat berbeda di bawah pencahayaan venue sesungguhnya.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Memilih warna favorit pribadi tanpa mempertimbangkan tema dekorasi sama sekali',
            'Memilih warna yang nyaris identik dengan warna dominan latar, membuat thobe kurang menonjol di foto',
            'Menentukan warna hanya dari foto digital tanpa melihat swatch kain fisik',
            'Mengabaikan pencahayaan venue — warna tertentu berubah kesan signifikan di bawah lampu hangat vs lampu putih',
          ],
        },
      },
    ],
    expertNote:
      'Kami selalu meminta klien membawa moodboard atau foto referensi dekorasi saat konsultasi warna — ini jauh lebih efektif daripada mendeskripsikan tema secara lisan, dan membantu kami menyarankan warna yang benar-benar akan terlihat bagus di hari-H.',
    comparisonTable: {
      caption: 'Rekomendasi warna thobe berdasarkan tema pernikahan',
      headers: ['Tema Dekorasi', 'Warna Direkomendasikan', 'Warna Dihindari'],
      rows: [
        ['Klasik/Formal', 'Navy, hitam, krem gelap', 'Warna pastel terlalu terang'],
        ['Rustic/Outdoor', 'Coklat tua, olive, krem hangat', 'Warna sangat gelap/formal berlebihan'],
        ['Modern/Minimalis', 'Abu-abu gelap, navy, putih gading', 'Warna terlalu ramai/mencolok'],
      ],
    },
    faq: [
      {
        question: 'Apakah warna thobe harus sama persis dengan tema dekorasi?',
        answer: 'Tidak harus sama persis, cukup selaras dan tidak bertabrakan — kontras yang seimbang justru membuat pengantin lebih menonjol di foto.',
      },
      {
        question: 'Warna apa yang paling cocok jika belum menentukan tema dekorasi?',
        answer: 'Navy adalah pilihan paling aman karena cocok dengan hampir semua tema dekorasi umum, dari klasik hingga modern.',
      },
      {
        question: 'Kenapa perlu membawa swatch kain fisik saat konsultasi warna?',
        answer:
          'Warna kain terlihat berbeda di layar digital dibanding kondisi pencahayaan sebenarnya — swatch fisik memberi gambaran warna yang jauh lebih akurat.',
      },
    ],
    relatedArticles: [
      { category: 'wedding', slug: 'couple-muslim' },
      { category: 'wedding', slug: 'family-outfit' },
      { category: 'styling', slug: 'wedding-thobe-style' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'wool-blend' },
      { category: 'fabrics', slug: 'premium-cotton' },
    ],
    relatedCategories: ['styling'],
    tags: { occasion: ['pernikahan'], service: ['bespoke'] },
  },
  {
    slug: 'family-outfit',
    category: 'wedding',
    eyebrow: 'Panduan Pernikahan',
    title: 'Panduan Family Outfit untuk Pernikahan',
    navLabel: 'Family Outfit',
    metaDescription:
      'Panduan menyelaraskan outfit keluarga pengantin untuk pernikahan — koordinasi warna untuk ayah, saudara, dan keluarga inti tanpa terlihat seragam.',
    dek: 'Koordinasi warna keluarga menciptakan kesan kompak di foto tanpa harus terlihat seperti seragam.',
    definition:
      'Family outfit adalah koordinasi busana anggota keluarga inti pengantin — ayah, saudara laki-laki, atau keluarga dekat lainnya — yang diselaraskan warna dan gayanya untuk menciptakan kesan kompak namun tetap personal di acara pernikahan.',
    quickAnswer:
      'Family outfit yang efektif menyelaraskan satu warna dasar atau nuansa yang sama untuk seluruh anggota keluarga, sambil membiarkan detail seperti aksesori bervariasi sesuai usia dan peran masing-masing dalam acara.',
    keyTakeaways: [
      'Koordinasi warna keluarga sebaiknya berbasis nuansa, bukan warna identik persis',
      'Bedakan sedikit gaya antara generasi (ayah vs saudara muda) agar tetap terlihat natural',
      'Rencanakan family outfit di awal proses agar tidak terburu-buru mendekati hari-H',
      'Pertimbangkan jumlah anggota keluarga yang ikut berkoordinasi — semakin banyak, semakin awal perlu direncanakan',
      'Bahan tidak harus identik, namun kualitas sebaiknya seimbang antar anggota keluarga',
    ],
    sections: [
      {
        heading: 'Kenapa Family Outfit Penting untuk Foto Keluarga',
        block: {
          kind: 'paragraphs',
          items: [
            'Foto keluarga besar adalah salah satu momen yang paling sering diabadikan dalam pernikahan, dan warna yang tidak selaras antar anggota keluarga bisa membuat foto terlihat kurang rapi meski masing-masing outfit sebenarnya bagus secara individual. Koordinasi yang baik menciptakan kesan kompak tanpa menghilangkan karakter personal masing-masing anggota keluarga.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Koordinasi Keluarga',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Menentukan Warna Dasar Bersama',
            block: {
              kind: 'paragraphs',
              items: [
                'Pilih satu warna dasar (misalnya navy) yang akan dipakai seluruh anggota keluarga inti, lalu biarkan variasi bahan atau detail kecil membedakan masing-masing individu agar tidak terlihat seperti seragam yang kaku.',
              ],
            },
          },
          {
            heading: 'Membedakan Peran dan Generasi',
            block: {
              kind: 'list',
              items: [
                'Ayah pengantin — biasanya gaya paling formal dengan bahan paling premium di antara keluarga',
                'Saudara laki-laki dewasa — warna senada, gaya sedikit lebih santai',
                'Anggota keluarga yang lebih muda — nuansa warna sama namun potongan lebih casual',
              ],
            },
          },
        ],
      },
      {
        heading: 'Rekomendasi Ahli',
        block: {
          kind: 'paragraphs',
          items: [
            'Mulai koordinasi family outfit sejak konsultasi pertama pengantin, bukan belakangan — semakin banyak anggota keluarga yang perlu diukur dan dijahit, semakin besar kebutuhan waktu produksi, dan menunggu hingga mendekati hari-H akan sangat membatasi pilihan.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Menyamakan warna secara identik persis sehingga terlihat seperti seragam, bukan koordinasi',
            'Tidak membedakan tingkat formalitas antar generasi dalam keluarga',
            'Merencanakan family outfit terlalu mepet dengan hari-H, membatasi opsi bahan dan waktu produksi',
            'Tidak mengomunikasikan rencana warna ke seluruh anggota keluarga sejak awal',
          ],
        },
      },
    ],
    expertNote:
      'Untuk family outfit, kami menyarankan satu warna dasar dengan variasi bahan atau tone antar anggota — pendekatan ini menghasilkan foto keluarga yang kompak tanpa terlihat kaku seperti seragam sekolah.',
    faq: [
      {
        question: 'Apakah family outfit harus menggunakan bahan yang sama untuk semua anggota keluarga?',
        answer: 'Tidak harus. Warna dasar yang sama sudah cukup untuk kesan kompak; bahan bisa bervariasi sesuai anggaran dan preferensi masing-masing.',
      },
      {
        question: 'Berapa banyak anggota keluarga yang biasanya ikut dalam family outfit?',
        answer:
          'Bervariasi tergantung preferensi keluarga, umumnya mencakup ayah pengantin dan saudara laki-laki dekat, meski beberapa keluarga memilih melibatkan lingkup yang lebih luas.',
      },
      {
        question: 'Kapan sebaiknya mulai merencanakan family outfit?',
        answer:
          'Sejak tahap konsultasi awal pengantin, terutama jika melibatkan banyak anggota keluarga — semakin banyak yang perlu diukur dan dijahit, semakin awal perencanaan perlu dimulai.',
      },
    ],
    relatedArticles: [
      { category: 'wedding', slug: 'color-guide' },
      { category: 'wedding', slug: 'couple-muslim' },
      { category: 'wedding', slug: 'timeline-custom-wedding' },
      { category: 'styling', slug: 'hari-raya-thobe-style' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'premium-cotton' },
      { category: 'fabrics', slug: 'wool-blend' },
    ],
    relatedCategories: ['styling'],
    tags: { occasion: ['pernikahan'], audience: ['keluarga'], service: ['bespoke'] },
  },
  {
    slug: 'premium-thobe-wedding',
    category: 'wedding',
    eyebrow: 'Panduan Pernikahan',
    title: 'Thobe Premium untuk Pernikahan — Panduan Tier Tertinggi',
    navLabel: 'Thobe Premium Wedding',
    metaDescription:
      'Panduan memilih thobe premium untuk pernikahan — bahan tertinggi, detail jahitan tangan, dan aksesori eksklusif untuk momen sekali seumur hidup.',
    dek: 'Untuk momen yang hanya terjadi sekali, panduan memilih thobe pernikahan di tier kualitas tertinggi.',
    definition:
      'Thobe premium untuk pernikahan adalah tingkatan tertinggi dalam pemesanan thobe bespoke, menggunakan bahan dengan kualitas terbaik, detail jahitan tangan yang lebih ekstensif, dan tingkat personalisasi yang lebih mendalam dibanding pemesanan bespoke standar.',
    quickAnswer:
      'Thobe premium untuk pernikahan dibedakan dari bespoke standar melalui tiga hal: bahan tier tertinggi seperti katun Mesir grade terbaik atau wool blend premium, detail jahitan tangan yang lebih ekstensif, dan sesi konsultasi serta fitting yang lebih mendalam.',
    keyTakeaways: [
      'Tier premium dibedakan dari bespoke standar melalui bahan, detail jahitan, dan kedalaman konsultasi',
      'Bahan premium tertinggi umumnya katun Mesir grade terbaik atau wool blend kualitas atas',
      'Detail jahitan tangan lebih ekstensif dibanding thobe bespoke standar',
      'Waktu produksi premium umumnya lebih lama karena tingkat detail yang lebih tinggi',
      'Pertimbangkan tier premium khususnya untuk resepsi besar dengan banyak sesi foto',
    ],
    sections: [
      {
        heading: 'Apa yang Membedakan Tier Premium',
        block: {
          kind: 'paragraphs',
          items: [
            'Semua thobe di Local Tailor dibuat melalui proses bespoke, namun tier premium menambahkan tiga lapisan lagi: pemilihan bahan dari grade tertinggi yang tersedia, detail jahitan tangan yang lebih ekstensif pada bagian-bagian seperti kerah dan manset, serta sesi konsultasi dan fitting yang lebih mendalam untuk memastikan setiap detail benar-benar sesuai preferensi personal pengantin.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Memilih Tier Premium',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Pemilihan Bahan Tier Tertinggi',
            block: {
              kind: 'paragraphs',
              items: [
                'Katun Mesir grade terbaik dan wool blend kualitas atas adalah dua pilihan bahan yang paling umum di tier premium, dipilih karena kombinasi kelembutan, daya tahan, dan kesan visual yang konsisten unggul dari jarak dekat maupun jarak foto.',
              ],
            },
          },
          {
            heading: 'Detail Jahitan Tangan',
            block: {
              kind: 'paragraphs',
              items: [
                'Bagian-bagian seperti kerah, manset, dan garis kancing pada tier premium sering mendapat perhatian jahitan tangan yang lebih ekstensif dibanding tier standar, menghasilkan finishing yang terasa dan terlihat lebih presisi saat diperhatikan dari dekat.',
              ],
            },
          },
        ],
      },
      {
        heading: 'Rekomendasi Ahli',
        block: {
          kind: 'paragraphs',
          items: [
            'Tier premium paling terasa manfaatnya untuk resepsi besar dengan banyak sesi foto close-up — detail jahitan tangan dan kualitas bahan yang lebih tinggi akan lebih terlihat dan dihargai dalam kondisi tersebut dibanding acara yang lebih kecil dan intim.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Memilih tier premium tanpa memahami apa sebenarnya yang membedakannya dari bespoke standar',
            'Tidak menyisakan waktu produksi tambahan yang biasanya dibutuhkan tier premium',
            'Fokus hanya pada nama bahan tanpa mengonfirmasi grade spesifiknya',
            'Melewatkan sesi fitting tambahan yang justru menjadi nilai utama tier premium',
          ],
        },
      },
    ],
    expertNote:
      'Nilai sebenarnya dari tier premium bukan sekadar nama bahan yang lebih mahal, tapi jumlah perhatian detail yang diberikan di setiap tahap — kami menyarankan klien memanfaatkan sesi konsultasi tambahan yang tersedia, bukan sekadar melewatinya.',
    comparisonTable: {
      caption: 'Perbandingan bespoke standar vs tier premium',
      headers: ['Aspek', 'Bespoke Standar', 'Tier Premium'],
      rows: [
        ['Bahan', 'Pilihan premium reguler', 'Grade tertinggi yang tersedia'],
        ['Detail jahitan', 'Standar bespoke', 'Jahitan tangan lebih ekstensif'],
        ['Konsultasi & fitting', 'Standar', 'Sesi lebih mendalam dan personal'],
      ],
    },
    faq: [
      {
        question: 'Apa perbedaan utama tier premium dengan bespoke standar?',
        answer: 'Tiga hal: grade bahan yang lebih tinggi, detail jahitan tangan yang lebih ekstensif, dan sesi konsultasi/fitting yang lebih mendalam.',
      },
      {
        question: 'Apakah tier premium membutuhkan waktu produksi lebih lama?',
        answer: 'Umumnya ya, karena detail jahitan tangan yang lebih ekstensif membutuhkan waktu pengerjaan tambahan dibanding tier standar.',
      },
      {
        question: 'Untuk acara seperti apa tier premium paling direkomendasikan?',
        answer:
          'Paling terasa manfaatnya untuk resepsi besar dengan banyak sesi foto close-up, di mana detail bahan dan jahitan akan lebih terlihat dan dihargai.',
      },
    ],
    relatedArticles: [
      { category: 'wedding', slug: 'resepsi-pria' },
      { category: 'tailoring', slug: 'handmade-details' },
      { category: 'tailoring', slug: 'what-is-bespoke' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'egyptian-cotton' },
      { category: 'fabrics', slug: 'wool-blend' },
    ],
    relatedCategories: ['tailoring'],
    tags: { occasion: ['pernikahan'], service: ['bespoke', 'premium'] },
  },
  {
    slug: 'bespoke-wedding-guide',
    category: 'wedding',
    eyebrow: 'Panduan Pernikahan',
    title: 'Panduan Lengkap Thobe Bespoke untuk Pernikahan',
    navLabel: 'Panduan Bespoke Wedding',
    metaDescription:
      'Panduan lengkap dan menyeluruh memesan thobe bespoke untuk pernikahan — dari konsultasi hingga hari-H, semua yang perlu Anda ketahui dalam satu artikel.',
    dek: 'Panduan pilar untuk seluruh proses thobe pernikahan bespoke — ringkasan menyeluruh sebelum mendalami setiap aspek secara terpisah.',
    definition:
      'Panduan bespoke wedding adalah artikel referensi menyeluruh yang merangkum seluruh aspek pemesanan thobe pernikahan custom — dari akad, resepsi, koordinasi couple dan keluarga, hingga timeline dan tier kualitas — sebagai titik awal sebelum mendalami setiap topik secara terpisah.',
    quickAnswer:
      'Memesan thobe bespoke untuk pernikahan melibatkan lima keputusan utama: gaya untuk akad, gaya untuk resepsi, koordinasi warna dengan pasangan dan keluarga, timeline pemesanan minimal 6–8 minggu sebelum hari-H, dan pemilihan tier kualitas sesuai kebutuhan acara.',
    keyTakeaways: [
      'Thobe akad dan resepsi idealnya direncanakan sebagai dua kebutuhan terpisah dengan penekanan berbeda',
      'Koordinasi warna dengan pasangan dan keluarga sebaiknya disepakati sejak awal proses',
      'Timeline pemesanan minimal 6–8 minggu sebelum hari-H untuk hasil terbaik',
      'Tier premium layak dipertimbangkan khususnya untuk resepsi besar dengan banyak sesi foto',
      'Setiap aspek — dari warna hingga bahan — sebaiknya didiskusikan dalam satu sesi konsultasi menyeluruh',
    ],
    sections: [
      {
        heading: 'Kenapa Memesan Thobe Bespoke untuk Pernikahan',
        block: {
          kind: 'paragraphs',
          items: [
            'Pernikahan adalah salah satu dari sedikit momen dalam hidup di mana setiap detail penampilan diabadikan dalam foto dan kenangan jangka panjang. Thobe bespoke memberi kendali penuh atas setiap elemen — bahan, warna, potongan, dan detail — yang tidak bisa didapat dari thobe ready-to-wear standar, sekaligus memastikan hasil akhir benar-benar pas di badan pada hari yang tidak bisa diulang.',
            'Panduan ini merangkum lima area keputusan utama yang perlu direncanakan, masing-masing dibahas lebih mendalam di artikel terpisah dalam kategori Pernikahan kami.',
          ],
        },
      },
      {
        heading: 'Lima Area Keputusan Utama',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Akad vs Resepsi',
            block: {
              kind: 'paragraphs',
              items: [
                'Akad menuntut kesan khidmat dan tenang, sementara resepsi memberi ruang untuk tampilan yang lebih mewah dan berlapis. Merencanakan keduanya sebagai kebutuhan terpisah, bukan satu outfit untuk keduanya, menghasilkan hasil yang lebih tepat sasaran untuk masing-masing momen.',
              ],
            },
          },
          {
            heading: 'Koordinasi Couple dan Keluarga',
            block: {
              kind: 'paragraphs',
              items: [
                'Menyelaraskan warna dengan pasangan dan anggota keluarga inti menciptakan kesan visual yang lebih kuat di foto, dengan pendekatan "serasi tanpa identik" yang memberi ruang bagi karakter personal masing-masing.',
              ],
            },
          },
          {
            heading: 'Timeline dan Tier Kualitas',
            block: {
              kind: 'paragraphs',
              items: [
                'Proses bespoke membutuhkan waktu — minimal 6–8 minggu dari konsultasi hingga fitting akhir — dan tier premium layak dipertimbangkan untuk resepsi besar yang menuntut detail dan kualitas visual maksimal.',
              ],
            },
          },
        ],
      },
      {
        heading: 'Rekomendasi Ahli',
        block: {
          kind: 'paragraphs',
          items: [
            'Datang ke sesi konsultasi pertama dengan gambaran umum tema pernikahan, meski belum sepenuhnya final — ini memungkinkan tailor memberi rekomendasi yang lebih terarah sejak awal, dibanding memulai dari nol tanpa arah sama sekali.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Menganggap thobe akad dan resepsi bisa menjadi satu outfit yang sama tanpa penyesuaian',
            'Menunda koordinasi warna dengan pasangan hingga mendekati hari-H',
            'Memulai proses pemesanan kurang dari 4 minggu sebelum hari-H',
            'Tidak mempertimbangkan tier premium meski acara melibatkan banyak sesi foto formal',
          ],
        },
      },
    ],
    expertNote:
      'Pendekatan yang paling berhasil kami lihat adalah pasangan yang datang berkonsultasi bersama di awal, menyepakati arah besar (warna, tema, timeline), lalu membiarkan detail teknis diselesaikan terpisah oleh masing-masing tailor — ini menghindari banyak revisi di menit-menit akhir.',
    faq: [
      {
        question: 'Dari mana sebaiknya memulai perencanaan thobe pernikahan bespoke?',
        answer:
          'Mulai dari konsultasi untuk menentukan gaya akad dan resepsi, sambil sekaligus mendiskusikan koordinasi warna dengan pasangan dan keluarga jika relevan.',
      },
      {
        question: 'Apakah semua lima area keputusan harus difinalkan di konsultasi pertama?',
        answer:
          'Tidak harus semua, namun arah besar seperti palet warna dan timeline sebaiknya sudah disepakati sejak awal agar proses berikutnya berjalan lebih lancar.',
      },
      {
        question: 'Apakah panduan ini menggantikan konsultasi langsung dengan tailor?',
        answer:
          'Tidak. Panduan ini adalah titik awal untuk memahami apa saja yang perlu direncanakan — keputusan final tetap sebaiknya didiskusikan langsung dengan tailor sesuai kebutuhan spesifik Anda.',
      },
    ],
    relatedArticles: [
      { category: 'wedding', slug: 'akad-pria' },
      { category: 'wedding', slug: 'resepsi-pria' },
      { category: 'wedding', slug: 'timeline-custom-wedding' },
      { category: 'wedding', slug: 'premium-thobe-wedding' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'egyptian-cotton' },
      { category: 'fabrics', slug: 'wool-blend' },
    ],
    relatedCategories: ['styling', 'tailoring'],
    tags: { occasion: ['pernikahan'], service: ['bespoke'] },
  },
]
