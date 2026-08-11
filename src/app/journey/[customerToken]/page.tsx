import { createClient } from '@/lib/supabase/server'
import type { OrderSnapshot } from '@/lib/order/types'
import { resolveJourneyMilestone, resolveDeliveryState } from '@/lib/journey/milestone'
import type { ProductionUpdate } from '@/lib/journey/production-update'
import { buildCustomerJourneyUrl } from '@/lib/order/qr'
import { courierLabel, courierTrackingUrl } from '@/lib/shipping/couriers'
import { createRenderFinalSignedUrl } from '@/lib/design/renderFinal'
import { JourneyLayout } from '@/components/journey/JourneyLayout'
import { GreetingSection } from '@/components/journey/GreetingSection'
import { OrderStatusSection } from '@/components/journey/OrderStatusSection'
import { OrderSummarySection } from '@/components/journey/OrderSummarySection'
import { MeasurementSummarySection } from '@/components/journey/MeasurementSummarySection'
import { QuoteSection } from '@/components/journey/QuoteSection'
import { MilestoneHero } from '@/components/journey/MilestoneHero'
import { TodaysJourneySection } from '@/components/journey/TodaysJourneySection'
import { PhotoGridSection } from '@/components/journey/PhotoGridSection'
import { AssuranceChecklistSection } from '@/components/journey/AssuranceChecklistSection'
import { VideoFinishingSection } from '@/components/journey/VideoFinishingSection'
import { ShareMomentSection } from '@/components/journey/ShareMomentSection'
import { ProfileCard } from '@/components/journey/ProfileCard'
import { ShippingInfoSection } from '@/components/journey/ShippingInfoSection'
import {
  MILESTONE_2_CONTENT,
  MILESTONE_3_CONTENT,
  MILESTONE_4_CONTENT,
  MILESTONE_5_CONTENT,
} from '@/lib/journey/milestoneContent'

interface Props {
  params: { customerToken: string }
}

interface CustomerJourneySnapshotRow {
  order_number: string
  customer_name: string
  current_state: string
  latest_stage: string | null
  event_data: OrderSnapshot | null
  production_updates: ProductionUpdate[] | null
  packing_video_url: string | null
  courier: string | null
  tracking_number: string | null
  // P0 (Render Final -> Journey hero image) -- Storage path of the current
  // consultation's Render Final, only populated once render_status is
  // 'approved' (see get_customer_journey_snapshot; draft renders are never
  // exposed here). Null whenever no approved render exists yet.
  render_storage_path: string | null
  // P1 (Production ETA -> Journey) -- identical formula to
  // get_production_packet's own estimated_completion (add_working_days over
  // service_sla_rules, falling back to created_at + 14 days). No new
  // calculation engine, just the same one surfaced here too.
  estimated_completion: string | null
}

// Public entry point — deliberately unauthenticated. customer_token is the
// only identifier a customer ever sees; it must never resolve via
// order_id/order_number (see get_customer_journey_snapshot, a
// security-definer RPC that's the only way this page reads `orders`/
// `customers`/`business_events`/`production_stage_records`, all otherwise
// staff-only via RLS).
//
// Milestones 1-5 each have their own body content, branched on `milestone`
// below. Milestone 5 additionally branches on `deliveryState` — it renders
// on the same route/page, no separate URL, per brief.
export default async function CustomerJourneyPage({ params }: Props) {
  const supabase = createClient()

  const { data } = await supabase
    .rpc('get_customer_journey_snapshot', { p_customer_token: params.customerToken })
    .maybeSingle<CustomerJourneySnapshotRow>()

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface px-6 font-sans">
        <div className="max-w-sm text-center">
          <h1 className="font-fraunces text-xl text-on-surface mb-2">Pesanan tidak ditemukan</h1>
          <p className="text-body text-secondary">
            Link ini tidak valid atau sudah tidak berlaku.
          </p>
        </div>
      </main>
    )
  }

  const firstName = data.customer_name.trim().split(/\s+/)[0]
  const milestone = resolveJourneyMilestone(data.current_state, data.latest_stage)
  const deliveryState = resolveDeliveryState(data.current_state)
  const snapshot = data.event_data

  // Some pre-existing orders carry an older/different event_data shape
  // (seeded before this snapshot format was finalized) — guard each section
  // on its own field rather than trusting `snapshot` as a whole, so stale
  // data degrades to "don't show the section" instead of crashing the page.
  const design = snapshot?.design
  const measurement = snapshot?.measurement
  const productionUpdates = data.production_updates ?? []

  // P0 (Render Final -> Journey hero image) -- mint a fresh signed URL
  // server-side, only when an approved render exists for this order's
  // consultation (render_storage_path is already approved-gated by the RPC
  // itself). Storage's own "Public can read approved render finals" policy
  // is what actually authorizes this specific anon request; a draft's path
  // is never returned by the RPC in the first place, so it can never reach
  // here. Any failure (storage hiccup, race with a status change) falls
  // back to null -- callers below fall back to each milestone's existing
  // static placeholder, exactly as before this change.
  let heroImageSrc: string | null = null
  if (data.render_storage_path) {
    try {
      heroImageSrc = await createRenderFinalSignedUrl(supabase, data.render_storage_path)
    } catch (err) {
      console.error('[journey] render final signed url failed:', err)
    }
  }

  // P1 (Production ETA -> Journey) -- same value get_production_packet
  // already computes, just formatted for customer display here.
  const estimatedCompletionLabel = data.estimated_completion
    ? new Date(data.estimated_completion).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <JourneyLayout
      currentMilestone={milestone}
      isTimelineComplete={milestone === 5 && deliveryState === 'delivered'}
    >
      {milestone === 1 && (
        <>
          <GreetingSection customerName={firstName} />
          <OrderStatusSection />
          {design && <OrderSummarySection design={design} notes={snapshot?.consultationNotes ?? ''} />}
          {measurement && <MeasurementSummarySection measurement={measurement} />}
          <QuoteSection />
        </>
      )}
      {milestone === 2 && (
        <>
          <MilestoneHero {...MILESTONE_2_CONTENT.hero} imageSrc={heroImageSrc ?? MILESTONE_2_CONTENT.hero.imageSrc} />
          {estimatedCompletionLabel && (
            <p className="max-w-2xl mx-auto px-6 -mt-4 pb-4 font-sans text-body text-secondary text-center">
              Estimasi selesai produksi: {estimatedCompletionLabel}
            </p>
          )}
          <TodaysJourneySection updates={productionUpdates} />
          <PhotoGridSection {...MILESTONE_2_CONTENT.gallery} />
          <QuoteSection variant="editorial" {...MILESTONE_2_CONTENT.editorial} />
        </>
      )}
      {milestone === 3 && (
        <>
          <MilestoneHero
            {...MILESTONE_3_CONTENT.hero}
            imageSrc={heroImageSrc ?? MILESTONE_3_CONTENT.hero.imageSrc}
            variant="overlay"
          />
          <QuoteSection variant="editorial" {...MILESTONE_3_CONTENT.editorial} />
          <AssuranceChecklistSection {...MILESTONE_3_CONTENT.checklist} />
          <PhotoGridSection {...MILESTONE_3_CONTENT.gallery} />
          <QuoteSection message={MILESTONE_3_CONTENT.closing.message} />
        </>
      )}
      {milestone === 4 && (
        <>
          <MilestoneHero
            {...MILESTONE_4_CONTENT.hero}
            imageSrc={heroImageSrc ?? MILESTONE_4_CONTENT.hero.imageSrc}
            variant="overlay"
          />
          <PhotoGridSection {...MILESTONE_4_CONTENT.gallery} />
          <VideoFinishingSection
            {...MILESTONE_4_CONTENT.video}
            videoSrc={data.packing_video_url ?? MILESTONE_4_CONTENT.video.videoSrc}
          />
          <ShareMomentSection
            {...MILESTONE_4_CONTENT.share}
            shareUrl={buildCustomerJourneyUrl(params.customerToken)}
          />
          <ProfileCard {...MILESTONE_4_CONTENT.artisan} />
          <QuoteSection variant="editorial" {...MILESTONE_4_CONTENT.editorial} />
          <QuoteSection message={MILESTONE_4_CONTENT.closing.message} />
        </>
      )}
      {milestone === 5 && deliveryState === 'shipping' && (
        <>
          <MilestoneHero
            {...MILESTONE_5_CONTENT.shipping.hero}
            imageSrc={heroImageSrc ?? MILESTONE_5_CONTENT.shipping.hero.imageSrc}
          />
          <ShippingInfoSection
            {...MILESTONE_5_CONTENT.shipping.shippingInfo}
            courier={courierLabel(data.courier)}
            trackingNumber={data.tracking_number}
            trackingUrl={courierTrackingUrl(data.courier)}
          />
        </>
      )}
      {milestone === 5 && deliveryState === 'delivered' && (
        <>
          <MilestoneHero
            {...MILESTONE_5_CONTENT.delivered.hero}
            imageSrc={heroImageSrc ?? MILESTONE_5_CONTENT.delivered.hero.imageSrc}
          />
          <QuoteSection message={MILESTONE_5_CONTENT.delivered.closing.message} />
          <ShareMomentSection
            {...MILESTONE_5_CONTENT.delivered.share}
            shareUrl={buildCustomerJourneyUrl(params.customerToken)}
            platforms={['whatsapp', 'instagram', 'facebook', 'x', 'copy']}
            variant="prominent"
          />
          <AssuranceChecklistSection {...MILESTONE_5_CONTENT.delivered.journeyComplete} />
        </>
      )}
    </JourneyLayout>
  )
}
