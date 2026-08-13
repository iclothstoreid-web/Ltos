import type { KnowledgeArticle } from '../types'

// Sprint W6-5 — Umrah Cluster. 8 commercial/practical umrah guides,
// distinct from styling/umrah-thobe-style (pure aesthetic styling): this
// cluster covers travel logistics, packing, climate, and care-on-the-go —
// real planning decisions a jamaah makes before departure.
export const UMRAH_ARTICLES: KnowledgeArticle[] = [
  {
    slug: 'best-fabric',
    category: 'umrah',
    eyebrow: 'Panduan Umrah',
    title: 'Bahan Terbaik untuk Thobe Umrah',
    navLabel: 'Bahan Terbaik Umrah',
    metaDescription:
      'Panduan memilih bahan terbaik untuk thobe umrah — perbandingan katun Jepang, linen, dan katun Mesir untuk cuaca panas dan perjalanan panjang.',
    dek: 'Bahan yang tepat menentukan kenyamanan Anda selama berhari-hari beribadah di cuaca panas Mekkah dan Madinah.',
    definition:
      'Bahan terbaik untuk thobe umrah adalah bahan dengan sirkulasi udara tinggi, bobot ringan, dan daya tahan yang baik terhadap pemakaian dan pencucian berulang selama perjalanan ibadah yang berlangsung berhari-hari di cuaca panas.',
    quickAnswer:
      'Katun Jepang, linen, dan katun Mesir adalah tiga bahan terbaik untuk thobe umrah karena sirkulasi udaranya tinggi, cukup ringan untuk dibawa bepergian, dan nyaman dipakai berjam-jam saat ibadah di cuaca panas Mekkah dan Madinah.',
    keyTakeaways: [
      'Sirkulasi udara adalah faktor terpenting, lebih penting dari tampilan visual semata',
      'Katun Jepang menawarkan keseimbangan terbaik antara kenyamanan dan daya tahan',
      'Linen paling sejuk namun mudah kusut, kurang ideal jika membawa sedikit thobe',
      'Katun Mesir memberi kelembutan ekstra untuk kulit yang sensitif terhadap keringat',
      'Hindari bahan tebal seperti wool blend yang menyimpan panas berlebih',
    ],
    sections: [
      {
        heading: 'Kenapa Bahan adalah Prioritas Utama untuk Umrah',
        block: {
          kind: 'paragraphs',
          items: [
            'Berbeda dari thobe formal yang dipilih berdasarkan kesan visual, thobe umrah dipilih berdasarkan fungsi — dipakai berjam-jam sehari selama tawaf, sai, dan sholat berjamaah di cuaca yang bisa mencapai 40°C atau lebih, terutama saat musim panas. Bahan yang salah bisa membuat ibadah terasa jauh lebih berat secara fisik dibanding seharusnya.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Memilih Bahan',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Untuk Cuaca Sangat Panas',
            block: {
              kind: 'paragraphs',
              items: [
                'Linen adalah pilihan tersejuk berkat serat berongga yang menyalurkan panas keluar dari tubuh, cocok untuk jamaah yang berangkat di musim panas puncak dan tidak keberatan dengan kerutan alaminya.',
              ],
            },
          },
          {
            heading: 'Untuk Keseimbangan Kenyamanan dan Tampilan',
            block: {
              kind: 'paragraphs',
              items: [
                'Katun Jepang memberi sirkulasi udara yang baik sekaligus tampilan lebih rapi dan tahan lama dibanding linen, menjadikannya pilihan paling populer untuk jamaah yang ingin thobe tetap terlihat presentabel sepanjang perjalanan.',
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
            'Jika hanya bisa memilih satu bahan untuk seluruh perjalanan umrah, katun Jepang adalah kompromi terbaik — cukup sejuk untuk kenyamanan, cukup tahan lama untuk dicuci berulang kali selama perjalanan, dan cukup rapi untuk tetap terlihat baik di foto maupun saat berinteraksi dengan sesama jamaah.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Membawa thobe berbahan tebal seperti wool blend yang menyimpan panas berlebih di cuaca umrah',
            'Hanya membawa linen tanpa mempertimbangkan kerutannya yang cepat terlihat setelah dipakai duduk lama di pesawat atau bus',
            'Memilih bahan berdasarkan tampilan semata tanpa mempertimbangkan sirkulasi udara',
            'Tidak mempertimbangkan daya tahan bahan terhadap pencucian berulang selama perjalanan panjang',
          ],
        },
      },
    ],
    expertNote:
      'Untuk jamaah yang bertanya bahan apa yang paling aman dibawa jika ragu, kami selalu merekomendasikan katun Jepang — risiko kekecewaannya paling kecil dibanding bahan lain karena keseimbangannya antara kenyamanan dan tampilan.',
    comparisonTable: {
      caption: 'Perbandingan tiga bahan terbaik untuk thobe umrah',
      headers: ['Bahan', 'Sirkulasi Udara', 'Ketahanan Kusut', 'Cocok Untuk'],
      rows: [
        ['Linen', 'Sangat tinggi', 'Rendah', 'Cuaca sangat panas, tidak keberatan kerutan'],
        ['Katun Jepang', 'Tinggi', 'Sedang', 'Keseimbangan kenyamanan dan tampilan'],
        ['Katun Mesir', 'Tinggi', 'Sedang', 'Kulit sensitif, kenyamanan maksimal'],
      ],
    },
    faq: [
      {
        question: 'Bahan apa yang paling direkomendasikan jika hanya bisa membawa satu jenis?',
        answer: 'Katun Jepang, karena keseimbangan terbaik antara sirkulasi udara, daya tahan, dan tampilan yang tetap rapi.',
      },
      {
        question: 'Apakah linen benar-benar lebih sejuk dari katun Jepang?',
        answer: 'Ya, secara sirkulasi udara linen sedikit lebih unggul, namun kekurangannya adalah kerutan yang jauh lebih cepat terlihat.',
      },
      {
        question: 'Apakah wool blend cocok untuk umrah?',
        answer: 'Kurang direkomendasikan karena bobotnya yang lebih tebal dan menyimpan panas, tidak ideal untuk cuaca panas dan aktivitas ibadah intensif.',
      },
    ],
    relatedArticles: [
      { category: 'umrah', slug: 'climate-guide' },
      { category: 'umrah', slug: 'how-many-thobes' },
      { category: 'styling', slug: 'umrah-thobe-style' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'japanese-cotton' },
      { category: 'fabrics', slug: 'linen' },
    ],
    relatedCategories: ['fabrics'],
    tags: { occasion: ['umrah'], season: ['panas'], service: ['bespoke'] },
  },
  {
    slug: 'how-many-thobes',
    category: 'umrah',
    eyebrow: 'Panduan Umrah',
    title: 'Berapa Banyak Thobe yang Perlu Dibawa untuk Umrah?',
    navLabel: 'Jumlah Thobe Umrah',
    metaDescription:
      'Panduan menentukan jumlah thobe yang ideal dibawa untuk umrah — mempertimbangkan durasi perjalanan, akses cuci, dan cadangan.',
    dek: 'Terlalu sedikit merepotkan, terlalu banyak memberatkan koper — panduan menentukan jumlah yang pas.',
    definition:
      'Jumlah thobe yang ideal untuk umrah adalah jumlah yang mempertimbangkan durasi perjalanan, akses ke fasilitas cuci selama di sana, dan cadangan untuk kondisi tak terduga, umumnya berkisar 3–5 potong untuk perjalanan standar 9–14 hari.',
    quickAnswer:
      'Untuk perjalanan umrah standar 9–14 hari, 3–4 thobe umumnya cukup dengan asumsi ada akses mencuci di penginapan, ditambah 1 thobe cadangan untuk kondisi tak terduga seperti keterlambatan cuci atau noda.',
    keyTakeaways: [
      'Durasi perjalanan adalah faktor utama menentukan jumlah thobe yang dibutuhkan',
      'Akses mencuci di penginapan secara signifikan mengurangi jumlah yang perlu dibawa',
      '3–4 thobe cukup untuk perjalanan 9–14 hari dengan akses cuci',
      'Tambahkan 1 thobe cadangan untuk kondisi tak terduga seperti noda atau keterlambatan cuci',
      'Pertimbangkan bobot koper — bahan ringan seperti katun Jepang memudahkan packing lebih banyak potong',
    ],
    sections: [
      {
        heading: 'Faktor yang Menentukan Jumlah Thobe',
        block: {
          kind: 'paragraphs',
          items: [
            'Jumlah thobe yang ideal bukan angka tetap untuk semua orang — bergantung pada durasi perjalanan, apakah penginapan menyediakan akses mencuci, dan seberapa nyaman Anda dengan rotasi pakaian yang lebih ketat. Jamaah yang bepergian 9 hari dengan akses laundry akan membutuhkan jumlah yang jauh berbeda dari jamaah yang bepergian 21 hari tanpa akses cuci mudah.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Menentukan Jumlah',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Perjalanan Singkat (9–14 Hari) dengan Akses Cuci',
            block: {
              kind: 'paragraphs',
              items: [
                'Untuk durasi ini dengan akses mencuci di penginapan, 3–4 thobe umumnya cukup — dipakai bergantian dengan rotasi cuci setiap 2–3 hari sekali.',
              ],
            },
          },
          {
            heading: 'Perjalanan Panjang (15 Hari ke Atas) atau Tanpa Akses Cuci',
            block: {
              kind: 'paragraphs',
              items: [
                'Jika durasi lebih panjang atau akses cuci terbatas, pertimbangkan membawa 5–6 thobe untuk mengurangi ketergantungan pada rotasi cuci yang ketat.',
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
            'Selalu sisipkan satu thobe cadangan di luar hitungan rotasi normal — kondisi tak terduga seperti noda yang sulit hilang, keterlambatan cuci, atau keperluan mendadak (misalnya tamu atau acara khusus di rombongan) sering membuat cadangan ini sangat berguna.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Membawa terlalu sedikit tanpa mempertimbangkan akses cuci yang mungkin terbatas',
            'Membawa terlalu banyak sehingga koper kelebihan bobot, terutama jika bahan yang dipilih tidak ringan',
            'Tidak menyisipkan thobe cadangan untuk kondisi tak terduga',
            'Mengabaikan waktu pengeringan — bahan tebal seperti wool blend butuh waktu lebih lama kering setelah dicuci',
          ],
        },
      },
    ],
    expertNote:
      'Aturan praktis yang kami sarankan: hitung jumlah hari dibagi tiga (asumsi rotasi cuci setiap 2–3 hari), lalu tambahkan satu sebagai cadangan — ini biasanya menghasilkan jumlah yang pas tanpa berlebihan.',
    comparisonTable: {
      caption: 'Rekomendasi jumlah thobe berdasarkan durasi perjalanan',
      headers: ['Durasi Perjalanan', 'Dengan Akses Cuci', 'Tanpa Akses Cuci'],
      rows: [
        ['9–14 hari', '3–4 thobe', '5–6 thobe'],
        ['15–21 hari', '4–5 thobe', '7–8 thobe'],
      ],
    },
    faq: [
      {
        question: 'Apakah 3 thobe cukup untuk umrah 10 hari?',
        answer: 'Cukup jika penginapan menyediakan akses mencuci dan Anda nyaman dengan rotasi cuci setiap 2–3 hari sekali.',
      },
      {
        question: 'Apakah perlu membawa thobe cadangan?',
        answer: 'Sangat disarankan — satu thobe cadangan di luar hitungan rotasi normal membantu mengantisipasi noda atau keterlambatan cuci.',
      },
      {
        question: 'Bahan apa yang paling memudahkan packing dalam jumlah lebih banyak?',
        answer: 'Katun Jepang dan linen, karena bobotnya ringan dan tidak memakan banyak ruang koper dibanding bahan yang lebih tebal.',
      },
    ],
    relatedArticles: [
      { category: 'umrah', slug: 'packing-guide' },
      { category: 'umrah', slug: 'care-during-travel' },
      { category: 'umrah', slug: 'best-fabric' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'japanese-cotton' },
      { category: 'fabrics', slug: 'linen' },
    ],
    relatedCategories: ['care'],
    tags: { occasion: ['umrah'], service: ['bespoke'] },
  },
  {
    slug: 'color-guide',
    category: 'umrah',
    eyebrow: 'Panduan Umrah',
    title: 'Panduan Warna Thobe untuk Umrah',
    navLabel: 'Panduan Warna Umrah',
    metaDescription:
      'Panduan memilih warna thobe untuk umrah — putih, krem, dan abu-abu muda, plus pertimbangan praktis noda dan cuaca panas.',
    dek: 'Warna netral bukan sekadar tradisi — ada alasan praktis di balik pilihan warna untuk ibadah umrah.',
    definition:
      'Panduan warna umrah adalah referensi memilih warna thobe yang sesuai dengan tradisi ibadah sekaligus praktis untuk kondisi perjalanan — umumnya berkisar pada putih, krem, dan abu-abu muda yang netral dan menyamarkan debu perjalanan.',
    quickAnswer:
      'Putih adalah warna paling tradisional untuk umrah, namun krem dan abu-abu muda menjadi alternatif praktis yang lebih menyamarkan noda debu dan keringat selama perjalanan panjang, tanpa mengurangi kesan netral dan sopan.',
    keyTakeaways: [
      'Putih adalah warna paling tradisional dan melambangkan kesucian dalam ibadah',
      'Krem dan abu-abu muda lebih praktis untuk menyamarkan noda debu perjalanan',
      'Hindari warna gelap yang menyerap panas berlebih di cuaca umrah',
      'Pertimbangkan membawa kombinasi putih dan krem untuk keseimbangan tradisi dan kepraktisan',
      'Warna terang secara umum lebih ideal daripada warna gelap untuk seluruh perjalanan umrah',
    ],
    sections: [
      {
        heading: 'Kenapa Warna Terang Dominan untuk Umrah',
        block: {
          kind: 'paragraphs',
          items: [
            'Selain alasan tradisi dan simbolisme kesucian, ada alasan praktis kuat di balik dominasi warna terang untuk umrah — warna gelap menyerap panas matahari jauh lebih banyak, sesuatu yang sangat terasa saat berjalan jarak jauh di area terbuka Masjidil Haram atau Masjid Nabawi di bawah terik matahari.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Memilih Warna',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Putih — Pilihan Tradisional',
            block: {
              kind: 'paragraphs',
              items: [
                'Putih tetap menjadi pilihan paling umum dan melambangkan kesucian, meski memiliki kekurangan praktis: noda debu dan keringat lebih mudah terlihat dibanding warna lain.',
              ],
            },
          },
          {
            heading: 'Krem dan Abu-Abu Muda — Alternatif Praktis',
            block: {
              kind: 'paragraphs',
              items: [
                'Krem dan abu-abu muda tetap netral dan sopan namun jauh lebih menyamarkan noda ringan dari debu perjalanan, menjadikannya pilihan praktis untuk thobe yang dipakai di hari-hari dengan aktivitas berjalan jauh.',
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
            'Bawa kombinasi warna, bukan hanya putih — misalnya 2 putih untuk momen ibadah utama dan sisanya krem atau abu-abu muda untuk hari-hari dengan aktivitas berjalan lebih jauh, sehingga noda tidak terlalu mengganggu penampilan sepanjang perjalanan.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Membawa hanya thobe putih tanpa alternatif warna yang lebih menyamarkan noda',
            'Memilih warna gelap karena alasan tampilan tanpa mempertimbangkan cuaca panas',
            'Tidak mempertimbangkan bahwa warna terang lebih mudah menunjukkan transparansi jika bahannya terlalu tipis',
            'Mengabaikan kombinasi warna untuk variasi hari-hari perjalanan yang panjang',
          ],
        },
      },
    ],
    expertNote:
      'Kami menyarankan jamaah membawa campuran putih dan krem, bukan seragam satu warna — ini memberi fleksibilitas praktis tanpa mengurangi kesan netral dan sopan yang menjadi prioritas selama ibadah.',
    faq: [
      {
        question: 'Apakah warna thobe umrah wajib putih?',
        answer: 'Tidak wajib secara aturan ibadah, namun putih adalah tradisi yang paling umum dan melambangkan kesucian.',
      },
      {
        question: 'Kenapa warna gelap kurang direkomendasikan untuk umrah?',
        answer: 'Warna gelap menyerap lebih banyak panas matahari, yang cukup terasa saat berjalan jarak jauh di cuaca panas Mekkah dan Madinah.',
      },
      {
        question: 'Apakah krem atau abu-abu muda tetap terlihat sopan untuk ibadah?',
        answer: 'Ya, keduanya tetap netral dan sopan, sekaligus lebih praktis dalam menyamarkan noda debu perjalanan dibanding putih.',
      },
    ],
    relatedArticles: [
      { category: 'umrah', slug: 'best-fabric' },
      { category: 'umrah', slug: 'packing-guide' },
      { category: 'styling', slug: 'white-thobe' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'japanese-cotton' },
      { category: 'fabrics', slug: 'linen' },
    ],
    relatedCategories: ['styling'],
    tags: { occasion: ['umrah'], service: ['bespoke'] },
  },
  {
    slug: 'packing-guide',
    category: 'umrah',
    eyebrow: 'Panduan Umrah',
    title: 'Panduan Packing Thobe untuk Umrah',
    navLabel: 'Panduan Packing Umrah',
    metaDescription:
      'Panduan packing thobe untuk umrah — cara melipat agar tidak kusut, urutan dalam koper, dan tips menghemat ruang bagasi.',
    dek: 'Cara melipat dan menyusun thobe yang tepat menghemat ruang koper sekaligus mengurangi kerutan saat tiba.',
    definition:
      'Panduan packing thobe umrah adalah teknik melipat, menyusun, dan mengorganisir thobe di dalam koper agar tidak mudah kusut selama perjalanan sekaligus menghemat ruang bagasi yang terbatas.',
    quickAnswer:
      'Thobe sebaiknya dilipat memanjang mengikuti garis alami kain (bukan dilipat sembarangan), disusun di lapisan tengah koper dengan bahan lembut sebagai pelapis, dan dipisahkan dari sepatu atau barang berat lainnya untuk mengurangi kerutan.',
    keyTakeaways: [
      'Lipat thobe mengikuti garis alami kain, bukan dilipat sembarangan',
      'Susun thobe di lapisan tengah koper, terlindung dari barang berat',
      'Pisahkan thobe dari sepatu dan perlengkapan mandi untuk menghindari noda',
      'Bahan tahan kusut seperti katun Jepang lebih memaafkan teknik packing yang kurang sempurna',
      'Bawa kantong khusus atau garment bag jika membawa thobe premium',
    ],
    sections: [
      {
        heading: 'Kenapa Teknik Packing Penting untuk Thobe',
        block: {
          kind: 'paragraphs',
          items: [
            'Thobe yang dilipat sembarangan dan ditekan oleh barang berat lain di koper akan tiba dalam kondisi kusut parah, sesuatu yang merepotkan untuk diperbaiki di tengah jadwal ibadah yang padat. Teknik packing yang tepat mengurangi kebutuhan menyetrika ulang setibanya di penginapan.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Packing Thobe',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Teknik Melipat',
            block: {
              kind: 'list',
              items: [
                'Lipat thobe memanjang mengikuti garis bahu dan lengan, bukan dilipat menyilang',
                'Hindari lipatan tajam di area kerah dan dada yang paling terlihat jika kusut',
                'Gulung ringan (bukan dilipat rapat) untuk bahan yang sangat mudah kusut seperti linen',
              ],
            },
          },
          {
            heading: 'Urutan Penyusunan di Koper',
            block: {
              kind: 'paragraphs',
              items: [
                'Susun thobe di lapisan tengah koper — bukan paling bawah (tertekan barang lain) maupun paling atas (mudah bergeser). Lapisi dengan pakaian lembut lain di atas dan bawahnya sebagai bantalan, dan hindari menaruh sepatu atau perlengkapan mandi langsung bersentuhan dengan thobe.',
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
            'Jika membawa thobe premium atau untuk momen khusus, gunakan garment bag terpisah atau kantong kain sebagai pelapis tambahan — investasi kecil ini secara signifikan mengurangi risiko kusut dan noda dibanding menaruhnya langsung bercampur barang lain di koper.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Melipat thobe menyilang sembarangan tanpa mengikuti garis alami kain',
            'Menaruh thobe di lapisan paling bawah koper, tertekan barang berat',
            'Mencampur thobe langsung dengan sepatu atau perlengkapan mandi tanpa pemisah',
            'Tidak menyisakan ruang untuk thobe yang sudah dipakai (kotor) terpisah dari yang masih bersih',
          ],
        },
      },
    ],
    expertNote:
      'Sisipkan kantong kain tipis terpisah khusus untuk thobe yang sudah dipakai — ini mencegah thobe bersih ikut terkena bau atau noda dari thobe kotor selama perjalanan pulang maupun perpindahan antar kota.',
    faq: [
      {
        question: 'Bagaimana cara terbaik melipat thobe agar tidak kusut?',
        answer: 'Lipat memanjang mengikuti garis alami bahu dan lengan, hindari lipatan tajam di area kerah dan dada.',
      },
      {
        question: 'Apakah perlu garment bag khusus untuk thobe umrah?',
        answer: 'Tidak wajib, namun sangat membantu terutama untuk thobe premium atau yang diperuntukkan momen khusus selama perjalanan.',
      },
      {
        question: 'Bagaimana memisahkan thobe bersih dan kotor selama perjalanan?',
        answer: 'Gunakan kantong kain tipis terpisah untuk thobe yang sudah dipakai, agar tidak mencampuri thobe bersih dengan bau atau noda.',
      },
    ],
    relatedArticles: [
      { category: 'umrah', slug: 'how-many-thobes' },
      { category: 'umrah', slug: 'care-during-travel' },
      { category: 'care', slug: 'remove-wrinkles' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'japanese-cotton' },
      { category: 'fabrics', slug: 'premium-cotton' },
    ],
    relatedCategories: ['care'],
    tags: { occasion: ['umrah'], service: ['care'] },
  },
  {
    slug: 'care-during-travel',
    category: 'umrah',
    eyebrow: 'Panduan Umrah',
    title: 'Perawatan Thobe Selama Perjalanan Umrah',
    navLabel: 'Perawatan Selama Umrah',
    metaDescription:
      'Panduan merawat thobe selama perjalanan umrah — mencuci di penginapan, mengeringkan cepat, dan menjaga tampilan tetap rapi di tengah jadwal padat.',
    dek: 'Jadwal ibadah yang padat menuntut perawatan thobe yang praktis dan cepat selama perjalanan.',
    definition:
      'Perawatan thobe selama perjalanan umrah adalah rangkaian praktik mencuci, mengeringkan, dan merapikan thobe di tengah keterbatasan waktu dan fasilitas selama berada di penginapan atau hotel, berbeda dari perawatan di rumah yang lebih leluasa.',
    quickAnswer:
      'Perawatan thobe selama umrah paling efektif dengan mencuci tangan cepat di wastafel kamar menggunakan sedikit sabun, memeras lembut tanpa memutar, dan menjemur di area yang bersirkulasi udara baik seperti dekat jendela atau kipas angin kamar.',
    keyTakeaways: [
      'Cuci tangan cepat di wastafel kamar lebih praktis dibanding mencari laundry setiap hari',
      'Peras lembut tanpa memutar untuk menghindari kerusakan bentuk kain',
      'Manfaatkan sirkulasi udara kamar (jendela, kipas, AC) untuk mempercepat pengeringan',
      'Rencanakan rotasi cuci di malam hari agar thobe kering sebelum dipakai keesokan harinya',
      'Bawa perlengkapan cuci mini (sabun cair kecil, hanger lipat) untuk memudahkan rutinitas',
    ],
    sections: [
      {
        heading: 'Tantangan Merawat Thobe di Tengah Jadwal Padat',
        block: {
          kind: 'paragraphs',
          items: [
            'Jadwal ibadah umrah yang padat — sholat lima waktu, tawaf, sai, dan ziarah — menyisakan sedikit waktu untuk urusan mencuci dan merawat pakaian. Kebanyakan penginapan tidak menyediakan layanan laundry harian, sehingga jamaah perlu strategi perawatan mandiri yang cepat dan praktis.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Perawatan Selama Perjalanan',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Mencuci Cepat di Kamar',
            block: {
              kind: 'paragraphs',
              items: [
                'Rendam thobe di wastafel dengan sedikit sabun cair selama beberapa menit, gosok lembut area yang kotor, lalu bilas hingga bersih. Peras dengan cara ditekan lembut (bukan diputar atau diperas keras) untuk menjaga bentuk kain tetap baik.',
              ],
            },
          },
          {
            heading: 'Mengeringkan dengan Cepat',
            block: {
              kind: 'paragraphs',
              items: [
                'Gantung thobe di dekat jendela terbuka, kipas angin, atau area dengan sirkulasi udara AC yang baik. Bahan ringan seperti katun Jepang dan linen kering jauh lebih cepat dibanding bahan tebal, salah satu alasan bahan ini lebih direkomendasikan untuk perjalanan umrah.',
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
            'Cuci thobe di malam hari setelah sholat Isya agar punya waktu semalaman untuk kering sebelum dipakai keesokan paginya — pola rotasi ini paling sesuai dengan jadwal ibadah harian dan menghindari situasi thobe masih basah saat dibutuhkan.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Menunda mencuci hingga menumpuk, sehingga kehabisan thobe bersih di tengah perjalanan',
            'Memeras terlalu keras hingga merusak bentuk dan tekstur kain',
            'Menjemur di area tanpa sirkulasi udara yang baik, membuat proses kering jauh lebih lama',
            'Tidak membawa perlengkapan cuci mini sehingga kesulitan saat penginapan tidak menyediakan fasilitas laundry',
          ],
        },
      },
    ],
    expertNote:
      'Kami menyarankan jamaah membawa hanger lipat kecil dan sabun cair travel-size — dua barang kecil ini membuat rutinitas cuci-kering di kamar hotel jauh lebih praktis dibanding mengandalkan fasilitas laundry yang belum tentu tersedia setiap hari.',
    faq: [
      {
        question: 'Apakah bisa mencuci thobe sendiri di kamar hotel selama umrah?',
        answer: 'Bisa, dengan mencuci tangan cepat di wastafel menggunakan sabun cair dan memeras lembut tanpa memutar kain.',
      },
      {
        question: 'Berapa lama waktu yang dibutuhkan thobe untuk kering di kamar?',
        answer:
          'Bervariasi tergantung bahan dan sirkulasi udara, namun bahan ringan seperti katun Jepang atau linen umumnya kering dalam semalam jika digantung di area dengan sirkulasi udara baik.',
      },
      {
        question: 'Perlengkapan apa yang sebaiknya dibawa untuk memudahkan perawatan selama perjalanan?',
        answer: 'Sabun cair travel-size dan hanger lipat kecil adalah dua perlengkapan paling praktis untuk rutinitas cuci-kering di kamar.',
      },
    ],
    relatedArticles: [
      { category: 'umrah', slug: 'packing-guide' },
      { category: 'care', slug: 'dry-clean-vs-hand-wash' },
      { category: 'care', slug: 'remove-wrinkles' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'japanese-cotton' },
      { category: 'fabrics', slug: 'linen' },
    ],
    relatedCategories: ['care'],
    tags: { occasion: ['umrah'], service: ['care'] },
  },
  {
    slug: 'climate-guide',
    category: 'umrah',
    eyebrow: 'Panduan Umrah',
    title: 'Panduan Iklim untuk Thobe Umrah',
    navLabel: 'Panduan Iklim Umrah',
    metaDescription:
      'Panduan memahami iklim Mekkah dan Madinah untuk memilih thobe yang tepat — perbedaan musim dan penyesuaian bahan yang diperlukan.',
    dek: 'Iklim Mekkah dan Madinah berbeda tiap musim — panduan menyesuaikan pilihan thobe dengan waktu keberangkatan Anda.',
    definition:
      'Panduan iklim umrah adalah referensi memahami kondisi cuaca Mekkah dan Madinah sepanjang tahun, membantu jamaah menyesuaikan pilihan bahan dan jumlah thobe berdasarkan musim keberangkatan mereka.',
    quickAnswer:
      'Mekkah dan Madinah memiliki iklim gurun dengan suhu ekstrem panas di musim panas (Juni–Agustus, bisa melebihi 40°C) dan cuaca lebih sejuk di musim dingin (Desember–Februari, sekitar 15–25°C), sehingga pemilihan bahan thobe sebaiknya disesuaikan dengan periode keberangkatan.',
    keyTakeaways: [
      'Musim panas (Juni–Agustus) menuntut bahan paling breathable seperti linen dan katun Jepang',
      'Musim dingin (Desember–Februari) lebih fleksibel, katun Mesir atau premium cotton tetap nyaman',
      'Suhu bisa berbeda signifikan antara siang dan malam, terutama di musim dingin',
      'Kelembapan relatif rendah sepanjang tahun, namun sirkulasi udara tetap penting karena aktivitas fisik intensif',
      'Cek prakiraan cuaca mendekati keberangkatan untuk penyesuaian terakhir jumlah dan jenis thobe',
    ],
    sections: [
      {
        heading: 'Karakteristik Iklim Mekkah dan Madinah',
        block: {
          kind: 'paragraphs',
          items: [
            'Mekkah dan Madinah berada di iklim gurun dengan karakteristik suhu tinggi sepanjang tahun dan kelembapan relatif rendah. Perbedaan suhu antar musim cukup signifikan — musim panas bisa jauh lebih ekstrem dibanding musim dingin, memengaruhi kebutuhan bahan thobe yang paling sesuai.',
          ],
        },
      },
      {
        heading: 'Panduan Bahan per Musim',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Musim Panas (Juni–Agustus)',
            block: {
              kind: 'paragraphs',
              items: [
                'Suhu siang hari bisa melebihi 40°C dengan sedikit angin. Linen dan katun Jepang menjadi prioritas utama karena sirkulasi udaranya yang tinggi sangat terasa manfaatnya di kondisi ini.',
              ],
            },
          },
          {
            heading: 'Musim Dingin (Desember–Februari)',
            block: {
              kind: 'paragraphs',
              items: [
                'Suhu siang hari lebih bersahabat, sekitar 20–25°C, meski malam hari bisa terasa cukup sejuk terutama di Madinah. Katun Mesir dan premium cotton tetap nyaman, dengan opsi membawa outer ringan untuk malam hari jika diperlukan.',
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
            'Cek prakiraan cuaca sekitar 1–2 minggu sebelum keberangkatan untuk penyesuaian terakhir — meski panduan musiman ini akurat secara umum, kondisi cuaca aktual bisa bergeser sedikit dari tahun ke tahun, dan penyesuaian kecil di jumlah atau jenis bahan bisa sangat membantu kenyamanan.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Menyamaratakan persiapan bahan tanpa mempertimbangkan musim keberangkatan',
            'Tidak mengecek prakiraan cuaca mendekati keberangkatan untuk penyesuaian terakhir',
            'Membawa bahan tebal saat berangkat di puncak musim panas',
            'Mengabaikan perbedaan suhu siang dan malam, terutama saat musim dingin di Madinah',
          ],
        },
      },
    ],
    expertNote:
      'Untuk jamaah yang berangkat di musim panas puncak, kami secara khusus menyarankan membawa mayoritas thobe berbahan linen atau katun Jepang — perbedaan kenyamanannya sangat terasa dibanding bahan yang lebih tebal di kondisi cuaca ekstrem tersebut.',
    comparisonTable: {
      caption: 'Perbandingan kondisi iklim dan rekomendasi bahan per musim',
      headers: ['Musim', 'Suhu Siang', 'Bahan Direkomendasikan'],
      rows: [
        ['Panas (Jun–Agu)', '> 40°C', 'Linen, katun Jepang'],
        ['Dingin (Des–Feb)', '20–25°C', 'Katun Mesir, premium cotton'],
      ],
    },
    faq: [
      {
        question: 'Kapan waktu paling panas untuk berangkat umrah?',
        answer: 'Musim panas antara Juni hingga Agustus, dengan suhu siang hari yang bisa melebihi 40°C.',
      },
      {
        question: 'Apakah malam hari di Madinah terasa dingin?',
        answer: 'Terutama saat musim dingin, malam hari di Madinah bisa terasa cukup sejuk dibanding siang harinya.',
      },
      {
        question: 'Apakah perlu membawa outer tambahan untuk umrah musim dingin?',
        answer: 'Disarankan, terutama untuk malam hari, meski thobe berbahan katun Mesir atau premium cotton umumnya tetap nyaman sepanjang siang.',
      },
    ],
    relatedArticles: [
      { category: 'umrah', slug: 'best-fabric' },
      { category: 'umrah', slug: 'how-many-thobes' },
      { category: 'fabrics', slug: 'linen' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'linen' },
      { category: 'fabrics', slug: 'japanese-cotton' },
    ],
    relatedCategories: ['fabrics'],
    tags: { occasion: ['umrah'], season: ['panas', 'dingin'] },
  },
  {
    slug: 'premium-umrah-outfit',
    category: 'umrah',
    eyebrow: 'Panduan Umrah',
    title: 'Outfit Umrah Premium — Panduan Tier Tertinggi',
    navLabel: 'Outfit Umrah Premium',
    metaDescription:
      'Panduan memilih outfit umrah premium — bahan terbaik, detail jahitan, dan kenyamanan maksimal untuk perjalanan ibadah yang bermakna.',
    dek: 'Kenyamanan dan kualitas tertinggi untuk perjalanan ibadah yang berkesan.',
    definition:
      'Outfit umrah premium adalah tingkatan tertinggi dalam pemesanan thobe umrah bespoke, menggabungkan bahan breathable kualitas terbaik dengan detail jahitan dan finishing yang lebih halus dibanding thobe umrah standar.',
    quickAnswer:
      'Outfit umrah premium menggabungkan bahan breathable kualitas terbaik seperti katun Jepang atau katun Mesir grade tertinggi dengan detail jahitan lebih halus, memberikan kenyamanan maksimal untuk ibadah intensif tanpa mengorbankan daya tahan selama perjalanan panjang.',
    keyTakeaways: [
      'Tier premium menggabungkan bahan terbaik dengan detail jahitan lebih halus',
      'Kenyamanan tetap menjadi prioritas utama, bukan sekadar tampilan mewah',
      'Bahan premium untuk umrah tetap harus breathable, bukan hanya mahal',
      'Detail seperti jahitan kerah yang halus mengurangi iritasi selama pemakaian intensif',
      'Pertimbangkan tier premium khususnya jika berangkat dalam durasi lama atau musim panas ekstrem',
    ],
    sections: [
      {
        heading: 'Apa yang Membedakan Outfit Umrah Premium',
        block: {
          kind: 'paragraphs',
          items: [
            'Berbeda dari thobe formal premium yang menonjolkan kesan visual mewah, outfit umrah premium menonjolkan kenyamanan fungsional tertinggi — bahan yang paling breathable dalam grade terbaik, detail jahitan yang mengurangi gesekan dan iritasi saat dipakai berjam-jam, dan finishing yang tetap tahan terhadap pencucian berulang selama perjalanan panjang.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Memilih Outfit Premium',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Bahan Grade Tertinggi',
            block: {
              kind: 'paragraphs',
              items: [
                'Katun Jepang atau katun Mesir grade terbaik memberi kombinasi kelembutan, sirkulasi udara, dan daya tahan yang sulit ditandingi bahan standar, terutama untuk ibadah yang menuntut pemakaian intensif berhari-hari.',
              ],
            },
          },
          {
            heading: 'Detail Jahitan untuk Kenyamanan',
            block: {
              kind: 'paragraphs',
              items: [
                'Perhatian khusus pada jahitan kerah dan area yang sering bergesekan dengan kulit — jahitan yang lebih halus secara signifikan mengurangi risiko iritasi saat thobe dipakai berjam-jam dalam kondisi berkeringat.',
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
            'Pertimbangkan tier premium khususnya jika perjalanan Anda berdurasi lama atau bertepatan dengan musim panas ekstrem — perbedaan kenyamanan antara bahan standar dan bahan grade terbaik jauh lebih terasa dalam kondisi pemakaian intensif dibanding pemakaian sesekali.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Menyamakan "premium" dengan bahan tebal atau berat yang justru kurang cocok untuk umrah',
            'Mengabaikan detail jahitan yang justru menjadi nilai utama tier premium untuk kenyamanan',
            'Memilih tier premium hanya untuk sebagian kecil thobe tanpa mempertimbangkan konsistensi kenyamanan sepanjang perjalanan',
            'Tidak mengonfirmasi grade bahan spesifik yang digunakan',
          ],
        },
      },
    ],
    expertNote:
      'Untuk umrah, nilai tier premium yang paling kami tekankan bukan tampilan, melainkan kenyamanan fisik — detail jahitan yang halus di area kerah dan ketiak membuat perbedaan nyata setelah dipakai berjam-jam dalam kondisi berkeringat.',
    faq: [
      {
        question: 'Apa bedanya outfit umrah premium dengan thobe umrah standar?',
        answer: 'Kombinasi bahan grade tertinggi dan detail jahitan yang lebih halus, difokuskan pada kenyamanan pemakaian intensif, bukan sekadar tampilan.',
      },
      {
        question: 'Apakah outfit premium selalu lebih tebal dari standar?',
        answer: 'Tidak. Untuk umrah, "premium" berarti grade bahan breathable terbaik, bukan bahan yang lebih tebal atau berat.',
      },
      {
        question: 'Kapan sebaiknya mempertimbangkan tier premium untuk umrah?',
        answer: 'Terutama untuk perjalanan berdurasi lama atau keberangkatan di musim panas ekstrem, di mana kenyamanan fisik sangat terasa dampaknya.',
      },
    ],
    relatedArticles: [
      { category: 'umrah', slug: 'best-fabric' },
      { category: 'umrah', slug: 'custom-umrah-thobe' },
      { category: 'tailoring', slug: 'handmade-details' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'japanese-cotton' },
      { category: 'fabrics', slug: 'egyptian-cotton' },
    ],
    relatedCategories: ['tailoring'],
    tags: { occasion: ['umrah'], service: ['bespoke', 'premium'] },
  },
  {
    slug: 'custom-umrah-thobe',
    category: 'umrah',
    eyebrow: 'Panduan Umrah',
    title: 'Thobe Custom untuk Umrah — Panduan Lengkap',
    navLabel: 'Thobe Custom Umrah',
    metaDescription:
      'Panduan memesan thobe custom khusus umrah — penyesuaian potongan, kantong tambahan, dan bahan yang disesuaikan kebutuhan ibadah.',
    dek: 'Thobe custom untuk umrah bisa disesuaikan lebih jauh dari sekadar ukuran — dari potongan hingga kantong tambahan.',
    definition:
      'Thobe custom untuk umrah adalah thobe bespoke yang dirancang khusus mempertimbangkan kebutuhan ibadah — potongan yang memudahkan gerakan sholat dan wudhu, bahan breathable, dan penyesuaian tambahan seperti kantong khusus yang tidak ditemukan pada thobe standar.',
    quickAnswer:
      'Thobe custom untuk umrah memungkinkan penyesuaian di luar ukuran standar — mulai dari panjang manset yang memudahkan wudhu, potongan yang nyaman untuk gerakan sujud, hingga kantong tambahan untuk mushaf saku atau ponsel selama ibadah.',
    keyTakeaways: [
      'Thobe custom umrah bisa disesuaikan lebih jauh dari sekadar ukuran tubuh standar',
      'Manset yang mudah dilipat memudahkan wudhu berulang kali sepanjang hari',
      'Potongan yang tepat memberi kenyamanan gerak saat sujud dan duduk lama',
      'Kantong tambahan bisa disesuaikan untuk kebutuhan praktis seperti mushaf saku',
      'Diskusikan kebutuhan spesifik ibadah Anda saat konsultasi, bukan hanya ukuran badan',
    ],
    sections: [
      {
        heading: 'Kenapa Mempertimbangkan Thobe Custom untuk Umrah',
        block: {
          kind: 'paragraphs',
          items: [
            'Thobe umrah standar sudah cukup baik untuk kebanyakan jamaah, namun thobe custom membuka opsi penyesuaian yang secara langsung meningkatkan kenyamanan ibadah — sesuatu yang tidak bisa didapat dari thobe ready-to-wear atau bahkan bespoke standar yang tidak dirancang khusus mempertimbangkan pola ibadah umrah.',
          ],
        },
      },
      {
        heading: 'Penyesuaian yang Bisa Dipilih',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Penyesuaian Manset untuk Wudhu',
            block: {
              kind: 'paragraphs',
              items: [
                'Manset yang dirancang mudah dilipat atau memiliki kancing tambahan memudahkan proses wudhu yang dilakukan berulang kali sepanjang hari tanpa harus membasahi seluruh lengan baju.',
              ],
            },
          },
          {
            heading: 'Kantong Tambahan',
            block: {
              kind: 'list',
              items: [
                'Kantong dalam untuk menyimpan mushaf saku dengan aman selama sholat dan tawaf',
                'Kantong tersembunyi untuk dokumen penting seperti paspor atau kartu identitas',
                'Kantong ponsel yang mudah diakses tanpa mengganggu gerakan ibadah',
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
            'Sampaikan kebiasaan ibadah spesifik Anda saat konsultasi — misalnya jika Anda terbiasa membawa mushaf saku atau memiliki preferensi tertentu soal kelonggaran gerak saat sujud — karena detail-detail ini sering luput dibahas jika konsultasi hanya berfokus pada ukuran dan warna.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Hanya mendiskusikan ukuran dan warna tanpa menyebutkan kebutuhan fungsional spesifik',
            'Tidak mempertimbangkan penyesuaian manset padahal sering berwudhu sepanjang hari',
            'Memesan thobe custom terlalu mepet dengan keberangkatan, membatasi opsi penyesuaian',
            'Mengabaikan bahwa penyesuaian fungsional membutuhkan diskusi lebih mendalam saat konsultasi',
          ],
        },
      },
    ],
    expertNote:
      'Penyesuaian kecil seperti kantong dalam untuk mushaf saku sering menjadi detail yang paling dihargai jamaah setelah mereka benar-benar memakainya di lapangan — sesuatu yang jarang terpikir sebelum berangkat, namun sangat terasa manfaatnya.',
    faq: [
      {
        question: 'Apakah thobe custom umrah lebih mahal dari thobe umrah biasa?',
        answer:
          'Bergantung pada tingkat penyesuaian yang diminta — penyesuaian fungsional seperti kantong tambahan umumnya menambah biaya moderat dibanding thobe bespoke standar.',
      },
      {
        question: 'Penyesuaian apa yang paling sering diminta untuk thobe umrah custom?',
        answer: 'Manset yang mudah dilipat untuk wudhu dan kantong dalam untuk mushaf saku adalah dua penyesuaian yang paling umum diminta.',
      },
      {
        question: 'Apakah saya perlu menyebutkan kebutuhan khusus sejak konsultasi pertama?',
        answer:
          'Sangat disarankan — semakin awal kebutuhan fungsional spesifik disampaikan, semakin mudah tailor mengintegrasikannya ke dalam desain dan pola thobe.',
      },
    ],
    relatedArticles: [
      { category: 'umrah', slug: 'premium-umrah-outfit' },
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'measurements', slug: 'sleeve' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'japanese-cotton' },
      { category: 'fabrics', slug: 'linen' },
    ],
    relatedCategories: ['tailoring'],
    tags: { occasion: ['umrah'], service: ['bespoke'] },
  },
]
