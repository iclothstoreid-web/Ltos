import type { DesignSelections } from '@/components/workspace/design-studio/types'

interface ReferenceModelCardProps {
  design: DesignSelections | null
}

// The Stitch export shows a front/back reference-photo carousel — no
// reference-model photo capture exists anywhere in the app (same gap as the
// Hero Card's customer photo, confirmed with the user), so this shows the
// real design selections as text instead of fabricated images.
//
// Server Component (Sprint N6) — `design` is set once in Design Studio and
// never mutated by anything reachable from the Production Packet (refetch()
// replaces the whole `packet` object, but this field's value never changes
// across that), so it's safe to render server-side as a slot from page.tsx
// instead of a client component re-reading it from live packet state on
// every render. `memo` dropped — meaningless for a Server Component, which
// never re-renders on the client at all.
export function ReferenceModelCard({ design }: ReferenceModelCardProps) {
  if (!design) return null

  const chips = [design.model, design.collar, design.cuff, design.button].filter(Boolean)

  return (
    <div className="space-y-3">
      <h3 className="font-caslon text-xl text-on-surface px-1">Model Referensi</h3>
      <div className="bg-surface rounded-2xl p-5 shadow-sm border border-outline-variant/30">
        <p className="font-hanken font-semibold text-on-surface mb-3">{design.model}</p>
        <div className="flex flex-wrap gap-2">
          {chips.map(chip => (
            <span
              key={chip}
              className="font-jetbrains text-[10px] tracking-widest uppercase text-secondary bg-surface-container px-2 py-1 rounded"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
