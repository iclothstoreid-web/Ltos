import { SectionShell } from './SectionShell'

interface ShippingInfoSectionProps {
  statusLabel: string
  courier: string | null
  trackingNumber: string | null
  estimatedArrival: string
  ctaLabel: string
  trackingUrl: string | null
}

// Milestone 5's "in transit" info card — deliberately a quiet bordered card
// with editorial typography rather than a carrier-tracking-site layout
// (brief: "Jangan menyerupai website ekspedisi"). Kurir/No. Resi now come
// from the real Shipping stage data (Approve Shipping, see
// ProductionPacketWorkspace/ShippingReferencePanel) instead of static copy.
// Per the brief: while the operator hasn't saved a resi yet, show a quiet
// "belum tersedia" placeholder and omit "Lacak Pengiriman" entirely, rather
// than a disabled/dead button — the CTA only ever appears once there's
// somewhere real for it to go.
export function ShippingInfoSection({
  statusLabel,
  courier,
  trackingNumber,
  estimatedArrival,
  ctaLabel,
  trackingUrl,
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
            <dd className="font-sans text-sm text-on-surface break-words">{courier ?? 'Belum tersedia'}</dd>
          </div>
          <div>
            <dt className="font-sans text-[10px] uppercase tracking-widest text-secondary mb-1">No. Resi</dt>
            <dd className="font-sans text-sm text-on-surface break-all">{trackingNumber ?? 'Belum tersedia'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="font-sans text-[10px] uppercase tracking-widest text-secondary mb-1">Estimasi Tiba</dt>
            <dd className="font-fraunces text-base text-on-surface">{estimatedArrival}</dd>
          </div>
        </dl>
        {trackingNumber && trackingUrl && (
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full mt-8 py-3.5 border border-primary text-primary font-sans text-xs uppercase tracking-widest text-center hover:bg-primary hover:text-white transition-colors"
          >
            {ctaLabel}
          </a>
        )}
      </div>
    </SectionShell>
  )
}
