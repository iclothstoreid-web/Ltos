'use client'

import { memo, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ConfiguratorOption } from '@/types/configurator'
import { configuratorThumb, configuratorThumbSrcSet } from '@/lib/configurator/thumb'

interface BaseGarmentProps {
  model: ConfiguratorOption | null
}

// Bottom-most layer (z-0) — the silhouette every other layer composites
// onto. Simple compositing preview only, per the W2-2 brief: no AI render,
// just a stack this structure can be swapped to drive later.
//
// Sprint DS-UX — the preview box now renders up to ~540 px tall (58vh,
// aspect 3:4) and zooms to 2×, so a ~640 px transform variant covers the
// sharpest case — vs. the 6–16 MB `master-data-photos` original this used
// to load straight into <img src> (audit 2026-08-27). Falls back to the
// untransformed URL if the transform endpoint rejects a legacy
// over-resolution source.
const PREVIEW_SIZE = 640
const PREVIEW_QUALITY = 82

export const BaseGarment = memo(function BaseGarment({ model }: BaseGarmentProps) {
  const [transformFailed, setTransformFailed] = useState(false)

  const rawUrl = model?.photoUrl ?? null

  // Reset the per-source fallback when the selected model changes, so one
  // legacy over-resolution photo doesn't force every later model to its
  // untransformed original.
  useEffect(() => {
    setTransformFailed(false)
  }, [rawUrl])
  const src = rawUrl
    ? transformFailed
      ? rawUrl
      : configuratorThumb(rawUrl, PREVIEW_SIZE, PREVIEW_QUALITY) ?? rawUrl
    : null
  const srcSet =
    rawUrl && !transformFailed ? configuratorThumbSrcSet(rawUrl, PREVIEW_SIZE, PREVIEW_QUALITY) : undefined

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {src ? (
          <motion.img
            key={model!.id}
            src={src}
            srcSet={srcSet}
            alt={model!.name}
            loading="lazy"
            decoding="async"
            onError={() => !transformFailed && setTransformFailed(true)}
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
