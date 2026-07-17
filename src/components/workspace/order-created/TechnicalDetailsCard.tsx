'use client'

import type { DesignSelections } from '@/components/workspace/design-studio/types'

interface TechnicalDetailsCardProps {
  design: DesignSelections
}

// Real saved selections from Design Studio — not Stitch's invented specific
// style names ("Grandad Mandarin", "Hidden Side Seam").
export function TechnicalDetailsCard({ design }: TechnicalDetailsCardProps) {
  const rows = [
    { label: 'Look Cutting', value: design.lookCutting },
    { label: 'Collar Style', value: design.collar },
    { label: 'Cuff Design', value: design.cuff },
    { label: 'Plaket', value: design.plaket },
    { label: 'Pocket Type', value: design.pocket },
    { label: 'Aksesori', value: design.button },
  ]

  return (
    <section className="bg-white/70 backdrop-blur-sm border-[0.5px] border-[#c4c7c7]/40 shadow-sm p-4">
      <h3 className="font-sans text-xs text-[#444748] uppercase tracking-widest mb-6 border-b border-[#c4c7c7] pb-2">
        Technical Details
      </h3>
      <div className="space-y-3 mb-6">
        {rows.map(row => (
          <div key={row.label} className="flex justify-between border-b border-[#c4c7c7]/20 pb-2">
            <span className="font-sans text-xs text-[#444748] uppercase">{row.label}</span>
            <span className="font-sans text-sm text-[#151c27]">{row.value}</span>
          </div>
        ))}
      </div>
      {/* No production-time estimator exists — honest placeholder instead
          of Stitch's fixed "12-14 Business Days". */}
      <div className="bg-[#f0f3ff] p-3 border-l-2 border-[#151c27]">
        <p className="font-sans text-[10px] text-[#444748] uppercase mb-1">
          Estimated Production Time
        </p>
        <p className="font-fraunces text-lg text-[#151c27]">Belum dihitung</p>
      </div>
    </section>
  )
}
