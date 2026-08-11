import Link from 'next/link'
import type { MaterialColor } from '@/types/material'
import { buildColorHref } from '@/lib/materials/colorUrlHelpers'

interface FabricColorSwatchesProps {
  basePath: string
  colors: MaterialColor[]
  selectedColorSlug: string | null
}

// Server-rendered — no client state (§13 "minimal client state"). Each
// swatch is a real <Link> toggling ?color= on/off; the hover tooltip is
// pure CSS (group-hover), same pattern ZoomableImage.tsx's "Click to
// enlarge" label already uses, so no JS is needed for it either.
export function FabricColorSwatches({ basePath, colors, selectedColorSlug }: FabricColorSwatchesProps) {
  if (colors.length === 0) return null

  return (
    <div>
      <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">
        Available in {colors.length} color{colors.length === 1 ? '' : 's'}
      </p>
      <ul className="mt-2 flex flex-wrap gap-2" role="list" aria-label="Available colors">
        {colors.map((color) => {
          const selected = color.slug === selectedColorSlug
          return (
            <li key={color.id} className="group relative">
              <Link
                href={buildColorHref(basePath, color.slug, selectedColorSlug)}
                aria-label={`${color.name}${selected ? ' (selected)' : ''}`}
                aria-current={selected ? 'true' : undefined}
                className={`block h-9 w-9 rounded-full border-2 transition focus-visible:ring-2 focus-visible:ring-luxury-gold/50 ${
                  selected ? 'border-luxury-gold' : 'border-luxury-ivory/20 hover:border-luxury-gold/60'
                }`}
                style={{ backgroundColor: color.hex ?? '#888888' }}
              />
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-luxury-black/90 px-2 py-1 font-luxury-sans text-[10px] text-luxury-ivory opacity-0 transition group-hover:opacity-100"
              >
                {color.name}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
