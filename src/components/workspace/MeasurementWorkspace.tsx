'use client'

import { useEffect, useState } from 'react'
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
import type { MeasurementFields, MeasurementKey, CuttingModel, WristFinishing, BasicBodyDataKey } from './measurement/types'
import { MEASUREMENT_BODY_MAP } from '@/lib/measurement/bodyMap'
import { buildCustomerDigitalProfile } from '@/lib/customerProfile/buildProfile'
import { decodeCustomerDigitalProfile, encodeCustomerDigitalProfile } from '@/lib/customerProfile/codec'
import { saveConsultationFields, recordMeasurementDecision, StaleConsultationError } from '@/lib/consultation/notesSave'

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
  const [supabase] = useState(() => createClient())

  const [decoded] = useState(() => decodeNotes(existingMeasurement?.notes ?? null))

  // Customer Digital Profile lives inside consultations.notes alongside the
  // human measurement notes — tracked separately here so the photo-upload
  // write (below) and the valid/remeasure write don't clobber each other.
  const [rawNotes, setRawNotes] = useState(consultation.notes ?? '')
  // PS-01.2 (Optimistic Conflict Protection) — see notesSave.ts. Advanced
  // after every successful consultations write this session; never
  // re-derived from the initial `consultation` prop.
  const [consultationUpdatedAt, setConsultationUpdatedAt] = useState(consultation.updated_at)
  const [saveConflictError, setSaveConflictError] = useState<string | null>(null)

  const [fields, setFields] = useState<MeasurementFields>({
    ...EMPTY_FIELDS,
    chest: existingMeasurement?.chest?.toString() || '',
    shoulder: existingMeasurement?.shoulder?.toString() || '',
    sleeve: existingMeasurement?.sleeve?.toString() || '',
    length: existingMeasurement?.length?.toString() || '',
    heightCm: existingMeasurement?.height_cm?.toString() || '',
    weightKg: existingMeasurement?.weight_kg?.toString() || '',
    ageYears: existingMeasurement?.age_years?.toString() || '',
    ...decoded.extras,
  })
  const [humanNotes, setHumanNotes] = useState(decoded.humanNotes)
  const [tags, setTags] = useState<string[]>(decoded.tags)
  const [focusedField, setFocusedField] = useState<MeasurementKey | null>(null)
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  // True only while PhotoUploader's upload+commit round-trip is in flight
  // (see onUploadStateChange below) — gates "Lanjut ke Design Studio" so a
  // fitter can't click through mid-upload.
  const [photoUploading, setPhotoUploading] = useState(false)

  // Restricted to the 12 canonical measurement keys (not cuttingModel /
  // wristFinishing, which live on the same `fields` object but represent a
  // separate required choice, not a body measurement) — Object.values(fields)
  // would otherwise over-count once those two are also selected.
  const totalFields = Object.keys(EMPTY_FIELDS).length
  const filledCount = (Object.keys(EMPTY_FIELDS) as MeasurementKey[]).filter(
    k => fields[k]
  ).length
  // Read from `rawNotes` (the committed, post-DB-write state — see
  // handlePhotoUploaded), never from PhotoUploader's own local
  // preview/capturedFrame state, so this reflects a photo that has actually
  // reached the source of truth (consultations.notes), not just one the
  // fitter has picked/captured on screen.
  const hasCommittedCustomerPhoto = Boolean(decodeCustomerDigitalProfile(rawNotes)?.customerPhoto)
  const isFormValid = Boolean(
    fields.chest && fields.shoulder && fields.sleeve && fields.length &&
    fields.cuttingModel && fields.wristFinishing &&
    hasCommittedCustomerPhoto && !photoUploading
  )

  // Fetch Strategy (STEP 5.3, prefetch) — consultation.id (the next route's
  // only parameter) is known from the moment this page loads, well before
  // the fitter finishes filling the form and taps "Lanjut Preview".
  // Prefetching here warms that navigation during the form-filling time
  // instead of at click time.
  //
  // SELL FIRST -> MEASURE AFTER: Measurement now comes after Design
  // Studio's Fase 1 (Configuration), so a validated measurement hands off
  // back to Design Studio — which, with both a saved blueprint and this
  // measurement now on record, opens straight into its Fase 2 (Final
  // Preview) instead of the configurator. See DesignStudioWorkspace's
  // `phase` computation and record_measurement_decision (Postgres) for the
  // status this decision writes.
  useEffect(() => {
    router.prefetch(`/workspace/design-studio/${consultation.id}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultation.id])

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

  const handleBasicBodyDataChange = (key: BasicBodyDataKey, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }))
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
    try {
      const newUpdatedAt = await saveConsultationFields(supabase, consultation.id, consultationUpdatedAt, {
        notes: nextNotes,
      })
      setConsultationUpdatedAt(newUpdatedAt)
      setRawNotes(nextNotes)
      setSaveConflictError(null)
    } catch (err) {
      console.error(err)
      setSaveConflictError(err instanceof StaleConsultationError ? err.message : null)
    }
  }

  async function handleDecision(decision: 'valid' | 'remeasure') {
    setLoading(true)
    setSaveConflictError(null)
    try {
      // Only chest/shoulder/sleeve/length are real columns on `measurements`
      // — the other 8 fields + body tags ride along inside `notes` (see
      // notesCodec.ts) since no schema change was authorized this sprint.
      const notes = encodeNotes(humanNotes, fields, tags)

      // PS-01.5 (Transaction Integrity) — measurements insert +
      // business_events insert + consultations status/notes update used to
      // be 3 separate network calls; a failure on the last one left an
      // orphaned measurement row with no completion/rejection event and a
      // status that never advanced. Now one RPC call, one transaction —
      // see record_measurement_decision() / notesSave.ts.
      let nextConsultationNotes: string | null = null
      if (decision === 'valid') {
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
        nextConsultationNotes = encodeCustomerDigitalProfile(rawNotes, profile)
      }

      const newUpdatedAt = await recordMeasurementDecision(supabase, {
        consultationId: consultation.id,
        decision,
        chest: parseFloat(fields.chest) || null,
        shoulder: parseFloat(fields.shoulder) || null,
        sleeve: parseFloat(fields.sleeve) || null,
        length: parseFloat(fields.length) || null,
        // Basic Body Data (Sprint M) — real columns, not notes-encoded (see
        // types.ts). A snapshot of the customer's condition at this
        // measurement session, not part of the sizing formula.
        heightCm: parseInt(fields.heightCm ?? '', 10) || null,
        weightKg: parseFloat(fields.weightKg ?? '') || null,
        ageYears: parseInt(fields.ageYears ?? '', 10) || null,
        measurementNotes: notes,
        eventData:
          decision === 'valid'
            ? { ...fields, tags, notes: humanNotes }
            : { reason: 'Ukuran perlu diulang', notes: humanNotes },
        nextConsultationNotes,
        expectedUpdatedAt: consultationUpdatedAt,
        createdBy: userId,
      })

      if (decision === 'valid') {
        router.push(`/workspace/design-studio/${consultation.id}`)
      } else {
        setConsultationUpdatedAt(newUpdatedAt)
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setSaveConflictError(err instanceof StaleConsultationError ? err.message : null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <MeasurementTopBar />
      <MeasurementNavAside />

      <main className="md:ml-64 pt-20 pb-32 min-h-screen">
        {saveConflictError && (
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-6">
            <div className="bg-[#fdecea] border-[0.5px] border-[#c0392b] p-3">
              <p className="font-sans text-xs font-bold text-[#c0392b] uppercase tracking-widest mb-1">
                Gagal Menyimpan
              </p>
              <p className="font-sans text-xs text-[#c0392b] leading-relaxed">{saveConflictError}</p>
            </div>
          </div>
        )}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-8 flex flex-col lg:flex-row gap-8">
          <MeasurementSidebar
            fields={fields}
            onFieldChange={handleFieldChange}
            onFocusField={setFocusedField}
            onBasicBodyDataChange={handleBasicBodyDataChange}
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
              onUploadStateChange={setPhotoUploading}
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
        photoUploading={photoUploading}
        onContinue={() => handleDecision('valid')}
        onRemeasure={() => handleDecision('remeasure')}
      />
    </div>
  )
}
