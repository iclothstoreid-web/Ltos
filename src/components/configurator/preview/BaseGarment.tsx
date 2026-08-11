'use client'

import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ConfiguratorOption } from '@/types/configurator'

interface BaseGarmentProps {
  model: ConfiguratorOption | null
}

// Bottom-most layer (z-0) — the silhouette every other layer composites
// onto. Simple compositing preview only, per the W2-2 brief: no AI render,
// just a stack this structure can be swapped to drive later.
export const BaseGarment = memo(function BaseGarment({ model }: BaseGarmentProps) {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {model?.photoUrl ? (
          <motion.img
            key={model.id}
            src={model.photoUrl}
            alt={model.name}
            loading="lazy"
            decoding="async"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full object-contain"
          />
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-luxury-gold/20"
          >
            <span className="font-luxury-sans text-[11px] uppercase tracking-[0.14em] text-luxury-taupe">
              {model ? 'Preview segera hadir' : 'Pilih Model untuk memulai'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
