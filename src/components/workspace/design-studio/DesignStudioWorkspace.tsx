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
import { DEFAULT_SELECTIONS, CATEGORY_BY_FIELD } from './types'
import type { DesignSelections } from './types'
import { encodeDesignNotes, decodeDesignNotes } from './notesCodec'
import { firstActiveOptionName } from '@/lib/design/masterData'
import type { MasterOptionsByCategory } from '@/lib/design/masterData'
import { buildDesignSpecification } from '@/lib/designSpecification/buildSpecification'
import { encodeDesignSpecification, decodeDesignSpecification } from '@/lib/designSpecification/codec'
import { decodeCustomerDigitalProfile } from '@/lib/customerProfile/codec'
import type { RenderContext } from '@/lib/customerProfile/renderContext'

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

// For any field with no saved value yet (new consultation), default to the
// first active option of its master data category rather than a hardcoded
// label — keeps the DB the single source of truth for pilihan values.
function buildInitialSelections(
  savedNotes: string | null,
  masterOptions: MasterOptionsByCategory
): DesignSelections {
  const decoded = decodeDesignNotes(savedNotes)
  const fallback = { ...DEFAULT_SELECTIONS }
  ;(Object.keys(fallback) as Array<keyof DesignSelections>).forEach(field => {
    fallback[field] = firstActiveOptionName(masterOptions[CATEGORY_BY_FIELD[field]])
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
  const [loading, setLoading] = useState(false)
  // Last RenderContext built by "Generate Final Preview" — kept here (not
  // persisted) so a future AI Render sprint can diff
  // `renderContext.designSpecification.lastUpdated` against the live
  // specification below to flag "Preview Outdated" without any new state.
  const [renderContext, setRenderContext] = useState<RenderContext | null>(null)

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

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27] selection:bg-[#ffdea5] selection:text-[#261900]">
      <DesignStudioTopBar
        sessionLabel={consultation.consultation_number}
        canManageMasterData={canManageMasterData}
      />

      <main className="pt-20 pb-32 h-screen w-full flex overflow-hidden">
        <GarmentBlueprintPanel
          selections={selections}
          masterOptions={masterOptions}
          materialStock={materialStock}
          onChange={handleChange}
          notes={notes}
          onNotesChange={setNotes}
        />
        <AIPreviewPanel
          customerDigitalProfile={customerDigitalProfile}
          designSpecification={liveSpecification}
          renderContext={renderContext}
          onGenerate={setRenderContext}
        />
        <DesignSummaryPanel specification={liveSpecification} />
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
