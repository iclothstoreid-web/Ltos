import type { Metadata } from 'next'
import { buildLocalBusinessSchema } from '@/lib/marketing/seo'
import {
  buildArticleBreadcrumbSchema,
  buildArticleFaqSchema,
  buildArticleMetadata,
  buildArticleSchema,
  buildOrganizationSchema,
} from '@/lib/content/seo'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { withLocaleAlternates } from '@/i18n/alternates'
import { sizeChartThobeContent } from '@/lib/content/articles'
import { ArticleBreadcrumbNav } from '@/components/content/ArticleBreadcrumbNav'
import { ArticleHero } from '@/components/content/ArticleHero'
import { ArticleSectionBlock } from '@/components/content/ArticleSectionBlock'
import { SizeChartTable } from '@/components/content/SizeChartTable'
import { ArticleFaqSection } from '@/components/content/ArticleFaqSection'
import { RelatedArticles } from '@/components/content/RelatedArticles'
import { ArticleConversionCTAs } from '@/components/content/ArticleConversionCTAs'
import { FabricCrossLink } from '@/components/content/FabricCrossLink'

const content = sizeChartThobeContent
const TABLE_HEADING = 'Tabel Size Chart Thobe Pria'

export async function generateMetadata(): Promise<Metadata> {
  return withLocaleAlternates(
    buildArticleMetadata({ title: content.title, description: content.metaDescription, slug: content.slug }),
    FABRIC_SITE_ORIGIN,
    `/${content.slug}`
  )
}

export const revalidate = 86400

export default function SizeChartThobePage() {
  const articleSchema = buildArticleSchema({ title: content.title, description: content.metaDescription, slug: content.slug })
  const breadcrumbSchema = buildArticleBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: content.title, path: `/${content.slug}` },
  ])
  const faqSchema = buildArticleFaqSchema(content.faq)
  const organizationSchema = buildOrganizationSchema()
  const localBusinessSchema = buildLocalBusinessSchema()

  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-16 md:py-20 lg:px-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />

      <article>
        <ArticleBreadcrumbNav currentLabel={content.title} />
        <ArticleHero eyebrow={content.eyebrow} title={content.title} dek={content.dek} />

        {content.sections.map((section, index) => (
          <div key={section.heading}>
            <ArticleSectionBlock headingId={`section-${index}`} heading={section.heading} paragraphs={section.paragraphs} />
            {section.heading === TABLE_HEADING && content.sizeChart && <SizeChartTable rows={content.sizeChart} />}
          </div>
        ))}

        <FabricCrossLink />
        <ArticleFaqSection items={content.faq} />
        <RelatedArticles slugs={content.relatedSlugs} />
        <ArticleConversionCTAs articleTitle={content.title} />
      </article>
    </div>
  )
}
