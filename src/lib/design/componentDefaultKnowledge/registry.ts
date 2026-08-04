import { MASTER_DATA_CATEGORIES, type MasterDataCategory } from '@/lib/design/masterData'
import { EMPTY_COMPONENT_DEFAULT_KNOWLEDGE, type ComponentDefaultKnowledge } from './types'

// One Component Default Knowledge slot per category (Model Thobe, Look
// Cutting, Kerah/Collar, Manset/Cuff, Plaket/Front Placket, Saku/Chest
// Pocket, Bahan, Warna Bahan, Aksesori, Bordir, Handmade Zig-Zag) — every
// category gets a slot up front so a future sprint can populate any of them
// without touching this module's shape again. No content is seeded here
// (locked brief: "Jangan mengisi data default apa pun" / "Jangan mengisi
// data komponen") — every slot starts as EMPTY_COMPONENT_DEFAULT_KNOWLEDGE.
export const COMPONENT_DEFAULT_KNOWLEDGE: Record<MasterDataCategory, ComponentDefaultKnowledge> =
  MASTER_DATA_CATEGORIES.reduce((acc, category) => {
    acc[category] = EMPTY_COMPONENT_DEFAULT_KNOWLEDGE
    return acc
  }, {} as Record<MasterDataCategory, ComponentDefaultKnowledge>)

export function getComponentDefaultKnowledge(category: MasterDataCategory): ComponentDefaultKnowledge {
  return COMPONENT_DEFAULT_KNOWLEDGE[category] ?? EMPTY_COMPONENT_DEFAULT_KNOWLEDGE
}
