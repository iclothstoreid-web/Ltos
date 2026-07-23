'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Consultation } from '@/app/workspace/check-in/types'
import type { Measurement } from '@/types'
import { decodeNotes as decodeMeasurementNotes } from '@/components/workspace/measurement/notesCodec'
import { EMPTY_FIELDS } from '@/components/workspace/measurement/types'
import { decodeDesignNotes } from '@/components/workspace/design-studio/notesCodec'
import { DEFAULT_SELECTIONS } from '@/components/workspace/design-studio/types'
import { createOrderFromConsultation, OrderValidationError } from '@/lib/order/createOrder'
import { TopNavBar } from './TopNavBar'
import { CustomerSummaryCard } from './CustomerSummaryCard'
import { MeasurementSummaryCard } from './MeasurementSummaryCard'
import { GarmentPreviewSection } from './GarmentPreviewSection'
import { ConsultationNotesCard } from './ConsultationNotesCard'
import { PriceSummaryCard } from './PriceSummaryCard'
import { ReadinessGauge } from './ReadinessGauge'
import { DecisionPanel } from './DecisionPanel'
import { ReviewFooter } from './ReviewFooter'
import { EstimationCard } from './EstimationCard'
import { DocumentUploader } from './DocumentUploader'
import {
  decodeFitterEnhancements,
  encodeFitterEnhancements,
  type FitterEnhancements,
} from './fitterEnhancementsCodec'
import { buildDesignSpecification } from '@/lib/designSpecification/buildSpecification'
import { decodeDesignSpecification, encodeDesignSpecification } from '@/lib/designSpecification/codec'
import type { MasterOptionsByCategory } from '@/lib/design/masterData'

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
    ...decodedMeasurement.extras,
  }
  const totalFields = Object.keys(EMPTY_FIELDS).length
  const filledCount = Object.values(measurementFields).filter(Boolean).length

  // Same read-only reuse of Design Studio's decoder.
  const designMarkerPresent = Boolean(
    consultation.notes && consultation.notes.includes('---LTOS_DESIGN_BLUEPRINT---')
  )
  const selections = { ...DEFAULT_SELECTIONS, ...decodeDesignNotes(consultation.notes) }

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
          <PriceSummaryCard />
          <EstimationCard
            supabase={supabase}
            value={enhancements.estimasiPengerjaan}
            saving={savingEnhancements}
            onChange={estimasiPengerjaan => persistEnhancements({ estimasiPengerjaan })}
          />
          <ReadinessGauge
            measurementComplete={readiness.measurementComplete}
            designComplete={readiness.designComplete}
          />
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
