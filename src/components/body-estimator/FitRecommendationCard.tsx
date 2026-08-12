interface FitRecommendationCardProps {
  fit: string
  confidence: number
  explanation: string
}

// Sprint W0.3 — Recommended Fit / Confidence / short explanation, straight
// off the W0.2 engine's result.
export function FitRecommendationCard({ fit, confidence, explanation }: FitRecommendationCardProps) {
  return (
    <div className="animate-fade-in rounded-2xl border border-luxury-gold/[0.14] bg-luxury-charcoal/20 p-6 transition-transform duration-300 ease-out hover:-translate-y-0.5">
      <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">Fit Recommendation</p>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-fraunces text-2xl capitalize text-luxury-ivory">{fit} Fit</p>
        <p className="font-luxury-sans text-sm text-luxury-taupe">
          <span className="font-fraunces text-lg text-luxury-gold">{confidence}%</span> confidence
        </p>
      </div>
      <p className="mt-3 font-luxury-sans text-sm leading-relaxed text-luxury-taupe">{explanation}</p>
    </div>
  )
}
