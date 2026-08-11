'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ConfiguratorCatalog } from '@/lib/configurator/mapping'
import { findOption } from '@/lib/configurator/mapping'
import { useConfiguratorStore } from '@/stores/configurator-store'
import { BaseGarment } from './preview/BaseGarment'
import { CollarLayer } from './preview/CollarLayer'
import { CuffLayer } from './preview/CuffLayer'
import { EmbroideryLayer } from './preview/EmbroideryLayer'
import { AccessoriesLayer } from './preview/AccessoriesLayer'

interface GarmentPreviewProps {
  catalog: ConfiguratorCatalog | null
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

const ZOOM_MIN = 0.6
const ZOOM_MAX = 2
const ZOOM_STEP = 0.2

// 44px minimum touch target (WCAG 2.5.5 / mobile HIG) — the icon itself
// stays visually small, the button's hit area doesn't.
const CONTROL_BUTTON_CLASSNAME =
  'flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-luxury-gold/20 font-luxury-sans text-sm text-luxury-ivory transition hover:border-luxury-gold/50 disabled:cursor-not-allowed disabled:opacity-30'

// Layer renderer — a simple client-side compositing preview (CSS + image
// overlays), NOT the LTOS AI render pipeline. The 5-layer stack
// (Base/Collar/Cuff/Embroidery/Accessories) is the structural seam a real
// AI-rendered preview swaps into later; nothing here talks to the render
// engine or OpenAI.
export const GarmentPreview = memo(function GarmentPreview({ catalog, loading, error, onRetry }: GarmentPreviewProps) {
  const [zoom, setZoom] = useState(1)
  const [facing, setFacing] = useState<'front' | 'back'>('front')
  const shouldReduceMotion = useReducedMotion()

  const modelId = useConfiguratorStore((s) => s.config.modelId)
  const collarId = useConfiguratorStore((s) => s.config.collarId)
  const cuffId = useConfiguratorStore((s) => s.config.cuffId)
  const fabricId = useConfiguratorStore((s) => s.config.fabricId)
  const colorId = useConfiguratorStore((s) => s.config.colorId)
  const embroideryId = useConfiguratorStore((s) => s.config.embroidery)
  const accessoryIds = useConfiguratorStore((s) => s.config.accessories)

  const model = useMemo(() => (catalog ? findOption(catalog.fields.modelId, modelId) : null), [catalog, modelId])
  const collar = useMemo(() => (catalog ? findOption(catalog.fields.collarId, collarId) : null), [catalog, collarId])
  const cuff = useMemo(() => (catalog ? findOption(catalog.fields.cuffId, cuffId) : null), [catalog, cuffId])
  const fabric = useMemo(() => (catalog ? findOption(catalog.fields.fabricId, fabricId) : null), [catalog, fabricId])
  const color = useMemo(() => (catalog ? findOption(catalog.fields.colorId, colorId) : null), [catalog, colorId])
  const embroidery = useMemo(
    () => (catalog ? findOption(catalog.fields.embroidery, embroideryId) : null),
    [catalog, embroideryId]
  )
  const accessories = useMemo(
    () => (catalog ? accessoryIds.map((id) => findOption(catalog.accessories, id)).filter((o): o is NonNullable<typeof o> => !!o) : []),
    [catalog, accessoryIds]
  )

  const zoomOut = useCallback(() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(1))), [])
  const zoomIn = useCallback(() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(1))), [])
  const resetView = useCallback(() => {
    setZoom(1)
    setFacing('front')
  }, [])
  const toggleFacing = useCallback(() => setFacing((f) => (f === 'front' ? 'back' : 'front')), [])

  if (loading) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center" aria-busy="true" aria-label="Memuat preview">
        <div className="h-64 w-48 animate-pulse rounded-2xl bg-luxury-taupe/10" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 text-center">
        <p className="font-luxury-sans text-sm text-luxury-ivory">Preview tidak tersedia.</p>
        <p className="font-luxury-sans text-xs text-luxury-taupe">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 cursor-pointer rounded-full border border-luxury-gold/30 px-4 py-2 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold transition hover:bg-luxury-gold/10"
          >
            Coba Lagi
          </button>
        )}
      </div>
    )
  }

  if (!catalog) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center text-center">
        <p className="font-luxury-sans text-xs text-luxury-taupe">Preview belum tersedia.</p>
      </div>
    )
  }

  const hasSelection = model || fabric || color
  const zoomTransition = shouldReduceMotion ? 'none' : 'transform 250ms ease'
  const flipTransition = shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }

  return (
    <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="will-change-transform" style={{ transform: `scale(${zoom})`, transition: zoomTransition }}>
        <div style={{ perspective: 1200 }} className="h-64 w-48">
          <motion.div
            className="relative h-full w-full will-change-transform [transform-style:preserve-3d]"
            animate={{ rotateY: facing === 'back' ? 180 : 0 }}
            transition={flipTransition}
          >
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <BaseGarment model={model} />
              <CollarLayer collar={collar} />
              <CuffLayer cuff={cuff} />
              <EmbroideryLayer embroidery={embroidery} />
              <AccessoriesLayer accessories={accessories} />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center rounded-2xl border border-dashed border-luxury-gold/20 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            >
              <span className="px-4 font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-taupe">
                Tampak Belakang — Preview segera hadir
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center gap-2" role="group" aria-label="Kontrol preview">
        <button type="button" onClick={zoomOut} disabled={zoom <= ZOOM_MIN} aria-label="Perkecil preview" className={CONTROL_BUTTON_CLASSNAME}>
          −
        </button>
        <button
          type="button"
          onClick={resetView}
          aria-label="Reset zoom dan tampilan"
          className="flex h-11 cursor-pointer items-center rounded-full border border-luxury-gold/20 px-3 font-luxury-sans text-[10px] uppercase tracking-[0.08em] text-luxury-taupe transition hover:border-luxury-gold/50"
        >
          Reset
        </button>
        <button type="button" onClick={zoomIn} disabled={zoom >= ZOOM_MAX} aria-label="Perbesar preview" className={CONTROL_BUTTON_CLASSNAME}>
          +
        </button>
        <button
          type="button"
          onClick={toggleFacing}
          aria-label="Putar tampak depan/belakang"
          aria-pressed={facing === 'back'}
          className={`ml-1 ${CONTROL_BUTTON_CLASSNAME}`}
        >
          ⟳
        </button>
      </div>

      {hasSelection && (
        <dl className="flex flex-wrap justify-center gap-x-6 gap-y-1 font-luxury-sans text-xs text-luxury-taupe">
          {model && (
            <div>
              <dt className="inline uppercase tracking-[0.1em]">Model </dt>
              <dd className="inline text-luxury-ivory">{model.name}</dd>
            </div>
          )}
          {fabric && (
            <div>
              <dt className="inline uppercase tracking-[0.1em]">Material </dt>
              <dd className="inline text-luxury-ivory">{fabric.name}</dd>
            </div>
          )}
          {color && (
            <div>
              <dt className="inline uppercase tracking-[0.1em]">Warna </dt>
              <dd className="inline text-luxury-ivory">{color.name}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  )
})
