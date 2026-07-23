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
import { MeasurementPanel } from './measurement/MeasurementPanel'
import { BodyTagSelector } from './measurement/BodyTagSelector'
import { SingleSelectPanel } from './measurement/SingleSelectPanel'
import { ProgressCard } from './measurement/ProgressCard'
import { SessionCard } from './measurement/SessionCard'
import { ComparisonCard } from './measurement/ComparisonCard'
import { PhotoUploader } from './measurement/PhotoUploader'
import { WorkflowFooter } from './measurement/WorkflowFooter'
import { encodeNotes, decodeNotes } from './measurement/notesCodec'
import { EMPTY_FIELDS, FIELD_LABELS, CUTTING_MODEL_LABELS, WRIST_FINISHING_LABELS } from './measurement/types'
import type { MeasurementFields, MeasurementKey, CuttingModel, WristFinishing } from './measurement/types'
import { MEASUREMENT_BODY_MAP } from '@/lib/measurement/bodyMap'
import { buildCustomerDigitalProfile } from '@/lib/customerProfile/buildProfile'
import { decodeCustomerDigitalProfile, encodeCustomerDigitalProfile } from '@/lib/customerProfile/codec'

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

  // Customer Digital Profile lives inside consultations.notes alongside the
  // human measurement notes — tracked separately here so the photo-upload
  // write (below) and the valid/remeasure write don't clobber each other.
  const [rawNotes, setRawNotes] = useState(consultation.notes ?? '')

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
  const [focusedField, setFocusedField] = useState<MeasurementKey | null>(null)
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Restricted to the 12 canonical measurement keys (not cuttingModel /
  // wristFinishing, which live on the same `fields` object but represent a
  // separate required choice, not a body measurement) — Object.values(fields)
  // would otherwise over-count once those two are also selected.
  const totalFields = Object.keys(EMPTY_FIELDS).length
  const filledCount = (Object.keys(EMPTY_FIELDS) as MeasurementKey[]).filter(
    k => fields[k]
  ).length
  const isFormValid = Boolean(
    fields.chest && fields.shoulder && fields.sleeve && fields.length &&
    fields.cuttingModel && fields.wristFinishing
  )

  // Body Map is the source of truth for which part(s) glow — see
  // src/lib/measurement/bodyMap.ts
  const activeParts = focusedField ? MEASUREMENT_BODY_MAP[focusedField] : []
  const activeLabel = focusedField
    ? { title: FIELD_LABELS[focusedField], value: fields[focusedField] ? `${fields[focusedField]} cm` : '' }
    : null

  const handleFieldChange = (key: MeasurementKey, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  const handleToggleTag = (tag: string) => {
    setTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]))
  }

  const handleCuttingModelChange = (value: CuttingModel) => {
    setFields(prev => ({ ...prev, cuttingModel: value }))
  }

  const handleWristFinishingChange = (value: WristFinishing) => {
    setFields(prev => ({ ...prev, wristFinishing: value }))
  }

  // Measurement is the single source of truth for the customer photo (no
  // more parallel capture in Consultation Review) — the moment an upload
  // succeeds, fold the URL straight into the Customer Digital Profile so it
  // never depends on the fitter also completing the measurement decision.
  async function handlePhotoUploaded(url: string) {
    const profile = buildCustomerDigitalProfile({
      consultationId: consultation.id,
      fields,
      bodyTags: tags,
      customerPhotoUrl: url,
      existingProfile: decodeCustomerDigitalProfile(rawNotes),
    })
    const nextNotes = encodeCustomerDigitalProfile(rawNotes, profile)
    const { error } = await supabase
      .from('consultations')
      .update({ notes: nextNotes })
      .eq('id', consultation.id)
    if (!error) setRawNotes(nextNotes)
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

        // Foundation for the future AI Render Engine (Sprint 3): derive the
        // permanent Customer Digital Profile from this measurement session
        // and persist it into the active consultation's notes alongside the
        // status handoff — no new table/column, same marker-block technique
        // as the other consultations.notes codecs.
        const profile = buildCustomerDigitalProfile({
          consultationId: consultation.id,
          fields,
          bodyTags: tags,
          measuredAt: new Date().toISOString(),
          existingProfile: decodeCustomerDigitalProfile(rawNotes),
        })
        const nextConsultationNotes = encodeCustomerDigitalProfile(rawNotes, profile)

        // Hand off to Design Studio
        await supabase
          .from('consultations')
          .update({ status: 'design', notes: nextConsultationNotes })
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
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-8 flex flex-col lg:flex-row gap-8">
          <MeasurementSidebar
            fields={fields}
            onFieldChange={handleFieldChange}
            onFocusField={setFocusedField}
          />

          <section className="w-full lg:w-[45%] flex flex-col items-center">
            <MeasurementPanel activeParts={activeParts} activeLabel={activeLabel} />

            <div className="w-full px-4 mt-4">
              <BodyTagSelector selected={tags} onToggle={handleToggleTag} />

              <div className="mt-8">
                <SingleSelectPanel
                  title="Cutting Model"
                  options={(Object.keys(CUTTING_MODEL_LABELS) as CuttingModel[]).map(value => ({
                    value,
                    label: CUTTING_MODEL_LABELS[value],
                  }))}
                  value={fields.cuttingModel}
                  onChange={handleCuttingModelChange}
                />
              </div>

              <div className="mt-6">
                <SingleSelectPanel
                  title="Finishing Pergelangan"
                  options={(Object.keys(WRIST_FINISHING_LABELS) as WristFinishing[]).map(value => ({
                    value,
                    label: WRIST_FINISHING_LABELS[value],
                  }))}
                  value={fields.wristFinishing}
                  onChange={handleWristFinishingChange}
                />
              </div>

              <div className="mt-8">
                <label className="font-sans text-xs uppercase tracking-widest text-[#444748] block mb-2">
                  Catatan Fitter
                </label>
                <textarea
                  value={humanNotes}
                  onChange={e => setHumanNotes(e.target.value)}
                  rows={3}
                  placeholder="Preferensi fit, bentuk tubuh khusus, permintaan pelanggan..."
                  className="w-full border-[0.5px] border-[#c4c7c7] bg-white/50 p-4 font-sans text-sm
                             text-[#151c27] outline-none focus:border-[#775a19] transition-colors resize-none"
                />
              </div>

              {(tags.length > 0 || humanNotes) && (
                <div className="text-center p-6 border-[0.5px] border-[#c4c7c7] bg-white/50 mt-8">
                  <p className="font-sans text-xs uppercase tracking-widest text-[#444748] mb-2">
                    Ringkasan Profil
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
              <ComparisonCard label="Lingkar Dada" current={fields.chest} previous={existingMeasurement.chest} />
            )}
            <PhotoUploader
              consultationId={consultation.id}
              initialPhotoUrl={decodeCustomerDigitalProfile(rawNotes)?.customerPhoto?.url ?? null}
              onUploaded={handlePhotoUploaded}
            />

            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="font-sans text-xs text-[#444748] uppercase tracking-widest
                           flex items-center gap-2 hover:text-[#151c27] transition-colors"
              >
                Riwayat · {events.length} aktivitas
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
        statusLabel={filledCount === totalFields ? 'Siap untuk Desain' : 'Sedang Berlangsung'}
        primaryDisabled={!isFormValid}
        loading={loading}
        onContinue={() => handleDecision('valid')}
        onRemeasure={() => handleDecision('remeasure')}
      />
    </div>
  )
}
