import type { FabricMaterial } from '@/types/material'
import { MaterialCard } from './MaterialCard'

interface MaterialGridProps {
  materials: FabricMaterial[]
  emptyMessage?: string
}

export function MaterialGrid({ materials, emptyMessage = 'Belum ada material tersedia.' }: MaterialGridProps) {
  if (materials.length === 0) {
    return (
      <div className="rounded-2xl border border-luxury-gold/10 bg-luxury-charcoal/20 py-16 text-center font-luxury-sans text-sm text-luxury-taupe">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {materials.map((material) => (
        <MaterialCard key={material.id} material={material} />
      ))}
    </div>
  )
}
