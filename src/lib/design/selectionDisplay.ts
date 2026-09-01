import { NONE_SELECTION } from '@/components/workspace/design-studio/types'

// Values that must never reach a customer/fitter-facing surface as-is:
// the "(None)" sentinel, and stringified nullish that occasionally slips
// through an older snapshot.
const EMPTY_TOKENS = new Set([NONE_SELECTION, 'null', 'undefined', 'NaN', ''])

export function isEmptySelection(value: string | null | undefined): boolean {
  if (value == null) return true
  return EMPTY_TOKENS.has(value.trim())
}

// A selection value ready to display. Empty / sentinel values become
// `fallback` ("Tidak ada" by default; pass "—" for a print sheet, or
// "Belum dipilih" for an in-progress form).
export function selectionLabel(
  value: string | null | undefined,
  fallback: string = 'Tidak ada'
): string {
  return isEmptySelection(value) ? fallback : (value as string).trim()
}
