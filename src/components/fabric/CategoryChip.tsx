import Link from 'next/link'
import { FABRIC_CATEGORY_LABELS, type FabricCategory } from '@/types/material'

interface CategoryChipProps {
  category: FabricCategory
  active?: boolean
}

// Foundation-only — no active-state routing logic beyond a boolean prop,
// no icon/count badge yet. Reused by both /fabric (all chips inactive) and
// /fabric/[category] (current category's chip marked active).
export function CategoryChip({ category, active = false }: CategoryChipProps) {
  return (
    <Link
      href={`/fabric/${category}`}
      className={`inline-flex items-center rounded-full border px-4 py-1.5 font-luxury-sans text-[11px] uppercase tracking-[0.14em] transition ${
        active
          ? 'border-luxury-gold bg-luxury-gold text-luxury-black'
          : 'border-luxury-gold/25 text-luxury-ivory hover:border-luxury-gold hover:text-luxury-gold'
      }`}
    >
      {FABRIC_CATEGORY_LABELS[category]}
    </Link>
  )
}
