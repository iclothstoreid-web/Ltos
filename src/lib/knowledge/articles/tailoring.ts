import type { KnowledgeArticle } from '../types'

// Sprint W6-6 — Tailoring Authority. 8 technical guides establishing
// E-E-A-T through real construction/process detail, not marketing
// language. Claims here are general tailoring craft knowledge (pattern
// drafting, interlining, construction technique) — not fabricated
// proprietary Tarda statistics.
export const TAILORING_ARTICLES: KnowledgeArticle[] = [
  {
    slug: 'what-is-bespoke',
    category: 'tailoring',
    eyebrow: 'Panduan Tailoring',
    title: 'Apa Itu Bespoke? Definisi dan Prosesnya',
    navLabel: 'Apa Itu Bespoke',
    metaDescription:
      'Bespoke adalah pakaian yang dibuat dari pola baru khusus untuk individu. Penjelasan lengkap definisi, proses, dan bedanya dengan ready-to-wear.',
    dek: 'Istilah "bespoke" sering dipakai longgar di industri fashion — ini definisi teknisnya yang sebenarnya.',
    definition:
      'Bespoke adalah metode pembuatan pakaian di mana pola dibentuk dari nol khusus untuk ukuran dan proporsi tubuh satu individu, berbeda dari ready-to-wear yang menggunakan pola standar dalam ukuran generik.',
    quickAnswer:
      'Bespoke berarti pola pakaian dibuat benar-benar baru dari pengukuran individu, bukan menyesuaikan pola yang sudah ada — inilah yang membedakannya secara teknis dari ready-to-wear maupun made-to-measure.',
    keyTakeaways: [
      'Bespoke berarti pola dibuat dari nol, bukan menyesuaikan pola yang sudah ada',
      'Istilah ini berasal dari kebiasaan penjahit Inggris yang menyebut kain "be spoken for" (dipesan khusus) oleh satu klien',
      'Proses bespoke melibatkan beberapa kali fitting untuk penyempurnaan pola',
      'Bespoke berbeda dari made-to-measure yang menyesuaikan pola standar, bukan membuat baru',
      'Hasil bespoke secara teori adalah pola yang unik untuk satu individu, tidak digunakan ulang untuk orang lain',
    ],
    sections: [
      {
        heading: 'Asal Usul dan Definisi Teknis Bespoke',
        block: {
          kind: 'paragraphs',
          items: [
            'Istilah "bespoke" berasal dari tradisi penjahit di Savile Row, London, di mana kain di rak toko dikatakan "be spoken for" begitu seorang klien memilihnya untuk dijadikan pakaian khusus mereka. Seiring waktu, istilah ini berkembang menjadi label untuk keseluruhan proses pembuatan pakaian dari pola yang dibentuk baru, bukan sekadar kain yang dipesan.',
            'Secara teknis, definisi bespoke yang paling ketat mensyaratkan pola dibuat dari nol berdasarkan pengukuran individu, melalui beberapa kali fitting untuk penyempurnaan, dan hasil akhirnya adalah satu pola unik yang secara prinsip hanya digunakan untuk satu orang tersebut.',
          ],
        },
      },
      {
        heading: 'Tahapan Proses Bespoke',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Konsultasi dan Pengukuran',
            block: {
              kind: 'paragraphs',
              items: [
                'Tahap awal mencakup diskusi kebutuhan, gaya, dan bahan, diikuti pengukuran menyeluruh oleh fitter yang mencatat belasan titik ukur tubuh, jauh lebih detail dibanding pengukuran untuk ready-to-wear.',
              ],
            },
          },
          {
            heading: 'Pembentukan Pola dan Fitting',
            block: {
              kind: 'paragraphs',
              items: [
                'Pola dibentuk dari pengukuran tersebut, kemudian melalui satu atau lebih sesi fitting untuk menyempurnakan kesesuaian sebelum produksi akhir dimulai — tahap yang tidak ada sama sekali pada proses ready-to-wear.',
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
            'Saat mencari layanan "bespoke", tanyakan secara spesifik apakah pola benar-benar dibuat baru atau hanya disesuaikan dari pola dasar yang sudah ada — istilah ini sering dipakai secara longgar di industri, dan mengetahui perbedaannya membantu Anda memahami apa yang sebenarnya Anda bayar.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum dalam Memahami Bespoke',
        block: {
          kind: 'list',
          items: [
            'Menganggap semua pakaian custom otomatis bespoke, padahal banyak yang sebenarnya made-to-measure',
            'Mengira bespoke hanya soal ukuran, padahal mencakup pembentukan pola dari nol',
            'Tidak menanyakan berapa kali sesi fitting yang disertakan dalam layanan bespoke yang ditawarkan',
            'Menyamakan harga sebagai satu-satunya indikator apakah suatu layanan benar-benar bespoke',
          ],
        },
      },
    ],
    expertNote:
      'Kami selalu terbuka menjelaskan proses bespoke kami secara detail kepada klien — transparansi soal bagaimana pola dibentuk dan berapa kali fitting dilakukan adalah bagian dari apa yang membedakan bespoke sesungguhnya dari sekadar klaim marketing.',
    comparisonTable: {
      caption: 'Perbandingan bespoke dengan metode pembuatan pakaian lain',
      headers: ['Metode', 'Asal Pola', 'Fitting'],
      rows: [
        ['Ready-to-Wear', 'Pola standar, ukuran generik', 'Tidak ada'],
        ['Made-to-Measure', 'Pola standar disesuaikan', 'Umumnya 1 kali'],
        ['Bespoke', 'Pola baru dari nol', 'Satu kali atau lebih'],
      ],
    },
    faq: [
      {
        question: 'Apa perbedaan utama bespoke dengan custom-made?',
        answer:
          '"Custom-made" adalah istilah umum yang bisa mencakup berbagai tingkat personalisasi, sementara "bespoke" secara teknis spesifik berarti pola dibuat baru dari nol.',
      },
      {
        question: 'Apakah semua thobe di Tarda adalah bespoke sesungguhnya?',
        answer: 'Ya, setiap thobe dibuat dari pola yang dibentuk khusus berdasarkan pengukuran individu, bukan pola standar yang disesuaikan.',
      },
      {
        question: 'Kenapa proses bespoke membutuhkan waktu lebih lama?',
        answer: 'Karena setiap tahap — pengukuran, pembentukan pola, dan fitting — dilakukan khusus untuk satu individu, tidak menggunakan template yang sudah jadi.',
      },
    ],
    relatedArticles: [
      { category: 'tailoring', slug: 'bespoke-vs-made-to-measure' },
      { category: 'tailoring', slug: 'pattern-drafting' },
      { category: 'measurements', slug: 'how-to-measure-body' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'egyptian-cotton' },
      { category: 'fabrics', slug: 'wool-blend' },
    ],
    relatedCategories: ['measurements', 'care'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'bespoke-vs-made-to-measure',
    category: 'tailoring',
    eyebrow: 'Panduan Tailoring',
    title: 'Bespoke vs Made-to-Measure — Apa Bedanya?',
    navLabel: 'Bespoke vs MTM',
    metaDescription:
      'Perbandingan bespoke dan made-to-measure — perbedaan proses pembentukan pola, tingkat personalisasi, dan kapan masing-masing lebih tepat dipilih.',
    dek: 'Dua istilah yang sering tertukar, padahal prosesnya secara teknis cukup berbeda.',
    definition:
      'Bespoke dan made-to-measure adalah dua metode pembuatan pakaian custom yang berbeda dalam asal pola — bespoke membentuk pola baru dari nol untuk setiap individu, sementara made-to-measure menyesuaikan pola dasar standar yang sudah ada dengan ukuran individu tersebut.',
    quickAnswer:
      'Perbedaan utama bespoke dan made-to-measure ada pada asal pola: bespoke membentuk pola benar-benar baru dari pengukuran individu, sementara made-to-measure menyesuaikan pola dasar (block pattern) yang sudah ada dengan ukuran spesifik pelanggan.',
    keyTakeaways: [
      'Bespoke membentuk pola baru dari nol; made-to-measure menyesuaikan pola dasar yang sudah ada',
      'Bespoke umumnya melibatkan lebih banyak sesi fitting dibanding made-to-measure',
      'Made-to-measure biasanya lebih cepat dan lebih terjangkau dibanding bespoke penuh',
      'Kedua metode tetap jauh lebih personal dibanding ready-to-wear',
      'Pilihan tergantung anggaran, waktu yang tersedia, dan tingkat personalisasi yang diinginkan',
    ],
    sections: [
      {
        heading: 'Memahami Perbedaan Proses',
        block: {
          kind: 'paragraphs',
          items: [
            'Made-to-measure dimulai dari pola dasar (block pattern) yang sudah dikembangkan sebelumnya dalam beberapa ukuran standar, kemudian disesuaikan mengikuti pengukuran individu — mirip menyunting template yang sudah ada. Bespoke, sebaliknya, dimulai dari kertas kosong: pola dibentuk sepenuhnya baru berdasarkan pengukuran dan proporsi tubuh spesifik satu orang.',
            'Perbedaan ini berdampak langsung pada tingkat penyesuaian yang mungkin dilakukan — bespoke bisa mengakomodasi proporsi tubuh yang sangat tidak umum (misalnya bahu sangat lebar dengan pinggang sangat ramping) jauh lebih baik dibanding made-to-measure yang tetap dibatasi oleh struktur pola dasarnya.',
          ],
        },
      },
      {
        heading: 'Panduan Memilih Berdasarkan Kebutuhan',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Kapan Made-to-Measure Cukup',
            block: {
              kind: 'paragraphs',
              items: [
                'Jika proporsi tubuh Anda relatif standar dan Anda memprioritaskan waktu produksi lebih cepat, made-to-measure sering menjadi pilihan yang efisien tanpa mengorbankan banyak kualitas kesesuaian.',
              ],
            },
          },
          {
            heading: 'Kapan Bespoke Lebih Tepat',
            block: {
              kind: 'paragraphs',
              items: [
                'Untuk proporsi tubuh yang tidak umum, kebutuhan penyesuaian fungsional khusus (seperti pada thobe umrah custom), atau momen penting seperti pernikahan yang menuntut hasil paling presisi, bespoke penuh memberi ruang penyesuaian yang lebih luas.',
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
            'Jika ragu memilih antara keduanya, sampaikan proporsi tubuh dan kebutuhan spesifik Anda ke tailor saat konsultasi — tailor berpengalaman bisa menilai apakah made-to-measure sudah cukup atau bespoke penuh akan memberi hasil yang jauh lebih baik untuk kasus Anda.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Menganggap kedua istilah sama persis, padahal prosesnya berbeda secara teknis',
            'Memilih made-to-measure untuk proporsi tubuh yang sangat tidak umum, berisiko hasil kurang optimal',
            'Membayar harga bespoke namun mendapat proses made-to-measure tanpa disadari',
            'Tidak menanyakan secara eksplisit metode mana yang digunakan sebelum memesan',
          ],
        },
      },
    ],
    expertNote:
      'Kami selalu menjelaskan sejak awal metode mana yang sedang digunakan untuk pesanan klien — transparansi ini penting karena kedua metode punya kelebihan masing-masing, dan pilihan yang tepat tergantung kebutuhan, bukan mana yang "lebih mahal" atau "lebih murah".',
    comparisonTable: {
      caption: 'Perbandingan bespoke dan made-to-measure',
      headers: ['Aspek', 'Bespoke', 'Made-to-Measure'],
      rows: [
        ['Asal pola', 'Dibuat baru dari nol', 'Pola dasar disesuaikan'],
        ['Waktu produksi', 'Lebih lama', 'Lebih cepat'],
        ['Fleksibilitas untuk proporsi tidak umum', 'Sangat tinggi', 'Terbatas'],
      ],
    },
    faq: [
      {
        question: 'Mana yang lebih mahal, bespoke atau made-to-measure?',
        answer: 'Umumnya bespoke lebih mahal karena proses pembentukan pola dari nol dan sesi fitting yang lebih banyak dibanding made-to-measure.',
      },
      {
        question: 'Apakah made-to-measure tetap lebih baik dari ready-to-wear?',
        answer: 'Ya, made-to-measure tetap jauh lebih personal dibanding ready-to-wear karena disesuaikan dengan ukuran individu, meski polanya berasal dari template dasar.',
      },
      {
        question: 'Bagaimana cara mengetahui suatu layanan benar-benar bespoke, bukan made-to-measure?',
        answer: 'Tanyakan langsung apakah pola dibuat baru dari pengukuran Anda atau menyesuaikan pola dasar yang sudah ada — tailor yang transparan akan menjawab dengan jelas.',
      },
    ],
    relatedArticles: [
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'tailoring', slug: 'pattern-drafting' },
      { category: 'measurements', slug: 'thobe-size-guide' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'premium-cotton' },
      { category: 'fabrics', slug: 'egyptian-cotton' },
    ],
    relatedCategories: ['measurements'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'pattern-drafting',
    category: 'tailoring',
    eyebrow: 'Panduan Tailoring',
    title: 'Pattern Drafting — Cara Pola Thobe Dibentuk',
    navLabel: 'Pattern Drafting',
    metaDescription:
      'Penjelasan proses pattern drafting untuk thobe bespoke — bagaimana pengukuran tubuh diterjemahkan menjadi pola potong yang presisi.',
    dek: 'Di balik setiap thobe bespoke ada pola yang dibentuk dengan presisi matematis dari pengukuran tubuh Anda.',
    definition:
      'Pattern drafting adalah proses menerjemahkan pengukuran tubuh individu menjadi pola potong dua dimensi di atas kertas atau kain, yang kemudian digunakan sebagai cetakan untuk memotong bahan sesungguhnya.',
    quickAnswer:
      'Pattern drafting mengubah belasan titik ukur tubuh menjadi diagram pola potong yang presisi, menghitung kelonggaran (ease) di setiap bagian berdasarkan fit yang diinginkan, sebelum pola tersebut digunakan untuk memotong kain sesungguhnya.',
    keyTakeaways: [
      'Pattern drafting menerjemahkan angka pengukuran menjadi bentuk pola dua dimensi',
      'Kelonggaran (ease) dihitung dan ditambahkan secara sengaja di setiap titik, bukan asal tebak',
      'Pola draft awal biasanya diuji dengan kain murah (toile) sebelum dipakai untuk bahan asli',
      'Presisi pattern drafting menentukan seberapa baik hasil akhir jatuh di badan',
      'Setiap penyesuaian fit (slim/regular/relaxed) tercermin dalam perhitungan kelonggaran pola',
    ],
    sections: [
      {
        heading: 'Dari Pengukuran ke Pola',
        block: {
          kind: 'paragraphs',
          items: [
            'Setiap titik ukur — lingkar leher, lebar bahu, lingkar dada, panjang lengan, panjang badan — diterjemahkan menjadi garis dan kurva di atas kertas pola menggunakan perhitungan geometris yang sudah baku dalam ilmu tailoring, namun tetap membutuhkan penyesuaian manual oleh pattern maker berpengalaman untuk proporsi tubuh yang unik.',
            'Proses ini bukan sekadar menyalin angka mentah — pattern maker harus memperhitungkan bagaimana kain akan jatuh di badan, area mana yang membutuhkan kelonggaran ekstra untuk pergerakan (seperti bahu dan ketiak), dan bagaimana proporsi keseluruhan tetap seimbang secara visual.',
          ],
        },
      },
      {
        heading: 'Tahapan Pattern Drafting',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Perhitungan Kelonggaran (Ease)',
            block: {
              kind: 'paragraphs',
              items: [
                'Kelonggaran ditambahkan di atas ukuran badan asli untuk memberi ruang gerak dan kenyamanan — jumlahnya bervariasi tergantung fit yang dipilih (slim, regular, atau relaxed) dan area tubuh spesifik, seperti dijelaskan di panduan Slim vs Regular Fit kami.',
              ],
            },
          },
          {
            heading: 'Uji Coba dengan Toile',
            block: {
              kind: 'paragraphs',
              items: [
                'Untuk pesanan dengan tingkat kompleksitas tinggi, pola awal terkadang diuji dulu dengan kain murah (toile) untuk memvalidasi kesesuaian sebelum bahan asli yang lebih mahal dipotong — langkah pencegahan yang mengurangi risiko kesalahan pada bahan premium.',
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
            'Presisi pattern drafting adalah investasi waktu yang sering tidak terlihat oleh pelanggan namun paling menentukan hasil akhir — dua thobe dengan bahan yang sama persis bisa terlihat sangat berbeda kualitasnya semata karena perbedaan presisi pola yang mendasarinya.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum dalam Memahami Pattern Drafting',
        block: {
          kind: 'list',
          items: [
            'Menganggap pattern drafting hanya soal menyalin angka pengukuran secara langsung',
            'Tidak menyadari bahwa kelonggaran (ease) adalah keputusan desain, bukan kesalahan pengukuran',
            'Mengabaikan pentingnya uji coba toile untuk desain yang kompleks',
            'Menilai kualitas tailoring hanya dari bahan, padahal presisi pola sama pentingnya',
          ],
        },
      },
    ],
    expertNote:
      'Kami selalu meluangkan waktu ekstra di tahap pattern drafting untuk pesanan dengan proporsi tubuh yang tidak umum — inilah tahap yang paling menentukan apakah thobe akan benar-benar pas atau hanya "cukup pas" di badan.',
    faq: [
      {
        question: 'Apa itu ease dalam pattern drafting?',
        answer: 'Ease adalah kelonggaran yang ditambahkan di atas ukuran badan asli untuk memberi ruang gerak dan kenyamanan, jumlahnya bergantung pada fit yang dipilih.',
      },
      {
        question: 'Apakah semua pesanan bespoke melalui uji coba toile?',
        answer: 'Tidak selalu — umumnya digunakan untuk desain dengan tingkat kompleksitas lebih tinggi sebagai langkah validasi sebelum memotong bahan asli.',
      },
      {
        question: 'Kenapa presisi pattern drafting lebih penting dari sekadar bahan mahal?',
        answer: 'Karena pola yang tidak presisi akan menghasilkan potongan yang kurang pas meski menggunakan bahan berkualitas tertinggi sekalipun.',
      },
    ],
    relatedArticles: [
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'measurements', slug: 'slim-vs-regular-fit' },
      { category: 'tailoring', slug: 'quality-control' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'wool-blend' },
      { category: 'fabrics', slug: 'egyptian-cotton' },
    ],
    relatedCategories: ['measurements'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'interlining-guide',
    category: 'tailoring',
    eyebrow: 'Panduan Tailoring',
    title: 'Panduan Interlining pada Thobe',
    navLabel: 'Panduan Interlining',
    metaDescription:
      'Penjelasan apa itu interlining dan fungsinya pada thobe — bagaimana lapisan tersembunyi ini memengaruhi bentuk kerah dan manset.',
    dek: 'Lapisan tersembunyi ini jarang diperhatikan, padahal sangat menentukan bentuk kerah dan manset thobe Anda.',
    definition:
      'Interlining adalah lapisan kain tambahan yang disisipkan di antara kain luar dan lapisan dalam pada bagian tertentu pakaian — biasanya kerah, manset, dan plaket kancing — untuk memberi struktur dan mempertahankan bentuk area tersebut.',
    quickAnswer:
      'Interlining adalah lapisan tersembunyi di dalam kerah, manset, dan plaket kancing thobe yang memberi struktur dan kekakuan terkontrol, mencegah area tersebut melengkung atau kehilangan bentuk setelah dipakai dan dicuci berulang kali.',
    keyTakeaways: [
      'Interlining adalah lapisan tersembunyi yang jarang terlihat namun sangat memengaruhi bentuk akhir',
      'Fungsi utamanya memberi struktur pada kerah, manset, dan plaket kancing',
      'Tanpa interlining, area ini akan terasa lembek dan mudah kehilangan bentuk',
      'Ketebalan interlining disesuaikan dengan jenis bahan dan gaya kerah yang diinginkan',
      'Kualitas interlining memengaruhi seberapa baik bentuk kerah bertahan setelah dicuci berulang',
    ],
    sections: [
      {
        heading: 'Apa itu Interlining dan Kenapa Diperlukan',
        block: {
          kind: 'paragraphs',
          items: [
            'Kain thobe pada dasarnya lentur dan mengikuti gravitasi — tanpa lapisan tambahan, kerah akan melengkung tidak beraturan dan manset akan terasa lembek. Interlining disisipkan di antara kain luar dan lapisan dalam pada area-area ini untuk memberi struktur terkontrol, menjaga kerah tetap tegak rapi dan manset tetap presisi bentuknya.',
          ],
        },
      },
      {
        heading: 'Jenis dan Aplikasi Interlining',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Interlining untuk Kerah',
            block: {
              kind: 'paragraphs',
              items: [
                'Umumnya menggunakan interlining dengan kekakuan sedang hingga tinggi tergantung gaya kerah — kerah tegak klasik membutuhkan struktur lebih kuat dibanding kerah yang lebih santai.',
              ],
            },
          },
          {
            heading: 'Interlining untuk Manset dan Plaket',
            block: {
              kind: 'paragraphs',
              items: [
                'Biasanya menggunakan interlining dengan kekakuan lebih ringan dibanding kerah, cukup untuk mempertahankan bentuk rapi tanpa membuat area tersebut terasa kaku saat digerakkan.',
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
            'Kualitas interlining sama pentingnya dengan kualitas kain utama — interlining murah cenderung terpisah dari kain luar setelah beberapa kali dicuci, membuat kerah terasa bergelembung. Tanyakan jenis interlining yang digunakan jika Anda memesan bespoke di penyedia mana pun, terutama untuk thobe yang akan sering dipakai dan dicuci.',
          ],
        },
      },
      {
        heading: 'Tanda Interlining Berkualitas Rendah',
        block: {
          kind: 'list',
          items: [
            'Kerah terasa bergelembung atau tidak rata setelah beberapa kali dicuci',
            'Lapisan interlining terlihat terpisah dari kain luar saat diraba',
            'Bentuk manset kehilangan kekakuan dan terasa lembek lebih cepat dari seharusnya',
            'Kerah tidak kembali ke bentuk semula setelah dilipat atau ditekan',
          ],
        },
      },
    ],
    expertNote:
      'Kami memilih interlining berdasarkan karakter kain utama, bukan menggunakan satu jenis untuk semua bahan — kombinasi yang tepat antara kain luar dan interlining adalah salah satu detail teknis yang paling menentukan seberapa lama kerah thobe mempertahankan bentuknya.',
    faq: [
      {
        question: 'Apakah semua thobe menggunakan interlining?',
        answer: 'Hampir semua thobe berkualitas menggunakan interlining pada kerah, manset, dan plaket kancing untuk mempertahankan bentuk area tersebut.',
      },
      {
        question: 'Bagaimana cara mengetahui interlining pada thobe saya berkualitas baik?',
        answer: 'Kerah yang tetap tegak rapi setelah beberapa kali dicuci, tanpa bergelembung atau terasa terpisah dari kain luar, adalah tanda interlining berkualitas baik.',
      },
      {
        question: 'Apakah interlining bisa diganti jika sudah rusak?',
        answer: 'Secara teknis bisa melalui perbaikan oleh tailor, meski prosesnya lebih rumit dibanding penggantian komponen lain karena interlining tersembunyi di dalam lapisan kain.',
      },
    ],
    relatedArticles: [
      { category: 'tailoring', slug: 'collar-construction' },
      { category: 'tailoring', slug: 'sleeve-construction' },
      { category: 'tailoring', slug: 'handmade-details' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'oxford' },
      { category: 'fabrics', slug: 'poplin' },
    ],
    relatedCategories: ['care'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'collar-construction',
    category: 'tailoring',
    eyebrow: 'Panduan Tailoring',
    title: 'Konstruksi Kerah Thobe — Panduan Teknis',
    navLabel: 'Konstruksi Kerah',
    metaDescription:
      'Penjelasan teknis konstruksi kerah thobe — lapisan, jenis kerah, dan bagaimana kualitas jahitan memengaruhi kenyamanan dan tampilan.',
    dek: 'Kerah adalah bagian yang paling sering diperhatikan orang lain — konstruksinya menentukan kenyamanan dan kesan keseluruhan.',
    definition:
      'Konstruksi kerah adalah proses teknis pembentukan kerah thobe, meliputi pemilihan interlining, jumlah lapisan kain, dan teknik jahitan yang menentukan seberapa baik kerah mempertahankan bentuk dan kenyamanan saat dikenakan.',
    quickAnswer:
      'Konstruksi kerah thobe yang baik melibatkan interlining berkualitas, jahitan presisi di setiap lipatan, dan kelonggaran yang tepat di lingkar leher — kombinasi ini menentukan apakah kerah tetap rapi sepanjang hari dan nyaman saat dikancingkan penuh.',
    keyTakeaways: [
      'Kerah terdiri dari beberapa lapisan kain dan interlining yang bekerja bersama',
      'Jenis kerah (tegak klasik vs kerah lebih santai) memengaruhi kebutuhan interlining',
      'Jahitan presisi di sudut kerah adalah salah satu indikator kualitas tailoring',
      'Kelonggaran lingkar leher pada kerah harus seimbang antara nyaman dan tetap rapi',
      'Kerah berkualitas tinggi mempertahankan bentuknya meski dicuci berulang kali',
    ],
    sections: [
      {
        heading: 'Anatomi Konstruksi Kerah',
        block: {
          kind: 'paragraphs',
          items: [
            'Kerah thobe secara teknis terdiri dari lapisan kain luar, interlining di tengah untuk struktur, dan lapisan dalam yang menyentuh kulit langsung. Ketiga lapisan ini dijahit menyatu dengan presisi tinggi, terutama di bagian sudut kerah yang paling sulit dijahit rapi dan paling mudah terlihat jika ada cacat produksi.',
          ],
        },
      },
      {
        heading: 'Jenis Kerah dan Konstruksinya',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Kerah Tegak Klasik',
            block: {
              kind: 'paragraphs',
              items: [
                'Membutuhkan interlining dengan kekakuan lebih tinggi untuk mempertahankan posisi tegak, umumnya digunakan pada thobe formal dan gaya potongan Saudi.',
              ],
            },
          },
          {
            heading: 'Kerah Lebih Santai',
            block: {
              kind: 'paragraphs',
              items: [
                'Menggunakan interlining lebih ringan, memberi kesan lebih kasual dan fleksibel, umum pada thobe harian atau gaya potongan yang lebih santai.',
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
            'Perhatikan sudut kerah saat memeriksa kualitas thobe bespoke — jahitan yang presisi di titik ini adalah salah satu indikator paling andal kualitas keseluruhan tailoring, karena area ini paling sulit dijahit rapi dan paling menonjolkan kesalahan jika ada.',
          ],
        },
      },
      {
        heading: 'Tanda Konstruksi Kerah Berkualitas Baik',
        block: {
          kind: 'list',
          items: [
            'Sudut kerah simetris dan rapi tanpa kerutan di titik pertemuan jahitan',
            'Kerah kembali ke bentuk semula setelah dilipat, tidak melengkung permanen',
            'Kelonggaran lingkar leher pas — tidak terlalu ketat maupun kedodoran',
            'Jahitan di sepanjang tepi kerah rapat dan konsisten, tanpa benang longgar',
          ],
        },
      },
    ],
    expertNote:
      'Kerah adalah bagian pertama yang kami periksa detail jahitannya saat quality control — bagian tubuh ini paling sering menjadi fokus perhatian orang lain saat berinteraksi tatap muka, sehingga presisinya tidak bisa dikompromikan.',
    faq: [
      {
        question: 'Apa perbedaan konstruksi kerah tegak dan kerah santai?',
        answer: 'Kerah tegak membutuhkan interlining lebih kaku untuk mempertahankan posisi tegak, sementara kerah santai menggunakan interlining lebih ringan untuk kesan fleksibel.',
      },
      {
        question: 'Kenapa sudut kerah sering dijadikan indikator kualitas tailoring?',
        answer: 'Karena area ini paling sulit dijahit dengan presisi, sehingga kesalahan kecil dalam teknik jahitan akan langsung terlihat di titik tersebut.',
      },
      {
        question: 'Apakah kerah thobe bisa diperbaiki jika kehilangan bentuk?',
        answer: 'Bisa melalui perbaikan oleh tailor berpengalaman, meski hasil terbaik tetap dicapai melalui perawatan yang tepat sejak awal agar tidak sampai kehilangan bentuk.',
      },
    ],
    relatedArticles: [
      { category: 'tailoring', slug: 'interlining-guide' },
      { category: 'tailoring', slug: 'sleeve-construction' },
      { category: 'measurements', slug: 'neck' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'oxford' },
      { category: 'fabrics', slug: 'twill' },
    ],
    relatedCategories: ['care'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'sleeve-construction',
    category: 'tailoring',
    eyebrow: 'Panduan Tailoring',
    title: 'Konstruksi Lengan Thobe — Panduan Teknis',
    navLabel: 'Konstruksi Lengan',
    metaDescription:
      'Penjelasan teknis konstruksi lengan thobe — posisi kerung lengan, teknik jahitan manset, dan pengaruhnya pada kenyamanan gerak.',
    dek: 'Kerung lengan yang tepat menentukan apakah Anda bisa bergerak leluasa atau justru merasa tertahan saat memakai thobe.',
    definition:
      'Konstruksi lengan adalah proses teknis pembentukan kerung lengan (armhole) dan manset thobe, meliputi posisi jahitan kerung yang memengaruhi rentang gerak, serta teknik penyelesaian manset yang menentukan kerapian dan kenyamanan pergelangan tangan.',
    quickAnswer:
      'Konstruksi lengan yang baik ditentukan oleh posisi kerung lengan yang presisi (tidak terlalu tinggi hingga membatasi gerak, tidak terlalu rendah hingga terlihat kedodoran) dan penyelesaian manset yang rapi dengan kelonggaran yang pas di pergelangan tangan.',
    keyTakeaways: [
      'Posisi kerung lengan (armhole) sangat memengaruhi rentang gerak bahu dan lengan',
      'Kerung lengan terlalu tinggi membatasi gerak, terlalu rendah membuat thobe terlihat kedodoran',
      'Manset membutuhkan interlining ringan untuk mempertahankan bentuk tanpa terasa kaku',
      'Jahitan di sepanjang kerung lengan adalah area paling rentan sobek jika kualitasnya rendah',
      'Konstruksi lengan yang baik terasa saat mengangkat tangan tinggi tanpa tertarik di dada',
    ],
    sections: [
      {
        heading: 'Kenapa Konstruksi Lengan Sering Diabaikan',
        block: {
          kind: 'paragraphs',
          items: [
            'Berbeda dari kerah yang langsung terlihat, kualitas konstruksi lengan baru benar-benar terasa saat bergerak — mengangkat tangan, meraih sesuatu, atau bersujud saat sholat. Banyak pembeli baru menyadari masalah konstruksi lengan setelah memakainya beberapa waktu, bukan saat mencoba pertama kali dalam posisi diam.',
          ],
        },
      },
      {
        heading: 'Elemen Kunci Konstruksi Lengan',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Posisi Kerung Lengan',
            block: {
              kind: 'paragraphs',
              items: [
                'Kerung lengan yang terlalu tinggi (terlalu dekat ke ketiak) akan membatasi rentang gerak dan terasa menarik saat lengan diangkat, sementara kerung yang terlalu rendah membuat area bahu terlihat kedodoran dan kurang rapi.',
              ],
            },
          },
          {
            heading: 'Penyelesaian Manset',
            block: {
              kind: 'paragraphs',
              items: [
                'Manset membutuhkan interlining ringan yang cukup untuk mempertahankan bentuk namun tidak membuat pergelangan tangan terasa kaku saat digerakkan, dengan jahitan yang rapat di sepanjang tepinya untuk mencegah sobek dari pemakaian berulang.',
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
            'Saat fitting, selalu coba mengangkat kedua tangan tinggi-tinggi dan gerakan menyerupai sujud — ini adalah cara paling efektif menguji apakah konstruksi kerung lengan benar-benar nyaman untuk pemakaian sehari-hari, bukan hanya terlihat bagus saat berdiri diam di depan cermin.',
          ],
        },
      },
      {
        heading: 'Tanda Konstruksi Lengan Berkualitas Baik',
        block: {
          kind: 'list',
          items: [
            'Tidak ada tarikan terasa di area dada atau punggung saat lengan diangkat tinggi',
            'Jahitan di sepanjang kerung lengan rapat dan tidak menunjukkan tanda sobek meski digunakan aktif',
            'Manset mempertahankan bentuknya tanpa terasa kaku saat pergelangan tangan digerakkan',
            'Panjang lengan tetap proporsional meski dalam posisi lengan sedikit ditekuk',
          ],
        },
      },
    ],
    expertNote:
      'Kami selalu meminta klien menguji gerakan sujud saat sesi fitting, bukan hanya berdiri diam — konstruksi lengan yang terasa nyaman dalam posisi diam belum tentu tetap nyaman saat digunakan untuk gerakan ibadah sehari-hari.',
    faq: [
      {
        question: 'Kenapa lengan thobe saya terasa tertarik saat mengangkat tangan?',
        answer: 'Kemungkinan besar posisi kerung lengan terlalu tinggi atau terlalu sempit — ini adalah masalah konstruksi yang sebaiknya dikoreksi oleh tailor.',
      },
      {
        question: 'Apakah manset thobe membutuhkan interlining?',
        answer: 'Ya, umumnya menggunakan interlining ringan untuk mempertahankan bentuk rapi tanpa membuat pergelangan tangan terasa kaku.',
      },
      {
        question: 'Bagaimana cara menguji konstruksi lengan saat fitting?',
        answer: 'Coba mengangkat kedua tangan tinggi dan gerakan menyerupai sujud — ini akan mengungkap apakah kerung lengan benar-benar nyaman untuk pemakaian aktif.',
      },
    ],
    relatedArticles: [
      { category: 'tailoring', slug: 'collar-construction' },
      { category: 'measurements', slug: 'sleeve' },
      { category: 'tailoring', slug: 'quality-control' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'twill' },
      { category: 'fabrics', slug: 'oxford' },
    ],
    relatedCategories: ['measurements'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'handmade-details',
    category: 'tailoring',
    eyebrow: 'Panduan Tailoring',
    title: 'Detail Jahitan Tangan pada Thobe Bespoke',
    navLabel: 'Detail Jahitan Tangan',
    metaDescription:
      'Penjelasan detail jahitan tangan pada thobe bespoke — di bagian mana teknik ini digunakan dan kenapa berbeda dari jahitan mesin.',
    dek: 'Jahitan tangan membutuhkan waktu jauh lebih lama — tapi hasilnya terasa di detail yang sulit ditiru mesin.',
    definition:
      'Detail jahitan tangan adalah teknik penyelesaian tertentu pada thobe bespoke yang dikerjakan langsung oleh tangan pengrajin, bukan mesin jahit, biasanya diterapkan pada area seperti lubang kancing, tepi kerah, dan hem akhir untuk hasil yang lebih halus dan presisi.',
    quickAnswer:
      'Jahitan tangan pada thobe bespoke umumnya diterapkan pada lubang kancing, tepi kerah, dan hem akhir — area yang sulit dijangkau presisi oleh mesin jahit standar, menghasilkan finishing yang lebih halus dan tahan lama pada titik-titik yang paling sering mengalami tekanan pemakaian.',
    keyTakeaways: [
      'Jahitan tangan diterapkan pada area spesifik, bukan seluruh bagian thobe',
      'Lubang kancing yang dijahit tangan lebih tahan lama dibanding lubang kancing mesin',
      'Hem akhir yang dijahit tangan menghasilkan tampilan lebih rapi tanpa jahitan terlihat dari luar',
      'Proses jahitan tangan membutuhkan waktu jauh lebih lama dibanding jahitan mesin',
      'Kualitas jahitan tangan sangat bergantung pada keahlian pengrajin, bukan hanya alat',
    ],
    sections: [
      {
        heading: 'Kenapa Jahitan Tangan Masih Relevan di Era Mesin Modern',
        block: {
          kind: 'paragraphs',
          items: [
            'Meski mesin jahit modern jauh lebih cepat, ada beberapa area di mana tangan manusia masih memberi hasil lebih baik — terutama lubang kancing yang membutuhkan kekuatan dan fleksibilitas khusus agar tidak mudah robek, serta hem akhir yang perlu tersembunyi rapi tanpa terlihat garis jahitan dari sisi luar kain.',
          ],
        },
      },
      {
        heading: 'Area yang Umum Menggunakan Jahitan Tangan',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Lubang Kancing',
            block: {
              kind: 'paragraphs',
              items: [
                'Lubang kancing yang dijahit tangan menggunakan teknik simpul khusus yang membuatnya jauh lebih tahan terhadap tarikan berulang saat kancing dipasang-lepas, dibanding lubang kancing mesin yang lebih rentan terurai seiring waktu.',
              ],
            },
          },
          {
            heading: 'Hem Akhir',
            block: {
              kind: 'paragraphs',
              items: [
                'Teknik jahitan tangan tersembunyi (blind stitch) pada hem bagian bawah thobe menghasilkan tepi yang rapi tanpa garis jahitan terlihat dari sisi luar kain, berbeda dari hem mesin yang umumnya meninggalkan garis jahitan yang terlihat.',
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
            'Perhatikan lubang kancing dan tepi hem saat menilai kualitas thobe bespoke — dua area kecil ini sering menjadi indikator paling jujur soal seberapa detail perhatian yang diberikan pada keseluruhan proses produksi, karena keduanya membutuhkan waktu ekstra yang tidak semua penyedia bersedia investasikan.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum dalam Menilai Jahitan Tangan',
        block: {
          kind: 'list',
          items: [
            'Mengira semua bagian thobe bespoke dijahit tangan, padahal umumnya hanya area tertentu',
            'Tidak memeriksa detail lubang kancing dan hem saat menilai kualitas keseluruhan',
            'Menganggap jahitan tangan otomatis lebih baik tanpa mempertimbangkan keahlian pengrajin yang mengerjakannya',
            'Mengabaikan bahwa jahitan tangan membutuhkan waktu produksi tambahan yang perlu diperhitungkan dalam timeline pemesanan',
          ],
        },
      },
    ],
    expertNote:
      'Detail jahitan tangan adalah salah satu hal yang paling sulit dijelaskan lewat foto, namun paling terasa saat thobe benar-benar dipakai bertahun-tahun — lubang kancing dan hem yang dijahit dengan baik tetap kokoh jauh lebih lama dibanding yang dikerjakan sepenuhnya oleh mesin.',
    faq: [
      {
        question: 'Apakah seluruh thobe bespoke dijahit dengan tangan?',
        answer: 'Tidak. Jahitan tangan umumnya diterapkan pada area spesifik seperti lubang kancing dan hem, sementara bagian utama tetap menggunakan mesin jahit untuk konsistensi dan efisiensi.',
      },
      {
        question: 'Kenapa lubang kancing jahitan tangan lebih tahan lama?',
        answer: 'Teknik simpul khusus pada jahitan tangan memberi kekuatan dan fleksibilitas yang lebih baik menahan tarikan berulang dibanding lubang kancing mesin.',
      },
      {
        question: 'Apakah jahitan tangan menambah biaya thobe bespoke?',
        answer: 'Umumnya ya, karena membutuhkan waktu pengerjaan tambahan dan keahlian khusus dibanding jahitan mesin standar.',
      },
    ],
    relatedArticles: [
      { category: 'tailoring', slug: 'quality-control' },
      { category: 'wedding', slug: 'premium-thobe-wedding' },
      { category: 'umrah', slug: 'premium-umrah-outfit' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'egyptian-cotton' },
      { category: 'fabrics', slug: 'wool-blend' },
    ],
    relatedCategories: ['care'],
    tags: { service: ['bespoke', 'premium'] },
  },
  {
    slug: 'quality-control',
    category: 'tailoring',
    eyebrow: 'Panduan Tailoring',
    title: 'Proses Quality Control Thobe Bespoke',
    navLabel: 'Quality Control',
    metaDescription:
      'Penjelasan proses quality control pada thobe bespoke — titik pemeriksaan yang dilakukan sebelum thobe dinyatakan siap diserahkan ke pelanggan.',
    dek: 'Sebelum thobe sampai ke tangan Anda, ada rangkaian pemeriksaan yang memastikan setiap detail sesuai standar.',
    definition:
      'Quality control pada thobe bespoke adalah rangkaian pemeriksaan sistematis terhadap jahitan, kesesuaian ukuran, dan finishing akhir sebelum thobe dinyatakan siap diserahkan, bertujuan menangkap cacat produksi sebelum sampai ke tangan pelanggan.',
    quickAnswer:
      'Quality control thobe bespoke umumnya mencakup pemeriksaan kesesuaian ukuran terhadap pola asli, kerapian jahitan di titik-titik kritis seperti kerah dan lubang kancing, konsistensi warna, dan pemeriksaan akhir keseluruhan sebelum thobe dinyatakan siap diserahkan.',
    keyTakeaways: [
      'Quality control dilakukan bertahap, bukan hanya di akhir proses produksi',
      'Titik kritis yang diperiksa meliputi kerah, lubang kancing, hem, dan kesesuaian ukuran',
      'Pemeriksaan konsistensi warna penting terutama untuk pesanan dengan banyak potong (seperti family outfit)',
      'Cacat produksi yang ditemukan di tahap awal jauh lebih mudah diperbaiki dibanding di tahap akhir',
      'Quality control yang baik mengurangi kebutuhan revisi setelah thobe diserahkan ke pelanggan',
    ],
    sections: [
      {
        heading: 'Kenapa Quality Control Penting dalam Proses Bespoke',
        block: {
          kind: 'paragraphs',
          items: [
            'Meski bespoke sudah melibatkan pengukuran dan fitting yang presisi, proses produksi tetap melibatkan banyak tahap manual yang berpotensi menghasilkan variasi kecil — quality control adalah lapisan pemeriksaan sistematis yang menangkap variasi tersebut sebelum thobe benar-benar diserahkan ke pelanggan.',
          ],
        },
      },
      {
        heading: 'Titik Pemeriksaan Quality Control',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Pemeriksaan Selama Produksi',
            block: {
              kind: 'list',
              items: [
                'Kesesuaian potongan pola dengan ukuran yang tercatat di Digital Body Profile',
                'Konsistensi warna kain, terutama untuk pesanan dengan beberapa potong sekaligus',
                'Kerapian jahitan di titik kritis seperti kerah, kerung lengan, dan lubang kancing',
              ],
            },
          },
          {
            heading: 'Pemeriksaan Akhir Sebelum Penyerahan',
            block: {
              kind: 'list',
              items: [
                'Pemeriksaan visual menyeluruh untuk cacat kain atau jahitan yang mungkin terlewat',
                'Verifikasi ukuran akhir dibandingkan dengan pola asli',
                'Pemeriksaan finishing seperti hem, manset, dan detail jahitan tangan',
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
            'Lakukan sesi fitting akhir dengan teliti sebelum menerima thobe — periksa kerah, lengan, dan panjang badan dalam kondisi bergerak (bukan hanya berdiri diam), karena inilah kesempatan terakhir untuk menangkap ketidaksesuaian kecil sebelum thobe benar-benar dipakai di acara sesungguhnya.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum yang Ditangkap Quality Control',
        block: {
          kind: 'list',
          items: [
            'Perbedaan sedikit warna kain antara beberapa potong dalam satu pesanan family outfit',
            'Jahitan lubang kancing yang kurang rapat atau tidak simetris',
            'Ketidaksesuaian kecil antara ukuran hasil produksi dengan pola asli',
            'Finishing hem yang belum rapi atau interlining yang belum terpasang sempurna',
          ],
        },
      },
    ],
    expertNote:
      'Kami menerapkan pemeriksaan bertahap, bukan hanya di akhir — menangkap variasi kecil di tahap awal produksi jauh lebih mudah diperbaiki dibanding menemukannya setelah thobe hampir selesai sepenuhnya.',
    faq: [
      {
        question: 'Kapan quality control dilakukan dalam proses produksi bespoke?',
        answer: 'Idealnya bertahap sepanjang proses produksi, bukan hanya sekali di akhir, agar variasi kecil bisa dikoreksi lebih awal.',
      },
      {
        question: 'Apa yang diperiksa dalam quality control thobe bespoke?',
        answer: 'Kesesuaian ukuran, konsistensi warna, kerapian jahitan di titik kritis seperti kerah dan lubang kancing, serta finishing akhir seperti hem dan manset.',
      },
      {
        question: 'Kenapa fitting akhir penting sebagai bagian dari quality control?',
        answer: 'Fitting akhir adalah kesempatan terakhir menangkap ketidaksesuaian kecil sebelum thobe benar-benar digunakan di acara sesungguhnya.',
      },
    ],
    relatedArticles: [
      { category: 'tailoring', slug: 'handmade-details' },
      { category: 'tailoring', slug: 'collar-construction' },
      { category: 'wedding', slug: 'timeline-custom-wedding' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'egyptian-cotton' },
      { category: 'fabrics', slug: 'wool-blend' },
    ],
    relatedCategories: ['measurements'],
    tags: { service: ['bespoke'] },
  },
]
