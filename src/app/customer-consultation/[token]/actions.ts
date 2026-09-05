'use server'

import { createPublicClient } from '@/lib/supabase/public'
import { encodeDesignNotes, decodeDesignNotes } from '@/components/workspace/design-studio/notesCodec'
import type { DesignSelections } from '@/components/workspace/design-studio/types'
import { encodeCustomerDesignNote } from '@/lib/customerConsultation/customerNoteCodec'
import { encodeNotes, decodeNotes } from '@/components/workspace/measurement/notesCodec'
import { EMPTY_FIELDS, type MeasurementFields, type MeasurementKey } from '@/components/workspace/measurement/types'
import { fetchPublicDesignOptions, isValidSelection } from '@/lib/customerConsultation/publicDesignOptions'

// Server actions backing the /customer-consultation/[token] public flow.
// Everything here runs server-side (never bundled to the browser) and uses
// only the anon Supabase key — no service role, no elevated privileges.
// Every write goes through save_customer_consultation (Postgres,
// SECURITY DEFINER), which re-validates the token and re-checks
// customer_link_enabled itself; nothing here is trusted as a substitute for
// that DB-side check, only as a friendlier pre-check and payload sanitizer.

const DESIGN_FIELDS: (keyof DesignSelections)[] = [
  'model',
  'lookCutting',
  'fabric',
  'color',
  'collar',
  'cuff',
  'plaket',
  'pocket',
  'button',
  'embroidery',
  'handmadeZigzag',
]

const MEASUREMENT_KEYS: MeasurementKey[] = Object.keys(EMPTY_FIELDS) as MeasurementKey[]

export interface CustomerActionResult {
  success: boolean
  error: string | null
  conflict: boolean
  updatedAt: string | null
}

function isValidToken(token: string): boolean {
  // customer_consultation_token is always 64 lowercase-hex characters (two
  // concatenated UUIDs, see generate_customer_consultation_token() /
  // migration 20260913000000). Reject anything else before it ever reaches
  // a query.
  return /^[0-9a-f]{64}$/.test(token)
}

async function fetchRawForMerge(
  token: string
): Promise<{ notes: string | null; measurement_notes: string | null } | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .rpc('get_customer_consultation_snapshot', { p_token: token })
    .maybeSingle()

  if (error || !data) return null
  return data as { notes: string | null; measurement_notes: string | null }
}

function conflictFromError(message: string | undefined): boolean {
  return !!message && message.includes('sudah diubah oleh proses lain')
}

export async function saveCustomerDesign(
  token: string,
  selections: Partial<Record<keyof DesignSelections, string>>,
  customerNote: string,
  expectedUpdatedAt: string
): Promise<CustomerActionResult> {
  if (!isValidToken(token)) {
    return { success: false, error: 'Link tidak valid.', conflict: false, updatedAt: null }
  }

  const catalog = await fetchPublicDesignOptions(createPublicClient())

  // Whitelist: known DesignSelections keys only, each value re-checked
  // against the live active-options catalog for its own category — an
  // unrecognized/deactivated/wrong-category id is dropped rather than
  // written.
  const sanitized: Partial<Record<keyof DesignSelections, string>> = {}
  for (const field of DESIGN_FIELDS) {
    const value = selections[field]
    if (typeof value !== 'string' || value.length === 0 || value.length > 100) continue
    if (value === '__none__' || isValidSelection(catalog, field, value)) {
      sanitized[field] = value
    }
  }

  const raw = await fetchRawForMerge(token)
  if (!raw) {
    return { success: false, error: 'Link tidak valid atau sudah tidak aktif.', conflict: false, updatedAt: null }
  }

  const existingSelections = decodeDesignNotes(raw.notes)
  const mergedSelections = { ...existingSelections, ...sanitized } as DesignSelections
  let notes = encodeDesignNotes(raw.notes ?? '', mergedSelections)
  notes = encodeCustomerDesignNote(notes, (customerNote ?? '').slice(0, 500))

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .rpc('save_customer_consultation', {
      p_token: token,
      p_section: 'design',
      p_expected_updated_at: expectedUpdatedAt,
      p_design_notes: notes,
      p_design_event_data: { fields: Object.keys(sanitized) },
    })
    .maybeSingle()

  if (error || !data) {
    const conflict = conflictFromError(error?.message)
    return {
      success: false,
      error: conflict ? 'Data ini sudah diperbarui di perangkat lain. Muat ulang halaman.' : 'Gagal menyimpan desain. Coba lagi.',
      conflict,
      updatedAt: null,
    }
  }

  return { success: true, error: null, conflict: false, updatedAt: (data as { updated_at: string }).updated_at }
}

export async function saveCustomerMeasurement(
  token: string,
  fields: MeasurementFields,
  expectedUpdatedAt: string,
  markComplete: boolean
): Promise<CustomerActionResult> {
  if (!isValidToken(token)) {
    return { success: false, error: 'Link tidak valid.', conflict: false, updatedAt: null }
  }

  const raw = await fetchRawForMerge(token)
  if (!raw) {
    return { success: false, error: 'Link tidak valid atau sudah tidak aktif.', conflict: false, updatedAt: null }
  }

  // encodeNotes rebuilds its whole extras block from whatever MeasurementFields
  // object it's given — it does not merge with what was previously encoded.
  // cuttingModel/wristFinishing (Fitter-only decisions this flow never shows
  // the customer) live in that same extras block, so a save here must start
  // from the EXISTING decoded extras and only overlay the 12 canonical keys
  // the customer actually submitted, or an in-person session a Fitter
  // already started before sending the link would have those two fields
  // silently erased by the next customer save.
  const existingDecoded = decodeNotes(raw.measurement_notes)
  const sanitizedFields: MeasurementFields = { ...EMPTY_FIELDS, ...existingDecoded.extras }
  for (const key of MEASUREMENT_KEYS) {
    const value = fields[key]
    if (typeof value === 'string' && value.length <= 20) sanitizedFields[key] = value
  }

  const parseNum = (v: string | undefined): number | null => {
    const n = parseFloat(v ?? '')
    return Number.isFinite(n) ? n : null
  }
  const parseWhole = (v: string | undefined): number | null => {
    const n = parseInt(v ?? '', 10)
    return Number.isFinite(n) ? n : null
  }

  // Human notes/tags a Fitter may already have on the latest measurement row
  // are preserved as-is too — this flow never lets the customer write either.
  const measurementNotes = encodeNotes(existingDecoded.humanNotes, sanitizedFields, existingDecoded.tags)

  const filledCount = MEASUREMENT_KEYS.filter((k) => sanitizedFields[k]).length

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .rpc('save_customer_consultation', {
      p_token: token,
      p_section: 'measurement',
      p_expected_updated_at: expectedUpdatedAt,
      p_chest: parseNum(sanitizedFields.chest),
      p_shoulder: parseNum(sanitizedFields.shoulder),
      p_sleeve: parseNum(sanitizedFields.sleeve),
      p_length: parseNum(sanitizedFields.length),
      p_height_cm: sanitizedFields.heightCm ? parseWhole(sanitizedFields.heightCm) : null,
      p_weight_kg: sanitizedFields.weightKg ? parseNum(sanitizedFields.weightKg) : null,
      p_age_years: sanitizedFields.ageYears ? parseWhole(sanitizedFields.ageYears) : null,
      p_measurement_notes: measurementNotes,
      p_measurement_event_data: { filledCount, markComplete },
      p_mark_complete: markComplete,
    })
    .maybeSingle()

  if (error || !data) {
    const conflict = conflictFromError(error?.message)
    return {
      success: false,
      error: conflict ? 'Data ini sudah diperbarui di perangkat lain. Muat ulang halaman.' : 'Gagal menyimpan ukuran. Coba lagi.',
      conflict,
      updatedAt: null,
    }
  }

  return { success: true, error: null, conflict: false, updatedAt: (data as { updated_at: string }).updated_at }
}
