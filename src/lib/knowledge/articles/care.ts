import type { KnowledgeArticle } from '../types'

// Sprint W6-6 — Care & Maintenance Authority. 8 practical care guides.
// Care instructions here are general, well-established fabric-care
// knowledge (matches the per-fabric "Cara Perawatan" sections in
// fabrics.ts) — this cluster goes deeper per-topic rather than duplicating
// those summaries verbatim.
export const CARE_ARTICLES: KnowledgeArticle[] = [
  {
    slug: 'wash-linen',
    category: 'care',
    eyebrow: 'Panduan Perawatan',
    title: 'Cara Mencuci Linen dengan Benar',
    navLabel: 'Cara Mencuci Linen',
    metaDescription:
      'Panduan lengkap mencuci thobe berbahan linen — suhu air, siklus cuci, dan cara menjaga tekstur alami linen tetap awet.',
    dek: 'Linen butuh perlakuan berbeda dari bahan lain — panduan mencucinya agar tekstur dan warna tetap awet.',
    definition:
      'Mencuci linen dengan benar berarti menggunakan air dingin hingga hangat dengan siklus normal, menghindari pemutih, dan mengeringkan dengan cara yang tepat untuk menjaga serat alami linen tetap kuat tanpa merusak teksturnya yang khas.',
    quickAnswer:
      'Linen sebaiknya dicuci dengan air dingin hingga hangat pada siklus normal, tanpa pemutih, dan dikeringkan dengan cara digantung alih-alih menggunakan mesin pengering suhu tinggi yang bisa merusak serat dan menyusutkan kain.',
    keyTakeaways: [
      'Gunakan air dingin hingga hangat, hindari air panas yang bisa menyusutkan serat linen',
      'Hindari pemutih karena bisa melemahkan struktur serat alami linen',
      'Keringkan dengan cara digantung, bukan mesin pengering suhu tinggi',
      'Setrika saat kain masih sedikit lembap untuk hasil paling rapi',
      'Linen justru semakin lembut setelah dicuci berulang kali dengan cara yang benar',
    ],
    sections: [
      {
        heading: 'Kenapa Linen Butuh Perlakuan Khusus',
        block: {
          kind: 'paragraphs',
          items: [
            'Serat linen berasal dari batang tanaman flax dan memiliki struktur yang berbeda dari serat katun — lebih kaku secara alami namun juga lebih rentan melemah jika terkena panas berlebih atau bahan kimia keras seperti pemutih. Memahami karakteristik ini membantu Anda mencuci linen dengan cara yang justru memperpanjang usia pakainya, bukan mempercepat kerusakan.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Mencuci Linen',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Suhu Air dan Siklus Cuci',
            block: {
              kind: 'paragraphs',
              items: [
                'Gunakan air dingin hingga hangat (tidak lebih dari 40°C) dengan siklus normal mesin cuci. Air panas berisiko menyusutkan serat linen dan mempercepat pemudaran warna, terutama untuk linen berwarna gelap.',
              ],
            },
          },
          {
            heading: 'Deterjen dan Bahan Kimia',
            block: {
              kind: 'paragraphs',
              items: [
                'Gunakan deterjen lembut tanpa pemutih. Pemutih berbasis klorin bisa melemahkan struktur serat linen dalam jangka panjang, membuat kain lebih mudah sobek meski secara visual masih terlihat baik.',
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
            'Setrika linen saat kain masih sedikit lembap, bukan setelah benar-benar kering — ini jauh lebih efektif menghilangkan kerutan dibanding menyetrika kain yang sudah kering sepenuhnya, dan mengurangi risiko merusak serat akibat panas setrika yang berlebihan pada kain kering.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum Mencuci Linen',
        block: {
          kind: 'list',
          items: [
            'Mencuci dengan air panas yang berisiko menyusutkan kain',
            'Menggunakan pemutih yang melemahkan serat dalam jangka panjang',
            'Mengeringkan dengan mesin pengering suhu tinggi alih-alih digantung',
            'Menyetrika kain yang sudah benar-benar kering, membutuhkan panas lebih tinggi dan berisiko merusak serat',
          ],
        },
      },
    ],
    expertNote:
      'Linen adalah salah satu bahan yang justru membaik seiring waktu jika dirawat dengan benar — semakin sering dicuci dengan cara yang tepat, teksturnya semakin lembut, bukan semakin rusak seperti kebanyakan bahan lain.',
    comparisonTable: {
      caption: 'Perbandingan cara mencuci yang benar vs berisiko untuk linen',
      headers: ['Aspek', 'Cara yang Tepat', 'Cara yang Berisiko'],
      rows: [
        ['Suhu air', 'Dingin hingga hangat (≤40°C)', 'Air panas'],
        ['Bahan kimia', 'Deterjen lembut, tanpa pemutih', 'Pemutih berbasis klorin'],
        ['Pengeringan', 'Digantung alami', 'Mesin pengering suhu tinggi'],
      ],
    },
    faq: [
      {
        question: 'Apakah linen boleh dicuci dengan mesin cuci?',
        answer: 'Boleh, dengan siklus normal dan air dingin hingga hangat — hindari siklus intensif yang bisa merusak serat.',
      },
      {
        question: 'Kenapa linen tidak boleh dicuci dengan pemutih?',
        answer: 'Pemutih berbasis klorin melemahkan struktur serat alami linen dalam jangka panjang, membuat kain lebih rentan sobek meski secara visual masih terlihat baik.',
      },
      {
        question: 'Apakah linen menyusut setelah dicuci?',
        answer: 'Bisa, terutama jika dicuci dengan air panas atau dikeringkan dengan mesin pengering suhu tinggi — gunakan air dingin hingga hangat dan keringkan dengan digantung untuk meminimalkan risiko ini.',
      },
    ],
    relatedArticles: [
      { category: 'care', slug: 'remove-wrinkles' },
      { category: 'care', slug: 'dry-clean-vs-hand-wash' },
      { category: 'fabrics', slug: 'linen' },
    ],
    relatedFabrics: [{ category: 'fabrics', slug: 'linen' }],
    relatedCategories: ['fabrics'],
    tags: { service: ['care'] },
  },
  {
    slug: 'iron-thobe',
    category: 'care',
    eyebrow: 'Panduan Perawatan',
    title: 'Cara Menyetrika Thobe dengan Benar',
    navLabel: 'Cara Menyetrika Thobe',
    metaDescription:
      'Panduan menyetrika thobe dengan benar — suhu setrika per jenis bahan, teknik menyetrika kerah dan lengan, tanpa merusak kain.',
    dek: 'Suhu setrika yang salah bisa merusak bahan premium dalam hitungan detik — panduan menyetrika yang aman untuk setiap jenis kain.',
    definition:
      'Menyetrika thobe dengan benar berarti menyesuaikan suhu setrika dengan jenis bahan, mengikuti urutan area tertentu (kerah, lengan, badan), dan menggunakan teknik yang tepat untuk menghindari kerusakan pada serat maupun kilau alami kain.',
    quickAnswer:
      'Suhu setrika thobe harus disesuaikan jenis bahannya — suhu rendah untuk rayon dan bahan sintetis, suhu sedang untuk katun dan poplin, dan suhu lebih tinggi untuk linen dan oxford, selalu dimulai dari kerah dan manset sebelum bagian badan.',
    keyTakeaways: [
      'Suhu setrika harus disesuaikan jenis bahan, bukan satu suhu untuk semua',
      'Mulai menyetrika dari kerah dan manset sebelum bagian badan yang lebih luas',
      'Gunakan uap untuk bahan yang lebih tebal seperti wool blend dan oxford',
      'Setrika bagian dalam untuk bahan dengan warna gelap agar kilau tidak pudar',
      'Biarkan thobe sedikit dingin sebelum digantung setelah disetrika agar bentuk lebih tahan lama',
    ],
    sections: [
      {
        heading: 'Kenapa Suhu Setrika Harus Disesuaikan Bahan',
        block: {
          kind: 'paragraphs',
          items: [
            'Setiap jenis serat memiliki titik ketahanan panas yang berbeda — bahan sintetis seperti premium polyester bisa meleleh atau mengkilap tidak wajar pada suhu tinggi, sementara linen justru membutuhkan suhu lebih tinggi untuk menghilangkan kerutannya yang keras. Menyetrika dengan suhu yang salah bisa merusak bahan secara permanen hanya dalam hitungan detik.',
          ],
        },
      },
      {
        heading: 'Panduan Suhu per Jenis Bahan',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Suhu Rendah',
            block: {
              kind: 'list',
              items: [
                'Rayon — sangat sensitif terhadap panas, gunakan suhu rendah dan hindari tekanan berlebih',
                'Premium polyester — suhu rendah hingga sedang, hindari kontak langsung terlalu lama',
              ],
            },
          },
          {
            heading: 'Suhu Sedang hingga Tinggi',
            block: {
              kind: 'list',
              items: [
                'Katun dan poplin — suhu sedang, bisa menggunakan sedikit uap untuk hasil lebih rapi',
                'Linen dan oxford — suhu lebih tinggi, idealnya saat kain masih sedikit lembap',
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
            'Selalu mulai dari kerah dan manset — dua area terkecil namun paling terlihat — sebelum berpindah ke bagian badan yang lebih luas. Urutan ini memastikan area paling penting mendapat perhatian paling teliti saat setrika masih dalam kondisi suhu paling stabil.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum Menyetrika Thobe',
        block: {
          kind: 'list',
          items: [
            'Menggunakan satu suhu setrika untuk semua jenis bahan',
            'Menyetrika langsung di permukaan luar bahan berwarna gelap, berisiko membuat kain mengkilap tidak wajar',
            'Tidak membiarkan thobe sedikit dingin sebelum digantung, membuat kerutan baru terbentuk lebih cepat',
            'Terlalu lama menahan setrika di satu titik, terutama pada bahan sensitif seperti rayon',
          ],
        },
      },
    ],
    expertNote:
      'Untuk bahan berwarna gelap seperti navy atau hitam, kami selalu menyarankan menyetrika dari bagian dalam kain, atau menggunakan kain pelapis tipis di atasnya — ini mencegah kilau tidak wajar yang sering muncul akibat kontak langsung setrika panas dengan permukaan kain gelap.',
    faq: [
      {
        question: 'Apakah semua thobe bisa disetrika dengan suhu yang sama?',
        answer: 'Tidak. Suhu setrika harus disesuaikan jenis bahannya — bahan sintetis seperti rayon membutuhkan suhu jauh lebih rendah dibanding linen.',
      },
      {
        question: 'Kenapa kain berwarna gelap sebaiknya disetrika dari bagian dalam?',
        answer: 'Untuk mencegah kilau tidak wajar yang bisa muncul akibat kontak langsung setrika panas dengan permukaan kain gelap.',
      },
      {
        question: 'Bagian mana yang sebaiknya disetrika lebih dulu?',
        answer: 'Kerah dan manset, karena keduanya adalah area terkecil namun paling terlihat, sebelum berpindah ke bagian badan yang lebih luas.',
      },
    ],
    relatedArticles: [
      { category: 'care', slug: 'remove-wrinkles' },
      { category: 'care', slug: 'wash-linen' },
      { category: 'tailoring', slug: 'collar-construction' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'linen' },
      { category: 'fabrics', slug: 'oxford' },
    ],
    relatedCategories: ['fabrics'],
    tags: { service: ['care'] },
  },
  {
    slug: 'store-premium-garments',
    category: 'care',
    eyebrow: 'Panduan Perawatan',
    title: 'Cara Menyimpan Thobe Premium dengan Benar',
    navLabel: 'Cara Menyimpan Thobe',
    metaDescription:
      'Panduan menyimpan thobe premium — jenis hanger yang tepat, kondisi lemari ideal, dan cara mencegah kerusakan jangka panjang.',
    dek: 'Cara penyimpanan yang salah bisa merusak thobe premium bahkan tanpa pernah dipakai — panduan lengkapnya.',
    definition:
      'Menyimpan thobe premium dengan benar berarti menggunakan hanger yang tepat, menjaga kondisi lemari bebas kelembapan berlebih, dan memberi ruang yang cukup antar pakaian agar bentuk dan tekstur kain tidak rusak selama periode tidak dipakai.',
    quickAnswer:
      'Thobe premium sebaiknya disimpan menggunakan hanger berbahu lebar (bukan hanger kawat tipis), di lemari dengan sirkulasi udara baik dan bebas kelembapan berlebih, dengan jarak cukup antar pakaian agar kain tidak tertekan atau kusut.',
    keyTakeaways: [
      'Gunakan hanger berbahu lebar, bukan hanger kawat tipis yang bisa merusak bentuk bahu',
      'Jaga lemari tetap bebas kelembapan berlebih untuk mencegah jamur dan bau apek',
      'Beri jarak cukup antar pakaian agar kain tidak tertekan',
      'Simpan thobe yang jarang dipakai dalam kantong kain bernapas, bukan plastik tertutup rapat',
      'Rotasi posisi thobe sesekali jika disimpan dalam waktu sangat lama',
    ],
    sections: [
      {
        heading: 'Kenapa Penyimpanan Memengaruhi Usia Pakai Thobe',
        block: {
          kind: 'paragraphs',
          items: [
            'Thobe yang disimpan dengan cara salah bisa mengalami kerusakan bahkan saat tidak pernah dipakai — hanger yang tidak tepat merusak bentuk bahu, kelembapan berlebih memicu jamur dan bau apek, dan tekanan dari pakaian lain yang terlalu padat bisa membuat kerutan permanen pada kain premium.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Penyimpanan',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Memilih Hanger yang Tepat',
            block: {
              kind: 'paragraphs',
              items: [
                'Hanger berbahu lebar dan sedikit melengkung mengikuti bentuk bahu manusia adalah pilihan terbaik — hanger kawat tipis cenderung membuat lekukan permanen di area bahu, terutama untuk bahan yang lebih berat seperti wool blend.',
              ],
            },
          },
          {
            heading: 'Mengelola Kondisi Lemari',
            block: {
              kind: 'paragraphs',
              items: [
                'Pastikan lemari memiliki sirkulasi udara yang baik dan bebas dari kelembapan berlebih — silica gel atau pengering udara kecil bisa membantu di daerah dengan kelembapan tinggi, mencegah pertumbuhan jamur pada kain premium.',
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
            'Untuk thobe yang jarang dipakai dalam waktu lama, gunakan kantong kain yang bisa "bernapas" alih-alih plastik tertutup rapat — plastik justru menjebak kelembapan di dalamnya, menciptakan kondisi ideal bagi jamur untuk tumbuh pada kain premium.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum Menyimpan Thobe',
        block: {
          kind: 'list',
          items: [
            'Menggunakan hanger kawat tipis yang merusak bentuk bahu',
            'Menyimpan thobe dalam kantong plastik tertutup rapat yang menjebak kelembapan',
            'Menumpuk terlalu banyak pakaian dalam satu ruang lemari yang sempit',
            'Tidak memeriksa kondisi lemari secara berkala, terutama di daerah beriklim lembap',
          ],
        },
      },
    ],
    expertNote:
      'Investasi kecil pada hanger berkualitas sering diremehkan, padahal ini adalah salah satu faktor paling murah namun berdampak besar dalam menjaga bentuk thobe premium tetap sempurna selama bertahun-tahun.',
    faq: [
      {
        question: 'Apakah hanger kawat aman untuk thobe premium?',
        answer: 'Kurang direkomendasikan karena cenderung membuat lekukan permanen di area bahu — hanger berbahu lebar jauh lebih aman untuk kain premium.',
      },
      {
        question: 'Apakah thobe boleh disimpan dalam kantong plastik?',
        answer: 'Sebaiknya dihindari untuk penyimpanan jangka panjang karena plastik menjebak kelembapan — gunakan kantong kain yang bisa bernapas sebagai alternatif.',
      },
      {
        question: 'Bagaimana cara mencegah jamur pada thobe yang disimpan lama?',
        answer: 'Pastikan lemari memiliki sirkulasi udara baik dan bebas kelembapan berlebih, bisa dibantu dengan silica gel di daerah beriklim lembap.',
      },
    ],
    relatedArticles: [
      { category: 'care', slug: 'extend-garment-life' },
      { category: 'care', slug: 'wool-blend-care' },
      { category: 'wedding', slug: 'premium-thobe-wedding' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'wool-blend' },
      { category: 'fabrics', slug: 'egyptian-cotton' },
    ],
    relatedCategories: ['fabrics'],
    tags: { service: ['care'] },
  },
  {
    slug: 'remove-wrinkles',
    category: 'care',
    eyebrow: 'Panduan Perawatan',
    title: 'Cara Menghilangkan Kerutan Thobe Tanpa Setrika',
    navLabel: 'Menghilangkan Kerutan',
    metaDescription:
      'Panduan menghilangkan kerutan thobe tanpa setrika — teknik uap kamar mandi, semprotan air, dan cara darurat saat bepergian.',
    dek: 'Tidak selalu ada setrika di tangan — panduan alternatif menghilangkan kerutan dengan cara praktis.',
    definition:
      'Menghilangkan kerutan tanpa setrika adalah teknik alternatif memanfaatkan uap air, gravitasi, atau tekanan ringan untuk merapikan kain yang kusut, berguna terutama saat bepergian atau dalam situasi mendesak tanpa akses setrika.',
    quickAnswer:
      'Kerutan thobe bisa dihilangkan tanpa setrika dengan menggantungnya di kamar mandi saat mandi air panas (uap alami merilekskan serat kain), menyemprotkan air tipis lalu meregangkan kain dengan tangan, atau menggunakan steamer genggam jika tersedia.',
    keyTakeaways: [
      'Uap dari kamar mandi air panas adalah cara paling praktis tanpa alat khusus',
      'Semprotan air tipis dikombinasikan dengan meregangkan kain juga cukup efektif',
      'Steamer genggam adalah investasi praktis untuk yang sering bepergian',
      'Teknik ini paling efektif untuk kerutan ringan, bukan kerutan yang sudah mengeras lama',
      'Gantung thobe segera setelah dipakai untuk mencegah kerutan menjadi permanen',
    ],
    sections: [
      {
        heading: 'Kapan Teknik Tanpa Setrika Berguna',
        block: {
          kind: 'paragraphs',
          items: [
            'Situasi seperti bepergian, menginap di hotel tanpa setrika, atau keadaan mendesak sebelum acara sering membuat setrika tidak tersedia. Beberapa teknik alternatif bisa cukup efektif menghilangkan kerutan ringan tanpa memerlukan alat khusus, meski tidak akan serapi hasil setrika penuh.',
          ],
        },
      },
      {
        heading: 'Teknik Praktis Menghilangkan Kerutan',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Teknik Uap Kamar Mandi',
            block: {
              kind: 'paragraphs',
              items: [
                'Gantung thobe di kamar mandi saat mandi air panas selama 10–15 menit — uap air akan meresap ke serat kain dan membantu merilekskan kerutan, terutama efektif untuk bahan seperti katun dan poplin.',
              ],
            },
          },
          {
            heading: 'Teknik Semprotan Air',
            block: {
              kind: 'paragraphs',
              items: [
                'Semprotkan sedikit air ke area yang kusut, lalu regangkan kain dengan tangan sambil menariknya perlahan ke berbagai arah. Biarkan kering secara alami sambil digantung.',
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
            'Jika sering bepergian, pertimbangkan membawa steamer genggam portable — ukurannya kecil, mudah dibawa dalam koper, dan hasilnya jauh lebih baik dibanding teknik uap kamar mandi untuk kerutan yang lebih signifikan.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Menyemprotkan terlalu banyak air sehingga kain menjadi basah kuyup, bukan hanya lembap',
            'Mengharapkan hasil sempurna dari teknik tanpa setrika untuk kerutan yang sudah mengeras lama',
            'Tidak menggantung thobe segera setelah dipakai, membiarkan kerutan menjadi lebih sulit dihilangkan',
            'Menggunakan air panas berlebih pada teknik semprotan yang bisa merusak bahan sensitif seperti rayon',
          ],
        },
      },
    ],
    expertNote:
      'Pencegahan selalu lebih mudah dari perbaikan — menggantung thobe segera setelah dilepas, bukan menumpuknya di kursi atau lantai, adalah kebiasaan sederhana yang paling efektif mengurangi kerutan sejak awal.',
    faq: [
      {
        question: 'Apakah teknik uap kamar mandi benar-benar efektif menghilangkan kerutan?',
        answer: 'Efektif untuk kerutan ringan hingga sedang, meski tidak akan serapi hasil setrika penuh untuk kerutan yang sudah mengeras.',
      },
      {
        question: 'Apakah steamer genggam layak diinvestasikan?',
        answer: 'Sangat layak jika Anda sering bepergian — ukurannya kecil, praktis dibawa, dan hasilnya jauh lebih baik dibanding teknik uap kamar mandi.',
      },
      {
        question: 'Bagaimana mencegah kerutan sejak awal?',
        answer: 'Gantung thobe segera setelah dilepas, hindari menumpuknya di kursi atau lantai yang justru mempercepat kerutan menjadi permanen.',
      },
    ],
    relatedArticles: [
      { category: 'care', slug: 'iron-thobe' },
      { category: 'umrah', slug: 'packing-guide' },
      { category: 'umrah', slug: 'care-during-travel' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'linen' },
      { category: 'fabrics', slug: 'rayon' },
    ],
    relatedCategories: ['umrah'],
    tags: { service: ['care'] },
  },
  {
    slug: 'maintain-white-thobe',
    category: 'care',
    eyebrow: 'Panduan Perawatan',
    title: 'Cara Merawat Thobe Putih agar Tetap Cerah',
    navLabel: 'Merawat Thobe Putih',
    metaDescription:
      'Panduan merawat thobe putih agar tetap cerah dan tidak menguning — teknik mencuci, menghilangkan noda, dan penyimpanan yang tepat.',
    dek: 'Thobe putih paling rentan terlihat kusam — panduan menjaganya tetap cerah lebih lama.',
    definition:
      'Merawat thobe putih agar tetap cerah berarti mencuci secara terpisah dari pakaian berwarna, menangani noda segera setelah muncul, dan menghindari faktor yang mempercepat penguningan alami seperti paparan sinar matahari langsung berlebih.',
    quickAnswer:
      'Thobe putih paling efektif dijaga tetap cerah dengan mencucinya terpisah dari pakaian berwarna, menangani noda sesegera mungkin sebelum mengering, dan menjemurnya di tempat teduh dengan sirkulasi udara baik alih-alih terkena sinar matahari langsung berlebihan.',
    keyTakeaways: [
      'Cuci terpisah dari pakaian berwarna untuk mencegah transfer warna',
      'Tangani noda sesegera mungkin sebelum mengering dan menempel permanen',
      'Sinar matahari langsung berlebih justru bisa mempercepat penguningan, bukan mencerahkan',
      'Gunakan pemutih non-klorin sesekali, bukan pemutih klorin yang bisa merusak serat',
      'Simpan terpisah dari pakaian berwarna gelap untuk mencegah transfer warna saat penyimpanan',
    ],
    sections: [
      {
        heading: 'Kenapa Thobe Putih Butuh Perawatan Khusus',
        block: {
          kind: 'paragraphs',
          items: [
            'Warna putih tidak menyembunyikan apapun — noda, debu, bahkan penguningan alami akibat waktu semuanya terlihat jelas. Perawatan yang tepat sejak awal jauh lebih efektif dibanding berusaha memutihkan kembali thobe yang sudah menguning parah.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Merawat Thobe Putih',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Mencuci Terpisah',
            block: {
              kind: 'paragraphs',
              items: [
                'Selalu cuci thobe putih terpisah dari pakaian berwarna, bahkan warna terang sekalipun — transfer warna kecil yang tidak terlihat langsung bisa terakumulasi seiring waktu dan membuat putih terlihat kusam.',
              ],
            },
          },
          {
            heading: 'Menangani Noda',
            block: {
              kind: 'paragraphs',
              items: [
                'Noda pada kain putih jauh lebih mudah dihilangkan sebelum mengering — rendam area yang terkena noda sesegera mungkin, jangan menunggu hingga tiba di rumah jika noda muncul saat bepergian.',
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
            'Kontra-intuitif, menjemur thobe putih di bawah sinar matahari langsung berlebihan sebenarnya bisa mempercepat penguningan pada beberapa jenis serat, bukan mencerahkan seperti anggapan umum. Jemur di tempat teduh dengan sirkulasi udara baik untuk hasil yang lebih konsisten.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum Merawat Thobe Putih',
        block: {
          kind: 'list',
          items: [
            'Mencuci bersamaan dengan pakaian berwarna, meski warna terang sekalipun',
            'Membiarkan noda mengering sebelum ditangani',
            'Terlalu sering menggunakan pemutih klorin yang justru melemahkan serat dalam jangka panjang',
            'Menjemur di bawah sinar matahari langsung berlebihan dengan asumsi akan membuat lebih putih',
          ],
        },
      },
    ],
    expertNote:
      'Untuk thobe putih yang mulai terlihat kusam meski dirawat dengan baik, kami menyarankan konsultasi dengan layanan dry clean profesional alih-alih mencoba berbagai produk pemutih rumahan — beberapa jenis kusam sudah tidak bisa diperbaiki dengan pencucian rumahan biasa.',
    faq: [
      {
        question: 'Kenapa thobe putih saya menguning meski jarang dipakai?',
        answer: 'Penguningan bisa terjadi akibat paparan cahaya, kelembapan penyimpanan, atau residu deterjen yang menumpuk — bukan hanya dari pemakaian aktif.',
      },
      {
        question: 'Apakah pemutih aman digunakan untuk thobe putih?',
        answer: 'Pemutih non-klorin lebih aman digunakan sesekali, sementara pemutih klorin sebaiknya dihindari karena bisa melemahkan serat kain dalam jangka panjang.',
      },
      {
        question: 'Apakah menjemur di bawah sinar matahari langsung membantu thobe putih tetap cerah?',
        answer: 'Tidak selalu — pada beberapa jenis serat, paparan sinar matahari langsung berlebihan justru bisa mempercepat penguningan alih-alih mencerahkan.',
      },
    ],
    relatedArticles: [
      { category: 'care', slug: 'wash-linen' },
      { category: 'styling', slug: 'white-thobe' },
      { category: 'umrah', slug: 'color-guide' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'japanese-cotton' },
      { category: 'fabrics', slug: 'linen' },
    ],
    relatedCategories: ['styling'],
    tags: { service: ['care'] },
  },
  {
    slug: 'wool-blend-care',
    category: 'care',
    eyebrow: 'Panduan Perawatan',
    title: 'Cara Merawat Thobe Berbahan Wool Blend',
    navLabel: 'Merawat Wool Blend',
    metaDescription:
      'Panduan merawat thobe berbahan wool blend — kapan harus dry clean, cara menyimpan, dan tips menjaga struktur kain tetap terjaga.',
    dek: 'Wool blend membutuhkan perawatan lebih hati-hati dibanding katun — panduan menjaga struktur dan kehangatannya.',
    definition:
      'Merawat thobe wool blend berarti memprioritaskan dry clean untuk menjaga struktur kain, menghindari pencucian rumahan yang agresif, dan menyimpan dengan cara yang mencegah kain kehilangan bentuk atau tertekan oleh pakaian lain.',
    quickAnswer:
      'Thobe wool blend paling aman dirawat dengan dry clean profesional untuk menjaga struktur dan bentuknya, atau jika dicuci di rumah, gunakan siklus paling lembut dengan air dingin dan hindari memeras atau memutar kain secara agresif.',
    keyTakeaways: [
      'Dry clean adalah metode paling aman untuk menjaga struktur wool blend',
      'Jika dicuci di rumah, gunakan siklus paling lembut dan air dingin',
      'Hindari memeras atau memutar kain secara agresif setelah dicuci',
      'Simpan dengan digantung, hindari melipat dalam waktu lama yang bisa merusak bentuk',
      'Beri jarak dari pemakaian panas berlebih seperti setrika suhu tinggi langsung ke permukaan',
    ],
    sections: [
      {
        heading: 'Kenapa Wool Blend Butuh Perawatan Lebih Hati-hati',
        block: {
          kind: 'paragraphs',
          items: [
            'Kandungan wool dalam kain memberi struktur dan kehangatan khasnya, namun serat wool juga lebih sensitif terhadap air panas, gesekan berlebih, dan penanganan kasar dibanding serat katun. Perawatan yang salah bisa membuat kain menyusut, kehilangan struktur, atau bahkan berbulu (pilling) di permukaannya.',
          ],
        },
      },
      {
        heading: 'Panduan Praktis Merawat Wool Blend',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Kapan Memilih Dry Clean',
            block: {
              kind: 'paragraphs',
              items: [
                'Dry clean direkomendasikan untuk wool blend dengan proporsi wool tinggi (di atas 50%) atau untuk thobe yang sering dipakai untuk acara formal, di mana menjaga struktur dan tampilan rapi menjadi prioritas.',
              ],
            },
          },
          {
            heading: 'Mencuci di Rumah dengan Aman',
            block: {
              kind: 'paragraphs',
              items: [
                'Jika memilih mencuci sendiri, gunakan siklus paling lembut mesin cuci dengan air dingin, deterjen khusus wool jika tersedia, dan hindari memeras atau memutar kain secara agresif — tekan lembut untuk mengeluarkan air berlebih.',
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
            'Untuk thobe wool blend yang diinvestasikan untuk acara khusus seperti pernikahan, dry clean profesional sepadan dengan biayanya — risiko kerusakan dari kesalahan mencuci sendiri jauh lebih mahal dibanding biaya dry clean rutin.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum Merawat Wool Blend',
        block: {
          kind: 'list',
          items: [
            'Mencuci dengan air panas yang berisiko menyusutkan dan merusak struktur kain',
            'Memeras atau memutar kain secara agresif setelah dicuci',
            'Menggunakan mesin pengering suhu tinggi alih-alih dikeringkan alami',
            'Melipat dalam waktu lama tanpa digantung, merusak bentuk kain seiring waktu',
          ],
        },
      },
    ],
    expertNote:
      'Untuk klien yang memesan thobe wool blend premium kami, kami selalu menyertakan panduan perawatan spesifik sesuai proporsi campuran serat yang digunakan — proporsi wool yang berbeda membutuhkan tingkat kehati-hatian yang sedikit berbeda pula.',
    faq: [
      {
        question: 'Apakah wool blend selalu perlu dry clean?',
        answer: 'Tidak selalu wajib, namun sangat direkomendasikan terutama untuk wool blend dengan proporsi wool tinggi atau untuk thobe yang sering digunakan acara formal.',
      },
      {
        question: 'Apa yang terjadi jika wool blend dicuci dengan air panas?',
        answer: 'Berisiko menyusut dan kehilangan struktur kainnya — selalu gunakan air dingin untuk mencuci wool blend di rumah.',
      },
      {
        question: 'Bagaimana cara terbaik menyimpan thobe wool blend?',
        answer: 'Gantung menggunakan hanger berbahu lebar, hindari melipat dalam waktu lama yang bisa merusak bentuk kain seiring waktu.',
      },
    ],
    relatedArticles: [
      { category: 'care', slug: 'dry-clean-vs-hand-wash' },
      { category: 'care', slug: 'store-premium-garments' },
      { category: 'fabrics', slug: 'wool-blend' },
    ],
    relatedFabrics: [{ category: 'fabrics', slug: 'wool-blend' }],
    relatedCategories: ['fabrics'],
    tags: { service: ['care'] },
  },
  {
    slug: 'dry-clean-vs-hand-wash',
    category: 'care',
    eyebrow: 'Panduan Perawatan',
    title: 'Dry Clean vs Cuci Tangan — Mana yang Tepat?',
    navLabel: 'Dry Clean vs Cuci Tangan',
    metaDescription:
      'Perbandingan dry clean dan cuci tangan untuk thobe bespoke — kapan masing-masing metode lebih tepat berdasarkan jenis bahan.',
    dek: 'Bukan soal mana yang lebih baik secara umum — tapi mana yang tepat untuk bahan spesifik Anda.',
    definition:
      'Dry clean dan cuci tangan adalah dua metode perawatan pakaian yang berbeda dalam penggunaan air — dry clean menggunakan pelarut kimia tanpa air untuk membersihkan kain, sementara cuci tangan menggunakan air dan deterjen dengan penanganan manual yang lebih lembut dibanding mesin cuci.',
    quickAnswer:
      'Dry clean paling tepat untuk bahan sensitif seperti wool blend dan rayon yang berisiko rusak terkena air, sementara cuci tangan cukup aman dan lebih ekonomis untuk bahan seperti katun, linen, dan poplin yang lebih tahan terhadap air.',
    keyTakeaways: [
      'Dry clean menggunakan pelarut kimia, bukan air, untuk membersihkan kain',
      'Cuci tangan menggunakan air dengan penanganan manual lebih lembut dari mesin cuci',
      'Bahan seperti wool blend dan rayon lebih aman dengan dry clean',
      'Bahan seperti katun, linen, dan poplin umumnya aman dengan cuci tangan',
      'Pertimbangkan frekuensi pemakaian — thobe yang sering dipakai mungkin lebih praktis dengan cuci tangan rutin',
    ],
    sections: [
      {
        heading: 'Perbedaan Mendasar Kedua Metode',
        block: {
          kind: 'paragraphs',
          items: [
            'Dry clean menggunakan pelarut kimia khusus untuk mengangkat kotoran dan noda tanpa melibatkan air, membuatnya lebih aman untuk bahan yang berisiko menyusut, kehilangan bentuk, atau rusak strukturnya jika terkena air. Cuci tangan, di sisi lain, menggunakan air dan deterjen dengan penanganan manual yang jauh lebih lembut dibanding mesin cuci, cocok untuk bahan yang cukup tahan air namun tetap butuh perlakuan hati-hati.',
          ],
        },
      },
      {
        heading: 'Panduan Memilih Berdasarkan Bahan',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Bahan yang Cocok Dry Clean',
            block: {
              kind: 'list',
              items: [
                'Wool blend — menjaga struktur dan mencegah penyusutan',
                'Rayon — mencegah kerusakan pada jatuh kain yang halus',
              ],
            },
          },
          {
            heading: 'Bahan yang Cocok Cuci Tangan',
            block: {
              kind: 'list',
              items: [
                'Katun dan katun premium — cukup tahan air dengan perawatan dasar',
                'Linen dan poplin — aman dicuci tangan dengan air dingin hingga hangat',
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
            'Untuk thobe yang jarang dipakai namun bernilai tinggi (seperti thobe pernikahan premium), dry clean adalah pilihan lebih aman meski bahannya sebenarnya bisa dicuci tangan — risiko kerusakan dari kesalahan penanganan manual tidak sepadan dengan penghematan biaya untuk item yang jarang dicuci.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Mencuci tangan bahan sensitif seperti wool blend tanpa mempertimbangkan risiko penyusutan',
            'Selalu menggunakan dry clean untuk semua bahan tanpa mempertimbangkan biaya dan kepraktisan',
            'Tidak memeriksa label perawatan bahan sebelum memutuskan metode',
            'Mengabaikan bahwa frekuensi pencucian juga memengaruhi pilihan metode yang paling ekonomis',
          ],
        },
      },
    ],
    expertNote:
      'Kami selalu menyertakan rekomendasi metode perawatan spesifik untuk setiap pesanan bespoke berdasarkan bahan yang dipilih — tidak ada satu jawaban benar untuk semua kasus, karena pilihan terbaik bergantung pada bahan dan frekuensi pemakaian.',
    comparisonTable: {
      caption: 'Perbandingan dry clean dan cuci tangan',
      headers: ['Aspek', 'Dry Clean', 'Cuci Tangan'],
      rows: [
        ['Media pembersih', 'Pelarut kimia', 'Air dan deterjen'],
        ['Risiko penyusutan', 'Sangat rendah', 'Sedang, tergantung bahan'],
        ['Biaya per pencucian', 'Lebih tinggi', 'Lebih ekonomis'],
      ],
    },
    faq: [
      {
        question: 'Apakah dry clean selalu lebih baik dari cuci tangan?',
        answer: 'Tidak selalu — dry clean lebih aman untuk bahan sensitif seperti wool blend, namun cuci tangan cukup aman dan lebih ekonomis untuk bahan seperti katun dan linen.',
      },
      {
        question: 'Apakah cuci tangan bisa merusak wool blend?',
        answer: 'Berisiko, terutama jika air yang digunakan terlalu panas atau kain diperas terlalu agresif — dry clean lebih aman untuk bahan ini.',
      },
      {
        question: 'Bagaimana cara mengetahui metode perawatan yang tepat untuk thobe saya?',
        answer: 'Periksa jenis bahan yang digunakan dan konsultasikan dengan tailor Anda — bahan yang berbeda memiliki rekomendasi perawatan yang berbeda pula.',
      },
    ],
    relatedArticles: [
      { category: 'care', slug: 'wool-blend-care' },
      { category: 'umrah', slug: 'care-during-travel' },
      { category: 'care', slug: 'wash-linen' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'wool-blend' },
      { category: 'fabrics', slug: 'rayon' },
    ],
    relatedCategories: ['fabrics'],
    tags: { service: ['care'] },
  },
  {
    slug: 'extend-garment-life',
    category: 'care',
    eyebrow: 'Panduan Perawatan',
    title: 'Tips Memperpanjang Usia Pakai Thobe Bespoke',
    navLabel: 'Memperpanjang Usia Thobe',
    metaDescription:
      'Panduan menyeluruh memperpanjang usia pakai thobe bespoke — kombinasi perawatan mencuci, menyetrika, dan menyimpan yang tepat.',
    dek: 'Thobe bespoke adalah investasi jangka panjang — panduan menyeluruh menjaga kualitasnya bertahan bertahun-tahun.',
    definition:
      'Memperpanjang usia pakai thobe bespoke adalah kombinasi praktik perawatan menyeluruh — mencuci dengan benar, menyetrika dengan suhu tepat, menyimpan dengan cara yang tepat, dan menangani masalah kecil sebelum menjadi kerusakan besar.',
    quickAnswer:
      'Usia pakai thobe bespoke paling efektif diperpanjang dengan kombinasi tiga kebiasaan: mencuci sesuai jenis bahan (bukan menyamaratakan semua bahan), menyimpan dengan hanger dan lemari yang tepat, dan segera memperbaiki kerusakan kecil seperti kancing lepas sebelum menjadi masalah lebih besar.',
    keyTakeaways: [
      'Perawatan yang tepat bisa memperpanjang usia pakai thobe bespoke bertahun-tahun',
      'Rotasi pemakaian antar beberapa thobe mengurangi keausan pada satu potong saja',
      'Perbaiki kerusakan kecil segera, sebelum berkembang menjadi masalah lebih besar',
      'Simpan thobe formal terpisah dari thobe harian untuk mengurangi gesekan berlebih',
      'Investasi pada perawatan profesional sesekali (dry clean, perbaikan tailor) sepadan untuk item bernilai tinggi',
    ],
    sections: [
      {
        heading: 'Filosofi Merawat Investasi Jangka Panjang',
        block: {
          kind: 'paragraphs',
          items: [
            'Thobe bespoke, terutama yang berbahan premium, adalah investasi yang idealnya bertahan bertahun-tahun, bukan sekadar pakaian sekali pakai untuk satu musim. Memperpanjang usia pakainya bukan soal satu trik tunggal, melainkan kombinasi kebiasaan kecil yang konsisten diterapkan dari hari pertama dipakai.',
          ],
        },
      },
      {
        heading: 'Kebiasaan yang Memperpanjang Usia Pakai',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Rotasi Pemakaian',
            block: {
              kind: 'paragraphs',
              items: [
                'Memiliki beberapa thobe yang dipakai bergantian mengurangi frekuensi keausan pada satu potong, memberi waktu bagi serat kain untuk "beristirahat" antara pemakaian, sesuatu yang secara nyata memperpanjang usia pakai keseluruhan koleksi.',
              ],
            },
          },
          {
            heading: 'Perbaikan Dini',
            block: {
              kind: 'paragraphs',
              items: [
                'Kancing yang mulai longgar, jahitan yang mulai terurai di ujung, atau kerutan kecil pada kerah — semua ini jauh lebih mudah dan murah diperbaiki di tahap awal dibanding dibiarkan berkembang menjadi kerusakan yang lebih signifikan.',
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
            'Jadwalkan pemeriksaan rutin sederhana setiap beberapa bulan — periksa kancing, jahitan di titik kritis seperti kerah dan lubang kancing, serta kondisi keseluruhan kain. Kebiasaan sederhana ini menangkap masalah kecil sebelum sempat berkembang menjadi kerusakan besar yang lebih sulit diperbaiki.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum yang Memperpendek Usia Pakai',
        block: {
          kind: 'list',
          items: [
            'Memakai thobe yang sama terus-menerus tanpa rotasi, mempercepat keausan',
            'Membiarkan kerusakan kecil seperti kancing longgar tanpa segera diperbaiki',
            'Mengabaikan panduan perawatan spesifik per jenis bahan',
            'Menyimpan thobe formal bercampur dengan thobe harian yang lebih sering bergesekan',
          ],
        },
      },
    ],
    expertNote:
      'Klien yang paling berhasil menjaga thobe bespoke mereka bertahan lama umumnya bukan yang paling jarang memakainya, melainkan yang paling konsisten menerapkan perawatan dasar — mencuci sesuai bahan, menyimpan dengan benar, dan memperbaiki kerusakan kecil segera.',
    faq: [
      {
        question: 'Berapa lama thobe bespoke berbahan premium bisa bertahan dengan perawatan yang tepat?',
        answer: 'Bisa bertahan bertahun-tahun tanpa penurunan kualitas signifikan, jauh lebih lama dibanding thobe ready-to-wear yang umumnya menurun kualitasnya lebih cepat.',
      },
      {
        question: 'Apakah rotasi pemakaian benar-benar memperpanjang usia thobe?',
        answer: 'Ya, memberi waktu bagi serat kain untuk pulih antar pemakaian secara nyata mengurangi keausan dibanding memakai satu potong terus-menerus.',
      },
      {
        question: 'Seberapa sering sebaiknya memeriksa kondisi thobe secara rutin?',
        answer: 'Setiap beberapa bulan sudah cukup untuk menangkap masalah kecil seperti kancing longgar sebelum berkembang menjadi kerusakan lebih besar.',
      },
    ],
    relatedArticles: [
      { category: 'care', slug: 'store-premium-garments' },
      { category: 'care', slug: 'dry-clean-vs-hand-wash' },
      { category: 'tailoring', slug: 'quality-control' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'egyptian-cotton' },
      { category: 'fabrics', slug: 'wool-blend' },
    ],
    relatedCategories: ['tailoring'],
    tags: { service: ['care'] },
  },
]
