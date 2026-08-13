interface AICitationBlockProps {
  /** One or two sentence, self-contained definition — written to be quoted verbatim by an AI answer engine. */
  definition: string
  /** Optional short list of concrete facts (numbers, scope, location) that ground the definition. */
  keyFacts?: string[]
  headingId: string
  heading?: string
}

// Sprint W7-9 — AI-friendly content formatting. A short, structurally
// isolated "answer block" at the top of a page: a single quotable
// definition paragraph plus optional bulleted facts, marked up so an
// extractive summarizer (AI Overview, a ChatGPT/Perplexity crawler) can
// lift it as a self-contained answer without needing the surrounding page
// for context. Mirrors the shape src/components/knowledge/QuickAnswer.tsx
// already established for the Knowledge section — this is the same pattern
// made available outside it, without touching that shipped component.
export function AICitationBlock({ definition, keyFacts, headingId, heading = 'Ringkasan' }: AICitationBlockProps) {
  return (
    <section aria-labelledby={headingId} className="mx-auto max-w-3xl rounded-2xl border border-luxury-gold/[0.14] bg-luxury-navy/60 p-6">
      <h2 id={headingId} className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
        {heading}
      </h2>
      <p className="mt-3 font-fraunces text-lg leading-snug text-luxury-ivory md:text-xl">{definition}</p>
      {keyFacts && keyFacts.length > 0 && (
        <ul className="mt-4 space-y-2">
          {keyFacts.map((fact, index) => (
            <li key={index} className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-[10px] h-px w-4 flex-shrink-0 bg-luxury-gold" />
              <span className="font-luxury-sans text-sm leading-relaxed text-luxury-taupe">{fact}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
