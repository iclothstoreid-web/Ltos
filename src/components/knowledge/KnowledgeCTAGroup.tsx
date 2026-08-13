import { CTAConsultation } from './CTAConsultation'
import { CTAFabricExplorer } from './CTAFabricExplorer'
import { CTABodyProfile } from './CTABodyProfile'

interface KnowledgeCTAGroupProps {
  heading: string
  body: string
}

// Shared card wrapper around the 3 required CTAs (Consultation / Fabric
// Explorer / Digital Body Profile) — same bordered-card shape as the W0.5
// content cluster's ArticleConversionCTAs, reused on every /knowledge
// landing/hub/article page rather than repeating the markup 3 times.
export function KnowledgeCTAGroup({ heading, body }: KnowledgeCTAGroupProps) {
  return (
    <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-luxury-gold/25 bg-luxury-charcoal/30 p-6 text-center md:p-10">
      <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">Langkah Selanjutnya</p>
      <h2 className="mt-3 font-fraunces text-2xl text-luxury-ivory md:text-3xl">{heading}</h2>
      <p className="mx-auto mt-3 max-w-lg font-luxury-sans text-sm text-luxury-taupe">{body}</p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
        <CTAConsultation />
        <CTAFabricExplorer />
        <CTABodyProfile />
      </div>
    </div>
  )
}
