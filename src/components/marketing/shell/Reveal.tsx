'use client'

import { motion, useReducedMotion } from 'framer-motion'

// Shared section/element reveal used across every homepage section so the
// choreography (fade + translateY + slight scale, once per element) stays
// identical everywhere instead of being hand-rolled per section. Falls back
// to a plain div under prefers-reduced-motion.
export function Reveal({
  children,
  className = '',
  delay = 0,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'li'
}) {
  const reduceMotion = useReducedMotion()
  const Tag = as === 'li' ? motion.li : motion.div

  if (reduceMotion) {
    const Static = as === 'li' ? 'li' : 'div'
    return <Static className={className}>{children}</Static>
  }

  return (
    <Tag
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </Tag>
  )
}
