import Image from 'next/image'
import { gallerySectionCopy } from '@/lib/marketing/copy'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'

// Sprint W5-7 — Gallery Architecture. Categorized editorial gallery — 4
// category blocks, each its own <article> with a heading, description, and
// a responsive <figure>/<figcaption> grid, rather than one flat masonry
// grid (that's the existing Gallery.tsx section further down the page).
// id is "gallery-showcase" (not "gallery" — already taken). Every image and
// CTA links to the real, already-live /gallery page, not a "#" placeholder
// — this section's own markup (heading hierarchy, figure/figcaption,
// descriptive alt text) is deliberately close to what a future standalone
// /gallery rebuild could lift directly, per the brief's "easy to extend"
// requirement, without building that page now.
export function GallerySection() {
  return (
    <section id="gallery-showcase" aria-labelledby="gallery-showcase-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{gallerySectionCopy.eyebrow}</p>
          <h2 id="gallery-showcase-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {gallerySectionCopy.heading}
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{gallerySectionCopy.subheadline}</p>
        </Reveal>

        <div className="mt-16 flex flex-col gap-16">
          {gallerySectionCopy.categories.map((category, ci) => {
            const headingId = `gallery-category-${ci}-heading`
            return (
              <Reveal key={category.title} delay={ci * 0.06}>
                <article aria-labelledby={headingId}>
                  <h3 id={headingId} className="font-fraunces text-xl text-luxury-ivory md:text-2xl">
                    {category.title}
                  </h3>
                  <p className="mt-2 max-w-xl font-luxury-sans text-sm text-luxury-taupe">{category.description}</p>

                  <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {category.images.map((image) => (
                      <li key={image.src}>
                        <figure>
                          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
                            <Image
                              src={image.src}
                              alt={image.alt}
                              fill
                              sizes="(min-width: 1024px) 384px, (min-width: 640px) 33vw, 50vw"
                              className="object-cover"
                            />
                            <div aria-hidden="true" className="absolute inset-0 ring-1 ring-inset ring-luxury-gold/10" />
                          </div>
                          <figcaption className="mt-2 font-luxury-sans text-xs uppercase tracking-[0.08em] text-luxury-taupe">
                            {image.caption}
                          </figcaption>
                        </figure>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/gallery"
                    className="mt-5 inline-flex items-center gap-2 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold transition hover:text-luxury-ivory"
                  >
                    {category.viewMoreLabel}
                    <span aria-hidden="true">→</span>
                  </a>
                </article>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.2} className="mt-16 text-center">
          <blockquote className="mx-auto max-w-xl border-l-2 border-luxury-gold/40 pl-5 text-left">
            <p className="font-fraunces text-lg italic leading-snug text-luxury-ivory md:text-xl">
              &ldquo;{gallerySectionCopy.authenticityStatement}&rdquo;
            </p>
          </blockquote>

          <MagneticButton href="/gallery" variant="primary" className="mt-10">
            {gallerySectionCopy.cta}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
