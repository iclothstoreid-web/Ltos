// Sprint V1.2.1 (Fabric Quantity Input) — activates the already-built but
// dormant Material Reservation pipe (ADR-020) by giving quantityMeters a
// real value. No new table/column: same marker-block technique as
// notesCodec.ts / fitterEnhancementsCodec.ts / eventInformationCodec.ts, so
// this rides along inside the existing free-text consultations.notes column.
export interface FabricQuantity {
  quantityMeters: number | null
}

export const DEFAULT_FABRIC_QUANTITY: FabricQuantity = { quantityMeters: null }

const MARKER = '---LTOS_FABRIC_QTY---'
const NEXT_MARKER = /\n---LTOS_/

export function decodeFabricQuantity(raw: string | null): FabricQuantity {
  if (!raw || !raw.includes(MARKER)) return DEFAULT_FABRIC_QUANTITY

  const afterMarker = raw.slice(raw.indexOf(MARKER) + MARKER.length)
  const nextMatch = afterMarker.match(NEXT_MARKER)
  const block = (nextMatch ? afterMarker.slice(0, nextMatch.index) : afterMarker).trim()

  try {
    return { ...DEFAULT_FABRIC_QUANTITY, ...JSON.parse(block) }
  } catch {
    return DEFAULT_FABRIC_QUANTITY
  }
}

export function encodeFabricQuantity(existingNotes: string | null, data: FabricQuantity): string {
  const raw = existingNotes ?? ''
  let withoutOurBlock = raw

  if (raw.includes(MARKER)) {
    const before = raw.slice(0, raw.indexOf(MARKER))
    const afterMarker = raw.slice(raw.indexOf(MARKER) + MARKER.length)
    const nextMatch = afterMarker.match(NEXT_MARKER)
    const after = nextMatch ? afterMarker.slice(nextMatch.index) : ''
    withoutOurBlock = before + after
  }

  return [withoutOurBlock.trim(), `${MARKER}\n${JSON.stringify(data)}`].filter(Boolean).join('\n\n')
}
