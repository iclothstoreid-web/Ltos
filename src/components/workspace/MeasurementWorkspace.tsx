'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Measurement, BusinessEvent } from '@/types'
import type { Consultation } from '@/app/workspace/check-in/types'
import { EventHistory } from './EventHistory'
import { MeasurementTopBar } from './measurement/MeasurementTopBar'
import { MeasurementNavAside } from './measurement/MeasurementNavAside'
import { MeasurementSidebar } from './measurement/MeasurementSidebar'
import { DigitalMannequin } from './measurement/DigitalMannequin'
import { BodyTagSelector } from './measurement/BodyTagSelector'
import { ProgressCard } from './measurement/ProgressCard'
import { SessionCard } from './measurement/SessionCard'
import { ComparisonCard } from './measurement/ComparisonCard'
import { PhotoUploader } from './measurement/PhotoUploader'
import { WorkflowFooter } from './measurement/WorkflowFooter'
import { encodeNotes, decodeNotes } from './measurement/notesCodec'
import { EMPTY_FIELDS, FIELD_BODY_PARTS } from './measurement/types'
import type { MeasurementFields, BodyPart } from './measurement/types'

interface MeasurementWorkspaceProps {
  consultation: Consultation & { customers: { name: string; phone: string | null } }
  existingMeasurement: Measurement | null
  events: BusinessEvent[]
  userId: string
  fitterName: string
}

export function MeasurementWorkspace({
  consultation,
  existingMeasurement,
  events,
  userId,
  fitterName,
}: MeasurementWorkspaceProps) {
  const router = useRouter()
  const supabase = createClient()

  const [decoded] = useState(() => decodeNotes(existingMeasurement?.notes ?? null))

  const [fields, setFields] = useState<MeasurementFields>({
    ...EMPTY_FIELDS,
    chest: existingMeasurement?.chest?.toString() || '',
    shoulder: existingMeasurement?.shoulder?.toString() || '',
    sleeve: existingMeasurement?.sleeve?.toString() || '',
    length: existingMeasurement?.length?.toString() || '',
    ...decoded.extras,
  })
  const [humanNotes, setHumanNotes] = useState(decoded.humanNotes)
  const [tags, setTags] = useState<string[]>(decoded.tags)
  const [focusedField, setFocusedField] = useState<keyof MeasurementFields | null>(null)
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const totalFields = Object.keys(EMPTY_FIELDS).length
  const filledCount = Object.values(fields).filter(Boolean).length
  const isFormValid = Boolean(fields.chest && fields.shoulder && fields.sleeve && fields.length)

  const activeParts: BodyPart[] = focusedField ? FIELD_BODY_PARTS[focusedField] : []

  const handleFieldChange = (key: keyof MeasurementFields, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  const handleToggleTag = (tag: string) => {
    setTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]))
  }

  async function handleDecision(decision: 'valid' | 'remeasure') {
    setLoading(true)
    try {
      // Only chest/shoulder/sleeve/length are real columns on `measurements`
      // — the other 8 fields + body tags ride along inside `notes` (see
      // notesCodec.ts) since no schema change was authorized this sprint.
      const notes = encodeNotes(humanNotes, fields, tags)

      await supabase.from('measurements').insert({
        consultation_id: consultation.id,
        chest: parseFloat(fields.chest) || null,
        shoulder: parseFloat(fields.shoulder) || null,
        sleeve: parseFloat(fields.sleeve) || null,
        length: parseFloat(fields.length) || null,
        notes,
      })

      if (decision === 'valid') {
        // emit_event() RPC only accepts p_order_id, so consultation-linked
        // events are inserted directly
        await supabase.from('business_events').insert({
          consultation_id: consultation.id,
          event_type: 'measurement.completed',
          event_data: { ...fields, tags, notes: humanNotes },
          created_by: userId,
        })

        // Hand off to Design Studio
        await supabase
          .from('consultations')
          .update({ status: 'design' })
          .eq('id', consultation.id)

        router.push(`/workspace/design-studio/${consultation.id}`)
      } else {
        // Re-measure: emit event and stay
        await supabase.from('business_events').insert({
          consultation_id: consultation.id,
          event_type: 'measurement.rejected',
          event_data: { reason: 'Ukuran perlu diulang', notes: humanNotes },
          created_by: userId,
        })

        await supabase
          .from('consultations')
          .update({ status: 'measurement' })
          .eq('id', consultation.id)

        router.refresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <MeasurementTopBar />
      <MeasurementNavAside />

      <main className="md:ml-64 pt-20 pb-32 min-h-screen">
        <div className="max-w-[1440px] mx-auto px-16 py-8 flex flex-col lg:flex-row gap-8">
          <MeasurementSidebar
            fields={fields}
            onFieldChange={handleFieldChange}
            onFocusField={setFocusedField}
          />

          <section className="w-full lg:w-[45%] flex flex-col items-center">
            <DigitalMannequin
              activeParts={activeParts}
              shoulder={fields.shoulder}
              chest={fields.chest}
              waist={fields.waist}
              hip={fields.hip}
              sleeve={fields.sleeve}
            />

            <div className="w-full px-4 mt-4">
              <BodyTagSelector selected={tags} onToggle={handleToggleTag} />

              <div className="mt-8">
                <label className="font-sans text-xs uppercase tracking-widest text-[#444748] block mb-2">
                  Catatan Fitter
                </label>
                <textarea
                  value={humanNotes}
                  onChange={e => setHumanNotes(e.target.value)}
                  rows={3}
                  placeholder="Preferensi fit, bentuk tubuh khusus, permintaan customer..."
                  className="w-full border-[0.5px] border-[#c4c7c7] bg-white/50 p-4 font-sans text-sm
                             text-[#151c27] outline-none focus:border-[#775a19] transition-colors resize-none"
                />
              </div>

              {(tags.length > 0 || humanNotes) && (
                <div className="text-center p-6 border-[0.5px] border-[#c4c7c7] bg-white/50 mt-8">
                  <p className="font-sans text-xs uppercase tracking-widest text-[#444748] mb-2">
                    Profile Summary
                  </p>
                  <p className="font-caslon italic text-[#151c27]">
                    &ldquo;{tags.join(', ') || humanNotes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="w-full lg:w-[25%] flex flex-col gap-8">
            <ProgressCard filled={filledCount} total={totalFields} />
            <SessionCard sessionId={consultation.consultation_number} fitterName={fitterName} />
            {existingMeasurement?.chest != null && (
              <ComparisonCard label="Chest" current={fields.chest} previous={existingMeasurement.chest} />
            )}
            <PhotoUploader />

            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="font-sans text-xs text-[#444748] uppercase tracking-widest
                           flex items-center gap-2 hover:text-[#151c27] transition-colors"
              >
                Riwayat · {events.length} event
                <span className="text-xs">{showHistory ? '▲' : '▼'}</span>
              </button>
              {showHistory && <EventHistory events={events} />}
            </div>
          </section>
        </div>
      </main>

      <WorkflowFooter
        customerName={consultation.customers.name}
        sessionId={consultation.consultation_number}
        filled={filledCount}
        total={totalFields}
        statusLabel={filledCount === totalFields ? 'Ready for Design' : 'In Progress'}
        primaryDisabled={!isFormValid}
        loading={loading}
        onContinue={() => handleDecision('valid')}
        onRemeasure={() => handleDecision('remeasure')}
      />
    </div>
  )
}
