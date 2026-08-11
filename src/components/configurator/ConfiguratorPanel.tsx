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
  trackEmbroideryAdded,
  trackAccessoriesAdded,
} from '@/lib/configurator/analytics'
import { OptionCard } from './OptionCard'

const FIELD_TRACKERS: Record<Exclude<ConfiguratorField, 'embroidery' | 'colorId'>, (id: string, name: string) => void> = {
  modelId: trackModelSelected,
  collarId: trackCollarSelected,
  cuffId: trackCuffSelected,
  fabricId: trackFabricSelected,
}

type OpenSection = ConfiguratorField | 'accessories'

interface ConfiguratorPanelProps {
  catalog: ConfiguratorCatalog | null
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

const PHOTO_SECTIONS: { field: Exclude<ConfiguratorField, 'embroidery' | 'colorId'>; label: string }[] = [
  { field: 'modelId', label: 'Model' },
  { field: 'collarId', label: 'Kerah' },
  { field: 'cuffId', label: 'Manset' },
  { field: 'fabricId', label: 'Material' },
]

export function ConfiguratorPanel({ catalog, loading, error, onRetry }: ConfiguratorPanelProps) {
  const [openSection, setOpenSection] = useState<OpenSection>('modelId')

  if (loading) {
    return (
      <div className="space-y-4 p-6" aria-busy="true" aria-label="Memuat pilihan konfigurasi">
        {PHOTO_SECTIONS.map((section) => (
          <div key={section.field} className="animate-pulse rounded-xl border border-luxury-gold/10 bg-luxury-charcoal/40 p-4">
            <div className="mb-3 h-3 w-24 rounded bg-luxury-taupe/20" />
            <div className="flex gap-3">
              <div className="h-16 w-16 rounded-lg bg-luxury-taupe/20" />
              <div className="h-16 w-16 rounded-lg bg-luxury-taupe/20" />
              <div className="h-16 w-16 rounded-lg bg-luxury-taupe/20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="m-6 rounded-xl border border-error/30 bg-error/5 p-6 text-center">
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

  // Defensive fallback, not a reachable state given how DesignStudioClient
  // wires loading/error/catalog together — kept as a message instead of
  // `return null` so a future timing change can never produce a blank
  // panel ("jangan pernah membuat configurator blank screen").
  if (!catalog) {
    return (
      <div className="m-6 rounded-xl border border-luxury-gold/10 p-6 text-center">
        <p className="font-luxury-sans text-xs text-luxury-taupe">Pilihan konfigurasi belum tersedia.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-luxury-gold/10">
      {PHOTO_SECTIONS.map((section) => (
        <RadioSection
          key={section.field}
          field={section.field}
          label={section.label}
          isOpen={openSection === section.field}
          onOpen={setOpenSection}
          options={catalog.fields[section.field]}
        />
      ))}

      <ColorSection isOpen={openSection === 'colorId'} onOpen={setOpenSection} options={catalog.fields.colorId} />

      <EmbroiderySection isOpen={openSection === 'embroidery'} onOpen={setOpenSection} options={catalog.fields.embroidery} />

      <AccessoriesSection isOpen={openSection === 'accessories'} onOpen={setOpenSection} options={catalog.accessories} />
    </div>
  )
}

function SectionHeader({ label, isOpen, onToggle, panelId }: { label: string; isOpen: boolean; onToggle: () => void; panelId: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={panelId}
      className="flex w-full cursor-pointer items-center justify-between px-6 py-4 md:cursor-default"
    >
      <span className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-ivory">{label}</span>
      <span aria-hidden="true" className="font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-taupe md:hidden">
        {isOpen ? '−' : '+'}
      </span>
    </button>
  )
}

interface RadioSectionProps {
  field: Exclude<ConfiguratorField, 'embroidery' | 'colorId'>
  label: string
  isOpen: boolean
  onOpen: (section: OpenSection) => void
  options: ConfiguratorOption[]
}

// modelId / collarId / cuffId / fabricId share this shape — single-select,
// native <input type="radio"> group per field, photo card variant. Color
// gets its own component below (swatch variant + its own copy).
//
// `onOpen` is the raw, referentially-stable setOpenSection setter passed
// straight through from the parent (W2-5) — previously each section got a
// freshly-created `() => setOpenSection(field)` closure every render,
// which silently defeated this component's own React.memo on every open/
// close toggle. Same reasoning for OptionCard's onChange below.
const RadioSection = memo(function RadioSection({ field, label, isOpen, onOpen, options }: RadioSectionProps) {
  const selectedId = useConfiguratorStore((s) => s.config[field])
  const updateConfig = useConfiguratorStore((s) => s.updateConfig)
  const panelId = `configurator-panel-${field}`

  const handleSelect = useCallback(
    (id: string) => {
      updateConfig({ [field]: id } as Partial<DesignConfig>)
      const option = options.find((o) => o.id === id)
      if (option) FIELD_TRACKERS[field](option.id, option.name)
    },
    [field, options, updateConfig]
  )

  return (
    <div>
      <SectionHeader label={label} isOpen={isOpen} onToggle={() => onOpen(field)} panelId={panelId} />
      <div id={panelId} className={`px-6 pb-5 ${isOpen ? 'block' : 'hidden'} md:block`}>
        {options.length === 0 ? (
          <p className="font-luxury-sans text-xs text-luxury-taupe">Belum ada pilihan aktif untuk kategori ini.</p>
        ) : (
          <fieldset className="flex flex-wrap gap-3">
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
        )}
      </div>
    </div>
  )
})

// Color gets its own component rather than reusing RadioSection generically
// because it's excluded from PHOTO_SECTIONS above (swatch variant + its own
// "Warna" copy) — folding it back into the generic list would just make the
// variant lookup less readable for one field.
const ColorSection = memo(function ColorSection({
  isOpen,
  onOpen,
  options,
}: {
  isOpen: boolean
  onOpen: (section: OpenSection) => void
  options: ConfiguratorOption[]
}) {
  const selectedId = useConfiguratorStore((s) => s.config.colorId)
  const updateConfig = useConfiguratorStore((s) => s.updateConfig)
  const panelId = 'configurator-panel-colorId'

  const handleSelect = useCallback(
    (id: string) => {
      updateConfig({ colorId: id })
      const option = options.find((o) => o.id === id)
      if (option) trackColorSelected(option.id, option.name)
    },
    [options, updateConfig]
  )

  return (
    <div>
      <SectionHeader label="Warna" isOpen={isOpen} onToggle={() => onOpen('colorId')} panelId={panelId} />
      <div id={panelId} className={`px-6 pb-5 ${isOpen ? 'block' : 'hidden'} md:block`}>
        {options.length === 0 ? (
          <p className="font-luxury-sans text-xs text-luxury-taupe">Belum ada pilihan aktif untuk kategori ini.</p>
        ) : (
          <fieldset className="flex flex-wrap gap-3">
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
        )}
      </div>
    </div>
  )
})

// Toggle + motif picker. The free-text field is intentionally local-only
// draft state — DesignConfig (locked this sprint) has no field for it yet,
// so it isn't wired into the store or the estimate/save API contract.
const EmbroiderySection = memo(function EmbroiderySection({
  isOpen,
  onOpen,
  options,
}: {
  isOpen: boolean
  onOpen: (section: OpenSection) => void
  options: ConfiguratorOption[]
}) {
  const embroideryId = useConfiguratorStore((s) => s.config.embroidery)
  const updateConfig = useConfiguratorStore((s) => s.updateConfig)
  const [customText, setCustomText] = useState('')
  const enabled = embroideryId !== null
  const panelId = 'configurator-panel-embroidery'

  function handleToggle(next: boolean) {
    if (!next) {
      updateConfig({ embroidery: null })
    } else if (options[0]) {
      updateConfig({ embroidery: options[0].id })
      trackEmbroideryAdded(options[0].id, options[0].name)
    }
  }

  const handleSelect = useCallback(
    (id: string) => {
      updateConfig({ embroidery: id })
      const option = options.find((o) => o.id === id)
      if (option) trackEmbroideryAdded(option.id, option.name)
    },
    [options, updateConfig]
  )

  return (
    <div>
      <SectionHeader label="Bordir" isOpen={isOpen} onToggle={() => onOpen('embroidery')} panelId={panelId} />
      <div id={panelId} className={`space-y-4 px-6 pb-5 ${isOpen ? 'block' : 'hidden'} md:block`}>
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
              <p className="font-luxury-sans text-xs text-luxury-taupe">Belum ada motif bordir aktif.</p>
            ) : (
              <fieldset className="flex flex-wrap gap-3">
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
    </div>
  )
})

const AccessoriesSection = memo(function AccessoriesSection({
  isOpen,
  onOpen,
  options,
}: {
  isOpen: boolean
  onOpen: (section: OpenSection) => void
  options: ConfiguratorOption[]
}) {
  const selectedIds = useConfiguratorStore((s) => s.config.accessories)
  const updateConfig = useConfiguratorStore((s) => s.updateConfig)
  const panelId = 'configurator-panel-accessories'

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

  return (
    <div>
      <SectionHeader label="Aksesori" isOpen={isOpen} onToggle={() => onOpen('accessories')} panelId={panelId} />
      <div id={panelId} className={`px-6 pb-5 ${isOpen ? 'block' : 'hidden'} md:block`}>
        {options.length === 0 ? (
          <p className="font-luxury-sans text-xs text-luxury-taupe">Belum ada pilihan aktif untuk kategori ini.</p>
        ) : (
          <fieldset className="flex flex-wrap gap-3">
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
        )}
      </div>
    </div>
  )
})
