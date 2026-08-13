interface KeyTakeawaysProps {
  items: string[]
  headingId: string
}

// Sprint W6-8 — bullet-summary box. Each item is written to stand alone as
// a complete claim (not a sentence fragment needing the surrounding
// paragraph for context), the same "extractable unit" principle as
// QuickAnswer and the existing FAQ pattern.
export function KeyTakeaways({ items, headingId }: KeyTakeawaysProps) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby={headingId} className="mx-auto mt-8 max-w-3xl rounded-2xl border border-luxury-gold/[0.14] bg-luxury-charcoal/20 p-6">
      <h2 id={headingId} className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
        Poin Penting
      </h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-[9px] h-1 w-1 flex-shrink-0 rounded-full bg-luxury-gold" />
            <span className="font-luxury-sans text-sm leading-relaxed text-luxury-ivory">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
