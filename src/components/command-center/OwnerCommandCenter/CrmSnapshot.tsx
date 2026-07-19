import { KpiCard } from './cards/KpiCard'

export function CrmSnapshot({
  newLeads,
  consultationsToday,
  waitingQuotation,
  waitingDp,
  followUpToday,
  vipCustomers,
}: {
  newLeads: number
  consultationsToday: number
  waitingQuotation: number
  waitingDp: number
  followUpToday: number
  vipCustomers: number
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Snapshot CRM</h2>
        <p className="text-body text-secondary">Perjalanan pelanggan hari ini</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Lead Baru" value={newLeads} />
        <KpiCard label="Konsultasi Hari Ini" value={consultationsToday} />
        <KpiCard label="Menunggu Quotation" value={waitingQuotation} />
        <KpiCard label="Menunggu DP" value={waitingDp} />
        <KpiCard label="Follow Up Hari Ini" value={followUpToday} />
        <KpiCard label="Customer VIP" value={vipCustomers} />
      </div>
    </section>
  )
}
