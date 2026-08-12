import type { Metadata } from 'next'
import { buildSimplePageMetadata } from '@/lib/marketing/seo'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { LuxuryGradientField } from '@/components/marketing/placeholders/LuxuryGradientField'

export const metadata: Metadata = buildSimplePageMetadata({
  title: 'Gallery',
  description: 'A curated collection of finished bespoke thobe from Local Tailor — coming soon.',
  path: '/gallery',
})

// Sprint W4.5 — elegant placeholder, not a redesign or a new gallery
// system. Reuses the same placeholder primitive (LuxuryGradientField) and
// button (MagneticButton) already established by the W1 homepage, so this
// reads as the same site, not a bolted-on page. Exists purely so the
// "Gallery" nav/footer link (previously an anchor to a homepage section
// with zero outbound links of its own) goes somewhere real.
export default function GalleryPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-luxury-navy-deep px-6 py-20 text-center">
      <LuxuryGradientField variant="a" />

      <div className="relative mx-auto max-w-xl">
        <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">Gallery</p>
        <h1 className="mt-6 font-fraunces text-4xl leading-[1.1] text-luxury-ivory sm:text-5xl">
          Our Gallery Is Being Curated
        </h1>
        <p className="mx-auto mt-6 max-w-md font-luxury-sans text-base text-luxury-taupe md:text-lg">
          A collection of finished bespoke pieces is coming soon. In the meantime, see what&rsquo;s possible for your
          own thobe in our Design Studio.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton href="/design-studio" variant="primary">
            Explore Design Studio
          </MagneticButton>
          <MagneticButton href="/" variant="ghost">
            Back to Home
          </MagneticButton>
        </div>
      </div>
    </div>
  )
}
