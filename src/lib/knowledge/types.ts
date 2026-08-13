// Sprint W6 — Local Tailor Knowledge Engine. Shared content schema for every
// /knowledge page. 26 articles across 3 live categories (fabrics/measurements/
// styling) share this one schema and are rendered by one dynamic route
// (src/app/knowledge/[category]/[slug]/page.tsx) rather than 26 bespoke page
// files — the "reusable content architecture" the sprint brief asks for is
// this schema + registry, not a component-per-page.

export type KnowledgeCategorySlug = 'fabrics' | 'measurements' | 'styling' | 'wedding' | 'umrah' | 'care' | 'tailoring'

export interface KnowledgeFaqItem {
  question: string
  answer: string
}

// Qualified reference (not a bare slug) — 'chest' only exists under
// measurements, 'navy-thobe' only under styling, but nothing stops two
// categories from reusing a word, so every cross-link is unambiguous.
export interface KnowledgeRef {
  category: KnowledgeCategorySlug
  slug: string
}

export interface KnowledgeParagraphBlock {
  kind: 'paragraphs'
  items: string[]
}

export interface KnowledgeListBlock {
  kind: 'list'
  items: string[]
}

export interface KnowledgeStepsBlock {
  kind: 'steps'
  items: { name: string; text: string }[]
}

export interface KnowledgeTableBlock {
  kind: 'table'
  headers: string[]
  rows: string[][]
}

// One shared block union covers all 3 article shapes the brief asks for
// (fabric/measurement/styling each need different content — prose, lists,
// step sequences, comparison tables) without a separate template per shape.
export type KnowledgeContentBlock = KnowledgeParagraphBlock | KnowledgeListBlock | KnowledgeStepsBlock | KnowledgeTableBlock

export interface KnowledgeSection {
  heading: string
  block: KnowledgeContentBlock
}

export interface KnowledgeArticle {
  slug: string
  category: KnowledgeCategorySlug
  eyebrow: string
  title: string
  navLabel: string
  metaDescription: string
  dek: string
  // The opening definitional sentence ("Linen adalah serat alami...") — the
  // brief's own AI-discoverability example. Rendered first, before any
  // section, and reused verbatim as the Article schema's `description` seed.
  definition: string
  sections: KnowledgeSection[]
  faq: KnowledgeFaqItem[]
  relatedArticles: KnowledgeRef[]
  // Styling -> Fabric linking rule. Optional — only styling articles set
  // this; fabric/measurement articles have no natural "recommended fabric".
  relatedFabrics?: KnowledgeRef[]
  // Category-level links that don't resolve to a specific article yet —
  // e.g. every fabric article points at the `care` hub (Fabric -> Care)
  // even though no /knowledge/care articles exist this sprint.
  relatedCategories?: KnowledgeCategorySlug[]
}

export interface KnowledgeCategory {
  slug: KnowledgeCategorySlug
  label: string
  eyebrow: string
  title: string
  metaDescription: string
  intro: string[]
  faq: KnowledgeFaqItem[]
  relatedCategories: KnowledgeCategorySlug[]
  // 'live' categories (fabrics/measurements/styling) have articles this
  // sprint. 'foundation' categories (wedding/umrah/care/tailoring) are hub
  // pages only — real content lands in Sprint W6-5 onward, per the brief's
  // own framing of this sprint as the foundation for those.
  status: 'live' | 'foundation'
}
