'use client'

import type { MasterDataOption } from '@/lib/design/masterData'
import { OptionGroup } from './OptionGroup'

interface PocketPlaketSelectorProps {
  pocketOptions: MasterDataOption[]
  plaketOptions: MasterDataOption[]
  pocket: string
  plaket: string
  onSelectPocket: (value: string) => void
  onSelectPlaket: (value: string) => void
}

// Same shape as CollarCuffSelector — Saku (pocket) and Plaket are two
// independent master data categories shown together under one accordion.
export function PocketPlaketSelector({
  pocketOptions,
  plaketOptions,
  pocket,
  plaket,
  onSelectPocket,
  onSelectPlaket,
}: PocketPlaketSelectorProps) {
  return (
    <div className="space-y-5">
      <OptionGroup label="Saku" options={pocketOptions} selected={pocket} onSelect={onSelectPocket} />
      <OptionGroup label="Plaket" options={plaketOptions} selected={plaket} onSelect={onSelectPlaket} />
    </div>
  )
}
