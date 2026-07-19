// Pure brand identity — no dynamic props by design, so it can be reused
// as-is by every future milestone page without changes.
export function JourneyHero() {
  return (
    <header className="px-6 pt-10 pb-6 text-center border-b border-[#151c27]/10">
      <p className="font-sans text-[10px] uppercase tracking-[0.35em] text-secondary mb-2">
        Local Tailor
      </p>
      <p className="font-fraunces text-2xl text-on-surface">Customer Journey</p>
    </header>
  )
}
