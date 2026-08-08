import { IDENTITY_LOCK } from '@/lib/design/renderEngine/identityLock'
import { REFERENCE_BINDING } from '@/lib/design/renderEngine/referenceBinding'
import { GARMENT } from '@/lib/design/renderEngine/garment'
import { OUTPUT } from '@/lib/design/renderEngine/output'

// Prompt Builder (Prompt UAT Source of Truth realignment, this sprint;
// Look Cutting/Aksesori/Bordir/Handmade Zig-Zag slots restored the same
// sprint's revision round) — replaces the prior 13-fixed-section, priority/
// token-budget compression engine (promptBuilder/compression.ts) entirely.
// The locked order, with no wrapper/label/formatting of any kind
// ("Builder tidak boleh menambahkan: Preserve:/Avoid:/Transfer only:/Do NOT
// copy:/referenceInstruction:/componentRules:/... wrapper lain, label lain,
// formatting lain, kalimat lain"):
//
//   1. Identity Lock       6. Look Cutting        11. Bordir
//   2. Reference Binding   7. Kerah  \             12. Handmade Zig-Zag
//   3. Garment              8. Plaket  } Exact      13. Output
//   4. Material              9. Saku    Component
//   5. Color                10. Manset / Copy
//
// "Exact Component Copy" (Kerah/Plaket/Saku/Manset) is a grouping label from
// the revision brief describing WHY those four are copy-exact-from-reference
// components, unlike Look Cutting (a fit/silhouette delta, no Hero Image) —
// it names no literal text of its own and contributes nothing to the
// assembled string; only the components' own raw referenceInstruction text
// does. A category the customer did not select for this render (or one with
// no Master Data content yet, e.g. Aksesori/Bordir/Handmade Zig-Zag today)
// simply contributes no block — never a placeholder, never an empty label.
//
// Material/Color/Look Cutting/Kerah/Plaket/Saku/Manset/Aksesori/Bordir/
// Handmade Zig-Zag each carry exactly their own item's
// ai_dna.referenceInstruction (Color: ai_dna's `color` field, per DNA
// Resolver's own carve-out — see dnaResolver/resolver.ts), raw, with no
// concatenation of componentRules or any other field.
export interface FinalPromptSections {
  material: string | null
  color: string | null
  lookCutting: string | null
  kerah: string | null
  plaket: string | null
  saku: string | null
  manset: string | null
  aksesori: string | null
  bordir: string | null
  handmadeZigzag: string | null
}

export function buildFinalPrompt(sections: FinalPromptSections): string {
  return [
    IDENTITY_LOCK,
    REFERENCE_BINDING,
    GARMENT,
    sections.material,
    sections.color,
    sections.lookCutting,
    sections.kerah,
    sections.plaket,
    sections.saku,
    sections.manset,
    sections.aksesori,
    sections.bordir,
    sections.handmadeZigzag,
    OUTPUT,
  ]
    .filter((block): block is string => !!block && block.trim().length > 0)
    .join(' ')
}
