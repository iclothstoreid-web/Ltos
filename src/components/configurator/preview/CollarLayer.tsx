'use client'

import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ConfiguratorOption } from '@/types/configurator'
import { ConfiguratorThumb } from './ConfiguratorThumb'

interface CollarLayerProps {
  collar: ConfiguratorOption | null
}

// Neckline overlay (z-10) — no real garment coordinate data exists yet, so
// this docks a labeled swatch near the top of the frame rather than
// pretending to be pixel-aligned. The compositing slot is what matters:
// this is exactly where an AI-rendered collar layer plugs in later.
export const CollarLayer = memo(function CollarLayer({ collar }: CollarLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[6%] z-10 flex justify-center">
      <AnimatePresence>
        {collar && (
          <motion.div
            key={collar.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 rounded-full border border-luxury-gold/30 bg-luxury-navy-deep/80 py-1 pl-1 pr-2.5 backdrop-blur-sm"
          >
            <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-luxury-navy">
              <ConfiguratorThumb photoUrl={collar.photoUrl} alt="" size={32} quality={65} className="h-full w-full object-cover" />
            </span>
            <span className="font-luxury-sans text-[9px] uppercase tracking-[0.08em] text-luxury-ivory">{collar.name}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
