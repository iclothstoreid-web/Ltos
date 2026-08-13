import type { KnowledgeFaqItem } from '@/lib/knowledge/types'

interface FAQSectionProps {
  items: KnowledgeFaqItem[]
  headingId: string
  heading?: string
}

// Same self-contained question/answer <dl> pattern as the existing W0.5
// ArticleFaqSection — the same content backs this section's visible markup
// and the page's FAQPage JSON-LD (buildKnowledgeFaqSchema), so they can
// never drift apart.
export function FAQSection({ items, headingId, heading = 'Pertanyaan Umum' }: FAQSectionProps) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby={headingId} className="mx-auto mt-14 max-w-3xl">
      <h2 id={headingId} className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
        {heading}
      </h2>
      <dl className="mt-6 space-y-6">
        {items.map((item) => (
          <div key={item.question} className="border-b border-luxury-gold/[0.1] pb-6 last:border-b-0">
            <dt className="font-luxury-sans text-base text-luxury-ivory">{item.question}</dt>
            <dd className="mt-2 font-luxury-sans text-sm leading-relaxed text-luxury-taupe">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
