const MARKER = '---LTOS_CUSTOMER_DESIGN_NOTE---'
// Same technique as every other marker block sharing consultations.notes
// (customerProfile/codec.ts, design-studio/notesCodec.ts,
// fitterEnhancementsCodec.ts, eventInformationCodec.ts,
// designSpecification/codec.ts, fabricQuantityCodec.ts): any other
// `---LTOS_...---` block marks the end of this one, so encode/decode never
// touch text belonging to another block regardless of order.
const NEXT_MARKER = /\n---LTOS_/

// New block introduced by the Customer Self-Service Consultation Link
// feature — a short freeform note the CUSTOMER types themselves ("Catatan
// desain customer" in the self-service flow), distinct from the Fitter's own
// internal notes (fitterEnhancementsCodec.ts) which the customer link never
// reads or writes. No new column — rides inside consultations.notes like
// every other block here.
const MAX_LENGTH = 500

export function encodeCustomerDesignNote(existingNotes: string | null, note: string): string {
  const raw = existingNotes ?? ''
  let withoutOurBlock = raw

  if (raw.includes(MARKER)) {
    const before = raw.slice(0, raw.indexOf(MARKER))
    const afterMarker = raw.slice(raw.indexOf(MARKER) + MARKER.length)
    const nextMatch = afterMarker.match(NEXT_MARKER)
    const after = nextMatch ? afterMarker.slice(nextMatch.index) : ''
    withoutOurBlock = before + after
  }

  const trimmed = note.trim().slice(0, MAX_LENGTH)
  const parts = [withoutOurBlock.trim()]
  if (trimmed) parts.push(`${MARKER}\n${trimmed}`)
  return parts.filter(Boolean).join('\n\n')
}

export function decodeCustomerDesignNote(raw: string | null): string {
  if (!raw || !raw.includes(MARKER)) return ''

  const afterMarker = raw.slice(raw.indexOf(MARKER) + MARKER.length)
  const nextMatch = afterMarker.match(NEXT_MARKER)
  const block = (nextMatch ? afterMarker.slice(0, nextMatch.index) : afterMarker).trim()
  return block
}
