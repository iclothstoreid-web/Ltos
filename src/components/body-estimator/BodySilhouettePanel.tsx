import { LuxuryGradientField } from '@/components/marketing/placeholders/LuxuryGradientField'
import { LinenTexture } from '@/components/marketing/placeholders/LinenTexture'

// Sprint W0.1 — left column visual. Reuses the homepage's existing
// placeholder primitives (LuxuryGradientField / LinenTexture) instead of a
// real photo/video asset ("Belum perlu video asli. Gunakan placeholder
// elegan."). The body-figure gradient id is a static string, not useId() —
// unlike GarmentSilhouette.tsx (which needs a unique id per instance
// because it renders multiple times across the homepage), this panel
// renders exactly once per page, so a static id is safe and keeps the
// component a server component (no 'use client' needed).
export function BodySilhouettePanel() {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-luxury-gold/[0.14] lg:min-h-full">
      <LuxuryGradientField variant="a" />
      <LinenTexture opacity={0.08} idSuffix="body-silhouette" />

      {/* Subtle measurement guide lines — reinforces "body estimation"
          without needing real photography. */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-x-10 top-[32%] border-t border-dashed border-luxury-gold/15" />
        <div className="absolute inset-x-10 top-[56%] border-t border-dashed border-luxury-gold/15" />
        <div className="absolute inset-x-10 top-[78%] border-t border-dashed border-luxury-gold/15" />
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 200 420"
        className="absolute left-1/2 top-1/2 h-[64%] w-auto -translate-x-1/2 -translate-y-1/2 animate-luxury-drift"
        fill="none"
      >
        <defs>
          <linearGradient id="body-silhouette-gradient" x1="0" y1="0" x2="0" y2="420" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C8A24A" stopOpacity="0.85" />
            <stop offset="1" stopColor="#C8A24A" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="46" r="28" stroke="url(#body-silhouette-gradient)" strokeWidth="1.5" opacity="0.6" />
        <path
          d="M72 80c-14 10-22 28-24 50l-4 66c-1 9 6 16 15 16h9l-4 96c-1 9 6 17 15 17h10l3-96h8l3 96h10c9 0 16-8 15-17l-4-96h9c9 0 16-7 15-16l-4-66c-2-22-10-40-24-50-8-6-18-9-28-9s-20 3-28 9z"
          stroke="url(#body-silhouette-gradient)"
          strokeWidth="1.5"
          opacity="0.55"
        />
      </svg>

      <div className="absolute left-6 top-6">
        <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">Personal Body Estimation</p>
      </div>

      <div className="absolute inset-x-6 bottom-6 flex flex-col gap-3">
        <p className="font-luxury-sans text-xs text-luxury-taupe">Built from height, weight, and age estimates.</p>

        {/* Placeholder video / animation area — no real asset yet. */}
        <div className="inline-flex w-fit items-center gap-3 rounded-full border border-luxury-gold/20 bg-luxury-navy-deep/60 px-4 py-2 backdrop-blur-sm">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-luxury-gold/90 text-[10px] text-luxury-black"
          >
            ▶
          </span>
          <span className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">Preview Segera Hadir</span>
        </div>
      </div>
    </div>
  )
}
