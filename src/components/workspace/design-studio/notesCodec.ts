import type { DesignSelections } from './types'

const MARKER = '---LTOS_DESIGN_BLUEPRINT---'
// Bug fix (Photo Flow Audit) — every sibling codec sharing consultations.notes
// (customerProfile/codec.ts, designSpecification/codec.ts, fabricQuantityCodec.ts,
// fitterEnhancementsCodec.ts, eventInformationCodec.ts) already scopes its own
// block with this NEXT_MARKER cutoff so it never touches text belonging to
// another block. This codec was the one exception: it took "everything before
// MARKER" as the human part and "everything after MARKER to end-of-string" as
// its own block, which silently deleted (encode) or corrupted (decode) any
// other block that happened to sit after ---LTOS_DESIGN_BLUEPRINT---. In
// practice that block is the Customer Digital Profile (the fitter's photo) —
// it lands after DESIGN_BLUEPRINT whenever Measurement is revisited (photo
// retake / re-measure) after Design Studio has already saved once, and the
// very next Design Studio save then wrote the photo out of consultations.notes
// entirely, before Production ever got to read it.
const NEXT_MARKER = /\n---LTOS_/

// No new table/column — garment selections ride along inside the existing
// free-text consultations.notes column in a clearly delimited block. Only
// this codec's own block is ever touched; every other marker block (human
// notes, Customer Digital Profile, Design Specification, Fabric Quantity...)
// is preserved as-is wherever it happens to sit, before or after this one.
export function encodeDesignNotes(existingNotes: string, selections: DesignSelections): string {
  const raw = existingNotes ?? ''
  let withoutOurBlock = raw

  if (raw.includes(MARKER)) {
    const before = raw.slice(0, raw.indexOf(MARKER))
    const afterMarker = raw.slice(raw.indexOf(MARKER) + MARKER.length)
    const nextMatch = afterMarker.match(NEXT_MARKER)
    const after = nextMatch ? afterMarker.slice(nextMatch.index) : ''
    withoutOurBlock = before + after
  }

  const encoded = Object.entries(selections)
    .map(([key, value]) => `${key}=${value}`)
    .join('|')

  return [withoutOurBlock.trim(), `${MARKER}\n${encoded}`].filter(Boolean).join('\n\n')
}

// Design Studio Phase Detection — the persisted, authoritative signal for
// "has Fase 1 (Design Configuration) ever been saved for this
// consultation". Used by DesignStudioWorkspace to decide whether a
// consultation that has completed Measurement should open straight into
// Fase 2 (Final Preview) instead of the configurator — a fresh/legacy
// consultation that never saved a blueprint always falls back to
// Configuration, even if Measurement is already done (see
// DesignStudioWorkspace's phase computation for the full rule).
export function hasDesignBlueprint(raw: string | null): boolean {
  return !!raw && raw.includes(MARKER)
}

export function decodeDesignNotes(raw: string | null): Partial<DesignSelections> {
  if (!raw || !raw.includes(MARKER)) return {}

  const afterMarker = raw.slice(raw.indexOf(MARKER) + MARKER.length)
  const nextMatch = afterMarker.match(NEXT_MARKER)
  const block = (nextMatch ? afterMarker.slice(0, nextMatch.index) : afterMarker).trim()

  const result: Partial<DesignSelections> = {}
  block.split('|').forEach(pair => {
    const [key, value] = pair.split('=')
    if (key && value) {
      result[key as keyof DesignSelections] = value
    }
  })
  return result
}
