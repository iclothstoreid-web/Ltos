import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { decodeDesignNotes } from '@/components/workspace/design-studio/notesCodec'
import { decodeCustomerDesignNote } from '@/lib/customerConsultation/customerNoteCodec'
import { decodeNotes } from '@/components/workspace/measurement/notesCodec'
import { EMPTY_FIELDS, type MeasurementFields } from '@/components/workspace/measurement/types'
import { fetchPublicDesignOptions } from '@/lib/customerConsultation/publicDesignOptions'
import { CustomerConsultationWorkspace } from '@/components/customer-consultation/CustomerConsultationWorkspace'
import { InvalidLinkPage } from '@/components/customer-consultation/InvalidLinkPage'

export const metadata: Metadata = {
  title: 'Isi Desain & Ukuran | Local Tailor',
  robots: { index: false, follow: false },
}

interface Props {
  params: { token: string }
}

interface SnapshotRow {
  consultation_number: string
  customer_name: string
  status: string
  updated_at: string
  link_completed_at: string | null
  notes: string | null
  measurement_chest: number | null
  measurement_shoulder: number | null
  measurement_sleeve: number | null
  measurement_length: number | null
  measurement_height_cm: number | null
  measurement_weight_kg: number | null
  measurement_age_years: number | null
  measurement_notes: string | null
}

// Public, unauthenticated entry point — the ONLY way this page identifies a
// consultation is p.token. No consultation id, no customer id, no fitter
// identity ever crosses the server/client boundary here: everything below
// this point that gets handed to <CustomerConsultationWorkspace> (a Client
// Component) is a small, hand-picked, already-decoded set of fields, never
// the raw `notes` blob get_customer_consultation_snapshot returns — Fitter
// Enhancements / Event Information marker blocks living in that same column
// are read by nothing here and therefore never reach the browser.
export default async function CustomerConsultationPage({ params }: Props) {
  const supabase = createPublicClient()

  const { data } = await supabase
    .rpc('get_customer_consultation_snapshot', { p_token: params.token })
    .maybeSingle<SnapshotRow>()

  if (!data) {
    return <InvalidLinkPage />
  }

  const firstName = data.customer_name.trim().split(/\s+/)[0] || data.customer_name

  const design = decodeDesignNotes(data.notes)
  const customerNote = decodeCustomerDesignNote(data.notes)

  // decodeNotes' `humanNotes` (a Fitter's own free-text remarks, if any
  // already exist on the latest measurement row) is deliberately discarded
  // here — "Jangan tampilkan catatan internal fitter" — only the structured
  // extras + the 4 real measurement columns are forwarded.
  const measurementDecoded = decodeNotes(data.measurement_notes)
  const measurementFields: MeasurementFields = {
    ...EMPTY_FIELDS,
    chest: data.measurement_chest?.toString() ?? '',
    shoulder: data.measurement_shoulder?.toString() ?? '',
    sleeve: data.measurement_sleeve?.toString() ?? '',
    length: data.measurement_length?.toString() ?? '',
    heightCm: data.measurement_height_cm?.toString() ?? '',
    weightKg: data.measurement_weight_kg?.toString() ?? '',
    ageYears: data.measurement_age_years?.toString() ?? '',
    ...measurementDecoded.extras,
  }

  const designOptions = await fetchPublicDesignOptions(supabase)

  return (
    <CustomerConsultationWorkspace
      token={params.token}
      customerFirstName={firstName}
      consultationNumber={data.consultation_number}
      linkCompleted={Boolean(data.link_completed_at)}
      initialUpdatedAt={data.updated_at}
      initialDesign={design}
      initialCustomerNote={customerNote}
      initialMeasurement={measurementFields}
      designOptions={designOptions}
    />
  )
}
