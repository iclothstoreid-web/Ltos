import type { Metadata } from 'next'
import { buildLocalBusinessSchema } from '@/lib/marketing/seo'
import {
  buildArticleBreadcrumbSchema,
  buildArticleFaqSchema,
  buildArticleMetadata,
  buildArticleSchema,
  buildHowToSchema,
  buildOrganizationSchema,
} from '@/lib/content/seo'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { withLocaleAlternates } from '@/i18n/alternates'
import { caraMengukurThobeContent } from '@/lib/content/articles'
import { ArticleBreadcrumbNav } from '@/components/content/ArticleBreadcrumbNav'
import { ArticleHero } from '@/components/content/ArticleHero'
import { ArticleSectionBlock } from '@/components/content/ArticleSectionBlock'
import { HowToStepsList } from '@/components/content/HowToStepsList'
import { ArticleFaqSection } from '@/components/content/ArticleFaqSection'
import { RelatedArticles } from '@/components/content/RelatedArticles'
import { ArticleConversionCTAs } from '@/components/content/ArticleConversionCTAs'

const content = caraMengukurThobeContent

export async function generateMetadata(): Promise<Metadata> {
  return withLocaleAlternates(
    buildArticleMetadata({ title: content.title, description: content.metaDescription, slug: content.slug }),
    FABRIC_SITE_ORIGIN,
    `/${content.slug}`
  )
}

export const revalidate = 86400

// The only article with HowTo schema — 6 real sequential steps, matches
// content.howToSteps 1:1 with the visible <HowToStepsList>.
export default function CaraMengukurThobePage() {
  const articleSchema = buildArticleSchema({ title: content.title, description: content.metaDescription, slug: content.slug })
  const breadcrumbSchema = buildArticleBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: content.title, path: `/${content.slug}` },
  ])
  const faqSchema = buildArticleFaqSchema(content.faq)
  const organizationSchema = buildOrganizationSchema()
  const localBusinessSchema = buildLocalBusinessSchema()
  const howToSchema = content.howToSteps
    ? buildHowToSchema({ name: content.title, description: content.metaDescription, steps: content.howToSteps })
    : null

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
      {howToSchema && (
        // eslint-disable-next-line react/no-danger
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      )}

      <article>
        <ArticleBreadcrumbNav currentLabel={content.title} />
        <ArticleHero eyebrow={content.eyebrow} title={content.title} dek={content.dek} />

        <ArticleSectionBlock headingId="section-0" heading={content.sections[0].heading} paragraphs={content.sections[0].paragraphs} />

        {content.howToSteps && (
          <section aria-labelledby="howto-steps-heading" className="mx-auto mt-12 max-w-3xl">
            <h2 id="howto-steps-heading" className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
              Langkah-Langkah Mengukur
            </h2>
            <HowToStepsList steps={content.howToSteps} />
          </section>
        )}

        <ArticleSectionBlock headingId="section-1" heading={content.sections[1].heading} paragraphs={content.sections[1].paragraphs} />
        <ArticleSectionBlock headingId="section-2" heading={content.sections[2].heading} paragraphs={content.sections[2].paragraphs} />
        <ArticleSectionBlock headingId="section-3" heading={content.sections[3].heading} paragraphs={content.sections[3].paragraphs} />

        <ArticleFaqSection items={content.faq} />
        <RelatedArticles slugs={content.relatedSlugs} />
        <ArticleConversionCTAs articleTitle={content.title} />
      </article>
    </div>
  )
}
