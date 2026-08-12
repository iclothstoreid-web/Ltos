import { Fraunces, Jost } from 'next/font/google'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Nav } from './shell/Nav'
import { Footer } from './shell/Footer'
import { ScrollProgress } from './shell/ScrollProgress'
import { StickyMobileCta } from './shell/StickyMobileCta'
import { Hero } from './sections/Hero'
import { TrustBar } from './sections/TrustBar'
import { ConfiguratorPreview } from './sections/ConfiguratorPreview'
import { buildLocalBusinessSchema, buildWebSiteSchema } from '@/lib/marketing/seo'

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
const BespokeProcessSection = dynamic(() => import('./sections/BespokeProcessSection').then((m) => m.BespokeProcessSection))
const ConsultationSection = dynamic(() => import('./sections/ConsultationSection').then((m) => m.ConsultationSection))
const MeasurementSection = dynamic(() => import('./sections/MeasurementSection').then((m) => m.MeasurementSection))
const PatternFormulationSection = dynamic(() => import('./sections/PatternFormulationSection').then((m) => m.PatternFormulationSection))
const ProductionSection = dynamic(() => import('./sections/ProductionSection').then((m) => m.ProductionSection))
const QualityControlSection = dynamic(() => import('./sections/QualityControlSection').then((m) => m.QualityControlSection))
const DeliverySection = dynamic(() => import('./sections/DeliverySection').then((m) => m.DeliverySection))
const FabricHighlight = dynamic(() => import('./sections/FabricHighlight').then((m) => m.FabricHighlight))
const WhyLocalTailor = dynamic(() => import('./sections/WhyLocalTailor').then((m) => m.WhyLocalTailor))
const CraftsmanshipProcess = dynamic(() => import('./sections/CraftsmanshipProcess').then((m) => m.CraftsmanshipProcess))
const Gallery = dynamic(() => import('./sections/Gallery').then((m) => m.Gallery))
const CustomerStories = dynamic(() => import('./sections/CustomerStories').then((m) => m.CustomerStories))
const KnowledgePreview = dynamic(() => import('./sections/KnowledgePreview').then((m) => m.KnowledgePreview))
const Faq = dynamic(() => import('./sections/Faq').then((m) => m.Faq))
const FinalCta = dynamic(() => import('./sections/FinalCta').then((m) => m.FinalCta))

export function HomePage() {
  const localBusinessSchema = buildLocalBusinessSchema()
  const webSiteSchema = buildWebSiteSchema()

  return (
    <div className={`${fraunces.variable} ${jost.variable} bg-luxury-navy-deep font-luxury-sans`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Suspense fallback={null}>
          <PrivateAppointment />
        </Suspense>
        <TrustBar />
        <ConfiguratorPreview />
        <Suspense fallback={null}>
          <BespokeProcessSection />
        </Suspense>
        <Suspense fallback={null}>
          <ConsultationSection />
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
    </div>
  )
}
