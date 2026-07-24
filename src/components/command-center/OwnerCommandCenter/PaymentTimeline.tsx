import { Check, Circle } from 'lucide-react'
import type { OrderInvoice } from '@/lib/commercial/types'

interface PaymentTimelineProps {
  invoice: OrderInvoice
  productionStarted: boolean
  deliveryCompleted: boolean
}

// A read-only view of the existing quotation, payment, production, and
// delivery signals. It deliberately creates no financial or workflow state.
export function PaymentTimeline({ invoice, productionStarted, deliveryCompleted }: PaymentTimelineProps) {
  const hasDp = invoice.payments.some(payment => payment.payment_type === 'dp')
  const hasSettlement = invoice.payments.some(
    payment => payment.payment_type === 'pelunasan' || payment.payment_type === 'full'
  )
  const steps = [
    { label: 'Quotation', complete: invoice.has_quotation },
    { label: 'DP', complete: hasDp || invoice.payment_status === 'lunas' },
    { label: 'Production', complete: productionStarted },
    { label: 'Pelunasan', complete: hasSettlement || invoice.payment_status === 'lunas' },
    { label: 'Delivery', complete: deliveryCompleted },
    { label: 'Paid', complete: invoice.payment_status === 'lunas' },
  ]

  return (
    <div>
      <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-3">
        Timeline Pembayaran
      </p>
      <ol className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-6 sm:gap-2">
        {steps.map((step, index) => (
          <li key={step.label} className="flex items-center gap-2 sm:flex-col sm:items-start">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                step.complete
                  ? 'border-[#1f6b2c] bg-[#1f6b2c] text-white'
                  : 'border-[#c4c7c7] bg-white text-[#8a8a8d]'
              }`}
              aria-label={`${step.label}: ${step.complete ? 'selesai' : 'belum selesai'}`}
            >
              {step.complete ? <Check size={12} /> : <Circle size={8} fill="currentColor" />}
            </span>
            <span className="font-hanken text-xs text-[#46464c]">
              {step.label}
              {index < steps.length - 1 && <span className="hidden sm:inline text-[#a5a5a7]"> /</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
