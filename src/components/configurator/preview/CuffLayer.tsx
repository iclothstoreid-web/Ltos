'use client'

import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ConfiguratorOption } from '@/types/configurator'

interface CuffLayerProps {
  cuff: ConfiguratorOption | null
}

// Sleeve-end overlay (z-10), docked bottom rather than pixel-aligned —
// same placeholder-compositing reasoning as CollarLayer.
export const CuffLayer = memo(function CuffLayer({ cuff }: CuffLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[10%] z-10 flex justify-center">
      <AnimatePresence>
        {cuff && (
          <motion.div
            key={cuff.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 rounded-full border border-luxury-gold/30 bg-luxury-navy-deep/80 py-1 pl-1 pr-2.5 backdrop-blur-sm"
          >
            <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-luxury-navy">
              {cuff.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cuff.photoUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              ) : null}
            </span>
            <span className="font-luxury-sans text-[9px] uppercase tracking-[0.08em] text-luxury-ivory">{cuff.name}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
