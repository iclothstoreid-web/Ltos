'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ConfiguratorCatalog } from '@/lib/configurator/mapping'
import { findOption } from '@/lib/configurator/mapping'
import type { ConfiguratorOption } from '@/types/configurator'
import { useConfiguratorStore } from '@/stores/configurator-store'
import { configuratorThumb } from '@/lib/configurator/thumb'
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

// 44px minimum touch target (WCAG 2.5.5 / mobile HIG).
const CONTROL_BUTTON_CLASSNAME =
  'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-luxury-gold/25 bg-luxury-navy-deep/70 font-luxury-sans text-sm text-luxury-ivory backdrop-blur-sm transition hover:border-luxury-gold/60 disabled:cursor-not-allowed disabled:opacity-30'

// Sprint DS-UX — the preview is now the page's focal point: the garment
// fills ~62vh of the viewport instead of a fixed 256px box, and the
// "what changed" feedback moved from four tiny floating badges to a
// readable labelled chip strip beneath it (each chip flashes gold when its
// value changes). The 5-layer compositing stack is still an honest
// placeholder — no coordinate data exists to paint a chosen collar onto
// the model photo, so the strip is where collar/cuff/fabric/colour changes
// actually register. Nothing here talks to the render engine or OpenAI.
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
      <div className="flex h-full min-h-[60vh] w-full items-center justify-center" aria-busy="true" aria-label="Memuat preview">
        <div className="h-[52vh] w-[40vh] max-w-[80vw] animate-pulse rounded-2xl bg-luxury-taupe/10" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
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
      <div className="flex h-full min-h-[60vh] items-center justify-center text-center">
        <p className="font-luxury-sans text-xs text-luxury-taupe">Preview belum tersedia.</p>
      </div>
    )
  }

  const zoomTransition = shouldReduceMotion ? 'none' : 'transform 250ms ease'
  const flipTransition = shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }

  const detailItems: { label: string; option: ConfiguratorOption | null }[] = [
    { label: 'Model', option: model },
    { label: 'Kerah', option: collar },
    { label: 'Manset', option: cuff },
    { label: 'Material', option: fabric },
    { label: 'Warna', option: color },
    { label: 'Bordir', option: embroidery },
  ]
  const hasAnyDetail = detailItems.some((d) => d.option) || accessories.length > 0

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 py-6 md:py-8">
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div
          className="will-change-transform"
          style={{ transform: `scale(${zoom})`, transition: zoomTransition }}
        >
          <div style={{ perspective: 1400 }} className="h-[58vh] max-h-[720px] min-h-[320px] w-auto aspect-[3/4]">
            <motion.div
              className="relative h-full w-full will-change-transform [transform-style:preserve-3d]"
              animate={{ rotateY: facing === 'back' ? 180 : 0 }}
              transition={flipTransition}
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl [backface-visibility:hidden]">
                <BaseGarment model={model} />
                <CollarLayer collar={collar} />
                <CuffLayer cuff={cuff} />
                <EmbroideryLayer embroidery={embroidery} />
                <AccessoriesLayer accessories={accessories} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-dashed border-luxury-gold/20 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="px-4 font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-taupe">
                  Tampak Belakang — Preview segera hadir
                </span>
              </div>
            </motion.div>
          </div>
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
          className="flex h-10 cursor-pointer items-center rounded-full border border-luxury-gold/25 bg-luxury-navy-deep/70 px-3 font-luxury-sans text-[10px] uppercase tracking-[0.08em] text-luxury-taupe backdrop-blur-sm transition hover:border-luxury-gold/60"
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

      {hasAnyDetail && (
        <div className="w-full max-w-2xl">
          <p className="mb-2 text-center font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">
            Konfigurasi Aktif
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {detailItems.map(
              (d) => d.option && <DetailChip key={d.label} label={d.label} option={d.option} />
            )}
            {accessories.map((a) => (
              <DetailChip key={a.id} label="Aksesori" option={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

// One labelled chip in the "Konfigurasi Aktif" strip. `key={option.id}` on
// the motion node means React remounts it whenever the selection for that
// slot changes, so the gold flash fires on every real change.
const DetailChip = memo(function DetailChip({ label, option }: { label: string; option: ConfiguratorOption }) {
  const thumb = option.photoUrl ? configuratorThumb(option.photoUrl, 48, 60) : null

  return (
    <motion.span
      key={option.id}
      initial={{ boxShadow: '0 0 0 0 rgba(200,162,74,0.55)' }}
      animate={{ boxShadow: '0 0 0 6px rgba(200,162,74,0)' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`flex items-center gap-2 rounded-full border border-luxury-gold/20 bg-luxury-navy-deep/70 py-1 pr-3 backdrop-blur-sm ${thumb ? 'pl-1' : 'pl-3'}`}
    >
      {thumb && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-luxury-navy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </span>
      )}
      <span className="min-w-0 font-luxury-sans leading-tight">
        <span className="block text-[8px] uppercase tracking-[0.12em] text-luxury-taupe">{label}</span>
        <span className="block max-w-[9rem] truncate text-[11px] text-luxury-ivory">{option.name}</span>
      </span>
    </motion.span>
  )
})
