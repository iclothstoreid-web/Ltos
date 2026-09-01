'use client'

import { memo, useCallback, useState } from 'react'
import type { ConfiguratorCatalog } from '@/lib/configurator/mapping'
import type { ConfiguratorField, ConfiguratorOption, DesignConfig } from '@/types/configurator'
import { useConfiguratorStore } from '@/stores/configurator-store'
import {
  trackModelSelected,
  trackCollarSelected,
  trackCuffSelected,
  trackFabricSelected,
  trackColorSelected,
  trackPocketSelected,
  trackPlacketSelected,
  trackZigzagSelected,
  trackEmbroideryAdded,
  trackAccessoriesAdded,
} from '@/lib/configurator/analytics'
import {
  trackCollarSelected as trackCollarSelectedGa4,
  trackCuffSelected as trackCuffSelectedGa4,
  trackFabricSelected as trackFabricSelectedGa4,
  trackEmbroiderySelected as trackEmbroiderySelectedGa4,
} from '@/lib/analytics/designStudioAnalytics'
import { OptionCard } from './OptionCard'
import { DesignLookGallery } from './DesignLookGallery'
import { applyLookToConfig, lookMatchesConfig, type DesignLook } from '@/lib/design/designLooks'

const FIELD_TRACKERS: Record<Exclude<ConfiguratorField, 'embroidery' | 'colorId'>, (id: string, name: string) => void> = {
  modelId: trackModelSelected,
  collarId: trackCollarSelected,
  cuffId: trackCuffSelected,
  fabricId: trackFabricSelected,
  pocketId: trackPocketSelected,
  placketId: trackPlacketSelected,
  zigzagId: trackZigzagSelected,
}

// Sprint W9-1 §6 — new §2-taxonomy events, additive alongside the
// pre-existing FIELD_TRACKERS above (not a replacement).
const GA4_FIELD_TRACKERS: Partial<Record<Exclude<ConfiguratorField, 'embroidery' | 'colorId'>, (id: string, name: string) => void>> = {
  collarId: trackCollarSelectedGa4,
  cuffId: trackCuffSelectedGa4,
  fabricId: trackFabricSelectedGa4,
}

type CategoryKey = ConfiguratorField | 'accessories'

interface ConfiguratorPanelProps {
  catalog: ConfiguratorCatalog | null
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

// Sprint DS-UX — the option browser is now a single-category view driven
// by a tab bar instead of one long stack of always-open accordions. Each
// category renders a roomy 2-column card grid (photos ~2× the old
// thumbnail), so a visitor can actually compare models / collars / cuffs
// before committing. Store wiring, trackers, and every handler are
// byte-identical to the accordion version — this is presentation only.
const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'modelId', label: 'Model' },
  { key: 'collarId', label: 'Kerah' },
  { key: 'cuffId', label: 'Manset' },
  { key: 'fabricId', label: 'Material' },
  { key: 'colorId', label: 'Warna' },
  { key: 'pocketId', label: 'Saku' },
  { key: 'placketId', label: 'Plaket' },
  { key: 'embroidery', label: 'Bordir' },
  { key: 'zigzagId', label: 'Handmade Zig-Zag' },
  { key: 'accessories', label: 'Aksesori' },
]

export function ConfiguratorPanel({ catalog, loading, error, onRetry }: ConfiguratorPanelProps) {
  const [active, setActive] = useState<CategoryKey>('modelId')

  // Design Look (preset/inspiration) — picking one pre-fills only the pilihan
  // it can prove, then jumps to the Model tab so the visitor sees their
  // starting point. `appliedLookId` is just the last pick; lookMatchesConfig
  // below is what actually decides whether the highlight still holds.
  const config = useConfiguratorStore((s) => s.config)
  const updateConfig = useConfiguratorStore((s) => s.updateConfig)
  const [appliedLookId, setAppliedLookId] = useState<string | null>(null)

  const handlePickLook = useCallback(
    (look: DesignLook) => {
      if (!catalog) return
      updateConfig(applyLookToConfig(look, catalog.fields))
      setAppliedLookId(look.id)
      setActive('modelId')
    },
    [catalog, updateConfig]
  )

  // Primitive selector — re-renders the panel only when the *set* of
  // categories that carry a selection changes (≤7 times a session), not on
  // every pick. Feeds the little "chosen" dot on each tab.
  // Order MUST match CATEGORIES above — feeds the per-tab "chosen" dot.
  const chosenMask = useConfiguratorStore((s) => {
    const c = s.config
    return [
      !!c.modelId, !!c.collarId, !!c.cuffId, !!c.fabricId, !!c.colorId,
      !!c.pocketId, !!c.placketId, !!c.embroidery, !!c.zigzagId, c.accessories.length > 0,
    ].join(',')
  })
  const chosen = chosenMask.split(',').map((v) => v === 'true')

  if (loading) {
    return (
      <div className="p-5" aria-busy="true" aria-label="Memuat pilihan konfigurasi">
        <div className="mb-5 flex gap-2 overflow-hidden">
          {CATEGORIES.slice(0, 5).map((c) => (
            <div key={c.key} className="h-8 w-16 shrink-0 animate-pulse rounded-full bg-luxury-taupe/15" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-luxury-gold/10 bg-luxury-charcoal/40">
              <div className="aspect-square rounded-t-xl bg-luxury-taupe/15" />
              <div className="m-3 h-3 w-3/4 rounded bg-luxury-taupe/20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="m-5 rounded-xl border border-error/30 bg-error/5 p-6 text-center">
        <p className="font-luxury-sans text-sm text-luxury-ivory">Gagal memuat pilihan konfigurasi.</p>
        <p className="mt-1 font-luxury-sans text-xs text-luxury-taupe">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 cursor-pointer rounded-full border border-error/40 px-4 py-2 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-ivory transition hover:bg-error/10"
          >
            Coba Lagi
          </button>
        )}
      </div>
    )
  }

  // Defensive fallback, not a reachable state — kept as a message instead
  // of `return null` so a future timing change can never produce a blank
  // panel ("jangan pernah membuat configurator blank screen").
  if (!catalog) {
    return (
      <div className="m-5 rounded-xl border border-luxury-gold/10 p-6 text-center">
        <p className="font-luxury-sans text-xs text-luxury-taupe">Pilihan konfigurasi belum tersedia.</p>
      </div>
    )
  }

  const activeLookId =
    appliedLookId && catalog.looks.some((l) => l.id === appliedLookId && lookMatchesConfig(l, catalog.fields, config))
      ? appliedLookId
      : null

  return (
    <div>
      <DesignLookGallery looks={catalog.looks} activeLookId={activeLookId} onPick={handlePickLook} />

      {/* Category tab bar. Sprint DS-UX-Mobile — below xl (mobile + tablet,
          the only breakpoints that ever mount this inside
          MobileConfiguratorDrawer) it's a fixed 5-col x 2-row grid so all 10
          categories are visible at once with zero horizontal scrolling —
          Plaket / Bordir / Handmade Zig-Zag / Aksesori were getting lost off
          the end of the old single-row scroller. CATEGORIES' existing order
          already IS the required reading order (row 1: Model/Kerah/Manset/
          Material/Warna, row 2: Saku/Plaket/Bordir/Handmade Zig-Zag/
          Aksesori), so grid-cols-5 alone produces it with no reordering.
          Desktop (xl+, the <aside> context only) reverts to the original
          horizontally-scrollable single row — untouched behavior. Sticky to
          the top of whichever scroll container holds it (desktop aside, or
          the mobile drawer body) either way. */}
      <div
        role="tablist"
        aria-label="Kategori konfigurasi"
        className="sticky top-0 z-10 grid grid-cols-5 gap-1 border-b border-luxury-gold/10 bg-luxury-navy-deep/95 px-2 py-2 backdrop-blur-sm xl:top-[84px] xl:flex xl:gap-1.5 xl:overflow-x-auto xl:px-4 xl:py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CATEGORIES.map((cat, i) => {
          const isActive = active === cat.key
          return (
            <button
              key={cat.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(cat.key)}
              className={`relative flex min-h-[44px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-1.5 text-center font-luxury-sans text-[9px] uppercase leading-[1.15] tracking-[0.02em] transition xl:min-h-0 xl:shrink-0 xl:flex-row xl:rounded-full xl:px-3.5 xl:py-1.5 xl:text-[11px] xl:tracking-[0.1em] ${
                isActive
                  ? 'border-luxury-gold bg-luxury-gold/15 text-luxury-gold'
                  : 'border-luxury-gold/15 text-luxury-taupe hover:border-luxury-gold/40 hover:text-luxury-ivory'
              }`}
            >
              <span>{cat.label}</span>
              {chosen[i] && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full xl:static xl:ml-1.5 xl:inline-block xl:align-middle ${isActive ? 'bg-luxury-gold' : 'bg-luxury-gold/60'}`}
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="px-4 py-5">
        {active === 'modelId' && <PhotoGrid field="modelId" label="Model" options={catalog.fields.modelId} />}
        {active === 'collarId' && <PhotoGrid field="collarId" label="Kerah" options={catalog.fields.collarId} />}
        {active === 'cuffId' && <PhotoGrid field="cuffId" label="Manset" options={catalog.fields.cuffId} />}
        {active === 'fabricId' && <PhotoGrid field="fabricId" label="Material" options={catalog.fields.fabricId} />}
        {active === 'colorId' && <ColorGrid options={catalog.fields.colorId} />}
        {active === 'pocketId' && <PhotoGrid field="pocketId" label="Saku" options={catalog.fields.pocketId} clearable />}
        {active === 'placketId' && <PhotoGrid field="placketId" label="Plaket" options={catalog.fields.placketId} clearable />}
        {active === 'embroidery' && <EmbroiderySection options={catalog.fields.embroidery} />}
        {active === 'zigzagId' && <PhotoGrid field="zigzagId" label="Handmade Zig-Zag" options={catalog.fields.zigzagId} clearable />}
        {active === 'accessories' && <AccessoriesSection options={catalog.accessories} />}
      </div>
    </div>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="font-luxury-sans text-xs text-luxury-taupe">{children}</p>
}

interface PhotoGridProps {
  field: Exclude<ConfiguratorField, 'embroidery' | 'colorId'>
  label: string
  options: ConfiguratorOption[]
  // Saku / Plaket / Handmade Zig-Zag are optional add-ons — allow clearing
  // the choice. Model / Kerah / Material stay always-one-selected.
  clearable?: boolean
}

// modelId / collarId / cuffId / fabricId / pocketId / placketId / zigzagId —
// single-select, native radio group, 2-column photo cards. Only one section
// is ever mounted at a time.
const PhotoGrid = memo(function PhotoGrid({ field, label, options, clearable }: PhotoGridProps) {
  const selectedId = useConfiguratorStore((s) => s.config[field])
  const updateConfig = useConfiguratorStore((s) => s.updateConfig)

  const handleSelect = useCallback(
    (id: string) => {
      updateConfig({ [field]: id } as Partial<DesignConfig>)
      const option = options.find((o) => o.id === id)
      if (option) {
        FIELD_TRACKERS[field](option.id, option.name)
        GA4_FIELD_TRACKERS[field]?.(option.id, option.name)
      }
    },
    [field, options, updateConfig]
  )

  const handleClear = useCallback(() => {
    updateConfig({ [field]: null } as Partial<DesignConfig>)
  }, [field, updateConfig])

  if (options.length === 0) return <EmptyState>Belum ada pilihan aktif untuk kategori ini.</EmptyState>

  return (
    <div>
      {clearable && selectedId && (
        <button
          type="button"
          onClick={handleClear}
          className="mb-3 cursor-pointer font-luxury-sans text-[11px] uppercase tracking-[0.1em] text-luxury-taupe transition hover:text-luxury-gold"
        >
          Hapus pilihan {label}
        </button>
      )}
      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="sr-only">{label}</legend>
        {options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            groupName={field}
            inputType="radio"
            variant="photo"
            checked={selectedId === option.id}
            onChange={handleSelect}
          />
        ))}
      </fieldset>
    </div>
  )
})

const ColorGrid = memo(function ColorGrid({ options }: { options: ConfiguratorOption[] }) {
  const selectedId = useConfiguratorStore((s) => s.config.colorId)
  const updateConfig = useConfiguratorStore((s) => s.updateConfig)

  const handleSelect = useCallback(
    (id: string) => {
      updateConfig({ colorId: id })
      const option = options.find((o) => o.id === id)
      if (option) trackColorSelected(option.id, option.name)
    },
    [options, updateConfig]
  )

  if (options.length === 0) return <EmptyState>Belum ada pilihan aktif untuk kategori ini.</EmptyState>

  return (
    <fieldset className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      <legend className="sr-only">Warna</legend>
      {options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          groupName="colorId"
          inputType="radio"
          variant="swatch"
          checked={selectedId === option.id}
          onChange={handleSelect}
        />
      ))}
    </fieldset>
  )
})

// Toggle + motif picker. The free-text field stays local-only draft state
// — DesignConfig has no field for it yet, so it isn't wired into the store
// or the estimate/save API contract.
const EmbroiderySection = memo(function EmbroiderySection({ options }: { options: ConfiguratorOption[] }) {
  const embroideryId = useConfiguratorStore((s) => s.config.embroidery)
  const updateConfig = useConfiguratorStore((s) => s.updateConfig)
  const [customText, setCustomText] = useState('')
  const enabled = embroideryId !== null

  function handleToggle(next: boolean) {
    if (!next) {
      updateConfig({ embroidery: null })
    } else if (options[0]) {
      updateConfig({ embroidery: options[0].id })
      trackEmbroideryAdded(options[0].id, options[0].name)
      trackEmbroiderySelectedGa4(options[0].id, options[0].name)
    }
  }

  const handleSelect = useCallback(
    (id: string) => {
      updateConfig({ embroidery: id })
      const option = options.find((o) => o.id === id)
      if (option) {
        trackEmbroideryAdded(option.id, option.name)
        trackEmbroiderySelectedGa4(option.id, option.name)
      }
    },
    [options, updateConfig]
  )

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center justify-between">
        <span className="font-luxury-sans text-xs text-luxury-taupe">Gunakan Bordir</span>
        <span className="relative inline-flex h-6 w-11 items-center">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="peer sr-only"
            aria-label="Aktifkan bordir"
          />
          <span className="absolute inset-0 rounded-full bg-luxury-taupe/20 transition peer-checked:bg-luxury-gold peer-focus-visible:ring-2 peer-focus-visible:ring-luxury-gold/70 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-luxury-navy-deep" />
          <span className="relative ml-1 h-4 w-4 rounded-full bg-luxury-ivory transition peer-checked:translate-x-5" />
        </span>
      </label>

      {enabled && (
        <>
          {options.length === 0 ? (
            <EmptyState>Belum ada motif bordir aktif.</EmptyState>
          ) : (
            <fieldset className="grid grid-cols-2 gap-3">
              <legend className="sr-only">Motif Bordir</legend>
              {options.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  groupName="embroidery"
                  inputType="radio"
                  checked={embroideryId === option.id}
                  onChange={handleSelect}
                />
              ))}
            </fieldset>
          )}

          <div>
            <label htmlFor="embroidery-text" className="mb-1.5 block font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-taupe">
              Teks / Inisial (draft)
            </label>
            <input
              id="embroidery-text"
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              maxLength={30}
              placeholder="Contoh: A.R."
              className="w-full rounded-md border border-luxury-gold/15 bg-luxury-navy px-3 py-2 font-luxury-sans text-xs text-luxury-ivory placeholder:text-luxury-taupe/60 focus:border-luxury-gold/50 focus:outline-none"
            />
          </div>
        </>
      )}
    </div>
  )
})

const AccessoriesSection = memo(function AccessoriesSection({ options }: { options: ConfiguratorOption[] }) {
  const selectedIds = useConfiguratorStore((s) => s.config.accessories)
  const updateConfig = useConfiguratorStore((s) => s.updateConfig)

  const handleToggleAccessory = useCallback(
    (id: string) => {
      const adding = !selectedIds.includes(id)
      updateConfig({
        accessories: adding ? [...selectedIds, id] : selectedIds.filter((a) => a !== id),
      })
      if (adding) {
        const option = options.find((o) => o.id === id)
        if (option) trackAccessoriesAdded(option.id, option.name)
      }
    },
    [options, selectedIds, updateConfig]
  )

  if (options.length === 0) return <EmptyState>Belum ada pilihan aktif untuk kategori ini.</EmptyState>

  return (
    <fieldset className="grid grid-cols-2 gap-3">
      <legend className="sr-only">Aksesori</legend>
      {options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          groupName="accessories"
          inputType="checkbox"
          checked={selectedIds.includes(option.id)}
          onChange={handleToggleAccessory}
        />
      ))}
    </fieldset>
  )
})
