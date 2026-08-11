import type { ReactNode } from 'react'

interface MaterialHeroProps {
  eyebrow?: string
  title: string
  description?: string
  children?: ReactNode
}

// Reused across /fabric (catalog-wide hero) and /fabric/[category] (per-
// category hero) — title/description are the only required content, so
// both call sites can share the exact same banner shell.
export function MaterialHero({ eyebrow = 'Fabric Explorer', title, description, children }: MaterialHeroProps) {
  return (
    <div className="border-b border-luxury-gold/10 pb-8">
      <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">{eyebrow}</p>
      <h1 className="mt-2 font-luxury-sans text-2xl text-luxury-ivory md:text-3xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl font-luxury-sans text-sm text-luxury-taupe">{description}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
