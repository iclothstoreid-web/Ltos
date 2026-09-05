'use client'

import { useState } from 'react'
import { buildCustomerConsultationUrl, buildCustomerConsultationWhatsAppMessage } from '@/lib/consultation/customerLink'

interface CustomerLinkCardProps {
  customerConsultationToken: string
  customerName: string
  customerPhone: string | null
}

// Fitter-side card shown right after check-in — lets the Fitter hand a
// customer who is out of town (or otherwise can't sit through Design
// Studio/Measurement in person) a link to fill their own design + sizing
// against this exact consultation. See
// /customer-consultation/[token] and save_customer_consultation (Postgres).
export function CustomerLinkCard({ customerConsultationToken, customerName, customerPhone }: CustomerLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const link = buildCustomerConsultationUrl(customerConsultationToken)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API can throw in insecure contexts / older browsers —
      // the link is still visible and selectable in the field below.
    }
  }

  // Sent only on click — never automatically — per the brief. `wa.me` needs
  // digits only; a customer with no phone on file still gets the Salin Link
  // fallback.
  const whatsappHref = customerPhone
    ? `https://wa.me/${customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
        buildCustomerConsultationWhatsAppMessage(customerName, link)
      )}`
    : null

  return (
    <div className="p-6 rounded-xl bg-[#f0f4f8] border border-[#151c27]/10 space-y-4">
      <div>
        <p className="font-sans text-xs font-semibold text-[#151c27] uppercase tracking-widest">
          Link Pengisian Customer
        </p>
        <p className="font-sans text-xs text-[#444748] mt-1">
          Kirim link ini agar customer dapat memilih model dan mengisi ukuran sendiri dari mana saja.
        </p>
      </div>

      <div className="p-3 bg-white rounded-lg border border-[#151c27]/10">
        <p className="font-mono text-xs text-[#444748] break-all select-all">{link}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopy}
          className="font-sans text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg bg-[#151c27] text-white hover:bg-[#151c27]/90 transition-colors"
        >
          {copied ? 'Tersalin' : 'Salin Link'}
        </button>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg bg-[#25D366] text-white hover:bg-[#25D366]/90 transition-colors"
          >
            Kirim WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}
