import type { KnowledgeCategorySlug } from '@/lib/knowledge/types'
import { CITY_CONFIGS } from '@/lib/seo/cityConfig'
import type { QueryIntent } from './queryIntent'

// Sprint W6-9 — Long-tail keyword repository, 152 entries across the 8
// clusters the brief names (Fabric/Measurement/Styling/Wedding/Umrah/
// Tailoring/Care/Bandung). Every `targetPage` references a real route that
// exists in this codebase as of W6-10 — none point at a page that doesn't
// exist yet. commercialScore/authorityScore are 1-10 editorial judgment
// calls (how close to a purchase decision / how much topical-authority
// value the query carries), not derived from any real search-volume data
// source — there's no Search Console or keyword-tool connection in this
// project, matching the brief's "Tidak perlu koneksi API" instruction.
//
// Sprint W6R.2 — National GEO + Query Expansion. Extends the repository
// past 500 entries across product/service/commercial-modifier/occasion/
// fit/fabric/style queries and every non-Bandung city in CITY_CONFIGS —
// while deliberately consolidating, not fragmenting: every city-local
// query below targets the ONE /locations/[city] page for that city, never
// a new per-keyword URL (see CITY_KEYWORDS' builder below and this
// sprint's own "1 kota = 1 halaman" rule). `cluster` uses KeywordCluster
// (KnowledgeCategorySlug plus 'locations') rather than widening
// KnowledgeCategorySlug itself, since that type is also used for real
// /knowledge/[category] routing elsewhere and 'locations' has no matching
// KnowledgeCategory entry.

export type KeywordCluster = KnowledgeCategorySlug | 'locations'

export interface KeywordEntry {
  primaryKeyword: string
  secondaryKeyword: string
  intent: QueryIntent
  targetPage: string
  cluster: KeywordCluster
  commercialScore: number
  authorityScore: number
}

const FABRIC_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'bahan thobe terbaik', secondaryKeyword: 'bahan thobe premium', intent: 'informational', targetPage: '/knowledge/fabrics', cluster: 'fabrics', commercialScore: 4, authorityScore: 8 },
  { primaryKeyword: 'linen untuk thobe', secondaryKeyword: 'kain linen adem', intent: 'informational', targetPage: '/knowledge/fabrics/linen', cluster: 'fabrics', commercialScore: 3, authorityScore: 8 },
  { primaryKeyword: 'katun mesir thobe', secondaryKeyword: 'egyptian cotton thobe', intent: 'informational', targetPage: '/knowledge/fabrics/egyptian-cotton', cluster: 'fabrics', commercialScore: 3, authorityScore: 8 },
  { primaryKeyword: 'katun jepang thobe', secondaryKeyword: 'japanese cotton thobe', intent: 'informational', targetPage: '/knowledge/fabrics/japanese-cotton', cluster: 'fabrics', commercialScore: 3, authorityScore: 7 },
  { primaryKeyword: 'bahan thobe adem cuaca panas', secondaryKeyword: 'kain sejuk thobe', intent: 'informational', targetPage: '/knowledge/fabrics/linen', cluster: 'fabrics', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'perbedaan katun dan polyester thobe', secondaryKeyword: 'katun vs polyester', intent: 'comparison', targetPage: '/knowledge/fabrics/premium-polyester', cluster: 'fabrics', commercialScore: 5, authorityScore: 7 },
  { primaryKeyword: 'bahan wool blend thobe', secondaryKeyword: 'wool blend thobe formal', intent: 'informational', targetPage: '/knowledge/fabrics/wool-blend', cluster: 'fabrics', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'kain poplin thobe', secondaryKeyword: 'poplin vs oxford', intent: 'comparison', targetPage: '/knowledge/fabrics/poplin', cluster: 'fabrics', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'bahan oxford thobe', secondaryKeyword: 'oxford cotton thobe', intent: 'informational', targetPage: '/knowledge/fabrics/oxford', cluster: 'fabrics', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'bahan twill thobe', secondaryKeyword: 'twill kuat tahan lama', intent: 'informational', targetPage: '/knowledge/fabrics/twill', cluster: 'fabrics', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'bahan rayon thobe', secondaryKeyword: 'rayon jatuh lembut', intent: 'informational', targetPage: '/knowledge/fabrics/rayon', cluster: 'fabrics', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'premium cotton thobe', secondaryKeyword: 'katun premium serbaguna', intent: 'informational', targetPage: '/knowledge/fabrics/premium-cotton', cluster: 'fabrics', commercialScore: 5, authorityScore: 7 },
  { primaryKeyword: 'bahan thobe tidak mudah kusut', secondaryKeyword: 'kain anti kusut thobe', intent: 'commercial', targetPage: '/knowledge/fabrics/premium-polyester', cluster: 'fabrics', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'bahan thobe paling lembut', secondaryKeyword: 'kain thobe halus', intent: 'informational', targetPage: '/knowledge/fabrics/egyptian-cotton', cluster: 'fabrics', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'cara memilih bahan thobe', secondaryKeyword: 'tips pilih bahan thobe', intent: 'informational', targetPage: '/knowledge/fabrics', cluster: 'fabrics', commercialScore: 6, authorityScore: 8 },
  { primaryKeyword: 'bahan thobe formal terbaik', secondaryKeyword: 'kain thobe kantor', intent: 'commercial', targetPage: '/knowledge/fabrics/wool-blend', cluster: 'fabrics', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'bahan thobe harian nyaman', secondaryKeyword: 'kain thobe santai', intent: 'informational', targetPage: '/knowledge/fabrics/premium-cotton', cluster: 'fabrics', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'harga bahan thobe premium', secondaryKeyword: 'biaya kain thobe bespoke', intent: 'commercial', targetPage: '/knowledge/fabrics', cluster: 'fabrics', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'bahan thobe tahan lama', secondaryKeyword: 'kain thobe awet', intent: 'informational', targetPage: '/knowledge/fabrics/premium-cotton', cluster: 'fabrics', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'jenis-jenis bahan thobe', secondaryKeyword: 'macam kain thobe', intent: 'informational', targetPage: '/knowledge/fabrics', cluster: 'fabrics', commercialScore: 4, authorityScore: 8 },
]

const MEASUREMENT_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'cara mengukur badan thobe', secondaryKeyword: 'panduan ukur thobe sendiri', intent: 'informational', targetPage: '/knowledge/measurements/how-to-measure-body', cluster: 'measurements', commercialScore: 4, authorityScore: 8 },
  { primaryKeyword: 'cara mengukur dada thobe', secondaryKeyword: 'ukur lingkar dada', intent: 'informational', targetPage: '/knowledge/measurements/chest', cluster: 'measurements', commercialScore: 3, authorityScore: 7 },
  { primaryKeyword: 'cara mengukur bahu thobe', secondaryKeyword: 'lebar bahu thobe', intent: 'informational', targetPage: '/knowledge/measurements/shoulder', cluster: 'measurements', commercialScore: 3, authorityScore: 7 },
  { primaryKeyword: 'cara mengukur lengan thobe', secondaryKeyword: 'panjang lengan thobe', intent: 'informational', targetPage: '/knowledge/measurements/sleeve', cluster: 'measurements', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'cara mengukur leher thobe', secondaryKeyword: 'lingkar leher thobe', intent: 'informational', targetPage: '/knowledge/measurements/neck', cluster: 'measurements', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'cara mengukur panjang badan thobe', secondaryKeyword: 'panjang thobe ideal', intent: 'informational', targetPage: '/knowledge/measurements/length', cluster: 'measurements', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'size chart thobe pria', secondaryKeyword: 'tabel ukuran thobe', intent: 'commercial', targetPage: '/knowledge/measurements/thobe-size-guide', cluster: 'measurements', commercialScore: 6, authorityScore: 7 },
  { primaryKeyword: 'slim fit vs regular fit thobe', secondaryKeyword: 'perbedaan slim regular relaxed', intent: 'comparison', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 6, authorityScore: 7 },
  { primaryKeyword: 'ukuran thobe XL berapa cm', secondaryKeyword: 'ukuran thobe besar', intent: 'transactional', targetPage: '/knowledge/measurements/thobe-size-guide', cluster: 'measurements', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'digital body profile thobe', secondaryKeyword: 'profil ukuran tersimpan', intent: 'commercial', targetPage: '/knowledge/measurements/how-to-measure-body', cluster: 'measurements', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'cara tahu ukuran thobe tanpa diukur', secondaryKeyword: 'estimasi ukuran thobe', intent: 'transactional', targetPage: '/free-body-profile-estimator', cluster: 'measurements', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'berapa cm kelonggaran thobe', secondaryKeyword: 'ease ukuran thobe', intent: 'informational', targetPage: '/knowledge/measurements/chest', cluster: 'measurements', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'ukuran thobe untuk badan gemuk', secondaryKeyword: 'thobe fit besar', intent: 'informational', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'ukuran thobe untuk badan kurus', secondaryKeyword: 'thobe fit slim', intent: 'informational', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'kesalahan mengukur badan sendiri', secondaryKeyword: 'tips ukur badan akurat', intent: 'informational', targetPage: '/knowledge/measurements/how-to-measure-body', cluster: 'measurements', commercialScore: 3, authorityScore: 7 },
  { primaryKeyword: 'berapa titik ukur thobe', secondaryKeyword: 'titik ukur penting thobe', intent: 'informational', targetPage: '/knowledge/measurements/how-to-measure-body', cluster: 'measurements', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'cara memastikan ukuran thobe pas', secondaryKeyword: 'tips thobe pas badan', intent: 'commercial', targetPage: '/knowledge/measurements/thobe-size-guide', cluster: 'measurements', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'ukuran thobe anak vs dewasa', secondaryKeyword: 'size chart perbandingan usia', intent: 'informational', targetPage: '/knowledge/measurements/thobe-size-guide', cluster: 'measurements', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'pengukuran ulang thobe kapan perlu', secondaryKeyword: 'update ukuran badan', intent: 'informational', targetPage: '/knowledge/measurements/how-to-measure-body', cluster: 'measurements', commercialScore: 4, authorityScore: 6 },
]

const STYLING_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'warna thobe navy elegan', secondaryKeyword: 'thobe navy formal', intent: 'informational', targetPage: '/knowledge/styling/navy-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 7 },
  { primaryKeyword: 'thobe olive santai', secondaryKeyword: 'warna thobe earthy', intent: 'informational', targetPage: '/knowledge/styling/olive-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'thobe hitam formal', secondaryKeyword: 'warna thobe malam hari', intent: 'informational', targetPage: '/knowledge/styling/black-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'thobe putih ibadah', secondaryKeyword: 'warna thobe tradisional', intent: 'informational', targetPage: '/knowledge/styling/white-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'gaya thobe formal kantor', secondaryKeyword: 'outfit thobe kerja', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 6, authorityScore: 7 },
  { primaryKeyword: 'gaya thobe casual harian', secondaryKeyword: 'outfit thobe santai', intent: 'informational', targetPage: '/knowledge/styling/casual-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'gaya thobe pernikahan', secondaryKeyword: 'outfit thobe wedding', intent: 'commercial', targetPage: '/knowledge/styling/wedding-thobe-style', cluster: 'styling', commercialScore: 7, authorityScore: 7 },
  { primaryKeyword: 'gaya thobe umrah', secondaryKeyword: 'outfit thobe ibadah', intent: 'commercial', targetPage: '/knowledge/styling/umrah-thobe-style', cluster: 'styling', commercialScore: 7, authorityScore: 7 },
  { primaryKeyword: 'kombinasi warna thobe dan aksesori', secondaryKeyword: 'padu padan thobe', intent: 'informational', targetPage: '/knowledge/styling/navy-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'thobe warna apa paling serbaguna', secondaryKeyword: 'warna thobe aman', intent: 'informational', targetPage: '/knowledge/styling/navy-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'aksesori thobe formal', secondaryKeyword: 'bisht thobe pernikahan', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'rekomendasi bahan untuk thobe navy', secondaryKeyword: 'bahan cocok warna gelap', intent: 'informational', targetPage: '/knowledge/styling/navy-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'thobe warna apa untuk kulit gelap', secondaryKeyword: 'pilihan warna thobe kulit', intent: 'informational', targetPage: '/knowledge/styling/navy-thobe', cluster: 'styling', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'gaya thobe modern', secondaryKeyword: 'thobe kekinian', intent: 'informational', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'thobe casual vs formal bedanya apa', secondaryKeyword: 'perbandingan gaya thobe', intent: 'comparison', targetPage: '/knowledge/styling/casual-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'cara memilih warna thobe acara', secondaryKeyword: 'tips warna thobe', intent: 'commercial', targetPage: '/knowledge/styling', cluster: 'styling', commercialScore: 6, authorityScore: 7 },
  { primaryKeyword: 'thobe warna krem cocok untuk apa', secondaryKeyword: 'gaya thobe netral', intent: 'informational', targetPage: '/knowledge/styling/white-thobe', cluster: 'styling', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'outfit thobe untuk foto formal', secondaryKeyword: 'gaya thobe fotogenik', intent: 'informational', targetPage: '/knowledge/styling/wedding-thobe-style', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe warna gelap vs terang', secondaryKeyword: 'perbandingan warna thobe', intent: 'comparison', targetPage: '/knowledge/styling/black-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 6 },
]

const WEDDING_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'thobe akad nikah pria', secondaryKeyword: 'outfit akad muslim', intent: 'commercial', targetPage: '/knowledge/wedding/akad-pria', cluster: 'wedding', commercialScore: 8, authorityScore: 7 },
  { primaryKeyword: 'thobe resepsi pernikahan pria', secondaryKeyword: 'outfit resepsi muslim', intent: 'commercial', targetPage: '/knowledge/wedding/resepsi-pria', cluster: 'wedding', commercialScore: 8, authorityScore: 7 },
  { primaryKeyword: 'outfit couple muslim pernikahan', secondaryKeyword: 'baju couple nikah islami', intent: 'commercial', targetPage: '/knowledge/wedding/couple-muslim', cluster: 'wedding', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'berapa lama pesan thobe pernikahan', secondaryKeyword: 'timeline thobe custom wedding', intent: 'transactional', targetPage: '/knowledge/wedding/timeline-custom-wedding', cluster: 'wedding', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'warna thobe pernikahan sesuai tema', secondaryKeyword: 'panduan warna wedding', intent: 'commercial', targetPage: '/knowledge/wedding/color-guide', cluster: 'wedding', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'family outfit pernikahan muslim', secondaryKeyword: 'outfit keluarga pengantin', intent: 'commercial', targetPage: '/knowledge/wedding/family-outfit', cluster: 'wedding', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'thobe premium pernikahan', secondaryKeyword: 'thobe mewah wedding', intent: 'transactional', targetPage: '/knowledge/wedding/premium-thobe-wedding', cluster: 'wedding', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'panduan lengkap thobe pernikahan', secondaryKeyword: 'bespoke wedding guide', intent: 'commercial', targetPage: '/knowledge/wedding/bespoke-wedding-guide', cluster: 'wedding', commercialScore: 8, authorityScore: 8 },
  { primaryKeyword: 'sewa vs bespoke thobe pernikahan', secondaryKeyword: 'beli custom thobe nikah', intent: 'comparison', targetPage: '/knowledge/wedding/bespoke-wedding-guide', cluster: 'wedding', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'thobe pengantin pria custom', secondaryKeyword: 'bespoke groom outfit', intent: 'transactional', targetPage: '/knowledge/wedding/premium-thobe-wedding', cluster: 'wedding', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'bisht untuk akad nikah', secondaryKeyword: 'aksesori pernikahan pria muslim', intent: 'commercial', targetPage: '/knowledge/wedding/akad-pria', cluster: 'wedding', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'thobe pernikahan bahan apa', secondaryKeyword: 'bahan terbaik wedding thobe', intent: 'informational', targetPage: '/knowledge/wedding/premium-thobe-wedding', cluster: 'wedding', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'tailor pernikahan muslim Bandung', secondaryKeyword: 'jasa jahit wedding Bandung', intent: 'local', targetPage: '/knowledge/bandung/wedding-tailor', cluster: 'wedding', commercialScore: 9, authorityScore: 6 },
  { primaryKeyword: 'konsultasi thobe pernikahan', secondaryKeyword: 'booking fitting wedding', intent: 'transactional', targetPage: '/book-appointment', cluster: 'wedding', commercialScore: 9, authorityScore: 5 },
  { primaryKeyword: 'berapa thobe dibutuhkan untuk pernikahan', secondaryKeyword: 'jumlah outfit pernikahan', intent: 'informational', targetPage: '/knowledge/wedding/family-outfit', cluster: 'wedding', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'thobe pernikahan warna navy atau hitam', secondaryKeyword: 'pilihan warna wedding', intent: 'comparison', targetPage: '/knowledge/wedding/color-guide', cluster: 'wedding', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'outfit ayah pengantin pria', secondaryKeyword: 'family outfit ayah', intent: 'commercial', targetPage: '/knowledge/wedding/family-outfit', cluster: 'wedding', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'jadwal fitting sebelum nikah', secondaryKeyword: 'timeline fitting pernikahan', intent: 'transactional', targetPage: '/knowledge/wedding/timeline-custom-wedding', cluster: 'wedding', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'thobe pernikahan vs thobe formal biasa', secondaryKeyword: 'perbedaan thobe wedding', intent: 'comparison', targetPage: '/knowledge/wedding/bespoke-wedding-guide', cluster: 'wedding', commercialScore: 5, authorityScore: 6 },
]

const UMRAH_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'bahan terbaik untuk umrah', secondaryKeyword: 'kain adem untuk umrah', intent: 'commercial', targetPage: '/knowledge/umrah/best-fabric', cluster: 'umrah', commercialScore: 7, authorityScore: 7 },
  { primaryKeyword: 'berapa thobe untuk umrah 9 hari', secondaryKeyword: 'jumlah baju umrah', intent: 'informational', targetPage: '/knowledge/umrah/how-many-thobes', cluster: 'umrah', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'warna thobe untuk umrah', secondaryKeyword: 'warna baju ihram thobe', intent: 'informational', targetPage: '/knowledge/umrah/color-guide', cluster: 'umrah', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'panduan packing thobe umrah', secondaryKeyword: 'tips packing baju umrah', intent: 'commercial', targetPage: '/knowledge/umrah/packing-guide', cluster: 'umrah', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'cara mencuci baju saat umrah', secondaryKeyword: 'cuci thobe di hotel', intent: 'informational', targetPage: '/knowledge/umrah/care-during-travel', cluster: 'umrah', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'cuaca Mekkah Madinah bulan apa', secondaryKeyword: 'suhu Mekkah saat umrah', intent: 'informational', targetPage: '/knowledge/umrah/climate-guide', cluster: 'umrah', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'thobe umrah premium', secondaryKeyword: 'outfit umrah mewah', intent: 'transactional', targetPage: '/knowledge/umrah/premium-umrah-outfit', cluster: 'umrah', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'custom thobe khusus umrah', secondaryKeyword: 'thobe umrah bespoke', intent: 'transactional', targetPage: '/knowledge/umrah/custom-umrah-thobe', cluster: 'umrah', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'thobe umrah bahan linen atau katun', secondaryKeyword: 'pilihan bahan umrah', intent: 'comparison', targetPage: '/knowledge/umrah/best-fabric', cluster: 'umrah', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'tailor thobe umrah Bandung', secondaryKeyword: 'jasa jahit thobe umrah Bandung', intent: 'local', targetPage: '/knowledge/bandung/umrah-thobe', cluster: 'umrah', commercialScore: 9, authorityScore: 6 },
  { primaryKeyword: 'konsultasi thobe umrah', secondaryKeyword: 'booking fitting umrah', intent: 'transactional', targetPage: '/book-appointment', cluster: 'umrah', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'thobe umrah manset mudah wudhu', secondaryKeyword: 'desain thobe untuk wudhu', intent: 'informational', targetPage: '/knowledge/umrah/custom-umrah-thobe', cluster: 'umrah', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'kantong mushaf saku thobe umrah', secondaryKeyword: 'thobe umrah kantong dalam', intent: 'informational', targetPage: '/knowledge/umrah/custom-umrah-thobe', cluster: 'umrah', commercialScore: 4, authorityScore: 4 },
  { primaryKeyword: 'thobe umrah tahan lama perjalanan', secondaryKeyword: 'baju umrah kuat', intent: 'informational', targetPage: '/knowledge/umrah/best-fabric', cluster: 'umrah', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'persiapan baju sebelum umrah', secondaryKeyword: 'checklist pakaian umrah', intent: 'commercial', targetPage: '/knowledge/umrah/packing-guide', cluster: 'umrah', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'thobe umrah warna putih atau krem', secondaryKeyword: 'pilihan warna ihram thobe', intent: 'comparison', targetPage: '/knowledge/umrah/color-guide', cluster: 'umrah', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'cara merawat thobe setelah umrah', secondaryKeyword: 'simpan thobe pasca umrah', intent: 'informational', targetPage: '/knowledge/umrah/care-during-travel', cluster: 'umrah', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe umrah cepat kering', secondaryKeyword: 'bahan cepat kering umrah', intent: 'informational', targetPage: '/knowledge/umrah/best-fabric', cluster: 'umrah', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'musim umrah terbaik untuk berangkat', secondaryKeyword: 'waktu ideal umrah', intent: 'informational', targetPage: '/knowledge/umrah/climate-guide', cluster: 'umrah', commercialScore: 3, authorityScore: 5 },
]

const TAILORING_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'apa itu bespoke thobe', secondaryKeyword: 'arti bespoke sebenarnya', intent: 'informational', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 5, authorityScore: 8 },
  { primaryKeyword: 'bespoke vs made to measure', secondaryKeyword: 'perbedaan bespoke MTM', intent: 'comparison', targetPage: '/knowledge/tailoring/bespoke-vs-made-to-measure', cluster: 'tailoring', commercialScore: 6, authorityScore: 8 },
  { primaryKeyword: 'proses pattern drafting thobe', secondaryKeyword: 'cara pola thobe dibuat', intent: 'informational', targetPage: '/knowledge/tailoring/pattern-drafting', cluster: 'tailoring', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'apa itu interlining thobe', secondaryKeyword: 'fungsi lapisan kerah thobe', intent: 'informational', targetPage: '/knowledge/tailoring/interlining-guide', cluster: 'tailoring', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'konstruksi kerah thobe', secondaryKeyword: 'cara kerah thobe dibuat', intent: 'informational', targetPage: '/knowledge/tailoring/collar-construction', cluster: 'tailoring', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'konstruksi lengan thobe', secondaryKeyword: 'kerung lengan nyaman', intent: 'informational', targetPage: '/knowledge/tailoring/sleeve-construction', cluster: 'tailoring', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'jahitan tangan thobe bespoke', secondaryKeyword: 'detail handmade thobe', intent: 'informational', targetPage: '/knowledge/tailoring/handmade-details', cluster: 'tailoring', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'quality control thobe bespoke', secondaryKeyword: 'proses cek kualitas thobe', intent: 'informational', targetPage: '/knowledge/tailoring/quality-control', cluster: 'tailoring', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'tailor bespoke Bandung', secondaryKeyword: 'penjahit custom Bandung', intent: 'local', targetPage: '/knowledge/bandung/bespoke-tailor', cluster: 'tailoring', commercialScore: 9, authorityScore: 6 },
  { primaryKeyword: 'berapa lama proses bespoke thobe', secondaryKeyword: 'waktu produksi thobe custom', intent: 'transactional', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'kelebihan thobe bespoke dibanding ready to wear', secondaryKeyword: 'keunggulan bespoke', intent: 'commercial', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 6, authorityScore: 7 },
  { primaryKeyword: 'apa beda custom made dan bespoke', secondaryKeyword: 'istilah bespoke vs custom', intent: 'comparison', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'proses konsultasi bespoke thobe', secondaryKeyword: 'tahapan pesan thobe custom', intent: 'commercial', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'lubang kancing jahitan tangan', secondaryKeyword: 'kualitas lubang kancing thobe', intent: 'informational', targetPage: '/knowledge/tailoring/handmade-details', cluster: 'tailoring', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'cara menilai kualitas jahitan thobe', secondaryKeyword: 'tanda thobe berkualitas', intent: 'informational', targetPage: '/knowledge/tailoring/quality-control', cluster: 'tailoring', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'pola thobe untuk badan tidak simetris', secondaryKeyword: 'bespoke untuk proporsi unik', intent: 'informational', targetPage: '/knowledge/tailoring/pattern-drafting', cluster: 'tailoring', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'apa itu ease dalam pola pakaian', secondaryKeyword: 'kelonggaran pola thobe', intent: 'informational', targetPage: '/knowledge/tailoring/pattern-drafting', cluster: 'tailoring', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'toile pattern testing thobe', secondaryKeyword: 'uji coba pola sebelum produksi', intent: 'informational', targetPage: '/knowledge/tailoring/pattern-drafting', cluster: 'tailoring', commercialScore: 2, authorityScore: 4 },
  { primaryKeyword: 'kerung lengan thobe sempit solusi', secondaryKeyword: 'lengan thobe tidak nyaman', intent: 'informational', targetPage: '/knowledge/tailoring/sleeve-construction', cluster: 'tailoring', commercialScore: 4, authorityScore: 5 },
]

const CARE_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'cara mencuci thobe linen', secondaryKeyword: 'perawatan linen thobe', intent: 'informational', targetPage: '/knowledge/care/wash-linen', cluster: 'care', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'cara menyetrika thobe', secondaryKeyword: 'suhu setrika kain thobe', intent: 'informational', targetPage: '/knowledge/care/iron-thobe', cluster: 'care', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'cara menyimpan thobe premium', secondaryKeyword: 'simpan thobe agar awet', intent: 'informational', targetPage: '/knowledge/care/store-premium-garments', cluster: 'care', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'cara menghilangkan kerutan thobe tanpa setrika', secondaryKeyword: 'trik anti kusut thobe', intent: 'informational', targetPage: '/knowledge/care/remove-wrinkles', cluster: 'care', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'cara merawat thobe putih agar tidak kuning', secondaryKeyword: 'thobe putih tetap cerah', intent: 'informational', targetPage: '/knowledge/care/maintain-white-thobe', cluster: 'care', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'cara mencuci wool blend thobe', secondaryKeyword: 'perawatan wool blend', intent: 'informational', targetPage: '/knowledge/care/wool-blend-care', cluster: 'care', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'dry clean vs cuci tangan thobe', secondaryKeyword: 'kapan harus dry clean', intent: 'comparison', targetPage: '/knowledge/care/dry-clean-vs-hand-wash', cluster: 'care', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'tips memperpanjang usia thobe bespoke', secondaryKeyword: 'cara thobe awet bertahun', intent: 'commercial', targetPage: '/knowledge/care/extend-garment-life', cluster: 'care', commercialScore: 6, authorityScore: 7 },
  { primaryKeyword: 'thobe menguning cara mengatasi', secondaryKeyword: 'noda kuning di thobe putih', intent: 'informational', targetPage: '/knowledge/care/maintain-white-thobe', cluster: 'care', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'suhu setrika untuk linen', secondaryKeyword: 'panas setrika kain katun', intent: 'informational', targetPage: '/knowledge/care/iron-thobe', cluster: 'care', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'hanger yang tepat untuk thobe', secondaryKeyword: 'cara gantung thobe benar', intent: 'informational', targetPage: '/knowledge/care/store-premium-garments', cluster: 'care', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'thobe cepat kusut solusi', secondaryKeyword: 'kain anti kusut perawatan', intent: 'informational', targetPage: '/knowledge/care/remove-wrinkles', cluster: 'care', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'cara mencuci thobe tanpa merusak bahan', secondaryKeyword: 'tips cuci aman thobe', intent: 'informational', targetPage: '/knowledge/care/wash-linen', cluster: 'care', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'thobe bau apek cara menghilangkan', secondaryKeyword: 'simpan thobe lembab', intent: 'informational', targetPage: '/knowledge/care/store-premium-garments', cluster: 'care', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'perawatan thobe musim hujan', secondaryKeyword: 'thobe lembab cara atasi', intent: 'informational', targetPage: '/knowledge/care/store-premium-garments', cluster: 'care', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'berapa lama thobe bespoke bisa dipakai', secondaryKeyword: 'usia pakai thobe premium', intent: 'informational', targetPage: '/knowledge/care/extend-garment-life', cluster: 'care', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'dry clean thobe berapa kali setahun', secondaryKeyword: 'frekuensi dry clean', intent: 'informational', targetPage: '/knowledge/care/dry-clean-vs-hand-wash', cluster: 'care', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'cara merawat kerah thobe', secondaryKeyword: 'jaga bentuk kerah thobe', intent: 'informational', targetPage: '/knowledge/care/store-premium-garments', cluster: 'care', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'tips packing thobe agar tidak kusut', secondaryKeyword: 'cara lipat thobe koper', intent: 'commercial', targetPage: '/knowledge/umrah/packing-guide', cluster: 'care', commercialScore: 5, authorityScore: 6 },
]

const BOGOR_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'tailor bespoke Bandung', secondaryKeyword: 'jasa jahit bespoke Bandung', intent: 'local', targetPage: '/knowledge/bandung', cluster: 'bandung', commercialScore: 9, authorityScore: 8 },
  { primaryKeyword: 'custom thobe Bandung', secondaryKeyword: 'jahit thobe custom Bandung', intent: 'local', targetPage: '/knowledge/bandung/custom-thobe', cluster: 'bandung', commercialScore: 9, authorityScore: 8 },
  { primaryKeyword: 'thobe pernikahan Bandung', secondaryKeyword: 'wedding tailor Bandung', intent: 'local', targetPage: '/knowledge/bandung/wedding-tailor', cluster: 'bandung', commercialScore: 9, authorityScore: 7 },
  { primaryKeyword: 'thobe umrah Bandung', secondaryKeyword: 'jahit thobe umrah Bandung', intent: 'local', targetPage: '/knowledge/bandung/umrah-thobe', cluster: 'bandung', commercialScore: 9, authorityScore: 7 },
  { primaryKeyword: 'konsultasi bespoke tailor Bandung', secondaryKeyword: 'booking konsultasi Bandung', intent: 'transactional', targetPage: '/book-appointment', cluster: 'bandung', commercialScore: 9, authorityScore: 6 },
  { primaryKeyword: 'workshop tailoring Bandung', secondaryKeyword: 'atelier bespoke Bandung', intent: 'informational', targetPage: '/knowledge/bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'fitting thobe custom Bandung', secondaryKeyword: 'jasa fitting Bandung', intent: 'local', targetPage: '/knowledge/bandung/bespoke-tailor', cluster: 'bandung', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'Local Tailor Bandung', secondaryKeyword: 'Local Tailor pengalaman pelanggan', intent: 'commercial', targetPage: '/knowledge/bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'penjahit thobe terbaik Bandung', secondaryKeyword: 'rekomendasi tailor Bandung', intent: 'commercial', targetPage: '/knowledge/bandung', cluster: 'bandung', commercialScore: 8, authorityScore: 7 },
  { primaryKeyword: 'harga thobe custom Bandung', secondaryKeyword: 'biaya bespoke tailor Bandung', intent: 'transactional', targetPage: '/knowledge/bandung/custom-thobe', cluster: 'bandung', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'digital body profile Bandung', secondaryKeyword: 'pengukuran tersimpan Bandung', intent: 'commercial', targetPage: '/knowledge/bandung/bespoke-tailor', cluster: 'bandung', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'jasa jahit thobe premium Bandung', secondaryKeyword: 'tailor premium Bandung', intent: 'local', targetPage: '/knowledge/bandung/custom-thobe', cluster: 'bandung', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'thobe akad nikah Bandung', secondaryKeyword: 'jahit outfit akad Bandung', intent: 'local', targetPage: '/knowledge/bandung/wedding-tailor', cluster: 'bandung', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'proses bespoke di Bandung', secondaryKeyword: 'alur konsultasi hingga produksi', intent: 'informational', targetPage: '/knowledge/bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'tailor thobe dekat saya Bandung', secondaryKeyword: 'jasa jahit thobe area Bandung', intent: 'local', targetPage: '/knowledge/bandung', cluster: 'bandung', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'delivery thobe custom Bandung', secondaryKeyword: 'pengiriman thobe bespoke', intent: 'informational', targetPage: '/knowledge/bandung', cluster: 'bandung', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'konsultasi gratis tailor Bandung', secondaryKeyword: 'booking fitting gratis', intent: 'transactional', targetPage: '/book-appointment', cluster: 'bandung', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'bespoke tailor vs konveksi Bandung', secondaryKeyword: 'perbedaan bespoke konveksi', intent: 'comparison', targetPage: '/knowledge/bandung/bespoke-tailor', cluster: 'bandung', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'thobe custom untuk acara formal Bandung', secondaryKeyword: 'jahit thobe formal Bandung', intent: 'commercial', targetPage: '/knowledge/bandung/custom-thobe', cluster: 'bandung', commercialScore: 7, authorityScore: 6 },
]

// -----------------------------------------------------------------------
// Sprint W6R.2 — City-local query cluster. Built from CITY_CONFIGS (the
// same registry src/app/[locale]/locations/[city]/page.tsx reads from), so
// a new city added there needs zero changes here to get its own 20-query
// local-intent cluster — and, per this sprint's own "1 kota = 1 halaman"
// rule, every one of these queries consolidates onto that single city's
// /locations/[slug] page rather than spawning a new per-keyword URL.
// Bandung is excluded — its own local-intent queries already exist above
// (BANDUNG_KEYWORDS, cluster 'bandung', targeting /knowledge/bandung/* and
// /book-appointment), so this generator only covers the service-area cities.
// -----------------------------------------------------------------------
interface CityQueryTemplate {
  primary: string
  secondary: string
  intent: QueryIntent
  commercialScore: number
  authorityScore: number
}

const CITY_QUERY_TEMPLATES: CityQueryTemplate[] = [
  { primary: 'custom thobe {city}', secondary: 'jahit thobe custom {city}', intent: 'local', commercialScore: 9, authorityScore: 6 },
  { primary: 'jahit thobe {city}', secondary: 'tempat jahit thobe {city}', intent: 'local', commercialScore: 8, authorityScore: 6 },
  { primary: 'bespoke tailor {city}', secondary: 'tailor bespoke {city}', intent: 'local', commercialScore: 8, authorityScore: 6 },
  { primary: 'tailor {city}', secondary: 'tailor pria {city}', intent: 'local', commercialScore: 7, authorityScore: 6 },
  { primary: 'penjahit {city}', secondary: 'penjahit pria {city}', intent: 'local', commercialScore: 7, authorityScore: 5 },
  { primary: 'jasa jahit {city}', secondary: 'jasa jahit custom {city}', intent: 'local', commercialScore: 7, authorityScore: 5 },
  { primary: 'jahit custom {city}', secondary: 'jahit baju custom {city}', intent: 'commercial', commercialScore: 7, authorityScore: 5 },
  { primary: 'tailor pria {city}', secondary: 'tailor muslim pria {city}', intent: 'local', commercialScore: 7, authorityScore: 5 },
  { primary: 'tailor muslim {city}', secondary: 'penjahit muslim {city}', intent: 'local', commercialScore: 7, authorityScore: 5 },
  { primary: 'gamis pria custom {city}', secondary: 'jahit gamis pria {city}', intent: 'commercial', commercialScore: 8, authorityScore: 5 },
  { primary: 'jubah pria {city}', secondary: 'custom jubah pria {city}', intent: 'commercial', commercialScore: 7, authorityScore: 5 },
  { primary: 'baju koko custom {city}', secondary: 'jahit baju koko {city}', intent: 'commercial', commercialScore: 8, authorityScore: 5 },
  { primary: 'kurta pria {city}', secondary: 'custom kurta pria {city}', intent: 'commercial', commercialScore: 6, authorityScore: 4 },
  { primary: 'made to measure {city}', secondary: 'made to measure thobe {city}', intent: 'commercial', commercialScore: 7, authorityScore: 5 },
  { primary: 'harga jahit thobe {city}', secondary: 'biaya custom thobe {city}', intent: 'transactional', commercialScore: 9, authorityScore: 4 },
  { primary: 'konsultasi tailor {city}', secondary: 'konsultasi custom thobe {city}', intent: 'transactional', commercialScore: 8, authorityScore: 5 },
  { primary: 'tailor premium {city}', secondary: 'penjahit premium {city}', intent: 'commercial', commercialScore: 7, authorityScore: 5 },
  { primary: 'rekomendasi tailor {city}', secondary: 'tailor terbaik {city}', intent: 'commercial', commercialScore: 7, authorityScore: 5 },
  { primary: 'pesan thobe custom {city}', secondary: 'booking thobe custom {city}', intent: 'transactional', commercialScore: 9, authorityScore: 4 },
  { primary: 'jahit baju koko {city}', secondary: 'tailor baju koko {city}', intent: 'commercial', commercialScore: 7, authorityScore: 5 },
  { primary: 'jahit gamis pria {city}', secondary: 'tempat jahit gamis {city}', intent: 'commercial', commercialScore: 7, authorityScore: 5 },
  { primary: 'jahit jubah pria {city}', secondary: 'tempat jahit jubah {city}', intent: 'commercial', commercialScore: 6, authorityScore: 4 },
  { primary: 'tailor bespoke online {city}', secondary: 'konsultasi bespoke online {city}', intent: 'commercial', commercialScore: 7, authorityScore: 5 },
  { primary: 'custom baju koko {city}', secondary: 'tailor baju koko custom {city}', intent: 'commercial', commercialScore: 7, authorityScore: 5 },
  { primary: 'jasa tailor pria {city}', secondary: 'tailor pria terpercaya {city}', intent: 'local', commercialScore: 6, authorityScore: 5 },
  { primary: 'studio custom thobe {city}', secondary: 'tempat custom thobe {city}', intent: 'local', commercialScore: 6, authorityScore: 4 },
  { primary: 'pesan custom baju koko {city}', secondary: 'booking baju koko custom {city}', intent: 'transactional', commercialScore: 8, authorityScore: 4 },
  { primary: 'tailor untuk acara formal {city}', secondary: 'jahit baju formal {city}', intent: 'commercial', commercialScore: 6, authorityScore: 4 },
]

const CITY_KEYWORDS: KeywordEntry[] = CITY_CONFIGS.filter((city) => !city.isPrimary).flatMap((city) =>
  CITY_QUERY_TEMPLATES.map(
    (template): KeywordEntry => ({
      primaryKeyword: template.primary.replace('{city}', city.city),
      secondaryKeyword: template.secondary.replace('{city}', city.city),
      intent: template.intent,
      targetPage: `/locations/${city.slug}`,
      cluster: 'locations',
      commercialScore: template.commercialScore,
      authorityScore: template.authorityScore,
    })
  )
)

// -----------------------------------------------------------------------
// Product terminology — gamis, jubah, jubba, baju koko, kurta, "baju
// muslim pria" as their own vocabulary rather than folded into "thobe"
// queries. Mapped to the closest genuinely relevant existing page: baju
// koko has its own real Revenue Landing Page (SERVICE_CONFIGS); everything
// else maps to the bespoke-process explanation (what-is-bespoke) or
// Design Studio, since no dedicated gamis/jubah/kurta article exists yet
// and this sprint's own rule is "don't create a new URL if an existing
// page already serves the intent".
// -----------------------------------------------------------------------
const PRODUCT_TERM_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'apa itu gamis pria', secondaryKeyword: 'pengertian gamis pria', intent: 'informational', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'apa itu jubah pria', secondaryKeyword: 'pengertian jubah pria', intent: 'informational', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'beda gamis dan jubah', secondaryKeyword: 'perbedaan gamis jubah thobe', intent: 'comparison', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'jubba pria', secondaryKeyword: 'apa itu jubba', intent: 'informational', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'custom gamis pria', secondaryKeyword: 'jahit gamis pria custom', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'custom jubah pria', secondaryKeyword: 'jahit jubah pria custom', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'baju koko pria custom', secondaryKeyword: 'jahit baju koko pria', intent: 'commercial', targetPage: '/custom-baju-koko-bandung', cluster: 'bandung', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'tempat jahit baju koko', secondaryKeyword: 'jasa custom baju koko', intent: 'commercial', targetPage: '/custom-baju-koko-bandung', cluster: 'bandung', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'kurta pria custom', secondaryKeyword: 'jahit kurta pria', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'apa itu kurta pria', secondaryKeyword: 'pengertian kurta pria', intent: 'informational', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 2, authorityScore: 5 },
  { primaryKeyword: 'baju muslim pria custom', secondaryKeyword: 'pakaian muslim pria bespoke', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'pakaian muslim pria premium', secondaryKeyword: 'baju muslim pria berkualitas', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'thobe vs gamis', secondaryKeyword: 'perbedaan thobe dan gamis', intent: 'comparison', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'jubah pria dewasa custom', secondaryKeyword: 'jubah pria ukuran dewasa', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'gamis pria lengan panjang custom', secondaryKeyword: 'gamis pria formal custom', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'baju koko premium custom', secondaryKeyword: 'baju koko bahan premium', intent: 'commercial', targetPage: '/custom-baju-koko-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'jubah pria untuk sholat', secondaryKeyword: 'jubah pria ibadah', intent: 'informational', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'gamis pria untuk kajian', secondaryKeyword: 'gamis pria acara keagamaan', intent: 'informational', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'kurta vs thobe', secondaryKeyword: 'perbedaan kurta dan thobe', intent: 'comparison', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'baju muslim pria untuk kerja', secondaryKeyword: 'baju muslim pria formal kantor', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 5 },
]

// -----------------------------------------------------------------------
// Service terminology + commercial modifiers — the "tailor / penjahit /
// jasa jahit / bespoke / made-to-measure" vocabulary crossed with
// "harga / biaya / pesan / terbaik / rekomendasi / premium / online /
// konsultasi", as national (non-city) queries. Mapped to the real Revenue
// Landing Pages (SERVICE_CONFIGS) and Knowledge tailoring articles that
// already answer them — no new page created for any of these.
// -----------------------------------------------------------------------
const SERVICE_TERM_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'tailor terbaik indonesia', secondaryKeyword: 'rekomendasi tailor terbaik', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'penjahit terbaik untuk thobe', secondaryKeyword: 'penjahit thobe direkomendasikan', intent: 'commercial', targetPage: '/jahit-thobe-bandung', cluster: 'bandung', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'jasa jahit custom online', secondaryKeyword: 'jasa jahit custom tanpa datang', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'tukang jahit thobe custom', secondaryKeyword: 'tukang jahit thobe berpengalaman', intent: 'commercial', targetPage: '/jahit-thobe-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'jahit custom online', secondaryKeyword: 'pesan jahit custom online', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'custom made thobe', secondaryKeyword: 'custom made pria muslim', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'apa itu bespoke', secondaryKeyword: 'arti bespoke dalam tailoring', intent: 'informational', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 4, authorityScore: 8 },
  { primaryKeyword: 'made-to-measure adalah', secondaryKeyword: 'pengertian made to measure', intent: 'informational', targetPage: '/knowledge/tailoring/bespoke-vs-made-to-measure', cluster: 'tailoring', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'tailor pria muslim terpercaya', secondaryKeyword: 'tailor muslim direkomendasikan', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'tailor premium indonesia', secondaryKeyword: 'tailor high end indonesia', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'harga bespoke tailor', secondaryKeyword: 'biaya bespoke tailoring', intent: 'transactional', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 9, authorityScore: 4 },
  { primaryKeyword: 'harga jahit custom thobe', secondaryKeyword: 'biaya jahit thobe custom', intent: 'transactional', targetPage: '/jahit-thobe-bandung', cluster: 'bandung', commercialScore: 9, authorityScore: 4 },
  { primaryKeyword: 'biaya tailor premium', secondaryKeyword: 'harga tailor premium', intent: 'transactional', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 9, authorityScore: 4 },
  { primaryKeyword: 'pesan thobe online', secondaryKeyword: 'cara pesan thobe custom online', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 9, authorityScore: 5 },
  { primaryKeyword: 'buat thobe custom sendiri', secondaryKeyword: 'desain thobe sendiri online', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'rekomendasi jasa jahit custom', secondaryKeyword: 'jasa jahit custom terbaik', intent: 'commercial', targetPage: '/jahit-thobe-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'konsultasi jahit custom gratis', secondaryKeyword: 'konsultasi tailor gratis', intent: 'transactional', targetPage: '/book-appointment', cluster: 'bandung', commercialScore: 8, authorityScore: 4 },
  { primaryKeyword: 'konsultasi bespoke online', secondaryKeyword: 'konsultasi tailor via whatsapp', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'tailor online terpercaya', secondaryKeyword: 'jasa tailor online indonesia', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'jasa jahit premium online', secondaryKeyword: 'tailor premium online', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'bespoke tailor terdekat vs online', secondaryKeyword: 'tailor lokal vs tailor online', intent: 'comparison', targetPage: '/knowledge/design-studio', cluster: 'design-studio', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'apa beda tailor dan penjahit', secondaryKeyword: 'istilah tailor vs penjahit', intent: 'comparison', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'jahit custom terbaik untuk pria', secondaryKeyword: 'tailor pria terbaik', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'penjahit muslim terpercaya', secondaryKeyword: 'tailor muslim rekomendasi', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'jasa jahit thobe terdekat', secondaryKeyword: 'penjahit thobe sekitar saya', intent: 'commercial', targetPage: '/locations', cluster: 'locations', commercialScore: 6, authorityScore: 5 },
]

// -----------------------------------------------------------------------
// Occasion queries — akad, wedding, resepsi, umrah, haji, Idul Fitri,
// Lebaran, sholat Jumat, kajian, acara formal, keluarga pengantin. Mapped
// to the real Wedding/Umrah Knowledge clusters and the formal-thobe
// styling guide; haji has no dedicated article (Local Tailor's real
// content is umrah-specific), so those queries point at the umrah hub as
// the closest genuinely relevant existing page rather than a fabricated
// haji-specific one.
// -----------------------------------------------------------------------
const OCCASION_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'thobe untuk akad nikah', secondaryKeyword: 'outfit akad pria muslim', intent: 'commercial', targetPage: '/knowledge/wedding/akad-pria', cluster: 'wedding', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'thobe untuk wedding', secondaryKeyword: 'outfit wedding pria muslim', intent: 'commercial', targetPage: '/knowledge/wedding/bespoke-wedding-guide', cluster: 'wedding', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'thobe untuk resepsi', secondaryKeyword: 'outfit resepsi pengantin pria', intent: 'commercial', targetPage: '/knowledge/wedding/resepsi-pria', cluster: 'wedding', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'thobe untuk umrah', secondaryKeyword: 'baju umrah custom', intent: 'commercial', targetPage: '/knowledge/umrah', cluster: 'umrah', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'thobe untuk haji', secondaryKeyword: 'baju ibadah haji pria', intent: 'informational', targetPage: '/knowledge/umrah', cluster: 'umrah', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'baju haji pria custom', secondaryKeyword: 'thobe custom untuk haji', intent: 'commercial', targetPage: '/knowledge/umrah/custom-umrah-thobe', cluster: 'umrah', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk Idul Fitri', secondaryKeyword: 'baju lebaran pria muslim', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'baju lebaran pria custom', secondaryKeyword: 'thobe lebaran custom', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk sholat Jumat', secondaryKeyword: 'baju sholat Jumat pria', intent: 'informational', targetPage: '/knowledge/styling/casual-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk kajian', secondaryKeyword: 'baju kajian pria muslim', intent: 'informational', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk acara formal', secondaryKeyword: 'baju formal pria muslim', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'outfit keluarga pengantin pria', secondaryKeyword: 'seragam keluarga pengantin', intent: 'commercial', targetPage: '/knowledge/wedding/family-outfit', cluster: 'wedding', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'thobe couple pernikahan', secondaryKeyword: 'outfit couple muslim nikah', intent: 'commercial', targetPage: '/knowledge/wedding/couple-muslim', cluster: 'wedding', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'thobe akad vs resepsi bedanya apa', secondaryKeyword: 'perbedaan outfit akad resepsi', intent: 'comparison', targetPage: '/knowledge/wedding/akad-pria', cluster: 'wedding', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'warna thobe untuk Idul Fitri', secondaryKeyword: 'warna baju lebaran pria', intent: 'informational', targetPage: '/knowledge/styling/white-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe formal untuk kajian rutin', secondaryKeyword: 'baju kajian rapi pria', intent: 'informational', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'thobe premium untuk haji dan umrah', secondaryKeyword: 'baju ibadah premium', intent: 'commercial', targetPage: '/knowledge/umrah/premium-umrah-outfit', cluster: 'umrah', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'persiapan baju sebelum haji', secondaryKeyword: 'checklist pakaian haji', intent: 'informational', targetPage: '/knowledge/umrah/packing-guide', cluster: 'umrah', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk acara keluarga', secondaryKeyword: 'baju formal acara keluarga', intent: 'commercial', targetPage: '/knowledge/wedding/family-outfit', cluster: 'wedding', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk buka puasa bersama', secondaryKeyword: 'baju formal buka puasa', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 4 },
]

// -----------------------------------------------------------------------
// Fit & measurement queries — extends MEASUREMENT_KEYWORDS above with
// gamis/jubah-specific and general-fit variants, all pointing at the same
// real Measurement Knowledge articles and the estimator.
// -----------------------------------------------------------------------
const FIT_MEASUREMENT_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'ukuran gamis pria', secondaryKeyword: 'size chart gamis pria', intent: 'commercial', targetPage: '/knowledge/measurements/thobe-size-guide', cluster: 'measurements', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'ukuran jubah pria', secondaryKeyword: 'size chart jubah pria', intent: 'commercial', targetPage: '/knowledge/measurements/thobe-size-guide', cluster: 'measurements', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'panjang thobe ideal berapa cm', secondaryKeyword: 'ukuran panjang thobe standar', intent: 'informational', targetPage: '/knowledge/measurements/length', cluster: 'measurements', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'slim fit thobe artinya', secondaryKeyword: 'pengertian slim fit thobe', intent: 'informational', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'regular fit thobe artinya', secondaryKeyword: 'pengertian regular fit thobe', intent: 'informational', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'relaxed fit thobe artinya', secondaryKeyword: 'pengertian relaxed fit thobe', intent: 'informational', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk badan besar', secondaryKeyword: 'custom thobe badan gemuk', intent: 'commercial', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk badan tinggi', secondaryKeyword: 'custom thobe tinggi badan lebih', intent: 'commercial', targetPage: '/knowledge/measurements/length', cluster: 'measurements', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk badan pendek', secondaryKeyword: 'custom thobe tinggi badan kurang', intent: 'commercial', targetPage: '/knowledge/measurements/length', cluster: 'measurements', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'custom ukuran thobe sendiri', secondaryKeyword: 'thobe sesuai ukuran badan sendiri', intent: 'commercial', targetPage: '/free-body-profile-estimator', cluster: 'measurements', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'cara ukur badan untuk gamis', secondaryKeyword: 'panduan ukur gamis pria', intent: 'informational', targetPage: '/knowledge/measurements/how-to-measure-body', cluster: 'measurements', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'cara ukur badan untuk jubah', secondaryKeyword: 'panduan ukur jubah pria', intent: 'informational', targetPage: '/knowledge/measurements/how-to-measure-body', cluster: 'measurements', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'estimasi ukuran thobe online', secondaryKeyword: 'cek ukuran thobe tanpa datang', intent: 'transactional', targetPage: '/free-body-profile-estimator', cluster: 'measurements', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'ukuran baju koko pria', secondaryKeyword: 'size chart baju koko', intent: 'commercial', targetPage: '/knowledge/measurements/thobe-size-guide', cluster: 'measurements', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'ukuran kurta pria', secondaryKeyword: 'size chart kurta pria', intent: 'commercial', targetPage: '/knowledge/measurements/thobe-size-guide', cluster: 'measurements', commercialScore: 4, authorityScore: 4 },
]

// -----------------------------------------------------------------------
// Fabric problem/solution queries — real material questions ("adem",
// "tidak panas", "tidak mudah kusut", tropical-climate suitability) mapped
// to the actual Fabric Knowledge articles that already answer them.
// -----------------------------------------------------------------------
const FABRIC_PROBLEM_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'bahan gamis pria adem', secondaryKeyword: 'kain gamis sejuk', intent: 'informational', targetPage: '/knowledge/fabrics/linen', cluster: 'fabrics', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'bahan jubah tidak panas', secondaryKeyword: 'kain jubah adem cuaca panas', intent: 'informational', targetPage: '/knowledge/fabrics/linen', cluster: 'fabrics', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'bahan thobe tidak mudah kusut', secondaryKeyword: 'kain anti kusut untuk thobe', intent: 'commercial', targetPage: '/knowledge/fabrics/premium-polyester', cluster: 'fabrics', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'linen untuk gamis pria', secondaryKeyword: 'bahan linen gamis', intent: 'informational', targetPage: '/knowledge/fabrics/linen', cluster: 'fabrics', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'cotton untuk thobe', secondaryKeyword: 'bahan katun untuk thobe', intent: 'informational', targetPage: '/knowledge/fabrics/premium-cotton', cluster: 'fabrics', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'japanese cotton untuk jubah', secondaryKeyword: 'katun Jepang untuk jubah', intent: 'informational', targetPage: '/knowledge/fabrics/japanese-cotton', cluster: 'fabrics', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'bahan premium untuk thobe', secondaryKeyword: 'kain premium bespoke thobe', intent: 'commercial', targetPage: '/knowledge/fabrics/premium-cotton', cluster: 'fabrics', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'bahan terbaik untuk umrah', secondaryKeyword: 'kain adem untuk perjalanan umrah', intent: 'commercial', targetPage: '/knowledge/umrah/best-fabric', cluster: 'umrah', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'bahan terbaik untuk akad', secondaryKeyword: 'kain elegan untuk akad nikah', intent: 'commercial', targetPage: '/knowledge/wedding/color-guide', cluster: 'wedding', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'bahan untuk iklim tropis', secondaryKeyword: 'kain thobe cocok iklim panas', intent: 'informational', targetPage: '/knowledge/fabrics/linen', cluster: 'fabrics', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'bahan gamis pria tidak panas', secondaryKeyword: 'kain gamis breathable', intent: 'informational', targetPage: '/knowledge/fabrics/japanese-cotton', cluster: 'fabrics', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'bahan baju koko adem', secondaryKeyword: 'kain koko sejuk', intent: 'informational', targetPage: '/knowledge/fabrics/premium-cotton', cluster: 'fabrics', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'perbandingan linen dan katun untuk thobe', secondaryKeyword: 'linen vs katun thobe', intent: 'comparison', targetPage: '/knowledge/fabrics/linen', cluster: 'fabrics', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'bahan thobe cocok cuaca lembap', secondaryKeyword: 'kain thobe untuk kelembapan tinggi', intent: 'informational', targetPage: '/knowledge/fabrics/japanese-cotton', cluster: 'fabrics', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'bahan jubah premium', secondaryKeyword: 'kain jubah kualitas tinggi', intent: 'commercial', targetPage: '/knowledge/fabrics/premium-cotton', cluster: 'fabrics', commercialScore: 5, authorityScore: 5 },
]

// -----------------------------------------------------------------------
// Style queries — regional silhouette names (Saudi/Oman), general style
// descriptors, and colors, mapped to the real Styling Knowledge articles.
// Saudi/Oman-style thobes have no dedicated article yet, so those queries
// point at the general styling hub rather than a fabricated regional-style
// page — an honest gap, not a filled-in guess.
// -----------------------------------------------------------------------
const STYLE_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'jubah Saudi', secondaryKeyword: 'thobe gaya Saudi', intent: 'informational', targetPage: '/knowledge/styling', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe Saudi custom', secondaryKeyword: 'custom thobe gaya Arab Saudi', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'jubah Oman', secondaryKeyword: 'thobe gaya Oman', intent: 'informational', targetPage: '/knowledge/styling', cluster: 'styling', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'Omani thobe custom', secondaryKeyword: 'custom thobe gaya Oman', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'thobe gaya minimalis', secondaryKeyword: 'thobe simpel modern', intent: 'informational', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe gaya modern', secondaryKeyword: 'thobe kekinian pria', intent: 'informational', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe bordir custom', secondaryKeyword: 'thobe dengan bordir', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'model kerah thobe', secondaryKeyword: 'jenis kerah thobe pria', intent: 'informational', targetPage: '/knowledge/tailoring/collar-construction', cluster: 'tailoring', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'thobe warna putih custom', secondaryKeyword: 'custom thobe putih polos', intent: 'commercial', targetPage: '/knowledge/styling/white-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'thobe warna navy custom', secondaryKeyword: 'custom thobe navy elegan', intent: 'commercial', targetPage: '/knowledge/styling/navy-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'thobe warna olive custom', secondaryKeyword: 'custom thobe olive santai', intent: 'commercial', targetPage: '/knowledge/styling/olive-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe warna hitam custom', secondaryKeyword: 'custom thobe hitam formal', intent: 'commercial', targetPage: '/knowledge/styling/black-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'thobe warna charcoal', secondaryKeyword: 'thobe abu-abu gelap', intent: 'informational', targetPage: '/knowledge/styling/black-thobe', cluster: 'styling', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'gamis pria warna navy', secondaryKeyword: 'gamis navy formal', intent: 'informational', targetPage: '/knowledge/styling/navy-thobe', cluster: 'styling', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'jubah pria warna hitam', secondaryKeyword: 'jubah hitam formal', intent: 'informational', targetPage: '/knowledge/styling/black-thobe', cluster: 'styling', commercialScore: 3, authorityScore: 4 },
]

export const KEYWORD_REPOSITORY: KeywordEntry[] = [
  ...FABRIC_KEYWORDS,
  ...MEASUREMENT_KEYWORDS,
  ...STYLING_KEYWORDS,
  ...WEDDING_KEYWORDS,
  ...UMRAH_KEYWORDS,
  ...TAILORING_KEYWORDS,
  ...CARE_KEYWORDS,
  ...BOGOR_KEYWORDS,
  ...CITY_KEYWORDS,
  ...PRODUCT_TERM_KEYWORDS,
  ...SERVICE_TERM_KEYWORDS,
  ...OCCASION_KEYWORDS,
  ...FIT_MEASUREMENT_KEYWORDS,
  ...FABRIC_PROBLEM_KEYWORDS,
  ...STYLE_KEYWORDS,
]

export function getKeywordsByCluster(cluster: KeywordCluster): KeywordEntry[] {
  return KEYWORD_REPOSITORY.filter((entry) => entry.cluster === cluster)
}

export function getKeywordsByIntent(intent: QueryIntent): KeywordEntry[] {
  return KEYWORD_REPOSITORY.filter((entry) => entry.intent === intent)
}

export function getTopCommercialKeywords(limit = 10): KeywordEntry[] {
  return [...KEYWORD_REPOSITORY].sort((a, b) => b.commercialScore - a.commercialScore).slice(0, limit)
}
