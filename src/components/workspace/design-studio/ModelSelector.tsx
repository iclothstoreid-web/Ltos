'use client'

import type { MasterDataOption } from '@/lib/design/masterData'
import { OptionGroup } from './OptionGroup'

interface ModelSelectorProps {
  options: MasterDataOption[]
  selected: string
  onSelect: (model: string) => void
  onViewSpec: (option: MasterDataOption) => void
}

type FitterModelAlias = {
  label: 'Saudi' | 'Qatary' | 'Kandora'
  matches: (option: MasterDataOption) => boolean
}

// Fitter only needs the three actual garment families used operationally.
// Keep the master-data row/name underneath unchanged so existing orders,
// specifications and public configurator references remain compatible.
const FITTER_MODELS: FitterModelAlias[] = [
  {
    label: 'Saudi',
    matches: option => /saudi/i.test(`${option.name} ${option.metadata.legacy_model_name ?? ''} ${option.metadata.tagline ?? ''}`),
  },
  {
    label: 'Qatary',
    matches: option => /qatar/i.test(`${option.name} ${option.metadata.legacy_model_name ?? ''} ${option.metadata.tagline ?? ''}`),
  },
  {
    label: 'Kandora',
    matches: option => /kandora|emirati/i.test(`${option.name} ${option.metadata.legacy_model_name ?? ''} ${option.metadata.tagline ?? ''}`),
  },
]

function aliasFor(option: MasterDataOption | undefined): FitterModelAlias | undefined {
  if (!option) return undefined
  return FITTER_MODELS.find(model => model.matches(option))
}

export function ModelSelector({ options, selected, onSelect, onViewSpec }: ModelSelectorProps) {
  const sourceByAlias = new Map<string, MasterDataOption>()
  const fitterOptions: MasterDataOption[] = []

  for (const alias of FITTER_MODELS) {
    const source = options.find(alias.matches)
    if (!source) continue
    sourceByAlias.set(alias.label, source)
    fitterOptions.push({ ...source, name: alias.label })
  }

  const selectedSource = options.find(option => option.name === selected)
  const selectedAlias = aliasFor(selectedSource)?.label ?? selected

  return (
    <OptionGroup
      options={fitterOptions}
      selected={selectedAlias}
      onSelect={alias => onSelect(sourceByAlias.get(alias)?.name ?? alias)}
      onViewSpec={option => {
        const source = sourceByAlias.get(option.name)
        if (source) onViewSpec(source)
      }}
    />
  )
}
