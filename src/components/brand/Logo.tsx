import { LOGO_ASSETS, type LogoVariant } from '@/lib/brand/logoAssets'

interface LogoProps {
  /**
   * - horizontal: icon + wordmark, no tagline, no (R) — official navbar lockup.
   * - horizontalTagline: icon + wordmark + (R) + "Tailored. Distinguished. Refined." — footer/hero/OG lockup.
   * - vertical: icon stacked above wordmark, no tagline.
   * - mark: icon only, extracted from the vertical lockup — favicon/app-icon/avatar contexts.
   */
  variant: LogoVariant
  className?: string
  title?: string
}

// LTOS Brand System Rollout — renders the official Local Tailor artwork
// (public/brand/*.svg, verbatim via src/lib/brand/logoAssets.ts) inline so
// its color can follow the surrounding text color instead of being frozen
// at whatever color the artwork file happens to ship with. This is what
// makes the same black artwork read correctly on both light and dark
// surfaces across the site — no separate "white" asset exists, and none of
// the artwork's own geometry, spacing, or color is altered; only the CSS
// `color` it inherits changes. fill="currentColor" has to be set HERE, on
// this wrapper <svg> — logoAssets.ts only captures each source file's
// *inner* markup (the <path> elements), not the outer <svg> tag's own
// attributes, so the source files' own fill="currentColor" never actually
// reaches the page; every Logo instance was silently rendering plain black
// until this was added. Safe to use in both Server and Client Components
// (no hooks, no 'use client').
export function Logo({ variant, className, title = 'Local Tailor' }: LogoProps) {
  const asset = LOGO_ASSETS[variant]
  return (
    <svg
      role="img"
      aria-label={title}
      viewBox={asset.viewBox}
      fill="currentColor"
      className={className}
      dangerouslySetInnerHTML={{ __html: asset.inner }}
    />
  )
}
