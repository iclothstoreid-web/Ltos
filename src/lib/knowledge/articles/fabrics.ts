import type { KnowledgeArticle } from '../types'

// Sprint W6-2 — Fabric Authority. 10 evergreen fabric guides. Every claim
// here is general, well-established textile knowledge (fiber origin, weave
// structure, breathability, durability) — not a fabricated brand-specific
// statistic. `relatedArticles` pairs each fabric with the one it's most
// often compared against while shopping, so the "Perbandingan" section and
// the internal-linking rule (Child -> Related Child) share one source.

export const FABRIC_ARTICLES: KnowledgeArticle[] = [
  {
    slug: 'linen',
    category: 'fabrics',
    eyebrow: 'Panduan Bahan',
    title: 'Linen — Bahan Thobe Alami untuk Cuaca Panas',
    navLabel: 'Linen',
    metaDescription:
      'Linen adalah serat alami dari tanaman flax dengan sirkulasi udara tinggi. Karakteristik, kelebihan, kekurangan, dan cara perawatan linen untuk thobe.',
    dek: 'Serat alami dengan sirkulasi udara terbaik di kelasnya — pilihan klasik untuk thobe harian di cuaca panas.',
    definition:
      'Linen adalah serat alami yang berasal dari tanaman flax dan dikenal karena kemampuan sirkulasi udara yang tinggi, menjadikannya salah satu bahan tertua yang digunakan manusia untuk pakaian di iklim panas.',
    sections: [
      {
        heading: 'Apa Itu Linen',
        block: {
          kind: 'paragraphs',
          items: [
            'Linen ditenun dari serat batang tanaman flax (Linum usitatissimum), diproses melalui tahap retting untuk memisahkan serat dari batangnya sebelum dipintal menjadi benang. Prosesnya lebih rumit dibanding memintal katun, salah satu alasan linen biasanya berada di segmen harga menengah-atas.',
          ],
        },
      },
      {
        heading: 'Karakteristik',
        block: {
          kind: 'list',
          items: [
            'Tekstur agak kasar dan bertekstur alami, melembut seiring pemakaian dan pencucian',
            'Sirkulasi udara sangat tinggi — serat berongga yang menyalurkan panas keluar dari tubuh',
            'Menyerap kelembapan hingga 20% dari beratnya sendiri tanpa terasa basah',
            'Jatuh dengan drape yang sedikit kaku namun ringan',
          ],
        },
      },
      {
        heading: 'Kelebihan',
        block: {
          kind: 'list',
          items: [
            'Paling sejuk di antara bahan alami untuk cuaca panas dan lembap',
            'Semakin lama dipakai dan dicuci, teksturnya semakin lembut',
            'Serat alami yang kuat meski terasa ringan',
          ],
        },
      },
      {
        heading: 'Kekurangan',
        block: {
          kind: 'list',
          items: [
            'Sangat mudah kusut, bahkan setelah beberapa jam pemakaian',
            'Harga umumnya lebih tinggi dibanding katun standar',
            'Kurang cocok untuk acara yang menuntut tampilan rapi sepanjang hari',
          ],
        },
      },
      {
        heading: 'Cocok untuk Acara Apa',
        block: {
          kind: 'paragraphs',
          items: [
            'Linen paling cocok untuk thobe harian, acara santai di luar ruangan, dan perjalanan ke daerah beriklim panas. Untuk acara formal yang menuntut tampilan rapi sepanjang hari, kerutan alami linen bisa menjadi pertimbangan.',
          ],
        },
      },
      {
        heading: 'Cocok untuk Siapa',
        block: {
          kind: 'paragraphs',
          items: [
            'Ideal untuk mereka yang banyak beraktivitas di luar ruangan atau tinggal di iklim panas dan lembap, serta tidak keberatan dengan tampilan kerutan alami sebagai bagian dari karakter bahan, bukan kekurangan.',
          ],
        },
      },
      {
        heading: 'Perbandingan dengan Premium Cotton',
        block: {
          kind: 'paragraphs',
          items: [
            'Dibanding premium cotton, linen unggul dalam sirkulasi udara namun kalah dalam ketahanan terhadap kusut. Premium cotton memberi kompromi yang lebih rapi untuk pemakaian sehari-hari, sementara linen unggul murni dari sisi kesejukan.',
          ],
        },
      },
      {
        heading: 'Cara Perawatan',
        block: {
          kind: 'list',
          items: [
            'Cuci dengan air dingin hingga hangat, siklus normal',
            'Setrika saat masih sedikit lembap untuk hasil paling rapi',
            'Gantung segera setelah dicuci untuk mengurangi kerutan berlebih',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apakah linen cocok untuk thobe formal?',
        answer:
          'Bisa, namun perlu diperhatikan bahwa linen mudah kusut sepanjang hari. Untuk acara formal yang menuntut tampilan rapi berjam-jam, bahan seperti wool blend atau premium cotton biasanya lebih dipilih.',
      },
      {
        question: 'Kenapa linen lebih mahal dari katun biasa?',
        answer:
          'Proses ekstraksi serat dari batang tanaman flax (retting) lebih rumit dan memakan waktu lebih lama dibanding memanen serat kapas, sehingga biaya produksinya lebih tinggi.',
      },
      {
        question: 'Apakah kerutan pada linen adalah tanda kualitas buruk?',
        answer:
          'Tidak. Kerutan adalah karakter alami serat linen, bukan tanda kualitas rendah — justru linen kualitas tinggi tetap akan kusut karena strukturnya sendiri, bukan karena kualitas tenunannya.',
      },
    ],
    relatedArticles: [
      { category: 'fabrics', slug: 'premium-cotton' },
      { category: 'fabrics', slug: 'japanese-cotton' },
    ],
    // Sprint W6-7 — Fabric -> Umrah link graph rule: linen is one of the
    // umrah cluster's own top fabric recommendations (see umrah/best-fabric),
    // so the link runs both directions.
    relatedCategories: ['care', 'styling', 'umrah'],
  },
  {
    slug: 'japanese-cotton',
    category: 'fabrics',
    eyebrow: 'Panduan Bahan',
    title: 'Katun Jepang — Bahan Premium dengan Standar Produksi Tinggi',
    navLabel: 'Katun Jepang',
    metaDescription:
      'Katun Jepang adalah katun premium yang diproses dengan standar tenun Jepang yang ketat. Karakteristik, kelebihan, kekurangan, dan cara perawatannya.',
    dek: 'Permukaan halus, warna solid tahan lama, dan konsistensi tenunan yang menjadi standar industri tekstil Jepang.',
    definition:
      'Katun Jepang adalah kain katun premium yang diproses menggunakan standar produksi tekstil Jepang yang dikenal ketat dalam konsistensi tenunan, kehalusan permukaan, dan ketahanan warna.',
    sections: [
      {
        heading: 'Apa Itu Katun Jepang',
        block: {
          kind: 'paragraphs',
          items: [
            'Istilah "katun Jepang" merujuk pada kain katun yang ditenun dan diproses di fasilitas tekstil Jepang, sering menggunakan mesin tenun shuttle loom kecepatan rendah yang menghasilkan tenunan lebih rapat dan konsisten dibanding tenun industri massal.',
          ],
        },
      },
      {
        heading: 'Karakteristik',
        block: {
          kind: 'list',
          items: [
            'Permukaan halus dengan sedikit kilau alami',
            'Tenunan sangat rapat dan konsisten dari ujung ke ujung kain',
            'Warna solid yang tahan lama dan jarang pudar signifikan',
            'Bobot medium — cukup tebal untuk struktur, cukup ringan untuk nyaman',
          ],
        },
      },
      {
        heading: 'Kelebihan',
        block: {
          kind: 'list',
          items: [
            'Konsistensi kualitas tinggi karena kontrol produksi yang ketat',
            'Tahan lama, tidak mudah bobrok meski dicuci berulang kali',
            'Permukaan halus yang nyaman untuk pemakaian sepanjang hari',
          ],
        },
      },
      {
        heading: 'Kekurangan',
        block: {
          kind: 'list',
          items: [
            'Harga lebih tinggi dibanding katun standar karena proses produksi yang lebih lambat',
            'Pilihan warna dan motif umumnya lebih terbatas dibanding katun massal',
          ],
        },
      },
      {
        heading: 'Cocok untuk Acara Apa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk thobe harian premium maupun semi-formal — permukaannya cukup rapi untuk acara kantor maupun kumpul keluarga, namun tetap nyaman untuk pemakaian sehari-hari.',
          ],
        },
      },
      {
        heading: 'Cocok untuk Siapa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk mereka yang mengutamakan konsistensi kualitas dan daya tahan jangka panjang, dan bersedia membayar lebih untuk standar produksi yang lebih terkontrol.',
          ],
        },
      },
      {
        heading: 'Perbandingan dengan Egyptian Cotton',
        block: {
          kind: 'paragraphs',
          items: [
            'Katun Jepang menonjol dari sisi konsistensi tenunan dan kontrol produksi, sementara katun Mesir menonjol dari sisi kelembutan serat itu sendiri (serat lebih panjang/extra-long staple). Keduanya sama-sama premium, tapi kelebihannya berasal dari sumber berbeda — proses vs bahan baku.',
          ],
        },
      },
      {
        heading: 'Cara Perawatan',
        block: {
          kind: 'list',
          items: [
            'Cuci dengan air dingin untuk mempertahankan ketahanan warna',
            'Setrika suhu sedang, bisa dalam kondisi kering maupun sedikit lembap',
            'Hindari pemutih untuk menjaga warna solid tetap konsisten',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apa yang membedakan katun Jepang dari katun pada umumnya?',
        answer:
          'Proses produksinya — katun Jepang umumnya ditenun dengan mesin shuttle loom kecepatan rendah yang menghasilkan tenunan lebih rapat dan konsisten, berbeda dari tenun industri massal berkecepatan tinggi.',
      },
      {
        question: 'Apakah katun Jepang lebih tahan lama dari katun biasa?',
        answer:
          'Ya, secara umum. Tenunan yang lebih rapat dan kontrol kualitas yang ketat membuat katun Jepang cenderung lebih tahan terhadap keausan dibanding katun produksi massal dengan harga setara.',
      },
      {
        question: 'Kenapa harga katun Jepang lebih mahal?',
        answer:
          'Proses tenun yang lebih lambat (mesin shuttle loom) dan kontrol kualitas yang lebih ketat membuat volume produksinya lebih rendah, sehingga biaya per meter kain lebih tinggi dibanding katun produksi massal.',
      },
    ],
    relatedArticles: [
      { category: 'fabrics', slug: 'egyptian-cotton' },
      { category: 'fabrics', slug: 'premium-cotton' },
    ],
    // Sprint W6-7 — Fabric -> Umrah link graph rule.
    relatedCategories: ['care', 'styling', 'umrah'],
  },
  {
    slug: 'egyptian-cotton',
    category: 'fabrics',
    eyebrow: 'Panduan Bahan',
    title: 'Katun Mesir — Standar Emas Kelembutan Katun Dunia',
    navLabel: 'Katun Mesir',
    metaDescription:
      'Katun Mesir adalah katun dengan serat extra-long staple dari Mesir, dikenal sangat lembut dan tahan lama. Karakteristik, kelebihan, dan cara perawatannya.',
    dek: 'Serat kapas terpanjang di dunia — sering dianggap sebagai tolok ukur kualitas katun premium.',
    definition:
      'Katun Mesir adalah katun yang ditanam di lembah Sungai Nil, Mesir, dengan serat extra-long staple (serat sangat panjang) yang menghasilkan benang lebih halus, kuat, dan lembut dibanding katun standar.',
    sections: [
      {
        heading: 'Apa Itu Katun Mesir',
        block: {
          kind: 'paragraphs',
          items: [
            'Kualitas katun sangat dipengaruhi oleh panjang seratnya — semakin panjang serat, semakin halus dan kuat benang yang dihasilkan. Iklim dan tanah di lembah Nil menghasilkan serat kapas extra-long staple yang secara konsisten lebih panjang dibanding sebagian besar katun dunia.',
          ],
        },
      },
      {
        heading: 'Karakteristik',
        block: {
          kind: 'list',
          items: [
            'Serat extra-long staple, menghasilkan benang sangat halus',
            'Permukaan lembut dengan kilau alami yang halus',
            'Tenunan rapat namun tetap breathable',
            'Warna menyerap dengan baik, hasil pewarnaan lebih dalam dan merata',
          ],
        },
      },
      {
        heading: 'Kelebihan',
        block: {
          kind: 'list',
          items: [
            'Kelembutan di atas rata-rata katun standar',
            'Lebih tahan lama karena serat panjang lebih kuat dan tidak mudah putus',
            'Semakin sering dicuci, teksturnya justru semakin lembut, bukan aus',
          ],
        },
      },
      {
        heading: 'Kekurangan',
        block: {
          kind: 'list',
          items: [
            'Harga di segmen premium, lebih tinggi dari katun standar',
            'Perlu perawatan lebih hati-hati untuk mempertahankan kelembutannya',
          ],
        },
      },
      {
        heading: 'Cocok untuk Acara Apa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk acara formal maupun harian premium — kelembutannya membuat kain ini nyaman dipakai berjam-jam tanpa terasa kasar di kulit, sekaligus cukup elegan untuk acara semi-formal.',
          ],
        },
      },
      {
        heading: 'Cocok untuk Siapa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk mereka yang memiliki kulit sensitif dan mengutamakan kenyamanan maksimal, serta bersedia berinvestasi pada bahan premium untuk pemakaian jangka panjang.',
          ],
        },
      },
      {
        heading: 'Perbandingan dengan Japanese Cotton',
        block: {
          kind: 'paragraphs',
          items: [
            'Katun Mesir unggul dari sisi kelembutan serat (bahan baku), sementara katun Jepang unggul dari sisi presisi dan konsistensi tenunan (proses produksi). Keduanya sama-sama premium namun menonjol di aspek berbeda.',
          ],
        },
      },
      {
        heading: 'Cara Perawatan',
        block: {
          kind: 'list',
          items: [
            'Cuci dengan air dingin, siklus lembut untuk menjaga serat tetap utuh',
            'Hindari pengering suhu tinggi — jemur atau gunakan pengering suhu rendah',
            'Setrika suhu sedang saat kain masih sedikit lembap',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apa yang membuat katun Mesir lebih berkualitas dari katun biasa?',
        answer:
          'Panjang seratnya (extra-long staple). Serat yang lebih panjang menghasilkan benang yang lebih halus, lebih kuat, dan lebih sedikit berbulu dibanding katun dengan serat pendek pada umumnya.',
      },
      {
        question: 'Apakah katun Mesir asli selalu dari Mesir?',
        answer:
          'Istilah "katun Mesir" merujuk pada jenis serat extra-long staple yang secara historis dan mayoritas ditanam di lembah Nil, Mesir, meski jenis serat serupa kini juga dibudidayakan di sejumlah wilayah lain dengan iklim mendukung.',
      },
      {
        question: 'Apakah katun Mesir cocok untuk kulit sensitif?',
        answer:
          'Sangat cocok. Permukaannya yang halus dan minim serat kasar membuat katun Mesir menjadi salah satu pilihan paling nyaman untuk kulit sensitif dibanding jenis katun lain.',
      },
    ],
    relatedArticles: [
      { category: 'fabrics', slug: 'japanese-cotton' },
      { category: 'fabrics', slug: 'premium-cotton' },
    ],
    // Sprint W6-7 — Fabric -> Wedding link graph rule: egyptian-cotton is a
    // top pick in wedding/premium-thobe-wedding and wedding/resepsi-pria.
    relatedCategories: ['care', 'styling', 'wedding'],
  },
  {
    slug: 'poplin',
    category: 'fabrics',
    eyebrow: 'Panduan Bahan',
    title: 'Poplin — Tenunan Rapat dengan Permukaan Halus Mengkilap',
    navLabel: 'Poplin',
    metaDescription:
      'Poplin adalah kain tenunan plain weave rapat dengan permukaan halus sedikit mengkilap. Karakteristik, kelebihan, kekurangan, dan cara perawatannya.',
    dek: 'Ringan namun cukup rapi untuk formal — salah satu tenunan katun paling populer untuk kemeja dan thobe.',
    definition:
      'Poplin adalah kain hasil tenunan plain weave (tenun polos) yang rapat, menghasilkan permukaan halus dengan kilau ringan dan tekstur bergaris tipis yang khas jika diperhatikan dari dekat.',
    sections: [
      {
        heading: 'Apa Itu Poplin',
        block: {
          kind: 'paragraphs',
          items: [
            'Poplin ditenun dengan benang pakan (weft) yang lebih tebal dibanding benang lungsin (warp), menghasilkan tekstur bergaris horizontal halus yang memberi permukaan kain kesan sedikit mengkilap dibanding tenunan plain weave standar.',
          ],
        },
      },
      {
        heading: 'Karakteristik',
        block: {
          kind: 'list',
          items: [
            'Permukaan halus dengan kilau ringan',
            'Tenunan rapat sehingga tidak mudah tembus pandang',
            'Bobot ringan hingga medium',
            'Jatuh rapi dengan sedikit kekakuan terstruktur',
          ],
        },
      },
      {
        heading: 'Kelebihan',
        block: {
          kind: 'list',
          items: [
            'Tampilan rapi dan formal tanpa terasa berat',
            'Lebih tahan kusut dibanding linen atau katun tenun longgar',
            'Harga umumnya terjangkau untuk kualitas tampilan yang dihasilkan',
          ],
        },
      },
      {
        heading: 'Kekurangan',
        block: {
          kind: 'list',
          items: [
            'Sirkulasi udara sedang — tidak sesejuk linen atau katun tenun longgar',
            'Kurang cocok untuk cuaca sangat panas dan lembap',
          ],
        },
      },
      {
        heading: 'Cocok untuk Acara Apa',
        block: {
          kind: 'paragraphs',
          items: [
            'Sangat cocok untuk acara formal dan semi-formal seperti acara kantor, pertemuan resmi, atau kumpul keluarga besar karena tampilannya yang rapi dan terstruktur.',
          ],
        },
      },
      {
        heading: 'Cocok untuk Siapa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk mereka yang sering menghadiri acara formal namun ingin bahan yang tetap terjangkau dan mudah dirawat dibanding bahan premium seperti katun Mesir atau wool blend.',
          ],
        },
      },
      {
        heading: 'Perbandingan dengan Oxford',
        block: {
          kind: 'paragraphs',
          items: [
            'Poplin memiliki permukaan lebih halus dan mengkilap, sedangkan Oxford memiliki tekstur lebih bertekstur/berbutir dan tebal. Poplin lebih cocok untuk kesan formal-rapi, Oxford lebih cocok untuk kesan formal-kasual yang lebih tahan lama.',
          ],
        },
      },
      {
        heading: 'Cara Perawatan',
        block: {
          kind: 'list',
          items: [
            'Cuci dengan air dingin hingga hangat',
            'Setrika suhu sedang untuk mempertahankan kilau permukaan',
            'Simpan dengan digantung untuk menjaga bentuk tenunan tetap rapi',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apakah poplin cocok untuk cuaca panas?',
        answer:
          'Cukup cocok, meski sirkulasi udaranya tidak sebaik linen. Poplin masih nyaman untuk cuaca hangat, namun untuk cuaca sangat panas dan lembap, linen atau katun Jepang lebih direkomendasikan.',
      },
      {
        question: 'Apa yang membuat poplin terlihat sedikit mengkilap?',
        answer:
          'Perbedaan ketebalan antara benang lungsin dan benang pakan dalam tenunannya menghasilkan permukaan yang memantulkan cahaya sedikit berbeda, menciptakan kesan kilau ringan yang khas.',
      },
      {
        question: 'Apakah poplin mudah kusut?',
        answer:
          'Tidak semudah linen. Tenunannya yang rapat membuat poplin lebih tahan kusut, meski tetap perlu disetrika untuk tampilan paling rapi pada acara formal.',
      },
    ],
    relatedArticles: [
      { category: 'fabrics', slug: 'oxford' },
      { category: 'fabrics', slug: 'twill' },
    ],
    relatedCategories: ['care', 'styling'],
  },
  {
    slug: 'twill',
    category: 'fabrics',
    eyebrow: 'Panduan Bahan',
    title: 'Twill — Tenunan Diagonal yang Kuat dan Tahan Lama',
    navLabel: 'Twill',
    metaDescription:
      'Twill adalah kain dengan tenunan diagonal yang lebih tebal dan kuat. Karakteristik, kelebihan, kekurangan, dan cara perawatan twill untuk thobe.',
    dek: 'Garis diagonal khas dan struktur tenunan yang lebih kuat — pilihan tepat untuk thobe yang harus tahan pemakaian intensif.',
    definition:
      'Twill adalah kain dengan struktur tenunan diagonal (garis miring yang terlihat pada permukaan kain), dihasilkan dari pola silangan benang yang bergeser satu langkah di setiap barisnya.',
    sections: [
      {
        heading: 'Apa Itu Twill',
        block: {
          kind: 'paragraphs',
          items: [
            'Struktur tenunan diagonal pada twill membuat benang saling mengunci lebih erat dibanding tenunan plain weave, menghasilkan kain yang secara struktural lebih kuat dan lebih tahan terhadap gesekan maupun kerutan.',
          ],
        },
      },
      {
        heading: 'Karakteristik',
        block: {
          kind: 'list',
          items: [
            'Garis diagonal yang terlihat jelas pada permukaan kain',
            'Tekstur lebih tebal dan bertekstur dibanding plain weave',
            'Struktur tenunan lebih kuat dan tahan gesekan',
            'Jatuh dengan drape yang lebih berat dan terstruktur',
          ],
        },
      },
      {
        heading: 'Kelebihan',
        block: {
          kind: 'list',
          items: [
            'Lebih tahan lama dan tahan terhadap keausan dibanding tenunan plain weave',
            'Tahan kusut lebih baik karena struktur tenunannya yang rapat',
            'Tampilan tekstur yang khas memberi kesan lebih premium',
          ],
        },
      },
      {
        heading: 'Kekurangan',
        block: {
          kind: 'list',
          items: [
            'Lebih tebal dan berat, kurang ideal untuk cuaca sangat panas',
            'Harga umumnya sedikit lebih tinggi dibanding plain weave standar',
          ],
        },
      },
      {
        heading: 'Cocok untuk Acara Apa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk thobe yang dipakai intensif atau bepergian, serta acara semi-formal di iklim yang lebih sejuk berkat bobotnya yang lebih tebal dan tahan lama.',
          ],
        },
      },
      {
        heading: 'Cocok untuk Siapa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk mereka yang mengutamakan daya tahan jangka panjang dan sering bepergian, di mana ketahanan terhadap gesekan dan kerutan lebih penting daripada sirkulasi udara maksimal.',
          ],
        },
      },
      {
        heading: 'Perbandingan dengan Premium Polyester',
        block: {
          kind: 'paragraphs',
          items: [
            'Twill adalah tenunan (bisa dari serat alami maupun sintetis) yang unggul dari sisi tekstur dan struktur, sementara premium polyester adalah jenis serat yang unggul dari sisi ketahanan kusut dan kemudahan perawatan. Keduanya sering dipilih untuk alasan daya tahan, namun dari sudut yang berbeda.',
          ],
        },
      },
      {
        heading: 'Cara Perawatan',
        block: {
          kind: 'list',
          items: [
            'Cuci dengan air dingin hingga hangat, siklus normal',
            'Setrika suhu sedang mengikuti arah garis diagonal untuk hasil paling rapi',
            'Gantung dengan hanger berbahu lebar untuk menjaga bentuk',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apa yang membedakan twill dari tenunan lain?',
        answer:
          'Pola tenunan diagonal yang khas — benang saling menyilang dengan pergeseran satu langkah di setiap baris, menghasilkan garis miring yang terlihat pada permukaan kain dan struktur yang lebih kuat.',
      },
      {
        question: 'Apakah twill cocok untuk cuaca panas?',
        answer:
          'Kurang ideal untuk cuaca sangat panas karena bobotnya yang lebih tebal. Untuk iklim panas, linen atau katun Jepang lebih direkomendasikan.',
      },
      {
        question: 'Apakah twill lebih mahal dari plain weave?',
        answer:
          'Umumnya sedikit lebih mahal karena proses tenunnya yang lebih kompleks, namun selisihnya biasanya wajar dibanding manfaat daya tahan yang didapat.',
      },
    ],
    relatedArticles: [
      { category: 'fabrics', slug: 'oxford' },
      { category: 'fabrics', slug: 'premium-polyester' },
    ],
    relatedCategories: ['care', 'styling'],
  },
  {
    slug: 'oxford',
    category: 'fabrics',
    eyebrow: 'Panduan Bahan',
    title: 'Oxford — Tenunan Basket dengan Tekstur Berbutir Khas',
    navLabel: 'Oxford',
    metaDescription:
      'Oxford adalah kain dengan tenunan basket weave bertekstur berbutir, tebal, dan tahan lama. Karakteristik, kelebihan, kekurangan, dan cara perawatannya.',
    dek: 'Tekstur berbutir yang khas dan struktur tenunan basket weave — pilihan populer untuk thobe formal-kasual.',
    definition:
      'Oxford adalah kain katun dengan struktur tenunan basket weave, di mana dua atau lebih benang ditenun bersama menyilang benang lain, menghasilkan tekstur berbutir yang khas dan permukaan yang lebih tebal.',
    sections: [
      {
        heading: 'Apa Itu Oxford',
        block: {
          kind: 'paragraphs',
          items: [
            'Tenunan basket weave pada Oxford menggunakan kelompok benang (bukan benang tunggal) yang saling menyilang, menghasilkan permukaan bertekstur berbutir yang lebih kasar dibanding poplin namun tetap terasa lembut di kulit.',
          ],
        },
      },
      {
        heading: 'Karakteristik',
        block: {
          kind: 'list',
          items: [
            'Tekstur berbutir yang khas dan mudah dikenali',
            'Bobot lebih tebal dibanding poplin maupun plain weave standar',
            'Permukaan matte, tidak mengkilap',
            'Struktur tenunan yang kokoh dan tahan lama',
          ],
        },
      },
      {
        heading: 'Kelebihan',
        block: {
          kind: 'list',
          items: [
            'Sangat tahan lama, cocok untuk pemakaian jangka panjang',
            'Tidak mudah tembus pandang karena tenunannya yang rapat dan tebal',
            'Tekstur yang khas memberi kesan lebih kasual namun tetap rapi',
          ],
        },
      },
      {
        heading: 'Kekurangan',
        block: {
          kind: 'list',
          items: [
            'Bobotnya yang lebih tebal kurang ideal untuk cuaca sangat panas',
            'Kurang cocok untuk acara yang menuntut kesan sangat formal-elegan',
          ],
        },
      },
      {
        heading: 'Cocok untuk Acara Apa',
        block: {
          kind: 'paragraphs',
          items: [
            'Paling cocok untuk thobe formal-kasual — acara kantor sehari-hari, kumpul keluarga, atau aktivitas yang membutuhkan tampilan rapi namun tidak seformal acara resepsi.',
          ],
        },
      },
      {
        heading: 'Cocok untuk Siapa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk mereka yang menginginkan bahan tahan lama dengan tekstur yang khas, dan lebih mengutamakan kenyamanan harian dibanding kesan formal maksimal.',
          ],
        },
      },
      {
        heading: 'Perbandingan dengan Poplin',
        block: {
          kind: 'paragraphs',
          items: [
            'Oxford memiliki tekstur lebih berbutir dan tebal, sementara poplin memiliki permukaan lebih halus dan mengkilap. Oxford lebih tahan lama untuk pemakaian intensif, poplin lebih cocok untuk kesan formal yang lebih rapi.',
          ],
        },
      },
      {
        heading: 'Cara Perawatan',
        block: {
          kind: 'list',
          items: [
            'Cuci dengan air dingin hingga hangat, siklus normal',
            'Setrika suhu sedang hingga tinggi karena teksturnya yang lebih tebal',
            'Tahan lama meski dicuci berulang kali dengan perawatan standar',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apakah Oxford cocok untuk pemakaian sehari-hari?',
        answer:
          'Sangat cocok. Ketahanannya terhadap gesekan dan keausan menjadikan Oxford salah satu pilihan terbaik untuk thobe yang dipakai intensif dalam aktivitas harian.',
      },
      {
        question: 'Apa perbedaan Oxford dengan tenunan basket weave lainnya?',
        answer:
          'Oxford secara spesifik menggunakan kombinasi benang tebal dan tipis dalam pola basket weave-nya, menghasilkan tekstur berbutir yang lebih halus dibanding basket weave kasar pada umumnya.',
      },
      {
        question: 'Apakah Oxford terasa panas dipakai?',
        answer:
          'Sedikit lebih hangat dibanding bahan ringan seperti linen atau katun Jepang karena bobotnya yang lebih tebal, namun masih cukup nyaman untuk iklim tropis dalam aktivitas indoor atau semi-outdoor.',
      },
    ],
    relatedArticles: [
      { category: 'fabrics', slug: 'poplin' },
      { category: 'fabrics', slug: 'twill' },
    ],
    relatedCategories: ['care', 'styling'],
  },
  {
    slug: 'wool-blend',
    category: 'fabrics',
    eyebrow: 'Panduan Bahan',
    title: 'Wool Blend — Kehangatan dan Struktur untuk Acara Formal',
    navLabel: 'Wool Blend',
    metaDescription:
      'Wool blend adalah campuran wool dengan serat lain untuk stabilitas bentuk dan kehangatan. Karakteristik, kelebihan, kekurangan, dan cara perawatannya.',
    dek: 'Struktur jatuh yang terstruktur dan kehangatan yang pas — pilihan premium untuk acara formal malam hari.',
    definition:
      'Wool blend adalah kain campuran serat wool dengan serat lain — umumnya polyester atau katun — untuk menggabungkan kehangatan dan struktur alami wool dengan stabilitas bentuk dan kemudahan perawatan dari serat pendamping.',
    sections: [
      {
        heading: 'Apa Itu Wool Blend',
        block: {
          kind: 'paragraphs',
          items: [
            'Wool murni cenderung berat dan membutuhkan perawatan khusus, sehingga banyak kain formal mencampurnya dengan serat lain dalam proporsi tertentu — menghasilkan wool blend yang tetap membawa karakter wool namun lebih ringan dan lebih mudah dirawat.',
          ],
        },
      },
      {
        heading: 'Karakteristik',
        block: {
          kind: 'list',
          items: [
            'Drape yang terstruktur, jatuh rapi tanpa terlalu kaku',
            'Kehangatan sedang, lebih cocok untuk iklim sejuk atau ruangan ber-AC',
            'Permukaan halus dengan sedikit kilau matte',
            'Bobot medium hingga tebal, tergantung proporsi campurannya',
          ],
        },
      },
      {
        heading: 'Kelebihan',
        block: {
          kind: 'list',
          items: [
            'Kesan formal-elegan yang sulit ditandingi bahan lain',
            'Lebih stabil bentuknya (tidak mudah melar) dibanding wool murni',
            'Tahan kusut cukup baik untuk acara sepanjang hari',
          ],
        },
      },
      {
        heading: 'Kekurangan',
        block: {
          kind: 'list',
          items: [
            'Kurang ideal untuk cuaca panas dan lembap khas tropis',
            'Harga umumnya di segmen premium',
          ],
        },
      },
      {
        heading: 'Cocok untuk Acara Apa',
        block: {
          kind: 'paragraphs',
          items: [
            'Paling cocok untuk acara formal malam hari, resepsi pernikahan, atau acara di ruangan ber-AC — di mana kesan elegan dan terstruktur menjadi prioritas dibanding sirkulasi udara maksimal.',
          ],
        },
      },
      {
        heading: 'Cocok untuk Siapa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk mereka yang menghadiri acara formal secara rutin dan lebih banyak beraktivitas di ruangan ber-AC dibanding di luar ruangan langsung.',
          ],
        },
      },
      {
        heading: 'Perbandingan dengan Premium Cotton',
        block: {
          kind: 'paragraphs',
          items: [
            'Wool blend memberi kesan lebih formal dan terstruktur, sementara premium cotton lebih serbaguna dan nyaman untuk cuaca tropis sehari-hari. Wool blend unggul untuk acara khusus, premium cotton unggul untuk pemakaian harian.',
          ],
        },
      },
      {
        heading: 'Cara Perawatan',
        block: {
          kind: 'list',
          items: [
            'Dry clean direkomendasikan untuk menjaga struktur dan bentuk kain',
            'Jika dicuci di rumah, gunakan siklus lembut dengan air dingin',
            'Simpan dengan digantung, hindari melipat dalam waktu lama',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apakah wool blend cocok untuk iklim tropis?',
        answer:
          'Kurang ideal untuk pemakaian di luar ruangan sepanjang hari karena sifatnya yang lebih hangat, namun tetap nyaman digunakan di ruangan ber-AC untuk acara formal malam hari.',
      },
      {
        question: 'Berapa persen wool biasanya dalam wool blend?',
        answer:
          'Bervariasi tergantung tujuan campurannya, namun umumnya berkisar 30–70% wool dengan sisanya serat pendamping seperti polyester atau katun untuk menyeimbangkan bobot dan kemudahan perawatan.',
      },
      {
        question: 'Apakah wool blend perlu dry clean setiap kali dicuci?',
        answer:
          'Sangat direkomendasikan untuk menjaga struktur dan bentuk kain tetap optimal, meski beberapa wool blend dengan proporsi serat sintetis tinggi bisa dicuci di rumah dengan siklus lembut.',
      },
    ],
    relatedArticles: [
      { category: 'fabrics', slug: 'premium-cotton' },
      { category: 'fabrics', slug: 'twill' },
    ],
    // Sprint W6-7 — Fabric -> Wedding link graph rule: wool blend is the
    // top pick in wedding/akad-pria and wedding/premium-thobe-wedding.
    relatedCategories: ['care', 'styling', 'wedding'],
  },
  {
    slug: 'rayon',
    category: 'fabrics',
    eyebrow: 'Panduan Bahan',
    title: 'Rayon — Bahan Semi-Sintetis dengan Jatuh yang Lembut',
    navLabel: 'Rayon',
    metaDescription:
      'Rayon adalah serat semi-sintetis dari selulosa kayu dengan jatuh lembut mengikuti tubuh. Karakteristik, kelebihan, kekurangan, dan cara perawatannya.',
    dek: 'Jatuh kain yang lembut dan mengikuti bentuk tubuh — pilihan untuk thobe dengan siluet yang lebih cair.',
    definition:
      'Rayon adalah serat semi-sintetis yang diproduksi dari selulosa kayu atau bubur kayu, diproses secara kimiawi menjadi serat tekstil yang menggabungkan sifat menyerap serat alami dengan kilau serat sintetis.',
    sections: [
      {
        heading: 'Apa Itu Rayon',
        block: {
          kind: 'paragraphs',
          items: [
            'Rayon sering disebut sebagai "sutra buatan" karena kilau dan jatuh kainnya yang menyerupai sutra, meski bahan bakunya adalah selulosa kayu, bukan serat protein hewani seperti sutra asli.',
          ],
        },
      },
      {
        heading: 'Karakteristik',
        block: {
          kind: 'list',
          items: [
            'Jatuh kain sangat lembut dan mengikuti bentuk tubuh (fluid drape)',
            'Permukaan dengan kilau halus menyerupai sutra',
            'Breathable, menyerap kelembapan dengan cukup baik',
            'Bobot ringan hingga medium',
          ],
        },
      },
      {
        heading: 'Kelebihan',
        block: {
          kind: 'list',
          items: [
            'Jatuh kain yang elegan dan nyaman di kulit',
            'Harga umumnya lebih terjangkau dibanding sutra asli dengan tampilan yang mendekati',
            'Breathable untuk pemakaian sehari-hari',
          ],
        },
      },
      {
        heading: 'Kekurangan',
        block: {
          kind: 'list',
          items: [
            'Kurang tahan lama dibanding katun atau wool blend — lebih rentan aus',
            'Mudah kusut dan menyusut jika dicuci dengan cara yang tidak tepat',
          ],
        },
      },
      {
        heading: 'Cocok untuk Acara Apa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk acara semi-formal yang menginginkan siluet lebih cair dan elegan, seperti acara malam santai atau kumpul keluarga dengan kesan yang lebih lembut dibanding bahan berstruktur.',
          ],
        },
      },
      {
        heading: 'Cocok untuk Siapa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk mereka yang menyukai siluet thobe yang lebih jatuh dan tidak terlalu terstruktur, serta bersedia memberi perawatan ekstra dibanding bahan yang lebih tahan lama.',
          ],
        },
      },
      {
        heading: 'Perbandingan dengan Poplin',
        block: {
          kind: 'paragraphs',
          items: [
            'Rayon memiliki jatuh kain yang jauh lebih lembut dan cair dibanding poplin yang lebih terstruktur dan kaku. Rayon unggul dari sisi siluet, poplin unggul dari sisi daya tahan dan kemudahan perawatan.',
          ],
        },
      },
      {
        heading: 'Cara Perawatan',
        block: {
          kind: 'list',
          items: [
            'Cuci dengan tangan atau siklus paling lembut pada mesin cuci',
            'Hindari memeras dengan kuat — tekan lembut untuk mengeluarkan air',
            'Setrika suhu rendah, idealnya dalam kondisi masih sedikit lembap',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apakah rayon sama dengan sutra?',
        answer:
          'Tidak. Rayon adalah serat semi-sintetis dari selulosa kayu yang diproses secara kimiawi, sementara sutra adalah serat protein alami dari kepompong ulat sutra. Rayon dibuat untuk menyerupai tampilan dan jatuh sutra dengan harga lebih terjangkau.',
      },
      {
        question: 'Apakah rayon mudah menyusut?',
        answer:
          'Cukup rentan jika dicuci dengan air panas atau pengering suhu tinggi. Disarankan mencuci dengan tangan atau siklus lembut dan air dingin untuk mempertahankan ukuran dan bentuk kain.',
      },
      {
        question: 'Apakah rayon cocok untuk cuaca panas?',
        answer:
          'Cukup cocok karena sifatnya yang breathable, meski tidak sesejuk linen. Rayon lebih dipilih karena kenyamanan jatuh kainnya dibanding sirkulasi udara semata.',
      },
    ],
    relatedArticles: [
      { category: 'fabrics', slug: 'poplin' },
      { category: 'fabrics', slug: 'premium-polyester' },
    ],
    relatedCategories: ['care', 'styling'],
  },
  {
    slug: 'premium-polyester',
    category: 'fabrics',
    eyebrow: 'Panduan Bahan',
    title: 'Premium Polyester — Tahan Kusut dan Mudah Dirawat',
    navLabel: 'Premium Polyester',
    metaDescription:
      'Premium polyester adalah serat sintetis yang sangat tahan kusut dengan warna stabil. Karakteristik, kelebihan, kekurangan, dan cara perawatannya.',
    dek: 'Serat sintetis dengan ketahanan kusut terbaik — pilihan praktis untuk thobe yang harus tetap rapi tanpa perawatan rumit.',
    definition:
      'Premium polyester adalah serat sintetis berkualitas tinggi yang diproses untuk menghasilkan permukaan lebih halus dan jatuh kain lebih baik dibanding polyester standar, dikenal karena ketahanan kusut dan stabilitas warnanya.',
    sections: [
      {
        heading: 'Apa Itu Premium Polyester',
        block: {
          kind: 'paragraphs',
          items: [
            'Polyester dibuat dari serat sintetis berbasis minyak bumi (polyethylene terephthalate). Grade premium menggunakan proses pemintalan dan finishing tambahan yang menghasilkan permukaan lebih halus dan jatuh kain yang lebih baik dibanding polyester grade standar.',
          ],
        },
      },
      {
        heading: 'Karakteristik',
        block: {
          kind: 'list',
          items: [
            'Sangat tahan kusut, mempertahankan bentuk sepanjang hari',
            'Warna sangat stabil, tidak mudah pudar meski sering dicuci',
            'Permukaan halus dengan sedikit kilau sintetis',
            'Cepat kering setelah dicuci',
          ],
        },
      },
      {
        heading: 'Kelebihan',
        block: {
          kind: 'list',
          items: [
            'Perawatan paling praktis di antara semua bahan — minim setrika',
            'Tahan lama dan tidak mudah aus',
            'Harga umumnya lebih terjangkau dibanding serat alami premium',
          ],
        },
      },
      {
        heading: 'Kekurangan',
        block: {
          kind: 'list',
          items: [
            'Sirkulasi udara lebih rendah dibanding serat alami',
            'Kurang menyerap keringat, bisa terasa kurang nyaman di cuaca sangat panas',
          ],
        },
      },
      {
        heading: 'Cocok untuk Acara Apa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk thobe yang sering dibawa bepergian atau dipakai dalam jadwal padat — ketahanan kusutnya membuat thobe tetap terlihat rapi meski dipakai seharian tanpa sempat disetrika ulang.',
          ],
        },
      },
      {
        heading: 'Cocok untuk Siapa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk mereka dengan jadwal padat atau sering bepergian, yang mengutamakan kepraktisan perawatan dibanding sirkulasi udara maksimal.',
          ],
        },
      },
      {
        heading: 'Perbandingan dengan Premium Cotton',
        block: {
          kind: 'paragraphs',
          items: [
            'Premium polyester unggul dari sisi kepraktisan perawatan dan ketahanan kusut, sementara premium cotton unggul dari sisi sirkulasi udara dan kenyamanan alami di kulit. Pilihan tergantung prioritas: kepraktisan vs kenyamanan alami.',
          ],
        },
      },
      {
        heading: 'Cara Perawatan',
        block: {
          kind: 'list',
          items: [
            'Cuci dengan air dingin hingga hangat, siklus normal',
            'Jarang perlu disetrika — gantung segera setelah dicuci untuk hasil terbaik',
            'Hindari suhu pengering terlalu tinggi untuk mencegah kerusakan serat',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apakah premium polyester nyaman dipakai di iklim tropis?',
        answer:
          'Cukup nyaman untuk aktivitas indoor atau ruangan ber-AC, namun sirkulasi udaranya lebih rendah dibanding serat alami sehingga kurang ideal untuk aktivitas luar ruangan yang intensif di cuaca panas.',
      },
      {
        question: 'Apa bedanya premium polyester dengan polyester biasa?',
        answer:
          'Premium polyester melalui proses pemintalan dan finishing tambahan yang menghasilkan permukaan lebih halus dan jatuh kain lebih baik, berbeda dari polyester standar yang teksturnya cenderung lebih kaku dan terasa sintetis.',
      },
      {
        question: 'Apakah polyester premium mudah luntur warnanya?',
        answer:
          'Tidak. Salah satu kelebihan utama polyester adalah stabilitas warna — serat sintetis ini menyerap dan mempertahankan pewarna dengan sangat baik, jarang pudar signifikan meski dicuci berulang kali.',
      },
    ],
    relatedArticles: [
      { category: 'fabrics', slug: 'twill' },
      { category: 'fabrics', slug: 'premium-cotton' },
    ],
    relatedCategories: ['care', 'styling'],
  },
  {
    slug: 'premium-cotton',
    category: 'fabrics',
    eyebrow: 'Panduan Bahan',
    title: 'Premium Cotton — Keseimbangan Kenyamanan dan Daya Tahan',
    navLabel: 'Premium Cotton',
    metaDescription:
      'Premium cotton adalah katun kualitas tinggi dengan serat lebih panjang dan tenunan lebih rapat. Karakteristik, kelebihan, kekurangan, dan cara perawatannya.',
    dek: 'Bahan serbaguna yang menyeimbangkan kenyamanan sehari-hari dengan daya tahan jangka panjang.',
    definition:
      'Premium cotton adalah kategori katun kualitas tinggi dengan serat yang lebih panjang dan tenunan yang lebih rapat dibanding katun standar, menghasilkan keseimbangan antara kelembutan, daya tahan, dan sirkulasi udara.',
    sections: [
      {
        heading: 'Apa Itu Premium Cotton',
        block: {
          kind: 'paragraphs',
          items: [
            'Premium cotton bukan merujuk pada satu jenis serat tunggal, melainkan kategori katun dengan grade serat lebih panjang dan proses tenun lebih rapat dibanding katun standar pasar massal — menghasilkan kain yang lebih halus, lebih kuat, dan lebih tahan lama.',
          ],
        },
      },
      {
        heading: 'Karakteristik',
        block: {
          kind: 'list',
          items: [
            'Permukaan halus dengan sedikit tekstur alami katun',
            'Sirkulasi udara baik, cocok untuk iklim tropis',
            'Tenunan rapat namun tetap breathable',
            'Bobot ringan hingga medium, serbaguna untuk berbagai acara',
          ],
        },
      },
      {
        heading: 'Kelebihan',
        block: {
          kind: 'list',
          items: [
            'Keseimbangan terbaik antara kenyamanan, daya tahan, dan sirkulasi udara',
            'Cocok untuk hampir semua acara — dari harian hingga semi-formal',
            'Perawatan relatif mudah dibanding bahan premium lain seperti wool blend',
          ],
        },
      },
      {
        heading: 'Kekurangan',
        block: {
          kind: 'list',
          items: [
            'Tetap bisa kusut meski lebih tahan dibanding linen',
            'Harga di atas katun standar, meski di bawah katun Mesir atau Jepang',
          ],
        },
      },
      {
        heading: 'Cocok untuk Acara Apa',
        block: {
          kind: 'paragraphs',
          items: [
            'Salah satu bahan paling serbaguna — cocok untuk thobe harian, acara kantor, kumpul keluarga, hingga acara semi-formal, berkat keseimbangannya antara kenyamanan dan tampilan rapi.',
          ],
        },
      },
      {
        heading: 'Cocok untuk Siapa',
        block: {
          kind: 'paragraphs',
          items: [
            'Cocok untuk hampir semua orang yang menginginkan satu bahan andalan yang bisa dipakai di berbagai acara tanpa harus memilih bahan berbeda untuk setiap kesempatan.',
          ],
        },
      },
      {
        heading: 'Perbandingan dengan Egyptian Cotton',
        block: {
          kind: 'paragraphs',
          items: [
            'Premium cotton menawarkan keseimbangan harga dan kualitas yang lebih terjangkau, sementara katun Mesir menonjol di kelembutan serat ekstra dengan harga yang lebih premium. Premium cotton cocok sebagai pilihan andalan serbaguna, katun Mesir untuk momen yang menuntut kualitas maksimal.',
          ],
        },
      },
      {
        heading: 'Cara Perawatan',
        block: {
          kind: 'list',
          items: [
            'Cuci dengan air dingin hingga hangat, siklus normal',
            'Setrika suhu sedang untuk hasil paling rapi',
            'Tahan lama dengan perawatan standar, tidak memerlukan penanganan khusus',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apa yang membuat katun disebut "premium"?',
        answer:
          'Kombinasi panjang serat, kerapatan tenunan, dan proses finishing yang lebih baik dibanding katun standar pasar massal — menghasilkan kain yang lebih halus, lebih kuat, dan lebih tahan lama.',
      },
      {
        question: 'Apakah premium cotton cocok untuk semua acara?',
        answer:
          'Sangat serbaguna — cocok untuk thobe harian, kantor, kumpul keluarga, hingga acara semi-formal. Untuk acara sangat formal seperti resepsi malam, wool blend biasanya masih lebih dipilih.',
      },
      {
        question: 'Apakah premium cotton lebih baik dari katun Jepang atau Mesir?',
        answer:
          'Bukan lebih baik, melainkan berbeda tujuan. Katun Jepang dan Mesir menonjol di aspek spesifik (proses produksi dan panjang serat), sementara premium cotton menawarkan keseimbangan serbaguna dengan harga yang lebih terjangkau.',
      },
    ],
    relatedArticles: [
      { category: 'fabrics', slug: 'egyptian-cotton' },
      { category: 'fabrics', slug: 'wool-blend' },
    ],
    relatedCategories: ['care', 'styling'],
  },
]
