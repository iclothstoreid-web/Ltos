'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LeftSidebar } from '@/components/command-center/OwnerCommandCenter/LeftSidebar'
import { OwnerTopBar } from '@/components/command-center/OwnerCommandCenter/OwnerTopBar'
import type { BottleneckDashboard, CapacityDashboard, KpiDashboard, OperatorKpiRow } from '@/lib/kpi/types'
import { OperatorStatCard } from './OperatorStatCard'
import { BottleneckSummary } from './BottleneckSummary'
import { OperatorKpiTable } from './OperatorKpiTable'
import { OperatorDetailModal } from './OperatorDetailModal'

export type KpiOperatorCenterProps = {
  profileName: string
  kpiDashboard: KpiDashboard
  capacityDashboard: CapacityDashboard
  bottleneckDashboard: BottleneckDashboard
  operators: OperatorKpiRow[]
}

// Owner OS's new "KPI Operator" page (Sprint G). Same chrome
// (LeftSidebar/OwnerTopBar) as OwnerCommandCenter/CommunicationsCenter --
// every summary number comes straight from Sprint B-F's existing
// get_kpi_dashboard/get_capacity_dashboard/get_bottleneck_dashboard, and the
// operator table/detail modal come from the two new Sprint G RPCs.
export function KpiOperatorCenter({
  profileName,
  kpiDashboard,
  capacityDashboard,
  bottleneckDashboard,
  operators,
}: KpiOperatorCenterProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-surface-01 text-text-primary flex atelier-bg">
      <LeftSidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <OwnerTopBar profileName={profileName} onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 sm:py-10 max-w-[1440px] w-full mx-auto space-y-10">
          <section>
            <p className="text-label text-secondary uppercase tracking-widest mb-3">KPI Operator</p>
            <h1 className="font-serif text-heading-md text-text-primary leading-[1.2] font-normal">
              Performa Operator Produksi
            </h1>
            <p className="text-body-md text-secondary mt-3 leading-relaxed max-w-[52ch]">
              Ringkasan kapasitas, throughput, dan performa setiap operator.
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <OperatorStatCard label="Total Operator Aktif" value={capacityDashboard.total_operator_aktif} />
            <OperatorStatCard label="Total Order Aktif" value={kpiDashboard.total_order_aktif} />
            <OperatorStatCard label="Total Order Selesai" value={kpiDashboard.total_order_selesai} />
            <OperatorStatCard
              label="Average Production Time"
              value={kpiDashboard.average_production_time_days}
              suffix="hari"
            />
            <OperatorStatCard
              label="Capacity Utilization"
              value={capacityDashboard.capacity_utilization_pct}
              suffix="%"
            />
            <OperatorStatCard label="Throughput Hari Ini" value={kpiDashboard.throughput_hari_ini} suffix="order" />
            <OperatorStatCard
              label="Throughput Minggu Ini"
              value={kpiDashboard.throughput_minggu_ini}
              suffix="order"
            />
          </section>

          <BottleneckSummary data={bottleneckDashboard} />

          <OperatorKpiTable operators={operators} onSelectOperator={setSelectedOperatorId} />

          <Link
            href="/command-center/kpi-fitter"
            className="group flex items-center justify-between gap-4 rounded-[14px] border border-outline-variant/85 bg-surface/45 px-6 py-5 elev-1 hover:-translate-y-[1px] transition-all duration-200"
          >
            <div>
              <p className="text-label text-secondary uppercase tracking-[0.24em]">Daftar Fitter</p>
              <p className="text-body-md text-secondary mt-1">Konsultasi, closing, revenue, dan ranking per Fitter.</p>
            </div>
            <span className="flex items-center gap-1 text-body text-primary shrink-0">
              Lihat KPI Fitter
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </main>
      </div>

      {selectedOperatorId && (
        <OperatorDetailModal operatorId={selectedOperatorId} onClose={() => setSelectedOperatorId(null)} />
      )}
    </div>
  )
}
