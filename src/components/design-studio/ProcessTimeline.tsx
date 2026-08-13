import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'

export interface ProcessTimelineStep {
  title: string
  description?: string
}

interface ProcessTimelineProps {
  heading: string
  subheadline?: string
  steps: ProcessTimelineStep[]
}

// Sprint Y §Y-9 — reusable vertical/horizontal step timeline. Same visual
// language (numbered badge + connecting rail) as
// src/components/marketing/sections/BespokeProcessSection.tsx, but built
// as a standalone generic component (arbitrary `steps` prop, not
// bespokeProcessCopy's fixed 6 steps) so it isn't tied to that section's
// own copy — this sprint's caller passes the Customer Journey steps
// (Book Session -> Video Call -> Design Studio -> Approve Design ->
// Production -> Delivery), which only partially overlaps.
export function ProcessTimeline({ heading, subheadline, steps }: ProcessTimelineProps) {
  return (
    <section aria-labelledby="process-timeline-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <h2 id="process-timeline-heading" className="font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {heading}
          </h2>
          {subheadline && <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{subheadline}</p>}
        </Reveal>

        <ol className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-6 lg:gap-y-0">
          <div aria-hidden="true" className="absolute bottom-2 left-[22px] top-2 w-px bg-luxury-gold/20 md:hidden" />
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[22px] hidden h-px w-[calc(100%-10rem)] -translate-x-1/2 bg-luxury-gold/20 lg:block"
          />

          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.08} className="relative flex gap-5 md:block md:gap-0">
              <span
                aria-hidden="true"
                className="relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-luxury-gold bg-luxury-navy font-fraunces text-sm text-luxury-gold md:mx-auto md:mb-5"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <article className="flex-1 rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-5 md:text-center">
                <h3 className="font-fraunces text-base text-luxury-ivory">{step.title}</h3>
                {step.description && <p className="mt-2 font-luxury-sans text-xs text-luxury-taupe">{step.description}</p>}
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
