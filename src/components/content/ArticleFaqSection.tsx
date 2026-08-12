import type { ArticleFaqItem } from '@/lib/content/articles'

interface ArticleFaqSectionProps {
  items: ArticleFaqItem[]
}

// Concise question/answer pairs — the same content backing the page's
// FAQPage JSON-LD (buildArticleFaqSchema), so UI and schema can never drift
// apart, and each answer stands alone as a self-contained block that's easy
// for an AI Overview / ChatGPT / Perplexity crawler to extract directly.
export function ArticleFaqSection({ items }: ArticleFaqSectionProps) {
  return (
    <section aria-labelledby="article-faq-heading" className="mx-auto mt-14 max-w-3xl">
      <h2 id="article-faq-heading" className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
        Pertanyaan Umum
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
