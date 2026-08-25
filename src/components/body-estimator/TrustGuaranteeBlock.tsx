interface TrustGuaranteeBlockProps {
  className?: string
}

// Sprint W0.3 — adapted from the R0 Hockerty audit: their mobile layout
// places a trust/reassurance block immediately before the slider/input
// area, not in the footer. The result page (see result/page.tsx) reorders
// this block to appear first on mobile via CSS `order`, matching that
// finding, while keeping it after the hero on desktop.
export function TrustGuaranteeBlock({ className = '' }: TrustGuaranteeBlockProps) {
  return (
    <div className={`animate-fade-in rounded-2xl border border-luxury-gold/25 bg-luxury-charcoal/30 p-6 md:p-8 ${className}`}>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-luxury-gold/40 px-3 py-1 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
        <span aria-hidden="true">✓</span> Fitter Verified
      </span>
      <h2 className="mt-4 font-fraunces text-2xl text-luxury-ivory">Tailor-Verified Measurement</h2>
      <p className="mt-3 max-w-2xl font-luxury-sans text-sm leading-relaxed text-luxury-taupe">
        Estimasi ini hanya langkah pertama. Setelah Anda melakukan booking, fitter Local Tailor akan melakukan
        pengukuran langsung untuk membuat{' '}
        <strong className="text-luxury-ivory">Digital Body Profile yang terverifikasi</strong>.
      </p>
    </div>
  )
}
