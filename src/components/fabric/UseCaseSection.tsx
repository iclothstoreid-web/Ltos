import { getMaterialUseCases } from '@/lib/materials/materialRepository'
import type { FabricMaterial } from '@/types/material'

interface UseCaseSectionProps {
  material: FabricMaterial
}

export function UseCaseSection({ material }: UseCaseSectionProps) {
  const useCases = getMaterialUseCases(material)
  if (useCases.length === 0) return null

  return (
    <section aria-labelledby="use-case-heading">
      <h2 id="use-case-heading" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
        Ideal For
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {useCases.map((useCase) => (
          <li
            key={useCase}
            className="rounded-full border border-luxury-gold/25 bg-luxury-gold/10 px-4 py-1.5 font-luxury-sans text-xs text-luxury-ivory"
          >
            {useCase}
          </li>
        ))}
      </ul>
    </section>
  )
}
