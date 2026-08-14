'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabaseImageLoader } from '@/lib/supabase/imageLoader'
import { trackFabricCardView } from '@/lib/analytics/fabricEngagement'
import {
  FABRIC_CATEGORY_LABELS,
  FABRIC_TEXTURE_LABELS,
  weightClassFromGsm,
  FABRIC_WEIGHT_CLASS_LABELS,
  type FabricMaterial,
  type MaterialColor,
} from '@/types/material'

interface MaterialCardProps {
  material: FabricMaterial
  priority?: boolean
  // Sprint W9-1 §5 — this card's index within whatever grid rendered it,
  // for fabric_card_view's `position` param (CRO dashboard's fabric
  // ranking groups on this). Optional/defaulted so no existing caller
  // (Related Materials, Popular rail) has to change its own props just to
  // keep compiling.
  position?: number
  // Sprint W3-4 §9 — optional: fetching a material's colors is one more
  // RPC call, so callers only pass this where the cost is bounded (Related
  // Materials, capped at 4) and deliberately don't for the main Explorer
  // grid (could be dozens of cards — see materialRepository.ts's
  // getMaterialColors() comment on "tidak melakukan query DNA Color
  // berulang"). Omitted entirely, the card renders exactly as it did
  // before this sprint.
  colors?: MaterialColor[]
}

// Client component (not Server) for the same reason as Design Studio's
// CatalogCard.tsx: next/image needs an onError handler to fall back to an
// unoptimized <Image> when Supabase's transform endpoint rejects a source
// (legacy/oversized photos) — that fallback can't be expressed without
// client-side state. No data fetching happens here; `material` and
// `colors` are plain props from an already-server-rendered list.
export function MaterialCard({ material, priority = false, colors, position = 0 }: MaterialCardProps) {
  const [transformFailed, setTransformFailed] = useState(false)
  const weightClass = weightClassFromGsm(material.weight_gsm)

  useEffect(() => {
    trackFabricCardView(material.id, position)
    // Fire once per real mount (a new card in the grid), not on every
    // re-render — material.id/position are only ever set at mount for a
    // given card instance in practice (server-rendered list, not reordered
    // client-side).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material.id])

  return (
    <Link
      href={`/fabric/${material.category}/${material.slug}`}
      className="group block overflow-hidden rounded-2xl border border-luxury-gold/10 bg-luxury-charcoal/30 transition hover:border-luxury-gold/40 hover:shadow-[0_0_0_1px_rgba(200,162,74,0.15)] focus-visible:ring-2 focus-visible:ring-luxury-gold/50"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-luxury-navy-deep">
        {material.hero_image ? (
          <Image
            key={transformFailed ? 'raw' : 'transformed'}
            src={material.hero_image}
            alt={material.name}
            loader={transformFailed ? undefined : supabaseImageLoader}
            unoptimized={transformFailed}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            onError={() => setTransformFailed(true)}
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
        {material.composition && <p className="mt-1 font-luxury-sans text-xs text-luxury-taupe">{material.composition}</p>}

        {(material.texture || weightClass) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {material.texture && (
              <span className="rounded-full border border-luxury-gold/15 px-2 py-0.5 font-luxury-sans text-[10px] text-luxury-taupe">
                {FABRIC_TEXTURE_LABELS[material.texture]}
              </span>
            )}
            {weightClass && (
              <span className="rounded-full border border-luxury-gold/15 px-2 py-0.5 font-luxury-sans text-[10px] text-luxury-taupe">
                {FABRIC_WEIGHT_CLASS_LABELS[weightClass]}
              </span>
            )}
          </div>
        )}

        {colors && colors.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex -space-x-1">
              {colors.slice(0, 5).map((color) => (
                <span
                  key={color.id}
                  title={color.name}
                  aria-hidden="true"
                  className="h-3.5 w-3.5 rounded-full border border-luxury-navy-deep"
                  style={{ backgroundColor: color.hex ?? '#888888' }}
                />
              ))}
            </div>
            <span className="font-luxury-sans text-[10px] text-luxury-taupe">
              {colors.length} color{colors.length === 1 ? '' : 's'}
            </span>
          </div>
        )}

        <span className="mt-3 inline-flex items-center gap-1 font-luxury-sans text-[11px] uppercase tracking-[0.1em] text-luxury-gold opacity-80 transition group-hover:opacity-100">
          Explore Fabric
          <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  )
}
