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
  canManageMasterData: boolean
  userId: string
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
  canManageMasterData,
  userId,
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

  async function handleRenderGenerate(context: RenderContext) {
    setRenderResult({ status: 'loading' })
    const result = await renderDesign(context)
    setRenderResult(result)
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
