import type { MeasurementFields } from './types'

const EXTRA_MARKER = '---LTOS_EXTRA_MEASUREMENTS---'
const TAGS_MARKER = '---LTOS_BODY_TAGS---'

const EXTRA_KEYS: (keyof MeasurementFields)[] = [
  'neck',
  'waist',
  'hip',
  'armhole',
  'biceps',
  'elbow',
  'wrist',
  'hemWidth',
]

// The `measurements` table only has columns for chest/shoulder/sleeve/length
// (see types.ts) — no schema change was authorized for the other 8 fields
// or body tags, so they're encoded into the existing free-text `notes`
// column in a clearly delimited block, and decoded back out when the page
// reloads. Human-entered notes stay untouched above the marker.
export function encodeNotes(humanNotes: string, fields: MeasurementFields, tags: string[]): string {
  const extras = EXTRA_KEYS.filter(k => fields[k]).map(k => `${k}=${fields[k]}`).join('|')
  const parts = [humanNotes.trim()]
  if (extras) parts.push(`${EXTRA_MARKER}\n${extras}`)
  if (tags.length) parts.push(`${TAGS_MARKER}\n${tags.join(',')}`)
  return parts.join('\n\n')
}

export function decodeNotes(raw: string | null): {
  humanNotes: string
  extras: Partial<MeasurementFields>
  tags: string[]
} {
  if (!raw) return { humanNotes: '', extras: {}, tags: [] }

  const extraIdx = raw.indexOf(EXTRA_MARKER)
  const tagsIdx = raw.indexOf(TAGS_MARKER)
  const cutIdx = [extraIdx, tagsIdx].filter(i => i >= 0).sort((a, b) => a - b)[0]
  const humanNotes = (cutIdx === undefined ? raw : raw.slice(0, cutIdx)).trim()

  const extras: Partial<MeasurementFields> = {}
  if (extraIdx >= 0) {
    const block = raw.slice(extraIdx + EXTRA_MARKER.length, tagsIdx >= 0 ? tagsIdx : undefined).trim()
    block.split('|').forEach(pair => {
      const [key, value] = pair.split('=')
      if (key && value && (EXTRA_KEYS as string[]).includes(key)) {
        extras[key as keyof MeasurementFields] = value
      }
    })
  }

  let tags: string[] = []
  if (tagsIdx >= 0) {
    const block = raw.slice(tagsIdx + TAGS_MARKER.length).trim()
    tags = block ? block.split(',').map(t => t.trim()).filter(Boolean) : []
  }

  return { humanNotes, extras, tags }
}
