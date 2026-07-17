'use client'

import { useRouter } from 'next/navigation'
import type { DesignSelections } from '@/components/workspace/design-studio/types'

interface GarmentPreviewSectionProps {
  consultationId: string
  selections: DesignSelections
}

// Same "keep the placeholder a placeholder" approach as Design Studio — no
// rendering engine, no hotlinked photo. Style DNA tags show every saved
// Design Selection field (all DB-driven master data pilihan) as chips.
export function GarmentPreviewSection({ consultationId, selections }: GarmentPreviewSectionProps) {
  const router = useRouter()

  const tags = [
    selections.model,
    selections.lookCutting,
    selections.fabric,
    selections.collar,
    selections.color,
    selections.pocket,
    selections.plaket,
    selections.button,
  ]

  return (
    <section className="relative bg-white shadow-sm min-h-[500px] flex flex-col items-center justify-center overflow-hidden border-[0.5px] border-[#c4c7c7] p-8">
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={() => router.push(`/workspace/design-studio/${consultationId}`)}
          className="text-[#444748] hover:text-[#151c27] transition-all duration-300 flex items-center gap-1 font-sans text-xs uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          Edit Design
        </button>
      </div>

      <div className="w-full flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-xs aspect-[3/4] bg-[#e2e8f8]/60 border border-[#c4c7c7] flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-6xl text-[#775a19]/30">checkroom</span>
          <p className="font-sans text-xs uppercase tracking-widest text-[#444748]">Preview Garmen</p>
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-[#c4c7c7]/30 w-full flex flex-wrap gap-3 justify-center">
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="font-sans text-xs uppercase tracking-widest px-4 py-2 border-[0.5px] border-[#747878] text-[#444748]"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  )
}
