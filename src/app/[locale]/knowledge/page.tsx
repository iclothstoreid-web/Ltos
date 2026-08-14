import type { Metadata } from 'next'
import { KNOWLEDGE_CATEGORIES } from '@/lib/knowledge/categories'
import { getKnowledgeArticle } from '@/lib/knowledge/articles'
import { buildKnowledgeBreadcrumb } from '@/lib/knowledge/breadcrumbs'
import { buildKnowledgeBreadcrumbSchema, buildKnowledgeCollectionPageSchema, buildKnowledgeLandingMetadata } from '@/lib/knowledge/seo'
import { buildOrganizationSchema } from '@/lib/content/seo'
import { buildLocalBusinessSchema } from '@/lib/marketing/seo'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { withLocaleAlternates } from '@/i18n/alternates'
import { Breadcrumbs } from '@/components/knowledge/Breadcrumbs'
import { KnowledgeHero } from '@/components/knowledge/KnowledgeHero'
import { KnowledgeCategoryGrid } from '@/components/knowledge/KnowledgeCategoryGrid'
import { RelatedArticles } from '@/components/knowledge/RelatedArticles'
import { KnowledgeCTAGroup } from '@/components/knowledge/KnowledgeCTAGroup'
import { RelatedServicesLinks } from '@/components/services/RelatedServicesLinks'

export async function generateMetadata(): Promise<Metadata> {
  return withLocaleAlternates(buildKnowledgeLandingMetadata(), FABRIC_SITE_ORIGIN, '/knowledge')
}

export const revalidate = 86400

// Sprint W6-1 — Knowledge Foundation landing page. Featured = one entry
// point per live category (the article that best orients a first-time
// reader); Popular = a wider spread across all 3 live categories, disjoint
// from Featured so the two rails never repeat the same card.
const FEATURED_REFS = [
  { category: 'fabrics' as const, slug: 'premium-cotton' },
  { category: 'measurements' as const, slug: 'how-to-measure-body' },
  { category: 'styling' as const, slug: 'formal-thobe' },
]

const POPULAR_REFS = [
  { category: 'fabrics' as const, slug: 'linen' },
  { category: 'fabrics' as const, slug: 'egyptian-cotton' },
  { category: 'measurements' as const, slug: 'chest' },
  { category: 'measurements' as const, slug: 'thobe-size-guide' },
  { category: 'styling' as const, slug: 'navy-thobe' },
  { category: 'styling' as const, slug: 'wedding-thobe-style' },
]

export default function KnowledgePage() {
  const breadcrumbItems = buildKnowledgeBreadcrumb({})
  const breadcrumbSchema = buildKnowledgeBreadcrumbSchema(breadcrumbItems)
  const collectionPageSchema = buildKnowledgeCollectionPageSchema({
    name: 'Local Tailor Knowledge',
    description: 'Panduan bahan, pengukuran, gaya, pernikahan, umrah, tailoring, dan perawatan thobe bespoke.',
    url: `${FABRIC_SITE_ORIGIN}/knowledge`,
  })
  const organizationSchema = buildOrganizationSchema()
  const localBusinessSchema = buildLocalBusinessSchema()

  const featured = FEATURED_REFS.map((ref) => getKnowledgeArticle(ref.category, ref.slug)).filter((a): a is NonNullable<typeof a> => !!a)
  const popular = POPULAR_REFS.map((ref) => getKnowledgeArticle(ref.category, ref.slug)).filter((a): a is NonNullable<typeof a> => !!a)

  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-16 md:py-20 lg:px-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />

      <div className="mx-auto max-w-6xl">
        <Breadcrumbs items={breadcrumbItems} />

        <KnowledgeHero
          variant="landing"
          eyebrow="Local Tailor Knowledge"
          title="Panduan Bahan, Pengukuran, dan Gaya Thobe"
          dek="Referensi lengkap sebelum memesan thobe bespoke Anda — dari memilih bahan yang tepat, mengukur badan sendiri, hingga menyusun gaya untuk setiap acara."
        />

        <section aria-labelledby="knowledge-categories-heading" className="mt-16">
          <h2 id="knowledge-categories-heading" className="text-center font-fraunces text-2xl text-luxury-ivory md:text-3xl">
            Jelajahi Berdasarkan Kategori
          </h2>
          <div className="mt-8">
            <KnowledgeCategoryGrid categories={KNOWLEDGE_CATEGORIES} headingId="knowledge-categories-heading" />
          </div>
        </section>

        <RelatedArticles articles={featured} heading="Panduan Unggulan" headingId="featured-guides-heading" />
        <RelatedArticles articles={popular} heading="Panduan Populer" headingId="popular-guides-heading" />

        <KnowledgeCTAGroup
          heading="Siap Memulai Thobe Bespoke Anda?"
          body="Mulai dari konsultasi gratis, jelajahi koleksi bahan kami, atau cek Digital Body Profile Anda sebelum memesan."
        />

        <RelatedServicesLinks />
      </div>
    </div>
  )
}
