import { getSizeRangeLabels } from '@/lib/body-estimator/sizeRecommendation'
import type { EstimatorInput, EstimatorResult } from '@/lib/body-estimator/types'
import { BODY_PROFILE_SILHOUETTE_SCALES, InteractiveBodySilhouette } from './InteractiveBodySilhouette'
import { BodySnapshotCard } from './BodySnapshotCard'
import { FitRecommendationCard } from './FitRecommendationCard'
import { EstimatedSizeCard } from './EstimatedSizeCard'

interface ResultHeroLayoutProps {
  input: EstimatorInput
  result: EstimatorResult
}

// Sprint W0.3 — desktop two-column (±55/45) hero: silhouette left, headline
// + the three result cards right. Collapses to one column on mobile via the
// parent grid (see result/page.tsx); this component itself doesn't need to
// know about the page-level TrustGuaranteeBlock reordering.
export function ResultHeroLayout({ input, result }: ResultHeroLayoutProps) {
  const scales = BODY_PROFILE_SILHOUETTE_SCALES[result.bodyProfile]
  const { chestRange, shoulderRange } = getSizeRangeLabels(result.size)

  return (
    <div className="grid gap-10 lg:grid-cols-[11fr_9fr] lg:items-start">
      <div className="lg:sticky lg:top-10">
        <InteractiveBodySilhouette
          bodyProfile={result.bodyProfile}
          heightScale={scales.heightScale}
          shoulderScale={scales.shoulderScale}
          waistScale={scales.waistScale}
          hipScale={scales.hipScale}
        />
      </div>

      <div>
        <span className="inline-flex items-center rounded-full border border-luxury-gold/40 px-3 py-1 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
          Estimated
        </span>
        <h1 className="mt-4 font-fraunces text-3xl text-luxury-ivory md:text-4xl">Your Estimated Body Profile</h1>

        <div className="mt-8 flex flex-col gap-5">
          <BodySnapshotCard height={input.height} weight={input.weight} bmi={result.bmi} bodyProfile={result.bodyProfile} />
          <FitRecommendationCard fit={result.fit} confidence={result.confidence} explanation={result.explanation} />
          <EstimatedSizeCard size={result.size} chestRange={chestRange} shoulderRange={shoulderRange} />
        </div>
      </div>
    </div>
  )
}
