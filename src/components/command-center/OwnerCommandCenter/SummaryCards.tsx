import { KpiCard } from './cards/KpiCard'

export function SummaryCards({
  revenueToday,
  revenueThisMonth,
  activeOrders,
  productionToday,
  qcToday,
}: {
  revenueToday: number
  revenueThisMonth: number
  activeOrders: number
  productionToday: number
  qcToday: number
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
      <KpiCard label="Pendapatan Hari Ini" value={revenueToday} format="currency" />
      <KpiCard label="Pendapatan Bulan Ini" value={revenueThisMonth} format="currency" />
      <KpiCard label="Order Aktif" value={activeOrders} />
      <KpiCard label="Produksi Hari Ini" value={productionToday} />
      <KpiCard label="QC Hari Ini" value={qcToday} />
    </div>
  )
}
