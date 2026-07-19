import type { CustomerDigitalProfile } from './types'

const MARKER = '---LTOS_CUSTOMER_DIGITAL_PROFILE---'
// Same technique as fitterEnhancementsCodec.ts / design-studio/notesCodec.ts:
// any other `---LTOS_...---` block marks the end of ours, so encode/decode
// don't need to know about, or depend on the order of, the other marker
// blocks sharing consultations.notes.
const NEXT_MARKER = /\n---LTOS_/

export function decodeCustomerDigitalProfile(raw: string | null): CustomerDigitalProfile | null {
  if (!raw || !raw.includes(MARKER)) return null

  const afterMarker = raw.slice(raw.indexOf(MARKER) + MARKER.length)
  const nextMatch = afterMarker.match(NEXT_MARKER)
  const block = (nextMatch ? afterMarker.slice(0, nextMatch.index) : afterMarker).trim()

  try {
    return JSON.parse(block) as CustomerDigitalProfile
  } catch {
    return null
  }
}

// No new table/column — the profile rides along inside the existing
// free-text consultations.notes column in its own delimited block, same as
// every other Fitter/Design Studio addition. Only this codec's own block is
// ever touched; any other marker block (human notes, fitter enhancements,
// design blueprint) is preserved as-is wherever it happens to sit.
export function encodeCustomerDigitalProfile(existingNotes: string | null, profile: CustomerDigitalProfile): string {
  const raw = existingNotes ?? ''
  let withoutOurBlock = raw

  if (raw.includes(MARKER)) {
    const before = raw.slice(0, raw.indexOf(MARKER))
    const afterMarker = raw.slice(raw.indexOf(MARKER) + MARKER.length)
    const nextMatch = afterMarker.match(NEXT_MARKER)
    const after = nextMatch ? afterMarker.slice(nextMatch.index) : ''
    withoutOurBlock = before + after
  }

  return [withoutOurBlock.trim(), `${MARKER}\n${JSON.stringify(profile)}`].filter(Boolean).join('\n\n')
}
