import Link from 'next/link'
import type { LauncherTileConfig } from './tiles'

interface LauncherTileProps {
  tile: LauncherTileConfig
  index: number
  indicator?: string
}

// Close recreation of Odoo's app-launcher composition (odoo.com/id_ID,
// inspected directly via devtools — computed styles + real triggered
// hover, not screenshots): an 80px elevated neutral icon plate is the
// primary visual object, centered, with the label centered below it on the
// page background (Odoo's own anchor uses `text-center`) — never a
// bordered card wrapping icon+text. Hover is Odoo's exact measured
// behavior: `transform: translateY(-4px)`, single property, nothing else.
//
// Where this deliberately does NOT copy Odoo: its plate itself isn't
// per-app colored — LTOS's plate stays neutral ivory (bg-surface), and the
// per-module identity color (tiles.ts) lives on a smaller inner badge, the
// way a colored thread spool or fabric swatch sits on a canvas tray. That
// keeps the shared elevation/material language intact while still giving
// each of the 8 apps its own recognizable color, restrained rather than
// Odoo's full-saturation icon branding.
export function LauncherTile({ tile, index, indicator }: LauncherTileProps) {
  const Icon = tile.icon

  return (
    <Link
      href={tile.href}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
      className="group motion-safe:animate-slide-up motion-safe:opacity-0 motion-safe:[animation-fill-mode:forwards] relative flex flex-col items-center gap-3 rounded-[20px] p-3 -m-3 text-center outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/50"
    >
      {/* Shadow recalibrated for the walnut-gradient background (Sprint —
          Walnut Gradient Background): the previous navy-tinted shadow
          (rgba(11,22,40,...)) was tuned for a light ivory page and reads as
          near-invisible on dark walnut. Rest state is now a plain dark
          contact shadow for grounding; hover adds a restrained warm brass
          glow on top of it rather than a heavier navy shadow, since a glow
          — not a shadow — is what reads as "raised" against a dark
          surface. */}
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-[20px] border border-outline-variant/70 bg-surface shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-all duration-200 group-hover:-translate-y-1 group-hover:border-warm-gold/60 group-hover:shadow-[0_16px_32px_rgba(0,0,0,0.45),0_0_26px_rgba(184,137,0,0.18)] group-focus-visible:-translate-y-1 group-focus-visible:border-warm-gold/60 group-focus-visible:shadow-[0_16px_32px_rgba(0,0,0,0.45),0_0_26px_rgba(184,137,0,0.18)]">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-[14px] text-surface-low"
            style={{ backgroundColor: tile.color }}
          >
            <Icon size={22} strokeWidth={1.8} />
          </div>
        </div>

        {indicator && (
          <span
            aria-label={`${indicator} perlu perhatian`}
            className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-surface-low bg-warm-gold px-1 text-[11px] font-semibold leading-none text-surface-low"
          >
            {indicator}
          </span>
        )}
      </div>

      <div>
        <p className="text-body-md font-semibold tracking-[-0.005em] text-surface-low">{tile.name}</p>
        <p className="mx-auto mt-0.5 max-w-[22ch] text-[13px] leading-relaxed text-surface-low/85">{tile.description}</p>
      </div>
    </Link>
  )
}
