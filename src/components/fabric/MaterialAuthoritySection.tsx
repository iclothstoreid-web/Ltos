import type { MaterialAuthorityContent } from '@/types/material'

interface MaterialAuthoritySectionProps {
  materialName: string
  content: MaterialAuthorityContent
}

const ROWS: { key: keyof MaterialAuthorityContent; heading: string }[] = [
  { key: 'whyChoose', heading: 'Why Choose This Fabric' },
  { key: 'whenToWear', heading: 'When to Wear It' },
  { key: 'climateSuitability', heading: 'Climate Suitability' },
  { key: 'tailoringRecommendation', heading: 'Tailoring Recommendation' },
  { key: 'maintenanceGuide', heading: 'Maintenance Guide' },
]

// §5 — every paragraph here comes from getMaterialAuthorityContent()
// (materialRepository.ts), composed strictly from the material's own real
// fields plus getMaterialSpecifications()'s already-disclosed fallback
// text. h3 subheadings under this section's own h2, keeping the page's
// heading hierarchy correct (single h1, this is the only h2 that owns
// h3s at this level).
export function MaterialAuthoritySection({ materialName, content }: MaterialAuthoritySectionProps) {
  return (
    <section aria-labelledby="material-authority-heading">
      <h2 id="material-authority-heading" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
        About {materialName}
      </h2>
      <div className="mt-4 space-y-5">
        {ROWS.map((row) => (
          <div key={row.key}>
            <h3 className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold">{row.heading}</h3>
            <p className="mt-1 font-luxury-sans text-sm leading-relaxed text-luxury-taupe">{content[row.key]}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
