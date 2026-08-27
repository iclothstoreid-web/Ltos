import { Fraunces, Jost } from 'next/font/google'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Nav } from './shell/Nav'
import { Footer } from './shell/Footer'
import { ScrollProgress } from './shell/ScrollProgress'
import { StickyMobileCta } from './shell/StickyMobileCta'
import { WalnutGrainOverlay } from './shell/WalnutGrainOverlay'
import { Hero } from './sections/Hero'
import { TrustBar } from './sections/TrustBar'
import { ConfiguratorPreview } from './sections/ConfiguratorPreview'
import { createPublicClient } from '@/lib/supabase/public'
import { fetchHomepageMediaMap } from '@/lib/content/homepageMedia'
import { websiteMediaUrl } from '@/lib/content/mediaUrl'
import type { SlotOverride } from './shell/SlotImage'
import { buildLocalBusinessSchema, buildWebSiteSchema } from '@/lib/marketing/seo'
import { organizationSchema } from '@/lib/seo/schema'
import { JsonLd } from '@/components/seo/JsonLd'
import { PageScrollTracker } from '@/components/analytics/PageScrollTracker'
import { FunnelStepOnMount } from '@/components/analytics/FunnelStepOnMount'

// Serif role reuses the Fraunces token already established elsewhere in
// this repo (Check-In/Production workspace rebuilds) rather than
// introducing a second serif — see PLAN_SPRINT_W1_HOMEPAGE_LUXURY_BLUEPRINT.md §11.
const fraunces = Fraunces({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-fraunces', display: 'swap' })
// New sans, deliberately distinct from the internal app's Inter — Jost's
// geometric/Futura-adjacent shapes read as fashion-editorial rather than
// product UI. See blueprint §11 for the ui-ux-pro-max pairing rationale.
const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-luxury-sans', display: 'swap' })

// P1 — sections below the "Hero / Trust / Configurator teaser" priority
// line are code-split via next/dynamic (ssr stays true, the default) so
// each becomes its own chunk instead of one monolithic homepage bundle.
// All 11 sections are STILL server-rendered on the initial response — this
// intentionally does not gate on client-side intersection, since that
// would pull their copy out of the first-response HTML and break the
// "crawlable by search/AI engines on first response" requirement this
// homepage has carried since Sprint W1 (see the removed comment this one
// replaces). Suspense boundaries around each additionally let React 18
// hydrate them independently rather than as one blocking unit.
const PrivateAppointment = dynamic(() => import('./sections/PrivateAppointment').then((m) => m.PrivateAppointment))
// Sprint Y §Y-2 — Digital Bespoke Tailoring homepage preview.
const DesignStudioPreview = dynamic(() => import('./sections/DesignStudioPreview').then((m) => m.DesignStudioPreview))
const BespokeProcessSection = dynamic(() => import('./sections/BespokeProcessSection').then((m) => m.BespokeProcessSection))
const ConsultationSection = dynamic(() => import('./sections/ConsultationSection').then((m) => m.ConsultationSection))
const MeasurementSection = dynamic(() => import('./sections/MeasurementSection').then((m) => m.MeasurementSection))
const PatternFormulationSection = dynamic(() => import('./sections/PatternFormulationSection').then((m) => m.PatternFormulationSection))
const ProductionSection = dynamic(() => import('./sections/ProductionSection').then((m) => m.ProductionSection))
const QualityControlSection = dynamic(() => import('./sections/QualityControlSection').then((m) => m.QualityControlSection))
const DeliverySection = dynamic(() => import('./sections/DeliverySection').then((m) => m.DeliverySection))
const CraftsmanshipSection = dynamic(() => import('./sections/CraftsmanshipSection').then((m) => m.CraftsmanshipSection))
const WorkshopSection = dynamic(() => import('./sections/WorkshopSection').then((m) => m.WorkshopSection))
const AuthoritySection = dynamic(() => import('./sections/AuthoritySection').then((m) => m.AuthoritySection))
const GallerySection = dynamic(() => import('./sections/GallerySection').then((m) => m.GallerySection))
const ReviewsSection = dynamic(() => import('./sections/ReviewsSection').then((m) => m.ReviewsSection))
const TrustBadgesSection = dynamic(() => import('./sections/TrustBadgesSection').then((m) => m.TrustBadgesSection))
const FabricHighlight = dynamic(() => import('./sections/FabricHighlight').then((m) => m.FabricHighlight))
const WhyLocalTailor = dynamic(() => import('./sections/WhyLocalTailor').then((m) => m.WhyLocalTailor))
const CraftsmanshipProcess = dynamic(() => import('./sections/CraftsmanshipProcess').then((m) => m.CraftsmanshipProcess))
const Gallery = dynamic(() => import('./sections/Gallery').then((m) => m.Gallery))
const CustomerStories = dynamic(() => import('./sections/CustomerStories').then((m) => m.CustomerStories))
const KnowledgePreview = dynamic(() => import('./sections/KnowledgePreview').then((m) => m.KnowledgePreview))
const Faq = dynamic(() => import('./sections/Faq').then((m) => m.Faq))
const FinalCta = dynamic(() => import('./sections/FinalCta').then((m) => m.FinalCta))

// Sprint DS-UX Scope B — Owner-managed homepage image slots
// (homepage_media_slots). Each section falls back to its built-in asset
// when the slot is unset, so this can never blank a section. Wrapped in a
// catch so a Content/DB hiccup never takes the homepage down.
async function resolveHomepageSlots(): Promise<Record<string, SlotOverride | null>> {
  try {
    const map = await fetchHomepageMediaMap(createPublicClient())
    const pick = (key: string, width: number, height: number): SlotOverride | null => {
      const slot = map[key]
      const url = slot?.path ? websiteMediaUrl(slot.path, { width, height, quality: 72, resize: 'cover' }) : null
      return url ? { url, alt: slot?.alt ?? '' } : null
    }
    return {
      appointment: pick('appointment', 900, 1125),
      consultation: pick('consultation', 900, 1125),
      craftsmanship: pick('craftsmanship', 1000, 1250),
    }
  } catch {
    return { appointment: null, consultation: null, craftsmanship: null }
  }
}

export async function HomePage() {
  const slots = await resolveHomepageSlots()
  const localBusinessSchema = buildLocalBusinessSchema()
  const webSiteSchema = buildWebSiteSchema()
  // Sprint W7-2 — Organization is a broader entity identity than the
  // existing LocalBusiness schema above; both can coexist on the same page
  // (LocalBusiness is itself a subtype of Organization in schema.org, and
  // sites commonly emit both). No `sameAs`/`logo` — no social profile URLs
  // or deployed logo asset exist yet (see src/lib/seo/entities.ts comment);
  // omitted rather than fabricated. No SearchAction on the WebSite schema
  // either — this site has no working site-wide search endpoint to point
  // one at yet.
  const orgSchema = organizationSchema()

  return (
    <div className={`${fraunces.variable} ${jost.variable} bg-luxury-navy-deep font-luxury-sans`}>
      <JsonLd data={[localBusinessSchema, webSiteSchema, orgSchema]} />
      <PageScrollTracker pageType="landing" />
      <FunnelStepOnMount step="landing" />
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Suspense fallback={null}>
          <PrivateAppointment imageOverride={slots.appointment} />
        </Suspense>
        <TrustBar />
        <ConfiguratorPreview />
        <Suspense fallback={null}>
          <DesignStudioPreview />
        </Suspense>
        <Suspense fallback={null}>
          <BespokeProcessSection />
        </Suspense>
        <Suspense fallback={null}>
          <ConsultationSection imageOverride={slots.consultation} />
        </Suspense>
        <Suspense fallback={null}>
          <MeasurementSection />
        </Suspense>
        <Suspense fallback={null}>
          <PatternFormulationSection />
        </Suspense>
        <Suspense fallback={null}>
          <ProductionSection />
        </Suspense>
        <Suspense fallback={null}>
          <QualityControlSection />
        </Suspense>
        <Suspense fallback={null}>
          <DeliverySection />
        </Suspense>
        <Suspense fallback={null}>
          <CraftsmanshipSection />
        </Suspense>
        <Suspense fallback={null}>
          <WorkshopSection imageOverride={slots.craftsmanship} />
        </Suspense>
        <Suspense fallback={null}>
          <AuthoritySection />
        </Suspense>
        <Suspense fallback={null}>
          <GallerySection />
        </Suspense>
        <Suspense fallback={null}>
          <ReviewsSection />
        </Suspense>
        <Suspense fallback={null}>
          <TrustBadgesSection />
        </Suspense>
        <Suspense fallback={null}>
          <FabricHighlight />
        </Suspense>
        <Suspense fallback={null}>
          <WhyLocalTailor />
        </Suspense>
        <Suspense fallback={null}>
          <CraftsmanshipProcess />
        </Suspense>
        <Suspense fallback={null}>
          <Gallery />
        </Suspense>
        <Suspense fallback={null}>
          <CustomerStories />
        </Suspense>
        <Suspense fallback={null}>
          <KnowledgePreview />
        </Suspense>
        <Suspense fallback={null}>
          <Faq />
        </Suspense>
        <Suspense fallback={null}>
          <FinalCta />
        </Suspense>
      </main>
      <Footer />
      <StickyMobileCta />
      <WalnutGrainOverlay />
    </div>
  )
}
