'use client'

import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'

type MagneticButtonProps = {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'ghost'
  className?: string
  // Sprint W4.5 — optional, only used by external links (e.g. the
  // WhatsApp CTA on /book-appointment). Undefined for every existing
  // caller, so this changes no current behavior.
  target?: string
  rel?: string
}

// Shared CTA primitive for every button on the homepage: magnetic pull
// toward the cursor, soft gold glow, and a depth-press on click. Motion is
// skipped entirely under prefers-reduced-motion — the button still works,
// it just doesn't chase the cursor.
export function MagneticButton({ href, children, variant = 'primary', className = '', target, rel }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const reduceMotion = useReducedMotion()

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (reduceMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    setOffset({ x: relX * 0.25, y: relY * 0.25 })
  }

  function handleMouseLeave() {
    setOffset({ x: 0, y: 0 })
  }

  const base =
    variant === 'primary'
      ? 'bg-luxury-gold text-luxury-black hover:brightness-110 hover:shadow-[0_0_24px_rgba(200,162,74,0.45)]'
      : 'border border-luxury-gold/[0.18] text-luxury-ivory hover:border-luxury-gold/60 hover:text-luxury-gold hover:shadow-[0_0_16px_rgba(200,162,74,0.18)]'

  return (
    <motion.a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.4 }}
      className={`inline-flex cursor-pointer items-center justify-center rounded-full px-8 py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] transition duration-300 ${base} ${className}`}
    >
      {children}
    </motion.a>
  )
}

export { Link }
