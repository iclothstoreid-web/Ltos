import { SectionShell } from './SectionShell'

interface ShippingInfoSectionProps {
  statusLabel: string
  courier: string
  trackingNumber: string
  estimatedArrival: string
  ctaLabel: string
}

// Milestone 5's "in transit" info card — deliberately a quiet bordered card
// with editorial typography rather than a carrier-tracking-site layout
// (brief: "Jangan menyerupai website ekspedisi"). "Lacak Pengiriman" has no
// handler yet — a real placeholder action per brief, not wired to any
// integration this sprint.
export function ShippingInfoSection({
  statusLabel,
  courier,
  trackingNumber,
  estimatedArrival,
  ctaLabel,
}: ShippingInfoSectionProps) {
  return (
    <SectionShell>
      <div className="border border-[#151c27]/10 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-dot shrink-0" />
          <p className="font-fraunces text-lg text-on-surface">{statusLabel}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <dt className="font-sans text-[10px] uppercase tracking-widest text-secondary mb-1">Kurir</dt>
            <dd className="font-sans text-sm text-on-surface">{courier}</dd>
          </div>
          <div>
            <dt className="font-sans text-[10px] uppercase tracking-widest text-secondary mb-1">No. Resi</dt>
            <dd className="font-sans text-sm text-on-surface">{trackingNumber}</dd>
          </div>
          <div className="col-span-2">
            <dt className="font-sans text-[10px] uppercase tracking-widest text-secondary mb-1">Estimasi Tiba</dt>
            <dd className="font-fraunces text-base text-on-surface">{estimatedArrival}</dd>
          </div>
        </dl>
        <button
          type="button"
          className="w-full mt-8 py-3.5 border border-primary text-primary font-sans text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-colors"
        >
          {ctaLabel}
        </button>
      </div>
    </SectionShell>
  )
}
