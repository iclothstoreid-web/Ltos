import type { Metadata } from 'next'
import { EstimatorHero } from '@/components/body-estimator/EstimatorHero'
import { BodySilhouettePanel } from '@/components/body-estimator/BodySilhouettePanel'
import { EstimatorProgress } from '@/components/body-estimator/EstimatorProgress'
import { BodyEstimatorForm } from '@/components/body-estimator/BodyEstimatorForm'
import { PremiumCTASection } from '@/components/body-estimator/PremiumCTASection'
import { bodyEstimatorMetadata, buildLocalBusinessSchema } from '@/lib/marketing/seo'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { withLocaleAlternates } from '@/i18n/alternates'
import { buildOrganizationSchema } from '@/lib/content/seo'
import { ARTICLE_NAV } from '@/lib/content/articles'
import { RelatedArticles } from '@/components/content/RelatedArticles'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'

export async function generateMetadata(): Promise<Metadata> {
  return withLocaleAlternates(bodyEstimatorMetadata, FABRIC_SITE_ORIGIN, '/free-body-profile-estimator')
}

const BREADCRUMB_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Free Body Profile Estimator', path: '/free-body-profile-estimator' },
]

// Sprint W0.1 — W0 Body Profile Estimator (marketing/acquisition layer).
// Deliberately standalone: no estimation engine, no database, no AI, no
// LTOS W4 involvement. Estimates produced here are never production
// measurements — LTOS W4's fitter-verified Digital Body Profile remains the
// single source of truth for production (W0 = Estimasi, W4 = Profil
// Terverifikasi). Landing page + form only, per brief.
export default function FreeBodyProfileEstimatorPage() {
  const organizationSchema = buildOrganizationSchema()
  const localBusinessSchema = buildLocalBusinessSchema()
  const articleSlugs = ARTICLE_NAV.map((entry) => entry.slug)

  return (
    <div className="min-h-screen bg-luxury-navy-deep pb-20">
      <JsonLd data={[organizationSchema, localBusinessSchema, breadcrumbSchema(BREADCRUMB_ITEMS)]} />

      <main>
        <div className="mx-auto max-w-6xl px-6 pt-8 md:px-10">
          <Breadcrumbs items={BREADCRUMB_ITEMS} />
        </div>
        <EstimatorHero />

        <section aria-label="Body profile estimator" className="mx-auto mt-14 max-w-6xl px-6 md:px-10">
          <div className="grid gap-8 lg:grid-cols-[11fr_9fr] lg:items-stretch">
            <BodySilhouettePanel />

            <div>
              <EstimatorProgress currentStep={1} totalSteps={3} />
              <BodyEstimatorForm />
            </div>
          </div>
        </section>

        <div className="mt-20">
          <PremiumCTASection />
        </div>

        {/* Sprint W0.5 — content cluster cross-link, so the estimator
            (highest-intent W0 page) also feeds SEO traffic toward the new
            guide articles and back. */}
        <div className="mx-auto mt-16 max-w-6xl px-6 md:px-10">
          <RelatedArticles slugs={articleSlugs} />
        </div>
      </main>
    </div>
  )
}
