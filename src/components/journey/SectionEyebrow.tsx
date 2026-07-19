import type { ReactNode } from 'react'

interface SectionEyebrowProps {
  children: ReactNode
}

// Single source of truth for the small uppercase "eyebrow" section heading
// used across almost every Journey body section (Craftsmanship, Galeri
// Detail, Yang Kami Pastikan, Perjalanan Hari Ini, etc.) — previously this
// exact Tailwind string was copy-pasted into each section component.
export function SectionEyebrow({ children }: SectionEyebrowProps) {
  return (
    <h2 className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary mb-6 text-center">
      {children}
    </h2>
  )
}
