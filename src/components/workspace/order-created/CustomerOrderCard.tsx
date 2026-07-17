'use client'

interface CustomerOrderCardProps {
  customerName: string
  customerId: string
  isPreferred: boolean
  orderNumber: string
}

export function CustomerOrderCard({ customerName, customerId, isPreferred, orderNumber }: CustomerOrderCardProps) {
  return (
    <section className="bg-white/70 backdrop-blur-sm border-[0.5px] border-[#c4c7c7]/40 shadow-sm p-4 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full bg-[#e2e8f8] flex items-center justify-center mb-4 border-[0.5px] border-[#747878]">
        <span className="font-fraunces text-2xl text-[#151c27]">{customerName.charAt(0).toUpperCase()}</span>
      </div>
      <h2 className="font-fraunces text-xl text-[#151c27] mb-1">{customerName}</h2>
      <p className="font-sans text-[10px] text-[#444748] uppercase tracking-widest mb-4">
        #{customerId.slice(0, 8).toUpperCase()}
      </p>
      <div className="w-full h-[0.5px] bg-[#c4c7c7] my-4" />
      <div className="w-full text-left space-y-3">
        <div className="flex justify-between">
          <span className="font-sans text-[10px] text-[#444748] uppercase">Order No.</span>
          <span className="font-sans text-xs font-bold text-[#151c27]">{orderNumber}</span>
        </div>
        {isPreferred && (
          <div className="flex justify-between items-center">
            <span className="font-sans text-[10px] text-[#444748] uppercase">Status</span>
            <span className="px-2 py-1 bg-[#ffdea5] text-[#261900] text-[10px] font-bold uppercase tracking-widest">
              Preferred Client
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
