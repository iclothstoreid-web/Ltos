import { CATEGORY_BY_FIELD } from '@/components/workspace/design-studio/types'
import type { DesignSelections } from '@/components/workspace/design-studio/types'
import type { MasterOptionsByCategory, MasterDataOption } from '@/lib/design/masterData'
import type { EstimasiPengerjaan } from '@/components/workspace/consultation-review/fitterEnhancementsCodec'
import type { DesignSpecification, DesignSpecOptionRef, PriceSnapshotLine } from './types'

interface BuildDesignSpecificationParams {
  consultationId: string
  selections: DesignSelections
  masterOptions: MasterOptionsByCategory
  // Design Studio doesn't collect this itself (it's a Consultation Review
  // field) — omit to leave whatever the existing specification already had.
  estimatedProductionSpeed?: EstimasiPengerjaan
  // Fitter's freeform Design Notes — omit to leave the existing value.
  notes?: string
  // Previous specification for this consultation, if one exists, so fields
  // not part of the current call don't get lost (same pattern as
  // buildCustomerDigitalProfile's existingProfile).
  existingSpecification?: DesignSpecification | null
}

function resolveOption(options: MasterDataOption[] | undefined, name: string): MasterDataOption | null {
  if (!name) return null
  return options?.find(option => option.name === name) ?? null
}

function toRef(option: MasterDataOption | null): DesignSpecOptionRef | null {
  return option ? { id: option.id, name: option.name } : null
}

// Design Specification Builder: translates the current DesignSelections
// (which stores option names, per the existing notesCodec format) plus the
// live master data catalog into a permanent, ID-backed object. Call this
// every time a pilihan changes and persist the result — it does not wait
// for Create Order.
export function buildDesignSpecification(params: BuildDesignSpecificationParams): DesignSpecification {
  const fields = Object.keys(CATEGORY_BY_FIELD) as Array<keyof DesignSelections>

  const resolved = fields.reduce((acc, field) => {
    acc[field] = resolveOption(params.masterOptions[CATEGORY_BY_FIELD[field]], params.selections[field])
    return acc
  }, {} as Record<keyof DesignSelections, MasterDataOption | null>)

  const lines: PriceSnapshotLine[] = fields
    .map(field => resolved[field])
    .filter((option): option is MasterDataOption => option !== null)
    .map(option => ({
      category: option.category,
      optionId: option.id,
      optionName: option.name,
      price: option.price,
      subtotal: option.price,
    }))

  const total = lines.reduce((sum, line) => sum + line.subtotal, 0)

  return {
    consultationId: params.consultationId,
    model: toRef(resolved.model),
    lookCutting: toRef(resolved.lookCutting),
    fabric: toRef(resolved.fabric),
    color: toRef(resolved.color),
    collar: toRef(resolved.collar),
    cuff: toRef(resolved.cuff),
    plaket: toRef(resolved.plaket),
    pocket: toRef(resolved.pocket),
    button: toRef(resolved.button),
    embroidery: toRef(resolved.embroidery),
    handmadeZigzag: toRef(resolved.handmadeZigzag),
    priceSnapshot: { lines, total },
    estimatedProductionSpeed:
      params.estimatedProductionSpeed ?? params.existingSpecification?.estimatedProductionSpeed ?? '',
    notes: params.notes ?? params.existingSpecification?.notes ?? '',
    lastUpdated: new Date().toISOString(),
  }
}
