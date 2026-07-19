'use client'

import type { MasterDataOption } from '@/lib/design/masterData'
import { OptionGroup } from './OptionGroup'

interface EmbroideryZigzagSelectorProps {
  embroideryOptions: MasterDataOption[]
  zigzagOptions: MasterDataOption[]
  embroidery: string
  handmadeZigzag: string
  onSelectEmbroidery: (value: string) => void
  onSelectHandmadeZigzag: (value: string) => void
  onViewSpec: (option: MasterDataOption) => void
}

// Same shape as CollarCuffSelector/PocketPlaketSelector — Bordir and
// Handmade Zig-Zag are two independent master data categories shown
// together under one accordion.
export function EmbroideryZigzagSelector({
  embroideryOptions,
  zigzagOptions,
  embroidery,
  handmadeZigzag,
  onSelectEmbroidery,
  onSelectHandmadeZigzag,
  onViewSpec,
}: EmbroideryZigzagSelectorProps) {
  return (
    <div className="space-y-5">
      <OptionGroup label="Bordir" options={embroideryOptions} selected={embroidery} onSelect={onSelectEmbroidery} onViewSpec={onViewSpec} />
      <OptionGroup
        label="Handmade Zig-Zag"
        options={zigzagOptions}
        selected={handmadeZigzag}
        onSelect={onSelectHandmadeZigzag}
        onViewSpec={onViewSpec}
      />
    </div>
  )
}
