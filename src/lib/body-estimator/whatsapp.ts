import type { BodyProfileType, FitType, ThobeSize } from './types'

interface WhatsAppMessageInput {
  name?: string
  height: number
  weight: number
  age: number
  bodyProfile: BodyProfileType
  fit: FitType
  size: ThobeSize
  confidence: number
}

function formatLabel(value: string): string {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Sprint W0.4 §"WhatsApp Booking CTA" — exact message shape from the brief,
// built purely from the W0.2 engine's own output plus an optional name
// (soft gate: works with or without the lead capture form having been
// filled in).
export function buildWhatsAppBookingMessage({ name, height, weight, age, bodyProfile, fit, size, confidence }: WhatsAppMessageInput): string {
  const lines = [
    'Halo Tarda,',
    'Saya baru menggunakan Body Profile Estimator.',
    '',
    `Nama: ${name && name.trim() ? name.trim() : '-'}`,
    `Tinggi: ${height} cm`,
    `Berat: ${weight} kg`,
    `Usia: ${age}`,
    `Body Profile: ${formatLabel(bodyProfile)}`,
    `Recommended Fit: ${formatLabel(fit)}`,
    `Estimated Size: ${size}`,
    `Confidence: ${confidence}%`,
    '',
    'Saya ingin booking Free Measurement dengan fitter Tarda.',
  ]
  return lines.join('\n')
}

// Sprint W0.4 §"Booking CTA Card" secondary CTA ("Chat WhatsApp Tailor") —
// a deliberately lighter ask than buildWhatsAppBookingMessage: no profile
// data attached, just opens the conversation.
export function buildWhatsAppInquiryMessage(): string {
  return 'Halo Tarda, saya ingin bertanya seputar layanan bespoke tailoring.'
}

// Pastikan URL WhatsApp di-encode dengan benar — encodeURIComponent handles
// newlines, spaces, and Indonesian punctuation correctly for a `wa.me` deep
// link's `text` query param.
export function buildWhatsAppBookingUrl(phoneNumber: string, message: string): string {
  const sanitizedNumber = phoneNumber.replace(/[^\d]/g, '')
  return `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(message)}`
}
