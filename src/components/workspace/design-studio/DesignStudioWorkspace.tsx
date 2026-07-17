'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Consultation } from '@/app/workspace/check-in/types'
import type { Measurement } from '@/types'
import { decodeNotes as decodeMeasurementNotes } from '@/components/workspace/measurement/notesCodec'
import { DesignStudioTopBar } from './DesignStudioTopBar'
import { GarmentBlueprintPanel } from './GarmentBlueprintPanel'
import { GarmentPreviewCanvas } from './GarmentPreviewCanvas'
import { OrderSummaryPanel } from './OrderSummaryPanel'
import { DesignStudioFooter } from './DesignStudioFooter'
import { DEFAULT_SELECTIONS, CATEGORY_BY_FIELD } from './types'
import type { DesignSelections } from './types'
import { encodeDesignNotes, decodeDesignNotes } from './notesCodec'
import { firstActiveOptionName } from '@/lib/design/masterData'
import type { MasterOptionsByCategory } from '@/lib/design/masterData'

interface DesignStudioWorkspaceProps {
  consultation: Consultation & { customers: { name: string; phone: string | null } }
  latestMeasurement: Measurement | null
  masterOptions: MasterOptionsByCategory
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
  latestMeasurement,
  masterOptions,
  canManageMasterData,
  userId,
}: DesignStudioWorkspaceProps) {
  const router = useRouter()
  const supabase = createClient()

  const [selections, setSelections] = useState<DesignSelections>(() =>
    buildInitialSelections(consultation.notes, masterOptions)
  )
  const [loading, setLoading] = useState(false)

  // `waist` isn't a real column on `measurements` — Measurement encodes it
  // into its own notes field (see measurement/notesCodec.ts). Reusing that
  // decoder (read-only import, no edits to Measurement) so the
  // chest-to-waist ratio below reflects a real saved value when present.
  const waistFromMeasurement = latestMeasurement?.notes
    ? parseFloat(decodeMeasurementNotes(latestMeasurement.notes).extras.waist || '')
    : NaN

  const handleChange = (key: keyof DesignSelections, value: string) => {
    setSelections(prev => ({ ...prev, [key]: value }))
  }

  async function persist(nextStatus?: 'review') {
    setLoading(true)
    try {
      const notes = encodeDesignNotes(consultation.notes || '', selections)

      await supabase
        .from('consultations')
        .update(nextStatus ? { notes, status: nextStatus } : { notes })
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
        <GarmentBlueprintPanel selections={selections} masterOptions={masterOptions} onChange={handleChange} />
        <GarmentPreviewCanvas
          selections={selections}
          shoulder={latestMeasurement?.shoulder ?? null}
          sleeve={latestMeasurement?.sleeve ?? null}
        />
        <OrderSummaryPanel
          selections={selections}
          chest={latestMeasurement?.chest ?? null}
          waist={Number.isNaN(waistFromMeasurement) ? null : waistFromMeasurement}
        />
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
