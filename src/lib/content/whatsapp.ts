// Sprint W0.5 §"Conversion Layer" — content-cluster WhatsApp messages.
// Deliberately separate from src/lib/body-estimator/whatsapp.ts: that
// module's buildWhatsAppBookingMessage() is part of the W0.4 booking flow
// (built from a real EstimatorInput/EstimatorResult) and this sprint's
// brief explicitly says "Jangan mengubah booking flow" — a guide article
// has no estimation result to attach, so it gets its own lighter, honest
// messages instead of stretching the booking-flow function to cover a case
// it wasn't designed for.

// TODO_PLACEHOLDER_ENV — same env var as the booking flow
// (NEXT_PUBLIC_WHATSAPP_NUMBER, see .env.example); falls back to the same
// placeholder number so links work end-to-end before it's set.
export const CONTENT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890'

// "Chat WhatsApp Tailor" — a general question prompted by reading the
// article, not a booking request.
export function buildArticleInquiryMessage(articleTitle: string): string {
  return `Halo Tarda, saya baru membaca artikel "${articleTitle}" dan ingin bertanya lebih lanjut soal ukuran thobe saya.`
}

// "Book Free Measurement" — clear booking intent, still no profile data
// attached (that only exists after the estimator, see W0.4's
// WhatsAppCTAButton).
export function buildArticleBookingMessage(articleTitle: string): string {
  return `Halo Tarda, saya baru membaca artikel "${articleTitle}" dan ingin booking Free Measurement dengan fitter Tarda.`
}

// Same encode-correctly requirement as the booking flow's URL builder —
// reusing that logic here rather than re-implementing it a second time
// since it's pure, generic URL construction, not booking-flow business
// logic.
export function buildContentWhatsAppUrl(phoneNumber: string, message: string): string {
  const sanitizedNumber = phoneNumber.replace(/[^\d]/g, '')
  return `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(message)}`
}
