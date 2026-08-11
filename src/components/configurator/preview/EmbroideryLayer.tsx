'use client'

import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ConfiguratorOption } from '@/types/configurator'

interface EmbroideryLayerProps {
  embroidery: ConfiguratorOption | null
}

// Chest-placket overlay (z-20, above collar/cuff) — same placeholder-dock
// reasoning as the other overlays.
export const EmbroideryLayer = memo(function EmbroideryLayer({ embroidery }: EmbroideryLayerProps) {
  return (
    <div className="pointer-events-none absolute left-[10%] top-[32%] z-20">
      <AnimatePresence>
        {embroidery && (
          <motion.div
            key={embroidery.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.2 }}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-luxury-gold/50 bg-luxury-navy-deep/80 shadow-[0_0_10px_rgba(200,162,74,0.25)]"
            title={embroidery.name}
          >
            {embroidery.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={embroidery.photoUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            ) : (
              <span className="font-luxury-sans text-[8px] text-luxury-gold">✦</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
