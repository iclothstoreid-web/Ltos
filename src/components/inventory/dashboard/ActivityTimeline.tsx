import { ArrowDownToLine, ArrowUpFromLine, Lock, SlidersHorizontal, Unlock } from 'lucide-react'
import type { MovementType } from '@/lib/inventory/types'

export interface ActivityItem {
  id: string
  movementType: MovementType
  quantity: number
  unit: string
  materialName: string
  notes: string | null
  createdAt: string
  actorName: string | null
}

const MOVEMENT_ICON: Record<MovementType, typeof ArrowDownToLine> = {
  stock_in: ArrowDownToLine,
  stock_out: ArrowUpFromLine,
  reservation: Lock,
  release: Unlock,
  adjustment: SlidersHorizontal,
}

const MOVEMENT_LABEL: Record<MovementType, string> = {
  stock_in: 'Stok Masuk',
  stock_out: 'Stok Keluar',
  reservation: 'Reservasi Material',
  release: 'Release Reservasi',
  adjustment: 'Penyesuaian Stok',
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <div className="bg-surface/45 border border-outline-variant/60 rounded-[2rem] p-8 elev-1">
      <h3 className="font-serif text-title text-on-surface mb-8">Aktivitas Hari Ini</h3>

      {items.length === 0 ? (
        <p className="text-body text-secondary">Belum ada aktivitas hari ini.</p>
      ) : (
        <div className="space-y-8 relative">
          <div className="absolute left-[19px] top-6 bottom-4 w-0.5 bg-outline-variant/30" />
          {items.map(item => {
            const Icon = MOVEMENT_ICON[item.movementType]
            return (
              <div key={item.id} className="flex gap-6 relative">
                <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface z-10 shadow-sm border border-outline-variant/30 shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <p className="text-body font-medium text-on-surface">{MOVEMENT_LABEL[item.movementType]}</p>
                    <span className="text-label text-secondary/70 whitespace-nowrap">{timeLabel(item.createdAt)}</span>
                  </div>
                  <p className="text-label text-secondary mt-1">
                    {item.quantity.toLocaleString('id-ID')} {item.unit} {item.materialName}
                    {item.actorName ? ` · ${item.actorName}` : ''}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
