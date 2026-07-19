// The 5 Customer Journey milestones — locked, exactly 5, never added to or
// removed from (see brief). Reused by JourneyTimeline and every future
// milestone page.
export type JourneyMilestone = 1 | 2 | 3 | 4 | 5

export const JOURNEY_MILESTONES: { id: JourneyMilestone; label: string }[] = [
  { id: 1, label: 'Order Confirm & Fitting' },
  { id: 2, label: 'Cutting & Sewing' },
  { id: 3, label: 'Quality Control' },
  { id: 4, label: 'Finishing & Packing' },
  { id: 5, label: 'Shipping' },
]

// production_stage_records.stage -> the milestone it belongs to. material_prep
// and pattern_formulation are still pre-cutting preparation, so they stay on
// Milestone 1 rather than splitting out a 6th bucket.
const STAGE_TO_MILESTONE: Record<string, JourneyMilestone> = {
  material_prep: 1,
  pattern_formulation: 1,
  cutting: 2,
  sewing: 2,
  qc: 3,
  finishing: 4,
  packing: 4,
  shipping: 5,
}

// Milestone is derived automatically from workflow data — the customer never
// sets it. `latestStage` is the furthest production_stage_records.stage this
// order has reached (in_progress or completed); it takes priority once
// Production starts recording stages. Before that, orders.current_state is
// the only signal available.
export function resolveJourneyMilestone(
  currentState: string,
  latestStage: string | null
): JourneyMilestone {
  if (latestStage && latestStage in STAGE_TO_MILESTONE) {
    return STAGE_TO_MILESTONE[latestStage]
  }
  if (currentState === 'delivery' || currentState === 'follow_up') return 5
  return 1
}

// Milestone 5 renders two sub-states on the same page/route — 'follow_up' is
// the only orders.current_state value that means the `order.delivered` event
// has actually fired; everything else that reaches milestone 5 (in practice
// currentState === 'delivery') is still "in transit" from the customer's
// perspective, so it defaults to 'shipping'.
export type JourneyDeliveryState = 'shipping' | 'delivered'

export function resolveDeliveryState(currentState: string): JourneyDeliveryState {
  return currentState === 'follow_up' ? 'delivered' : 'shipping'
}
