'use client'

import { useEffect, useState } from 'react'
import type { CustomerDigitalProfile } from '@/lib/customerProfile/types'
import type { DesignSpecification } from '@/lib/designSpecification/types'
import { buildRenderContext, validateRenderContextReadiness } from '@/lib/customerProfile/renderContext'
import type { RenderContext } from '@/lib/customerProfile/renderContext'
import type { RenderResult } from '@/lib/types/render'

interface AIPreviewPanelProps {
  customerDigitalProfile: CustomerDigitalProfile | null
  designSpecification: DesignSpecification
  renderContext: RenderContext | null
  onGenerate: (context: RenderContext) => void
  renderResult: RenderResult
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
// Sprint O.1 (Task 7, UI Responsiveness) — a real render takes ~68-78s,
// almost entirely spent waiting on the AI provider (see SPRINT_O1 report);
// there is no earlier point in the request/response cycle where a
// meaningful progress fraction or the Render ID actually exists yet to show
// (the whole pipeline runs inside one request-response round trip — see
// route.ts). These thresholds only set the right EXPECTATION so the app
// never reads as frozen, not a real progress measurement.
const LOADING_STAGE_MESSAGES: { afterSeconds: number; text: string }[] = [
  { afterSeconds: 0, text: 'Menyiapkan detail desain dan foto Anda...' },
  { afterSeconds: 5, text: 'Mengirim permintaan ke AI Rendering Engine...' },
  { afterSeconds: 12, text: 'Local Tailor masih menyempurnakan detail Anda. Proses ini biasanya memakan waktu 60–80 detik.' },
  { afterSeconds: 45, text: 'Hampir selesai — AI masih menyempurnakan detail visual Anda...' },
]

function useElapsedSeconds(active: boolean): number {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!active) {
      setElapsed(0)
      return
    }
    const startedAt = Date.now()
    setElapsed(0)
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(interval)
  }, [active])

  return elapsed
}

export function AIPreviewPanel({
  customerDigitalProfile,
  designSpecification,
  renderContext,
  onGenerate,
  renderResult,
}: AIPreviewPanelProps) {
  const [validationMessages, setValidationMessages] = useState<string[]>([])
  const isLoading = renderResult.status === 'loading'
  const elapsedSeconds = useElapsedSeconds(isLoading)
  const loadingMessage = [...LOADING_STAGE_MESSAGES].reverse().find((stage) => elapsedSeconds >= stage.afterSeconds)?.text
    ?? LOADING_STAGE_MESSAGES[0].text

  function handleGenerate() {
    // Render Request Lock (Sprint O, Task 1) — the button below is already
    // `disabled` while loading, but that only stops a mouse click; this
    // guard also stops a stray keyboard/programmatic activation from
    // firing a second render while one is still in flight.
    if (renderResult.status === 'loading') return

    const { ready, missing } = validateRenderContextReadiness(customerDigitalProfile, designSpecification)
    if (!ready) {
      setValidationMessages(missing)
      return
    }
    setValidationMessages([])
    onGenerate(buildRenderContext(customerDigitalProfile as CustomerDigitalProfile, designSpecification))
  }

  return (
    <section className="w-full lg:w-[45%] lg:h-full bg-[#f9f9ff] relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 lg:overflow-hidden gap-6">
      {renderResult.status === 'success' && renderResult.imageUrl ? (
        <div className="w-full max-w-lg flex flex-col items-center justify-center gap-3">
          <img
            src={renderResult.imageUrl}
            alt="Rendered thobe"
            className="w-full aspect-[3/4] object-cover border border-[#c4c7c7]"
          />
          {renderResult.tokenUsage?.total && (
            <small className="text-xs text-gray-500">
              AI Engine: {renderResult.tokenUsage.total} / 270 tokens
            </small>
          )}
        </div>
      ) : (
        <div className="w-full max-w-lg aspect-[3/4] border border-dashed border-[#c4c7c7] flex flex-col items-center justify-center gap-3 text-center px-4 sm:px-10">
          {renderResult.status === 'loading' ? (
            <>
              <span className="material-symbols-outlined text-6xl text-[#775a19]/30 animate-spin">
                auto_awesome
              </span>
              <p className="font-sans text-sm uppercase tracking-widest text-[#151c27]">
                Sedang menyiapkan Preview Eksklusif Anda...
              </p>
              <p className="font-sans text-xs text-[#444748] max-w-xs leading-relaxed">
                {loadingMessage}
              </p>
              <p className="font-sans text-xs font-semibold text-[#775a19] tabular-nums">
                {elapsedSeconds}s berlalu
              </p>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-6xl text-[#775a19]/30">auto_awesome</span>
              <p className="font-sans text-sm uppercase tracking-widest text-[#151c27]">Preview Eksklusif</p>
              <p className="font-sans text-xs text-[#444748] max-w-xs leading-relaxed">
                Selesaikan pilihan desain Anda, lalu buat preview personal untuk melihat gambaran busana sebelum
                diproduksi.
              </p>
            </>
          )}
        </div>
      )}
      {renderResult.status === 'error' && (
        <div className="w-full max-w-lg bg-[#fdecea] border-[0.5px] border-[#c0392b] p-3">
          <p className="font-sans text-xs font-bold text-[#c0392b] uppercase tracking-widest mb-1">
            Preview belum dapat dibuat
          </p>
          <p className="font-sans text-xs text-[#c0392b]">
            Terjadi kendala saat membuat preview. Silakan coba beberapa saat lagi atau ubah pilihan desain Anda
            kemudian render kembali.
          </p>
          {renderResult.renderId && (
            <p className="font-sans text-[10px] text-[#c0392b]/70 mt-1">
              Render ID: {renderResult.renderId} (sertakan ID ini saat melapor)
            </p>
          )}
        </div>
      )}

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
        disabled={renderResult.status === 'loading'}
        className="px-8 py-4 bg-[#151c27] text-white font-sans text-sm uppercase tracking-widest
                   flex items-center gap-2 hover:bg-[#151c27]/90 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#151c27]"
      >
        <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
        {renderResult.status === 'loading' ? 'Sedang Memproses...' : 'Buat Pratinjau Akhir'}
      </button>
    </section>
  )
}
