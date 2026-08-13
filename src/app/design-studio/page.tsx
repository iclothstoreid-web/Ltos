import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { getConfiguratorCatalog, findOptionByMaterialId, findOptionByDnaColorId } from '@/lib/configurator/mapping'
import { getMaterialBySlug, getMaterialColors } from '@/lib/materials/materialRepository'
import { DesignStudioClient } from '@/components/configurator/DesignStudioClient'
import { Nav } from '@/components/marketing/shell/Nav'
import { Footer } from '@/components/marketing/shell/Footer'
import { DigitalBespokeHero } from '@/components/design-studio/DigitalBespokeHero'
import { WhatIsDesignStudio } from '@/components/design-studio/WhatIsDesignStudio'
import { ExperienceCards } from '@/components/design-studio/ExperienceCards'
import { ProcessTimeline, type ProcessTimelineStep } from '@/components/design-studio/ProcessTimeline'
import { ProblemSolutionTable, type ProblemSolutionRow } from '@/components/design-studio/ProblemSolutionTable'
import { BookingCTA } from '@/components/design-studio/BookingCTA'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { FaqSection } from '@/components/seo/FaqSection'
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  serviceSchema,
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  type FaqSchemaItem,
} from '@/lib/seo/schema'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { garmentPhotos } from '@/lib/marketing/assets'
import { DIGITAL_BESPOKE_EXPERIENCES } from '@/lib/design-studio/experienceCopy'

// Sprint Y §Y-4 — metadata copy verbatim from the brief. Hand-built rather
// than buildSimplePageMetadata (which appends "| Bespoke Tailor", not the
// brief's exact "| Local Tailor" suffix) so the title matches the brief
// literally.
const PAGE_TITLE = 'Design Studio — Bespoke Tailoring Tanpa Batas Jarak | Local Tailor'
const PAGE_DESCRIPTION =
  'Rancang thobe Anda dari mana saja melalui video call fitting, Design Studio online, dan layanan home visit. Pengalaman bespoke tanpa harus datang ke Bandung.'
const PAGE_URL = `${FABRIC_SITE_ORIGIN}/design-studio`

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: 'Local Tailor',
    type: 'website',
    images: [{ url: garmentPhotos.navy, width: 1200, height: 1500, alt: 'Bespoke thobe navy, presented on a mannequin, editorial studio photography' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [garmentPhotos.navy],
  },
}

interface PageProps {
  searchParams: { fabric?: string; color?: string }
}

// Sprint W3-4 §7-8 — Design Studio Deep Link / Preselection. Unchanged by
// this sprint — resolves Fabric Explorer's ?fabric=&color= into the
// configurator's own option ids. See prior sprint comments for the full
// reasoning; this function's behavior is untouched.
async function resolveInitialSelection(fabricSlug?: string, colorSlug?: string) {
  if (!fabricSlug) return { initialFabricId: null, initialColorId: null }

  const supabase = createPublicClient()
  const [catalog, material] = await Promise.all([
    getConfiguratorCatalog(supabase),
    getMaterialBySlug(supabase, fabricSlug),
  ])

  if (!material) return { initialFabricId: null, initialColorId: null }

  const fabricOption = findOptionByMaterialId(catalog.fields.fabricId, material.id)
  if (!fabricOption) return { initialFabricId: null, initialColorId: null }

  if (!colorSlug) return { initialFabricId: fabricOption.id, initialColorId: null }

  const materialColors = await getMaterialColors(supabase, material.id)
  const dnaColorId = materialColors.find((c) => c.slug === colorSlug)?.dna_color_id ?? null
  const colorOption = findOptionByDnaColorId(catalog.fields.colorId, dnaColorId)

  return { initialFabricId: fabricOption.id, initialColorId: colorOption?.id ?? null }
}

const BREADCRUMB_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Design Studio', path: '/design-studio' },
]

const JOURNEY_STEPS: ProcessTimelineStep[] = [
  { title: 'Book Session', description: 'Jadwalkan Free Video Call via WhatsApp.' },
  { title: 'Video Call', description: 'Konsultasi kebutuhan dan panduan awal desain.' },
  { title: 'Design Studio', description: 'Tentukan kombinasi Model, Kerah, Manset, Material, dan Warna.' },
  { title: 'Approve Design', description: 'Setujui desain final sebelum produksi dimulai.' },
  { title: 'Production', description: 'Pola dibentuk dan diproduksi di workshop Bandung.' },
  { title: 'Delivery', description: 'Thobe dikirim ke alamat Anda di mana pun berada.' },
]

const COMPARISON_ROWS: ProblemSolutionRow[] = [
  { problem: 'Jauh dari Bandung', solution: 'Konsultasi dan desain via video call, produksi tetap presisi di workshop kami' },
  { problem: 'Tidak sempat datang', solution: 'Book Free Video Call kapan saja sesuai jadwal Anda' },
  { problem: 'Ingin konsultasi langsung', solution: 'Home visit membawa fabric book, sample, dan alat ukur ke lokasi Anda' },
  { problem: 'Ingin pengalaman premium', solution: 'Home visit personal untuk wedding, keluarga, corporate, dan VIP' },
  { problem: 'Beda kota / negara', solution: 'Produksi tetap di Bandung, dikirim ke seluruh Indonesia dan luar negeri' },
]

// Sprint Y §Y-1 — landing page FAQ (distinct from, but consistent with, the
// Digital Bespoke Tailoring Knowledge cluster's own per-article FAQs).
const PAGE_FAQ: FaqSchemaItem[] = [
  {
    question: 'Apakah saya bisa memesan thobe custom tanpa datang ke Bandung?',
    answer:
      'Ya. Konsultasi, pemilihan desain, dan panduan pengukuran bisa dilakukan sepenuhnya lewat video call fitting gratis dan Design Studio — pengukuran final dikonfirmasi lewat home visit atau kunjungan ke workshop.',
  },
  {
    question: 'Apakah Video Call Fitting benar-benar gratis?',
    answer: 'Ya, sesi video call fitting tidak dikenakan biaya. Anda hanya membayar untuk garmen bespoke yang benar-benar dipesan.',
  },
  {
    question: 'Bagaimana cara kerja Home Visit?',
    answer: 'Tim kami datang ke lokasi Anda membawa fabric book, sample komponen, tablet Design Studio, dan alat ukur — cocok untuk keluarga, pasangan, wedding, corporate, dan VIP.',
  },
  {
    question: 'Apakah saya tetap bisa datang langsung ke showroom?',
    answer: 'Tentu. Showroom Experience tetap terbuka bagi Anda yang ingin konsultasi dan pengukuran tatap muka di workshop kami di Buah Batu, Bandung.',
  },
  {
    question: 'Apakah hasil pengukuran jarak jauh akurat?',
    answer: 'Video call memberi panduan dan estimasi awal yang akurat untuk desain, namun pengukuran yang dipakai untuk produksi tetap dikonfirmasi langsung oleh fitter — via home visit maupun kunjungan ke workshop.',
  },
  {
    question: 'Apakah bisa memesan untuk kebutuhan wedding atau corporate dalam jumlah banyak?',
    answer: 'Bisa. Home visit khususnya dirancang untuk kebutuhan wedding, keluarga besar, dan corporate yang memesan beberapa garmen sekaligus.',
  },
  {
    question: 'Berapa lama proses dari konsultasi hingga thobe selesai?',
    answer: 'Umumnya 2-3 minggu dari konsultasi hingga selesai, tergantung kompleksitas desain dan bahan yang dipilih.',
  },
  {
    question: 'Apakah pengiriman menjangkau luar negeri?',
    answer: 'Ya, garmen yang sudah selesai diproduksi dapat dikirim ke alamat Anda di luar negeri sesuai kesepakatan saat konsultasi.',
  },
]

// Sprint W2-1 foundation, rebuilt as the Digital Bespoke Tailoring pillar
// page in Sprint Y — public configurator, distinct from the internal
// Fitter-facing Design Studio at /workspace/design-studio (untouched).
// Sprint Y merges the new marketing pillar content (Hero through Booking
// CTA) with the existing live configurator tool ON THE SAME PAGE, per
// explicit decision with the user: the configurator itself
// (DesignStudioClient, ConfiguratorPanel, the Zustand store, estimate/save
// flow) is completely untouched, just rendered further down the same page
// inside its own <section id="the-studio">. "Explore Design Studio"
// scrolls to it instead of navigating away.
export default async function DesignStudioPage({ searchParams }: PageProps) {
  const { initialFabricId, initialColorId } = await resolveInitialSelection(searchParams.fabric, searchParams.color)

  const service = serviceSchema({
    name: 'Digital Bespoke Tailoring',
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    serviceType: 'Digital Bespoke Tailoring',
  })
  const journey = howToSchema({
    name: 'Customer Journey Digital Bespoke Tailoring',
    description: 'Alur pemesanan Digital Bespoke Tailoring dari booking sesi hingga garmen diterima.',
    steps: JOURNEY_STEPS.map((step) => ({ name: step.title, text: step.description ?? step.title })),
  })

  return (
    <div className="bg-luxury-navy-deep">
      <JsonLd
        data={[
          service,
          faqSchema(PAGE_FAQ),
          breadcrumbSchema(BREADCRUMB_ITEMS),
          organizationSchema(),
          localBusinessSchema(),
          websiteSchema(),
          journey,
        ]}
      />
      <Nav />
      <main>
        <article>
          <DigitalBespokeHero />
          <div className="mx-auto max-w-6xl px-6 pt-10 md:px-10">
            <Breadcrumbs items={BREADCRUMB_ITEMS} />
          </div>
          <WhatIsDesignStudio />
          <ExperienceCards
            heading="Tiga Cara Menggunakan Design Studio"
            subheadline="Pilih cara yang paling sesuai dengan lokasi dan kebutuhan Anda."
            items={DIGITAL_BESPOKE_EXPERIENCES}
          />
          <ProcessTimeline
            heading="Customer Journey"
            subheadline="Dari booking sesi pertama hingga thobe Anda diterima."
            steps={JOURNEY_STEPS}
          />
          <ProblemSolutionTable heading="Keunggulan Digital Bespoke Tailoring" rows={COMPARISON_ROWS} />
          <FaqSection items={PAGE_FAQ} headingId="design-studio-faq-heading" heading="Pertanyaan Umum — Design Studio" />
          <BookingCTA
            heading="Siap Memulai Digital Bespoke Tailoring Anda?"
            body="Book Free Video Call untuk konsultasi, atau langsung jelajahi kombinasi desain di Design Studio."
            whatsappMessage="Halo Local Tailor, saya ingin booking Free Video Call untuk konsultasi Digital Bespoke Tailoring."
          />
        </article>

        <section id="the-studio" aria-labelledby="the-studio-heading" className="border-t border-luxury-gold/[0.14]">
          <h2 id="the-studio-heading" className="sr-only">
            Design Studio — Konfigurator Desain
          </h2>
          <DesignStudioClient initialFabricId={initialFabricId} initialColorId={initialColorId} />
        </section>
      </main>
      <Footer />
    </div>
  )
}
