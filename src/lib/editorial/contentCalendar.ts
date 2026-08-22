import type { KnowledgeCategorySlug } from '@/lib/knowledge/types'

// Sprint W6-9 — 12-month editorial calendar, keyed to Gregorian month
// (stable) rather than the Hijri calendar (shifts ~10-11 days earlier
// every Gregorian year). Ramadhan, Eid al-Fitr, Eid al-Adha, and Hajj are
// flagged qualitatively per month as "usually falls near here" — NOT
// hardcoded to a specific date, since publishing a wrong Hijri date in a
// real editorial calendar would actively mislead whoever uses it. Anyone
// operationalizing this for a specific year must cross-check the actual
// Hijri conversion for that year before scheduling around it.

export interface MonthlyPlan {
  month: number
  monthName: string
  theme: string
  primaryCluster: KnowledgeCategorySlug
  weeklyFocus: string[]
  seasonalNote?: string
}

export const EDITORIAL_CALENDAR: MonthlyPlan[] = [
  {
    month: 1,
    monthName: 'Januari',
    theme: 'Awal tahun — body profile dan perencanaan bespoke',
    primaryCluster: 'measurements',
    weeklyFocus: ['Refresh Digital Body Profile', 'Panduan ukuran dasar', 'Fit slim vs regular', 'Perencanaan wardrobe tahun baru'],
  },
  {
    month: 2,
    monthName: 'Februari',
    theme: 'Edukasi bahan — musim sebelum permintaan puncak',
    primaryCluster: 'fabrics',
    weeklyFocus: ['Perbandingan bahan premium', 'Bahan untuk cuaca panas', 'Bahan formal vs casual', 'Perawatan dasar bahan'],
  },
  {
    month: 3,
    monthName: 'Maret',
    theme: 'Persiapan menjelang Ramadhan (cek kalender Hijriah tahun berjalan)',
    primaryCluster: 'styling',
    weeklyFocus: ['Gaya thobe untuk ibadah', 'Warna netral dan putih', 'Perawatan thobe sebelum dipakai intensif', 'Panduan ukuran ulang'],
    seasonalNote: 'Ramadhan biasanya jatuh di sekitar periode ini, namun bergeser ~10-11 hari lebih awal setiap tahun Masehi — verifikasi tanggal Hijriah aktual sebelum menjadwalkan konten musiman.',
  },
  {
    month: 4,
    monthName: 'April',
    theme: 'Ramadhan/Idul Fitri — styling dan family outfit',
    primaryCluster: 'styling',
    weeklyFocus: ['Gaya thobe Lebaran', 'Family outfit koordinasi', 'Perawatan cepat menjelang hari raya', 'Warna thobe untuk silaturahmi'],
    seasonalNote: 'Idul Fitri umumnya berada di sekitar periode ini — verifikasi tanggal Hijriah aktual tahun berjalan.',
  },
  {
    month: 5,
    monthName: 'Mei',
    theme: 'Awal musim pernikahan',
    primaryCluster: 'wedding',
    weeklyFocus: ['Panduan lengkap thobe pernikahan', 'Thobe akad', 'Timeline pemesanan custom', 'Panduan warna pernikahan'],
    seasonalNote: 'Musim pernikahan umumnya meningkat pasca Lebaran hingga pertengahan tahun.',
  },
  {
    month: 6,
    monthName: 'Juni',
    theme: 'Puncak musim pernikahan + awal musim umrah liburan sekolah',
    primaryCluster: 'wedding',
    weeklyFocus: ['Thobe resepsi', 'Couple muslim outfit', 'Thobe premium pernikahan', 'Persiapan umrah liburan sekolah'],
  },
  {
    month: 7,
    monthName: 'Juli',
    theme: 'Puncak musim umrah (liburan sekolah)',
    primaryCluster: 'umrah',
    weeklyFocus: ['Bahan terbaik untuk umrah', 'Panduan packing', 'Jumlah thobe ideal', 'Perawatan selama perjalanan'],
  },
  {
    month: 8,
    monthName: 'Agustus',
    theme: 'Edukasi tailoring — di luar musim puncak',
    primaryCluster: 'tailoring',
    weeklyFocus: ['Apa itu bespoke', 'Bespoke vs made-to-measure', 'Proses pattern drafting', 'Quality control'],
  },
  {
    month: 9,
    monthName: 'September',
    theme: 'Musim pernikahan kedua',
    primaryCluster: 'wedding',
    weeklyFocus: ['Family outfit', 'Panduan warna berdasarkan tema', 'Thobe premium', 'Konsultasi timeline'],
  },
  {
    month: 10,
    monthName: 'Oktober',
    theme: 'Musim haji (cek kalender Hijriah tahun berjalan) + perawatan',
    primaryCluster: 'umrah',
    weeklyFocus: ['Panduan iklim Mekkah-Madinah', 'Custom thobe untuk ibadah', 'Perawatan bahan premium', 'Cara menyimpan garmen'],
    seasonalNote: 'Musim haji bergeser mengikuti kalender Hijriah — verifikasi tanggal aktual tahun berjalan sebelum menjadwalkan konten spesifik.',
  },
  {
    month: 11,
    monthName: 'November',
    theme: 'Perawatan menjelang musim hujan',
    primaryCluster: 'care',
    weeklyFocus: ['Cara mencuci linen', 'Menghilangkan kerutan', 'Menyimpan garmen premium', 'Dry clean vs cuci tangan'],
  },
  {
    month: 12,
    monthName: 'Desember',
    theme: 'Akhir tahun — evaluasi wardrobe dan local authority',
    primaryCluster: 'bogor',
    weeklyFocus: ['Layanan bespoke tailor Bogor', 'Proses konsultasi dan fitting', 'Evaluasi Digital Body Profile tahunan', 'Rencana konten tahun depan'],
  },
]

export function getMonthlyPlan(month: number): MonthlyPlan | undefined {
  return EDITORIAL_CALENDAR.find((entry) => entry.month === month)
}
