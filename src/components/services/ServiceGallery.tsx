import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { GalleryImagePlaceholder } from '@/components/marketing/placeholders/GalleryImagePlaceholder'
import type { ServiceConfig } from '@/lib/seo/serviceConfig'

interface ServiceGalleryProps {
  service: ServiceConfig
}

// Sprint W10 — "Portfolio gallery" section, same honest-placeholder
// pattern as CityGallery.tsx: no keyword-tagged photo metadata exists in
// the real gallery data source (getGalleryPieces() only distinguishes
// model_thobe/look_cutting, no per-theme tags), so this doesn't pretend to
// show "wedding-only" or "umrah-only" photos — it links to the real,
// already-live /gallery page instead of fabricating a filtered view.
const PLACEHOLDER_COUNT = 6

export function ServiceGallery({ service }: ServiceGalleryProps) {
  return (
    <section aria-labelledby="service-gallery-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Portofolio</p>
          <h2 id="service-gallery-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            Hasil Kerja Kami
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">
            Lihat koleksi lengkap hasil kerja kami di{' '}
            <a href="/gallery" className="text-luxury-gold underline underline-offset-4">
              Gallery
            </a>
            .
          </p>
        </Reveal>

        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
            <li key={i}>
              <GalleryImagePlaceholder
                alt={`Placeholder galeri karya ${service.garmentLabel}`}
                variant={(['a', 'b', 'c'] as const)[i % 3]}
                idSuffix={`service-gallery-${service.slug}-${i}`}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
