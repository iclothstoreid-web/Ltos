import { APP_URLS } from '@/lib/config/app-urls'

// Customer Self-Service Consultation Link — public identity for the
// /customer-consultation/[token] route. Shares APP_URLS.journey (the
// customer-facing domain Customer Journey already uses) rather than
// APP_URLS.fitter, since this link is opened by the CUSTOMER, on any
// device, never inside the Fitter's authenticated app — same reasoning as
// buildCustomerJourneyUrl in src/lib/order/qr.ts.
const CUSTOMER_CONSULTATION_PREFIX = `${APP_URLS.journey}/customer-consultation/`

export function buildCustomerConsultationUrl(token: string): string {
  return `${CUSTOMER_CONSULTATION_PREFIX}${token}`
}

// WhatsApp message template from the brief, verbatim — encodeURIComponent
// applied by the caller building the wa.me href (see CustomerLinkCard.tsx),
// never pre-encoded here so the plain text stays copy-paste friendly too.
export function buildCustomerConsultationWhatsAppMessage(customerName: string, link: string): string {
  const firstName = customerName.trim().split(/\s+/)[0] || customerName
  return `Assalamu'alaikum Pak/Bu ${firstName}.\nSilakan pilih model thobe dan isi ukuran yang sudah dimiliki melalui link berikut:\n${link}\n\nData akan langsung masuk ke sistem Local Tailor dan akan kami validasi kembali.`
}
