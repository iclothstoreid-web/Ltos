interface EstimatedSizeCardProps {
  size: string
  chestRange: string
  shoulderRange: string
}

// Sprint W0.3 — Estimated Thobe Size + chest/shoulder ranges
// (src/lib/body-estimator/sizeRecommendation.ts#getSizeRangeLabels).
export function EstimatedSizeCard({ size, chestRange, shoulderRange }: EstimatedSizeCardProps) {
  return (
    <div className="animate-fade-in rounded-2xl border border-luxury-gold/[0.14] bg-luxury-charcoal/20 p-6 transition-transform duration-300 ease-out hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">Estimated Thobe Size</p>
        <span className="inline-flex items-center rounded-full border border-luxury-gold/40 px-2.5 py-0.5 font-luxury-sans text-[9px] uppercase tracking-[0.12em] text-luxury-gold">
          Estimated
        </span>
      </div>
      <p className="mt-3 font-fraunces text-4xl text-luxury-ivory">{size}</p>
      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-luxury-gold/[0.1] pt-4">
        <div>
          <p className="font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-taupe/80">Chest range</p>
          <p className="mt-1 font-luxury-sans text-sm text-luxury-ivory">{chestRange}</p>
        </div>
        <div>
          <p className="font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-taupe/80">Shoulder range</p>
          <p className="mt-1 font-luxury-sans text-sm text-luxury-ivory">{shoulderRange}</p>
        </div>
      </div>
    </div>
  )
}
