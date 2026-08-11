import {
  FABRIC_TEXTURE_LABELS,
  FABRIC_WEIGHT_CLASS_LABELS,
  LUXURY_LEVEL_MAX_RANK,
  luxuryScoreFromLevel,
  weightClassFromGsm,
  type FabricMaterial,
} from '@/types/material'

interface MaterialDnaSectionProps {
  material: FabricMaterial
}

// Weight bar is proportional against a 0-400gsm reference range (covers
// the realistic apparel-fabric span; heavier coatings are rare for a
// bespoke thobe catalog) — an honest visual since weight_gsm is a real
// number. Luxury level gets a 3-dot rating against luxuryScoreFromLevel()'s
// shared best-effort ranking (types/material.ts — Sprint W3-6 centralized
// this out of a local copy here) — the only two DNA properties with a bar/
// rating are the only two with an actual ordinal scale behind them.
// Everything else (composition, texture, breathability, wrinkle
// resistance, season, care) is free text or a closed label set with no
// natural 1-N scale, so it renders as a plain labeled row rather than a
// fabricated bar.
const WEIGHT_REFERENCE_MAX_GSM = 400

interface DnaRow {
  icon: string
  label: string
  value: string
  bar?: number // 0-1
  rating?: { value: number; max: number }
}

export function MaterialDnaSection({ material }: MaterialDnaSectionProps) {
  const rows: DnaRow[] = []

  if (material.composition) {
    rows.push({ icon: 'layers', label: 'Composition', value: material.composition })
  }
  if (material.weight_gsm != null) {
    const weightClass = weightClassFromGsm(material.weight_gsm)
    rows.push({
      icon: 'scale',
      label: 'Weight',
      value: `${material.weight_gsm} GSM${weightClass ? ` · ${FABRIC_WEIGHT_CLASS_LABELS[weightClass]}` : ''}`,
      bar: Math.min(material.weight_gsm / WEIGHT_REFERENCE_MAX_GSM, 1),
    })
  }
  if (material.texture) {
    rows.push({ icon: 'texture', label: 'Texture', value: FABRIC_TEXTURE_LABELS[material.texture] })
  }
  if (material.breathability) {
    rows.push({ icon: 'air', label: 'Breathability', value: material.breathability })
  }
  if (material.wrinkle_resistance) {
    rows.push({ icon: 'compress', label: 'Wrinkle Resistance', value: material.wrinkle_resistance })
  }
  if (material.luxury_level) {
    const rank = luxuryScoreFromLevel(material.luxury_level)
    rows.push({
      icon: 'workspace_premium',
      label: 'Luxury Level',
      value: material.luxury_level,
      rating: rank ? { value: rank, max: LUXURY_LEVEL_MAX_RANK } : undefined,
    })
  }
  if (material.season) {
    rows.push({ icon: 'wb_sunny', label: 'Season', value: material.season.replace('_', ' ') })
  }
  if (material.care_instruction) {
    rows.push({ icon: 'dry_cleaning', label: 'Care Instruction', value: material.care_instruction })
  }

  if (rows.length === 0) return null

  return (
    <section aria-labelledby="material-dna-heading">
      <h2 id="material-dna-heading" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
        Material DNA
      </h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl border border-luxury-gold/10 bg-luxury-charcoal/20 p-4">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-base text-luxury-gold">
                {row.icon}
              </span>
              <dt className="font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-taupe">{row.label}</dt>
            </div>
            <dd className="mt-1 font-luxury-sans text-sm capitalize text-luxury-ivory">{row.value}</dd>

            {typeof row.bar === 'number' && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-luxury-navy-deep" role="presentation">
                <div className="h-full rounded-full bg-luxury-gold" style={{ width: `${row.bar * 100}%` }} />
              </div>
            )}

            {row.rating && (
              <div className="mt-2 flex items-center gap-1" role="img" aria-label={`${row.rating.value} out of ${row.rating.max}`}>
                {Array.from({ length: row.rating.max }).map((_, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className={`h-1.5 w-5 rounded-full ${i < row.rating!.value ? 'bg-luxury-gold' : 'bg-luxury-navy-deep'}`}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </dl>
    </section>
  )
}
