import type { Metadata } from 'next'
import { buildSimplePageMetadata } from '@/lib/marketing/seo'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { LuxuryGradientField } from '@/components/marketing/placeholders/LuxuryGradientField'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { WalnutGrainOverlay } from '@/components/marketing/shell/WalnutGrainOverlay'

export const metadata: Metadata = buildSimplePageMetadata({
  title: 'Journal',
  description: 'Stories on fabric, fit, and the craft behind every bespoke thobe from Local Tailor — coming soon.',
  path: '/journal',
})

const BREADCRUMB_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Journal', path: '/journal' },
]

// Sprint W4.5 — elegant placeholder. The CTA below is a genuine link, not
// a dead end: the W0.5 sizing guides (/cek-ukuran-thobe et al.) already
// exist and are exactly "journal"-style content, so this page routes
// visitors to real, live articles rather than nothing.
export default function JournalPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-luxury-navy-deep px-6 py-20 text-center">
      <JsonLd data={breadcrumbSchema(BREADCRUMB_ITEMS)} />
      <LuxuryGradientField variant="c" />

      <div className="relative mx-auto max-w-xl">
        <Breadcrumbs items={BREADCRUMB_ITEMS} />
        <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">Journal</p>
        <h1 className="mt-6 font-fraunces text-4xl leading-[1.1] text-luxury-ivory sm:text-5xl">
          The Journal Is Coming Soon
        </h1>
        <p className="mx-auto mt-6 max-w-md font-luxury-sans text-base text-luxury-taupe md:text-lg">
          Stories on fabric, fit, and the craft behind every bespoke thobe are on their way. For practical sizing
          guidance today, explore our measurement guides.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton href="/cek-ukuran-thobe" variant="primary">
            Read Sizing Guides
          </MagneticButton>
          <MagneticButton href="/" variant="ghost">
            Back to Home
          </MagneticButton>
        </div>
      </div>
      <WalnutGrainOverlay />
    </main>
  )
}
