import { EMPTY_FIELDS } from '@/components/workspace/measurement/types'
import type { MeasurementFields } from '@/components/workspace/measurement/types'
import { MEASUREMENT_BODY_MAP } from '@/lib/measurement/bodyMap'
import type { CustomerDigitalProfile } from './types'

interface BuildCustomerDigitalProfileParams {
  consultationId: string
  fields: MeasurementFields
  bodyTags: string[]
  // Timestamp of the measurement session this build reflects. Omit when
  // only refreshing the photo on top of an already-generated profile.
  measuredAt?: string | null
  // Front-view photo URL, or undefined to leave whatever the existing
  // profile already had untouched.
  customerPhotoUrl?: string | null
  // Previous profile for this consultation, if one exists, so fields that
  // aren't part of the current call (e.g. measuredAt when only the photo
  // changed) don't get lost.
  existingProfile?: CustomerDigitalProfile | null
}

// Profile Generator: assembles the permanent Customer Digital Profile from
// data that already exists elsewhere (measurement fields/tags, the static
// body map, and the customer's front-view photo once captured) — it does
// not call any AI/render/image API.
export function buildCustomerDigitalProfile(params: BuildCustomerDigitalProfileParams): CustomerDigitalProfile {
  const now = new Date().toISOString()

  const previousPhoto = params.existingProfile?.customerPhoto ?? null
  const photoUrl = params.customerPhotoUrl !== undefined ? params.customerPhotoUrl : previousPhoto?.url ?? null
  const customerPhoto = photoUrl
    ? { url: photoUrl, recordedAt: previousPhoto?.url === photoUrl ? previousPhoto.recordedAt : now }
    : null

  const measuredAt = params.measuredAt ?? params.existingProfile?.measurement.measuredAt ?? null

  return {
    consultationId: params.consultationId,
    measurement: {
      fields: { ...EMPTY_FIELDS, ...params.fields },
      measuredAt,
    },
    bodyTags: params.bodyTags,
    bodyMapReference: MEASUREMENT_BODY_MAP,
    customerPhoto,
    measurementTimestamp: measuredAt,
    lastUpdated: now,
  }
}
