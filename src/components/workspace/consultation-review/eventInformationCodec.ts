export type EventType =
  | ''
  | 'Harian'
  | 'Kerja'
  | 'Umroh'
  | 'Haji'
  | 'Pernikahan'
  | 'Wisuda'
  | 'Lebaran'
  | 'Acara Resmi'
  | 'Hadiah'
  | 'Lainnya'

export const EVENT_TYPE_OPTIONS: EventType[] = [
  'Harian',
  'Kerja',
  'Umroh',
  'Haji',
  'Pernikahan',
  'Wisuda',
  'Lebaran',
  'Acara Resmi',
  'Hadiah',
  'Lainnya',
]

export type DeadlineFlexibility = '' | 'strict' | 'flexible'

export const DEADLINE_FLEXIBILITY_LABELS: Record<Exclude<DeadlineFlexibility, ''>, string> = {
  strict: 'Harus sesuai tanggal',
  flexible: 'Fleksibel',
}

// Target Usage Date is the data every downstream engine reads (Estimation
// Validation below). Event Type is context only -- never fed into capacity
// or SLA math.
export interface EventInformation {
  eventType: EventType
  targetUsageDate: string // ISO yyyy-mm-dd, '' = not set
  deadlineFlexibility: DeadlineFlexibility
  catatan: string
}

export const DEFAULT_EVENT_INFORMATION: EventInformation = {
  eventType: '',
  targetUsageDate: '',
  deadlineFlexibility: '',
  catatan: '',
}

const MARKER = '---LTOS_EVENT_INFO---'
// Same coexistence technique as fitterEnhancementsCodec.ts / design-studio's
// notesCodec.ts -- any other `---LTOS_...---` block marks the end of ours.
const NEXT_MARKER = /\n---LTOS_/

export function decodeEventInformation(raw: string | null): EventInformation {
  if (!raw || !raw.includes(MARKER)) return DEFAULT_EVENT_INFORMATION

  const afterMarker = raw.slice(raw.indexOf(MARKER) + MARKER.length)
  const nextMatch = afterMarker.match(NEXT_MARKER)
  const block = (nextMatch ? afterMarker.slice(0, nextMatch.index) : afterMarker).trim()

  try {
    return { ...DEFAULT_EVENT_INFORMATION, ...JSON.parse(block) }
  } catch {
    return DEFAULT_EVENT_INFORMATION
  }
}

// No new consultations column for these fields -- they ride along inside
// the existing free-text consultations.notes column in their own delimited
// block, same technique as fitterEnhancementsCodec.ts. Only this codec's
// own block is ever touched; any other marker block is preserved as-is.
export function encodeEventInformation(existingNotes: string | null, data: EventInformation): string {
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
