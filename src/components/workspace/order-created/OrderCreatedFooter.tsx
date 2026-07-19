'use client'

import { useRouter } from 'next/navigation'

interface OrderCreatedFooterProps {
  orderNumber: string
}

export function OrderCreatedFooter({ orderNumber }: OrderCreatedFooterProps) {
  const router = useRouter()

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#f9f9ff] border-t-[0.5px] border-[#c4c7c7] px-16 py-6">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-4 text-[#444748]">
          <span className="material-symbols-outlined">info</span>
          <p className="font-sans text-xs uppercase tracking-widest">
            Pesanan {orderNumber} telah dikunci dan difinalisasi untuk produksi.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/workspace/check-in')}
            className="px-8 py-3 border border-[#c4c7c7] hover:bg-[#e7eefe] transition-all font-sans
                       text-sm uppercase tracking-widest font-bold text-[#151c27]"
          >
            Kembali ke Dashboard
          </button>
          <button
            type="button"
            onClick={() => router.push('/workspace/check-in')}
            className="px-8 py-3 bg-[#151c27] text-white hover:bg-[#775a19] transition-all font-sans
                       text-sm uppercase tracking-widest font-bold"
          >
            Mulai Konsultasi Baru
          </button>
        </div>
      </div>
    </footer>
  )
}
