import type { MasterDataCategory } from '@/lib/design/masterData'
import type { EstimasiPengerjaan } from '@/components/workspace/consultation-review/fitterEnhancementsCodec'

// A resolved pilihan always carries its master data ID, never just the
// display name — per the brief ("Jangan menyimpan display text saja").
export interface DesignSpecOptionRef {
  id: string
  name: string
}

// One frozen line per selected pilihan, captured at the moment the fitter
// picked it. `price`/`optionName` are copied here (not looked up live) so a
// later catalog price/name change can never retroactively alter this line.
export interface PriceSnapshotLine {
  category: MasterDataCategory
  optionId: string
  optionName: string
  price: number
  subtotal: number
}

export interface PriceSnapshot {
  lines: PriceSnapshotLine[]
  total: number
}

// Permanent, render-agnostic translation of every customer pilihan into one
// consistent object — source of truth for Design Studio (see
// buildDesignSpecification). Never stores a render/preview/AI output; see
// src/lib/customerProfile/renderContext.ts for the separate ephemeral object
// that combines this with the Customer Digital Profile.
export interface DesignSpecification {
  consultationId: string
  model: DesignSpecOptionRef | null
  lookCutting: DesignSpecOptionRef | null
  fabric: DesignSpecOptionRef | null
  color: DesignSpecOptionRef | null
  collar: DesignSpecOptionRef | null
  cuff: DesignSpecOptionRef | null
  plaket: DesignSpecOptionRef | null
  pocket: DesignSpecOptionRef | null
  button: DesignSpecOptionRef | null
  embroidery: DesignSpecOptionRef | null
  handmadeZigzag: DesignSpecOptionRef | null
  priceSnapshot: PriceSnapshot
  estimatedProductionSpeed: EstimasiPengerjaan
  notes: string
  lastUpdated: string
}
