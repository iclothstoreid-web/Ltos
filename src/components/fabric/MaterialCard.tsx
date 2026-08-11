import Link from 'next/link'
import { FABRIC_CATEGORY_LABELS, type FabricMaterial } from '@/types/material'

interface MaterialCardProps {
  material: FabricMaterial
}

// Foundation-only — no hover zoom, no video preview yet (both explicitly
// out of scope for W3-1). Links to the detail route via the material's own
// category, matching the [category]/[slug] route shape.
export function MaterialCard({ material }: MaterialCardProps) {
  return (
    <Link
      href={`/fabric/${material.category}/${material.slug}`}
      className="group block overflow-hidden rounded-2xl border border-luxury-gold/10 bg-luxury-charcoal/30 transition hover:border-luxury-gold/40"
    >
      <div className="aspect-[4/5] w-full overflow-hidden bg-luxury-navy-deep">
        {material.hero_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={material.hero_image}
            alt={material.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-luxury-sans text-[11px] uppercase tracking-[0.14em] text-luxury-taupe">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
          {FABRIC_CATEGORY_LABELS[material.category]}
        </p>
        <h3 className="mt-1 font-luxury-sans text-sm text-luxury-ivory">{material.name}</h3>
        {material.composition && (
          <p className="mt-1 font-luxury-sans text-xs text-luxury-taupe">{material.composition}</p>
        )}
      </div>
    </Link>
  )
}
