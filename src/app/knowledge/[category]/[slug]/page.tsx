import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ALL_KNOWLEDGE_ARTICLES, getKnowledgeArticle } from '@/lib/knowledge/articles'
import { getRelatedArticles, getRelatedCategories, getRelatedFabrics } from '@/lib/knowledge/relatedArticles'
import { buildKnowledgeBreadcrumb } from '@/lib/knowledge/breadcrumbs'
import {
  buildKnowledgeArticleMetadata,
  buildKnowledgeArticleSchema,
  buildKnowledgeBreadcrumbSchema,
  buildKnowledgeFaqSchema,
} from '@/lib/knowledge/seo'
import { buildOrganizationSchema } from '@/lib/content/seo'
import { buildLocalBusinessSchema } from '@/lib/marketing/seo'
import type { KnowledgeContentBlock, KnowledgeSection } from '@/lib/knowledge/types'
import { Breadcrumbs } from '@/components/knowledge/Breadcrumbs'
import { KnowledgeHero } from '@/components/knowledge/KnowledgeHero'
import { RelatedArticles } from '@/components/knowledge/RelatedArticles'
import { RelatedFabrics } from '@/components/knowledge/RelatedFabrics'
import { KnowledgeCategoryGrid } from '@/components/knowledge/KnowledgeCategoryGrid'
import { FAQSection } from '@/components/knowledge/FAQSection'
import { KnowledgeCTAGroup } from '@/components/knowledge/KnowledgeCTAGroup'

interface PageProps {
  params: { category: string; slug: string }
}

// Every (category, slug) pair across the 26 W6-2/3/4 articles is
// pre-rendered at build time — one dynamic route driving all of them,
// rather than 26 bespoke page files (the "reusable content architecture"
// the sprint brief asks for).
export function generateStaticParams() {
  return ALL_KNOWLEDGE_ARTICLES.map((article) => ({ category: article.category, slug: article.slug }))
}

export const dynamicParams = false

export function generateMetadata({ params }: PageProps): Metadata {
  const article = getKnowledgeArticle(params.category, params.slug)
  if (!article) return { title: 'Article Not Found | Local Tailor' }
  return buildKnowledgeArticleMetadata(article)
}

export const revalidate = 86400

function ContentBlock({ block }: { block: KnowledgeContentBlock }) {
  switch (block.kind) {
    case 'paragraphs':
      return (
        <div className="space-y-4">
          {block.items.map((paragraph, index) => (
            <p key={index} className="font-luxury-sans text-base leading-relaxed text-luxury-taupe">
              {paragraph}
            </p>
          ))}
        </div>
      )
    case 'list':
      return (
        <ul className="space-y-3">
          {block.items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-[10px] h-px w-4 flex-shrink-0 bg-luxury-gold" />
              <span className="font-luxury-sans text-base leading-relaxed text-luxury-taupe">{item}</span>
            </li>
          ))}
        </ul>
      )
    case 'steps':
      return (
        <ol className="space-y-5">
          {block.items.map((step, index) => (
            <li key={step.name} className="flex gap-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-luxury-gold/40 font-fraunces text-sm text-luxury-gold">
                {index + 1}
              </span>
              <div>
                <p className="font-luxury-sans text-sm font-medium uppercase tracking-[0.06em] text-luxury-ivory">{step.name}</p>
                <p className="mt-1 font-luxury-sans text-sm leading-relaxed text-luxury-taupe">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      )
    case 'table':
      return (
        <div className="overflow-x-auto rounded-2xl border border-luxury-gold/[0.14]">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b border-luxury-gold/20">
                {block.headers.map((header) => (
                  <th key={header} scope="col" className="px-4 py-3 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-luxury-gold/[0.08] last:border-b-0">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={
                        cellIndex === 0
                          ? 'px-4 py-3 font-fraunces text-base text-luxury-ivory'
                          : 'px-4 py-3 font-luxury-sans text-sm text-luxury-taupe'
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

function ArticleSectionBlock({ section, headingId }: { section: KnowledgeSection; headingId: string }) {
  return (
    <section aria-labelledby={headingId} className="mx-auto mt-12 max-w-3xl">
      <h2 id={headingId} className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
        {section.heading}
      </h2>
      <div className="mt-4">
        <ContentBlock block={section.block} />
      </div>
    </section>
  )
}

export default function KnowledgeArticlePage({ params }: PageProps) {
  const article = getKnowledgeArticle(params.category, params.slug)
  if (!article) notFound()

  const relatedArticles = getRelatedArticles(article)
  const relatedFabrics = getRelatedFabrics(article)
  const relatedCategories = getRelatedCategories(article.relatedCategories)

  const breadcrumbItems = buildKnowledgeBreadcrumb({ article })
  const articleSchema = buildKnowledgeArticleSchema(article)
  const breadcrumbSchema = buildKnowledgeBreadcrumbSchema(breadcrumbItems)
  const faqSchema = buildKnowledgeFaqSchema(article.faq)
  const organizationSchema = buildOrganizationSchema()
  const localBusinessSchema = buildLocalBusinessSchema()

  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-16 md:py-20 lg:px-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        // eslint-disable-next-line react/no-danger
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />

      <article>
        <Breadcrumbs items={breadcrumbItems} />
        <KnowledgeHero variant="article" eyebrow={article.eyebrow} title={article.title} dek={article.dek} />

        <section aria-labelledby="article-definition-heading" className="mx-auto mt-12 max-w-3xl">
          <h2 id="article-definition-heading" className="sr-only">
            Definisi
          </h2>
          <p className="border-l-2 border-luxury-gold/40 pl-5 font-fraunces text-lg italic leading-snug text-luxury-ivory md:text-xl">
            {article.definition}
          </p>
        </section>

        {article.sections.map((section, index) => (
          <ArticleSectionBlock key={section.heading} section={section} headingId={`article-section-${index}`} />
        ))}

        <FAQSection items={article.faq} headingId="article-faq-heading" />
        <RelatedFabrics fabrics={relatedFabrics} headingId="related-fabrics-heading" />
        <RelatedArticles articles={relatedArticles} headingId="related-articles-heading" />

        {relatedCategories.length > 0 && (
          <section aria-labelledby="related-categories-heading" className="mx-auto mt-14 max-w-3xl">
            <h2 id="related-categories-heading" className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
              Jelajahi Kategori Lain
            </h2>
            <div className="mt-4">
              <KnowledgeCategoryGrid categories={relatedCategories} headingId="related-categories-heading" />
            </div>
          </section>
        )}

        <KnowledgeCTAGroup
          heading="Siap Melanjutkan ke Langkah Berikutnya?"
          body="Konsultasikan kebutuhan Anda, jelajahi koleksi bahan, atau cek Digital Body Profile Anda sebelum memesan thobe bespoke."
        />
      </article>
    </div>
  )
}
