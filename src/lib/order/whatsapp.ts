// Customer phone numbers are stored free-text (e.g. "08123..." or
// "+62812..."), but wa.me requires E.164 digits with no leading 0 or +.
// No phone-formatting convention exists elsewhere in the repo — this
// establishes the Indonesian-number convention (leading 0 -> 62) for the
// Order Success sharing actions only.
export function formatPhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('62')) return digits
  return `62${digits}`
}

export function buildOrderSuccessWhatsAppMessage(customerName: string, journeyLink: string): string {
  return `Halo ${customerName}\n\nPesanan Anda berhasil dibuat.\n\nSilakan pantau progres pengerjaan melalui link berikut.\n\n${journeyLink}\n\nTerima kasih.`
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
