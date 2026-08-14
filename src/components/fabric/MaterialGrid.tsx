import type { FabricMaterial, MaterialColor } from '@/types/material'
import { MaterialCard } from './MaterialCard'

interface MaterialGridProps {
  materials: FabricMaterial[]
  emptyMessage?: string
  // Sprint W3-4 §9 — optional, keyed by material id. Only bounded call
  // sites (Related Materials, capped at 4) pass this; the main Explorer
  // grid omits it, same reasoning as MaterialCard's own `colors` prop.
  colorsByMaterialId?: Record<string, MaterialColor[]>
}

// First row's worth of cards get `priority` (LCP candidates, above the
// fold on both desktop and mobile grid widths) — the rest lazy-load as
// next/image already does by default.
const PRIORITY_COUNT = 4

export function MaterialGrid({ materials, emptyMessage = 'No fabrics match your search.', colorsByMaterialId }: MaterialGridProps) {
  if (materials.length === 0) {
    return (
      <div role="status" className="rounded-2xl border border-luxury-gold/10 bg-luxury-charcoal/20 py-16 text-center font-luxury-sans text-sm text-luxury-taupe">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {materials.map((material, i) => (
        <MaterialCard
          key={material.id}
          material={material}
          priority={i < PRIORITY_COUNT}
          colors={colorsByMaterialId?.[material.id]}
          position={i}
        />
      ))}
    </div>
  )
}

export function MaterialGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid animate-pulse grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-luxury-gold/10 bg-luxury-charcoal/30">
          <div className="aspect-[4/5] bg-luxury-navy-deep" />
          <div className="space-y-2 p-4">
            <div className="h-2 w-1/3 rounded bg-luxury-gold/15" />
            <div className="h-3 w-2/3 rounded bg-luxury-ivory/10" />
            <div className="h-2 w-1/2 rounded bg-luxury-taupe/10" />
          </div>
        </div>
      ))}
    </div>
  )
}
