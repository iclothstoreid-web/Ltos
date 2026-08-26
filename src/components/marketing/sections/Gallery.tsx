'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { galleryCopy } from '@/lib/marketing/copy'
import { Reveal } from '../shell/Reveal'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { GalleryImagePlaceholder } from '../placeholders/GalleryImagePlaceholder'

export function Gallery() {
  const t = useTranslations('home.gallery')
  const filterLabels = t.raw('filterLabels') as Record<string, string>
  const [activeFilter, setActiveFilter] = useState<(typeof galleryCopy.filters)[number]>('All')

  const filtered = useMemo(
    () => (activeFilter === 'All' ? galleryCopy.items : galleryCopy.items.filter((item) => item.category === activeFilter)),
    [activeFilter],
  )

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-xl">
          <GoldAccentLine className="mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{t('eyebrow')}</p>
          <h2 id="gallery-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {t('heading')}
          </h2>
        </Reveal>

        <div role="group" aria-label="Filter gallery by category" className="mt-8 flex flex-wrap gap-2">
          {/* Walnut Atelier rebrand — bg-luxury-black/70 (Deep Espresso) added:
              gold/taupe text directly on the section's own luxury-navy-deep
              (Warm Walnut) had only 2.2:1 / 2.7:1 contrast, caught by
              Lighthouse. A Deep Espresso chip fill (this system's own
              shadow/depth color) restores 5.3:1+ without changing the text
              colors the brief specifies. */}
          {galleryCopy.filters.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              className={`cursor-pointer rounded-full border bg-luxury-black/70 px-4 py-2 font-luxury-sans text-xs uppercase tracking-[0.1em] transition ${
                activeFilter === filter
                  ? 'border-luxury-gold text-luxury-gold'
                  : 'border-luxury-gold/[0.14] text-luxury-taupe hover:border-luxury-gold/30'
              }`}
            >
              {filterLabels[filter.toLowerCase()] ?? filter}
            </button>
          ))}
        </div>

        <motion.ul layout className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
          {filtered.map((item, i) => (
            <motion.li layout key={`${item.category}-${i}`} className="break-inside-avoid">
              {item.photo ? (
                <div className={`relative w-full overflow-hidden rounded-sm ${item.tall ? 'aspect-[3/4]' : 'aspect-square'}`}>
                  <Image
                    src={item.photo}
                    alt={`${item.category} bespoke thobe, editorial studio photography`}
                    fill
                    sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <GalleryImagePlaceholder
                  alt={`${item.category} bespoke thobe, gallery piece`}
                  tall={item.tall}
                  variant={item.variant}
                  idSuffix={i}
                />
              )}
              {/* text-luxury-ivory, not the usual -taupe caption tier: this
                  sits directly on the section's own luxury-navy-deep (Warm
                  Walnut), where taupe only reaches 2.7:1 contrast. */}
              <p className="mt-2 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-ivory">
                {filterLabels[item.category.toLowerCase()] ?? item.category}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
