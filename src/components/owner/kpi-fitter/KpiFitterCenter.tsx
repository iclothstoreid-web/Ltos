'use client'

import { useState } from 'react'
import { LeftSidebar } from '@/components/command-center/OwnerCommandCenter/LeftSidebar'
import { OwnerTopBar } from '@/components/command-center/OwnerCommandCenter/OwnerTopBar'
import type { FitterKpiRow } from '@/lib/fitter/types'
import { formatRupiah } from '@/lib/format/money'
import { FitterStatCard } from './FitterStatCard'
import { FitterKpiTable } from '../kpi-operator/FitterKpiTable'
import { FitterDetailModal } from '../kpi-operator/FitterDetailModal'

export type KpiFitterCenterProps = {
  profileName: string
  fitters: FitterKpiRow[]
}

// Sprint K (LOCK V1) §9 -- KPI Fitter is now its own page (was a table
// section at the bottom of /command-center/kpi-operator). Same chrome/stat-
// card pattern as KpiOperatorCenter; FitterKpiTable/FitterDetailModal are
// reused as-is from kpi-operator, not duplicated.
export function KpiFitterCenter({ profileName, fitters }: KpiFitterCenterProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [selectedFitterId, setSelectedFitterId] = useState<string | null>(null)

  const totalKonsultasi = fitters.reduce((sum, f) => sum + f.total_konsultasi, 0)
  const totalOrderDibuat = fitters.reduce((sum, f) => sum + f.order_dibuat, 0)
  const totalRevenue = fitters.reduce((sum, f) => sum + f.total_revenue, 0)

  return (
    <div className="min-h-screen bg-surface-01 text-text-primary flex atelier-bg">
      <LeftSidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <OwnerTopBar profileName={profileName} onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 sm:py-10 max-w-[1440px] w-full mx-auto space-y-10">
          <section>
            <p className="text-label text-secondary uppercase tracking-widest mb-3">KPI Fitter</p>
            <h1 className="font-serif text-heading-md text-text-primary leading-[1.2] font-normal">
              Performa Fitter
            </h1>
            <p className="text-body-md text-secondary mt-3 leading-relaxed max-w-[52ch]">
              Konsultasi, closing, konversi pembayaran, dan revenue per Fitter.
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <FitterStatCard label="Fitter Aktif" displayValue={fitters.length.toLocaleString('id-ID')} />
            <FitterStatCard label="Total Konsultasi" displayValue={totalKonsultasi.toLocaleString('id-ID')} />
            <FitterStatCard label="Total Order Dibuat" displayValue={totalOrderDibuat.toLocaleString('id-ID')} />
            <FitterStatCard label="Total Revenue" displayValue={formatRupiah(totalRevenue)} />
          </section>

          <FitterKpiTable fitters={fitters} onSelectFitter={setSelectedFitterId} />
        </main>
      </div>

      {selectedFitterId && (
        <FitterDetailModal fitterId={selectedFitterId} onClose={() => setSelectedFitterId(null)} />
      )}
    </div>
  )
}
