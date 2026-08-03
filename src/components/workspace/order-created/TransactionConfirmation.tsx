'use client'

import { TransactionGarmentsPanel } from './TransactionGarmentsPanel'

interface TransactionConfirmationProps {
  transactionId: string
  currentOrderId: string
  fitterName: string
}

// Standalone transaction-level view (header + success banner + summary/
// garment grid). Not routed to directly today — Milestone B's order-created
// page embeds TransactionGarmentsPanel inside the existing, richer
// OrderCreatedWorkspace instead (see that file), to keep every existing
// single-garment order's QR/payment/timeline/communication UI intact. Kept
// as a real, working component (not a stub) so a dedicated transaction
// route can mount it directly if one is ever added, without redoing this
// work.
export function TransactionConfirmation({ transactionId, currentOrderId, fitterName }: TransactionConfirmationProps) {
  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-[#151c27] pb-32">
      <header className="border-b-[0.5px] border-[#e0e0e0] bg-[#fafafa]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#151c27] flex items-center justify-center">
              <span className="text-white font-sans text-xs font-bold uppercase">
                {fitterName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-sans text-xs text-[#775a19] uppercase tracking-widest">
              Konfirmasi Transaksi
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-8 lg:py-16">
        <div className="bg-[#f0f3ff] border-l-2 border-[#775a19] p-6 mb-8">
          <h1 className="font-sans text-lg font-bold text-[#151c27] mb-1">
            Transaksi Berhasil Dibuat
          </h1>
          <p className="font-sans text-sm text-[#444748]">
            Detail transaksi dan seluruh garmen di dalamnya ditampilkan di bawah ini.
          </p>
        </div>

        <TransactionGarmentsPanel transactionId={transactionId} currentOrderId={currentOrderId} />
      </main>
    </div>
  )
}
