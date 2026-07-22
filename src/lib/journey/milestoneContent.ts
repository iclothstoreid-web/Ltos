import { JOURNEY_MILESTONES } from './milestone'

// Static copy + asset paths for each milestone's body content. Kept here
// rather than inline in the page/components so the presentational
// components (MilestoneHero, PhotoGridSection, QuoteSection,
// AssuranceChecklistSection) stay pure/reusable and each milestone's own
// content is easy to find and update in one place.
//
// Image assets are not yet supplied — JourneyPhoto falls back to a brand
// placeholder until the file exists at the given path.

export const MILESTONE_2_CONTENT = {
  hero: {
    imageSrc: '/images/journey/milestone-2-hero.jpg',
    imageAlt: 'Artisan memotong dan menjahit kain di atelier',
    title: 'Pakaian Anda Sedang Dibuat',
    subtitle: 'Setiap potongan dan jahitan dikerjakan dengan tangan, oleh artisan kami.',
  },
  gallery: {
    title: 'Craftsmanship',
    photos: [
      { src: '/images/journey/craft-jahitan.jpg', alt: 'Detail jahitan tangan' },
      { src: '/images/journey/craft-tekstur-kain.jpg', alt: 'Detail tekstur kain' },
      { src: '/images/journey/craft-kerah.jpg', alt: 'Detail kerah' },
      { src: '/images/journey/craft-manset.jpg', alt: 'Detail manset' },
    ],
  },
  editorial: {
    label: 'Tentang Proses Kami',
    message:
      'Setiap pakaian dibuat satu per satu oleh artisan kami. Kami percaya kualitas lahir dari ' +
      'perhatian terhadap setiap detail.',
  },
}

export const MILESTONE_3_CONTENT = {
  hero: {
    eyebrow: 'Milestone 3',
    imageSrc: '/images/journey/milestone-3-hero.jpg',
    imageAlt: 'Artisan memeriksa detail jahitan dan kerapihan pakaian',
    title: 'Setiap Detail, Diperiksa dengan Teliti',
    subtitle: 'Sebelum melanjutkan, pakaian Anda melalui pemeriksaan kualitas oleh artisan kami.',
  },
  editorial: {
    label: 'Komitmen Kami',
    message:
      'Kualitas bukan tahap terakhir, melainkan perhatian yang kami jaga di setiap tahap. Kami ' +
      'percaya pakaian yang baik lahir dari ketelitian, bukan kecepatan.',
  },
  checklist: {
    title: 'Yang Kami Pastikan',
    items: ['Ukuran', 'Jahitan', 'Kerapihan', 'Finishing'],
  },
  gallery: {
    title: 'Galeri Detail',
    photos: [
      { src: '/images/journey/qc-jahitan.jpg', alt: 'Detail jahitan' },
      { src: '/images/journey/qc-kerah.jpg', alt: 'Detail kerah' },
      { src: '/images/journey/qc-manset.jpg', alt: 'Detail manset' },
      { src: '/images/journey/qc-kain.jpg', alt: 'Detail kain' },
    ],
  },
  closing: {
    message:
      'Sebelum pakaian melanjutkan ke tahap berikutnya, setiap detail diperiksa dengan teliti ' +
      'agar memenuhi standar kualitas Local Tailor.',
  },
}

export const MILESTONE_4_CONTENT = {
  hero: {
    eyebrow: 'Milestone 4',
    imageSrc: '/images/journey/milestone-4-hero.jpg',
    imageAlt: 'Pakaian yang telah selesai dibuat, siap untuk dikemas',
    title: 'Pakaian Anda Telah Selesai Dibuat',
    subtitle:
      'Sentuhan akhir telah diberikan dengan penuh perhatian. Kini pakaian Anda siap untuk ' +
      'perjalanan terakhir menuju Anda.',
  },
  gallery: {
    title: 'Galeri Hasil Akhir',
    photos: [
      { src: '/images/journey/finishing-keseluruhan.jpg', alt: 'Tampilan keseluruhan pakaian' },
      { src: '/images/journey/finishing-kerah.jpg', alt: 'Detail kerah' },
      { src: '/images/journey/finishing-manset.jpg', alt: 'Detail manset' },
      { src: '/images/journey/finishing-kain.jpg', alt: 'Detail kain' },
      { src: '/images/journey/finishing-jahitan.jpg', alt: 'Detail jahitan' },
    ],
  },
  video: {
    title: 'Video Finishing',
    videoSrc: null as string | null,
    posterSrc: '/images/journey/milestone-4-video-poster.jpg',
    caption: 'Momen sentuhan akhir pakaian Anda.',
  },
  share: {
    heading: 'Bagikan Momen Ini',
    message:
      'Momen ini layak untuk dibagikan. Bagikan kebahagiaan saat pakaian Anda selesai dibuat ' +
      'kepada keluarga atau teman.',
  },
  artisan: {
    photoSrc: '/images/journey/artisan-finishing.jpg',
    photoAlt: 'Foto artisan finishing',
    name: 'Pak Herman',
    role: 'Artisan Finishing',
    bio:
      'Menangani sentuhan akhir setiap pakaian selama lebih dari satu dekade, memastikan setiap ' +
      'jahitan dan detail siap sebelum diserahkan kepada pelanggan.',
    stats: [
      { label: 'Pengalaman', value: '12 Tahun' },
      { label: 'Garment Diselesaikan', value: '3.400+' },
      { label: 'Rating', value: '4.9 / 5' },
    ],
  },
  editorial: {
    label: 'Pesan Artisan',
    message:
      'Bagi kami, tahap finishing adalah tempat setiap detail bertemu kesempurnaan. Kami ' +
      'memastikan pakaian Anda tidak hanya selesai, tetapi benar-benar siap untuk momen penting Anda.',
  },
  closing: {
    message:
      'Pakaian Anda telah melalui setiap tahap dengan penuh perhatian. Kini, saatnya bersiap ' +
      'untuk perjalanan terakhir — menuju Anda.',
  },
}

// Milestone 5 has two sub-states rendered on the same page (see
// resolveDeliveryState in milestone.ts) — 'shipping' while the order is in
// transit, 'delivered' once it has arrived. No new route, no new milestone.
export const MILESTONE_5_CONTENT = {
  shipping: {
    hero: {
      imageSrc: '/images/journey/milestone-5-shipping-hero.jpg',
      imageAlt: 'Paket pakaian yang telah dikemas rapi, siap untuk dikirim',
      title: 'Pakaian Anda Sedang Dalam Perjalanan',
      subtitle: 'Pakaian Anda telah meninggalkan atelier kami dan sedang menuju alamat Anda.',
    },
    // courier/trackingNumber/trackingUrl are intentionally absent here — the
    // journey page always supplies those from the real Shipping stage data
    // (see get_customer_journey_snapshot), never static copy.
    shippingInfo: {
      statusLabel: 'Dalam perjalanan menuju Anda',
      estimatedArrival: 'Akan diinformasikan segera',
      ctaLabel: 'Lacak Pengiriman',
    },
  },
  delivered: {
    hero: {
      imageSrc: '/images/journey/milestone-5-delivered-hero.jpg',
      imageAlt: 'Pakaian yang telah sampai di tangan pelanggan',
      title: 'Pesanan Anda Telah Tiba',
      subtitle:
        'Terima kasih telah mempercayakan Local Tailor. Semoga pakaian yang kami buat menjadi ' +
        'bagian dari banyak momen terbaik Anda.',
    },
    closing: {
      message:
        'Setiap jahitan dalam pakaian ini dibuat dengan perhatian penuh, dari konsultasi pertama ' +
        'hingga tiba di tangan Anda. Terima kasih telah menjadi bagian dari perjalanan ini.',
    },
    share: {
      heading: 'Bagikan Journey Anda',
      message:
        'Apabila Anda menikmati pengalaman bersama Local Tailor, kami akan sangat senang apabila ' +
        'Anda membagikan perjalanan ini kepada keluarga atau teman.',
    },
    journeyComplete: {
      title: 'Journey Complete',
      items: JOURNEY_MILESTONES.map(m => m.label),
    },
  },
}
