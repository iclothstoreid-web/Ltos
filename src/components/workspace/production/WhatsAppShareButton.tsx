'use client'

import { useState } from 'react'
import { generateSpecSheetPdfBlob, downloadPdfBlob } from '@/lib/production/specSheetPdf'
import type { SpecSheetPaperSize } from '@/lib/production/specSheetPaper'

interface WhatsAppShareButtonProps {
  orderNumber: string
  size?: SpecSheetPaperSize
}

// Web Share API only — ProductionPacket has no customer phone number today
// (confirmed with user), so instead of a wa.me deep link this hands the
// generated PDF to the device's native share sheet and lets the operator
// pick WhatsApp (or any other app) themselves. Falls back to a direct PDF
// download when navigator.share/canShare-with-files isn't available (mainly
// desktop browsers), so the action is never a dead end. Takes only
// orderNumber + an optional paper size — no Pattern-Formulation-specific
// props — so QC/Delivery can reuse it against their own print-area node
// later, per the master prompt's reusability requirement.
export function WhatsAppShareButton({ orderNumber, size = 'a4' }: WhatsAppShareButtonProps) {
  const [sharing, setSharing] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleShare() {
    setSharing(true)
    setNotice(null)
    try {
      const blob = await generateSpecSheetPdfBlob(size)
      const filename = `Spesifikasi-Produksi-${orderNumber}.pdf`
      const file = new File([blob], filename, { type: 'application/pdf' })

      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Spesifikasi Produksi - ${orderNumber}`,
          text: `Spesifikasi Produksi untuk Order ${orderNumber}`,
        })
      } else {
        downloadPdfBlob(blob, filename)
        setNotice('Share tidak didukung di perangkat ini — PDF diunduh.')
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setNotice('Gagal membagikan dokumen.')
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleShare}
        disabled={sharing}
        className="w-full flex items-center justify-center gap-2 bg-transparent text-[#161b29] py-3
                   font-hanken text-sm font-semibold uppercase tracking-widest border border-[#c6c6cc]/60
                   hover:border-[#161b29] transition-colors disabled:opacity-40"
      >
        <span className="material-symbols-outlined text-lg">share</span>
        {sharing ? 'Menyiapkan...' : 'Share WhatsApp'}
      </button>
      {notice && <p className="font-hanken text-xs text-[#46464c] mt-2">{notice}</p>}
    </div>
  )
}
