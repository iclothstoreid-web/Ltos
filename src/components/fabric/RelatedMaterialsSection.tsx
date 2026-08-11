import type { FabricMaterial } from '@/types/material'
import { MaterialGrid } from './MaterialGrid'

interface RelatedMaterialsSectionProps {
  materials: FabricMaterial[]
}

export function RelatedMaterialsSection({ materials }: RelatedMaterialsSectionProps) {
  if (materials.length === 0) return null

  return (
    <section aria-labelledby="related-materials-heading">
      <h2 id="related-materials-heading" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
        Related Materials
      </h2>
      <div className="mt-4">
        <MaterialGrid materials={materials} />
      </div>
    </section>
  )
}
