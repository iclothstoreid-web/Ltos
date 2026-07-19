import type { DesignSpecification } from './types'

const MARKER = '---LTOS_DESIGN_SPECIFICATION---'
// Same technique as customerProfile/codec.ts / notesCodec.ts: any other
// `---LTOS_...---` block marks the end of ours, so multiple marker blocks
// coexist independently inside consultations.notes.
const NEXT_MARKER = /\n---LTOS_/

export function decodeDesignSpecification(raw: string | null): DesignSpecification | null {
  if (!raw || !raw.includes(MARKER)) return null

  const afterMarker = raw.slice(raw.indexOf(MARKER) + MARKER.length)
  const nextMatch = afterMarker.match(NEXT_MARKER)
  const block = (nextMatch ? afterMarker.slice(0, nextMatch.index) : afterMarker).trim()

  try {
    return JSON.parse(block) as DesignSpecification
  } catch {
    return null
  }
}

// No new table/column — rides along inside consultations.notes in its own
// delimited block, same as Customer Digital Profile. Only this codec's own
// block is ever touched; every other marker block is preserved as-is.
export function encodeDesignSpecification(existingNotes: string | null, spec: DesignSpecification): string {
  const raw = existingNotes ?? ''
  let withoutOurBlock = raw

  if (raw.includes(MARKER)) {
    const before = raw.slice(0, raw.indexOf(MARKER))
    const afterMarker = raw.slice(raw.indexOf(MARKER) + MARKER.length)
    const nextMatch = afterMarker.match(NEXT_MARKER)
    const after = nextMatch ? afterMarker.slice(nextMatch.index) : ''
    withoutOurBlock = before + after
  }

  return [withoutOurBlock.trim(), `${MARKER}\n${JSON.stringify(spec)}`].filter(Boolean).join('\n\n')
}
