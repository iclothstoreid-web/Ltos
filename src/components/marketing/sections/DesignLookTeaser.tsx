import { createPublicClient } from '@/lib/supabase/public'
import { fetchActiveDesignLooks } from '@/lib/design/designLooks'
import { configuratorThumb, configuratorThumbSrcSet } from '@/lib/configurator/thumb'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'

// Homepage — "Design Your Thobe" teaser. Shows up to 4 `featured` Design
// Looks as a photo strip that links into /design-studio. Server component,
// self-fetching, fully wrapped: a Content/DB hiccup (or simply no featured
// Looks yet) renders nothing rather than taking the homepage down.
export async function DesignLookTeaser() {
  let looks: Awaited<ReturnType<typeof fetchActiveDesignLooks>> = []
  try {
    looks = (await fetchActiveDesignLooks(createPublicClient())).filter((l) => l.featured).slice(0, 4)
  } catch {
    return null
  }
  if (looks.length === 0) return null

  return (
    <section
      id="design-your-thobe"
      aria-labelledby="design-your-thobe-heading"
      className="bg-luxury-navy-deep px-6 py-24 md:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Design Studio</p>
          <h2
            id="design-your-thobe-heading"
            className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl"
          >
            Rancang Thobe Anda
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">
            Mulai dari desain yang sudah kami kurasi, lalu sesuaikan setiap detailnya.
          </p>
        </Reveal>

        <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {looks.map((look) => (
            <li key={look.id}>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-luxury-charcoal/40">
                {look.photoUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={configuratorThumb(look.photoUrl, 600, 72) ?? look.photoUrl}
                    srcSet={configuratorThumbSrcSet(look.photoUrl, 600, 72)}
                    sizes="(min-width: 768px) 25vw, 50vw"
                    alt={`${look.name} — design look thobe bespoke`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>
              <p className="mt-2 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-ivory">{look.name}</p>
              {look.tagline && (
                <p className="font-luxury-sans text-[11px] leading-tight text-luxury-taupe line-clamp-2">{look.tagline}</p>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <MagneticButton href="/design-studio#the-studio" variant="primary">
            Buka Design Studio
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
