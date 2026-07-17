'use client'

import type { DesignSelections } from './types'
import type { MasterOptionsByCategory } from '@/lib/design/masterData'
import { Accordion } from './Accordion'
import { ModelSelector } from './ModelSelector'
import { LookCuttingSelector } from './LookCuttingSelector'
import { FabricSelector } from './FabricSelector'
import { ColorSelector } from './ColorSelector'
import { CollarCuffSelector } from './CollarCuffSelector'
import { PocketPlaketSelector } from './PocketPlaketSelector'
import { ButtonSelector } from './ButtonSelector'

interface GarmentBlueprintPanelProps {
  selections: DesignSelections
  masterOptions: MasterOptionsByCategory
  onChange: (key: keyof DesignSelections, value: string) => void
}

export function GarmentBlueprintPanel({ selections, masterOptions, onChange }: GarmentBlueprintPanelProps) {
  return (
    <aside className="w-[30%] h-full border-r-[0.5px] border-[#c4c7c7] bg-[#f9f9ff] flex flex-col">
      <div className="p-8 border-b-[0.5px] border-[#c4c7c7]">
        <h2 className="font-caslon text-2xl text-[#151c27]">Garment Blueprint</h2>
        <p className="font-sans text-sm text-[#444748] mt-2">
          Refining the silhouette for a perfect bespoke fit.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <Accordion index={1} title="Garment Model" defaultOpen>
          <ModelSelector
            options={masterOptions.model_thobe}
            selected={selections.model}
            onSelect={v => onChange('model', v)}
          />
        </Accordion>

        <Accordion index={2} title="Look Cutting">
          <LookCuttingSelector
            options={masterOptions.look_cutting}
            selected={selections.lookCutting}
            onSelect={v => onChange('lookCutting', v)}
          />
        </Accordion>

        <Accordion index={3} title="Fabric Selection">
          <FabricSelector
            options={masterOptions.bahan}
            selected={selections.fabric}
            onSelect={v => onChange('fabric', v)}
          />
        </Accordion>

        <Accordion index={4} title="Fabric Color">
          <ColorSelector
            options={masterOptions.warna_bahan}
            selected={selections.color}
            onSelect={v => onChange('color', v)}
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
          />
        </Accordion>

        <Accordion index={7} title="Kancing & Aksesori">
          <ButtonSelector
            options={masterOptions.aksesori}
            selected={selections.button}
            onSelect={v => onChange('button', v)}
          />
        </Accordion>
      </div>
    </aside>
  )
}
