import type { DesignSelections } from './types'

const MARKER = '---LTOS_DESIGN_BLUEPRINT---'

// Same technique as Measurement's notesCodec.ts: no new columns exist for
// garment selections, so they ride along inside the existing free-text
// consultations.notes column in a clearly delimited block. Human notes
// (if any exist above the marker) are preserved untouched.
export function encodeDesignNotes(existingNotes: string, selections: DesignSelections): string {
  const humanPart = existingNotes.includes(MARKER)
    ? existingNotes.slice(0, existingNotes.indexOf(MARKER)).trim()
    : existingNotes.trim()

  const encoded = Object.entries(selections)
    .map(([key, value]) => `${key}=${value}`)
    .join('|')

  return [humanPart, `${MARKER}\n${encoded}`].filter(Boolean).join('\n\n')
}

export function decodeDesignNotes(raw: string | null): Partial<DesignSelections> {
  if (!raw || !raw.includes(MARKER)) return {}

  const block = raw.slice(raw.indexOf(MARKER) + MARKER.length).trim()
  const result: Partial<DesignSelections> = {}
  block.split('|').forEach(pair => {
    const [key, value] = pair.split('=')
    if (key && value) {
      result[key as keyof DesignSelections] = value
    }
  })
  return result
}
