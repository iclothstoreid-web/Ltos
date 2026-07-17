'use client'

import type { DesignSelections } from './types'

interface GarmentPreviewCanvasProps {
  selections: DesignSelections
  shoulder: number | null
  sleeve: number | null
}

// The Stitch reference's "Live Illustration SVG Mock" is actually a static
// hotlinked photo, not a real configurator. Per the brief ("don't build
// your own virtual fitting system", "if the preview is a placeholder, keep
// it a placeholder"), this keeps the exact same layout slot/proportions but
// swaps the hotlinked image for an inert placeholder — no garment rendering
// logic is implemented.
export function GarmentPreviewCanvas({ selections, shoulder, sleeve }: GarmentPreviewCanvasProps) {
  return (
    <section className="w-[45%] h-full bg-[#f9f9ff] relative flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="relative w-full max-w-lg aspect-[3/4] flex items-center justify-center">
        <div className="absolute top-1/4 left-0 w-full flex justify-between px-12 pointer-events-none opacity-40">
          <div className="flex flex-col items-center">
            <div className="h-px w-24 bg-[#747878]" />
            <span className="font-sans text-[10px] mt-1 text-[#444748]">
              Shoulder: {shoulder != null ? `${shoulder}cm` : '—'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-px w-24 bg-[#747878]" />
            <span className="font-sans text-[10px] mt-1 text-[#444748]">
              Sleeve: {sleeve != null ? `${sleeve}cm` : '—'}
            </span>
          </div>
        </div>

        <div className="w-full h-full bg-[#e2e8f8]/60 border border-[#c4c7c7] flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-6xl text-[#775a19]/30">checkroom</span>
          <p className="font-sans text-xs uppercase tracking-widest text-[#444748]">
            Preview Garmen
          </p>
        </div>

        <div className="absolute bottom-8 left-8 right-8 bg-[#f9f9ff]/70 border border-[#c4c7c7] p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-[#775a19] text-sm">dna</span>
            <span className="font-sans text-xs text-[#151c27] uppercase tracking-tighter">
              Style DNA Profile
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-[#e2e8f8] text-[10px] font-sans text-[#151c27]">
              {selections.model.toUpperCase()}
            </span>
            <span className="px-2 py-1 bg-[#e2e8f8] text-[10px] font-sans text-[#151c27]">
              {selections.collar.toUpperCase()}
            </span>
            <span className="px-2 py-1 bg-[#e2e8f8] text-[10px] font-sans text-[#151c27]">
              {selections.color.toUpperCase()} BASE
            </span>
          </div>
        </div>
      </div>

      {/* Inert — no rotation/zoom/texture-view logic implemented, matching
          "don't build your own virtual fitting system". */}
      <div className="mt-8 flex gap-4">
        <button className="p-3 bg-[#e7eefe] hover:bg-[#e2e8f8] transition-colors rounded-full" title="Rotate View" type="button">
          <span className="material-symbols-outlined">rotate_90_degrees_ccw</span>
        </button>
        <button className="p-3 bg-[#e7eefe] hover:bg-[#e2e8f8] transition-colors rounded-full" title="Zoom Details" type="button">
          <span className="material-symbols-outlined">zoom_in</span>
        </button>
        <button className="p-3 bg-[#e7eefe] hover:bg-[#e2e8f8] transition-colors rounded-full" title="Texture View" type="button">
          <span className="material-symbols-outlined">texture</span>
        </button>
      </div>
    </section>
  )
}
