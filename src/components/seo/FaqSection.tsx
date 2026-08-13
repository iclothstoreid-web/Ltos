import type { FaqSchemaItem } from '@/lib/seo/schema'

interface FaqSectionProps {
  items: FaqSchemaItem[]
  headingId: string
  heading?: string
}

// Sprint W7-4 — generic reusable FAQ component. Same self-contained <dl>
// pattern as src/components/knowledge/FAQSection.tsx (kept as-is there —
// this is the version new pages outside Knowledge reach for), rendering
// from the exact same items array a page passes into faqSchema(), so the
// visible copy and the FAQPage JSON-LD can never drift apart.
export function FaqSection({ items, headingId, heading = 'Pertanyaan Umum' }: FaqSectionProps) {
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
