'use client'

import { useState } from 'react'
import type { DesignSelections } from './types'
import type { MasterOptionsByCategory, MasterDataOption } from '@/lib/design/masterData'
import { Accordion } from './Accordion'
import { ModelSelector } from './ModelSelector'
import { LookCuttingSelector } from './LookCuttingSelector'
import { FabricSelector } from './FabricSelector'
import { ColorSelector } from './ColorSelector'
import { CollarCuffSelector } from './CollarCuffSelector'
import { PocketPlaketSelector } from './PocketPlaketSelector'
import { ButtonSelector } from './ButtonSelector'
import { EmbroideryZigzagSelector } from './EmbroideryZigzagSelector'
import { DesignNotesField } from './DesignNotesField'
import { SpecDetailModal } from './SpecDetailModal'

interface MaterialStockInfo {
  available_stock: number
  min_stock: number
  unit: string
}

interface GarmentBlueprintPanelProps {
  selections: DesignSelections
  masterOptions: MasterOptionsByCategory
  materialStock: Record<string, MaterialStockInfo>
  onChange: (key: keyof DesignSelections, value: string) => void
  notes: string
  onNotesChange: (value: string) => void
}

export function GarmentBlueprintPanel({
  selections,
  masterOptions,
  materialStock,
  onChange,
  notes,
  onNotesChange,
}: GarmentBlueprintPanelProps) {
  // "Lihat Spesifikasi" state lives here, local to the picker panel — purely
  // additive on top of the existing selection workflow, doesn't touch
  // `selections`/`onChange` at all.
  const [specOption, setSpecOption] = useState<MasterDataOption | null>(null)

  return (
    <aside className="w-full lg:w-[30%] lg:h-full border-b-[0.5px] lg:border-b-0 lg:border-r-[0.5px] border-[#c4c7c7] bg-[#f9f9ff] flex flex-col">
      <div className="p-4 sm:p-6 lg:p-8 border-b-[0.5px] border-[#c4c7c7]">
        <h2 className="font-caslon text-2xl text-[#151c27]">Cetak Biru Busana</h2>
        <p className="font-sans text-sm text-[#444748] mt-2">
          Menyempurnakan siluet untuk hasil bespoke yang sempurna.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <Accordion index={1} title="Model Busana" defaultOpen>
          <ModelSelector
            options={masterOptions.model_thobe}
            selected={selections.model}
            onSelect={v => onChange('model', v)}
            onViewSpec={setSpecOption}
          />
        </Accordion>

        <Accordion index={2} title="Look Cutting">
          <LookCuttingSelector
            options={masterOptions.look_cutting}
            selected={selections.lookCutting}
            onSelect={v => onChange('lookCutting', v)}
            onViewSpec={setSpecOption}
          />
        </Accordion>

        <Accordion index={3} title="Pilihan Bahan">
          <FabricSelector
            options={masterOptions.bahan}
            selected={selections.fabric}
            materialStock={materialStock}
            onSelect={v => onChange('fabric', v)}
            onViewSpec={setSpecOption}
          />
        </Accordion>

        <Accordion index={4} title="Warna Bahan">
          <ColorSelector
            options={masterOptions.warna_bahan}
            selected={selections.color}
            onSelect={v => onChange('color', v)}
            onViewSpec={setSpecOption}
          />
        </Accordion>

        <Accordion index={5} title="Kerah & Manset">
          <CollarCuffSelector
            collarOptions={masterOptions.kerah}
            cuffOptions={masterOptions.manset}
            collar={selections.collar}
            cuff={selections.cuff}
            onSelectCollar={v => onChange('collar', v)}
            onSelectCuff={v => onChange('cuff', v)}
            onViewSpec={setSpecOption}
          />
        </Accordion>

        <Accordion index={6} title="Saku & Plaket">
          <PocketPlaketSelector
            pocketOptions={masterOptions.saku}
            plaketOptions={masterOptions.plaket}
            pocket={selections.pocket}
            plaket={selections.plaket}
            onSelectPocket={v => onChange('pocket', v)}
            onSelectPlaket={v => onChange('plaket', v)}
            onViewSpec={setSpecOption}
          />
        </Accordion>

        <Accordion index={7} title="Kancing & Aksesori">
          <ButtonSelector
            options={masterOptions.aksesori}
            selected={selections.button}
            onSelect={v => onChange('button', v)}
            onViewSpec={setSpecOption}
          />
        </Accordion>

        <Accordion index={8} title="Bordir & Handmade Zig-Zag">
          <EmbroideryZigzagSelector
            embroideryOptions={masterOptions.bordir}
            zigzagOptions={masterOptions.handmade_zigzag}
            embroidery={selections.embroidery}
            handmadeZigzag={selections.handmadeZigzag}
            onSelectEmbroidery={v => onChange('embroidery', v)}
            onSelectHandmadeZigzag={v => onChange('handmadeZigzag', v)}
            onViewSpec={setSpecOption}
          />
        </Accordion>

        <Accordion index={9} title="Catatan Desain">
          <DesignNotesField value={notes} onChange={onNotesChange} />
        </Accordion>
      </div>

      <SpecDetailModal option={specOption} onClose={() => setSpecOption(null)} />
    </aside>
  )
}
