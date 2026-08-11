import type { FabricFaqItem } from '@/types/material'

interface FaqSectionProps {
  faq: FabricFaqItem[]
}

// §2/§13 — native <details>/<summary> disclosure widgets: zero client JS
// for the expand/collapse interaction, and both the question and answer
// are present in the server-rendered HTML regardless of open/closed state
// (unlike a JS-only accordion), so crawlers and LLM readers see the full
// content without needing to simulate a click.
export function FaqSection({ faq }: FaqSectionProps) {
  if (faq.length === 0) return null

  return (
    <section aria-labelledby="fabric-faq-heading">
      <h2 id="fabric-faq-heading" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
        Frequently Asked Questions
      </h2>
      <div className="mt-4 divide-y divide-luxury-gold/10 rounded-xl border border-luxury-gold/10">
        {faq.map((item) => (
          <details key={item.question} className="group p-4">
            <summary className="cursor-pointer list-none font-luxury-sans text-sm text-luxury-ivory marker:content-none">
              <span className="flex items-center justify-between gap-4">
                {item.question}
                <span aria-hidden="true" className="text-luxury-gold transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 font-luxury-sans text-sm leading-relaxed text-luxury-taupe">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
