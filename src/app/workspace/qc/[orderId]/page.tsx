import { redirect } from 'next/navigation'

interface Props {
  params: { orderId: string }
}

// QC no longer has a standalone authenticated workspace — the real QC
// decision (Lulus/Kembalikan) has lived inside the kiosk's
// ProductionPacketWorkspace (via QcDecisionPanel + complete_stage) since
// the Production Flow / Workspace split. This page's old runtime
// (QCWorkspace.tsx) called emit_event()/create_queue_task(), which were
// revoked in 20260721000100_revoke_legacy_queue_rpcs.sql because their only
// caller was this route — the calls failed silently (no {error} check) and
// nothing was ever actually recorded. QCWorkspace.tsx is left in place,
// unimported, per Sprint M.1 scope (no dead-code cleanup).
//
// Redirect rather than 404 for any bookmarked/shared /workspace/qc/[orderId]
// link (same convention as LegacyProductionPacketRedirect) — the correct
// runtime is /production/[orderId], gated by ProductionAccessGate on the
// stage record's own status, not by session.
export default function QCLegacyRedirect({ params }: Props) {
  redirect(`/production/${params.orderId}`)
}
