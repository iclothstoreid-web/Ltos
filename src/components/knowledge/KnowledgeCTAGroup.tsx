import type { KnowledgeCategorySlug } from '@/lib/knowledge/types'
import { getCTAConfig } from '@/lib/knowledge/cta'
import { CTAConsultation } from './CTAConsultation'
import { CTAFabricExplorer } from './CTAFabricExplorer'
import { CTABodyProfile } from './CTABodyProfile'
import { CTAEstimatePrice } from './CTAEstimatePrice'
import { CTACommercial } from './CTACommercial'

interface KnowledgeCTAGroupProps {
  heading?: string
  body?: string
  // Sprint W6-10 — when set, heading/body/consultation label and which
  // CTAs show are all resolved from src/lib/knowledge/cta.ts's per-category
  // config, overriding any heading/body passed explicitly. Omitting it
  // keeps every pre-W6-10 call site's explicit heading/body unchanged.
  category?: KnowledgeCategorySlug
  // National SEO — per-article commercial link, wins over the category
  // config's `commercial` when the article's money page differs from its
  // cluster default.
  commercialOverride?: { label: string; href: string }
}

// Shared card wrapper around the commercial funnel CTAs (Consultation /
// Fabric Explorer / Estimate Price / Digital Body Profile) — same
// bordered-card shape as the W0.5 content cluster's ArticleConversionCTAs,
// reused on every /knowledge landing/hub/article page rather than
// repeating the markup 3+ times.
export function KnowledgeCTAGroup({ heading, body, category, commercialOverride }: KnowledgeCTAGroupProps) {
  const config = category ? getCTAConfig(category) : undefined
  const commercial = commercialOverride ?? config?.commercial
  const resolvedHeading = config?.heading ?? heading ?? 'Siap Melanjutkan ke Langkah Berikutnya?'
  const resolvedBody =
    config?.body ?? body ?? 'Konsultasikan kebutuhan Anda, jelajahi koleksi bahan, atau cek Digital Body Profile Anda sebelum memesan thobe bespoke.'

  return (
    <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-luxury-gold/25 bg-luxury-charcoal/30 p-6 text-center md:p-10">
      <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">Langkah Selanjutnya</p>
      <h2 className="mt-3 font-fraunces text-2xl text-luxury-ivory md:text-3xl">{resolvedHeading}</h2>
      <p className="mx-auto mt-3 max-w-lg font-luxury-sans text-sm text-luxury-taupe">{resolvedBody}</p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
        <CTAConsultation label={config?.consultationLabel} />
        {commercial && <CTACommercial label={commercial.label} href={commercial.href} />}
        {(config?.showFabricExplorer ?? true) && <CTAFabricExplorer />}
        {config?.showEstimatePrice && <CTAEstimatePrice />}
        {(config?.showBodyProfile ?? true) && <CTABodyProfile />}
      </div>
    </div>
  )
}
