'use client'

import { useEffect, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { buildCustomerJourneyUrl } from '@/lib/order/qr'
import { buildOrderSuccessWhatsAppMessage, buildWhatsAppUrl, formatPhoneForWhatsApp } from '@/lib/order/whatsapp'

interface CustomerJourneyShareActionsProps {
  customerToken: string
  customerName: string
  customerPhone: string | null
  orderNumber: string
}

// Single Customer Journey Action panel — the only place Copy Link / QR /
// WhatsApp / Share live on Order Success. Every action resolves to the same
// buildCustomerJourneyUrl(customerToken); QR is only ever a rendering of
// that link, never an independent identifier ("QR bukan source of truth").
export function CustomerJourneyShareActions({
  customerToken,
  customerName,
  customerPhone,
  orderNumber,
}: CustomerJourneyShareActionsProps) {
  const journeyUrl = buildCustomerJourneyUrl(customerToken)
  const downloadWrapperRef = useRef<HTMLDivElement>(null)

  const [linkCopied, setLinkCopied] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(journeyUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      // Clipboard API can fail (permissions, non-secure context) — the
      // link is already visible on screen as a fallback.
    }
  }

  const handleDownloadQr = () => {
    const canvas = downloadWrapperRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `${orderNumber}-QR.png`
    link.click()
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Customer Journey - ${orderNumber}`,
        text: `Halo ${customerName}, pantau progres pesanan Anda melalui tautan berikut.`,
        url: journeyUrl,
      })
    } catch {
      // Share sheet dismissed/cancelled or unsupported at call time — Copy
      // Link and WhatsApp remain available as fallbacks.
    }
  }

  const whatsAppPhone = customerPhone ? formatPhoneForWhatsApp(customerPhone) : null
  const whatsAppUrl = whatsAppPhone
    ? buildWhatsAppUrl(whatsAppPhone, buildOrderSuccessWhatsAppMessage(customerName, journeyUrl))
    : null

  const buttonClass =
    'flex items-center justify-center gap-2 py-3 border border-[#c4c7c7] text-[#444748] ' +
    'font-sans text-xs uppercase tracking-widest hover:border-[#151c27] hover:text-[#151c27] transition-colors'
  const disabledButtonClass =
    'flex items-center justify-center gap-2 py-3 border border-[#c4c7c7] text-[#444748] ' +
    'opacity-50 cursor-not-allowed font-sans text-xs uppercase tracking-widest'

  return (
    <section className="bg-white/70 backdrop-blur-sm border-[0.5px] border-[#c4c7c7]/40 shadow-sm p-4">
      <h3 className="font-sans text-xs text-[#444748] uppercase tracking-widest mb-4">
        Bagikan Customer Journey
      </h3>

      <div className="flex items-center justify-between p-3 bg-white border border-[#c4c7c7] rounded gap-4 mb-3">
        <span className="font-sans text-sm text-[#444748] truncate">{journeyUrl}</span>
        <button
          type="button"
          onClick={handleCopyLink}
          className="font-sans text-xs text-[#151c27] uppercase font-bold hover:underline shrink-0"
        >
          {linkCopied ? '✓ Disalin' : 'Salin Tautan'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {whatsAppUrl ? (
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            WhatsApp
          </a>
        ) : (
          <button type="button" disabled title="Tidak ada nomor telepon pelanggan" className={disabledButtonClass}>
            <span className="material-symbols-outlined text-[18px]">chat</span>
            WhatsApp
          </button>
        )}

        <button type="button" onClick={() => setQrModalOpen(true)} className={buttonClass}>
          <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
          Tampilkan QR
        </button>

        <button type="button" onClick={handleDownloadQr} className={buttonClass}>
          <span className="material-symbols-outlined text-[18px]">download</span>
          Unduh QR
        </button>

        {canShare && (
          <button type="button" onClick={handleShare} className={buttonClass}>
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
            Bagikan
          </button>
        )}

        <button type="button" disabled title="Belum diimplementasikan" className={disabledButtonClass}>
          <span className="material-symbols-outlined text-[18px]">mail</span>
          Email
        </button>

        <button type="button" disabled title="Belum diimplementasikan" className={disabledButtonClass}>
          <span className="material-symbols-outlined text-[18px]">print</span>
          Cetak
        </button>
      </div>

      {/* Always-mounted, visually hidden — dedicated canvas so Download QR
          works without requiring the Show QR modal to be open first. */}
      <div ref={downloadWrapperRef} className="hidden">
        <QRCodeCanvas value={journeyUrl} size={512} level="M" />
      </div>

      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="font-sans text-xs text-[#444748] uppercase tracking-widest">
                Customer Journey QR
              </h3>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="material-symbols-outlined text-[#444748] hover:text-[#151c27] transition-colors"
              >
                close
              </button>
            </div>
            <div className="flex justify-center bg-white p-4 border border-[#c4c7c7]/60">
              <QRCodeCanvas value={journeyUrl} size={280} level="M" />
            </div>
            <p className="font-sans text-xs text-[#444748] text-center break-all">{journeyUrl}</p>
          </div>
        </div>
      )}
    </section>
  )
}
