export interface ConsultationDocument {
  id: string
  category: string
  name: string
  url: string
  uploadedAt: string
}

export type EstimasiPengerjaan = '' | 'Standard' | 'Fast' | 'Very Fast'

export interface FitterEnhancements {
  estimasiPengerjaan: EstimasiPengerjaan
  customerPhotos: { front: string | null; side: string | null; back: string | null }
  documents: ConsultationDocument[]
}

export const DEFAULT_FITTER_ENHANCEMENTS: FitterEnhancements = {
  estimasiPengerjaan: '',
  customerPhotos: { front: null, side: null, back: null },
  documents: [],
}

const MARKER = '---LTOS_FITTER_ENHANCEMENTS---'
// Any other `---LTOS_...---` block (e.g. Design Studio's own
// ---LTOS_DESIGN_BLUEPRINT---) marks the end of ours, so encode/decode never
// have to know about, or depend on the order of, other codecs sharing the
// same consultations.notes column.
const NEXT_MARKER = /\n---LTOS_/

export function decodeFitterEnhancements(raw: string | null): FitterEnhancements {
  if (!raw || !raw.includes(MARKER)) return DEFAULT_FITTER_ENHANCEMENTS

  const afterMarker = raw.slice(raw.indexOf(MARKER) + MARKER.length)
  const nextMatch = afterMarker.match(NEXT_MARKER)
  const block = (nextMatch ? afterMarker.slice(0, nextMatch.index) : afterMarker).trim()

  try {
    return { ...DEFAULT_FITTER_ENHANCEMENTS, ...JSON.parse(block) }
  } catch {
    return DEFAULT_FITTER_ENHANCEMENTS
  }
}

// Same technique as design-studio/notesCodec.ts: no new columns for these
// fields, so they ride along inside the existing free-text consultations.notes
// column in their own clearly delimited block. Only this codec's own block is
// ever touched — any other marker block (human notes, design blueprint) is
// preserved as-is wherever it happens to sit.
export function encodeFitterEnhancements(existingNotes: string | null, data: FitterEnhancements): string {
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
