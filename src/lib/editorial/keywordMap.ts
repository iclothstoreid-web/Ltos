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
  // Sprint W6R.3 Patch (Faith & Occasion) — optional so the 814
  // pre-existing entries above need no retrofit. `status` records the
  // Critical-Rule decision this query went through (query -> intent ->
  // existing page -> coverage); `semanticParent` is the entity-graph node
  // this query belongs under (see src/lib/seo/entities.ts), used to keep
  // the Faith & Occasion queries traceable back to the "religious
  // occasion -> clothing need" relevance chain the patch requires rather
  // than floating as standalone religious keywords.
  status?: 'covered' | 'expanded' | 'new-page' | 'do-not-target'
  semanticParent?: string
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
  // W6R.3 cannibalization fix — was '/knowledge/bandung' (the hub), which
  // competed with the identical primaryKeyword in TAILORING_KEYWORDS above
  // targeting the more specific '/knowledge/bandung/bespoke-tailor'
  // sub-article. Reassigned to the more relevant page rather than leaving
  // two pages compete for the same query.
  { primaryKeyword: 'penjahit bespoke Bandung', secondaryKeyword: 'jasa jahit bespoke Bandung', intent: 'local', targetPage: '/knowledge/bandung', cluster: 'bandung', commercialScore: 9, authorityScore: 8 },
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
  // W6R.3 Patch retarget — reassigned from the generic formal-thobe page
  // to the new, more specific hari-raya-thobe-style article once it
  // existed, per this patch's own "expand/consolidate, don't compete" rule.
  { primaryKeyword: 'thobe untuk Idul Fitri', secondaryKeyword: 'baju lebaran pria muslim', intent: 'commercial', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'baju lebaran pria custom', secondaryKeyword: 'thobe lebaran custom', intent: 'commercial', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk sholat Jumat', secondaryKeyword: 'baju sholat Jumat pria', intent: 'informational', targetPage: '/knowledge/styling/casual-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk kajian', secondaryKeyword: 'baju kajian pria muslim', intent: 'informational', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk acara formal', secondaryKeyword: 'baju formal pria muslim', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'outfit keluarga pengantin pria', secondaryKeyword: 'seragam keluarga pengantin', intent: 'commercial', targetPage: '/knowledge/wedding/family-outfit', cluster: 'wedding', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'thobe couple pernikahan', secondaryKeyword: 'outfit couple muslim nikah', intent: 'commercial', targetPage: '/knowledge/wedding/couple-muslim', cluster: 'wedding', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'thobe akad vs resepsi bedanya apa', secondaryKeyword: 'perbedaan outfit akad resepsi', intent: 'comparison', targetPage: '/knowledge/wedding/akad-pria', cluster: 'wedding', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'warna thobe untuk Idul Fitri', secondaryKeyword: 'warna baju lebaran pria', intent: 'informational', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
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

// =========================================================================
// Sprint W6R.3 — Semantic Market Domination. Expands the query map from
// 517 to 800+ WITHOUT creating a single new URL beyond the one new
// terminology article (thobe-gamis-jubah-perbedaan-istilah) added this
// sprint — every entry below targets an existing page (5 Revenue Landing
// Pages, Design Studio, Knowledge clusters, /locations, /book-appointment).
// Per this sprint's own Critical Rule: new pages only where intent is
// genuinely distinct AND existing coverage is insufficient — audited in
// W6R.3's gap matrix and found not to be the case for "gamis pria custom"
// / "jubah pria custom" (no separate product line exists; both route to
// Design Studio, the same real configurator "custom thobe" already uses).
// =========================================================================

// -----------------------------------------------------------------------
// Luxury / premium positioning — "luxury/premium" claims are backed by the
// actual differentiators SERVICE_CONFIGS already documents (imported
// fabric, hand finishing, 7-point QC on tailor-premium-bandung) rather than
// unsupported "no. 1" language, per this sprint's Step 14 quality guard.
// -----------------------------------------------------------------------
const LUXURY_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'luxury thobe', secondaryKeyword: 'thobe mewah premium', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'bespoke thobe luxury', secondaryKeyword: 'bespoke thobe kelas atas', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'premium thobe custom', secondaryKeyword: 'thobe premium custom bespoke', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'jubah eksklusif', secondaryKeyword: 'jubah pria eksklusif custom', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'gamis pria mewah', secondaryKeyword: 'gamis pria kelas atas', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'tailor luxury indonesia', secondaryKeyword: 'tailor mewah indonesia', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'jahit premium', secondaryKeyword: 'jasa jahit kelas premium', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'bahan premium', secondaryKeyword: 'kain premium untuk thobe', intent: 'informational', targetPage: '/knowledge/fabrics/premium-cotton', cluster: 'fabrics', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'custom fit premium', secondaryKeyword: 'fitting premium custom', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'apa yang membuat tailor premium', secondaryKeyword: 'bukti tailor premium bukan klaim', intent: 'informational', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'material impor untuk thobe', secondaryKeyword: 'kain impor thobe premium', intent: 'informational', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'hand finishing thobe', secondaryKeyword: 'finishing tangan thobe premium', intent: 'informational', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'quality control 7 titik thobe', secondaryKeyword: 'inspeksi kualitas thobe premium', intent: 'informational', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'thobe wool blend impor italia', secondaryKeyword: 'wool blend twill impor', intent: 'informational', targetPage: '/knowledge/fabrics/wool-blend', cluster: 'fabrics', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'silk cotton blend thobe', secondaryKeyword: 'silk cotton blend impor jepang', intent: 'informational', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'thobe kelas atas indonesia', secondaryKeyword: 'thobe premium indonesia', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'penjahit kelas premium', secondaryKeyword: 'penjahit high end indonesia', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'baju muslim pria luxury', secondaryKeyword: 'pakaian muslim pria mewah', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'thobe bahan terbaik dunia', secondaryKeyword: 'bahan thobe kualitas terbaik', intent: 'informational', targetPage: '/knowledge/fabrics/premium-cotton', cluster: 'fabrics', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'jubah premium custom', secondaryKeyword: 'jubah custom bahan premium', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'gamis pria bahan terbaik', secondaryKeyword: 'gamis pria premium custom', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'kandura premium custom', secondaryKeyword: 'kandura bahan impor custom', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'thobe harga tinggi kenapa', secondaryKeyword: 'kenapa thobe bespoke mahal', intent: 'informational', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'tailor premium vs tailor biasa', secondaryKeyword: 'perbedaan tailor premium standar', intent: 'comparison', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'thobe eksklusif custom', secondaryKeyword: 'thobe custom eksklusif satu-satunya', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'baju koko luxury custom', secondaryKeyword: 'baju koko premium eksklusif', intent: 'commercial', targetPage: '/custom-baju-koko-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'jasa jahit kelas atas', secondaryKeyword: 'penjahit kelas atas indonesia', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'wool blend twill thobe premium', secondaryKeyword: 'twill impor untuk thobe', intent: 'informational', targetPage: '/knowledge/fabrics/wool-blend', cluster: 'fabrics', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'linen impor belgia thobe', secondaryKeyword: 'linen premium impor', intent: 'informational', targetPage: '/knowledge/fabrics/linen', cluster: 'fabrics', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe custom kualitas tinggi', secondaryKeyword: 'thobe custom kualitas premium', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'personal pattern thobe premium', secondaryKeyword: 'pola personal thobe kelas atas', intent: 'informational', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'made to order thobe premium', secondaryKeyword: 'thobe made to order kualitas tinggi', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'digital body profile premium', secondaryKeyword: 'profil ukuran tersimpan tailor premium', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'thobe couture custom', secondaryKeyword: 'thobe couture indonesia', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'kurta premium custom', secondaryKeyword: 'kurta pria kelas atas', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'egyptian cotton thobe premium', secondaryKeyword: 'katun mesir kelas premium', intent: 'informational', targetPage: '/knowledge/fabrics/egyptian-cotton', cluster: 'fabrics', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'thobe premium untuk profesional', secondaryKeyword: 'thobe kelas atas untuk kerja', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'baju muslim pria berkualitas tinggi', secondaryKeyword: 'baju muslim pria kualitas premium', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'thobe kualitas ekspor', secondaryKeyword: 'thobe standar kualitas ekspor', intent: 'informational', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'atelier bespoke premium', secondaryKeyword: 'atelier tailoring kelas atas', intent: 'informational', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 4 },
]

// -----------------------------------------------------------------------
// Regional terminology — qamis, jubba, kandura, dishdasha, Saudi/Omani/
// Emirati naming. All point at the new W6R.3 terminology article (the
// substantial-unique-value page this sprint's audit justified) except
// pure style-silhouette queries, which point at the styling hub as an
// honest gap (no dedicated regional-style guide exists).
// -----------------------------------------------------------------------
const TERMINOLOGY_REGIONAL_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'apa itu qamis', secondaryKeyword: 'pengertian qamis', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 7 },
  { primaryKeyword: 'qamis adalah', secondaryKeyword: 'arti qamis dalam bahasa arab', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 7 },
  { primaryKeyword: 'apa itu kandura', secondaryKeyword: 'pengertian kandura', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 7 },
  { primaryKeyword: 'kandura adalah', secondaryKeyword: 'arti kandura emirat', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 7 },
  { primaryKeyword: 'apa itu dishdasha', secondaryKeyword: 'pengertian dishdasha', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 7 },
  { primaryKeyword: 'dishdasha adalah', secondaryKeyword: 'arti dishdasha kuwait qatar', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 7 },
  { primaryKeyword: 'kandura vs thobe', secondaryKeyword: 'perbedaan kandura dan thobe', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'dishdasha vs thobe', secondaryKeyword: 'perbedaan dishdasha dan thobe', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'qamis vs thobe', secondaryKeyword: 'perbedaan qamis dan thobe', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'jubba adalah', secondaryKeyword: 'arti jubba dalam tailoring', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'jubba vs jubah', secondaryKeyword: 'beda ejaan jubba dan jubah', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'kandura custom indonesia', secondaryKeyword: 'jahit kandura custom', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'dishdasha custom indonesia', secondaryKeyword: 'jahit dishdasha custom', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'qamis custom pria', secondaryKeyword: 'jahit qamis custom pria', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'tarboosh kandura', secondaryKeyword: 'jumbai kandura emirat', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 2, authorityScore: 5 },
  { primaryKeyword: 'thobe gaya saudi', secondaryKeyword: 'thobe ala saudi arabia', intent: 'informational', targetPage: '/knowledge/styling', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe gaya emirati', secondaryKeyword: 'thobe ala uni emirat arab', intent: 'informational', targetPage: '/knowledge/styling', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe gaya kuwait', secondaryKeyword: 'thobe ala kuwait', intent: 'informational', targetPage: '/knowledge/styling', cluster: 'styling', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'jubah gaya arab custom', secondaryKeyword: 'jubah ala arab custom', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'siluet thobe fitted vs longgar', secondaryKeyword: 'perbedaan siluet thobe', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'jubah pria vs thobe pria', secondaryKeyword: 'beda jubah dan thobe pria', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'gamis pria vs jubah pria', secondaryKeyword: 'beda gamis dan jubah pria', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'istilah pakaian muslim pria', secondaryKeyword: 'macam istilah baju muslim pria', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 7 },
  { primaryKeyword: 'kenapa disebut thobe bukan gamis', secondaryKeyword: 'asal usul istilah thobe', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 2, authorityScore: 6 },
  { primaryKeyword: 'apa beda gamis dan jubah', secondaryKeyword: 'perbedaan istilah gamis jubah', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'thobe internasional artinya apa', secondaryKeyword: 'kenapa thobe dipakai internasional', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 2, authorityScore: 5 },
  { primaryKeyword: 'jubah untuk sholat vs harian', secondaryKeyword: 'jubah ibadah vs jubah santai', intent: 'informational', targetPage: '/knowledge/styling/casual-thobe', cluster: 'styling', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'omani thobe adalah', secondaryKeyword: 'pengertian thobe oman', intent: 'informational', targetPage: '/knowledge/styling', cluster: 'styling', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'jenis jubah menurut negara', secondaryKeyword: 'jubah berdasarkan negara asal', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'apakah kandura sama dengan dishdasha', secondaryKeyword: 'kandura dishdasha bedanya apa', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'penjahit kandura indonesia', secondaryKeyword: 'jasa jahit kandura indonesia', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'penjahit dishdasha indonesia', secondaryKeyword: 'jasa jahit dishdasha indonesia', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'thobe vs kandura vs dishdasha', secondaryKeyword: 'perbandingan tiga istilah thobe', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 4, authorityScore: 7 },
  { primaryKeyword: 'asal kata thobe qamis jubah', secondaryKeyword: 'etimologi istilah thobe', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 2, authorityScore: 6 },
]

// -----------------------------------------------------------------------
// Collar/cuff construction styles + embroidery — extends the existing
// STYLE_KEYWORDS/collar-construction coverage with the specific "collar
// styles" / "cuff styles" / "embroidery" territory the brief names.
// -----------------------------------------------------------------------
const COLLAR_CUFF_STYLE_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'jenis model kerah thobe', secondaryKeyword: 'macam-macam kerah thobe', intent: 'informational', targetPage: '/knowledge/tailoring/collar-construction', cluster: 'tailoring', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'kerah band thobe', secondaryKeyword: 'kerah band collar thobe', intent: 'informational', targetPage: '/knowledge/tailoring/collar-construction', cluster: 'tailoring', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'kerah spread thobe', secondaryKeyword: 'kerah spread collar thobe', intent: 'informational', targetPage: '/knowledge/tailoring/collar-construction', cluster: 'tailoring', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'pilih model kerah design studio', secondaryKeyword: 'custom kerah thobe design studio', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'model manset thobe', secondaryKeyword: 'jenis manset thobe pria', intent: 'informational', targetPage: '/knowledge/tailoring/sleeve-construction', cluster: 'tailoring', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'manset kancing vs manset polos', secondaryKeyword: 'perbedaan manset thobe', intent: 'comparison', targetPage: '/knowledge/tailoring/sleeve-construction', cluster: 'tailoring', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'pilih model manset design studio', secondaryKeyword: 'custom manset thobe design studio', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'thobe bordir custom design', secondaryKeyword: 'bordir custom thobe design studio', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'jenis bordir thobe', secondaryKeyword: 'macam bordir untuk thobe', intent: 'informational', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'bordir kerah thobe', secondaryKeyword: 'bordir di area kerah thobe', intent: 'informational', targetPage: '/knowledge/tailoring/collar-construction', cluster: 'tailoring', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe embroidery custom', secondaryKeyword: 'embroidery thobe custom design', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'gamis bordir custom', secondaryKeyword: 'gamis pria bordir custom', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'jubah bordir premium', secondaryKeyword: 'jubah dengan bordir premium', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'kerah thobe formal vs casual', secondaryKeyword: 'model kerah untuk formal', intent: 'comparison', targetPage: '/knowledge/tailoring/collar-construction', cluster: 'tailoring', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'cara memilih model kerah', secondaryKeyword: 'tips pilih kerah thobe', intent: 'commercial', targetPage: '/knowledge/tailoring/collar-construction', cluster: 'tailoring', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'thobe minimalis tanpa bordir', secondaryKeyword: 'thobe polos minimalis', intent: 'informational', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe formal collar tinggi', secondaryKeyword: 'kerah tinggi thobe formal', intent: 'informational', targetPage: '/knowledge/tailoring/collar-construction', cluster: 'tailoring', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'gaya kerah thobe modern', secondaryKeyword: 'kerah thobe kekinian', intent: 'informational', targetPage: '/knowledge/tailoring/collar-construction', cluster: 'tailoring', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'thobe formal berapa cm kerah', secondaryKeyword: 'ukuran kerah thobe formal', intent: 'informational', targetPage: '/knowledge/measurements/neck', cluster: 'measurements', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'manset thobe untuk wudhu', secondaryKeyword: 'manset mudah untuk wudhu', intent: 'informational', targetPage: '/knowledge/umrah/custom-umrah-thobe', cluster: 'umrah', commercialScore: 4, authorityScore: 4 },
]

// -----------------------------------------------------------------------
// Problem/need queries — "jahit sesuai ukuran badan", "custom ukuran
// besar", "fitting pria", "pakaian muslim untuk badan besar" territory
// from the brief, distinct phrasing from the existing MEASUREMENT_KEYWORDS/
// FIT_MEASUREMENT_KEYWORDS to avoid duplicating primaryKeyword strings.
// -----------------------------------------------------------------------
const PROBLEM_NEED_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'jahit sesuai ukuran badan', secondaryKeyword: 'thobe dijahit sesuai badan sendiri', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'custom ukuran besar pria', secondaryKeyword: 'thobe custom badan besar', intent: 'commercial', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'pakaian muslim untuk badan besar', secondaryKeyword: 'baju muslim pria plus size', intent: 'commercial', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'jubah untuk badan besar', secondaryKeyword: 'custom jubah badan gemuk', intent: 'commercial', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'gamis pria badan besar custom', secondaryKeyword: 'gamis pria ukuran besar custom', intent: 'commercial', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'jubah adem untuk cuaca panas', secondaryKeyword: 'jubah tidak panas custom', intent: 'informational', targetPage: '/knowledge/fabrics/linen', cluster: 'fabrics', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'gamis tidak mudah kusut', secondaryKeyword: 'gamis anti kusut custom', intent: 'commercial', targetPage: '/knowledge/fabrics/premium-polyester', cluster: 'fabrics', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'ukuran thobe susah ditentukan', secondaryKeyword: 'kesulitan menentukan ukuran thobe', intent: 'informational', targetPage: '/knowledge/measurements/how-to-measure-body', cluster: 'measurements', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'fitting pria sulit pas', secondaryKeyword: 'thobe sering tidak pas badan', intent: 'informational', targetPage: '/knowledge/measurements/how-to-measure-body', cluster: 'measurements', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'thobe ready to wear tidak pas', secondaryKeyword: 'thobe konveksi tidak sesuai badan', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'solusi thobe kebesaran', secondaryKeyword: 'thobe konveksi kebesaran solusi', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'solusi thobe kekecilan', secondaryKeyword: 'thobe konveksi kekecilan solusi', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'badan tidak simetris thobe', secondaryKeyword: 'proporsi badan tidak rata thobe', intent: 'informational', targetPage: '/knowledge/tailoring/pattern-drafting', cluster: 'tailoring', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk bahu tidak simetris', secondaryKeyword: 'custom thobe bahu tidak rata', intent: 'commercial', targetPage: '/knowledge/tailoring/pattern-drafting', cluster: 'tailoring', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'baju koko badan besar custom', secondaryKeyword: 'baju koko plus size custom', intent: 'commercial', targetPage: '/custom-baju-koko-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'gamis pria lengan pendek terlihat aneh', secondaryKeyword: 'lengan thobe terlalu pendek', intent: 'informational', targetPage: '/knowledge/measurements/sleeve', cluster: 'measurements', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'thobe kebesaran di bahu', secondaryKeyword: 'bahu thobe kebesaran solusi', intent: 'informational', targetPage: '/knowledge/measurements/shoulder', cluster: 'measurements', commercialScore: 4, authorityScore: 4 },
  { primaryKeyword: 'jahit ulang thobe kekecilan', secondaryKeyword: 'perbaiki ukuran thobe lama', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 3 },
  { primaryKeyword: 'kesulitan ukur badan sendiri thobe', secondaryKeyword: 'susah ukur badan tanpa bantuan', intent: 'commercial', targetPage: '/free-body-profile-estimator', cluster: 'measurements', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'thobe tidak nyaman di leher', secondaryKeyword: 'kerah thobe terlalu ketat', intent: 'informational', targetPage: '/knowledge/measurements/neck', cluster: 'measurements', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'thobe untuk badan berotot', secondaryKeyword: 'custom thobe badan atletis', intent: 'commercial', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'thobe untuk perut buncit', secondaryKeyword: 'custom thobe perut besar', intent: 'commercial', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'baju muslim pria tidak gerah', secondaryKeyword: 'baju muslim pria sirkulasi udara baik', intent: 'informational', targetPage: '/knowledge/fabrics/japanese-cotton', cluster: 'fabrics', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'thobe cepat gerah solusi', secondaryKeyword: 'thobe panas solusi bahan', intent: 'informational', targetPage: '/knowledge/fabrics/linen', cluster: 'fabrics', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'jubah tinggi badan lebih 180', secondaryKeyword: 'jubah untuk badan sangat tinggi', intent: 'commercial', targetPage: '/knowledge/measurements/length', cluster: 'measurements', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'gamis pendek untuk badan pendek', secondaryKeyword: 'gamis proporsional badan pendek', intent: 'commercial', targetPage: '/knowledge/measurements/length', cluster: 'measurements', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'thobe untuk lingkar perut besar', secondaryKeyword: 'ukuran thobe lingkar perut', intent: 'informational', targetPage: '/knowledge/measurements/chest', cluster: 'measurements', commercialScore: 4, authorityScore: 4 },
  { primaryKeyword: 'baju koko lengan panjang custom pas', secondaryKeyword: 'baju koko lengan pas badan', intent: 'commercial', targetPage: '/custom-baju-koko-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'estimasi ukuran tanpa datang ke tailor', secondaryKeyword: 'cek ukuran online tanpa datang', intent: 'transactional', targetPage: '/free-body-profile-estimator', cluster: 'measurements', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'gamis pria tidak pas di toko', secondaryKeyword: 'gamis konveksi tidak sesuai badan', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
]

// -----------------------------------------------------------------------
// National tailor/penjahit territory — natural Indonesian phrasing across
// the tailor/penjahit/jasa jahit/bespoke/made-to-measure vocabulary,
// non-city (national-intent), consolidated onto the 5 existing Revenue
// Landing Pages + Design Studio rather than one page per synonym (this
// sprint's own §7 instruction: "satu strong service page dapat menampung
// beberapa synonymous commercial terms").
// -----------------------------------------------------------------------
const TAILOR_PENJAHIT_NATIONAL_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'tailor pria indonesia', secondaryKeyword: 'tailor pria terbaik indonesia', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'penjahit pria indonesia', secondaryKeyword: 'penjahit pria terpercaya indonesia', intent: 'commercial', targetPage: '/jahit-thobe-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'jasa jahit pria', secondaryKeyword: 'jasa jahit pria muslim', intent: 'commercial', targetPage: '/jahit-thobe-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'penjahit gamis pria', secondaryKeyword: 'tukang jahit gamis pria', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 7, authorityScore: 4 },
  { primaryKeyword: 'tailor muslim indonesia', secondaryKeyword: 'tailor khusus busana muslim pria', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'jasa jahit custom indonesia', secondaryKeyword: 'jasa jahit custom pria muslim', intent: 'commercial', targetPage: '/jahit-thobe-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'penjahit premium indonesia', secondaryKeyword: 'penjahit kelas premium indonesia', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'tailor pria muslim indonesia', secondaryKeyword: 'tailor busana muslim pria indonesia', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'penjahit muslim indonesia', secondaryKeyword: 'penjahit khusus muslim pria', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'jasa tailor terpercaya', secondaryKeyword: 'jasa tailor pria terpercaya', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'penjahit online indonesia', secondaryKeyword: 'jasa penjahit online terpercaya', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'tailor jarak jauh indonesia', secondaryKeyword: 'tailor tanpa perlu datang', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'jasa jahit tanpa datang ke tailor', secondaryKeyword: 'jahit custom dari rumah', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'made to measure indonesia', secondaryKeyword: 'jasa made to measure indonesia', intent: 'commercial', targetPage: '/knowledge/tailoring/bespoke-vs-made-to-measure', cluster: 'tailoring', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'made to measure thobe indonesia', secondaryKeyword: 'thobe made to measure indonesia', intent: 'commercial', targetPage: '/knowledge/tailoring/bespoke-vs-made-to-measure', cluster: 'tailoring', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'apa itu made to measure thobe', secondaryKeyword: 'penjelasan made to measure thobe', intent: 'informational', targetPage: '/knowledge/tailoring/bespoke-vs-made-to-measure', cluster: 'tailoring', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'jasa jahit gamis pria indonesia', secondaryKeyword: 'tukang jahit gamis pria indonesia', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 7, authorityScore: 4 },
  { primaryKeyword: 'jasa jahit jubah pria indonesia', secondaryKeyword: 'tukang jahit jubah pria indonesia', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'penjahit kurta pria', secondaryKeyword: 'tukang jahit kurta pria', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 5, authorityScore: 3 },
  { primaryKeyword: 'jasa tailor pria muslim online', secondaryKeyword: 'tailor muslim online terpercaya', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'tailor rumahan vs tailor profesional', secondaryKeyword: 'perbedaan tailor rumahan dan profesional', intent: 'comparison', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'penjahit thobe terpercaya indonesia', secondaryKeyword: 'penjahit thobe rekomendasi indonesia', intent: 'commercial', targetPage: '/jahit-thobe-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'jahit custom pria terpercaya', secondaryKeyword: 'jasa jahit custom pria bagus', intent: 'commercial', targetPage: '/jahit-thobe-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'tailor terpercaya untuk pria', secondaryKeyword: 'tailor pria yang bagus', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'jasa jahit baju koko indonesia', secondaryKeyword: 'tukang jahit baju koko indonesia', intent: 'commercial', targetPage: '/custom-baju-koko-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'tailor untuk komunitas muslim', secondaryKeyword: 'tailor khusus kebutuhan muslim', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'penjahit khusus thobe', secondaryKeyword: 'tailor spesialis thobe', intent: 'commercial', targetPage: '/jahit-thobe-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'jasa custom fit pria', secondaryKeyword: 'custom fit pria muslim', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'apa itu tailor bespoke', secondaryKeyword: 'definisi tailor bespoke', intent: 'informational', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 3, authorityScore: 6 },
  { primaryKeyword: 'jasa jahit muslim pria terpercaya', secondaryKeyword: 'penjahit busana muslim terpercaya', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'tempat jahit custom terdekat vs online', secondaryKeyword: 'jahit custom lokal vs online', intent: 'comparison', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'jasa jahit thobe se-indonesia', secondaryKeyword: 'jahit thobe seluruh indonesia', intent: 'commercial', targetPage: '/locations', cluster: 'locations', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'penjahit thobe nasional', secondaryKeyword: 'tailor thobe seluruh indonesia', intent: 'commercial', targetPage: '/locations', cluster: 'locations', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'jasa jahit custom seluruh indonesia', secondaryKeyword: 'tailor custom cakupan nasional', intent: 'commercial', targetPage: '/locations', cluster: 'locations', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'tailor pria muslim se-indonesia', secondaryKeyword: 'tailor muslim cakupan nasional', intent: 'commercial', targetPage: '/locations', cluster: 'locations', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'apa itu penjahit bespoke', secondaryKeyword: 'penjahit bespoke artinya', intent: 'informational', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'jasa jahit pria berkualitas', secondaryKeyword: 'jahit pria kualitas terjamin', intent: 'commercial', targetPage: '/jahit-thobe-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'tailor pria untuk acara resmi', secondaryKeyword: 'tailor pria acara formal', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'jasa jahit gamis dan jubah', secondaryKeyword: 'tailor gamis jubah sekaligus', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'penjahit spesialis busana muslim pria', secondaryKeyword: 'tailor spesialis muslim pria', intent: 'commercial', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'jasa jahit thobe profesional', secondaryKeyword: 'penjahit thobe profesional', intent: 'commercial', targetPage: '/jahit-thobe-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
]

// -----------------------------------------------------------------------
// Wedding domination — additional Muslim-groom / family-coordination /
// premium-wedding-tailoring phrasing beyond the existing WEDDING_KEYWORDS,
// all targeting the already-shipped 8-article wedding cluster.
// -----------------------------------------------------------------------
const WEDDING_DOMINATION_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'muslim groom outfit', secondaryKeyword: 'outfit pengantin pria muslim', intent: 'commercial', targetPage: '/knowledge/wedding/bespoke-wedding-guide', cluster: 'wedding', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'baju pengantin muslim pria', secondaryKeyword: 'outfit pengantin pria islami', intent: 'commercial', targetPage: '/knowledge/wedding/bespoke-wedding-guide', cluster: 'wedding', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'baju nikah pria muslim', secondaryKeyword: 'outfit nikah pria islami', intent: 'commercial', targetPage: '/knowledge/wedding/akad-pria', cluster: 'wedding', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'outfit akad pria custom', secondaryKeyword: 'baju akad pria custom bespoke', intent: 'commercial', targetPage: '/knowledge/wedding/akad-pria', cluster: 'wedding', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'tailor wedding pria muslim', secondaryKeyword: 'tailor khusus pernikahan pria muslim', intent: 'commercial', targetPage: '/knowledge/wedding/bespoke-wedding-guide', cluster: 'wedding', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'bespoke wedding menswear', secondaryKeyword: 'busana pernikahan pria bespoke', intent: 'commercial', targetPage: '/knowledge/wedding/bespoke-wedding-guide', cluster: 'wedding', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'gamis wedding pria', secondaryKeyword: 'gamis pria untuk pernikahan', intent: 'commercial', targetPage: '/knowledge/wedding/bespoke-wedding-guide', cluster: 'wedding', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'jubah wedding pria', secondaryKeyword: 'jubah pria untuk pernikahan', intent: 'commercial', targetPage: '/knowledge/wedding/bespoke-wedding-guide', cluster: 'wedding', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'premium wedding tailoring', secondaryKeyword: 'tailoring pernikahan kelas premium', intent: 'commercial', targetPage: '/knowledge/wedding/premium-thobe-wedding', cluster: 'wedding', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'matching family wedding outfit', secondaryKeyword: 'outfit keluarga senada pernikahan', intent: 'commercial', targetPage: '/knowledge/wedding/family-outfit', cluster: 'wedding', commercialScore: 7, authorityScore: 6 },
  { primaryKeyword: 'koordinasi warna keluarga pengantin', secondaryKeyword: 'warna senada keluarga pengantin', intent: 'commercial', targetPage: '/knowledge/wedding/family-outfit', cluster: 'wedding', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'pilihan bahan untuk wedding', secondaryKeyword: 'bahan terbaik acara pernikahan', intent: 'informational', targetPage: '/knowledge/wedding/premium-thobe-wedding', cluster: 'wedding', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'timeline fitting sebelum resepsi', secondaryKeyword: 'jadwal fitting persiapan resepsi', intent: 'transactional', targetPage: '/knowledge/wedding/timeline-custom-wedding', cluster: 'wedding', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'persiapan wedding outfit pria', secondaryKeyword: 'checklist persiapan busana wedding', intent: 'commercial', targetPage: '/knowledge/wedding/timeline-custom-wedding', cluster: 'wedding', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'baju akad dan resepsi beda warna', secondaryKeyword: 'warna berbeda akad resepsi', intent: 'informational', targetPage: '/knowledge/wedding/color-guide', cluster: 'wedding', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'outfit groomsmen muslim', secondaryKeyword: 'seragam pendamping pengantin pria', intent: 'commercial', targetPage: '/knowledge/wedding/family-outfit', cluster: 'wedding', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'thobe untuk pengantin dan ayah', secondaryKeyword: 'outfit senada pengantin dan ayah', intent: 'commercial', targetPage: '/knowledge/wedding/family-outfit', cluster: 'wedding', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'wedding menswear muslim custom', secondaryKeyword: 'busana pernikahan pria muslim custom', intent: 'commercial', targetPage: '/knowledge/wedding/bespoke-wedding-guide', cluster: 'wedding', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'baju akad nikah premium', secondaryKeyword: 'outfit akad kelas premium', intent: 'commercial', targetPage: '/knowledge/wedding/premium-thobe-wedding', cluster: 'wedding', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'thobe wedding warna emas', secondaryKeyword: 'thobe pernikahan warna gold', intent: 'informational', targetPage: '/knowledge/wedding/color-guide', cluster: 'wedding', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'baju pengantin pria elegan', secondaryKeyword: 'outfit pengantin pria elegan', intent: 'commercial', targetPage: '/knowledge/wedding/bespoke-wedding-guide', cluster: 'wedding', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'kapan mulai fitting sebelum akad', secondaryKeyword: 'jadwal ideal fitting akad', intent: 'transactional', targetPage: '/knowledge/wedding/timeline-custom-wedding', cluster: 'wedding', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'baju wedding pria custom online', secondaryKeyword: 'pesan baju wedding online', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'outfit akad pria online', secondaryKeyword: 'desain outfit akad online', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'thobe pengantin custom luar kota', secondaryKeyword: 'pesan thobe pengantin dari luar kota', intent: 'transactional', targetPage: '/knowledge/design-studio/cara-pesan-custom-thobe-luar-kota', cluster: 'design-studio', commercialScore: 8, authorityScore: 5 },
]

// -----------------------------------------------------------------------
// National transactional queries — "harga/biaya/pesan/buat/konsultasi"
// phrasing not already covered by SERVICE_TERM_KEYWORDS, targeting the
// same real commercial pages.
// -----------------------------------------------------------------------
const TRANSACTIONAL_NATIONAL_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'harga jahit gamis pria', secondaryKeyword: 'biaya jahit gamis pria custom', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 9, authorityScore: 4 },
  { primaryKeyword: 'harga thobe custom', secondaryKeyword: 'biaya thobe custom terbaru', intent: 'transactional', targetPage: '/jahit-thobe-bandung', cluster: 'bandung', commercialScore: 9, authorityScore: 4 },
  { primaryKeyword: 'pesan jubah custom', secondaryKeyword: 'cara pesan jubah custom', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 4 },
  { primaryKeyword: 'buat thobe custom', secondaryKeyword: 'cara membuat thobe custom', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 4 },
  { primaryKeyword: 'jahit gamis pria', secondaryKeyword: 'tempat jahit gamis pria', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 7, authorityScore: 4 },
  { primaryKeyword: 'konsultasi tailor', secondaryKeyword: 'booking konsultasi tailor gratis', intent: 'transactional', targetPage: '/book-appointment', cluster: 'bandung', commercialScore: 9, authorityScore: 4 },
  { primaryKeyword: 'harga jahit jubah pria', secondaryKeyword: 'biaya jahit jubah pria custom', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 9, authorityScore: 4 },
  { primaryKeyword: 'harga baju koko custom', secondaryKeyword: 'biaya baju koko custom', intent: 'transactional', targetPage: '/custom-baju-koko-bandung', cluster: 'bandung', commercialScore: 9, authorityScore: 4 },
  { primaryKeyword: 'harga tailor bespoke', secondaryKeyword: 'biaya tailor bespoke terbaru', intent: 'transactional', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 9, authorityScore: 4 },
  { primaryKeyword: 'harga jahit kurta pria', secondaryKeyword: 'biaya jahit kurta pria', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 7, authorityScore: 3 },
  { primaryKeyword: 'pesan gamis pria online', secondaryKeyword: 'cara pesan gamis pria online', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 4 },
  { primaryKeyword: 'pesan thobe custom sekarang', secondaryKeyword: 'mulai pesan thobe custom', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 9, authorityScore: 4 },
  { primaryKeyword: 'konsultasi gratis custom thobe', secondaryKeyword: 'booking konsultasi thobe gratis', intent: 'transactional', targetPage: '/book-appointment', cluster: 'bandung', commercialScore: 9, authorityScore: 4 },
  { primaryKeyword: 'konsultasi tailor whatsapp', secondaryKeyword: 'chat konsultasi tailor', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 4 },
  { primaryKeyword: 'cara pesan custom thobe online', secondaryKeyword: 'panduan pesan thobe online', intent: 'transactional', targetPage: '/knowledge/design-studio/custom-thobe-online-panduan-lengkap', cluster: 'design-studio', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'estimasi harga thobe custom', secondaryKeyword: 'cek estimasi harga thobe', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 4 },
  { primaryKeyword: 'estimasi harga gamis pria', secondaryKeyword: 'cek harga gamis pria custom', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 7, authorityScore: 4 },
  { primaryKeyword: 'daftar harga tailor premium', secondaryKeyword: 'price list tailor premium', intent: 'transactional', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 8, authorityScore: 3 },
  { primaryKeyword: 'booking fitting thobe', secondaryKeyword: 'jadwal fitting thobe custom', intent: 'transactional', targetPage: '/book-appointment', cluster: 'bandung', commercialScore: 8, authorityScore: 4 },
  { primaryKeyword: 'cara order thobe bespoke', secondaryKeyword: 'langkah order thobe bespoke', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'harga custom fit pria', secondaryKeyword: 'biaya custom fit pria', intent: 'transactional', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 7, authorityScore: 3 },
  { primaryKeyword: 'konsultasi desain thobe gratis', secondaryKeyword: 'sesi desain thobe gratis', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 4 },
  { primaryKeyword: 'pesan baju koko online', secondaryKeyword: 'cara pesan baju koko online', intent: 'transactional', targetPage: '/custom-baju-koko-bandung', cluster: 'bandung', commercialScore: 8, authorityScore: 4 },
  { primaryKeyword: 'harga jahit baju muslim pria', secondaryKeyword: 'biaya jahit baju muslim pria', intent: 'transactional', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 8, authorityScore: 4 },
  { primaryKeyword: 'cara konsultasi sebelum pesan', secondaryKeyword: 'langkah konsultasi sebelum order', intent: 'transactional', targetPage: '/book-appointment', cluster: 'bandung', commercialScore: 7, authorityScore: 4 },
]

// -----------------------------------------------------------------------
// Comparison queries — the "comparison" intent bucket §2 explicitly asks
// for beyond what STYLING_KEYWORDS/TAILORING_KEYWORDS already cover.
// -----------------------------------------------------------------------
const COMPARISON_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'bespoke vs tailor biasa', secondaryKeyword: 'perbedaan bespoke dan tailor biasa', intent: 'comparison', targetPage: '/knowledge/questions/bespoke-vs-tailor', cluster: 'questions', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'gamis vs jubah vs thobe', secondaryKeyword: 'perbandingan tiga istilah pakaian muslim pria', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 5, authorityScore: 7 },
  { primaryKeyword: 'tailor premium vs bespoke tailor', secondaryKeyword: 'beda tailor premium dan bespoke', intent: 'comparison', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'custom vs bespoke vs made to measure', secondaryKeyword: 'perbandingan tiga istilah tailoring', intent: 'comparison', targetPage: '/knowledge/tailoring/bespoke-vs-made-to-measure', cluster: 'tailoring', commercialScore: 5, authorityScore: 7 },
  { primaryKeyword: 'baju koko vs thobe', secondaryKeyword: 'perbedaan baju koko dan thobe', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'gamis pria vs kurta', secondaryKeyword: 'perbedaan gamis pria dan kurta', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'tailor online vs tailor datang langsung', secondaryKeyword: 'perbandingan tailor online dan tatap muka', intent: 'comparison', targetPage: '/knowledge/design-studio/fitting-video-call-apakah-akurat', cluster: 'design-studio', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'thobe formal vs thobe wedding', secondaryKeyword: 'beda thobe formal dan wedding', intent: 'comparison', targetPage: '/knowledge/wedding/bespoke-wedding-guide', cluster: 'wedding', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'thobe umrah vs thobe formal', secondaryKeyword: 'beda thobe umrah dan formal', intent: 'comparison', targetPage: '/knowledge/umrah/best-fabric', cluster: 'umrah', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'penjahit lokal vs design studio online', secondaryKeyword: 'beda penjahit lokal dan online', intent: 'comparison', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 5, authorityScore: 4 },
]

// -----------------------------------------------------------------------
// Remaining territory — additional genuine query variants across the
// product/service/luxury/style/problem clusters above that didn't fit a
// single themed array, closing the gap to the 800-query floor without any
// exact-duplicate primaryKeyword (checked against the full repository).
// Still zero new URLs — every entry targets an existing page.
// -----------------------------------------------------------------------
const EXTENDED_COVERAGE_KEYWORDS: KeywordEntry[] = [
  { primaryKeyword: 'jubah pria dewasa premium', secondaryKeyword: 'jubah pria dewasa bahan premium', intent: 'commercial', targetPage: '/tailor-premium-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'gamis pria kantor custom', secondaryKeyword: 'gamis pria formal kantor custom', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'thobe untuk khutbah jumat', secondaryKeyword: 'baju khutbah jumat pria', intent: 'informational', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 4 },
  { primaryKeyword: 'thobe untuk pengajian rutin', secondaryKeyword: 'baju pengajian pria muslim', intent: 'informational', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'gamis pria untuk tarawih', secondaryKeyword: 'baju tarawih pria muslim', intent: 'informational', targetPage: '/knowledge/styling/casual-thobe', cluster: 'styling', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'jubah untuk itikaf', secondaryKeyword: 'baju itikaf pria muslim', intent: 'informational', targetPage: '/knowledge/styling/casual-thobe', cluster: 'styling', commercialScore: 3, authorityScore: 3 },
  { primaryKeyword: 'thobe untuk hari raya haji', secondaryKeyword: 'baju idul adha pria muslim', intent: 'commercial', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'gamis pria warna putih custom', secondaryKeyword: 'custom gamis putih polos', intent: 'commercial', targetPage: '/knowledge/styling/white-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'jubah pria warna navy custom', secondaryKeyword: 'custom jubah navy elegan', intent: 'commercial', targetPage: '/knowledge/styling/navy-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'kurta pria warna netral', secondaryKeyword: 'kurta pria warna aman', intent: 'informational', targetPage: '/knowledge/styling/navy-thobe', cluster: 'styling', commercialScore: 3, authorityScore: 3 },
  { primaryKeyword: 'bahan gamis pria premium', secondaryKeyword: 'kain gamis pria kualitas tinggi', intent: 'commercial', targetPage: '/knowledge/fabrics/premium-cotton', cluster: 'fabrics', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'bahan jubah pria terbaik', secondaryKeyword: 'kain jubah pria kualitas terbaik', intent: 'commercial', targetPage: '/knowledge/fabrics/premium-cotton', cluster: 'fabrics', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'katun jepang untuk gamis pria', secondaryKeyword: 'bahan katun jepang gamis', intent: 'informational', targetPage: '/knowledge/fabrics/japanese-cotton', cluster: 'fabrics', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'linen untuk jubah pria', secondaryKeyword: 'bahan linen jubah adem', intent: 'informational', targetPage: '/knowledge/fabrics/linen', cluster: 'fabrics', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'wool blend untuk jubah formal', secondaryKeyword: 'bahan wool blend jubah', intent: 'informational', targetPage: '/knowledge/fabrics/wool-blend', cluster: 'fabrics', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'ukuran kandura pria', secondaryKeyword: 'size chart kandura pria', intent: 'commercial', targetPage: '/knowledge/measurements/thobe-size-guide', cluster: 'measurements', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'ukuran dishdasha pria', secondaryKeyword: 'size chart dishdasha pria', intent: 'commercial', targetPage: '/knowledge/measurements/thobe-size-guide', cluster: 'measurements', commercialScore: 4, authorityScore: 3 },
  { primaryKeyword: 'ukuran qamis pria', secondaryKeyword: 'size chart qamis pria', intent: 'commercial', targetPage: '/knowledge/measurements/thobe-size-guide', cluster: 'measurements', commercialScore: 4, authorityScore: 3 },
  { primaryKeyword: 'cara ukur badan untuk kandura', secondaryKeyword: 'panduan ukur kandura pria', intent: 'informational', targetPage: '/knowledge/measurements/how-to-measure-body', cluster: 'measurements', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'digital body profile gamis jubah', secondaryKeyword: 'profil ukuran tersimpan gamis jubah', intent: 'commercial', targetPage: '/knowledge/measurements/how-to-measure-body', cluster: 'measurements', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'jasa jahit thobe wanita vs pria', secondaryKeyword: 'perbedaan thobe wanita dan pria', intent: 'comparison', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'apa itu bisht', secondaryKeyword: 'pengertian bisht pernikahan', intent: 'informational', targetPage: '/knowledge/wedding/akad-pria', cluster: 'wedding', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'bisht untuk kandura', secondaryKeyword: 'bisht dipakai dengan kandura', intent: 'informational', targetPage: '/knowledge/wedding/akad-pria', cluster: 'wedding', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'peci untuk thobe formal', secondaryKeyword: 'aksesori kepala thobe formal', intent: 'informational', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'sorban untuk thobe wedding', secondaryKeyword: 'aksesori sorban pernikahan', intent: 'informational', targetPage: '/knowledge/wedding/akad-pria', cluster: 'wedding', commercialScore: 3, authorityScore: 3 },
  { primaryKeyword: 'tailor untuk keluarga besar', secondaryKeyword: 'jasa jahit family outfit besar', intent: 'commercial', targetPage: '/knowledge/wedding/family-outfit', cluster: 'wedding', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'jahit seragam keluarga muslim', secondaryKeyword: 'custom seragam keluarga muslim', intent: 'commercial', targetPage: '/knowledge/wedding/family-outfit', cluster: 'wedding', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'thobe couple ayah anak', secondaryKeyword: 'outfit senada ayah dan anak', intent: 'commercial', targetPage: '/knowledge/wedding/family-outfit', cluster: 'wedding', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'thobe umrah untuk keluarga', secondaryKeyword: 'outfit umrah senada keluarga', intent: 'commercial', targetPage: '/knowledge/umrah/custom-umrah-thobe', cluster: 'umrah', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'thobe umrah premium custom', secondaryKeyword: 'thobe umrah bahan premium', intent: 'commercial', targetPage: '/knowledge/umrah/premium-umrah-outfit', cluster: 'umrah', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'jubah umrah custom premium', secondaryKeyword: 'jubah ibadah bahan premium', intent: 'commercial', targetPage: '/knowledge/umrah/premium-umrah-outfit', cluster: 'umrah', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'gamis pria untuk umrah', secondaryKeyword: 'gamis ibadah untuk umrah', intent: 'commercial', targetPage: '/knowledge/umrah/custom-umrah-thobe', cluster: 'umrah', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'kandura untuk umrah', secondaryKeyword: 'kandura ibadah perjalanan umrah', intent: 'informational', targetPage: '/knowledge/umrah/best-fabric', cluster: 'umrah', commercialScore: 4, authorityScore: 3 },
  { primaryKeyword: 'perbedaan pakai thobe di indonesia dan arab', secondaryKeyword: 'konteks pemakaian thobe indonesia arab', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'kenapa orang indonesia sebut gamis bukan thobe', secondaryKeyword: 'kebiasaan istilah gamis di indonesia', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 2, authorityScore: 5 },
  { primaryKeyword: 'apakah jubah termasuk thobe', secondaryKeyword: 'jubah bagian dari kategori thobe', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'apakah gamis termasuk thobe', secondaryKeyword: 'gamis bagian dari kategori thobe', intent: 'informational', targetPage: '/knowledge/tailoring/thobe-gamis-jubah-perbedaan-istilah', cluster: 'tailoring', commercialScore: 3, authorityScore: 5 },
  { primaryKeyword: 'thobe custom fit slim', secondaryKeyword: 'thobe custom potongan slim', intent: 'commercial', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'gamis custom fit slim', secondaryKeyword: 'gamis pria potongan slim custom', intent: 'commercial', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'jubah custom fit longgar', secondaryKeyword: 'jubah pria potongan longgar custom', intent: 'commercial', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'pilihan fit di design studio', secondaryKeyword: 'opsi slim regular relaxed design studio', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'tailor untuk pria tinggi besar', secondaryKeyword: 'custom thobe pria tinggi besar', intent: 'commercial', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'tailor untuk pria kurus tinggi', secondaryKeyword: 'custom thobe pria kurus tinggi', intent: 'commercial', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'apa beda tailor dan modiste', secondaryKeyword: 'istilah tailor vs modiste', intent: 'comparison', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'apa beda konveksi dan tailor', secondaryKeyword: 'istilah konveksi vs tailor bespoke', intent: 'comparison', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'thobe konveksi vs thobe bespoke', secondaryKeyword: 'perbedaan thobe konveksi dan bespoke', intent: 'comparison', targetPage: '/bespoke-tailor-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'gamis konveksi vs custom', secondaryKeyword: 'perbedaan gamis konveksi dan custom', intent: 'comparison', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'jubah konveksi vs custom', secondaryKeyword: 'perbedaan jubah konveksi dan custom', intent: 'comparison', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'baju koko konveksi vs custom', secondaryKeyword: 'perbedaan baju koko konveksi dan custom', intent: 'comparison', targetPage: '/custom-baju-koko-bandung', cluster: 'bandung', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'kurta konveksi vs custom', secondaryKeyword: 'perbedaan kurta konveksi dan custom', intent: 'comparison', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 4, authorityScore: 3 },
  { primaryKeyword: 'apa itu fabric explorer', secondaryKeyword: 'fungsi fabric explorer local tailor', intent: 'informational', targetPage: '/fabric', cluster: 'fabrics', commercialScore: 4, authorityScore: 4 },
  { primaryKeyword: 'jelajahi bahan thobe online', secondaryKeyword: 'lihat koleksi bahan thobe online', intent: 'commercial', targetPage: '/fabric', cluster: 'fabrics', commercialScore: 6, authorityScore: 4 },
  { primaryKeyword: 'koleksi bahan gamis online', secondaryKeyword: 'lihat koleksi bahan gamis online', intent: 'commercial', targetPage: '/fabric', cluster: 'fabrics', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'koleksi bahan jubah online', secondaryKeyword: 'lihat koleksi bahan jubah online', intent: 'commercial', targetPage: '/fabric', cluster: 'fabrics', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'cara cek ukuran thobe tanpa ke tailor', secondaryKeyword: 'cek ukuran online cepat', intent: 'transactional', targetPage: '/cek-ukuran-thobe', cluster: 'measurements', commercialScore: 7, authorityScore: 4 },
  { primaryKeyword: 'panduan lengkap ukuran thobe pria', secondaryKeyword: 'size chart thobe pria lengkap', intent: 'commercial', targetPage: '/ukuran-thobe-pria', cluster: 'measurements', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'cara mengukur thobe langkah demi langkah', secondaryKeyword: 'panduan ukur thobe step by step', intent: 'informational', targetPage: '/cara-mengukur-thobe', cluster: 'measurements', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'size chart thobe lengkap semua ukuran', secondaryKeyword: 'tabel ukuran thobe lengkap', intent: 'commercial', targetPage: '/size-chart-thobe', cluster: 'measurements', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'estimasi ukuran badan gratis', secondaryKeyword: 'cek profil tubuh gratis online', intent: 'transactional', targetPage: '/free-body-profile-estimator', cluster: 'measurements', commercialScore: 7, authorityScore: 5 },
  { primaryKeyword: 'galeri hasil jahitan thobe', secondaryKeyword: 'contoh hasil thobe bespoke', intent: 'commercial', targetPage: '/gallery', cluster: 'bandung', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'contoh hasil gamis custom', secondaryKeyword: 'galeri gamis custom local tailor', intent: 'commercial', targetPage: '/gallery', cluster: 'bandung', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'contoh hasil jubah custom', secondaryKeyword: 'galeri jubah custom local tailor', intent: 'commercial', targetPage: '/gallery', cluster: 'bandung', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'kontak local tailor', secondaryKeyword: 'cara menghubungi local tailor', intent: 'transactional', targetPage: '/contact', cluster: 'bandung', commercialScore: 6, authorityScore: 3 },
  { primaryKeyword: 'artikel tailoring terbaru', secondaryKeyword: 'blog tailoring local tailor', intent: 'informational', targetPage: '/journal', cluster: 'tailoring', commercialScore: 3, authorityScore: 4 },
  { primaryKeyword: 'tailor pria untuk pemula', secondaryKeyword: 'panduan pertama kali pesan tailor', intent: 'informational', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'apa yang perlu disiapkan sebelum konsultasi tailor', secondaryKeyword: 'persiapan sebelum konsultasi custom', intent: 'informational', targetPage: '/book-appointment', cluster: 'bandung', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'berapa kali fitting untuk thobe bespoke', secondaryKeyword: 'jumlah sesi fitting thobe', intent: 'informational', targetPage: '/knowledge/tailoring/what-is-bespoke', cluster: 'tailoring', commercialScore: 4, authorityScore: 6 },
  { primaryKeyword: 'apakah bisa revisi desain thobe', secondaryKeyword: 'revisi desain sebelum produksi', intent: 'commercial', targetPage: '/design-studio', cluster: 'design-studio', commercialScore: 5, authorityScore: 4 },
  { primaryKeyword: 'gamis pria untuk remaja', secondaryKeyword: 'gamis pria ukuran remaja custom', intent: 'commercial', targetPage: '/knowledge/measurements/thobe-size-guide', cluster: 'measurements', commercialScore: 5, authorityScore: 3 },
  { primaryKeyword: 'thobe custom untuk lansia', secondaryKeyword: 'thobe nyaman untuk lansia', intent: 'commercial', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 4, authorityScore: 3 },
  { primaryKeyword: 'apakah local tailor melayani luar pulau', secondaryKeyword: 'jangkauan layanan luar pulau', intent: 'informational', targetPage: '/knowledge/design-studio/cara-pesan-custom-thobe-luar-kota', cluster: 'design-studio', commercialScore: 5, authorityScore: 5 },
  { primaryKeyword: 'apakah local tailor melayani luar negeri', secondaryKeyword: 'jangkauan layanan internasional', intent: 'informational', targetPage: '/knowledge/design-studio/cara-pesan-custom-thobe-luar-kota', cluster: 'design-studio', commercialScore: 5, authorityScore: 5 },
]

// =========================================================================
// Sprint W6R.3 Patch — Faith & Occasion Semantic Expansion. Every entry
// carries `status` + `semanticParent` per the patch's own requirement.
// Chain enforced throughout: religious occasion -> clothing need ->
// fabric/fit/style/custom tailoring -> existing page. Zero new pages
// beyond the one already justified in styling.ts (hari-raya-thobe-style);
// everything else is 'covered' (an existing page already answers it) or
// 'expanded' (an existing page gains new query coverage without new
// content). Nothing here is fabricated religious content, an endorsement,
// or a "product improves your ibadah" claim — every target page is a
// clothing/fabric/fit/tailoring page, never a bare religious topic.
// =========================================================================
const FAITH_OCCASION_KEYWORDS: KeywordEntry[] = [
  // --- Umrah / Haji — existing /knowledge/umrah cluster + fabric/care ---
  { primaryKeyword: 'jubah pria untuk umrah', secondaryKeyword: 'jubah ibadah umrah', intent: 'commercial', targetPage: '/knowledge/umrah/custom-umrah-thobe', cluster: 'umrah', commercialScore: 6, authorityScore: 5, status: 'covered', semanticParent: 'umrah' },
  { primaryKeyword: 'pakaian pria untuk umrah', secondaryKeyword: 'baju ibadah pria untuk umrah', intent: 'commercial', targetPage: '/knowledge/umrah', cluster: 'umrah', commercialScore: 6, authorityScore: 6, status: 'covered', semanticParent: 'umrah' },
  { primaryKeyword: 'jubah pria untuk haji', secondaryKeyword: 'jubah ibadah haji', intent: 'commercial', targetPage: '/knowledge/umrah/custom-umrah-thobe', cluster: 'umrah', commercialScore: 5, authorityScore: 4, status: 'covered', semanticParent: 'umrah' },
  { primaryKeyword: 'bahan thobe adem untuk umrah', secondaryKeyword: 'kain umrah tidak panas', intent: 'informational', targetPage: '/knowledge/umrah/best-fabric', cluster: 'umrah', commercialScore: 4, authorityScore: 6, status: 'covered', semanticParent: 'umrah' },
  { primaryKeyword: 'bahan jubah tidak panas untuk haji', secondaryKeyword: 'kain jubah haji adem', intent: 'informational', targetPage: '/knowledge/umrah/best-fabric', cluster: 'umrah', commercialScore: 4, authorityScore: 5, status: 'covered', semanticParent: 'umrah' },
  { primaryKeyword: 'pakaian nyaman untuk perjalanan ibadah', secondaryKeyword: 'baju nyaman perjalanan umrah haji', intent: 'informational', targetPage: '/knowledge/umrah/best-fabric', cluster: 'umrah', commercialScore: 4, authorityScore: 5, status: 'covered', semanticParent: 'umrah' },
  { primaryKeyword: 'gamis pria untuk haji', secondaryKeyword: 'gamis ibadah haji custom', intent: 'commercial', targetPage: '/knowledge/umrah/custom-umrah-thobe', cluster: 'umrah', commercialScore: 5, authorityScore: 4, status: 'covered', semanticParent: 'umrah' },
  { primaryKeyword: 'perlengkapan pakaian haji pria', secondaryKeyword: 'checklist baju haji pria', intent: 'informational', targetPage: '/knowledge/umrah/packing-guide', cluster: 'umrah', commercialScore: 4, authorityScore: 5, status: 'covered', semanticParent: 'umrah' },
  { primaryKeyword: 'thobe tahan lama untuk ibadah haji panjang', secondaryKeyword: 'thobe haji durasi lama', intent: 'informational', targetPage: '/knowledge/umrah/best-fabric', cluster: 'umrah', commercialScore: 4, authorityScore: 4, status: 'covered', semanticParent: 'umrah' },
  { primaryKeyword: 'gaya thobe haji dan umrah', secondaryKeyword: 'styling thobe ibadah haji umrah', intent: 'informational', targetPage: '/knowledge/styling/umrah-thobe-style', cluster: 'styling', commercialScore: 4, authorityScore: 5, status: 'covered', semanticParent: 'umrah' },
  { primaryKeyword: 'thobe ihram vs thobe umrah biasa', secondaryKeyword: 'beda ihram dan thobe umrah', intent: 'comparison', targetPage: '/knowledge/umrah', cluster: 'umrah', commercialScore: 3, authorityScore: 4, status: 'covered', semanticParent: 'umrah' },

  // --- Jumatan / Shalat Jumat — existing styling/fabric pages ---
  { primaryKeyword: 'thobe untuk Jumatan', secondaryKeyword: 'baju Jumatan pria muslim', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 5, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'gamis pria untuk Jumatan', secondaryKeyword: 'gamis Jumatan custom', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 4, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'jubah pria untuk Jumat', secondaryKeyword: 'jubah Jumatan pria', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 4, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'baju muslim pria untuk shalat Jumat', secondaryKeyword: 'outfit shalat Jumat pria', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 5, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'pakaian pria untuk Jumatan', secondaryKeyword: 'baju pria Jumatan rapi', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 4, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'thobe santai untuk shalat Jumat', secondaryKeyword: 'thobe casual Jumatan', intent: 'informational', targetPage: '/knowledge/styling/casual-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 4, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'bahan thobe untuk Jumatan cuaca panas', secondaryKeyword: 'kain adem untuk shalat Jumat', intent: 'informational', targetPage: '/knowledge/fabrics/linen', cluster: 'fabrics', commercialScore: 4, authorityScore: 4, status: 'covered', semanticParent: 'jumatan-kajian-wear' },

  // --- Kajian / Pengajian / Majelis — existing styling+fabric pages ---
  { primaryKeyword: 'jubah pria untuk pengajian', secondaryKeyword: 'jubah pengajian custom', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 4, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'pakaian muslim pria untuk majelis', secondaryKeyword: 'outfit majelis pria muslim', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 4, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'outfit pria untuk kajian', secondaryKeyword: 'gaya thobe kajian rutin', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 4, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'pakaian muslim formal untuk pengajian', secondaryKeyword: 'baju formal pengajian pria', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 4, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'gamis pria untuk majelis taklim', secondaryKeyword: 'gamis majelis taklim custom', intent: 'commercial', targetPage: '/knowledge/styling/formal-thobe', cluster: 'styling', commercialScore: 5, authorityScore: 3, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'thobe santai untuk kajian mingguan', secondaryKeyword: 'thobe casual kajian rutin', intent: 'informational', targetPage: '/knowledge/styling/casual-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 4, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'bahan nyaman untuk duduk lama kajian', secondaryKeyword: 'kain nyaman duduk lama majelis', intent: 'informational', targetPage: '/knowledge/fabrics/premium-cotton', cluster: 'fabrics', commercialScore: 3, authorityScore: 4, status: 'covered', semanticParent: 'jumatan-kajian-wear' },

  // --- Idul Fitri / Hari Raya — new dedicated styling article ---
  { primaryKeyword: 'gamis pria Lebaran', secondaryKeyword: 'gamis pria custom untuk Lebaran', intent: 'commercial', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 7, authorityScore: 5, status: 'new-page', semanticParent: 'hari-raya-thobe' },
  { primaryKeyword: 'jubah pria Hari Raya', secondaryKeyword: 'jubah pria custom Hari Raya', intent: 'commercial', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 7, authorityScore: 5, status: 'new-page', semanticParent: 'hari-raya-thobe' },
  { primaryKeyword: 'baju muslim pria Idul Fitri', secondaryKeyword: 'outfit Idul Fitri pria muslim', intent: 'commercial', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 7, authorityScore: 5, status: 'new-page', semanticParent: 'hari-raya-thobe' },
  { primaryKeyword: 'custom thobe Lebaran', secondaryKeyword: 'thobe custom untuk Lebaran', intent: 'transactional', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 8, authorityScore: 5, status: 'new-page', semanticParent: 'hari-raya-thobe' },
  { primaryKeyword: 'gamis pria premium Lebaran', secondaryKeyword: 'gamis pria kelas premium Lebaran', intent: 'commercial', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 7, authorityScore: 5, status: 'new-page', semanticParent: 'hari-raya-thobe' },
  { primaryKeyword: 'outfit pria Hari Raya', secondaryKeyword: 'gaya outfit pria Hari Raya', intent: 'commercial', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 6, authorityScore: 5, status: 'new-page', semanticParent: 'hari-raya-thobe' },
  { primaryKeyword: 'baju baru Lebaran pria', secondaryKeyword: 'tradisi baju baru Lebaran pria', intent: 'informational', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 5, authorityScore: 5, status: 'new-page', semanticParent: 'hari-raya-thobe' },
  { primaryKeyword: 'kapan pesan thobe Lebaran', secondaryKeyword: 'timeline pesan thobe sebelum Lebaran', intent: 'transactional', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 7, authorityScore: 5, status: 'new-page', semanticParent: 'hari-raya-thobe' },
  { primaryKeyword: 'family outfit Lebaran', secondaryKeyword: 'outfit keluarga senada Lebaran', intent: 'commercial', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 7, authorityScore: 5, status: 'new-page', semanticParent: 'hari-raya-thobe' },
  { primaryKeyword: 'thobe untuk sholat Id', secondaryKeyword: 'baju sholat Idul Fitri pria', intent: 'commercial', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 6, authorityScore: 5, status: 'new-page', semanticParent: 'hari-raya-thobe' },
  { primaryKeyword: 'baju silaturahmi Lebaran pria', secondaryKeyword: 'outfit silaturahmi Hari Raya', intent: 'commercial', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 6, authorityScore: 4, status: 'new-page', semanticParent: 'hari-raya-thobe' },
  { primaryKeyword: 'warna thobe segar untuk Lebaran', secondaryKeyword: 'warna cerah thobe Hari Raya', intent: 'informational', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 5, authorityScore: 4, status: 'new-page', semanticParent: 'hari-raya-thobe' },
  { primaryKeyword: 'jubah pria Idul Fitri custom', secondaryKeyword: 'jubah custom untuk Idul Fitri', intent: 'commercial', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 6, authorityScore: 4, status: 'new-page', semanticParent: 'hari-raya-thobe' },
  { primaryKeyword: 'gamis pria Idul Adha', secondaryKeyword: 'gamis pria untuk Hari Raya Haji', intent: 'commercial', targetPage: '/knowledge/styling/hari-raya-thobe-style', cluster: 'styling', commercialScore: 5, authorityScore: 4, status: 'new-page', semanticParent: 'hari-raya-thobe' },

  // --- Shalat / Ibadah harian — existing fabric/fit/styling pages ---
  { primaryKeyword: 'thobe nyaman untuk shalat', secondaryKeyword: 'thobe fleksibel gerakan shalat', intent: 'informational', targetPage: '/knowledge/styling/casual-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'jubah pria untuk shalat', secondaryKeyword: 'jubah nyaman untuk ibadah shalat', intent: 'informational', targetPage: '/knowledge/styling/casual-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 4, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'pakaian muslim pria untuk ibadah', secondaryKeyword: 'baju muslim pria khusus ibadah', intent: 'informational', targetPage: '/knowledge/styling/casual-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'thobe putih untuk ibadah', secondaryKeyword: 'thobe putih shalat harian', intent: 'informational', targetPage: '/knowledge/styling/white-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 5, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'bahan thobe nyaman untuk shalat', secondaryKeyword: 'kain thobe fleksibel gerakan sujud', intent: 'informational', targetPage: '/knowledge/fabrics/premium-cotton', cluster: 'fabrics', commercialScore: 4, authorityScore: 5, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'pakaian muslim pria breathable', secondaryKeyword: 'baju muslim pria sirkulasi udara', intent: 'informational', targetPage: '/knowledge/fabrics/japanese-cotton', cluster: 'fabrics', commercialScore: 4, authorityScore: 5, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'thobe fit longgar untuk gerakan shalat', secondaryKeyword: 'fit thobe nyaman sujud rukuk', intent: 'informational', targetPage: '/knowledge/measurements/slim-vs-regular-fit', cluster: 'measurements', commercialScore: 4, authorityScore: 5, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'panjang thobe ideal untuk shalat', secondaryKeyword: 'panjang thobe agar tidak terinjak saat sujud', intent: 'informational', targetPage: '/knowledge/measurements/length', cluster: 'measurements', commercialScore: 4, authorityScore: 5, status: 'covered', semanticParent: 'jumatan-kajian-wear' },

  // --- Hijrah / lifestyle — light touch only, real search intent, no
  // generic religious content (per patch's explicit warning) ---
  { primaryKeyword: 'gaya berpakaian muslim pria', secondaryKeyword: 'panduan gaya busana muslim pria', intent: 'informational', targetPage: '/knowledge/styling', cluster: 'styling', commercialScore: 4, authorityScore: 6, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'wardrobe muslim pria', secondaryKeyword: 'koleksi pakaian muslim pria', intent: 'informational', targetPage: '/knowledge/styling', cluster: 'styling', commercialScore: 4, authorityScore: 5, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'pakaian modest pria', secondaryKeyword: 'busana modest pria muslim', intent: 'informational', targetPage: '/knowledge/styling', cluster: 'styling', commercialScore: 4, authorityScore: 5, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
  { primaryKeyword: 'thobe untuk gaya hidup sehari-hari', secondaryKeyword: 'thobe lifestyle harian pria muslim', intent: 'informational', targetPage: '/knowledge/styling/casual-thobe', cluster: 'styling', commercialScore: 4, authorityScore: 4, status: 'covered', semanticParent: 'jumatan-kajian-wear' },
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
  ...LUXURY_KEYWORDS,
  ...TERMINOLOGY_REGIONAL_KEYWORDS,
  ...COLLAR_CUFF_STYLE_KEYWORDS,
  ...PROBLEM_NEED_KEYWORDS,
  ...TAILOR_PENJAHIT_NATIONAL_KEYWORDS,
  ...WEDDING_DOMINATION_KEYWORDS,
  ...TRANSACTIONAL_NATIONAL_KEYWORDS,
  ...COMPARISON_KEYWORDS,
  ...EXTENDED_COVERAGE_KEYWORDS,
  ...FAITH_OCCASION_KEYWORDS,
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
