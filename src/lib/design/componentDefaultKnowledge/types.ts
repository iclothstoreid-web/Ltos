// Component Default Knowledge — per-CATEGORY baseline Component Knowledge
// (Front Placket, Collar, Chest Pocket, Cuff, ...), inherited by every
// variant/item in that category. Sits between Global Render Policy (Engine,
// applies to every render regardless of category) and Component Delta
// Knowledge (design_master_options.ai_dna, per-ITEM — only what differs
// from its own category's default) in the locked architecture:
//
//   Global Render Policy (Engine)
//     + Component Default Knowledge (this module, per-category)
//     + Component Delta Knowledge (per-item, e.g. Front Placket -> Hexagon)
//     -> Recipe Composer -> Prompt Builder -> Prompt Compression -> GPT Image
//
// Infrastructure only (locked brief, 2026-08-04) — every category's slot is
// intentionally empty (see registry.ts). Populating real per-category
// content is an explicit future sprint's decision, not made here.
//
// Shape mirrors AiDesignDna's own Component Knowledge fields (referenceInstruction/
// lockRules/negativeRules — see aiDna/types.ts) since this is the same kind
// of knowledge, one level up the inheritance chain. `referenceInstruction`
// is reserved for a future sprint: resolver.ts below already resolves it
// (delta wins, default is the fallback) so the shape is ready, but Recipe
// Composer does not consume that resolved value yet this sprint — only
// lockRules/negativeRules are wired into composeRenderRecipe (see
// recipeComposer/composer.ts's own comment on this).
export interface ComponentDefaultKnowledge {
  referenceInstruction: string | null
  lockRules: string[]
  negativeRules: string[]
}

export const EMPTY_COMPONENT_DEFAULT_KNOWLEDGE: ComponentDefaultKnowledge = {
  referenceInstruction: null,
  lockRules: [],
  negativeRules: [],
}
