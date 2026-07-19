import { Camera, Download, Upload } from 'lucide-react'
import type { Material } from '@/lib/inventory/types'
import { MaterialCard } from './MaterialCard'

interface MaterialGridProps {
  materials: Material[]
  usedInFitterIds: Set<string>
  onSelectMaterial: (id: string) => void
}

export function MaterialGrid({ materials, usedInFitterIds, onSelectMaterial }: MaterialGridProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-label font-bold text-secondary uppercase tracking-[0.2em]">
          Daftar Item <span className="opacity-60">({materials.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            disabled
            title="Belum tersedia — kamera perangkat belum terhubung"
            className="p-2.5 bg-surface border border-outline-variant/60 rounded-xl text-secondary/50 cursor-not-allowed"
          >
            <Camera size={16} />
          </button>
          <button
            disabled
            title="Belum tersedia — import/export belum diimplementasikan"
            className="p-2.5 bg-surface border border-outline-variant/60 rounded-xl text-secondary/50 cursor-not-allowed"
          >
            <Upload size={16} />
          </button>
          <button
            disabled
            title="Belum tersedia — import/export belum diimplementasikan"
            className="p-2.5 bg-surface border border-outline-variant/60 rounded-xl text-secondary/50 cursor-not-allowed"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="border border-dashed border-outline-variant/50 rounded-2xl py-16 text-center text-secondary">
          <p className="text-body">Belum ada material di katalog ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {materials.map(material => (
            <MaterialCard
              key={material.id}
              material={material}
              usedInFitter={usedInFitterIds.has(material.id)}
              onClick={() => onSelectMaterial(material.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
