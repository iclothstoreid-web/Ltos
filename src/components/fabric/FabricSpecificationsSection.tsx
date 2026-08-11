import { getMaterialSpecifications } from '@/lib/materials/materialRepository'
import type { FabricMaterial } from '@/types/material'

interface FabricSpecificationsSectionProps {
  material: FabricMaterial
}

const SPEC_LABELS: { key: keyof ReturnType<typeof getMaterialSpecifications>; label: string; icon: string }[] = [
  { key: 'best_for', label: 'Best For', icon: 'check_circle' },
  { key: 'recommended_garments', label: 'Recommended Garments', icon: 'checkroom' },
  { key: 'climate', label: 'Climate', icon: 'thermostat' },
  { key: 'occasion', label: 'Occasion', icon: 'event' },
  { key: 'drape_character', label: 'Drape Character', icon: 'waves' },
  { key: 'structure', label: 'Structure', icon: 'architecture' },
  { key: 'comfort', label: 'Comfort', icon: 'self_improvement' },
  { key: 'durability', label: 'Durability', icon: 'shield' },
]

export function FabricSpecificationsSection({ material }: FabricSpecificationsSectionProps) {
  const specs = getMaterialSpecifications(material)

  return (
    <section aria-labelledby="fabric-specs-heading">
      <h2 id="fabric-specs-heading" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
        Fabric Specifications
      </h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-luxury-gold/10">
        <table className="w-full min-w-[420px] border-collapse font-luxury-sans text-sm">
          <caption className="sr-only">Fabric specifications for {material.name}</caption>
          <tbody>
            {SPEC_LABELS.map((row, i) => (
              <tr key={row.key} className={i % 2 === 0 ? 'bg-luxury-charcoal/20' : ''}>
                <th scope="row" className="flex items-center gap-2 px-4 py-3 text-left font-normal text-luxury-taupe">
                  <span aria-hidden="true" className="material-symbols-outlined text-base text-luxury-gold">
                    {row.icon}
                  </span>
                  {row.label}
                </th>
                <td className="px-4 py-3 text-luxury-ivory">{specs[row.key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
