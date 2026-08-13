interface QuickAnswerProps {
  answer: string
  headingId: string
  // Sprint W6-10 — override lets this same component double as the "When
  // to Choose" citation block; default keeps every W6-8 call site unchanged.
  heading?: string
}

// Sprint W6-8 — "Quick Answer" box, shown above the fold, above even the
// definition blockquote. A single self-contained sentence is deliberately
// the entire point: AI Overview / ChatGPT / Perplexity crawlers extract
// short, standalone claims most reliably, and a reader scanning the page
// gets the answer before committing to the full article.
export function QuickAnswer({ answer, headingId, heading = 'Jawaban Singkat' }: QuickAnswerProps) {
  return (
    <section aria-labelledby={headingId} className="mx-auto mt-8 max-w-3xl rounded-2xl bg-luxury-gold/[0.06] p-5 ring-1 ring-inset ring-luxury-gold/20">
      <p id={headingId} className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
        {heading}
      </p>
      <p className="mt-2 font-luxury-sans text-base leading-relaxed text-luxury-ivory">{answer}</p>
    </section>
  )
}
