'use client'

import type { OrderSnapshot } from '@/lib/order/types'

interface OrderSuccessHeroProps {
  orderNumber: string
  snapshot: OrderSnapshot
}

// Per your decision: payload only, no rendered QR image. The box below
// shows the actual payload string a real QR image would encode, rather
// than a fake-looking QR graphic that wouldn't scan.
export function OrderSuccessHero({ orderNumber, snapshot }: OrderSuccessHeroProps) {
  return (
    <section className="bg-white/70 backdrop-blur-sm border-[0.5px] border-[#c4c7c7]/40 shadow-sm p-8 text-center flex flex-col items-center">
      <div className="w-16 h-16 bg-[#151c27] text-white rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-3xl">done_all</span>
      </div>
      <h2 className="font-fraunces text-3xl text-[#151c27] mb-2">Order Successfully Created</h2>
      <p className="font-sans text-sm text-[#444748] max-w-sm mx-auto mb-8">
        The artisanal journey for this bespoke piece has officially begun.
      </p>

      <div className="p-4 bg-white border border-[#c4c7c7] w-full max-w-xs mb-2">
        <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">
          QR Payload (Order ID)
        </p>
        <p className="font-mono text-xs text-[#151c27] break-all">{snapshot.qrPayload}</p>
      </div>
      <p className="font-sans text-[10px] text-[#444748]/70 mb-8 italic">
        Rendered QR image not generated this sprint — see report for why.
      </p>

      <div className="w-full bg-[#151c27] text-white p-6 rounded-xl text-left relative overflow-hidden">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="font-sans text-[10px] text-[#c8c6c5] uppercase tracking-widest mb-1">
              Garment Passport
            </p>
            <h4 className="font-fraunces italic text-lg">{snapshot.design.model}</h4>
          </div>
          <span className="material-symbols-outlined text-[#c8c6c5]">badge</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-sans text-[10px] text-[#c8c6c5] uppercase">Fabric</p>
            <p className="font-sans text-sm">
              {snapshot.design.fabric} · {snapshot.design.color}
            </p>
          </div>
          <div>
            <p className="font-sans text-[10px] text-[#c8c6c5] uppercase">Order Number</p>
            <p className="font-sans text-sm">{orderNumber}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
