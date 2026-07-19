import Link from 'next/link'
import { Lock } from 'lucide-react'

export function ReservedNotice({ reservedTotal, orderCount }: { reservedTotal: number; orderCount: number }) {
  return (
    <div className="bg-surface/45 backdrop-blur-sm text-on-surface p-6 rounded-2xl flex items-center justify-between border border-outline-variant/60 elev-1">
      <div className="flex items-center gap-5">
        <div className="bg-surface-container p-3 rounded-xl">
          <Lock size={20} />
        </div>
        <div>
          <h4 className="font-serif text-title text-on-surface">Material Reserved</h4>
          <p className="text-body text-secondary">
            {reservedTotal.toLocaleString('id-ID')} unit dialokasikan untuk {orderCount} order aktif.
          </p>
        </div>
      </div>
      <Link
        href="/inventory/material?filter=reserved"
        className="bg-surface-container text-on-surface px-5 py-2.5 rounded-xl text-label uppercase tracking-widest hover:bg-outline-variant/40 transition-all whitespace-nowrap"
      >
        Detail Reservasi
      </Link>
    </div>
  )
}
