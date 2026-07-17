'use client'

import type { DesignSelections } from '@/components/workspace/design-studio/types'

interface ReferenceModelCardProps {
  design: DesignSelections | null
}

// The Stitch export shows a front/back reference-photo carousel — no
// reference-model photo capture exists anywhere in the app (same gap as the
// Hero Card's customer photo, confirmed with the user), so this shows the
// real design selections as text instead of fabricated images.
export function ReferenceModelCard({ design }: ReferenceModelCardProps) {
  if (!design) return null

  const chips = [design.model, design.collar, design.cuff, design.button].filter(Boolean)

  return (
    <div className="space-y-3">
      <h3 className="font-caslon text-xl text-[#161b29] px-1">Model Referensi</h3>
      <div className="bg-[#fbf9fc] rounded-2xl p-5 shadow-sm border border-[#c6c6cc]/30">
        <p className="font-hanken font-semibold text-[#161b29] mb-3">{design.model}</p>
        <div className="flex flex-wrap gap-2">
          {chips.map(chip => (
            <span
              key={chip}
              className="font-jetbrains text-[10px] tracking-widest uppercase text-[#46464c] bg-[#efedf0] px-2 py-1 rounded"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
