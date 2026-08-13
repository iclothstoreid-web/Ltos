import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { GalleryImagePlaceholder } from '@/components/marketing/placeholders/GalleryImagePlaceholder'
import type { CityConfig } from '@/lib/seo/cityConfig'

interface CityGalleryProps {
  city: CityConfig
}

// Sprint W8-2/3 — "Customer Gallery (placeholder structure)", explicitly
// requested as a structural placeholder, not real photography — no
// per-city customer photos exist (same "not publishable" reasoning
// src/lib/marketing/assets.ts already documents for consultation/
// production photos). Reuses the existing GalleryImagePlaceholder
// primitive (already used by the real /gallery page's empty-state and the
// homepage's Gallery.tsx) rather than inventing a new placeholder pattern.
// The real /gallery page is linked so a visitor sees real finished
// garments, not just the abstract placeholder tiles.
const PLACEHOLDER_COUNT = 6

export function CityGallery({ city }: CityGalleryProps) {
  return (
    <section aria-labelledby="city-gallery-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Galeri</p>
          <h2 id="city-gallery-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            Karya untuk Klien di {city.city}
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">
            Galeri khusus {city.city} sedang dikembangkan — lihat koleksi lengkap hasil kerja kami di{' '}
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
                alt={`Placeholder galeri karya untuk klien ${city.city}`}
                variant={(['a', 'b', 'c'] as const)[i % 3]}
                idSuffix={`city-gallery-${city.slug}-${i}`}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
