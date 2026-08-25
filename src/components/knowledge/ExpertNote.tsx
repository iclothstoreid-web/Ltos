interface ExpertNoteProps {
  note: string
  headingId: string
}

// Sprint W6-8 — "Tailor's recommendation" callout. Attributed to the
// brand's tailoring team (Local Tailor), not a fabricated named individual
// — see seo.ts's buildKnowledgePersonSchema comment for the reasoning.
export function ExpertNote({ note, headingId }: ExpertNoteProps) {
  return (
    <section aria-labelledby={headingId} className="mx-auto mt-12 max-w-3xl rounded-2xl bg-luxury-gold/[0.08] p-6 ring-1 ring-inset ring-luxury-gold/20 md:p-8">
      <p id={headingId} className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
        Rekomendasi Tailor
      </p>
      <p className="mt-3 font-fraunces text-lg italic leading-snug text-luxury-ivory md:text-xl">&ldquo;{note}&rdquo;</p>
      <p className="mt-3 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe">— Tim Tailor Kami, Local Tailor</p>
    </section>
  )
}
