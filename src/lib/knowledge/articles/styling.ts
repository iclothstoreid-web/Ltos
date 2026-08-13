import type { KnowledgeArticle } from '../types'

// Sprint W6-4 — Styling Authority. 8 evergreen styling guides. Every
// `relatedFabrics` entry points at a real fabric article from W6-2
// (Styling -> Fabric internal-linking rule) rather than a generic mention.
export const STYLING_ARTICLES: KnowledgeArticle[] = [
  {
    slug: 'navy-thobe',
    category: 'styling',
    eyebrow: 'Panduan Gaya',
    title: 'Gaya Thobe Navy — Elegan dan Serbaguna',
    navLabel: 'Thobe Navy',
    metaDescription:
      'Panduan styling thobe warna navy — kombinasi warna, rekomendasi bahan, aksesori, dan acara yang cocok untuk thobe navy.',
    dek: 'Warna paling serbaguna untuk thobe — cukup elegan untuk formal, cukup netral untuk semi-formal.',
    definition:
      'Thobe navy adalah thobe berwarna biru tua gelap yang dikenal sebagai salah satu warna paling serbaguna karena kesan elegannya tanpa terlihat terlalu berat seperti hitam.',
    sections: [
      {
        heading: 'Styling Overview',
        block: {
          kind: 'paragraphs',
          items: [
            'Navy menempati posisi tengah yang ideal — cukup gelap untuk kesan formal dan rapi, namun tidak seberat hitam yang bisa terasa terlalu resmi untuk sebagian acara. Ini yang membuat navy menjadi pilihan pertama banyak orang saat ragu memilih warna thobe.',
          ],
        },
      },
      {
        heading: 'Kombinasi Warna',
        block: {
          kind: 'list',
          items: [
            'Emas atau brass untuk aksesori — menciptakan kontras hangat yang elegan',
            'Putih atau krem sebagai warna pendamping pada layer dalam',
            'Perak sebagai alternatif aksesori untuk kesan lebih modern dan minimalis',
          ],
        },
      },
      {
        heading: 'Rekomendasi Bahan',
        block: {
          kind: 'paragraphs',
          items: [
            'Wool blend memberi navy kesan paling formal dan terstruktur, ideal untuk acara malam. Untuk pemakaian harian yang tetap rapi, premium cotton adalah alternatif yang lebih ringan dan mudah dirawat.',
          ],
        },
      },
      {
        heading: 'Rekomendasi Aksesori',
        block: {
          kind: 'list',
          items: [
            'Jam tangan dengan strap kulit coklat tua atau hitam',
            'Sepatu formal warna hitam atau coklat tua',
            'Bisht (cloak) warna krem atau coklat untuk acara yang lebih formal',
          ],
        },
      },
      {
        heading: 'Acara yang Cocok',
        block: {
          kind: 'list',
          items: [
            'Acara kantor dan pertemuan formal',
            'Kumpul keluarga besar dan acara semi-formal',
            'Resepsi pernikahan sebagai tamu undangan',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apakah navy cocok untuk semua warna kulit?',
        answer:
          'Ya, navy dikenal sebagai warna yang universal dan cocok untuk hampir semua warna kulit karena undertone birunya yang netral, tidak seperti warna-warna terang yang lebih selektif.',
      },
      {
        question: 'Apa perbedaan navy dengan hitam untuk thobe?',
        answer:
          'Navy memberi kesan formal namun tetap hangat dan approachable, sementara hitam memberi kesan formal yang lebih tegas dan berat. Navy lebih fleksibel untuk acara semi-formal hingga formal.',
      },
      {
        question: 'Aksesori apa yang paling cocok dengan thobe navy?',
        answer:
          'Aksesori emas atau brass menciptakan kontras hangat yang elegan dengan navy, sementara perak memberi kesan lebih modern dan minimalis — keduanya sama-sama cocok tergantung gaya personal.',
      },
    ],
    relatedArticles: [
      { category: 'styling', slug: 'formal-thobe' },
      { category: 'styling', slug: 'black-thobe' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'wool-blend' },
      { category: 'fabrics', slug: 'premium-cotton' },
    ],
  },
  {
    slug: 'olive-thobe',
    category: 'styling',
    eyebrow: 'Panduan Gaya',
    title: 'Gaya Thobe Olive — Natural dan Earthy',
    navLabel: 'Thobe Olive',
    metaDescription:
      'Panduan styling thobe warna olive — kombinasi warna, rekomendasi bahan, aksesori, dan acara yang cocok untuk thobe olive.',
    dek: 'Warna earthy yang membawa kesan natural dan santai tanpa kehilangan kerapian.',
    definition:
      'Thobe olive adalah thobe berwarna hijau keabu-abuan yang termasuk dalam keluarga warna earthy, memberi kesan natural dan lebih santai dibanding warna gelap klasik seperti navy atau hitam.',
    sections: [
      {
        heading: 'Styling Overview',
        block: {
          kind: 'paragraphs',
          items: [
            'Olive membawa nuansa yang berbeda dari warna thobe klasik — lebih natural, lebih santai, namun tetap terlihat sengaja dan rapi jika dipadukan dengan tepat. Warna ini cocok untuk mereka yang ingin tampil sedikit berbeda tanpa terlalu mencolok.',
          ],
        },
      },
      {
        heading: 'Kombinasi Warna',
        block: {
          kind: 'list',
          items: [
            'Coklat tua atau tan untuk aksesori dan alas kaki',
            'Krem sebagai warna pendamping yang senada dan lembut',
            'Hindari kombinasi dengan warna terang mencolok yang bisa mengurangi kesan earthy-nya',
          ],
        },
      },
      {
        heading: 'Rekomendasi Bahan',
        block: {
          kind: 'paragraphs',
          items: [
            'Linen adalah pasangan alami untuk olive — keduanya sama-sama membawa kesan natural dan cocok untuk cuaca panas. Twill juga menjadi pilihan baik untuk kesan yang sedikit lebih terstruktur.',
          ],
        },
      },
      {
        heading: 'Rekomendasi Aksesori',
        block: {
          kind: 'list',
          items: [
            'Sandal atau sepatu kulit warna coklat natural',
            'Jam tangan dengan strap kanvas atau kulit coklat muda',
            'Minim aksesori logam — olive lebih cocok dengan material natural',
          ],
        },
      },
      {
        heading: 'Acara yang Cocok',
        block: {
          kind: 'list',
          items: [
            'Acara santai di luar ruangan',
            'Perjalanan atau umrah dengan suasana yang lebih kasual',
            'Kumpul santai bersama keluarga atau teman',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apakah olive cocok untuk acara formal?',
        answer:
          'Olive lebih cocok untuk acara semi-formal hingga santai. Untuk acara yang menuntut kesan sangat formal, navy atau hitam lebih direkomendasikan.',
      },
      {
        question: 'Bahan apa yang paling cocok dengan warna olive?',
        answer:
          'Linen dan twill adalah dua pilihan yang paling melengkapi karakter natural warna olive — linen untuk kesan santai maksimal, twill untuk kesan yang sedikit lebih terstruktur.',
      },
      {
        question: 'Apakah olive termasuk warna yang mudah kotor terlihat?',
        answer:
          'Olive termasuk warna menengah yang cukup menyamarkan noda ringan dibanding putih, namun tetap lebih terlihat dibanding warna gelap seperti navy atau hitam.',
      },
    ],
    relatedArticles: [
      { category: 'styling', slug: 'casual-thobe' },
      { category: 'styling', slug: 'umrah-thobe-style' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'linen' },
      { category: 'fabrics', slug: 'twill' },
    ],
  },
  {
    slug: 'black-thobe',
    category: 'styling',
    eyebrow: 'Panduan Gaya',
    title: 'Gaya Thobe Hitam — Formal Maksimal',
    navLabel: 'Thobe Hitam',
    metaDescription:
      'Panduan styling thobe warna hitam — kombinasi warna, rekomendasi bahan, aksesori, dan acara yang cocok untuk thobe hitam.',
    dek: 'Warna dengan kesan formal paling tegas — pilihan utama untuk acara resmi di malam hari.',
    definition:
      'Thobe hitam adalah thobe dengan warna paling gelap dan formal, sering menjadi pilihan untuk acara resmi malam hari karena kesan elegan dan tegas yang dibawanya.',
    sections: [
      {
        heading: 'Styling Overview',
        block: {
          kind: 'paragraphs',
          items: [
            'Hitam adalah warna dengan kesan formal paling maksimal di antara semua pilihan warna thobe. Karena kesannya yang tegas, hitam paling optimal digunakan untuk acara resmi, bukan pemakaian harian yang lebih santai.',
          ],
        },
      },
      {
        heading: 'Kombinasi Warna',
        block: {
          kind: 'list',
          items: [
            'Perak atau silver untuk aksesori — kontras dingin yang elegan dengan hitam',
            'Hitam matte untuk keseluruhan aksesori jika ingin kesan monokrom yang bersih',
            'Emas dalam jumlah terbatas sebagai aksen, bukan dominasi',
          ],
        },
      },
      {
        heading: 'Rekomendasi Bahan',
        block: {
          kind: 'paragraphs',
          items: [
            'Wool blend adalah pasangan paling optimal untuk hitam — struktur dan jatuh kainnya memperkuat kesan formal yang dibawa warna ini. Premium polyester menjadi alternatif praktis untuk hitam yang perlu tetap rapi tanpa perawatan rumit.',
          ],
        },
      },
      {
        heading: 'Rekomendasi Aksesori',
        block: {
          kind: 'list',
          items: [
            'Sepatu formal hitam mengkilap',
            'Jam tangan dengan strap atau case warna gelap',
            'Bisht hitam atau abu-abu gelap untuk acara sangat formal',
          ],
        },
      },
      {
        heading: 'Acara yang Cocok',
        block: {
          kind: 'list',
          items: [
            'Acara resmi malam hari',
            'Resepsi pernikahan formal',
            'Acara kenegaraan atau protokoler',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apakah thobe hitam cocok dipakai sehari-hari?',
        answer:
          'Kurang ideal. Kesan formal hitam yang kuat membuatnya lebih optimal untuk acara resmi dibanding pemakaian harian santai — untuk harian, warna netral seperti olive atau navy lebih fleksibel.',
      },
      {
        question: 'Apakah hitam menyerap panas lebih banyak?',
        answer:
          'Secara fisik, warna gelap memang menyerap lebih banyak panas dari sinar matahari dibanding warna terang. Untuk aktivitas outdoor di cuaca sangat panas, ini perlu dipertimbangkan.',
      },
      {
        question: 'Bahan apa yang paling elegan untuk thobe hitam?',
        answer:
          'Wool blend memberi jatuh kain yang paling terstruktur dan elegan untuk hitam, terutama untuk acara formal malam hari.',
      },
    ],
    relatedArticles: [
      { category: 'styling', slug: 'formal-thobe' },
      { category: 'styling', slug: 'wedding-thobe-style' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'wool-blend' },
      { category: 'fabrics', slug: 'premium-polyester' },
    ],
  },
  {
    slug: 'white-thobe',
    category: 'styling',
    eyebrow: 'Panduan Gaya',
    title: 'Gaya Thobe Putih — Klasik dan Tradisional',
    navLabel: 'Thobe Putih',
    metaDescription:
      'Panduan styling thobe warna putih — kombinasi warna, rekomendasi bahan, aksesori, dan acara yang cocok untuk thobe putih.',
    dek: 'Warna paling klasik dan tradisional — pilihan utama untuk ibadah dan acara keagamaan.',
    definition:
      'Thobe putih adalah warna paling klasik dan tradisional dalam budaya berpakaian thobe, sering menjadi pilihan utama untuk sholat, umrah, dan acara keagamaan lainnya.',
    sections: [
      {
        heading: 'Styling Overview',
        block: {
          kind: 'paragraphs',
          items: [
            'Putih membawa kesan bersih, tradisional, dan netral yang paling sedikit menimbulkan kesalahan styling — hampir semua aksesori dan konteks acara cocok dipadukan dengan warna ini, selama bahannya tepat.',
          ],
        },
      },
      {
        heading: 'Kombinasi Warna',
        block: {
          kind: 'list',
          items: [
            'Krem atau beige sebagai warna pendamping yang senada',
            'Coklat muda untuk aksesori seperti sandal atau tasbih',
            'Netral dengan hampir semua warna aksesori, dari emas hingga perak',
          ],
        },
      },
      {
        heading: 'Rekomendasi Bahan',
        block: {
          kind: 'paragraphs',
          items: [
            'Katun Jepang atau linen adalah pilihan terbaik untuk putih — keduanya breathable dan cocok untuk pemakaian ibadah yang sering dilakukan di cuaca panas. Katun Mesir menjadi alternatif untuk kelembutan ekstra.',
          ],
        },
      },
      {
        heading: 'Rekomendasi Aksesori',
        block: {
          kind: 'list',
          items: [
            'Sandal atau sepatu warna netral (coklat muda atau putih)',
            'Peci atau kopiah putih atau krem senada',
            'Minim aksesori logam mencolok — putih sudah cukup bersih tanpa tambahan berlebihan',
          ],
        },
      },
      {
        heading: 'Acara yang Cocok',
        block: {
          kind: 'list',
          items: [
            'Sholat Jumat dan ibadah harian',
            'Umrah dan haji',
            'Acara keagamaan dan hari raya',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apakah thobe putih mudah kotor?',
        answer:
          'Ya, noda lebih terlihat jelas pada putih dibanding warna lain. Perawatan ekstra seperti mencuci segera setelah kotor dan menghindari kontak dengan pewarna kuat sangat disarankan.',
      },
      {
        question: 'Bahan apa yang paling direkomendasikan untuk thobe putih?',
        answer:
          'Katun Jepang dan linen paling direkomendasikan karena breathability tinggi, cocok untuk pemakaian ibadah yang sering dilakukan di cuaca panas seperti umrah.',
      },
      {
        question: 'Apakah putih cocok untuk acara formal selain ibadah?',
        answer:
          'Putih cenderung diasosiasikan dengan konteks keagamaan dan tradisional. Untuk acara formal sekuler seperti resepsi malam, warna seperti navy atau hitam lebih umum dipilih.',
      },
    ],
    relatedArticles: [
      { category: 'styling', slug: 'umrah-thobe-style' },
      { category: 'styling', slug: 'casual-thobe' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'japanese-cotton' },
      { category: 'fabrics', slug: 'linen' },
    ],
  },
  {
    slug: 'formal-thobe',
    category: 'styling',
    eyebrow: 'Panduan Gaya',
    title: 'Gaya Thobe Formal — Panduan Lengkap',
    navLabel: 'Thobe Formal',
    metaDescription:
      'Panduan styling thobe formal — kombinasi warna, rekomendasi bahan, aksesori, dan acara yang cocok untuk penampilan formal.',
    dek: 'Panduan menyeluruh menyusun tampilan thobe formal, lintas warna dan bahan.',
    definition:
      'Thobe formal adalah thobe yang disusun khusus untuk acara resmi — kombinasi warna gelap, bahan berstruktur, dan aksesori yang minim namun tepat, untuk menciptakan kesan rapi dan elegan.',
    sections: [
      {
        heading: 'Styling Overview',
        block: {
          kind: 'paragraphs',
          items: [
            'Kesan formal pada thobe dibangun dari tiga elemen yang bekerja bersama: warna yang cenderung gelap dan netral, bahan dengan jatuh kain yang terstruktur, dan aksesori yang dipilih secara selektif, bukan berlebihan.',
          ],
        },
      },
      {
        heading: 'Kombinasi Warna',
        block: {
          kind: 'list',
          items: [
            'Navy dan hitam sebagai dua warna paling andal untuk kesan formal',
            'Krem gelap atau coklat tua sebagai alternatif yang tetap elegan namun lebih hangat',
            'Hindari warna terlalu terang atau mencolok untuk acara sangat resmi',
          ],
        },
      },
      {
        heading: 'Rekomendasi Bahan',
        block: {
          kind: 'paragraphs',
          items: [
            'Wool blend adalah bahan paling optimal untuk kesan formal maksimal berkat struktur dan jatuh kainnya. Katun Mesir menjadi alternatif untuk formal yang lebih ringan namun tetap elegan.',
          ],
        },
      },
      {
        heading: 'Rekomendasi Aksesori',
        block: {
          kind: 'list',
          items: [
            'Bisht (cloak) untuk acara yang menuntut kesan paling formal',
            'Sepatu kulit mengkilap warna hitam atau coklat tua',
            'Jam tangan dan aksesori logam dalam jumlah terbatas, tidak berlebihan',
          ],
        },
      },
      {
        heading: 'Acara yang Cocok',
        block: {
          kind: 'list',
          items: [
            'Resepsi pernikahan',
            'Acara kantor formal dan pertemuan resmi',
            'Acara kenegaraan atau protokoler',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apa tiga elemen utama gaya thobe formal?',
        answer:
          'Warna yang cenderung gelap dan netral, bahan dengan jatuh kain terstruktur seperti wool blend, dan aksesori yang dipilih secara selektif — ketiganya bekerja bersama membentuk kesan formal.',
      },
      {
        question: 'Apakah bisht selalu diperlukan untuk gaya formal?',
        answer:
          'Tidak selalu wajib, namun bisht menambah kesan formal yang signifikan untuk acara yang menuntut penampilan paling resmi seperti resepsi pernikahan atau acara kenegaraan.',
      },
      {
        question: 'Warna apa yang paling aman untuk acara formal yang belum diketahui dress code-nya?',
        answer:
          'Navy adalah pilihan paling aman — cukup formal untuk sebagian besar acara resmi, namun tidak seberat hitam yang bisa terasa berlebihan jika acara ternyata semi-formal.',
      },
    ],
    relatedArticles: [
      { category: 'styling', slug: 'navy-thobe' },
      { category: 'styling', slug: 'black-thobe' },
      { category: 'styling', slug: 'wedding-thobe-style' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'wool-blend' },
      { category: 'fabrics', slug: 'egyptian-cotton' },
    ],
  },
  {
    slug: 'casual-thobe',
    category: 'styling',
    eyebrow: 'Panduan Gaya',
    title: 'Gaya Thobe Casual — Panduan Lengkap',
    navLabel: 'Thobe Casual',
    metaDescription:
      'Panduan styling thobe casual — kombinasi warna, rekomendasi bahan, aksesori, dan acara yang cocok untuk pemakaian sehari-hari.',
    dek: 'Panduan menyusun tampilan thobe yang nyaman dan rapi untuk aktivitas harian.',
    definition:
      'Thobe casual adalah thobe yang disusun untuk kenyamanan pemakaian harian — bahan ringan dan breathable, warna netral, dan minim aksesori, tanpa mengorbankan kerapian.',
    sections: [
      {
        heading: 'Styling Overview',
        block: {
          kind: 'paragraphs',
          items: [
            'Gaya casual memprioritaskan kenyamanan dan kepraktisan di atas kesan formal — bahan yang ringan dan breathable, warna yang netral dan mudah dipadukan, serta aksesori seminimal mungkin agar tetap nyaman sepanjang hari.',
          ],
        },
      },
      {
        heading: 'Kombinasi Warna',
        block: {
          kind: 'list',
          items: [
            'Olive, krem, atau abu-abu muda sebagai warna dasar yang serbaguna',
            'Putih untuk kesan bersih dan segar di aktivitas harian',
            'Hindari kombinasi aksesori berlebihan yang mengurangi kenyamanan',
          ],
        },
      },
      {
        heading: 'Rekomendasi Bahan',
        block: {
          kind: 'paragraphs',
          items: [
            'Linen dan premium cotton adalah dua pilihan terbaik untuk casual — keduanya nyaman untuk aktivitas sepanjang hari dengan sirkulasi udara yang baik.',
          ],
        },
      },
      {
        heading: 'Rekomendasi Aksesori',
        block: {
          kind: 'list',
          items: [
            'Sandal atau sepatu kasual yang nyaman untuk aktivitas',
            'Minim perhiasan atau aksesori logam',
            'Peci atau kopiah ringan sesuai kebutuhan',
          ],
        },
      },
      {
        heading: 'Acara yang Cocok',
        block: {
          kind: 'list',
          items: [
            'Aktivitas harian di rumah maupun luar rumah',
            'Kumpul santai bersama keluarga atau teman',
            'Perjalanan jarak pendek atau aktivitas outdoor ringan',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apa perbedaan utama gaya casual dengan formal?',
        answer:
          'Casual memprioritaskan kenyamanan dengan bahan ringan dan minim aksesori, sementara formal memprioritaskan kesan rapi dan elegan dengan bahan terstruktur dan aksesori yang lebih lengkap.',
      },
      {
        question: 'Bahan apa yang paling nyaman untuk thobe casual harian?',
        answer:
          'Linen dan premium cotton paling direkomendasikan karena sirkulasi udaranya baik dan cukup nyaman untuk aktivitas sepanjang hari tanpa terasa berat.',
      },
      {
        question: 'Apakah warna cerah cocok untuk gaya casual?',
        answer:
          'Warna netral seperti olive, krem, dan abu-abu muda lebih umum untuk casual karena mudah dipadukan dan tidak terlalu mencolok, meski warna lain tetap bisa dipilih sesuai preferensi personal.',
      },
    ],
    relatedArticles: [
      { category: 'styling', slug: 'olive-thobe' },
      { category: 'styling', slug: 'white-thobe' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'linen' },
      { category: 'fabrics', slug: 'premium-cotton' },
    ],
  },
  {
    slug: 'wedding-thobe-style',
    category: 'styling',
    eyebrow: 'Panduan Gaya',
    title: 'Gaya Thobe Pernikahan — Panduan Lengkap',
    navLabel: 'Gaya Pernikahan',
    metaDescription:
      'Panduan styling thobe untuk acara pernikahan — kombinasi warna, rekomendasi bahan premium, dan aksesori untuk pengantin maupun tamu undangan.',
    dek: 'Menyusun tampilan thobe yang elegan dan berkesan untuk salah satu acara paling penting.',
    definition:
      'Gaya thobe pernikahan adalah kombinasi warna, bahan premium, dan aksesori yang disusun khusus untuk acara pernikahan — baik sebagai pengantin pria maupun tamu undangan yang ingin tampil maksimal.',
    sections: [
      {
        heading: 'Styling Overview',
        block: {
          kind: 'paragraphs',
          items: [
            'Pernikahan menuntut tampilan yang bertahan sepanjang acara — dari akad hingga resepsi, dari foto formal hingga interaksi langsung dengan tamu. Ini berarti bahan harus terlihat premium dari dekat maupun dari jarak foto, dan potongannya benar-benar presisi.',
          ],
        },
      },
      {
        heading: 'Kombinasi Warna',
        block: {
          kind: 'list',
          items: [
            'Navy atau hitam untuk kesan elegan yang klasik dan tidak lekang waktu',
            'Krem gelap atau coklat tua sebagai alternatif yang lebih hangat, sering dipadukan dengan tema pernikahan tertentu',
            'Selaraskan warna dengan tema dekorasi dan warna seragam keluarga jika ada',
          ],
        },
      },
      {
        heading: 'Rekomendasi Bahan',
        block: {
          kind: 'paragraphs',
          items: [
            'Wool blend dan katun Mesir adalah dua pilihan bahan premium yang paling umum untuk pernikahan — wool blend untuk kesan terstruktur maksimal, katun Mesir untuk kelembutan dan kenyamanan sepanjang acara yang panjang.',
          ],
        },
      },
      {
        heading: 'Rekomendasi Aksesori',
        block: {
          kind: 'list',
          items: [
            'Bisht (cloak) sebagai elemen aksesori paling khas untuk pengantin pria',
            'Sepatu kulit formal berkualitas tinggi',
            'Aksesori emas atau perak sesuai warna thobe yang dipilih',
          ],
        },
      },
      {
        heading: 'Acara yang Cocok',
        block: {
          kind: 'list',
          items: [
            'Akad nikah',
            'Resepsi pernikahan',
            'Sesi foto pra-wedding formal',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Berapa lama sebelum hari-H sebaiknya memesan thobe pernikahan?',
        answer:
          'Idealnya 4–6 minggu sebelum hari-H, memberi ruang waktu untuk konsultasi, pengukuran, produksi bahan premium, dan fitting akhir tanpa terburu-buru.',
      },
      {
        question: 'Apakah bisht wajib dipakai untuk pengantin pria?',
        answer:
          'Tidak wajib, namun bisht adalah elemen tradisional yang menambah kesan formal dan khas untuk momen pernikahan — banyak pengantin pria memilih menggunakannya untuk akad maupun resepsi.',
      },
      {
        question: 'Apakah thobe untuk pengantin berbeda dari thobe untuk tamu?',
        answer:
          'Prinsip dasarnya sama (warna elegan, bahan premium, aksesori tepat), namun pengantin pria umumnya memilih detail yang lebih personal seperti bisht khusus atau penyesuaian warna dengan tema pernikahan.',
      },
    ],
    relatedArticles: [
      { category: 'styling', slug: 'formal-thobe' },
      { category: 'styling', slug: 'navy-thobe' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'wool-blend' },
      { category: 'fabrics', slug: 'egyptian-cotton' },
    ],
    relatedCategories: ['wedding'],
  },
  {
    slug: 'umrah-thobe-style',
    category: 'styling',
    eyebrow: 'Panduan Gaya',
    title: 'Gaya Thobe Umrah — Panduan Lengkap',
    navLabel: 'Gaya Umrah',
    metaDescription:
      'Panduan styling thobe untuk umrah — kombinasi warna netral, rekomendasi bahan breathable, dan aksesori praktis untuk perjalanan ibadah.',
    dek: 'Menyusun tampilan thobe yang praktis dan nyaman untuk perjalanan ibadah di cuaca panas.',
    definition:
      'Gaya thobe umrah adalah kombinasi warna netral, bahan breathable, dan aksesori minimalis yang disusun untuk kenyamanan maksimal selama perjalanan ibadah di cuaca panas Mekkah dan Madinah.',
    sections: [
      {
        heading: 'Styling Overview',
        block: {
          kind: 'paragraphs',
          items: [
            'Berbeda dari thobe formal, prioritas gaya umrah adalah kenyamanan dan sirkulasi udara di atas segalanya — mengingat aktivitas ibadah yang intensif, perjalanan panjang, dan cuaca panas yang harus dihadapi berhari-hari berturut-turut.',
          ],
        },
      },
      {
        heading: 'Kombinasi Warna',
        block: {
          kind: 'list',
          items: [
            'Putih sebagai warna paling umum dan tradisional untuk ibadah',
            'Krem atau abu-abu muda sebagai alternatif yang tetap netral namun sedikit lebih menyamarkan noda perjalanan',
            'Hindari warna gelap yang menyerap panas berlebih di cuaca sangat panas',
          ],
        },
      },
      {
        heading: 'Rekomendasi Bahan',
        block: {
          kind: 'paragraphs',
          items: [
            'Katun Jepang dan linen adalah dua pilihan bahan paling direkomendasikan — keduanya breathable, ringan untuk dibawa bepergian, dan nyaman dipakai berjam-jam saat ibadah.',
          ],
        },
      },
      {
        heading: 'Rekomendasi Aksesori',
        block: {
          kind: 'list',
          items: [
            'Sandal yang mudah dilepas-pasang untuk kebutuhan sholat berulang',
            'Peci atau kopiah ringan yang nyaman dipakai lama',
            'Minim aksesori logam untuk kepraktisan dan kenyamanan perjalanan',
          ],
        },
      },
      {
        heading: 'Acara yang Cocok',
        block: {
          kind: 'list',
          items: [
            'Ibadah umrah dan haji',
            'Perjalanan panjang di iklim panas',
            'Aktivitas ibadah intensif berhari-hari',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Berapa banyak thobe yang sebaiknya dibawa untuk umrah?',
        answer:
          'Sebagai panduan umum, 3–4 thobe biasanya cukup untuk perjalanan umrah standar, mempertimbangkan rotasi cuci dan cadangan jika ada kendala di perjalanan.',
      },
      {
        question: 'Kenapa bahan breathable lebih penting untuk umrah dibanding acara lain?',
        answer:
          'Karena aktivitas ibadah umrah dilakukan berjam-jam di cuaca panas dan berhari-hari berturut-turut, sehingga sirkulasi udara yang baik jauh lebih memengaruhi kenyamanan dibanding kesan formal semata.',
      },
      {
        question: 'Apakah warna putih wajib untuk umrah?',
        answer:
          'Tidak wajib secara aturan ibadah, namun putih adalah tradisi yang paling umum dan melambangkan kesucian. Warna netral lain seperti krem juga umum digunakan selama nyaman dan sopan.',
      },
    ],
    relatedArticles: [
      { category: 'styling', slug: 'white-thobe' },
      { category: 'styling', slug: 'olive-thobe' },
    ],
    relatedFabrics: [
      { category: 'fabrics', slug: 'japanese-cotton' },
      { category: 'fabrics', slug: 'linen' },
    ],
    relatedCategories: ['umrah'],
  },
]
