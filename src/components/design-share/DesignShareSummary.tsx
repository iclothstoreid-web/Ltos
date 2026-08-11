import type { Estimate } from '@/types/configurator'
import { formatRupiah } from '@/lib/format/money'
import { SERVICE_LEVEL_LABELS } from '@/lib/configurator/eta'

interface DesignShareSummaryProps {
  estimate: Estimate
}

// Read-only equivalent of PriceSummaryCard's "ready" state — no service
// level selector, no checkout action (this page has no configurator
// session to mutate). Server-rendered, so there's no loading/idle/error
// state to show: by the time this renders, the estimate is already
// resolved.
export function DesignShareSummary({ estimate }: DesignShareSummaryProps) {
  return (
    <div className="rounded-2xl border border-luxury-gold/15 bg-luxury-charcoal/40 p-6">
      <h3 className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-ivory">Ringkasan Desain</h3>

      <p className="mt-3 font-luxury-sans text-xs text-luxury-taupe">
        Service Level: <span className="text-luxury-gold">{SERVICE_LEVEL_LABELS[estimate.serviceLevel]}</span>
      </p>

      <ul className="mt-4 space-y-1.5">
        {estimate.breakdown.map((line, i) => (
          <li key={`${line.kind}-${line.optionId ?? i}`} className="flex justify-between font-luxury-sans text-xs text-luxury-taupe">
            <span>{line.label}</span>
            <span className="text-luxury-ivory">{formatRupiah(line.amount)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex justify-between border-t border-luxury-gold/15 pt-3 font-luxury-sans text-sm">
        <span className="text-luxury-ivory">Estimasi Total</span>
        <span className="text-luxury-gold">{formatRupiah(estimate.total)}</span>
      </div>

      <dl className="mt-3 space-y-1 border-t border-luxury-gold/15 pt-3 font-luxury-sans text-xs">
        <div className="flex justify-between">
          <dt className="text-luxury-taupe">Estimasi Produksi</dt>
          <dd className="text-luxury-ivory">{estimate.productionDays} hari kerja</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-luxury-taupe">Tanggal Selesai</dt>
          <dd className="text-luxury-ivory">{estimate.completionDateFormatted}</dd>
        </div>
      </dl>

      <p className="mt-3 font-luxury-sans text-[10px] text-luxury-taupe">
        Estimasi awal, bukan harga atau tanggal final — akan dikonfirmasi Fitter saat konsultasi.
      </p>
    </div>
  )
}
