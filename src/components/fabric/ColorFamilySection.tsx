import Link from 'next/link'
import type { MaterialColorFamily } from '@/types/material'
import { buildColorHref } from '@/lib/materials/colorUrlHelpers'

interface ColorFamilySectionProps {
  basePath: string
  families: MaterialColorFamily[]
  selectedColorSlug: string | null
}

// §6 — groups the same colors FabricColorSwatches already shows, by real
// `family` values (see getMaterialColorFamilies() — "Other" bucket for
// colors with no family set, always sorted last).
export function ColorFamilySection({ basePath, families, selectedColorSlug }: ColorFamilySectionProps) {
  if (families.length === 0) return null

  return (
    <section aria-labelledby="color-family-heading">
      <h2 id="color-family-heading" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
        Color Families
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {families.map((group) => (
          <div key={group.family} className="rounded-xl border border-luxury-gold/10 bg-luxury-charcoal/10 p-4">
            <p className="font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-gold">{group.family}</p>
            <ul className="mt-2 space-y-1">
              {group.colors.map((color) => {
                const selected = color.slug === selectedColorSlug
                return (
                  <li key={color.id}>
                    <Link
                      href={buildColorHref(basePath, color.slug, selectedColorSlug)}
                      aria-current={selected ? 'true' : undefined}
                      className={`inline-flex items-center gap-2 rounded font-luxury-sans text-sm transition focus-visible:ring-2 focus-visible:ring-luxury-gold/50 ${
                        selected ? 'text-luxury-gold' : 'text-luxury-ivory hover:text-luxury-gold'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-3 w-3 rounded-full border border-luxury-ivory/20"
                        style={{ backgroundColor: color.hex ?? '#888888' }}
                      />
                      {color.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
