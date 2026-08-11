'use client'

import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ConfiguratorOption } from '@/types/configurator'

interface AccessoriesLayerProps {
  accessories: ConfiguratorOption[]
}

// Top layer (z-30) — multi-select, so items animate in/out individually
// as the accessories array changes, stacked bottom-right.
export const AccessoriesLayer = memo(function AccessoriesLayer({ accessories }: AccessoriesLayerProps) {
  return (
    <div className="pointer-events-none absolute bottom-[6%] right-[6%] z-30 flex flex-col items-end gap-1.5">
      <AnimatePresence>
        {accessories.map((accessory) => (
          <motion.div
            key={accessory.id}
            layout
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.18 }}
            title={accessory.name}
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-luxury-gold/40 bg-luxury-navy-deep/85"
          >
            {accessory.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={accessory.photoUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            ) : (
              <span className="font-luxury-sans text-[7px] text-luxury-taupe">{accessory.name.slice(0, 2).toUpperCase()}</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
})
