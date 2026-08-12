import type { HowToStepEntry } from '@/lib/content/articles'

interface HowToStepsListProps {
  steps: HowToStepEntry[]
}

// A real sequence (order matters — step 6 depends on having done 1–5), so
// numbering here encodes real information rather than decorating content
// that isn't actually a sequence.
export function HowToStepsList({ steps }: HowToStepsListProps) {
  return (
    <ol className="mx-auto mt-6 max-w-3xl space-y-6">
      {steps.map((step, index) => (
        <li key={step.name} className="flex gap-4">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-luxury-gold/40 font-fraunces text-sm text-luxury-gold"
          >
            {index + 1}
          </span>
          <div>
            <p className="font-luxury-sans text-sm uppercase tracking-[0.1em] text-luxury-ivory">{step.name}</p>
            <p className="mt-1.5 font-luxury-sans text-sm leading-relaxed text-luxury-taupe">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
