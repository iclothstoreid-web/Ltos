import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import type { ServiceConfig } from '@/lib/seo/serviceConfig'

interface ServiceValuePropsProps {
  service: ServiceConfig
}

// Sprint W10 — "Value proposition" section, same reasons-list shape as
// CityWhyChoose.tsx but rendering service.valueProps (genuinely
// differentiated per keyword page — see serviceConfig.ts) instead of the
// one fixed REASONS array CityWhyChoose uses, since these 5 pages each
// need a distinct commercial angle, not the same 4 generic reasons.
export function ServiceValueProps({ service }: ServiceValuePropsProps) {
  return (
    <section aria-labelledby="service-value-props-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Mengapa Local Tailor</p>
          <h2 id="service-value-props-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            Mengapa Memilih Kami untuk {service.garmentLabel}
          </h2>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {service.valueProps.map((prop, i) => (
            <Reveal as="li" key={prop.title} delay={i * 0.08} className="rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-6">
              <h3 className="font-fraunces text-lg text-luxury-ivory">{prop.title}</h3>
              <p className="mt-2 font-luxury-sans text-sm text-luxury-taupe">{prop.description}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
