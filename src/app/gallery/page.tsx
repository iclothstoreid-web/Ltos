import type { Metadata } from 'next'
import Image from 'next/image'
import { createPublicClient } from '@/lib/supabase/public'
import { getGalleryPieces } from '@/lib/gallery/galleryRepository'
import { buildSimplePageMetadata } from '@/lib/marketing/seo'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { MaterialHero } from '@/components/fabric/MaterialHero'

export const metadata: Metadata = buildSimplePageMetadata({
  title: 'Gallery',
  description: 'A curated collection of finished bespoke thobe from Local Tailor.',
  path: '/gallery',
})

// Without searchParams/cookies/headers, Next would statically freeze this
// page's RPC result at build time — a newly-activated master data option
// would never appear until the next deploy. Same revalidate window as
// sitemap.ts uses for the same reason.
export const revalidate = 3600

// Sprint W3R — restores a real, Supabase-backed Gallery in place of the
// W4.5 placeholder. See src/lib/gallery/galleryRepository.ts for exactly
// which existing table/RPC this reuses. Layout mirrors /fabric's own
// MaterialHero-then-grid shape (the established listing-page pattern on
// this site) rather than inventing a new one — no new design, no new
// filter/sort feature, just real data in the existing visual language.
export default async function GalleryPage() {
  const supabase = createPublicClient()
  const pieces = await getGalleryPieces(supabase)

  return (
    <main className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <MaterialHero
          eyebrow="Gallery"
          title="A Record of Craft"
          description="A collection of finished bespoke pieces, from Local Tailor's own model and cutting catalog."
        />

        {pieces.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="font-luxury-sans text-sm text-luxury-taupe">
              The gallery is empty right now — check back soon, or see what&rsquo;s possible for your own thobe in
              Design Studio.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MagneticButton href="/design-studio" variant="primary">
                Explore Design Studio
              </MagneticButton>
              <MagneticButton href="/" variant="ghost">
                Back to Home
              </MagneticButton>
            </div>
          </div>
        ) : (
          <>
            <ul className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
              {pieces.map((piece) => (
                <li key={piece.id} className="break-inside-avoid">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm">
                    <Image
                      src={piece.photoUrl}
                      alt={`${piece.name}, bespoke thobe photography`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe">
                    {piece.name}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MagneticButton href="/design-studio" variant="primary">
                Design Your Own
              </MagneticButton>
              <MagneticButton href="/" variant="ghost">
                Back to Home
              </MagneticButton>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
