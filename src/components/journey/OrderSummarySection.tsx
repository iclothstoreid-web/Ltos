import type { DesignSelections } from '@/components/workspace/design-studio/types'
import { SectionShell } from './SectionShell'
import { SectionEyebrow } from './SectionEyebrow'

interface OrderSummarySectionProps {
  design: DesignSelections
  notes: string
}

// Exactly the 9 fields the brief lists for Ringkasan Pesanan — design.lookCutting
// exists on DesignSelections but isn't part of that list, so it's intentionally
// left out here (TechnicalDetailsCard, the Fitter-facing equivalent, does show it).
export function OrderSummarySection({ design, notes }: OrderSummarySectionProps) {
  const rows = [
    { label: 'Jenis Kain', value: design.fabric },
    { label: 'Warna', value: design.color },
    { label: 'Model Thobe', value: design.model },
    { label: 'Model Kerah', value: design.collar },
    { label: 'Model Manset', value: design.cuff },
    { label: 'Model Plaket', value: design.plaket },
    { label: 'Model Saku', value: design.pocket },
    { label: 'Aksesori', value: design.button },
    { label: 'Catatan', value: notes },
  ]

  return (
    <SectionShell divider={false}>
      <SectionEyebrow>Ringkasan Pesanan</SectionEyebrow>
      <dl className="space-y-4">
        {rows.map(row => (
          <div key={row.label} className="flex justify-between gap-6 border-b border-[#151c27]/8 pb-3">
            <dt className="font-sans text-sm text-secondary shrink-0">{row.label}</dt>
            <dd className="font-sans text-sm text-on-surface text-right">{row.value || '—'}</dd>
          </div>
        ))}
      </dl>
    </SectionShell>
  )
}
