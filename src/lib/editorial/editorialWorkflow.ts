// Sprint W6-9 — Content workflow documentation as typed data, not prose in
// a wiki page. Mirrors the actual process this project's W6 sprints have
// followed in practice (research a real topic -> brief against the
// KnowledgeArticle schema -> draft -> review for factual/honesty issues ->
// SEO metadata -> schema wiring -> publish -> internal linking -> sitemap
// indexing -> periodic refresh), so it's a real reusable checklist rather
// than a plan doc that drifts out of sync with what's actually done.

export type EditorialStage = 'research' | 'brief' | 'draft' | 'review' | 'seo' | 'schema' | 'publish' | 'internalLinking' | 'indexing' | 'refresh'

export interface EditorialStageDefinition {
  stage: EditorialStage
  label: string
  description: string
  ownerRole: 'editorial' | 'engineering' | 'both'
}

export const EDITORIAL_WORKFLOW: EditorialStageDefinition[] = [
  {
    stage: 'research',
    label: 'Riset',
    description: 'Identifikasi gap topik dari COVERAGE_MATRIX (coverage.ts) dan KEYWORD_REPOSITORY (keywordMap.ts) — bukan menulis dari asumsi.',
    ownerRole: 'editorial',
  },
  {
    stage: 'brief',
    label: 'Brief',
    description: 'Tentukan slug, category, target keyword, query intent (queryIntent.ts), dan minimal internal-link target sebelum menulis draft.',
    ownerRole: 'editorial',
  },
  {
    stage: 'draft',
    label: 'Draft',
    description: 'Tulis mengikuti KnowledgeArticle schema penuh — definition, quickAnswer, sections, faq — dengan klaim yang bisa diverifikasi, bukan fabrikasi.',
    ownerRole: 'editorial',
  },
  {
    stage: 'review',
    label: 'Review',
    description: 'Periksa akurasi faktual, konsistensi dengan artikel lain di cluster yang sama, dan tidak ada klaim bisnis yang tidak bisa dipertanggungjawabkan.',
    ownerRole: 'both',
  },
  {
    stage: 'seo',
    label: 'SEO Metadata',
    description: 'metaDescription, title, canonical — dibangun otomatis dari buildKnowledgeArticleMetadata(), tidak perlu ditulis manual per halaman.',
    ownerRole: 'engineering',
  },
  {
    stage: 'schema',
    label: 'Structured Data',
    description: 'Article/FAQPage/HowTo/BreadcrumbList schema dibangun otomatis dari data artikel — pastikan faq dan sections terisi lengkap agar schema tidak kosong.',
    ownerRole: 'engineering',
  },
  {
    stage: 'publish',
    label: 'Publish',
    description: 'Tambahkan entry ke file cluster (mis. wedding.ts) dan daftarkan di articles/index.ts — generateStaticParams menangani sisanya.',
    ownerRole: 'engineering',
  },
  {
    stage: 'internalLinking',
    label: 'Internal Linking',
    description: 'Isi relatedArticles/relatedFabrics/relatedCategories/tags mengacu ke slug yang benar-benar ada — target minimal 8-12 link per artikel.',
    ownerRole: 'editorial',
  },
  {
    stage: 'indexing',
    label: 'Indexing',
    description: 'Verifikasi artikel baru otomatis muncul di sitemap-knowledge.xml (tidak perlu perubahan kode — ALL_KNOWLEDGE_ARTICLES sudah generik).',
    ownerRole: 'engineering',
  },
  {
    stage: 'refresh',
    label: 'Refresh',
    description: 'Tinjau ulang sesuai reviewIntervalDays (freshness.ts) — perbarui lastReviewed setelah verifikasi konten masih akurat.',
    ownerRole: 'editorial',
  },
]

export function getWorkflowStage(stage: EditorialStage): EditorialStageDefinition | undefined {
  return EDITORIAL_WORKFLOW.find((entry) => entry.stage === stage)
}

export function getNextStage(current: EditorialStage): EditorialStageDefinition | undefined {
  const index = EDITORIAL_WORKFLOW.findIndex((entry) => entry.stage === current)
  if (index === -1 || index === EDITORIAL_WORKFLOW.length - 1) return undefined
  return EDITORIAL_WORKFLOW[index + 1]
}
