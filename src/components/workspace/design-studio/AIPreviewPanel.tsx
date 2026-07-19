'use client'

import { useState } from 'react'
import type { CustomerDigitalProfile } from '@/lib/customerProfile/types'
import type { DesignSpecification } from '@/lib/designSpecification/types'
import { buildRenderContext, validateRenderContextReadiness } from '@/lib/customerProfile/renderContext'
import type { RenderContext } from '@/lib/customerProfile/renderContext'

interface AIPreviewPanelProps {
  customerDigitalProfile: CustomerDigitalProfile | null
  designSpecification: DesignSpecification
  renderContext: RenderContext | null
  onGenerate: (context: RenderContext) => void
}

// Design Studio's only remaining visual surface — deliberately inert. No
// SVG/PNG/live garment rendering lives here (that concept is cancelled per
// this sprint's brief); the actual visual result will come exclusively from
// the AI Render Engine in a later sprint. This panel's only job is to build
// (and validate the inputs for) the RenderContext that engine will consume.
//
// Preview Outdated (future sprint hook, NOT implemented here): once AI
// Render exists, comparing `renderContext.designSpecification.lastUpdated`
// (frozen at the moment Generate Final Preview was last pressed, held by
// the parent) against the live `designSpecification.lastUpdated` prop is
// enough to detect a stale preview — no extra state needed, just a diff at
// render time when that sprint is ready to add it.
export function AIPreviewPanel({
  customerDigitalProfile,
  designSpecification,
  renderContext,
  onGenerate,
}: AIPreviewPanelProps) {
  const [validationMessages, setValidationMessages] = useState<string[]>([])

  function handleGenerate() {
    const { ready, missing } = validateRenderContextReadiness(customerDigitalProfile, designSpecification)
    if (!ready) {
      setValidationMessages(missing)
      return
    }
    setValidationMessages([])
    onGenerate(buildRenderContext(customerDigitalProfile as CustomerDigitalProfile, designSpecification))
  }

  return (
    <section className="w-[45%] h-full bg-[#f9f9ff] relative flex flex-col items-center justify-center p-8 overflow-hidden gap-6">
      <div className="w-full max-w-lg aspect-[3/4] border border-dashed border-[#c4c7c7] flex flex-col items-center justify-center gap-3 text-center px-10">
        <span className="material-symbols-outlined text-6xl text-[#775a19]/30">auto_awesome</span>
        <p className="font-sans text-sm uppercase tracking-widest text-[#151c27]">Pratinjau AI</p>
        <p className="font-sans text-xs text-[#444748] max-w-xs leading-relaxed">
          {renderContext
            ? 'Render Context siap. AI Render Engine akan menggunakan ini pada sprint berikutnya.'
            : 'Pratinjau personal Anda akan muncul di sini. Selesaikan desain Anda lalu klik "Buat Pratinjau Akhir".'}
        </p>
      </div>

      {validationMessages.length > 0 && (
        <div className="w-full max-w-lg bg-[#fdecea] border-[0.5px] border-[#c0392b] p-3">
          <p className="font-sans text-xs font-bold text-[#c0392b] uppercase tracking-widest mb-1">
            Belum Lengkap
          </p>
          <ul className="list-disc list-inside space-y-1">
            {validationMessages.map(message => (
              <li key={message} className="font-sans text-xs text-[#c0392b]">
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        className="px-8 py-4 bg-[#151c27] text-white font-sans text-sm uppercase tracking-widest
                   flex items-center gap-2 hover:bg-[#151c27]/90 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
        Buat Pratinjau Akhir
      </button>
    </section>
  )
}
