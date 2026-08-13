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
          'Bisa, sebagai referensi awal sebelum konsultasi. Namun untuk thobe yang benar-benar dijahit, Local Tailor selalu melakukan pengukuran ulang langsung oleh fitter untuk memastikan akurasi penuh melalui Digital Body Profile.',
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
      'Pernikahan adalah salah satu acara yang paling menuntut ketepatan dalam memilih thobe — warna harus elegan, bahan harus terlihat premium dari dekat maupun dari jarak foto, dan potongannya harus benar-benar pas di badan. Local Tailor membangun hub ini sebagai titik awal untuk kebutuhan tersebut.',
      'Konten lengkap untuk kategori ini — termasuk panduan memilih warna berdasarkan tema pernikahan, rekomendasi bahan premium, dan kombinasi aksesori seperti bisht — akan hadir bertahap. Untuk saat ini, panduan gaya pernikahan thobe di kategori Styling sudah bisa Anda jadikan referensi awal.',
    ],
    faq: [
      {
        question: 'Berapa lama sebelum hari-H sebaiknya memesan thobe pernikahan?',
        answer:
          'Idealnya 4–6 minggu sebelum hari-H, untuk memberi ruang waktu bagi konsultasi, pengukuran, produksi, dan fitting akhir tanpa terburu-buru.',
      },
      {
        question: 'Apakah Local Tailor menyediakan thobe khusus pengantin?',
        answer:
          'Ya, melalui proses bespoke penuh — konsultasi, pengukuran oleh fitter, dan pemilihan bahan premium disesuaikan dengan tema dan warna acara pernikahan Anda.',
      },
    ],
    relatedCategories: ['styling', 'fabrics'],
    status: 'foundation',
  },
  {
    slug: 'umrah',
    label: 'Umrah',
    eyebrow: 'Panduan Umrah',
    title: 'Panduan Thobe Umrah — Memilih Thobe yang Nyaman untuk Ibadah',
    metaDescription:
      'Panduan memilih thobe untuk umrah — bahan breathable, warna netral, dan gaya yang praktis untuk perjalanan dan cuaca panas.',
    intro: [
      'Thobe untuk umrah punya prioritas berbeda dari thobe formal — kenyamanan dan sirkulasi udara jauh lebih penting daripada tampilan semata, mengingat perjalanan panjang dan cuaca panas di Mekkah dan Madinah. Hub ini menjadi titik awal untuk kebutuhan tersebut.',
      'Konten lengkap kategori ini — termasuk panduan memilih bahan paling breathable, jumlah thobe yang ideal dibawa, dan tips perawatan selama perjalanan — akan hadir bertahap. Panduan gaya umrah thobe di kategori Styling sudah tersedia sebagai referensi awal.',
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
    ],
    relatedCategories: ['styling', 'fabrics'],
    status: 'foundation',
  },
  {
    slug: 'care',
    label: 'Perawatan',
    eyebrow: 'Panduan Perawatan',
    title: 'Panduan Perawatan Thobe — Menjaga Bahan Tetap Awet',
    metaDescription:
      'Panduan merawat thobe bespoke — cara mencuci, menyetrika, dan menyimpan thobe agar bahan tetap awet dan tampilan tetap rapi.',
    intro: [
      'Bahan premium sekalipun akan cepat menurun kualitasnya tanpa perawatan yang tepat — cara mencuci, menyetrika, dan menyimpan thobe sama pentingnya dengan pemilihan bahan itu sendiri. Hub ini menjadi titik awal untuk kebutuhan tersebut.',
      'Konten lengkap kategori ini — termasuk panduan perawatan spesifik per jenis bahan, cara menghilangkan noda, dan tips menyimpan thobe jangka panjang — akan hadir bertahap. Setiap halaman bahan di kategori Fabrics saat ini sudah menyertakan ringkasan cara perawatan dasarnya masing-masing.',
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
    ],
    relatedCategories: ['fabrics', 'tailoring'],
    status: 'foundation',
  },
  {
    slug: 'tailoring',
    label: 'Tailoring',
    eyebrow: 'Panduan Tailoring',
    title: 'Panduan Tailoring Thobe — Memahami Proses Bespoke',
    metaDescription:
      'Panduan memahami proses tailoring thobe bespoke — dari konsultasi, pengukuran, pembentukan pola, hingga produksi dan quality control.',
    intro: [
      'Tailoring bespoke adalah proses yang jauh lebih menyeluruh dibanding membeli thobe ready-to-wear — dimulai dari konsultasi, pengukuran presisi, pembentukan pola personal, hingga produksi dan pemeriksaan kualitas bertahap. Hub ini menjadi titik awal untuk memahami proses tersebut.',
      'Konten lengkap kategori ini — termasuk penjelasan setiap tahap proses bespoke secara mendalam dan istilah-istilah tailoring yang umum digunakan — akan hadir bertahap. Halaman proses bespoke kami di homepage sudah menjelaskan alur ini secara ringkas.',
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
    ],
    relatedCategories: ['measurements', 'care'],
    status: 'foundation',
  },
]

export function getCategoryBySlug(slug: string): KnowledgeCategory | undefined {
  return KNOWLEDGE_CATEGORIES.find((category) => category.slug === slug)
}

export function getLiveCategories(): KnowledgeCategory[] {
  return KNOWLEDGE_CATEGORIES.filter((category) => category.status === 'live')
}
