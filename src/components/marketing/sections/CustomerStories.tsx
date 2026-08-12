import { storiesCopy } from '@/lib/marketing/copy'
import { Reveal } from '../shell/Reveal'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { TestimonialPhotoPlaceholder } from '../placeholders/TestimonialPhotoPlaceholder'

const VARIANTS = ['a', 'b', 'c'] as const

export function CustomerStories() {
  return (
    <section
      id="stories"
      aria-labelledby="stories-heading"
      className="bg-luxury-navy px-6 py-24 md:px-10 [content-visibility:auto] [contain-intrinsic-size:auto_600px]"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{storiesCopy.eyebrow}</p>
          <h2 id="stories-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {storiesCopy.heading}
          </h2>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {storiesCopy.stories.map((story, i) => (
            <Reveal as="li" key={story.name} delay={i * 0.1} className="rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-8">
              <p className="font-fraunces text-lg italic text-luxury-ivory/90">&ldquo;{story.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-4">
                <TestimonialPhotoPlaceholder alt={`${story.name} portrait`} variant={VARIANTS[i % VARIANTS.length]} />
                <div>
                  <p className="font-luxury-sans text-sm text-luxury-ivory">{story.name}</p>
                  <p className="font-luxury-sans text-xs text-luxury-taupe">
                    {story.city} · {story.fabric} · {story.purpose}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
