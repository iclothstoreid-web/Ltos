import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Reveal } from '../shell/Reveal'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { MagneticButton } from '../shell/MagneticButton'
import { getKnowledgeArticle } from '@/lib/knowledge/articles'
import { getCategoryBySlug } from '@/lib/knowledge/categories'
import { KnowledgeCategoryGrid } from '@/components/knowledge/KnowledgeCategoryGrid'
import type { KnowledgeCategorySlug } from '@/lib/knowledge/types'

// Sprint W6R.1 — LTOS Integration Rule. This section previously showed 4
// static, unlinked placeholder cards (title + description only, no href)
// written before the Knowledge Engine existed — the copy even anticipated
// it (e.g. "Best Fabric for Umrah" almost exactly matches the real
// umrah/best-fabric article shipped in W6-5). Rewired to pull live from
// the real registry (getKnowledgeArticle/getCategoryBySlug) instead of a
// hand-duplicated copy.ts list, so this section can never drift out of
// sync with the actual Knowledge Engine content. Still a Server Component,
// zero client JS added — same as every consumer of these two functions.
const FEATURED_REFS: { category: KnowledgeCategorySlug; slug: string }[] = [
  { category: 'fabrics', slug: 'linen' },
  { category: 'fabrics', slug: 'japanese-cotton' },
  { category: 'measurements', slug: 'how-to-measure-body' },
  { category: 'styling', slug: 'navy-thobe' },
  { category: 'wedding', slug: 'akad-pria' },
  { category: 'umrah', slug: 'best-fabric' },
]

// Brief's own 6-category list, excluding 'care'/'questions'/'bandung' —
// those exist and are reachable via /knowledge itself, this quick-access
// grid deliberately mirrors only the categories the brief named.
const QUICK_ACCESS_CATEGORY_SLUGS: KnowledgeCategorySlug[] = ['fabrics', 'measurements', 'styling', 'wedding', 'umrah', 'tailoring']

// LTOS i18n — the surrounding UI chrome (eyebrow, heading, body, category
// labels, CTAs) now follows the active locale via `home.knowledge`. The
// article/category CONTENT itself (navLabel, dek, category.label, and each
// article's body) comes from the Knowledge Engine's static registry
// (src/lib/knowledge/articles/*.ts, categories.ts), which is
// Indonesian-only with no i18n architecture of its own — deliberately left
// untranslated rather than fabricating a translation for real editorial
// content; documented as a separate follow-up dependency.
export async function KnowledgePreview() {
  const t = await getTranslations('home.knowledge')
  const featured = FEATURED_REFS.map((ref) => getKnowledgeArticle(ref.category, ref.slug)).filter((article): article is NonNullable<typeof article> => !!article)
  const quickAccessCategories = QUICK_ACCESS_CATEGORY_SLUGS.map((slug) => getCategoryBySlug(slug)).filter(
    (category): category is NonNullable<typeof category> => !!category
  )

  return (
    <section
      id="knowledge"
      aria-labelledby="knowledge-heading"
      className="bg-luxury-navy-deep px-6 py-24 md:px-10 [content-visibility:auto] [contain-intrinsic-size:auto_1100px]"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{t('eyebrow')}</p>
          <h2 id="knowledge-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {t('heading')}
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{t('body')}</p>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((article, i) => {
            const category = getCategoryBySlug(article.category)
            return (
              <Reveal as="li" key={`${article.category}-${article.slug}`} delay={i * 0.06}>
                <Link
                  href={`/knowledge/${article.category}/${article.slug}`}
                  className="group block h-full rounded-sm border border-luxury-gold/[0.10] p-6 transition hover:border-luxury-gold/40"
                >
                  {category && <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">{category.label}</p>}
                  <h3 className="mt-2 font-fraunces text-lg text-luxury-ivory transition group-hover:text-luxury-gold">{article.navLabel}</h3>
                  <p className="mt-3 font-luxury-sans text-xs leading-relaxed text-luxury-taupe">{article.dek}</p>
                  <span className="mt-4 inline-flex items-center gap-2 font-luxury-sans text-[11px] uppercase tracking-[0.1em] text-luxury-gold">
                    {t('readGuideLabel')}
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </ul>

        <Reveal delay={0.2} className="mt-16">
          <h3 id="knowledge-categories-heading" className="text-center font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">
            {t('categoriesHeading')}
          </h3>
          <div className="mt-6">
            <KnowledgeCategoryGrid categories={quickAccessCategories} headingId="knowledge-categories-heading" />
          </div>
        </Reveal>

        <Reveal delay={0.3} className="mt-14 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
          <MagneticButton href="/knowledge" variant="primary">
            {t('viewAllCta')}
          </MagneticButton>
          {/* Brief's brief names /consultation, which doesn't exist in this
              app — the real consultation-booking route everywhere else on
              this site is /book-appointment, so this points there rather
              than inventing a new route. */}
          <MagneticButton href="/book-appointment" variant="ghost">
            {t('freeConsultationCta')}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
