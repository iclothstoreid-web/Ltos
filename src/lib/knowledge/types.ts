// Sprint W6 — Knowledge Engine. Shared content schema for every
// /knowledge page. 26 articles across 3 live categories (fabrics/measurements/
// styling) share this one schema and are rendered by one dynamic route
// (src/app/knowledge/[category]/[slug]/page.tsx) rather than 26 bespoke page
// files — the "reusable content architecture" the sprint brief asks for is
// this schema + registry, not a component-per-page.

// Sprint W6-10 — 'questions' (FAQ domination layer) and 'bandung' (local
// authority layer, originally 'bogor' — renamed at the Brand & Location
// Correction to match Local Tailor's real Bandung workshop) added to the
// same closed union the [category]/[slug] route already drives off of.
// Same architecture as the original 7, not a parallel system — this is
// the "Gunakan Knowledge Engine yang sudah ada" instruction taken
// literally.
// Sprint Y — 'design-studio' added for the Digital Bespoke Tailoring
// content cluster (cornerstone + 14 supporting articles, all pointing back
// at /design-studio), same closed-union architecture as every category
// before it.
export type KnowledgeCategorySlug = 'fabrics' | 'measurements' | 'styling' | 'wedding' | 'umrah' | 'care' | 'tailoring' | 'questions' | 'bandung' | 'design-studio'

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

// Sprint W6-8 — one level of H3 subsections under an H2 section, for
// articles that need "2-4 H3" depth (e.g. a "Panduan Praktis" H2 broken
// into "Sebelum Berangkat" / "Selama Perjalanan" H3s). Optional and
// additive — none of the 26 W6-2/3/4 articles use it, so their `sections`
// data is untouched.
export interface KnowledgeSubsection {
  heading: string
  block: KnowledgeContentBlock
}

export interface KnowledgeSection {
  heading: string
  block: KnowledgeContentBlock
  subsections?: KnowledgeSubsection[]
}

// Sprint W6-7 — tag dimensions for the Related Content Engine. Optional;
// only set on articles where a dimension genuinely applies (a fabric
// article has no "occasion", a wedding article has no "season"). Used by
// getRelatedByTags() to cross-link articles that share a real dimension
// (e.g. two 'wedding' occasion articles from different categories) rather
// than only within-category relatedArticles.
export interface KnowledgeTags {
  occasion?: string[]
  fit?: string[]
  audience?: string[]
  season?: string[]
  service?: string[]
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
  // Sprint W6-8 — "Quick Answer" box, a 1-2 sentence direct answer shown
  // above the fold, above even the definition quote. Optional — only the
  // 32 W6-5/6 articles set this; older articles fall back to `definition`.
  quickAnswer?: string
  // Sprint W6-8 — 4-6 bullet summary box (KeyTakeaways component).
  keyTakeaways?: string[]
  sections: KnowledgeSection[]
  // Sprint W6-8 — "Tailor's recommendation" callout (ExpertNote component).
  // Attributed to the brand's tailoring team, never a fabricated named
  // individual — see seo.ts's buildKnowledgePersonSchema comment for why.
  expertNote?: string
  // Sprint W6-8 — dedicated "Perbandingan" comparison table, rendered by
  // the ComparisonTable component (distinct styling from a plain table
  // block inside `sections`).
  comparisonTable?: { caption: string; headers: string[]; rows: string[][] }
  // Sprint W6-10 — AI citation optimization: a decision framework (bullet
  // criteria a reader weighs) and a direct "when to choose this" verdict.
  // Reuses KeyTakeaways/QuickAnswer's visual components with heading
  // overrides rather than new components — same content shape, different
  // label. Applied to the W6-10 FAQ/Bogor pages; not retrofitted onto
  // the 58 W6-1..8 articles (that would be a rewrite, not an addition).
  decisionFramework?: string[]
  whenToChoose?: string
  faq: KnowledgeFaqItem[]
  relatedArticles: KnowledgeRef[]
  // Styling -> Fabric linking rule. Optional — only styling articles set
  // this; fabric/measurement articles have no natural "recommended fabric".
  relatedFabrics?: KnowledgeRef[]
  // Category-level links that don't resolve to a specific article yet —
  // e.g. every fabric article points at the `care` hub (Fabric -> Care)
  // even though no /knowledge/care articles exist this sprint.
  relatedCategories?: KnowledgeCategorySlug[]
  // National SEO (P0-3 / cannibalization fixes) — per-article override for
  // the commercial "money page" link in KnowledgeCTAGroup. Takes precedence
  // over the category-level cta.ts `commercial` config, for the few
  // articles whose commercial owner differs from their cluster default
  // (e.g. /knowledge/bandung/umrah-thobe -> /tailor-baju-umroh-bandung).
  commercialCta?: { label: string; href: string }
  // Sprint W6-7 — Related Content Engine tag dimensions.
  tags?: KnowledgeTags
  // Sprint W6-10 — Content Refresh Engine metadata. Optional; freshness.ts
  // falls back to CONTENT_PUBLISHED_DATE (src/lib/content/seo.ts) for
  // articles that don't set these, so the freshness system works
  // uniformly across all articles even though only W6-10's new pages set
  // them explicitly.
  publishedDate?: string
  lastReviewed?: string
  reviewIntervalDays?: number
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
