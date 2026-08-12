import type { Metadata } from 'next'
import { buildLocalBusinessSchema } from '@/lib/marketing/seo'
import {
  buildArticleBreadcrumbSchema,
  buildArticleFaqSchema,
  buildArticleMetadata,
  buildArticleSchema,
  buildOrganizationSchema,
} from '@/lib/content/seo'
import { cekUkuranThobeContent } from '@/lib/content/articles'
import { ArticleBreadcrumbNav } from '@/components/content/ArticleBreadcrumbNav'
import { ArticleHero } from '@/components/content/ArticleHero'
import { ArticleSectionBlock } from '@/components/content/ArticleSectionBlock'
import { ArticleFaqSection } from '@/components/content/ArticleFaqSection'
import { RelatedArticles } from '@/components/content/RelatedArticles'
import { ArticleConversionCTAs } from '@/components/content/ArticleConversionCTAs'

const content = cekUkuranThobeContent

export const metadata: Metadata = buildArticleMetadata({
  title: content.title,
  description: content.metaDescription,
  slug: content.slug,
})

export const revalidate = 86400

// Sprint W0.5 — SEO Content Cluster entry page. Pure static content, no
// estimation logic, no booking-flow changes — every CTA on this page
// forwards to the existing estimator/WhatsApp flows, never re-implements
// them.
export default function CekUkuranThobePage() {
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
          <ArticleSectionBlock key={section.heading} headingId={`section-${index}`} heading={section.heading} paragraphs={section.paragraphs} />
        ))}

        <ArticleFaqSection items={content.faq} />
        <RelatedArticles slugs={content.relatedSlugs} />
        <ArticleConversionCTAs articleTitle={content.title} />
      </article>
    </div>
  )
}
