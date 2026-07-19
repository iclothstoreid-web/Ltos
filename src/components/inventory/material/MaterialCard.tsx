import { Layers } from 'lucide-react'
import type { Material } from '@/lib/inventory/types'
import { materialStockStatus, STOCK_STATUS_LABEL } from '@/lib/inventory/types'

const STATUS_STYLE: Record<ReturnType<typeof materialStockStatus>, string> = {
  aman: 'bg-primary/5 text-primary border-primary/10',
  menipis: 'bg-warm-gold/10 text-warm-gold border-warm-gold/20',
  habis: 'bg-error/10 text-error border-error/10',
}

export function MaterialCard({ material, usedInFitter, onClick }: { material: Material; usedInFitter: boolean; onClick: () => void }) {
  const status = materialStockStatus(material)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group bg-surface rounded-xl border border-outline-variant/40 overflow-hidden text-left transition-all hover:-translate-y-[2px] hover:shadow-lg hover:shadow-black/[0.04]"
    >
      <div className="h-40 bg-surface-container relative overflow-hidden">
        {material.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL
          <img
            src={material.photo_url}
            alt={material.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary/40">
            <Layers size={28} />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${STATUS_STYLE[status]}`}>
            {STOCK_STATUS_LABEL[status]}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h4 className="font-serif text-body font-bold text-on-surface truncate">{material.name}</h4>
        <p className="text-label text-secondary/70 mt-1 uppercase tracking-wider">
          {material.material_categories?.name ?? '—'}
        </p>
        <div className="flex items-end justify-between mt-5 pt-4 border-t border-outline-variant/20">
          <div>
            <p className="text-[10px] text-secondary/60 uppercase tracking-widest font-bold">Stok</p>
            <p className="text-body font-bold text-on-surface">
              {material.available_stock.toLocaleString('id-ID')}{' '}
              <span className="text-label font-normal text-secondary/70">{material.unit}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-secondary/60 uppercase tracking-widest font-bold">Harga</p>
            <p className="text-label font-bold text-on-surface">Rp {material.price.toLocaleString('id-ID')}</p>
          </div>
        </div>
        {usedInFitter && (
          <p className="mt-3 text-[10px] font-bold text-primary/80 bg-primary/5 border border-primary/10 rounded-full px-2.5 py-1 inline-block uppercase tracking-wider">
            Digunakan di Fitter App
          </p>
        )}
      </div>
    </button>
  )
}
