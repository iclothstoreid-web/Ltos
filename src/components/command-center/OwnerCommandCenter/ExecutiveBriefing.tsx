import { memo } from 'react'
import Link from 'next/link'

// Sprint D.1 Phase 5 — the Decision surface (Design Language Volumes 02, 06 SS10,
// spec SSSS7-8). hasRecommendation distinguishes the populated state from the
// Empty State; both are fully composed at equal visual weight, never a
// grayed-out variant of one another.
//
// PR-01 (Rendering Performance) — memoized: receives stable primitive props
// from OwnerCommandCenter and doesn't need to re-render on unrelated state.
function ExecutiveBriefingComponent({
  title,
  body,
  hasRecommendation,
}: {
  title: string
  body: string
  hasRecommendation: boolean
}) {
  return (
    <div className="rounded-[18px] border border-outline-variant/85 bg-surface/50 px-8 py-8 sm:px-10 sm:py-10 elev-2 relative overflow-hidden">
      {/* Light DNA — abstract diagonal gold-to-green wash + faint grain only, never photography/illustration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.10] bg-[linear-gradient(135deg,rgba(200,155,60,0.30)_0%,rgba(0,86,69,0.12)_48%,rgba(252,250,248,0)_100%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.18] bg-[repeating-linear-gradient(0deg,rgba(0,86,69,0.06)_0px,rgba(0,86,69,0.06)_1px,transparent_1px,transparent_26px)]" />

      <div className="relative">
        <p className="text-label text-secondary uppercase tracking-[0.22em]">
          {hasRecommendation ? 'Rekomendasi Eksekutif' : 'Status Hari Ini'}
        </p>
        <h2 className="font-serif text-on-surface text-[28px] sm:text-[32px] leading-[1.2] mt-3 tracking-[-0.02em] max-w-[36ch]">
          {title}
        </h2>
        <p className="text-body text-secondary mt-4 leading-relaxed max-w-[60ch]">{body}</p>

        {hasRecommendation && (
          <>
            <Link href="/command-center/decision-center" className="decision-primary inline-block mt-6">
              Tinjau &amp; Tugaskan
            </Link>

            <div className="mt-6 pt-4 border-t border-outline-variant/70">
              <p className="text-label text-secondary uppercase tracking-[0.22em]">Catatan Keputusan</p>
              <p className="text-body text-secondary mt-2 leading-relaxed">
                Ambil tindakan seminimal mungkin. Lakukan langkah kecil paling menentukan untuk menstabilkan rantai kerja.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const ExecutiveBriefing = memo(ExecutiveBriefingComponent)
