import type { KnowledgeCategorySlug } from '@/lib/knowledge/types'
import type { QueryIntent } from './queryIntent'

// Sprint W6-9 — Long-tail keyword repository, 152 entries across the 8
// clusters the brief names (Fabric/Measurement/Styling/Wedding/Umrah/
// Tailoring/Care/Bogor). Every `targetPage` references a real route that
// exists in this codebase as of W6-10 — none point at a page that doesn't
// exist yet. commercialScore/authorityScore are 1-10 editorial judgment
// calls (how close to a purchase decision / how much topical-authority
// value the query carries), not derived from any real search-volume data
// source — there's no Search Console or keyword-tool connection in this
// project, matching the brief's "Tidak perlu koneksi API" instruction.

export interface KeywordEntry {
  primaryKeyword: string
  secondaryKeyword: string
  intent: QueryIntent
  targetPage: string
  cluster: KnowledgeCategorySlug
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
  { primaryKeyword: 'tailor pernikahan muslim Bogor', secondaryKeyword: 'jasa jahit wedding Bogor', intent: 'local', targetPage: '/knowledge/bogor/wedding-tailor', cluster: 'wedding', commercialScore: 9, authorityScore: 6 },
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
  { primaryKeyword: 'tailor thobe umrah Bogor', secondaryKeyword: 'jasa jahit thobe umrah Bogor', intent: 'local', targetPage: '/knowledge/bogor/umrah-thobe', cluster: 'umrah', commercialScore: 9, authorityScore: 6 },
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
  { primaryKeyword: 'tailor bespoke Bogor', secondaryKeyword: 'penjahit custom Bogor', intent: 'local', targetPage: '/knowledge/bogor/bespoke-tailor', cluster: 'tailoring', commercialScore: 9, authorityScore: 6 },
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
  { primaryKeyword: 'tailor bespoke Bogor', secondaryKeyword: 'jasa jahit bespoke Bogor', intent: 'local', targetPage: '/knowledge/bogor', cluster: 'bogor', commercialScore: 9, authorityScore: 8 },
  { primaryKeyword: 'custom thobe Bogor', secondaryKeyword: 'jahit thobe custom Bogor', intent: 'local', targetPage: '/knowledge/bogor/custom-thobe', cluster: 'bogor', commercialScore: 9, authorityScore: 8 },
  { primaryKeyword: 'thobe pernikahan Bogor', secondaryKeyword: 'wedding tailor Bogor', intent: 'local', targetPage: '/knowledge/bogor/wedding-tailor', cluster: 'bogor', commercialScore: 9, authorityScore: 7 },
  { primaryKeyword: 'thobe umrah Bogor', secondaryKeyword: 'jahit thobe umrah Bogor', intent: 'local', targetPage: '/knowledge/bogor/umrah-thobe', cluster: 'bogor', commercialScore: 9, authorityScore: 7 },
  { primaryKeyword: 'konsultasi bespoke tailor Bogor', secondaryKeyword: 'booking konsultasi Bogor', intent: 'transactional', targetPage: '/book-appointment', cluster: 'bogor', commercialScore: 9, authorityScore: 6 },
  { primaryKeyword: 'workshop tailoring Bogor', secondaryKeyword: 'atelier bespoke Bogor', intent: 'informational', targetPage: '/knowledge/bogor', cluster: 'bogor', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'fitting thobe custom Bogor', secondaryKeyword: 'jasa fitting Bogor', intent: 'local', targetPage: '/knowledge/bogor/bespoke-tailor', cluster: 'bogor', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'Tarda Bogor', secondaryKeyword: 'Tarda pengalaman pelanggan', intent: 'commercial', targetPage: '/knowledge/bogor', cluster: 'bogor', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'penjahit thobe terbaik Bogor', secondaryKeyword: 'rekomendasi tailor Bogor', intent: 'commercial', targetPage: '/knowledge/bogor', cluster: 'bogor', commercialScore: 8, authorityScore: 7 },
  { primaryKeyword: 'harga thobe custom Bogor', secondaryKeyword: 'biaya bespoke tailor Bogor', intent: 'transactional', targetPage: '/knowledge/bogor/custom-thobe', cluster: 'bogor', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'digital body profile Bogor', secondaryKeyword: 'pengukuran tersimpan Bogor', intent: 'commercial', targetPage: '/knowledge/bogor/bespoke-tailor', cluster: 'bogor', commercialScore: 6, authorityScore: 5 },
  { primaryKeyword: 'jasa jahit thobe premium Bogor', secondaryKeyword: 'tailor premium Bogor', intent: 'local', targetPage: '/knowledge/bogor/custom-thobe', cluster: 'bogor', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'thobe akad nikah Bogor', secondaryKeyword: 'jahit outfit akad Bogor', intent: 'local', targetPage: '/knowledge/bogor/wedding-tailor', cluster: 'bogor', commercialScore: 8, authorityScore: 6 },
  { primaryKeyword: 'proses bespoke di Bogor', secondaryKeyword: 'alur konsultasi hingga produksi', intent: 'informational', targetPage: '/knowledge/bogor', cluster: 'bogor', commercialScore: 5, authorityScore: 6 },
  { primaryKeyword: 'tailor thobe dekat saya Bogor', secondaryKeyword: 'jasa jahit thobe area Bogor', intent: 'local', targetPage: '/knowledge/bogor', cluster: 'bogor', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'delivery thobe custom Bogor', secondaryKeyword: 'pengiriman thobe bespoke', intent: 'informational', targetPage: '/knowledge/bogor', cluster: 'bogor', commercialScore: 4, authorityScore: 5 },
  { primaryKeyword: 'konsultasi gratis tailor Bogor', secondaryKeyword: 'booking fitting gratis', intent: 'transactional', targetPage: '/book-appointment', cluster: 'bogor', commercialScore: 8, authorityScore: 5 },
  { primaryKeyword: 'bespoke tailor vs konveksi Bogor', secondaryKeyword: 'perbedaan bespoke konveksi', intent: 'comparison', targetPage: '/knowledge/bogor/bespoke-tailor', cluster: 'bogor', commercialScore: 6, authorityScore: 6 },
  { primaryKeyword: 'thobe custom untuk acara formal Bogor', secondaryKeyword: 'jahit thobe formal Bogor', intent: 'commercial', targetPage: '/knowledge/bogor/custom-thobe', cluster: 'bogor', commercialScore: 7, authorityScore: 6 },
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
]

export function getKeywordsByCluster(cluster: KnowledgeCategorySlug): KeywordEntry[] {
  return KEYWORD_REPOSITORY.filter((entry) => entry.cluster === cluster)
}

export function getKeywordsByIntent(intent: QueryIntent): KeywordEntry[] {
  return KEYWORD_REPOSITORY.filter((entry) => entry.intent === intent)
}

export function getTopCommercialKeywords(limit = 10): KeywordEntry[] {
  return [...KEYWORD_REPOSITORY].sort((a, b) => b.commercialScore - a.commercialScore).slice(0, limit)
}
