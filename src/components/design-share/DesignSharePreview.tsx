'use client'

import type { ConfiguratorOption } from '@/types/configurator'
import { BaseGarment } from '@/components/configurator/preview/BaseGarment'
import { CollarLayer } from '@/components/configurator/preview/CollarLayer'
import { CuffLayer } from '@/components/configurator/preview/CuffLayer'
import { EmbroideryLayer } from '@/components/configurator/preview/EmbroideryLayer'
import { AccessoriesLayer } from '@/components/configurator/preview/AccessoriesLayer'

interface DesignSharePreviewProps {
  model: ConfiguratorOption | null
  collar: ConfiguratorOption | null
  cuff: ConfiguratorOption | null
  embroidery: ConfiguratorOption | null
  accessories: ConfiguratorOption[]
}

// Read-only reuse of the exact W2-2 preview layer stack — driven by plain
// props (resolved server-side from the share slug) instead of the
// Zustand store, since this page has no configurator session of its own.
// The preview engine itself (the 5 layer components) is untouched.
export function DesignSharePreview({ model, collar, cuff, embroidery, accessories }: DesignSharePreviewProps) {
  return (
    <div className="relative h-64 w-48">
      <BaseGarment model={model} />
      <CollarLayer collar={collar} />
      <CuffLayer cuff={cuff} />
      <EmbroideryLayer embroidery={embroidery} />
      <AccessoriesLayer accessories={accessories} />
    </div>
  )
}
