import type { ExperienceCardItem } from '@/components/design-studio/ExperienceCards'

// Sprint Y — shared source for the "Tiga Cara Menggunakan Design Studio"
// content, so /design-studio and the homepage preview section render the
// exact same 3 cards rather than two copies that could drift apart.
export const DIGITAL_BESPOKE_EXPERIENCES: ExperienceCardItem[] = [
  {
    eyebrow: 'Gratis',
    title: 'Video Call Fitting',
    description: 'Konsultasi, desain, dan panduan pengukuran — sepenuhnya dari jarak jauh.',
    details: [
      'Konsultasi kebutuhan',
      'Pemilihan desain di Design Studio',
      'Panduan pengukuran',
      'Pengecekan ukuran',
      'Finalisasi desain',
    ],
    audience: ['Luar kota', 'Luar pulau', 'Luar negeri', 'Pelanggan sibuk'],
  },
  {
    title: 'Home Visit',
    description: 'Tim kami datang ke lokasi Anda dengan perlengkapan lengkap untuk sesi tatap muka yang personal.',
    details: ['Fabric book', 'Sample komponen', 'Tablet Design Studio', 'Alat ukur'],
    audience: ['Keluarga', 'Pasangan', 'Wedding', 'Corporate', 'VIP'],
  },
  {
    title: 'Showroom Experience',
    description: 'Opsi datang langsung ke showroom kami di Bogor, untuk konsultasi dan pengukuran tatap muka.',
    details: ['Konsultasi langsung di workshop', 'Melihat dan menyentuh koleksi bahan secara langsung', 'Pengukuran langsung oleh fitter'],
  },
]
