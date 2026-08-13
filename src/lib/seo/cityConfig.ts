import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'

// Sprint W8-2/W8-3 — Programmatic City Template Engine. Supersedes
// src/lib/seo/locations.ts (Sprint W8-1) with a richer, data-driven schema
// so every city page — including all future ones — renders from this one
// registry with zero new components. Adding a new city requires exactly
// one entry in CITY_CONFIGS below; src/app/locations/[city]/page.tsx's
// generateStaticParams already derives its routes from this array, so no
// new route file is needed either (better than the "one config + one
// route" scalability target this sprint asked for — one config is enough).
//
// Domain note (carried over from W8-1, still true): the locked business
// data's "Website: https://localtailor.id" is a real, separately-hosted
// WordPress site for the same business, not this Vercel project. Every
// canonical/OG/schema URL here uses FABRIC_SITE_ORIGIN instead, per the
// explicit decision made with the user in W8-1.
export const CITY_SITE_ORIGIN = FABRIC_SITE_ORIGIN

// Business Data (LOCKED). One real physical address — Bandung. Every other
// city in CITY_CONFIGS is a service-area landing page, never a fabricated
// branch: schema always carries this address, city targeting is signaled
// through `areaServed` only (see localBusiness.ts).
export const CITY_BUSINESS = {
  name: 'Local Tailor Bandung',
  streetAddress: 'Jl. Gamelan No.10, Buah Batu, Bandung, Jawa Barat, Indonesia',
  addressLocality: 'Bandung',
  addressRegion: 'Jawa Barat',
  postalCode: '40264',
  addressCountry: 'ID',
  website: 'https://localtailor.id',
  whatsappLocal: '085173334251',
  whatsappInternational: '6285173334251',
} as const

// Real street-level geocode for Jalan Gamelan, Turangga, Lengkong, Kota
// Bandung (OpenStreetMap Nominatim). Street-level accuracy, not verified to
// house number 10. No coordinates exist for any other city — no second
// physical location to geocode.
export const CITY_GEO_BANDUNG = {
  latitude: -6.9355653,
  longitude: 107.6305958,
} as const

// Real Google Maps search URL built from the real, verified address —
// not a fabricated pin, just a search query URL, so "Get Directions"
// resolves to wherever Google's own index currently places this address.
export const CITY_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CITY_BUSINESS.streetAddress)}`

export interface CityFaqItem {
  question: string
  answer: string
}

export interface CityHeroConfig {
  eyebrow: string
  headline: string
  subheadline: string
  /** Natural-language keyword phrases woven into on-page copy — never stuffed as a bare list. */
  keywordPhrases: string[]
}

export interface CityConfig {
  slug: string
  city: string
  province: string
  /** ISO 3166-2:ID region code, e.g. "JB" — for the `geo.region` meta tag. */
  provinceIsoCode: string
  /** true only for Bandung — the one real physical workshop/showroom. */
  isPrimary: boolean
  hero: CityHeroConfig
  /** Unique paragraph per city — no template-filled copy-paste across cities. */
  description: string
  trustStatement: string
  keywordPrimary: string
  keywordSecondary: string[]
  /**
   * Real, well-known neighborhoods/areas this city page mentions to serve
   * local-intent search — always framed as "we serve clients from X", never
   * as a branch or physical presence claim.
   */
  localContext: string[]
  /** Per-city service framing — same 4 underlying services, different emphasis/wording per city's actual angle. */
  services: { title: string; description: string }[]
  faq: CityFaqItem[]
  geo?: { latitude: number; longitude: number }
  /** ids into src/lib/marketing/copy.ts's reviewsCopy.reviews — only real matches, never fabricated per-city testimonials. */
  reviewHighlightIds: string[]
  relatedGuides: { category: string; slug: string }[]
}

// Shared FAQ base — the remote-consultation operating model is genuinely
// identical for every non-Bandung city (same WhatsApp booking, same
// Bandung-based fitter measurement, same nationwide shipping), so these
// answers are reused as true facts, not padded into artificial city-by-city
// variation. Each city's real differentiation lives in hero/description/
// localContext/services below, per this sprint's own "no copy-paste,
// genuine unique content" instruction.
const REMOTE_CONSULTATION_FAQ: CityFaqItem[] = [
  {
    question: 'Apakah saya harus datang langsung ke Bandung untuk memesan?',
    answer:
      'Tidak wajib untuk memulai. Anda bisa menjelajahi pilihan Model, Kerah, Manset, Material, dan Warna di Design Studio secara online, lalu konsultasi awal dilakukan via WhatsApp sebelum jadwal pengukuran ditentukan.',
  },
  {
    question: 'Bagaimana proses pengukuran jika saya di luar Bandung?',
    answer:
      'Pengukuran final untuk produksi tetap dilakukan langsung oleh fitter kami di workshop Bandung untuk memastikan Digital Body Profile Anda akurat — konsultasi dan koordinasi jadwal dilakukan via WhatsApp terlebih dahulu.',
  },
  {
    question: 'Apakah thobe custom bisa dikirim ke luar Bandung?',
    answer: 'Ya, setiap garmen bespoke yang selesai dikirim ke alamat Anda setelah proses quality control selesai.',
  },
]

// -----------------------------------------------------------------------
// Bandung — the domination page. Real physical location, keyword-dense
// hero (natural phrasing, not stuffed), 10 FAQ, and honest mentions of the
// real neighborhoods clients travel from — never framed as branches.
// -----------------------------------------------------------------------
const BANDUNG: CityConfig = {
  slug: 'bandung',
  city: 'Bandung',
  province: 'Jawa Barat',
  provinceIsoCode: 'JB',
  isPrimary: true,
  hero: {
    eyebrow: 'Tailor Bandung — Bespoke Thobe & Baju Koko',
    headline: 'Tailor Bandung untuk Custom Thobe dan Baju Koko, Dijahit di Workshop Kami Sendiri',
    subheadline:
      'Local Tailor Bandung adalah bespoke tailor Bandung yang mengerjakan setiap jahit thobe Bandung dan custom baju koko Bandung dari pola personal — bukan ukuran standar.',
    keywordPhrases: ['tailor bandung', 'penjahit bandung', 'bespoke tailor bandung', 'custom baju koko bandung', 'jahit thobe bandung'],
  },
  description:
    'Local Tailor Bandung berlokasi di Jl. Gamelan No.10, Buah Batu — sebagai tailor Bandung dan penjahit Bandung yang berfokus penuh pada bespoke tailoring, kami tidak menjual thobe atau baju koko siap pakai. Setiap pesanan dimulai dari konsultasi, dilanjutkan pengukuran langsung oleh fitter kami, lalu pola personal diformulasikan khusus untuk tubuh Anda sebelum kain dipotong. Sebagai tailor pria Bandung yang melayani kebutuhan formal, pernikahan, hingga umrah, workshop kami menjadi satu-satunya tempat konsultasi, pengukuran, dan produksi berlangsung — bukan sekadar showroom penjualan.',
  trustStatement: 'Satu-satunya lokasi fisik Local Tailor — konsultasi, pengukuran, dan produksi berlangsung di workshop yang sama di Buah Batu.',
  keywordPrimary: 'tailor bandung',
  keywordSecondary: ['penjahit bandung', 'tailor pria bandung', 'bespoke tailor bandung', 'jahit koko bandung', 'jahit thobe bandung'],
  localContext: ['Buah Batu', 'Dago', 'Setiabudi', 'Ciumbuleuit', 'Lembang', 'Cimahi', 'Pasteur', 'Antapani'],
  services: [
    { title: 'Konsultasi Tatap Muka', description: 'Diskusi langsung di workshop Buah Batu — model, bahan, dan detail konstruksi.' },
    { title: 'Custom Thobe & Baju Koko', description: 'Pilih Model, Kerah, Manset, Material, dan Warna, lalu lihat estimasi harga langsung.' },
    { title: 'Pengukuran Digital Body Profile', description: 'Diukur langsung oleh fitter, tersimpan untuk pemesanan berikutnya.' },
    { title: 'Bespoke Tailoring Penuh', description: 'Pola personal, produksi, dan quality control seluruhnya di satu workshop.' },
  ],
  faq: [
    {
      question: 'Di mana lokasi tailor Bandung Local Tailor?',
      answer: 'Workshop dan showroom kami berada di Jl. Gamelan No.10, Buah Batu, Bandung, Jawa Barat.',
    },
    {
      question: 'Apakah saya bisa datang langsung tanpa janji temu?',
      answer: 'Kami melayani dengan sistem Private Appointment — booking terlebih dahulu via WhatsApp agar sesi konsultasi Anda tidak terburu-buru.',
    },
    {
      question: 'Berapa lama proses dari konsultasi sampai thobe selesai?',
      answer: 'Waktu produksi tergantung pilihan material dan kapasitas workshop saat itu — estimasi ditampilkan langsung saat Anda mendesain di Design Studio.',
    },
    {
      question: 'Apakah Local Tailor menerima jahit baju koko custom, bukan hanya thobe?',
      answer: 'Ya. Sebagai bespoke tailor Bandung, kami mengerjakan custom baju koko dan thobe dengan proses pola personal yang sama.',
    },
    {
      question: 'Apakah klien dari luar Buah Batu, seperti Dago atau Setiabudi, bisa konsultasi di sini?',
      answer: 'Tentu — workshop kami di Buah Batu menerima klien dari seluruh area Bandung dan sekitarnya, termasuk Dago, Setiabudi, Ciumbuleuit, dan Antapani.',
    },
    {
      question: 'Apakah Local Tailor melayani klien dari Lembang atau Cimahi?',
      answer: 'Ya, klien dari Lembang, Cimahi, dan Pasteur biasa datang ke workshop kami di Buah Batu untuk konsultasi dan pengukuran.',
    },
    {
      question: 'Apa bedanya tailor Bandung ini dengan penjahit biasa?',
      answer: 'Penjahit biasa umumnya menyesuaikan pola template ke ukuran Anda. Sebagai bespoke tailor, pola kami diformulasikan dari nol khusus untuk tubuh Anda, tanpa template dasar.',
    },
    {
      question: 'Apakah ada parkir di sekitar workshop Jl. Gamelan?',
      answer: 'Jl. Gamelan berada di kawasan Buah Batu yang mudah diakses kendaraan pribadi — koordinasi lokasi lebih detail akan diberikan saat booking appointment via WhatsApp.',
    },
    {
      question: 'Bagaimana cara booking konsultasi di tailor Bandung ini?',
      answer: 'Booking dilakukan melalui WhatsApp — klik tombol Chat WhatsApp di halaman ini untuk mengatur jadwal Private Appointment.',
    },
    {
      question: 'Apakah harga jahit thobe Bandung di sini tetap/fixed?',
      answer:
        'Tidak ada daftar harga tetap karena setiap garmen dibuat sesuai pesanan (made-to-order) — harga tergantung material dan detail desain, dikonfirmasi saat konsultasi.',
    },
  ],
  geo: CITY_GEO_BANDUNG,
  reviewHighlightIds: ['yusuf-bandung-umrah'],
  relatedGuides: [
    { category: 'measurements', slug: 'how-to-measure-body' },
    { category: 'tailoring', slug: 'what-is-bespoke' },
    { category: 'fabrics', slug: 'egyptian-cotton' },
  ],
}

// -----------------------------------------------------------------------
// Jakarta — business-district / professional angle: SCBD, Sudirman,
// Kuningan, Kemang, framed around formal/business attire for professionals
// who need a bespoke thobe or koko around a demanding work schedule.
// -----------------------------------------------------------------------
const JAKARTA: CityConfig = {
  slug: 'jakarta',
  city: 'Jakarta',
  province: 'DKI Jakarta',
  provinceIsoCode: 'JK',
  isPrimary: false,
  hero: {
    eyebrow: 'Bespoke Thobe untuk Profesional Jakarta',
    headline: 'Custom Thobe Jakarta — Bespoke Tailoring untuk Jadwal Padat Profesional',
    subheadline: 'Konsultasi via WhatsApp yang menyesuaikan jadwal kerja Anda di SCBD, Sudirman, atau Kuningan — pengukuran dan produksi tetap di workshop Bandung.',
    keywordPhrases: ['custom thobe jakarta', 'bespoke tailor jakarta', 'jahit koko jakarta'],
  },
  description:
    'Klien kami di Jakarta sebagian besar adalah profesional dengan jadwal padat di kawasan SCBD, Sudirman, dan Kuningan yang membutuhkan busana formal untuk acara kantor, pertemuan klien, atau ibadah Jumat tanpa mengorbankan presisi bespoke. Konsultasi awal dilakukan sepenuhnya via WhatsApp di luar jam kerja Anda, dan Design Studio kami memungkinkan eksplorasi model serta bahan business-appropriate — warna netral, potongan rapi — sebelum jadwal pengukuran ditentukan. Kemang juga menjadi salah satu area asal klien kami yang mencari thobe custom dengan sentuhan lebih santai namun tetap premium untuk acara keluarga maupun sosial.',
  trustStatement: 'Dipercaya profesional di Jakarta — dari kawasan SCBD hingga Kemang — untuk busana formal dan bespoke berkualitas.',
  keywordPrimary: 'custom thobe jakarta',
  keywordSecondary: ['bespoke tailor jakarta', 'jahit koko jakarta', 'tailor pria jakarta'],
  localContext: ['SCBD', 'Sudirman', 'Kuningan', 'Kemang'],
  services: [
    { title: 'Konsultasi Fleksibel via WhatsApp', description: 'Dijadwalkan menyesuaikan jam kerja profesional di SCBD, Sudirman, atau Kuningan.' },
    { title: 'Business-Appropriate Thobe & Koko', description: 'Pilihan warna dan material yang sesuai untuk acara kantor dan formal.' },
    { title: 'Digital Body Profile', description: 'Pengukuran dijadwalkan sekali, tersimpan untuk pemesanan berikutnya tanpa perlu diulang.' },
    { title: 'Pengiriman ke Jakarta', description: 'Garmen selesai dikirim langsung ke alamat Anda setelah quality control.' },
  ],
  faq: REMOTE_CONSULTATION_FAQ,
  reviewHighlightIds: ['ahmad-jakarta-wedding'],
  relatedGuides: [
    { category: 'wedding', slug: 'akad-pria' },
    { category: 'umrah', slug: 'best-fabric' },
    { category: 'measurements', slug: 'thobe-size-guide' },
  ],
}

// -----------------------------------------------------------------------
// Bekasi — family/wedding angle: Summarecon, Grand Galaxy Park, Harapan
// Indah, residential township context, framed around wedding & family
// occasions rather than daily business wear.
// -----------------------------------------------------------------------
const BEKASI: CityConfig = {
  slug: 'bekasi',
  city: 'Bekasi',
  province: 'Jawa Barat',
  provinceIsoCode: 'JB',
  isPrimary: false,
  hero: {
    eyebrow: 'Bespoke Thobe untuk Keluarga Bekasi',
    headline: 'Custom Thobe Bekasi — Bespoke Tailoring untuk Momen Pernikahan dan Keluarga',
    subheadline: 'Melayani klien di Summarecon, Grand Galaxy Park, dan Harapan Indah — konsultasi via WhatsApp, garmen dikirim langsung ke rumah Anda.',
    keywordPhrases: ['custom thobe bekasi', 'jahit thobe bekasi', 'bespoke tailor bekasi'],
  },
  description:
    'Banyak klien kami di Bekasi datang dari kawasan hunian seperti Summarecon, Grand Galaxy Park, dan Harapan Indah, umumnya memesan menjelang momen pernikahan — baik untuk mempelai pria maupun untuk seragam keluarga besar yang ingin tampil serasi di hari akad atau resepsi. Karena acara keluarga seperti ini biasanya melibatkan beberapa anggota sekaligus, konsultasi via WhatsApp membantu menyelaraskan pilihan warna dan material sebelum jadwal pengukuran masing-masing ditentukan. Setiap garmen tetap dibuat dari pola personal per individu, bukan disamaratakan, meski dipesan sebagai satu rangkaian acara keluarga.',
  trustStatement: 'Dipercaya keluarga di Bekasi — dari Summarecon hingga Harapan Indah — untuk momen pernikahan dan acara keluarga.',
  keywordPrimary: 'custom thobe bekasi',
  keywordSecondary: ['jahit thobe bekasi', 'bespoke tailor bekasi', 'thobe pernikahan bekasi'],
  localContext: ['Summarecon', 'Grand Galaxy Park', 'Harapan Indah'],
  services: [
    { title: 'Konsultasi Keluarga via WhatsApp', description: 'Menyelaraskan pilihan warna dan material untuk beberapa anggota keluarga sekaligus.' },
    { title: 'Thobe Pernikahan Custom', description: 'Untuk mempelai pria maupun seragam keluarga di hari akad dan resepsi.' },
    { title: 'Pengukuran Per Individu', description: 'Setiap anggota keluarga tetap diukur dan dipolakan secara personal.' },
    { title: 'Pengiriman ke Bekasi', description: 'Garmen selesai dikirim ke Summarecon, Grand Galaxy Park, Harapan Indah, dan sekitarnya.' },
  ],
  faq: REMOTE_CONSULTATION_FAQ,
  reviewHighlightIds: [],
  relatedGuides: [
    { category: 'wedding', slug: 'resepsi-pria' },
    { category: 'umrah', slug: 'how-many-thobes' },
    { category: 'measurements', slug: 'thobe-size-guide' },
  ],
}

// -----------------------------------------------------------------------
// Tangerang — corporate/event angle: BSD, Alam Sutera, Gading Serpong,
// modern township context, framed around corporate events rather than
// daily business wear (Jakarta) or family weddings (Bekasi).
// -----------------------------------------------------------------------
const TANGERANG: CityConfig = {
  slug: 'tangerang',
  city: 'Tangerang',
  province: 'Banten',
  provinceIsoCode: 'BT',
  isPrimary: false,
  hero: {
    eyebrow: 'Bespoke Thobe untuk Acara Korporat Tangerang',
    headline: 'Custom Thobe Tangerang — Bespoke Tailoring untuk Acara Korporat dan Formal',
    subheadline: 'Melayani klien di BSD, Alam Sutera, dan Gading Serpong — cocok untuk acara korporat, gathering, dan event formal perusahaan.',
    keywordPhrases: ['custom thobe tangerang', 'bespoke tailor tangerang', 'jahit koko tangerang'],
  },
  description:
    'Klien kami di Tangerang banyak berasal dari kawasan township modern seperti BSD, Alam Sutera, dan Gading Serpong, sering kali memesan menjelang acara korporat — gathering perusahaan, buka puasa bersama kantor, atau event formal lain yang mengharuskan tampilan seragam namun tetap personal. Konsultasi via WhatsApp memudahkan koordinasi jika pemesanan dilakukan untuk beberapa karyawan atau rekan kerja sekaligus, dengan pilihan model dan warna yang bisa diselaraskan tanpa membuat setiap garmen terasa generik — pola tetap diformulasikan personal per pemesan, bukan seragam massal.',
  trustStatement: 'Dipercaya profesional dan tim korporat di Tangerang — dari BSD hingga Gading Serpong — untuk acara formal dan event perusahaan.',
  keywordPrimary: 'custom thobe tangerang',
  keywordSecondary: ['bespoke tailor tangerang', 'jahit koko tangerang', 'thobe korporat tangerang'],
  localContext: ['BSD', 'Alam Sutera', 'Gading Serpong'],
  services: [
    { title: 'Konsultasi untuk Pemesanan Grup', description: 'Koordinasi warna dan model untuk kebutuhan acara korporat atau gathering.' },
    { title: 'Thobe & Koko untuk Event Formal', description: 'Cocok untuk buka puasa bersama, gathering, atau acara resmi perusahaan.' },
    { title: 'Pola Personal per Individu', description: 'Meski dipesan sebagai grup, setiap garmen tetap dipolakan khusus untuk pemakainya.' },
    { title: 'Pengiriman ke Tangerang', description: 'Garmen selesai dikirim ke BSD, Alam Sutera, Gading Serpong, dan sekitarnya.' },
  ],
  faq: REMOTE_CONSULTATION_FAQ,
  reviewHighlightIds: [],
  relatedGuides: [
    { category: 'umrah', slug: 'climate-guide' },
    { category: 'fabrics', slug: 'linen' },
    { category: 'measurements', slug: 'thobe-size-guide' },
  ],
}

// -----------------------------------------------------------------------
// Surabaya — wedding/formalwear angle: Pakuwon, Citraland, Darmo, East
// Java's largest city, framed around wedding and formal occasions with its
// own cultural note distinct from Jakarta's business framing.
// -----------------------------------------------------------------------
const SURABAYA: CityConfig = {
  slug: 'surabaya',
  city: 'Surabaya',
  province: 'Jawa Timur',
  provinceIsoCode: 'JI',
  isPrimary: false,
  hero: {
    eyebrow: 'Bespoke Thobe untuk Pernikahan Surabaya',
    headline: 'Custom Thobe Surabaya — Bespoke Tailoring untuk Pernikahan dan Formalwear',
    subheadline: 'Melayani klien di Pakuwon, Citraland, dan Darmo — bespoke tailoring untuk pernikahan dan acara formal khas Jawa Timur.',
    keywordPhrases: ['custom thobe surabaya', 'bespoke tailor surabaya', 'jahit thobe surabaya'],
  },
  description:
    'Sebagai kota terbesar di Jawa Timur, Surabaya punya tradisi pernikahan dan acara formal tersendiri, dan klien kami dari kawasan Pakuwon, Citraland, hingga Darmo umumnya mencari thobe custom untuk momen tersebut — bukan sekadar busana sehari-hari. Konsultasi awal via WhatsApp membantu menentukan potongan dan material yang sesuai dengan gaya formalwear yang diinginkan, baik untuk akad, resepsi, maupun acara keagamaan lain, sebelum jadwal pengukuran final oleh fitter kami di Bandung ditentukan. Jarak antar kota bukan hambatan karena setiap tahap — dari konsultasi hingga pengiriman — sudah dirancang untuk klien luar Bandung.',
  trustStatement: 'Dipercaya klien di Surabaya — dari Pakuwon hingga Darmo — untuk pernikahan dan formalwear bespoke.',
  keywordPrimary: 'custom thobe surabaya',
  keywordSecondary: ['bespoke tailor surabaya', 'jahit thobe surabaya', 'thobe pernikahan surabaya'],
  localContext: ['Pakuwon', 'Citraland', 'Darmo'],
  services: [
    { title: 'Konsultasi Formalwear via WhatsApp', description: 'Menentukan potongan dan material untuk akad, resepsi, atau acara keagamaan.' },
    { title: 'Thobe Pernikahan Custom', description: 'Dirancang khusus untuk momen formal, bukan busana harian.' },
    { title: 'Pengukuran Dijadwalkan', description: 'Fitter kami di Bandung mengonfirmasi ukuran final sebelum produksi.' },
    { title: 'Pengiriman ke Surabaya', description: 'Garmen selesai dikirim ke Pakuwon, Citraland, Darmo, dan sekitarnya.' },
  ],
  faq: REMOTE_CONSULTATION_FAQ,
  reviewHighlightIds: ['rizky-surabaya-daily-wear'],
  relatedGuides: [
    { category: 'measurements', slug: 'thobe-size-guide' },
    { category: 'tailoring', slug: 'what-is-bespoke' },
    { category: 'fabrics', slug: 'premium-cotton' },
  ],
}

export const CITY_CONFIGS: CityConfig[] = [BANDUNG, JAKARTA, BEKASI, TANGERANG, SURABAYA]

export function getCityBySlug(slug: string): CityConfig | undefined {
  return CITY_CONFIGS.find((city) => city.slug === slug)
}

export function getAllCitySlugs(): string[] {
  return CITY_CONFIGS.map((city) => city.slug)
}

/** Sibling city pages, for cross-linking (Bandung <-> Jakarta <-> Bekasi <-> Tangerang <-> Surabaya). */
export function getOtherCities(currentSlug: string): CityConfig[] {
  return CITY_CONFIGS.filter((city) => city.slug !== currentSlug)
}
