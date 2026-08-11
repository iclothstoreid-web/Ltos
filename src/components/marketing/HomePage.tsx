import { Fraunces, Jost } from 'next/font/google'
import { Nav } from './shell/Nav'
import { Footer } from './shell/Footer'
import { ScrollProgress } from './shell/ScrollProgress'
import { StickyMobileCta } from './shell/StickyMobileCta'
import { Hero } from './sections/Hero'
import { PrivateAppointment } from './sections/PrivateAppointment'
import { TrustBar } from './sections/TrustBar'
import { ConfiguratorPreview } from './sections/ConfiguratorPreview'
import { FabricHighlight } from './sections/FabricHighlight'
import { WhyLocalTailor } from './sections/WhyLocalTailor'
import { CraftsmanshipProcess } from './sections/CraftsmanshipProcess'
import { Gallery } from './sections/Gallery'
import { CustomerStories } from './sections/CustomerStories'
import { KnowledgePreview } from './sections/KnowledgePreview'
import { Faq } from './sections/Faq'
import { FinalCta } from './sections/FinalCta'
import { buildLocalBusinessSchema, buildWebSiteSchema } from '@/lib/marketing/seo'

// Serif role reuses the Fraunces token already established elsewhere in
// this repo (Check-In/Production workspace rebuilds) rather than
// introducing a second serif — see PLAN_SPRINT_W1_HOMEPAGE_LUXURY_BLUEPRINT.md §11.
const fraunces = Fraunces({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-fraunces', display: 'swap' })
// New sans, deliberately distinct from the internal app's Inter — Jost's
// geometric/Futura-adjacent shapes read as fashion-editorial rather than
// product UI. See blueprint §11 for the ui-ux-pro-max pairing rationale.
const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-luxury-sans', display: 'swap' })

// All 11 sections are server-rendered (no ssr:false splitting) so their
// copy is crawlable by search/AI engines on first response — the one
// exception is the Hero's 3D canvas (non-textual, dynamically imported in
// Hero.tsx), which is the actual heavy payload worth deferring.
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
        <PrivateAppointment />
        <TrustBar />
        <ConfiguratorPreview />
        <FabricHighlight />
        <WhyLocalTailor />
        <CraftsmanshipProcess />
        <Gallery />
        <CustomerStories />
        <KnowledgePreview />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyMobileCta />
    </div>
  )
}
