import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { KNOWLEDGE_CATEGORIES, getCategoryBySlug } from '@/lib/knowledge/categories'
import { getCityBySlug } from '@/lib/seo/cityConfig'
import { getArticlesByCategory } from '@/lib/knowledge/articles'
import { getRelatedCategories } from '@/lib/knowledge/relatedArticles'
import { buildKnowledgeBreadcrumb } from '@/lib/knowledge/breadcrumbs'
import {
  buildKnowledgeBreadcrumbSchema,
  buildKnowledgeCategoryMetadata,
  buildKnowledgeCollectionPageSchema,
  buildKnowledgeFaqSchema,
  buildKnowledgeItemListSchema,
} from '@/lib/knowledge/seo'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { withLocaleAlternates } from '@/i18n/alternates'
import { buildOrganizationSchema } from '@/lib/content/seo'
import { buildLocalBusinessSchema } from '@/lib/marketing/seo'
import { Breadcrumbs } from '@/components/knowledge/Breadcrumbs'
import { KnowledgeHero } from '@/components/knowledge/KnowledgeHero'
import { KnowledgeCategoryGrid } from '@/components/knowledge/KnowledgeCategoryGrid'
import { RelatedArticles } from '@/components/knowledge/RelatedArticles'
import { FAQSection } from '@/components/knowledge/FAQSection'
import { KnowledgeCTAGroup } from '@/components/knowledge/KnowledgeCTAGroup'

interface PageProps {
  params: { category: string }
}

// Closed taxonomy (7 categories, src/lib/knowledge/categories.ts) — every
// hub is pre-rendered regardless of whether it has articles yet, same
// reasoning as /fabric/[category]'s own generateStaticParams.
export function generateStaticParams() {
  return KNOWLEDGE_CATEGORIES.map((category) => ({ category: category.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.category)
  if (!category) return { title: 'Category Not Found | Local Tailor' }
  return withLocaleAlternates(buildKnowledgeCategoryMetadata(category), FABRIC_SITE_ORIGIN, `/knowledge/${params.category}`)
}

export const revalidate = 86400

// Sprint W6R.2 §8 — Knowledge -> Location internal linking, kept
// deliberately small: only the categories where a city page genuinely
// serves the same intent get 2-3 real slugs (never all 9-10 cities, per
// this sprint's own "don't jam a 20-city list into every article" rule),
// and only city slugs that exist in CITY_CONFIGS are ever listed.
const RELATED_LOCATION_SLUGS: Partial<Record<string, string[]>> = {
  wedding: ['jakarta', 'bekasi', 'bandung'],
  umrah: ['bandung'],
  tailoring: ['bandung'],
  bandung: ['bandung'],
}

export default function KnowledgeCategoryPage({ params }: PageProps) {
  const category = getCategoryBySlug(params.category)
  if (!category) notFound()

  const articles = getArticlesByCategory(category.slug)
  const relatedCategories = getRelatedCategories(category.relatedCategories)
  const relatedLocations = (RELATED_LOCATION_SLUGS[category.slug] ?? [])
    .map((slug) => getCityBySlug(slug))
    .filter((city): city is NonNullable<typeof city> => !!city)

  const breadcrumbItems = buildKnowledgeBreadcrumb({ category })
  const breadcrumbSchema = buildKnowledgeBreadcrumbSchema(breadcrumbItems)
  const faqSchema = buildKnowledgeFaqSchema(category.faq)
  const collectionPageSchema = buildKnowledgeCollectionPageSchema({
    name: category.title,
    description: category.metaDescription,
    url: `${FABRIC_SITE_ORIGIN}/knowledge/${category.slug}`,
  })
  const itemListSchema = buildKnowledgeItemListSchema(articles, category.title)
  const organizationSchema = buildOrganizationSchema()
  const localBusinessSchema = buildLocalBusinessSchema()

  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-16 md:py-20 lg:px-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        // eslint-disable-next-line react/no-danger
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }} />
      {itemListSchema && (
        // eslint-disable-next-line react/no-danger
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />

      <article className="mx-auto max-w-6xl">
        <Breadcrumbs items={breadcrumbItems} />

        <KnowledgeHero variant="hub" eyebrow={category.eyebrow} title={category.title} dek={category.intro[0]} />

        {category.intro.length > 1 && (
          <section aria-labelledby="category-intro-heading" className="mx-auto mt-12 max-w-3xl">
            <h2 id="category-intro-heading" className="sr-only">
              Tentang {category.label}
            </h2>
            <div className="space-y-4">
              {/* intro[0] is already shown as the hero dek above — only the
                  remaining paragraphs render here, so the opening sentence
                  isn't printed twice on the page. */}
              {category.intro.slice(1).map((paragraph, index) => (
                <p key={index} className="font-luxury-sans text-base leading-relaxed text-luxury-taupe">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        )}

        {articles.length > 0 ? (
          <RelatedArticles articles={articles} heading="Panduan di Kategori Ini" headingId="category-articles-heading" />
        ) : (
          <section aria-labelledby="category-articles-heading" className="mx-auto mt-14 max-w-3xl text-center">
            <h2 id="category-articles-heading" className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
              Panduan Segera Hadir
            </h2>
            <p className="mt-3 font-luxury-sans text-sm text-luxury-taupe">
              Konten lengkap untuk kategori ini sedang disiapkan. Jelajahi kategori terkait di bawah sebagai referensi awal.
            </p>
          </section>
        )}

        <FAQSection items={category.faq} headingId="category-faq-heading" />

        {relatedCategories.length > 0 && (
          <section aria-labelledby="related-categories-heading" className="mx-auto mt-14 max-w-4xl">
            <h2 id="related-categories-heading" className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
              Kategori Terkait
            </h2>
            <div className="mt-6">
              <KnowledgeCategoryGrid categories={relatedCategories} headingId="related-categories-heading" />
            </div>
          </section>
        )}

        {relatedLocations.length > 0 && (
          <section aria-labelledby="related-locations-heading" className="mx-auto mt-14 max-w-3xl text-center">
            <h2 id="related-locations-heading" className="font-fraunces text-xl text-luxury-ivory md:text-2xl">
              Layanan untuk Pelanggan di Kota Anda
            </h2>
            <p className="mt-3 font-luxury-sans text-sm text-luxury-taupe">
              Untuk pelanggan di luar Bandung, lihat panduan layanan custom di kota Anda:
            </p>
            <ul className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {relatedLocations.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/locations/${city.slug}`}
                    className="rounded-full border border-luxury-gold/[0.18] px-5 py-2 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe transition hover:border-luxury-gold/60 hover:text-luxury-gold"
                  >
                    Custom Thobe {city.city}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <KnowledgeCTAGroup category={category.slug} />
      </article>
    </div>
  )
}
