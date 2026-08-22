import type { KnowledgeCategory } from './types'

// Sprint W6-1 — Knowledge Foundation. All 7 category hubs. Fabrics,
// Measurements, and Styling are 'live' (W6-2/3/4 populate their articles
// this sprint); Wedding, Umrah, Care, and Tailoring are 'foundation' —
// real hubs with genuine SEO intro/FAQ content, but no articles under them
// yet (that's Sprint W6-5 onward, per the brief's own framing).
export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  {
    slug: 'fabrics',
    label: 'Bahan',
    eyebrow: 'Panduan Bahan',
    title: 'Panduan Bahan Thobe — Karakteristik, Kelebihan, dan Cara Perawatan',
    metaDescription:
      'Panduan lengkap bahan thobe — linen, katun Jepang, katun Mesir, poplin, twill, oxford, wool blend, rayon, dan polyester premium. Karakteristik, kelebihan, kekurangan, dan cara perawatan.',
    intro: [
      'Bahan adalah faktor tunggal yang paling menentukan bagaimana thobe terasa dan bertahan lama — bukan hanya bagaimana tampilannya di etalase. Setiap serat punya karakter sirkulasi udara, tekstur, dan cara jatuh yang berbeda, dan pilihan yang tepat tergantung pada acara, iklim, serta kenyamanan pribadi Anda.',
      'Panduan ini membahas sepuluh bahan yang paling sering digunakan untuk thobe bespoke — dari serat alami seperti linen dan katun Mesir, hingga tenunan seperti poplin, twill, dan oxford, sampai campuran modern seperti wool blend dan polyester premium. Setiap halaman menjelaskan karakteristik, kelebihan, kekurangan, acara yang cocok, dan cara merawatnya.',
    ],
    faq: [
      {
        question: 'Bahan apa yang paling cocok untuk cuaca panas?',
        answer:
          'Linen dan katun Jepang adalah dua pilihan terbaik untuk cuaca panas karena sirkulasi udaranya tinggi dan menyerap keringat dengan baik. Katun Mesir juga breathable namun dengan permukaan yang lebih halus.',
      },
      {
        question: 'Apa perbedaan utama antara katun dan polyester untuk thobe?',
        answer:
          'Katun adalah serat alami dengan sirkulasi udara lebih baik namun lebih mudah kusut, sementara polyester premium adalah serat sintetis yang sangat tahan kusut dan mudah dirawat namun breathability-nya lebih rendah.',
      },
      {
        question: 'Bagaimana cara memilih bahan thobe yang tepat?',
        answer:
          'Pertimbangkan tiga hal: acara (formal vs harian), iklim tempat Anda beraktivitas, dan preferensi perawatan (apakah Anda keberatan menyetrika rutin). Konsultasi dengan tailor kami membantu menyelaraskan ketiganya dengan bahan yang tersedia.',
      },
    ],
    relatedCategories: ['styling', 'care'],
    status: 'live',
  },
  {
    slug: 'measurements',
    label: 'Pengukuran',
    eyebrow: 'Panduan Pengukuran',
    title: 'Panduan Pengukuran Thobe — Cara Mengukur Badan dengan Akurat',
    metaDescription:
      'Panduan lengkap cara mengukur badan untuk thobe — lingkar dada, lebar bahu, panjang lengan, panjang badan, lingkar leher, size guide, dan perbandingan slim vs regular fit.',
    intro: [
      'Pengukuran yang akurat adalah dasar dari setiap thobe bespoke yang pas di badan. Berbeda dari kemeja yang hanya mempertimbangkan beberapa titik ukur, thobe dikenakan sebagai satu potongan menyeluruh dari bahu hingga mata kaki, sehingga setiap titik ukur harus proporsional satu sama lain.',
      'Panduan ini menjelaskan setiap titik ukur utama secara terpisah — lingkar dada, lebar bahu, panjang lengan, panjang badan, dan lingkar leher — beserta cara mengukurnya sendiri di rumah, kesalahan umum yang sering terjadi, dan bagaimana memahami size guide serta perbedaan slim fit, regular fit, dan relaxed fit.',
    ],
    faq: [
      {
        question: 'Apakah saya bisa mengukur badan sendiri untuk thobe bespoke?',
        answer:
          'Bisa, sebagai referensi awal sebelum konsultasi. Namun untuk thobe yang benar-benar dijahit, Tarda selalu melakukan pengukuran ulang langsung oleh fitter untuk memastikan akurasi penuh melalui Digital Body Profile.',
      },
      {
        question: 'Titik ukur mana yang paling penting untuk thobe?',
        answer:
          'Lima titik ukur utama sama-sama penting dan saling terkait: lingkar leher, lebar bahu, lingkar dada, panjang lengan, dan panjang badan. Kesalahan di satu titik akan memengaruhi proporsi keseluruhan.',
      },
      {
        question: 'Apa itu Digital Body Profile?',
        answer:
          'Digital Body Profile adalah data ukuran badan Anda yang terverifikasi langsung oleh fitter kami dan tersimpan untuk pesanan thobe berikutnya, sehingga Anda tidak perlu diukur ulang dari nol setiap kali memesan.',
      },
    ],
    relatedCategories: ['tailoring', 'fabrics'],
    status: 'live',
  },
  {
    slug: 'styling',
    label: 'Gaya',
    eyebrow: 'Panduan Gaya',
    title: 'Panduan Styling Thobe — Warna, Kombinasi, dan Rekomendasi Acara',
    metaDescription:
      'Panduan styling thobe lengkap — navy, olive, hitam, putih, formal, casual, gaya pernikahan, dan gaya umrah. Kombinasi warna, rekomendasi bahan, dan aksesori.',
    intro: [
      'Warna dan gaya thobe yang tepat mengubah kesan yang Anda bawa ke sebuah acara — thobe navy untuk kesan formal-elegan, thobe putih untuk ibadah, atau thobe olive untuk suasana yang lebih santai. Memilih bukan sekadar soal selera, tapi soal menyelaraskan warna, bahan, dan aksesori dengan acara yang dituju.',
      'Panduan ini membahas delapan arah styling — empat berdasarkan warna (navy, olive, hitam, putih) dan empat berdasarkan konteks (formal, casual, pernikahan, umrah) — lengkap dengan kombinasi warna, rekomendasi bahan, dan aksesori yang sesuai untuk masing-masing.',
    ],
    faq: [
      {
        question: 'Warna thobe apa yang paling serbaguna?',
        answer:
          'Navy adalah warna paling serbaguna karena cocok untuk acara formal maupun semi-formal, mudah dipadukan dengan aksesori emas atau perak, dan tidak terlalu mencolok maupun terlalu polos.',
      },
      {
        question: 'Apakah warna thobe memengaruhi pilihan bahan?',
        answer:
          'Ya, secara tidak langsung. Warna gelap seperti navy dan hitam sering dipadukan dengan bahan yang punya jatuh lebih terstruktur seperti wool blend, sementara warna putih dan krem lebih umum pada bahan breathable seperti katun atau linen.',
      },
      {
        question: 'Bagaimana memilih gaya thobe untuk acara pernikahan?',
        answer:
          'Untuk pernikahan, pertimbangkan warna yang elegan (navy, hitam, atau krem gelap), bahan premium dengan jatuh terstruktur, dan aksesori seperti bisht untuk kesan yang lebih formal. Lihat panduan gaya pernikahan kami untuk detail lengkap.',
      },
    ],
    relatedCategories: ['fabrics', 'wedding'],
    status: 'live',
  },
  {
    slug: 'wedding',
    label: 'Pernikahan',
    eyebrow: 'Panduan Pernikahan',
    title: 'Panduan Thobe Pernikahan — Memilih Thobe untuk Hari Besar Anda',
    metaDescription:
      'Panduan memilih thobe untuk acara pernikahan — warna, bahan, dan gaya yang tepat untuk pengantin pria maupun tamu undangan.',
    intro: [
      'Pernikahan adalah salah satu acara yang paling menuntut ketepatan dalam memilih thobe — warna harus elegan, bahan harus terlihat premium dari dekat maupun dari jarak foto, dan potongannya harus benar-benar pas di badan. Kesalahan kecil yang bisa dimaafkan di acara harian akan sangat terlihat di foto pernikahan yang disimpan seumur hidup.',
      'Panduan ini membahas delapan aspek thobe pernikahan — dari pemilihan gaya akad dan resepsi, thobe couple muslim, timeline pemesanan custom, panduan warna, hingga outfit keluarga dan thobe premium untuk pengantin — masing-masing dengan rekomendasi bahan, kesalahan umum yang perlu dihindari, dan panduan praktis dari konsultasi hingga hari-H.',
    ],
    faq: [
      {
        question: 'Berapa lama sebelum hari-H sebaiknya memesan thobe pernikahan?',
        answer:
          'Idealnya 4–6 minggu sebelum hari-H, untuk memberi ruang waktu bagi konsultasi, pengukuran, produksi, dan fitting akhir tanpa terburu-buru.',
      },
      {
        question: 'Apakah Tarda menyediakan thobe khusus pengantin?',
        answer:
          'Ya, melalui proses bespoke penuh — konsultasi, pengukuran oleh fitter, dan pemilihan bahan premium disesuaikan dengan tema dan warna acara pernikahan Anda.',
      },
      {
        question: 'Apakah Tarda bisa membuat outfit seragam untuk keluarga pengantin?',
        answer:
          'Bisa. Kami menerima pesanan family outfit dengan warna dan gaya senada untuk ayah, saudara, atau keluarga inti pengantin — lihat panduan Family Outfit kami untuk detail koordinasi warnanya.',
      },
    ],
    relatedCategories: ['styling', 'fabrics'],
    status: 'live',
  },
  {
    slug: 'umrah',
    label: 'Umrah',
    eyebrow: 'Panduan Umrah',
    title: 'Panduan Thobe Umrah — Memilih Thobe yang Nyaman untuk Ibadah',
    metaDescription:
      'Panduan memilih thobe untuk umrah — bahan breathable, warna netral, dan gaya yang praktis untuk perjalanan dan cuaca panas.',
    intro: [
      'Thobe untuk umrah punya prioritas berbeda dari thobe formal — kenyamanan dan sirkulasi udara jauh lebih penting daripada tampilan semata, mengingat perjalanan panjang dan cuaca panas di Mekkah dan Madinah, ditambah aktivitas ibadah yang intensif berhari-hari berturut-turut.',
      'Panduan ini membahas delapan aspek thobe umrah — bahan terbaik, jumlah thobe yang ideal dibawa, panduan warna, tips packing, perawatan selama perjalanan, panduan iklim, hingga outfit umrah premium dan thobe custom khusus umrah — semuanya disusun dari kebutuhan nyata jamaah, bukan asumsi generik.',
    ],
    faq: [
      {
        question: 'Bahan apa yang paling direkomendasikan untuk thobe umrah?',
        answer:
          'Katun Jepang, linen, dan katun Mesir adalah pilihan paling umum karena sirkulasi udaranya tinggi dan cukup ringan untuk cuaca panas serta perjalanan panjang.',
      },
      {
        question: 'Berapa banyak thobe yang sebaiknya dibawa untuk umrah?',
        answer:
          'Sebagai panduan umum, 3–4 thobe biasanya cukup untuk perjalanan umrah standar, dengan mempertimbangkan rotasi cuci dan cadangan jika ada kendala di perjalanan.',
      },
      {
        question: 'Apakah Tarda menyediakan thobe custom khusus umrah?',
        answer:
          'Ya, dengan penyesuaian khusus untuk kebutuhan perjalanan ibadah — bahan breathable, potongan praktis untuk sholat, dan opsi kantong tambahan untuk kebutuhan seperti mushaf saku.',
      },
    ],
    relatedCategories: ['styling', 'fabrics'],
    status: 'live',
  },
  {
    slug: 'care',
    label: 'Perawatan',
    eyebrow: 'Panduan Perawatan',
    title: 'Panduan Perawatan Thobe — Menjaga Bahan Tetap Awet',
    metaDescription:
      'Panduan merawat thobe bespoke — cara mencuci, menyetrika, dan menyimpan thobe agar bahan tetap awet dan tampilan tetap rapi.',
    intro: [
      'Bahan premium sekalipun akan cepat menurun kualitasnya tanpa perawatan yang tepat — cara mencuci, menyetrika, dan menyimpan thobe sama pentingnya dengan pemilihan bahan itu sendiri saat membeli. Perawatan yang salah bisa merusak dalam satu kali cuci apa yang butuh berbulan-bulan untuk dibangun lewat pemilihan bahan yang tepat.',
      'Panduan ini membahas delapan aspek perawatan thobe — cara mencuci linen, menyetrika dengan benar, menyimpan garmen premium, menghilangkan kerutan tanpa setrika, merawat thobe putih, merawat wool blend, memilih antara dry clean dan cuci tangan, hingga tips memperpanjang usia pakai thobe secara keseluruhan.',
    ],
    faq: [
      {
        question: 'Apakah semua bahan thobe boleh dicuci dengan mesin cuci?',
        answer:
          'Sebagian besar boleh, namun bahan seperti wool blend dan rayon lebih aman dicuci dengan siklus lembut atau dry clean untuk menjaga bentuk dan teksturnya. Lihat halaman bahan masing-masing untuk panduan spesifik.',
      },
      {
        question: 'Bagaimana cara menyimpan thobe agar tidak kusut?',
        answer:
          'Gantung thobe menggunakan hanger berbahu lebar (bukan hanger kawat tipis) di tempat yang tidak lembap, dan hindari menumpuk thobe dalam lemari yang terlalu padat.',
      },
      {
        question: 'Berapa lama umur pakai rata-rata thobe bespoke dengan perawatan yang benar?',
        answer:
          'Dengan perawatan yang tepat, thobe bespoke berbahan premium bisa bertahan bertahun-tahun tanpa penurunan kualitas signifikan — jauh lebih lama dibanding thobe ready-to-wear yang umumnya menurun kualitasnya dalam waktu lebih singkat.',
      },
    ],
    relatedCategories: ['fabrics', 'tailoring'],
    status: 'live',
  },
  {
    slug: 'tailoring',
    label: 'Tailoring',
    eyebrow: 'Panduan Tailoring',
    title: 'Panduan Tailoring Thobe — Memahami Proses Bespoke',
    metaDescription:
      'Panduan memahami proses tailoring thobe bespoke — dari konsultasi, pengukuran, pembentukan pola, hingga produksi dan quality control.',
    intro: [
      'Tailoring bespoke adalah proses yang jauh lebih menyeluruh dibanding membeli thobe ready-to-wear — dimulai dari konsultasi, pengukuran presisi, pembentukan pola personal, hingga produksi dan pemeriksaan kualitas bertahap. Memahami proses ini membantu Anda menilai apa yang sebenarnya Anda bayar saat memesan thobe bespoke.',
      'Panduan ini membahas delapan aspek teknis tailoring — definisi bespoke sesungguhnya, perbandingan bespoke vs made-to-measure, proses pembentukan pola, panduan interlining, konstruksi kerah, konstruksi lengan, detail jahitan tangan, hingga proses quality control — ditulis dengan bahasa teknis yang tetap mudah dipahami pembeli awam.',
    ],
    faq: [
      {
        question: 'Apa perbedaan thobe bespoke dan ready-to-wear?',
        answer:
          'Thobe bespoke dijahit berdasarkan pola yang dibentuk khusus dari ukuran badan Anda sendiri, sementara ready-to-wear menggunakan pola standar dalam beberapa ukuran generik (S/M/L/XL) yang tidak disesuaikan per individu.',
      },
      {
        question: 'Berapa lama proses tailoring thobe bespoke?',
        answer:
          'Umumnya 2–3 minggu dari konsultasi hingga thobe selesai, tergantung kompleksitas desain dan ketersediaan bahan yang dipilih.',
      },
      {
        question: 'Apa bedanya bespoke dengan made-to-measure?',
        answer:
          'Bespoke membentuk pola baru dari nol khusus untuk Anda, sementara made-to-measure menyesuaikan pola standar yang sudah ada dengan ukuran Anda — lihat panduan Bespoke vs Made-to-Measure kami untuk perbandingan lengkap.',
      },
    ],
    relatedCategories: ['measurements', 'care'],
    status: 'live',
  },
  {
    // Sprint W6-10 — FAQ Domination Layer. Same [category]/[slug]
    // architecture, 24 short question-first pages instead of deep guides.
    slug: 'questions',
    label: 'Pertanyaan',
    eyebrow: 'FAQ',
    title: 'Pertanyaan Umum Seputar Thobe Bespoke',
    metaDescription:
      'Jawaban singkat dan langsung untuk pertanyaan paling umum seputar thobe bespoke — bahan, ukuran, gaya, pernikahan, umrah, tailoring, dan perawatan.',
    intro: [
      'Halaman ini kumpulan jawaban singkat dan langsung untuk pertanyaan spesifik yang paling sering muncul seputar thobe bespoke — berbeda dari panduan mendalam di kategori lain, setiap halaman di sini fokus menjawab satu pertanyaan secara ringkas.',
      'Setiap jawaban di sini juga terhubung ke panduan lengkap yang relevan di kategori Bahan, Pengukuran, Gaya, Pernikahan, Umrah, Tailoring, atau Perawatan, jika Anda ingin mendalami topik tersebut lebih jauh.',
    ],
    faq: [
      {
        question: 'Kenapa halaman FAQ ini terpisah dari panduan lengkap?',
        answer:
          'FAQ dirancang untuk menjawab satu pertanyaan spesifik secara cepat dan langsung, sementara panduan lengkap di kategori lain membahas topik secara menyeluruh — keduanya saling melengkapi, bukan menggantikan.',
      },
      {
        question: 'Apakah semua pertanyaan tentang thobe bespoke ada di sini?',
        answer:
          'Belum semua — halaman ini mencakup 24 pertanyaan paling umum saat ini dan akan terus bertambah. Untuk pertanyaan spesifik yang belum tercakup, konsultasikan langsung dengan tim kami.',
      },
      {
        question: 'Bisakah saya bertanya langsung jika jawaban di sini belum cukup?',
        answer: 'Tentu — gunakan tombol konsultasi gratis di bagian bawah setiap halaman untuk bertanya langsung ke tim kami.',
      },
    ],
    relatedCategories: ['fabrics', 'measurements'],
    status: 'live',
  },
  {
    // Sprint W6-10 — Local Authority Layer. Honest positioning only — no
    // fabricated address, founding year, customer count, or awards. Every
    // claim here is either already stated elsewhere in this codebase
    // (homepage: "Bespoke Thobe, Bogor") or a general description of the
    // real process (consultation, measurement, pattern, production,
    // fitting, delivery) already documented across the other 8 clusters.
    slug: 'bogor',
    label: 'Bogor',
    eyebrow: 'Tarda Bogor',
    title: 'Tarda di Bogor — Layanan Bespoke Thobe',
    metaDescription:
      'Tarda adalah layanan bespoke thobe berbasis di Bogor — konsultasi, pengukuran, dan produksi custom untuk kebutuhan harian, pernikahan, dan umrah.',
    intro: [
      'Tarda adalah layanan bespoke thobe yang berbasis di Bogor, melayani konsultasi, pengukuran presisi oleh fitter, hingga produksi thobe custom yang dijahit khusus berdasarkan ukuran dan preferensi setiap klien.',
      'Halaman ini dan tiga halaman turunannya menjelaskan layanan kami secara spesifik untuk kebutuhan custom thobe harian, proses bespoke tailoring, thobe pernikahan, dan thobe umrah — semuanya berbasis proses yang sama: konsultasi, pengukuran, pembentukan pola, produksi, fitting, dan pengiriman.',
    ],
    faq: [
      {
        question: 'Di mana saya bisa berkonsultasi dengan Tarda?',
        answer:
          'Konsultasi dapat dijadwalkan melalui halaman Booking Konsultasi kami. Tim kami akan mengonfirmasi detail lokasi dan waktu sesuai jadwal yang tersedia.',
      },
      {
        question: 'Apakah Tarda melayani pengukuran langsung?',
        answer:
          'Ya, pengukuran dilakukan langsung oleh fitter kami untuk membentuk Digital Body Profile yang akurat, digunakan sebagai acuan produksi thobe bespoke Anda.',
      },
      {
        question: 'Apakah thobe custom bisa dikirim setelah selesai?',
        answer: 'Ya, thobe yang sudah selesai diproduksi dapat dikirimkan sesuai kesepakatan yang dikonfirmasi saat konsultasi.',
      },
    ],
    relatedCategories: ['tailoring', 'wedding'],
    status: 'live',
  },
  {
    // Sprint Y — Digital Bespoke Tailoring cluster. The whole point of this
    // category is answering "can I order without visiting Bogor?" —
    // every article here (cornerstone + 14 supporting pages) resolves that
    // question and points back at /design-studio, the merged pillar +
    // configurator page.
    slug: 'design-studio',
    label: 'Design Studio',
    eyebrow: 'Digital Bespoke Tailoring',
    title: 'Digital Bespoke Tailoring — Design Studio, Video Call Fitting, dan Home Visit',
    metaDescription:
      'Panduan lengkap Digital Bespoke Tailoring Tarda — cara memesan custom thobe dari luar kota, luar pulau, atau luar negeri lewat video call fitting, Design Studio online, dan layanan home visit.',
    intro: [
      'Bespoke tailoring secara tradisional selalu mengharuskan pelanggan datang langsung ke tailor — untuk konsultasi, pengukuran, dan pemilihan bahan. Digital Bespoke Tailoring dari Tarda menghilangkan batasan itu: seluruh proses, dari konsultasi hingga finalisasi desain, kini bisa dilakukan dari mana saja lewat video call fitting, Design Studio online, dan layanan home visit untuk yang ingin pengalaman lebih personal.',
      'Halaman ini dan seluruh artikel turunannya menjelaskan bagaimana Digital Bespoke Tailoring bekerja secara spesifik — cara memesan custom thobe online dari luar kota, seberapa akurat fitting lewat video call, bagaimana layanan home visit bekerja untuk keluarga dan acara pernikahan, dan bagaimana Design Studio menjadi titik awal setiap pesanan sebelum kain dipotong.',
    ],
    faq: [
      {
        question: 'Apakah Digital Bespoke Tailoring sama akuratnya dengan datang langsung ke Bogor?',
        answer:
          'Video call fitting dan Design Studio memberi hasil desain dan estimasi ukuran yang sangat mendekati, namun pengukuran final untuk produksi tetap dilakukan langsung oleh fitter kami — baik saat home visit maupun saat Anda berkunjung ke workshop — untuk memastikan Digital Body Profile Anda akurat.',
      },
      {
        question: 'Apakah layanan ini hanya untuk pelanggan di luar Bogor?',
        answer:
          'Tidak. Digital Bespoke Tailoring dirancang untuk siapa pun yang tidak sempat datang langsung — termasuk pelanggan sibuk di dalam Bogor sendiri — sekaligus tetap membuka opsi showroom experience bagi yang ingin datang langsung.',
      },
      {
        question: 'Apa yang membedakan Design Studio dari sekadar katalog online?',
        answer:
          'Design Studio bukan katalog produk jadi — ini adalah titik awal proses bespoke, tempat Anda memilih Model, Kerah, Manset, Material, dan Warna, lalu melihat kombinasi desain dan estimasi harga secara real-time sebelum pola personal Anda mulai dibentuk.',
      },
    ],
    relatedCategories: ['tailoring', 'measurements'],
    status: 'live',
  },
]

export function getCategoryBySlug(slug: string): KnowledgeCategory | undefined {
  return KNOWLEDGE_CATEGORIES.find((category) => category.slug === slug)
}

export function getLiveCategories(): KnowledgeCategory[] {
  return KNOWLEDGE_CATEGORIES.filter((category) => category.status === 'live')
}
