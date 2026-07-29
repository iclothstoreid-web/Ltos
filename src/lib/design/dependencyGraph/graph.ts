import type { MasterDataCategory } from '@/lib/design/masterData'

// Dependency Graph (Incremental Render Engine V1 lock, Task 4) — the node
// set is one conceptual Layer per Master Data category, so it stays in sync
// with design_master_options.category for free. Adding a future DNA type
// (Bordir already exists; a new one like Piping/Patch/Label/Laser Engraving)
// only ever needs one new MasterDataCategory + one new entry in
// LAYER_BY_CATEGORY + (optionally) one edge in LAYER_DEPENDENCIES below —
// Dirty Layer Detection, Render Cache and the render route itself never
// change (Task 8, Future Proof).
export type LayerId =
  | 'body'
  | 'look'
  | 'material'
  | 'color'
  | 'neck'
  | 'placket'
  | 'pocket'
  | 'sleeve'
  | 'button'
  | 'embroidery'
  | 'zigzag'

export const LAYER_BY_CATEGORY: Record<MasterDataCategory, LayerId> = {
  model_thobe: 'body',
  look_cutting: 'look',
  bahan: 'material',
  warna_bahan: 'color',
  kerah: 'neck',
  plaket: 'placket',
  saku: 'pocket',
  manset: 'sleeve',
  aksesori: 'button',
  bordir: 'embroidery',
  handmade_zigzag: 'zigzag',
}

export function isKnownCategory(value: string): value is MasterDataCategory {
  return value in LAYER_BY_CATEGORY
}

// Downstream -> upstream edges, exactly the cross-layer dependencies the
// locked business rule names (Task 4's "Color -> Material", "Look -> Body
// Shape", "Embroidery -> Body Surface"). A layer listed here is affected by
// — and must be treated as dirty alongside — a change to any layer in its
// array, even when its own selection didn't change. Every other layer
// (Neck/Placket/Pocket/Sleeve/Button/Zigzag) has no dependency the business
// rule specifies, so it is deliberately left out rather than guessed at;
// extend this map only when a real dependency is specified, never
// speculatively.
export const LAYER_DEPENDENCIES: Partial<Record<LayerId, LayerId[]>> = {
  color: ['material'],
  look: ['body'],
  embroidery: ['body'],
}
