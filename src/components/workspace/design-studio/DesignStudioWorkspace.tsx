'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Consultation } from '@/app/workspace/check-in/types'
import { DesignStudioTopBar } from './DesignStudioTopBar'
import { GarmentBlueprintPanel } from './GarmentBlueprintPanel'
import { AIPreviewPanel } from './AIPreviewPanel'
import { DesignSummaryPanel } from './DesignSummaryPanel'
import { DesignStudioFooter } from './DesignStudioFooter'
import { FinalPreviewFooter } from './FinalPreviewFooter'
import { DEFAULT_SELECTIONS, CATEGORY_BY_FIELD, OPTIONAL_FIELDS, NONE_SELECTION } from './types'
import type { DesignSelections } from './types'
import { encodeDesignNotes, decodeDesignNotes, hasDesignBlueprint } from './notesCodec'
import { encodeFabricQuantity, decodeFabricQuantity } from './fabricQuantityCodec'
import { firstActiveOptionName } from '@/lib/design/masterData'
import type { MasterOptionsByCategory } from '@/lib/design/masterData'
import { buildDesignSpecification } from '@/lib/designSpecification/buildSpecification'
import { encodeDesignSpecification, decodeDesignSpecification } from '@/lib/designSpecification/codec'
import { decodeCustomerDigitalProfile } from '@/lib/customerProfile/codec'
import type { RenderContext } from '@/lib/customerProfile/renderContext'
import type { RenderResult } from '@/lib/types/render'
import { renderDesign } from '@/lib/services/renderService'
import { saveRenderFinal, approveRenderFinal, uploadRenderFinalFile, uploadRenderFinalFromDataUrl } from '@/lib/design/renderFinal'
import type { RenderFinal } from '@/lib/design/renderFinal'
import { saveDesignSelections, StaleConsultationError } from '@/lib/consultation/notesSave'

interface MaterialStockInfo {
  available_stock: number
  min_stock: number
  unit: string
}

interface DesignStudioWorkspaceProps {
  consultation: Consultation & { customers: { name: string; phone: string | null } }
  masterOptions: MasterOptionsByCategory
  materialStock: Record<string, MaterialStockInfo>
  // Architecture Lock: DNA Color Repository + Material Color Mapping —
  // material_id -> the dna_color_id[] that Material actually comes in (via
  // material_colors). Scopes Warna Bahan to the selected Fabric's real,
  // supplier-backed colors; see GarmentBlueprintPanel.
  materialColorDnaIds: Record<string, string[]>
  // Color UI (2026-08-08) — Supplier Color Code per (material, dna_color)
  // pair, keyed `${material_id}:${dna_color_id}`; display-only, passed
  // straight through to GarmentBlueprintPanel/ColorSelector.
  supplierColorCodeByMaterialAndColor: Record<string, string>
  canManageMasterData: boolean
  userId: string
  // Render Final Storage — null when this consultation has never had a
  // render saved yet (see page.tsx's server-side fetchRenderFinal).
  initialRenderFinal: RenderFinal | null
  // Store Private, Access by Signed URL — a fresh, short-TTL signed URL
  // minted server-side at page load (page.tsx), or null if there's no
  // Render Final yet / signing failed. Never persisted; see
  // renderFinal.ts's own doc comment.
  initialPreviewUrl: string | null
  // Design Studio Phase Detection — does `measurements` already have a row
  // for this consultation (page.tsx, existence-only query). Combined with
  // hasDesignBlueprint(consultation.notes) to compute the initial phase —
  // see the `phase` comment below for the full rule.
  hasMeasurement: boolean
}

// For any field with no saved value yet (new consultation), default
// mandatory fields to the first active option of their master data category
// (keeps the DB the single source of truth for pilihan values); optional
// fields (see OPTIONAL_FIELDS) default to the (None) sentinel instead —
// "None" is a deliberate customer choice, never something to pre-pick a
// priced option for on their behalf.
function buildInitialSelections(
  savedNotes: string | null,
  masterOptions: MasterOptionsByCategory
): DesignSelections {
  const decoded = decodeDesignNotes(savedNotes)
  const fallback = { ...DEFAULT_SELECTIONS }
  ;(Object.keys(fallback) as Array<keyof DesignSelections>).forEach(field => {
    fallback[field] = OPTIONAL_FIELDS.has(field)
      ? NONE_SELECTION
      : firstActiveOptionName(masterOptions[CATEGORY_BY_FIELD[field]])
  })
  return { ...fallback, ...decoded }
}

export function DesignStudioWorkspace({
  consultation,
  masterOptions,
  materialStock,
  materialColorDnaIds,
  supplierColorCodeByMaterialAndColor,
  canManageMasterData,
  userId,
  initialRenderFinal,
  initialPreviewUrl,
  hasMeasurement,
}: DesignStudioWorkspaceProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const [selections, setSelections] = useState<DesignSelections>(() =>
    buildInitialSelections(consultation.notes, masterOptions)
  )

  // Design Studio Phase Detection — 'design' is the exact status
  // record_measurement_decision's valid branch writes (see
  // supabase/migrations/20260903000400_correct_measurement_handoff_to_
  // design_studio.sql), so status alone can't distinguish "measurement just
  // finished, Fase 1 was already saved" (new flow — open Fase 2) from "a
  // pre-flow-reversal consultation that measured before ever touching
  // Design Studio" (6 real rows in production as of this sprint — open
  // Fase 1, there is nothing to preview yet). hasDesignBlueprint(notes) is
  // what actually tells the two apart, since it's only ever true once
  // persist() has run at least once. Every other status (check_in,
  // waiting_measurement, measurement, review, order_created — e.g. the
  // "Edit Desain" link from Consultation Review, which always wants the
  // configurator) always gets Fase 1, unchanged from before this sprint.
  // Computed once from server-loaded props, not re-derived on every
  // consultation.notes change, so mid-session edits never flip the phase
  // out from under the fitter — a fresh page load (refresh, or arriving via
  // a fresh navigation) is the only way phase changes, which is exactly
  // the "safe on refresh" behavior the flow needs.
  const [phase] = useState<'configuration' | 'final-preview'>(() =>
    consultation.status === 'design' && hasMeasurement && hasDesignBlueprint(consultation.notes)
      ? 'final-preview'
      : 'configuration'
  )

  // "Edit Desain" from Consultation Review (GarmentPreviewSection) is the
  // ONLY way into Design Studio at status 'review' — resume routing sends
  // 'review' straight to Consultation Review otherwise. In that case the
  // configurator still shows (so selections can be changed), but the
  // primary footer action must SAVE AND RETURN to Consultation Review, not
  // push the consultation back into Measurement the way the forward flow
  // (a brand-new consultation at 'check_in') does. Computed once from the
  // server-loaded status, same as `phase`.
  const [isEditFromReview] = useState(() => consultation.status === 'review')

  // PS-01.2 (Optimistic Conflict Protection) — `persist()` used to re-base
  // every encode on the initial `consultation.notes` prop (never refreshed),
  // so a second Save within the same session would silently discard
  // whatever any other section (Fitter Enhancements, Event Information —
  // see notesSave.ts) had written to the row in between, even without
  // another user involved. `rawNotes` now tracks the last confirmed DB
  // value the same way ConsultationReviewWorkspace/MeasurementWorkspace
  // already do, and `consultationUpdatedAt` gates every write on it still
  // matching the live row.
  const [rawNotes, setRawNotes] = useState(consultation.notes ?? '')
  const [consultationUpdatedAt, setConsultationUpdatedAt] = useState(consultation.updated_at)
  const [saveConflictError, setSaveConflictError] = useState<string | null>(null)

  // Fetch Strategy (STEP 5.3, prefetch) — same reasoning as
  // MeasurementWorkspace: consultation.id is known from page load, well
  // before the fitter reaches this phase's own CTA. Which route to warm
  // depends on which phase is showing: Fase 1 (Configuration) hands off to
  // Measurement, Fase 2 (Final Preview) hands off to Consultation Review —
  // see resumeRouteForConsultation in check-in/types.ts and the `phase`
  // comment above for the full flow.
  useEffect(() => {
    router.prefetch(
      phase === 'final-preview' || isEditFromReview
        ? `/workspace/consultation-review/${consultation.id}`
        : `/workspace/measurement/${consultation.id}`
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultation.id, phase, isEditFromReview])
  const [notes, setNotes] = useState<string>(() => decodeDesignSpecification(consultation.notes)?.notes ?? '')
  // Sprint V1.2.1 (Fabric Quantity Input) — the Fitter's manual meter
  // estimate. Spec-only: Fitter no longer reserves/deducts stock (see
  // "Pindahkan Konsumsi Inventory ke Production"), this just travels into
  // the order snapshot so Production's Persiapan Bahan card can auto-fill.
  const [fabricQuantityMeters, setFabricQuantityMeters] = useState<number | null>(
    () => decodeFabricQuantity(consultation.notes).quantityMeters
  )
  const [loading, setLoading] = useState(false)
  // Last RenderContext built by "Generate Final Preview" — kept here (not
  // persisted) so a future AI Render sprint can diff
  // `renderContext.designSpecification.lastUpdated` against the live
  // specification below to flag "Preview Outdated" without any new state.
  const [renderContext, setRenderContext] = useState<RenderContext | null>(null)

  // Render result from AI Render Engine — holds image URL, tokens, error state
  // Updated by handleRenderGenerate; passed to AIPreviewPanel for display
  const [renderResult, setRenderResult] = useState<RenderResult>({ status: 'idle' })

  // Render Final Storage — the persisted Preview/Download/Replace/Approve
  // record for this consultation (render_finals table). Starts from the
  // server-fetched row (or null); updated locally after every successful
  // save so the UI never needs a round-trip refetch to reflect its own write.
  const [renderFinal, setRenderFinal] = useState<RenderFinal | null>(initialRenderFinal)
  const [renderFinalBusy, setRenderFinalBusy] = useState(false)
  const [renderFinalError, setRenderFinalError] = useState<string | null>(null)
  // Store Private, Access by Signed URL (Final Security Refactor,
  // 2026-08-07) — the bucket is private and render_finals only stores a
  // Storage path, so this is the ONE piece of client state that holds an
  // actually-displayable URL, always freshly minted (never derived from
  // renderFinal.render_storage_path directly) and never sent anywhere for
  // persistence.
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl)

  // Read-only decode of the profile Measurement already built — Design
  // Studio never writes to it, only reads it for the Generate Final Preview
  // validation/RenderContext (see AIPreviewPanel).
  const customerDigitalProfile = useMemo(
    () => decodeCustomerDigitalProfile(consultation.notes),
    [consultation.notes]
  )

  // Existing (DB-persisted) specification, kept only to carry forward
  // `estimatedProductionSpeed` — that field is set in Consultation Review,
  // not here, so a fresh Design Studio session must not blank it out.
  const existingSpecification = useMemo(
    () => decodeDesignSpecification(consultation.notes),
    [consultation.notes]
  )

  // Live Design Specification — the single object both the Design Summary
  // Panel and Generate Final Preview read from, so they can never drift out
  // of sync with each other or with what persist() saves below.
  const liveSpecification = useMemo(
    () =>
      buildDesignSpecification({
        consultationId: consultation.id,
        selections,
        masterOptions,
        notes,
        existingSpecification,
      }),
    [consultation.id, selections, masterOptions, notes, existingSpecification]
  )

  const handleChange = (key: keyof DesignSelections, value: string) => {
    setSelections(prev => ({ ...prev, [key]: value }))
  }

  async function persist(nextStatus?: 'measurement' | 'review') {
    setLoading(true)
    try {
      let notesToSave = encodeDesignNotes(rawNotes, selections)

      // Design Specification Builder — every Save/Continue keeps this
      // permanent, ID-backed object up to date; it never waits for Create
      // Order. Reuses the same live object the Design Summary Panel already
      // shows, so what's on screen and what gets saved are guaranteed
      // identical.
      notesToSave = encodeDesignSpecification(notesToSave, liveSpecification)
      notesToSave = encodeFabricQuantity(notesToSave, { quantityMeters: fabricQuantityMeters })

      // PS-01.5 (Transaction Integrity) — used to be a separate
      // consultations UPDATE followed by a business_events INSERT; a
      // failure on the event insert after the notes update already
      // committed silently lost the audit trail with no retry signal. Now
      // one RPC call, one transaction — see saveDesignSelections() /
      // notesSave.ts.
      const newUpdatedAt = await saveDesignSelections(supabase, {
        consultationId: consultation.id,
        notes: notesToSave,
        nextStatus: nextStatus ?? null,
        eventType: nextStatus
          ? nextStatus === 'review'
            ? 'design.updated'
            : 'design.completed'
          : 'design.saved',
        eventData: { ...selections },
        expectedUpdatedAt: consultationUpdatedAt,
        createdBy: userId,
      })
      setConsultationUpdatedAt(newUpdatedAt)
      setRawNotes(notesToSave)
      setSaveConflictError(null)

      if (nextStatus) {
        router.push(
          nextStatus === 'review'
            ? `/workspace/consultation-review/${consultation.id}`
            : `/workspace/measurement/${consultation.id}`
        )
      }
    } catch (err) {
      console.error(err)
      setSaveConflictError(err instanceof StaleConsultationError ? err.message : null)
    } finally {
      setLoading(false)
    }
  }

  // Fase 2 (Final Preview) exit — reuses save_design_selections exactly
  // like persist() above (same optimistic-lock + one-transaction guarantee,
  // no new RPC needed since p_next_status/p_event_type were always free
  // parameters). Notes are re-sent unchanged: Fase 2 never edits
  // selections/spec, only decides whether an AI render was generated.
  // Reached from both "Lewatkan" and a successful "Generate Final Preview"
  // (see handleRenderGenerate below) — either way the consultation is now
  // ready for Consultation Review.
  async function advanceToReview(eventType: 'design.final_preview_skipped' | 'design.final_preview_generated', eventData: Record<string, unknown>) {
    setLoading(true)
    try {
      const newUpdatedAt = await saveDesignSelections(supabase, {
        consultationId: consultation.id,
        notes: rawNotes,
        nextStatus: 'review',
        eventType,
        eventData,
        expectedUpdatedAt: consultationUpdatedAt,
        createdBy: userId,
      })
      setConsultationUpdatedAt(newUpdatedAt)
      setSaveConflictError(null)
      router.push(`/workspace/consultation-review/${consultation.id}`)
    } catch (err) {
      console.error(err)
      setSaveConflictError(err instanceof StaleConsultationError ? err.message : null)
    } finally {
      setLoading(false)
    }
  }

  function handleSkipFinalPreview() {
    advanceToReview('design.final_preview_skipped', {})
  }

  // Store Private, Access by Signed URL — the ONE place this component asks
  // for a fresh signed URL (via the server-side route, never minted
  // client-side directly). Called after every write that changes which
  // Storage object is current (Generate, Replace) so Preview reflects the
  // new image immediately, without waiting for a page reload.
  async function refreshPreviewUrl(): Promise<string | null> {
    try {
      const res = await fetch('/api/design/render-final/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId: consultation.id }),
      })
      const data = await res.json()
      const url = res.ok && data.success ? (data.signedUrl as string) : null
      setPreviewUrl(url)
      return url
    } catch {
      setPreviewUrl(null)
      return null
    }
  }

  async function handleRenderGenerate(context: RenderContext) {
    // Render Request Lock (Sprint O, Task 1) — guards against a double
    // click even before the network round-trip: while renderResult.status
    // is already 'loading', a second call here would just overwrite it
    // with another 'loading' and fire a second request. AIPreviewPanel's
    // button is also disabled during 'loading' (defense in depth); this
    // guard covers any other caller of onGenerate.
    if (renderResult.status === 'loading') return
    setRenderResult({ status: 'loading' })
    const result = await renderDesign(context, { consultationId: consultation.id })
    setRenderResult(result)

    // Render Final Storage — a successful AI render is auto-saved as the
    // consultation's current Render Final (always 'draft'; an Owner
    // reviews and Approves separately below). Failure here never blocks or
    // rolls back the render itself — the AI Preview above already
    // succeeded (renderResult.imageUrl, a data: URI, displays immediately
    // regardless — see AIPreviewPanel) — only the persisted
    // Preview/Download/Replace/Approve record failed to save.
    //
    // The render API returns the finished image as a data: URI (gpt-image-1
    // never returns a fetchable URL — see image.ts), so it has to be
    // uploaded into the private render-finals bucket before there's
    // anything to save a path for; this is Render Final storage's own
    // responsibility, not a change to the AI pipeline that produced the
    // bytes in the first place.
    if (result.status === 'success' && result.imageUrl) {
      setRenderFinalError(null)
      try {
        const path = await uploadRenderFinalFromDataUrl(supabase, {
          consultationId: consultation.id,
          dataUrl: result.imageUrl,
        })
        const saved = await saveRenderFinal(supabase, {
          consultationId: consultation.id,
          customerPhotoUrl: context.customerDigitalProfile.customerPhoto!.url,
          renderStoragePath: path,
        })
        setRenderFinal(saved)
        await refreshPreviewUrl()
      } catch (err) {
        setRenderFinalError(err instanceof Error ? err.message : 'Gagal menyimpan Render Final.')
      }

      // Fase 2 exit — the AI render itself succeeded (independent of
      // whether the Render Final record above also saved, same "never
      // blocks" philosophy as that try/catch), so this consultation is done
      // with Final Preview and moves on to Consultation Review. Guarded on
      // phase defensively: AIPreviewPanel (and therefore this handler) is
      // only ever reachable while phase === 'final-preview' since Fase 1
      // doesn't render it, but this keeps the transition co-located with
      // the one caller it's actually meant for instead of relying on that.
      if (phase === 'final-preview') {
        await advanceToReview('design.final_preview_generated', { renderId: result.renderId ?? null })
      }
    }
  }

  // Manual Replace — uploads to the render-finals bucket (fixed path,
  // always overwrites) then saves the new path as this consultation's
  // Render Final, same as a fresh AI render (resets to 'draft').
  async function handleReplaceRenderFinal(file: File) {
    const customerPhotoUrl = customerDigitalProfile?.customerPhoto?.url
    if (!customerPhotoUrl) {
      setRenderFinalError('Foto pelanggan belum tersedia — tidak dapat menyimpan Render Final.')
      return
    }
    setRenderFinalBusy(true)
    setRenderFinalError(null)
    try {
      const path = await uploadRenderFinalFile(supabase, { consultationId: consultation.id, file })
      const saved = await saveRenderFinal(supabase, { consultationId: consultation.id, customerPhotoUrl, renderStoragePath: path })
      setRenderFinal(saved)
      await refreshPreviewUrl()
    } catch (err) {
      setRenderFinalError(err instanceof Error ? err.message : 'Gagal mengganti Render Final.')
    } finally {
      setRenderFinalBusy(false)
    }
  }

  // Owner's explicit sign-off — the only place render_status becomes
  // 'approved'. Doesn't touch the image itself, so no signed URL refresh
  // needed.
  async function handleApproveRenderFinal() {
    if (!renderFinal) return
    setRenderFinalBusy(true)
    setRenderFinalError(null)
    try {
      await approveRenderFinal(supabase, consultation.id)
      setRenderFinal({ ...renderFinal, render_status: 'approved' })
    } catch (err) {
      setRenderFinalError(err instanceof Error ? err.message : 'Gagal meng-approve Render Final.')
    } finally {
      setRenderFinalBusy(false)
    }
  }

  // Download — per the brief's own workflow diagram, Download mints its
  // OWN fresh signed URL (not necessarily the same one Preview is
  // currently showing), fetches the bytes, and triggers a browser
  // download. Fetch-as-blob rather than a plain <a download>: a signed
  // Storage URL is a different origin, where the `download` attribute is
  // not reliably honored without the right Content-Disposition header.
  async function handleDownloadRenderFinal() {
    setRenderFinalBusy(true)
    setRenderFinalError(null)
    try {
      const res = await fetch('/api/design/render-final/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId: consultation.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Gagal membuat Signed URL untuk Download.')

      const blob = await (await fetch(data.signedUrl)).blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `render-final-${Date.now()}.${blob.type.split('/')[1] || 'png'}`
      link.click()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      setRenderFinalError(err instanceof Error ? err.message : 'Gagal mengunduh Render Final.')
    } finally {
      setRenderFinalBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27] selection:bg-[#ffdea5] selection:text-[#261900]">
      <DesignStudioTopBar
        sessionLabel={consultation.consultation_number}
        canManageMasterData={canManageMasterData}
      />

      {saveConflictError && (
        <div className="pt-20 px-4 sm:px-8 lg:px-16">
          <div className="bg-[#fdecea] border-[0.5px] border-[#c0392b] p-3">
            <p className="font-sans text-xs font-bold text-[#c0392b] uppercase tracking-widest mb-1">
              Gagal Menyimpan
            </p>
            <p className="font-sans text-xs text-[#c0392b] leading-relaxed">{saveConflictError}</p>
          </div>
        </div>
      )}
      {/* Fase 1 (Configuration) shows the configurator + a live summary;
          Fase 2 (Final Preview) locks configuration — no going back to the
          configurator step per the flow spec — and shows only the AI
          Preview + the same summary, now read-only since nothing in
          `selections` changes here. Both phases reuse GarmentBlueprintPanel/
          AIPreviewPanel/DesignSummaryPanel exactly as they already existed;
          only which ones render, and the fixed lg:w-[X%] gap the missing
          one would have filled, changes here. */}
      <main
        className={`${saveConflictError ? 'pt-4' : 'pt-20'} pb-44 lg:pb-32 w-full flex flex-col lg:h-screen lg:flex-row lg:overflow-hidden lg:justify-center`}
      >
        {phase === 'configuration' && (
          <GarmentBlueprintPanel
            selections={selections}
            masterOptions={masterOptions}
            materialStock={materialStock}
            materialColorDnaIds={materialColorDnaIds}
            supplierColorCodeByMaterialAndColor={supplierColorCodeByMaterialAndColor}
            onChange={handleChange}
            notes={notes}
            onNotesChange={setNotes}
            fabricQuantityMeters={fabricQuantityMeters}
            onFabricQuantityChange={setFabricQuantityMeters}
          />
        )}
        {phase === 'final-preview' && (
          <AIPreviewPanel
            customerDigitalProfile={customerDigitalProfile}
            designSpecification={liveSpecification}
            renderContext={renderContext}
            onGenerate={handleRenderGenerate}
            renderResult={renderResult}
            renderFinal={renderFinal}
            previewUrl={previewUrl}
            renderFinalBusy={renderFinalBusy}
            renderFinalError={renderFinalError}
            onReplaceRenderFinal={handleReplaceRenderFinal}
            onApproveRenderFinal={handleApproveRenderFinal}
            onDownloadRenderFinal={handleDownloadRenderFinal}
          />
        )}
        <DesignSummaryPanel specification={liveSpecification} selections={selections} />
      </main>

      {phase === 'configuration' ? (
        <DesignStudioFooter
          selections={selections}
          colorOptions={masterOptions.warna_bahan}
          loading={loading}
          onSave={() => persist()}
          onContinue={() => persist(isEditFromReview ? 'review' : 'measurement')}
          continueLabel={isEditFromReview ? 'Simpan & Kembali ke Tinjauan' : 'Lanjut Pengukuran'}
        />
      ) : (
        <FinalPreviewFooter
          disabled={loading || renderResult.status === 'loading'}
          onSkip={handleSkipFinalPreview}
        />
      )}
    </div>
  )
}
