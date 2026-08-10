'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Consultation } from '@/app/workspace/check-in/types'
import type { Measurement } from '@/types'
import { decodeNotes as decodeMeasurementNotes } from '@/components/workspace/measurement/notesCodec'
import { BASIC_BODY_DATA_KEYS, EMPTY_FIELDS } from '@/components/workspace/measurement/types'
import { decodeDesignNotes } from '@/components/workspace/design-studio/notesCodec'
import { DEFAULT_SELECTIONS } from '@/components/workspace/design-studio/types'
import { decodeFabricQuantity } from '@/components/workspace/design-studio/fabricQuantityCodec'
import { createOrderFromConsultation, OrderValidationError } from '@/lib/order/createOrder'
import { TopNavBar } from './TopNavBar'
import { CustomerSummaryCard } from './CustomerSummaryCard'
import { MeasurementSummaryCard } from './MeasurementSummaryCard'
import { GarmentPreviewSection } from './GarmentPreviewSection'
import { ConsultationNotesCard } from './ConsultationNotesCard'
import { PriceSummaryCard } from './PriceSummaryCard'
import { CommercialTypeCard } from './CommercialTypeCard'
import { ReadinessGauge } from './ReadinessGauge'
import { DecisionPanel } from './DecisionPanel'
import { ReviewFooter } from './ReviewFooter'
import { EstimationCard } from './EstimationCard'
import { EventInformationCard } from './EventInformationCard'
import { EstimationValidationCard } from './EstimationValidationCard'
import { DocumentUploader } from './DocumentUploader'
import { OpenTransactionPrompt } from './OpenTransactionPrompt'
import { ExistingGarmentList } from './ExistingGarmentList'
import type { OpenTransactionForCustomer } from '@/lib/transaction/types'
import {
  decodeFitterEnhancements,
  encodeFitterEnhancements,
  type FitterEnhancements,
} from './fitterEnhancementsCodec'
import {
  decodeEventInformation,
  encodeEventInformation,
  type EventInformation,
} from './eventInformationCodec'
import { buildDesignSpecification } from '@/lib/designSpecification/buildSpecification'
import type { CommercialType } from '@/lib/commercial/commercialType'
import { decodeDesignSpecification, encodeDesignSpecification } from '@/lib/designSpecification/codec'
import type { MasterOptionsByCategory } from '@/lib/design/masterData'
import type { ServiceValidationResult } from '@/lib/order/service'
import { computeEstimationValidation } from '@/lib/order/estimationValidation'

// Distinguishes validation failures (OrderValidationError, thrown before
// any Supabase call — e.g. duplicate Create Order) from real Supabase/DB
// errors (PostgrestError-shaped: has `message` and usually `code`), so the
// user sees the actual cause instead of a silent no-op.
function describeOrderError(err: unknown): string {
  if (err instanceof OrderValidationError) {
    return err.field ? `${err.message} (Bidang: ${err.field})` : err.message
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const message = String((err as { message: unknown }).message)
    const code = 'code' in err ? String((err as { code?: unknown }).code) : null
    return code ? `Gagal membuat order (Supabase ${code}): ${message}` : `Gagal membuat order: ${message}`
  }
  return 'Gagal membuat order karena kesalahan tak terduga. Coba lagi atau hubungi admin.'
}

interface ConsultationReviewWorkspaceProps {
  consultation: Consultation & {
    customers: {
      id: string
      name: string
      phone: string | null
      address: string | null
      is_preferred_client: boolean
    }
  }
  latestMeasurement: Measurement | null
  masterOptions: MasterOptionsByCategory
  fitterName: string
  userId: string
}

export function ConsultationReviewWorkspace({
  consultation,
  latestMeasurement,
  masterOptions,
  fitterName,
  userId,
}: ConsultationReviewWorkspaceProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [approved, setApproved] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  // Fitter App sprint additions (Estimasi Pengerjaan / Referensi Customer) —
  // no new columns, encoded into consultations.notes via their own marker
  // block, same technique as Design Studio's blueprint block.
  const [rawNotes, setRawNotes] = useState(consultation.notes ?? '')
  const [enhancements, setEnhancements] = useState<FitterEnhancements>(() =>
    decodeFitterEnhancements(consultation.notes)
  )
  const [savingEnhancements, setSavingEnhancements] = useState(false)

  // Milestone 3 (Consultation Decision Engine): Event Information, same
  // notes-encoding technique, own marker block, coexists with the Fitter
  // Enhancements block above via rawNotes as the shared source of truth.
  const [eventInfo, setEventInfo] = useState<EventInformation>(() =>
    decodeEventInformation(consultation.notes)
  )
  const [savingEventInfo, setSavingEventInfo] = useState(false)
  const [serviceValidation, setServiceValidation] = useState<ServiceValidationResult | null>(null)

  // Milestone A (Commercial Type Engine) — carried into
  // createOrderFromConsultation below, locked in on the transaction at
  // Create Order time.
  const [commercialType, setCommercialType] = useState<CommercialType>('normal')

  // Milestone B (Multi-Garment, Scenario 4 — Returning Customer flow): the
  // Fitter always chooses whether this garment joins a running OPEN
  // transaction or starts a new one. `existingTransaction` stays null (and
  // createOrderFromConsultation gets no existingTransactionId) unless the
  // Fitter explicitly picks one from OpenTransactionPrompt below.
  const [existingTransaction, setExistingTransaction] = useState<OpenTransactionForCustomer | null>(null)
  const [transactionDecided, setTransactionDecided] = useState(false)

  function handleSelectExistingTransaction(transaction: OpenTransactionForCustomer) {
    setExistingTransaction(transaction)
    setTransactionDecided(true)
  }

  function handleCreateNewTransaction() {
    setExistingTransaction(null)
    setTransactionDecided(true)
  }

  async function persistEnhancements(patch: Partial<FitterEnhancements>) {
    const next = { ...enhancements, ...patch }
    setSavingEnhancements(true)
    try {
      let nextNotes = encodeFitterEnhancements(rawNotes, next)

      // Estimasi Pengerjaan just changed — refresh the Design Specification
      // (built during Design Studio) so its estimatedProductionSpeed field
      // picks it up too, same single-write pattern as the photo refresh
      // above. Pilihan/price snapshot are re-resolved from the current
      // `selections`/masterOptions, unchanged since Design Studio.
      if (patch.estimasiPengerjaan !== undefined) {
        const existingSpecification = decodeDesignSpecification(rawNotes)
        const specification = buildDesignSpecification({
          consultationId: consultation.id,
          selections,
          masterOptions,
          estimatedProductionSpeed: patch.estimasiPengerjaan,
          existingSpecification,
        })
        nextNotes = encodeDesignSpecification(nextNotes, specification)
      }

      const { error } = await supabase
        .from('consultations')
        .update({ notes: nextNotes })
        .eq('id', consultation.id)
      if (error) throw error
      setRawNotes(nextNotes)
      setEnhancements(next)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingEnhancements(false)
    }
  }

  async function persistEventInformation(patch: Partial<EventInformation>) {
    const next = { ...eventInfo, ...patch }
    setSavingEventInfo(true)
    try {
      const nextNotes = encodeEventInformation(rawNotes, next)
      const { error } = await supabase
        .from('consultations')
        .update({ notes: nextNotes })
        .eq('id', consultation.id)
      if (error) throw error
      setRawNotes(nextNotes)
      setEventInfo(next)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingEventInfo(false)
    }
  }

  // Reusing Measurement's own decoder (read-only import, no edits to
  // Measurement) to recover the 8 extra fields + body tags + fitter notes
  // that live inside measurements.notes.
  const decodedMeasurement = decodeMeasurementNotes(latestMeasurement?.notes ?? null)
  const measurementFields = {
    ...EMPTY_FIELDS,
    chest: latestMeasurement?.chest?.toString() || '',
    shoulder: latestMeasurement?.shoulder?.toString() || '',
    sleeve: latestMeasurement?.sleeve?.toString() || '',
    length: latestMeasurement?.length?.toString() || '',
    // Basic Body Data (Sprint M) — real columns on `measurements`, read the
    // same way as chest/shoulder/sleeve/length above (not via
    // decodedMeasurement.extras, which only covers the notes-encoded
    // fields). This is what carries height/weight/age into the order.created
    // snapshot -> get_production_packet's locked_measurements -> Pattern
    // Formulation/QC Reference/Order History.
    heightCm: latestMeasurement?.height_cm?.toString() || '',
    weightKg: latestMeasurement?.weight_kg?.toString() || '',
    ageYears: latestMeasurement?.age_years?.toString() || '',
    ...decodedMeasurement.extras,
  }
  const totalFields = Object.keys(EMPTY_FIELDS).length
  // Basic Body Data (heightCm/weightKg/ageYears) is deliberately excluded
  // from this count — it's a reference snapshot, not a required measurement
  // field, and counting it here would silently change the pre-Sprint-M
  // measurementComplete signal below (ReadinessGauge) for every order that
  // has it filled in.
  const filledCount = Object.entries(measurementFields).filter(
    ([key, value]) => !BASIC_BODY_DATA_KEYS.includes(key as (typeof BASIC_BODY_DATA_KEYS)[number]) && Boolean(value)
  ).length

  // Same read-only reuse of Design Studio's decoder.
  const designMarkerPresent = Boolean(
    consultation.notes && consultation.notes.includes('---LTOS_DESIGN_BLUEPRINT---')
  )
  const selections = { ...DEFAULT_SELECTIONS, ...decodeDesignNotes(consultation.notes) }

  // Sprint V1.2.1 (Fabric Quantity Input) — read-only reuse of Design
  // Studio's decoder, same technique as `selections` above. Snapshot-only
  // (see "Pindahkan Konsumsi Inventory ke Production"): carried into the
  // order.created snapshot via createOrderFromConsultation below, never
  // used to reserve/deduct stock from the Fitter side anymore.
  const fabricQuantityMeters = decodeFabricQuantity(consultation.notes).quantityMeters

  // Same frozen ID/price snapshot createOrderFromConsultation later carries
  // into the Order — PriceSummaryCard displays it read-only here, before an
  // Order (and therefore a persistable quotation) exists.
  const liveDesignSpecification = decodeDesignSpecification(rawNotes)

  // Milestone 3: pure comparison of the live Estimated Finish (already
  // fetched inside EstimationCard) against Target Usage Date. No new
  // estimation engine -- see estimationValidation.ts.
  const estimationValidationResult = computeEstimationValidation(
    serviceValidation,
    eventInfo.targetUsageDate,
    eventInfo.deadlineFlexibility
  )

  const readiness = {
    measurementComplete: filledCount === totalFields,
    designComplete: designMarkerPresent,
  }

  async function handleApprove() {
    setLoading(true)
    try {
      await supabase.from('business_events').insert({
        consultation_id: consultation.id,
        event_type: 'consultation.approved',
        event_data: { selections, measurementFields },
        created_by: userId,
      })
      setApproved(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateOrder() {
    setLoading(true)
    setOrderError(null)
    try {
      const { orderId } = await createOrderFromConsultation({
        supabase,
        consultation,
        measurementFields,
        bodyTags: decodedMeasurement.tags,
        humanNotes: decodedMeasurement.humanNotes,
        selections,
        // Frozen at Design Studio time (refreshed here whenever Estimasi
        // Pengerjaan changes) — carried into the Order snapshot as-is so a
        // future catalog price change can never alter this Order's total.
        designSpecification: decodeDesignSpecification(rawNotes),
        eventInformation: eventInfo,
        estimationValidation: estimationValidationResult,
        fabricQuantityMeters,
        commercialType,
        existingTransactionId: existingTransaction?.transaction_id ?? null,
        userId,
      })

      router.push(`/workspace/order-created/${orderId}`)
    } catch (err) {
      console.error(err)
      setOrderError(describeOrderError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-[#151c27] pb-32">
      <TopNavBar fitterInitial={fitterName.charAt(0).toUpperCase()} />

      {!transactionDecided && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-8">
          <OpenTransactionPrompt
            customerId={consultation.customers.id}
            consultationId={consultation.id}
            onSelectExisting={handleSelectExistingTransaction}
            onCreateNew={handleCreateNewTransaction}
          />
        </div>
      )}

      {existingTransaction && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-8">
          <ExistingGarmentList
            transactionNumber={existingTransaction.transaction_number}
            garments={existingTransaction.orders}
          />
        </div>
      )}

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-8 lg:py-16 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 flex flex-col gap-8">
          <CustomerSummaryCard
            customerName={consultation.customers.name}
            customerId={consultation.customers.id}
            isPreferred={consultation.customers.is_preferred_client}
            sessionNumber={consultation.consultation_number}
            fitterName={fitterName}
          />
          <MeasurementSummaryCard
            consultationId={consultation.id}
            filledCount={filledCount}
            totalCount={totalFields}
            bodyTags={decodedMeasurement.tags}
          />
        </aside>

        <article className="w-full md:w-[45%] flex flex-col gap-8">
          <GarmentPreviewSection consultationId={consultation.id} selections={selections} />
          <ConsultationNotesCard notes={decodedMeasurement.humanNotes} />
        </article>

        <aside className="w-full md:w-[30%] flex flex-col gap-8">
          <PriceSummaryCard priceSnapshot={liveDesignSpecification?.priceSnapshot ?? null} />
          <EventInformationCard
            value={eventInfo}
            saving={savingEventInfo}
            onChange={persistEventInformation}
          />
          <EstimationCard
            supabase={supabase}
            value={enhancements.estimasiPengerjaan}
            saving={savingEnhancements}
            onChange={estimasiPengerjaan => persistEnhancements({ estimasiPengerjaan })}
            onValidationChange={setServiceValidation}
          />
          <EstimationValidationCard
            result={estimationValidationResult}
            hasEstimasi={Boolean(enhancements.estimasiPengerjaan)}
            hasTargetDate={Boolean(eventInfo.targetUsageDate)}
          />
          <ReadinessGauge
            measurementComplete={readiness.measurementComplete}
            designComplete={readiness.designComplete}
          />
          <CommercialTypeCard value={commercialType} onChange={setCommercialType} />
          <DecisionPanel loading={loading} onCreateOrder={handleCreateOrder} onApprove={handleApprove} />
          {orderError && (
            <div className="bg-[#fdecea] border-[0.5px] border-[#c0392b] p-3">
              <p className="font-sans text-xs font-bold text-[#c0392b] uppercase tracking-widest mb-1">
                Gagal Membuat Pesanan
              </p>
              <p className="font-sans text-xs text-[#c0392b] leading-relaxed">{orderError}</p>
            </div>
          )}
          {approved && (
            <p className="text-center font-sans text-xs text-[#775a19]">
              Konsultasi telah disetujui.
            </p>
          )}
        </aside>
      </main>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pb-16 flex flex-col gap-8">
        <DocumentUploader
          consultationId={consultation.id}
          documents={enhancements.documents}
          onChange={documents => persistEnhancements({ documents })}
        />
      </section>

      <ReviewFooter
        customerName={consultation.customers.name}
        loading={loading}
        onContinue={handleCreateOrder}
      />
    </div>
  )
}
