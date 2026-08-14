import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'

// Sprint W10 — Organic Acquisition Engine. Revenue Landing Pages, one per
// Ready-to-Buy commercial keyword (see docs/seo/SEO_KEYWORD_MAP.md §A).
// Deliberately modeled on src/lib/seo/cityConfig.ts's proven config-driven
// pattern (one config array, thin per-page components, zero copy-paste
// between entries) rather than inventing a new architecture.
//
// Keyword-cannibalization note: /locations/bandung already targets "tailor
// bandung" as its own primary keyword, with "bespoke tailor bandung" /
// "jahit thobe bandung" / "custom baju koko bandung" appearing among its
// *secondary* keywordPhrases (see cityConfig.ts's BANDUNG entry). Each
// config below is deliberately NOT a re-skin of that page: /locations/
// bandung is the geographic/location-hub page (address, parking,
// neighborhoods, opening hours); these pages are commercial-intent pages
// (why bespoke vs MTM, why premium, why this specific garment type),
// cross-linking to /locations/bandung for location detail rather than
// duplicating it. Each page's `keywordPrimary` below is unique sitewide —
// no other page (existing or new) targets the exact same primary phrase.
export const SERVICE_SITE_ORIGIN = FABRIC_SITE_ORIGIN

export interface ServiceFaqItem {
  question: string
  answer: string
}

export interface ServiceHeroConfig {
  eyebrow: string
  headline: string
  subheadline: string
  keywordPhrases: string[]
}

export interface ServiceValueProp {
  title: string
  description: string
}

export interface ServiceConfig {
  slug: string
  /** Human-readable garment/positioning focus, used in copy ("thobe", "baju koko", "garmen umroh"). */
  garmentLabel: string
  keywordPrimary: string
  keywordSecondary: string[]
  hero: ServiceHeroConfig
  /** "Why this, specifically" — 3-4 differentiated reasons, never copy-pasted between pages. */
  valueProps: ServiceValueProp[]
  faq: ServiceFaqItem[]
  /** ids into reviewsCopy.reviews — only real matches, never fabricated per-page testimonials. */
  reviewHighlightIds: string[]
  relatedGuides: { category: string; slug: string }[]
  whatsappMessage: string
  ctaLabel: string
}

const REVIEW_FAQ_ITEM: ServiceFaqItem = {
  question: 'Bagaimana cara memberi ulasan setelah pesanan selesai?',
  answer:
    'Setelah garmen Anda selesai, kami akan mengirimkan tautan Google Review via WhatsApp — ulasan Anda membantu klien lain menemukan Local Tailor dan hanya membutuhkan waktu singkat untuk ditulis.',
}

const LOCATION_FAQ_ITEM: ServiceFaqItem = {
  question: 'Di mana lokasi workshop untuk konsultasi tatap muka?',
  answer:
    'Workshop dan showroom kami berada di Jl. Gamelan No.10, Buah Batu, Bandung — satu-satunya lokasi fisik Local Tailor, tempat konsultasi, pengukuran, dan produksi berlangsung. Detail lengkap lokasi dan area yang kami layani ada di halaman lokasi Bandung.',
}

export const SERVICE_CONFIGS: ServiceConfig[] = [
  // -----------------------------------------------------------------------
  // bespoke-tailor-bandung — the category-definition page: what makes a
  // tailor genuinely "bespoke" (pattern from zero, not template-adjusted),
  // as distinct from the location-hub page's broader "here's our workshop"
  // framing.
  // -----------------------------------------------------------------------
  {
    slug: 'bespoke-tailor-bandung',
    garmentLabel: 'thobe dan baju koko',
    keywordPrimary: 'bespoke tailor bandung',
    keywordSecondary: ['bespoke tailoring bandung', 'tailor bespoke bandung', 'jasa bespoke tailor bandung'],
    hero: {
      eyebrow: 'Bespoke Tailor Bandung',
      headline: 'Bespoke Tailor Bandung — Pola Personal dari Nol, Bukan Ukuran Template',
      subheadline:
        'Sebagai bespoke tailor Bandung, kami tidak menyesuaikan pola template ke ukuran Anda — setiap pola diformulasikan dari nol berdasarkan pengukuran tubuh Anda sendiri, sebelum kain dipotong.',
      keywordPhrases: ['bespoke tailor bandung', 'bespoke tailoring bandung', 'tailor bespoke bandung', 'penjahit bespoke bandung'],
    },
    valueProps: [
      {
        title: 'Pola Dari Nol, Bukan Grading Template',
        description:
          'Tailor made-to-measure biasa menyesuaikan (grading) pola template ke ukuran Anda. Bespoke tailor memformulasikan pola personal dari nol — perbedaan konstruksi yang terasa langsung di cara garmen jatuh di tubuh.',
      },
      {
        title: 'Konsultasi dan Pengukuran Langsung oleh Fitter',
        description: 'Bukan pengukuran mandiri atau estimasi — fitter kami mengukur langsung di workshop sebelum pola dibuat.',
      },
      {
        title: 'Digital Body Profile Tersimpan',
        description: 'Pola dan ukuran Anda tersimpan permanen — pemesanan berikutnya tidak dimulai dari nol lagi.',
      },
      {
        title: 'Satu Workshop, Bukan Rantai Produksi Massal',
        description: 'Konsultasi, pengukuran, pola, produksi, hingga quality control berlangsung di satu tempat yang sama.',
      },
    ],
    faq: [
      {
        question: 'Apa bedanya bespoke tailor dengan tailor made-to-measure biasa?',
        answer:
          'Made-to-measure menyesuaikan pola template yang sudah ada ke ukuran Anda. Bespoke berarti pola dibuat dari nol, khusus untuk proporsi tubuh Anda — tanpa template dasar sama sekali.',
      },
      {
        question: 'Berapa lama proses bespoke tailoring di Bandung ini?',
        answer:
          'Tergantung material dan kompleksitas desain yang dipilih — estimasi waktu produksi ditampilkan langsung saat Anda menjelajahi kombinasi desain di Design Studio.',
      },
      {
        question: 'Apakah saya wajib datang langsung untuk pengukuran bespoke?',
        answer:
          'Pengukuran final tetap dilakukan langsung oleh fitter di workshop Bandung untuk memastikan Digital Body Profile Anda akurat. Konsultasi awal dan pemilihan desain bisa dimulai online lebih dulu.',
      },
      {
        question: 'Apakah harga bespoke tailor lebih mahal dari penjahit biasa?',
        answer:
          'Tidak ada daftar harga tetap karena setiap garmen dibuat sesuai pesanan (made-to-order) — harga tergantung material dan detail desain, dikonfirmasi saat konsultasi, bukan dipatok di muka.',
      },
      LOCATION_FAQ_ITEM,
      REVIEW_FAQ_ITEM,
    ],
    reviewHighlightIds: ['yusuf-bandung-umrah'],
    relatedGuides: [
      { category: 'bandung', slug: 'bespoke-tailor' },
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'tailoring', slug: 'quality-control' },
    ],
    whatsappMessage: 'Halo Local Tailor, saya ingin booking konsultasi bespoke tailoring di workshop Bandung.',
    ctaLabel: 'Booking Konsultasi Bespoke',
  },

  // -----------------------------------------------------------------------
  // tailor-premium-bandung — premium-tier positioning: material sourcing,
  // hand-finishing, quality control depth. Price-insensitive audience.
  // -----------------------------------------------------------------------
  {
    slug: 'tailor-premium-bandung',
    garmentLabel: 'thobe premium',
    keywordPrimary: 'tailor premium bandung',
    keywordSecondary: ['penjahit premium bandung', 'tailor high end bandung', 'jasa jahit premium bandung'],
    hero: {
      eyebrow: 'Tailor Premium Bandung',
      headline: 'Tailor Premium Bandung — Material Impor, Finishing Tangan, Quality Control Penuh',
      subheadline:
        'Sebagai tailor premium Bandung, kami memilih material impor, menyelesaikan detail penting dengan tangan, dan memeriksa setiap garmen sebelum dikirim — bukan sekadar label "premium" tanpa proses di baliknya.',
      keywordPhrases: ['tailor premium bandung', 'penjahit premium bandung', 'tailor high end bandung'],
    },
    valueProps: [
      {
        title: 'Material Impor Terkurasi',
        description: 'Katun Mesir, linen, dan wool blend impor dipilih berdasarkan drape, daya tahan, dan kenyamanan iklim tropis.',
      },
      {
        title: 'Hand Finishing pada Detail Krusial',
        description: 'Sebagian finishing diselesaikan dengan tangan untuk presisi dan ketahanan yang tidak bisa dicapai mesin sepenuhnya.',
      },
      {
        title: '7-Point Quality Inspection',
        description: 'Setiap garmen diperiksa jahitan, ukuran, kerah, manset, dan finishing sebelum meninggalkan workshop.',
      },
      {
        title: 'Bukan Produksi Massal Berlabel Premium',
        description: 'Setiap garmen dibuat sesuai pesanan (made-to-order) dengan pola personal — bukan stok premium yang diproduksi lebih dulu.',
      },
    ],
    faq: [
      {
        question: 'Apa yang membuat tailor ini "premium", bukan sekadar klaim?',
        answer:
          'Kombinasi material impor terkurasi, sebagian finishing dikerjakan tangan, dan inspeksi kualitas 7 titik sebelum garmen dikirim — bukan hanya harga yang lebih tinggi tanpa proses tambahan.',
      },
      {
        question: 'Apakah tailor premium ini lebih mahal dari tailor standar di Bandung?',
        answer:
          'Harga mengikuti material dan kompleksitas desain yang dipilih, dikonfirmasi saat konsultasi — tidak ada daftar harga tetap karena setiap garmen dibuat sesuai pesanan.',
      },
      {
        question: 'Material apa saja yang tersedia untuk garmen premium?',
        answer: 'Wool blend twill impor Italia, katun Mesir, linen impor Belgia, dan silk-cotton blend impor Jepang — lihat detail lengkap di Fabric Explorer.',
      },
      {
        question: 'Apakah quality control benar-benar dilakukan pada setiap garmen?',
        answer: 'Ya — setiap garmen melewati inspeksi kualitas sebelum dikirim, mencakup konsistensi jahitan, akurasi ukuran, dan kualitas finishing.',
      },
      LOCATION_FAQ_ITEM,
      REVIEW_FAQ_ITEM,
    ],
    reviewHighlightIds: ['rizky-surabaya-daily-wear'],
    relatedGuides: [
      { category: 'bandung', slug: 'bespoke-tailor' },
      { category: 'tailoring', slug: 'bespoke-vs-made-to-measure' },
      { category: 'questions', slug: 'how-much-does-bespoke-thobe-cost' },
    ],
    whatsappMessage: 'Halo Local Tailor, saya ingin konsultasi untuk tailoring premium di workshop Bandung.',
    ctaLabel: 'Konsultasi Premium Tailoring',
  },

  // -----------------------------------------------------------------------
  // jahit-thobe-bandung — functional/service-based query: "where can I get
  // a thobe made in Bandung". Practical, process-focused angle.
  // -----------------------------------------------------------------------
  {
    slug: 'jahit-thobe-bandung',
    garmentLabel: 'thobe',
    keywordPrimary: 'jahit thobe bandung',
    keywordSecondary: ['tempat jahit thobe bandung', 'jasa jahit thobe bandung', 'penjahit thobe bandung'],
    hero: {
      eyebrow: 'Jahit Thobe Bandung',
      headline: 'Jahit Thobe Bandung — Dari Konsultasi Sampai Thobe Selesai di Satu Workshop',
      subheadline:
        'Butuh tempat jahit thobe di Bandung yang mengerjakan dari pola personal, bukan ukuran standar? Local Tailor menangani konsultasi, pengukuran, pola, dan produksi thobe Anda dalam satu proses.',
      keywordPhrases: ['jahit thobe bandung', 'tempat jahit thobe bandung', 'jasa jahit thobe bandung', 'penjahit thobe bandung'],
    },
    valueProps: [
      {
        title: 'Konsultasi Model, Kerah, Manset, dan Material',
        description: 'Tentukan kombinasi desain thobe Anda langsung di Design Studio, lengkap dengan estimasi harga real-time.',
      },
      {
        title: 'Pengukuran oleh Fitter Berpengalaman',
        description: 'Bukan estimasi ukuran S/M/L — pengukuran tubuh Anda langsung oleh fitter untuk hasil yang presisi.',
      },
      {
        title: 'Produksi Terstruktur, Bukan Diburu-buru',
        description: 'Cutting, assembly, konstruksi kerah, pemasangan lengan, hand finishing, hingga pressing akhir — setiap tahap oleh tailor berpengalaman.',
      },
      {
        title: 'Estimasi Waktu Jelas Sejak Awal',
        description: 'Waktu produksi ditampilkan langsung saat Anda mendesain, bukan janji tanpa kepastian.',
      },
    ],
    faq: [
      {
        question: 'Berapa lama proses jahit thobe custom di Bandung ini?',
        answer:
          'Tergantung material dan kompleksitas desain — estimasi waktu produksi ditampilkan langsung saat Anda menjelajahi kombinasi desain di Design Studio, sebelum Anda memesan.',
      },
      {
        question: 'Apakah saya bisa memilih model, kerah, dan manset sendiri?',
        answer: 'Ya — Design Studio kami memungkinkan Anda memilih kombinasi Model, Kerah, Manset, Material, dan Warna secara online.',
      },
      {
        question: 'Apakah pengukuran dilakukan sendiri atau oleh fitter?',
        answer: 'Pengukuran final dilakukan langsung oleh fitter kami di workshop Bandung untuk memastikan hasil jahit thobe akurat.',
      },
      {
        question: 'Apakah bisa jahit baju koko juga, bukan hanya thobe?',
        answer: 'Bisa. Proses pola personal yang sama juga berlaku untuk custom baju koko — lihat halaman custom baju koko Bandung untuk detailnya.',
      },
      LOCATION_FAQ_ITEM,
      REVIEW_FAQ_ITEM,
    ],
    reviewHighlightIds: ['yusuf-bandung-umrah'],
    relatedGuides: [
      { category: 'bandung', slug: 'custom-thobe' },
      { category: 'tailoring', slug: 'pattern-drafting' },
      { category: 'measurements', slug: 'how-to-measure-body' },
    ],
    whatsappMessage: 'Halo Local Tailor, saya ingin booking jahit thobe custom di workshop Bandung.',
    ctaLabel: 'Booking Jahit Thobe Custom',
  },

  // -----------------------------------------------------------------------
  // custom-baju-koko-bandung — distinct garment identity from "thobe" in
  // Indonesian search behavior, even though the underlying construction
  // process is the same bespoke pipeline.
  // -----------------------------------------------------------------------
  {
    slug: 'custom-baju-koko-bandung',
    garmentLabel: 'baju koko',
    keywordPrimary: 'custom baju koko bandung',
    keywordSecondary: ['jahit baju koko bandung', 'tailor baju koko bandung', 'jasa jahit koko custom bandung'],
    hero: {
      eyebrow: 'Custom Baju Koko Bandung',
      headline: 'Custom Baju Koko Bandung — Pola Personal untuk Setiap Detail Kerah dan Kancing',
      subheadline:
        'Local Tailor mengerjakan custom baju koko di Bandung dengan proses pola personal yang sama seperti bespoke thobe — bukan konveksi ukuran standar yang diproduksi massal.',
      keywordPhrases: ['custom baju koko bandung', 'jahit baju koko bandung', 'tailor baju koko bandung'],
    },
    valueProps: [
      {
        title: 'Detail Kerah dan Kancing Sesuai Preferensi',
        description: 'Pilihan konstruksi kerah dan detail kancing disesuaikan dengan preferensi Anda, bukan satu desain baku untuk semua.',
      },
      {
        title: 'Material yang Nyaman untuk Pemakaian Formal Maupun Harian',
        description: 'Katun dan linen impor dipilih untuk sirkulasi udara dan kenyamanan sepanjang hari.',
      },
      {
        title: 'Pola dari Pengukuran Tubuh Anda Sendiri',
        description: 'Bukan grading dari ukuran S/M/L — pola baju koko Anda diformulasikan dari pengukuran langsung oleh fitter.',
      },
      {
        title: 'Cocok untuk Kebutuhan Formal, Harian, hingga Acara Keluarga',
        description: 'Satu proses bespoke yang sama, disesuaikan untuk konteks pemakaian yang berbeda-beda.',
      },
    ],
    faq: [
      {
        question: 'Apa bedanya custom baju koko dengan baju koko konveksi?',
        answer:
          'Baju koko konveksi diproduksi massal dalam ukuran standar S/M/L. Custom baju koko kami dibuat dari pola personal berdasarkan pengukuran tubuh Anda sendiri.',
      },
      {
        question: 'Apakah saya bisa memilih model kerah baju koko sendiri?',
        answer: 'Ya, pilihan kerah dan detail konstruksi bisa ditentukan saat konsultasi atau dijelajahi langsung di Design Studio.',
      },
      {
        question: 'Berapa lama proses custom baju koko selesai?',
        answer: 'Waktu produksi tergantung material dan kompleksitas desain — estimasi ditampilkan langsung saat mendesain di Design Studio.',
      },
      {
        question: 'Apakah baju koko custom ini cocok untuk acara formal dan harian?',
        answer: 'Bisa keduanya — pilihan material dan detail desain disesuaikan dengan konteks pemakaian saat konsultasi.',
      },
      LOCATION_FAQ_ITEM,
      REVIEW_FAQ_ITEM,
    ],
    reviewHighlightIds: ['ahmad-jakarta-wedding'],
    relatedGuides: [
      { category: 'bandung', slug: 'custom-thobe' },
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'styling', slug: 'formal-thobe' },
    ],
    whatsappMessage: 'Halo Local Tailor, saya ingin konsultasi untuk custom baju koko di workshop Bandung.',
    ctaLabel: 'Konsultasi Baju Koko Custom',
  },

  // -----------------------------------------------------------------------
  // tailor-baju-umroh-bandung — travel/climate/quantity-specific angle,
  // reusing the real, already-shipped W6-5 umrah Knowledge cluster.
  // -----------------------------------------------------------------------
  {
    slug: 'tailor-baju-umroh-bandung',
    garmentLabel: 'thobe umroh',
    keywordPrimary: 'tailor baju umroh bandung',
    keywordSecondary: ['jahit baju umroh bandung', 'custom thobe umroh bandung', 'tailor umroh bandung'],
    hero: {
      eyebrow: 'Tailor Baju Umroh Bandung',
      headline: 'Tailor Baju Umroh Bandung — Material dan Jumlah Disesuaikan untuk Perjalanan Ibadah',
      subheadline:
        'Local Tailor membantu Anda memilih material yang tepat untuk iklim Mekkah dan Madinah, serta menentukan jumlah thobe umroh yang ideal — bukan sekadar menjahit tanpa mempertimbangkan kebutuhan perjalanan.',
      keywordPhrases: ['tailor baju umroh bandung', 'jahit baju umroh bandung', 'custom thobe umroh bandung'],
    },
    valueProps: [
      {
        title: 'Material Dipilih untuk Iklim Perjalanan',
        description: 'Rekomendasi material mempertimbangkan suhu dan kelembapan Mekkah-Madinah, bukan hanya preferensi estetika.',
      },
      {
        title: 'Panduan Jumlah Thobe yang Realistis',
        description: 'Konsultasi mencakup berapa thobe yang idealnya dibawa berdasarkan durasi perjalanan Anda.',
      },
      {
        title: 'Perawatan Selama Perjalanan Dijelaskan di Awal',
        description: 'Panduan perawatan kain selama perjalanan disampaikan saat konsultasi, agar garmen tetap rapi sepanjang ibadah.',
      },
      {
        title: 'Pola Personal yang Sama dengan Bespoke Reguler',
        description: 'Thobe umroh Anda tetap melalui proses pengukuran dan pola personal yang sama — bukan versi "cepat" yang dikurangi kualitasnya.',
      },
    ],
    faq: [
      {
        question: 'Material apa yang direkomendasikan untuk thobe umroh?',
        answer:
          'Material yang ringan dan menyerap keringat seperti katun Jepang atau linen umumnya direkomendasikan untuk iklim Mekkah-Madinah — detail lengkap dibahas saat konsultasi.',
      },
      {
        question: 'Berapa banyak thobe yang sebaiknya dibawa untuk umroh?',
        answer: 'Jumlah ideal tergantung durasi perjalanan Anda — panduan lengkap tersedia di artikel Knowledge kami dan dibahas saat konsultasi.',
      },
      {
        question: 'Apakah proses jahit thobe umroh berbeda dari thobe reguler?',
        answer: 'Prosesnya sama — pengukuran oleh fitter dan pola personal — hanya rekomendasi material dan jumlah yang disesuaikan untuk kebutuhan perjalanan.',
      },
      {
        question: 'Kapan sebaiknya mulai konsultasi sebelum keberangkatan umroh?',
        answer: 'Semakin awal semakin baik agar waktu produksi tidak terburu-buru — estimasi waktu ditampilkan langsung saat mendesain di Design Studio.',
      },
      LOCATION_FAQ_ITEM,
      REVIEW_FAQ_ITEM,
    ],
    reviewHighlightIds: ['yusuf-bandung-umrah'],
    relatedGuides: [
      { category: 'umrah', slug: 'best-fabric' },
      { category: 'umrah', slug: 'how-many-thobes' },
      { category: 'bandung', slug: 'custom-thobe' },
    ],
    whatsappMessage: 'Halo Local Tailor, saya ingin booking konsultasi thobe umroh di workshop Bandung.',
    ctaLabel: 'Booking Thobe Umroh',
  },
]

export function getServiceBySlug(slug: string): ServiceConfig | undefined {
  return SERVICE_CONFIGS.find((service) => service.slug === slug)
}

export function getAllServiceSlugs(): string[] {
  return SERVICE_CONFIGS.map((service) => service.slug)
}
