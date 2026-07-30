'use client'

import type { ReactNode } from 'react'

export type CatalogCardAvailabilityTone = 'positive' | 'warning' | 'negative' | 'neutral'

export interface CatalogCardProps {
  name: string
  description?: string | null
  imageUrl?: string | null
  /** Solid-color fill for the image area instead of a photo — Warna
   *  Bahan has no meaningful "photo," the color itself IS the preview. */
  swatchColor?: string | null
  /** Material Symbols icon name shown when there's neither an image nor a
   *  swatch (no Hero Image uploaded yet for that master data item). */
  icon?: string
  selected: boolean
  disabled?: boolean
  disabledReason?: string
  availabilityLabel?: string | null
  availabilityTone?: CatalogCardAvailabilityTone
  priceLabel?: string | null
  onSelect: () => void
  /** Opens SpecDetailModal's deeper Tabel Spesifikasi/Selling Point view —
   *  never gates the image/name/description above, which are always
   *  visible on the card itself. Omit to hide the info affordance
   *  entirely (e.g. the synthetic "(None)" card has nothing to inspect). */
  onViewSpec?: () => void
  ariaLabel?: string
}

const AVAILABILITY_TONE_CLASSES: Record<CatalogCardAvailabilityTone, string> = {
  positive: 'text-[#006c49]',
  warning: 'text-[#8a5a00]',
  negative: 'text-[#ba1a1a]',
  neutral: 'text-[#444748]',
}

// The one visual catalog card every Design Studio selector renders through
// (Model, Look Cutting, Material, Warna Bahan, Kerah, Manset, Saku, Plaket,
// Kancing & Aksesori, Bordir, Handmade Zig-Zag) — image/swatch, name, and
// optional description are always visible up front, per the "Design Studio
// is a visual catalog, images must always be visible" brief. The info icon
// (onViewSpec) only ever opens the deeper spec/history/care-instruction
// view; it is never required just to see the image.
export function CatalogCard({
  name,
  description,
  imageUrl,
  swatchColor,
  icon = 'checkroom',
  selected,
  disabled = false,
  disabledReason,
  availabilityLabel,
  availabilityTone = 'neutral',
  priceLabel,
  onSelect,
  onViewSpec,
  ariaLabel,
}: CatalogCardProps) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => !disabled && onSelect()}
        disabled={disabled}
        aria-disabled={disabled}
        aria-pressed={selected}
        aria-label={ariaLabel ?? name}
        title={disabled ? disabledReason : undefined}
        className={`w-full text-left border-[0.5px] bg-white transition-all overflow-hidden ${
          selected
            ? 'border-[#775a19] ring-1 ring-[#775a19] bg-[#775a19]/5'
            : 'border-[#c4c7c7] hover:border-[#775a19]/40'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {/* Fixed aspect ratio (not a min-height) so the card's footprint is
            known before the image finishes loading — avoids layout shift
            while the lazy-loaded photo streams in. */}
        <div
          className="aspect-square flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: swatchColor || '#dce2f3' }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL, lazy-loaded below
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : !swatchColor ? (
            <span className="material-symbols-outlined text-4xl text-[#775a19]/40 group-hover:text-[#775a19]/70 transition-colors">
              {icon}
            </span>
          ) : null}
        </div>
        <div className="p-2 space-y-0.5">
          <div className="flex items-center justify-between gap-1">
            <span className="font-sans text-sm text-[#151c27] truncate">{name}</span>
            {selected && (
              <span className="material-symbols-outlined text-[16px] text-[#775a19] shrink-0">check_circle</span>
            )}
          </div>
          {description && <p className="font-sans text-xs text-[#444748] truncate">{description}</p>}
          {(availabilityLabel || priceLabel) && (
            <div className="flex items-center justify-between gap-2">
              {availabilityLabel && (
                <span className={`font-sans text-[10px] uppercase truncate ${AVAILABILITY_TONE_CLASSES[availabilityTone]}`}>
                  {availabilityLabel}
                </span>
              )}
              {priceLabel && (
                <span className="font-sans text-[10px] text-[#444748] whitespace-nowrap ml-auto">{priceLabel}</span>
              )}
            </div>
          )}
        </div>
      </button>
      {onViewSpec && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            onViewSpec()
          }}
          aria-label={`Lihat Spesifikasi ${name}`}
          className="material-symbols-outlined absolute top-1.5 right-1.5 text-[15px] leading-none text-white bg-[#151c27]/50 hover:bg-[#151c27]/75 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
        >
          info
        </button>
      )}
    </div>
  )
}

export interface CatalogGridProps {
  children: ReactNode
}

// Responsive grid every catalog uses. GarmentBlueprintPanel is a sidebar
// (w-full below `lg`, then a fixed ~30%-width column at `lg` and up) — NOT
// the full viewport — so columns are tuned to the panel's actual available
// width at each breakpoint, not naive viewport size: 2 columns on a phone
// (brief's "Mobile 2-column cards"), 3 once there's real width to spare
// (tablet, and desktop viewports below `lg` where the panel is still
// full-width), then back to 2 once `lg` narrows the panel itself to ~30%,
// so cards stay legible instead of shrinking to illegible slivers.
export function CatalogGrid({ children }: CatalogGridProps) {
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">{children}</div>
}
