// Fallbacks for the two Suspense boundaries added in Sprint N4
// (ProductionCommunicationBoundary / CustomerReferenceBoundary). Same visual
// language as ProductionPacketSkeleton (Sprint N3): bg-white/70,
// rounded-2xl, border-outline-variant/40, shadow-sm, animate-pulse — so a
// deferred panel streaming in never looks like a different design system
// than the shell it's completing.
export function CommunicationPanelSkeleton() {
  return (
    <div className="bg-white/70 rounded-2xl border-[0.5px] border-outline-variant/40 shadow-sm p-6 animate-pulse space-y-3">
      <div className="h-3 w-1/3 rounded bg-outline-variant/40" />
      <div className="h-16 w-full rounded-xl bg-outline-variant/20" />
      <div className="h-9 w-full rounded bg-outline-variant/20" />
    </div>
  )
}

export function MediaProduksiCardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-5 w-32 rounded bg-outline-variant/40" />
      <div className="grid grid-cols-2 gap-3">
        <div className="aspect-square rounded-lg bg-outline-variant/20" />
        <div className="aspect-square rounded-lg bg-outline-variant/20" />
      </div>
    </div>
  )
}
