import type { MaterialColor } from '@/types/material'

interface DnaColorInfoPanelProps {
  color: MaterialColor
}

// §4 — shown once a swatch is selected: name, HEX, RGB, family, and the
// DNA Color's "character" copy (the brief's own example — "Navy / Deep,
// elegant, authoritative" — is exactly this field, see the migration
// comment on why `character` and not the raw AI `prompt` column is shown).
export function DnaColorInfoPanel({ color }: DnaColorInfoPanelProps) {
  return (
    <div className="rounded-xl border border-luxury-gold/15 bg-luxury-charcoal/20 p-4" aria-live="polite">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="h-10 w-10 shrink-0 rounded-full border border-luxury-ivory/20"
          style={{ backgroundColor: color.hex ?? '#888888' }}
        />
        <div>
          <p className="font-luxury-sans text-sm text-luxury-ivory">{color.name}</p>
          {color.family && <p className="font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-gold">{color.family}</p>}
        </div>
      </div>

      {color.character && <p className="mt-3 font-luxury-sans text-sm italic text-luxury-taupe">{color.character}</p>}

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-luxury-sans text-xs text-luxury-taupe">
        {color.hex && (
          <div className="flex gap-1.5">
            <dt className="uppercase tracking-[0.05em]">Hex</dt>
            <dd className="text-luxury-ivory">{color.hex}</dd>
          </div>
        )}
        {color.rgb && (
          <div className="flex gap-1.5">
            <dt className="uppercase tracking-[0.05em]">RGB</dt>
            <dd className="text-luxury-ivory">{color.rgb}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
