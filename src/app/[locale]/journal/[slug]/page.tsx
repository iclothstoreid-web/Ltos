import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import { fetchPublishedJournalArticle } from '@/lib/content/journalArticles'
import { websiteMediaUrl } from '@/lib/content/mediaUrl'
import { ArticleBody } from '@/lib/content/renderArticleBody'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { withLocaleAlternates } from '@/i18n/alternates'
import { articleSchema, breadcrumbSchema, organizationSchema } from '@/lib/seo/schema'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { WalnutGrainOverlay } from '@/components/marketing/shell/WalnutGrainOverlay'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'

interface PageProps {
  params: { locale: string; slug: string }
}

// Server-rendered per request. The DB is the source of truth for which
// slugs exist and their published state, and the shared [locale] layout
// reads request context — trying to statically cache per-slug here
// (generateStaticParams + ISR) fights both, so this route is explicitly
// dynamic. Two small RPC round-trips per view; `notFound()` for
// drafts/unknown slugs.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createPublicClient()
  const article = await fetchPublishedJournalArticle(supabase, params.slug).catch(() => null)
  if (!article) return { title: 'Artikel Tidak Ditemukan | Local Tailor' }

  const path = `/journal/${article.slug}`
  const description = article.meta_description || article.excerpt
  const ogPath = article.og_path || article.cover_path
  const ogUrl = websiteMediaUrl(ogPath, { width: 1200, height: 630, quality: 78, resize: 'cover' })

  return withLocaleAlternates(
    {
      title: `${article.seo_title || article.title} | Local Tailor`,
      description,
      alternates: { canonical: article.canonical_url || `${FABRIC_SITE_ORIGIN}${path}` },
      robots: { index: true, follow: true },
      openGraph: {
        title: article.seo_title || article.title,
        description,
        url: `${FABRIC_SITE_ORIGIN}${path}`,
        type: 'article',
        siteName: 'Local Tailor',
        ...(ogUrl ? { images: [{ url: ogUrl, width: 1200, height: 630, alt: article.title }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: article.seo_title || article.title,
        description,
        ...(ogUrl ? { images: [ogUrl] } : {}),
      },
    },
    FABRIC_SITE_ORIGIN,
    path
  )
}

export default async function JournalArticlePage({ params }: PageProps) {
  const supabase = createPublicClient()
  const article = await fetchPublishedJournalArticle(supabase, params.slug).catch(() => null)
  if (!article) notFound()

  const path = `/journal/${article.slug}`
  const url = `${FABRIC_SITE_ORIGIN}${path}`
  const heroUrl = websiteMediaUrl(article.cover_path, { width: 1280, height: 720, quality: 74, resize: 'cover' })
  const breadcrumb = [
    { name: 'Home', path: '/' },
    { name: 'Journal', path: '/journal' },
    { name: article.title, path },
  ]

  return (
    <main className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      <JsonLd
        data={[
          articleSchema({
            headline: article.title,
            description: article.meta_description || article.excerpt,
            url,
            datePublished: article.published_at || article.updated_at,
            dateModified: article.updated_at,
            authorName: article.author,
            image: websiteMediaUrl(article.cover_path, { width: 1200, quality: 78 }) ?? undefined,
          }),
          breadcrumbSchema(breadcrumb),
          organizationSchema(),
        ]}
      />

      <article className="mx-auto max-w-2xl">
        <Breadcrumbs items={breadcrumb} />

        <p className="mt-6 font-luxury-sans text-[10px] uppercase tracking-[0.2em] text-luxury-gold">{article.category}</p>
        <h1 className="mt-3 font-fraunces text-3xl leading-[1.15] text-luxury-ivory sm:text-4xl">{article.title}</h1>
        <p className="mt-4 font-luxury-sans text-base text-luxury-taupe">{article.excerpt}</p>
        <p className="mt-3 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe/70">
          {article.author}
          {article.published_at ? ` · ${new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
        </p>

        {heroUrl && (
          <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-sm bg-luxury-charcoal/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroUrl} alt={article.cover_alt || article.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="mt-10">
          <ArticleBody body={article.body} />
        </div>

        {article.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-luxury-gold/15 pt-6">
            {article.tags.map((t) => (
              <span key={t} className="rounded-full border border-luxury-gold/20 px-3 py-1 font-luxury-sans text-[11px] text-luxury-taupe">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col items-start gap-4 border-t border-luxury-gold/15 pt-8 sm:flex-row">
          <MagneticButton href="/design-studio" variant="primary">Mulai Rancang Thobe</MagneticButton>
          <MagneticButton href="/journal" variant="ghost">Semua Tulisan</MagneticButton>
        </div>
      </article>
      <WalnutGrainOverlay />
    </main>
  )
}
