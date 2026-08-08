'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import Image from 'next/image'
import type { CustomerDigitalProfile } from '@/lib/customerProfile/types'
import type { DesignSpecification } from '@/lib/designSpecification/types'
import { buildRenderContext, validateRenderContextReadiness } from '@/lib/customerProfile/renderContext'
import type { RenderContext } from '@/lib/customerProfile/renderContext'
import type { RenderResult } from '@/lib/types/render'
import type { RenderFinal } from '@/lib/design/renderFinal'
import { RENDER_FINAL_STATUS_LABELS } from '@/lib/design/renderFinal'
import { supabaseImageLoader } from '@/lib/supabase/imageLoader'

interface AIPreviewPanelProps {
  customerDigitalProfile: CustomerDigitalProfile | null
  designSpecification: DesignSpecification
  renderContext: RenderContext | null
  onGenerate: (context: RenderContext) => void
  renderResult: RenderResult
  // Render Final Storage (2026-08-07, Store Private / Access by Signed
  // URL) — Preview prefers this session's freshly-generated image
  // (renderResult.imageUrl, a data: URI, displays instantly with no
  // round-trip) and falls back to `previewUrl`, a short-TTL signed URL the
  // parent mints server-side (page load) or via the signed-url API route
  // (after Generate/Replace) — never a URL read directly off `renderFinal`,
  // which only ever carries a private Storage path now. Download/Replace/
  // Approve act on whichever image is currently the consultation's Render
  // Final; Download mints its own fresh signed URL via the parent
  // (onDownloadRenderFinal), independent of whatever Preview is showing.
  renderFinal: RenderFinal | null
  previewUrl: string | null
  renderFinalBusy: boolean
  renderFinalError: string | null
  onReplaceRenderFinal: (file: File) => void
  onApproveRenderFinal: () => void
  onDownloadRenderFinal: () => void
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
  renderFinal,
  previewUrl,
  renderFinalBusy,
  renderFinalError,
  onReplaceRenderFinal,
  onApproveRenderFinal,
  onDownloadRenderFinal,
}: AIPreviewPanelProps) {
  const [validationMessages, setValidationMessages] = useState<string[]>([])
  // Mirrors CatalogCard/SpecDetailModal's fallback: a handful of legacy
  // Storage objects exceed the Image Transformation add-on's resolution
  // limit (400 InvalidRequest) and must fall back to the untransformed URL.
  const [transformFailed, setTransformFailed] = useState(false)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const isLoading = renderResult.status === 'loading'
  const elapsedSeconds = useElapsedSeconds(isLoading)
  const loadingMessage = [...LOADING_STAGE_MESSAGES].reverse().find((stage) => elapsedSeconds >= stage.afterSeconds)?.text
    ?? LOADING_STAGE_MESSAGES[0].text

  // Preview prefers this session's freshly-generated image (a data: URI —
  // displays instantly, no round-trip); falls back to `previewUrl`, the
  // parent's freshly-minted signed URL (survives a page reload, when
  // `renderResult` has reset to 'idle').
  const previewImageUrl =
    renderResult.status === 'success' && renderResult.imageUrl ? renderResult.imageUrl : previewUrl

  useEffect(() => {
    setTransformFailed(false)
  }, [previewImageUrl])

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

  function handleReplaceClick() {
    replaceInputRef.current?.click()
  }

  function handleReplaceFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onReplaceRenderFinal(file)
  }

  return (
    <section className="w-full lg:w-[45%] lg:h-full bg-[#f9f9ff] relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 lg:overflow-hidden gap-6">
      {previewImageUrl ? (
        <div className="w-full max-w-lg flex flex-col items-center justify-center gap-3">
          <div className="relative w-full aspect-[3/4] border border-[#c4c7c7]">
            <Image
              key={transformFailed ? 'raw' : 'transformed'}
              src={previewImageUrl as string}
              alt="Rendered thobe"
              loader={transformFailed ? undefined : supabaseImageLoader}
              unoptimized={transformFailed}
              fill
              sizes="(min-width: 1024px) 512px, 100vw"
              className="object-cover"
              onError={() => setTransformFailed(true)}
            />
            {renderFinal && (
              <span
                className={`absolute top-2 right-2 px-2 py-1 font-sans text-[10px] uppercase tracking-widest ${
                  renderFinal.render_status === 'approved'
                    ? 'bg-[#2e7d32] text-white'
                    : 'bg-[#151c27]/80 text-white'
                }`}
              >
                {RENDER_FINAL_STATUS_LABELS[renderFinal.render_status]}
              </span>
            )}
          </div>
          {renderResult.status === 'success' && renderResult.tokenUsage?.total && (
            <small className="text-xs text-gray-500">
              AI Engine: {renderResult.tokenUsage.total} / 270 tokens
            </small>
          )}

          {/* Render Final Storage — Download/Replace/Approve (2026-08-07) */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onDownloadRenderFinal}
              disabled={renderFinalBusy}
              className="px-4 py-2 border-[0.5px] border-[#151c27] text-[#151c27] font-sans text-xs uppercase
                         tracking-widest hover:bg-[#151c27]/5 transition-colors disabled:opacity-40"
            >
              {renderFinalBusy ? 'Memproses...' : 'Download Render'}
            </button>
            <button
              type="button"
              onClick={handleReplaceClick}
              disabled={renderFinalBusy}
              className="px-4 py-2 border-[0.5px] border-[#775a19] text-[#775a19] font-sans text-xs uppercase
                         tracking-widest hover:bg-[#775a19]/5 transition-colors disabled:opacity-40"
            >
              Replace Render
            </button>
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReplaceFileChange}
            />
            {renderFinal && renderFinal.render_status !== 'approved' && (
              <button
                type="button"
                onClick={onApproveRenderFinal}
                disabled={renderFinalBusy}
                className="px-4 py-2 bg-[#2e7d32] text-white font-sans text-xs uppercase tracking-widest
                           hover:bg-[#2e7d32]/90 transition-colors disabled:opacity-40"
              >
                {renderFinalBusy ? 'Memproses...' : 'Approve Render'}
              </button>
            )}
          </div>
          {renderFinalError && (
            <p className="font-sans text-xs text-[#c0392b] text-center">{renderFinalError}</p>
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
