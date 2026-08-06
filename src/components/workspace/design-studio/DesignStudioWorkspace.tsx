'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Consultation } from '@/app/workspace/check-in/types'
import type { Measurement } from '@/types'
import { DesignStudioTopBar } from './DesignStudioTopBar'
import { GarmentBlueprintPanel } from './GarmentBlueprintPanel'
import { AIPreviewPanel } from './AIPreviewPanel'
import { DesignSummaryPanel } from './DesignSummaryPanel'
import { DesignStudioFooter } from './DesignStudioFooter'
import { DEFAULT_SELECTIONS, CATEGORY_BY_FIELD, OPTIONAL_FIELDS, NONE_SELECTION } from './types'
import type { DesignSelections } from './types'
import { encodeDesignNotes, decodeDesignNotes } from './notesCodec'
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

interface MaterialStockInfo {
  available_stock: number
  min_stock: number
  unit: string
}

interface DesignStudioWorkspaceProps {
  consultation: Consultation & { customers: { name: string; phone: string | null } }
  latestMeasurement: Measurement | null
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
}: DesignStudioWorkspaceProps) {
  const router = useRouter()
  const supabase = createClient()

  const [selections, setSelections] = useState<DesignSelections>(() =>
    buildInitialSelections(consultation.notes, masterOptions)
  )
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

  async function persist(nextStatus?: 'review') {
    setLoading(true)
    try {
      let notesToSave = encodeDesignNotes(consultation.notes || '', selections)

      // Design Specification Builder — every Save/Continue keeps this
      // permanent, ID-backed object up to date; it never waits for Create
      // Order. Reuses the same live object the Design Summary Panel already
      // shows, so what's on screen and what gets saved are guaranteed
      // identical.
      notesToSave = encodeDesignSpecification(notesToSave, liveSpecification)
      notesToSave = encodeFabricQuantity(notesToSave, { quantityMeters: fabricQuantityMeters })

      await supabase
        .from('consultations')
        .update(nextStatus ? { notes: notesToSave, status: nextStatus } : { notes: notesToSave })
        .eq('id', consultation.id)

      // emit_event() RPC only accepts p_order_id — consultation-linked
      // events are inserted directly, same as Measurement's approach
      await supabase.from('business_events').insert({
        consultation_id: consultation.id,
        event_type: nextStatus ? 'design.completed' : 'design.saved',
        event_data: { ...selections },
        created_by: userId,
      })

      if (nextStatus) {
        router.push(`/workspace/consultation-review/${consultation.id}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
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

      <main className="pt-20 pb-44 lg:pb-32 w-full flex flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
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
        <DesignSummaryPanel specification={liveSpecification} selections={selections} />
      </main>

      <DesignStudioFooter
        selections={selections}
        colorOptions={masterOptions.warna_bahan}
        loading={loading}
        onSave={() => persist()}
        onContinue={() => persist('review')}
      />
    </div>
  )
}
