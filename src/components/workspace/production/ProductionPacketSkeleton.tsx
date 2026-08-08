// Shared loading shell for the Production Packet route — same container
// geometry as ProductionPacketWorkspace's own wrapper (max-w-2xl mx-auto
// px-4 py-8 space-y-6) and the same card tokens HeroCard/stage panels use
// (bg-surface-01, rounded-2xl, border-outline-variant/30), so swapping the
// skeleton for real content never shifts layout (no CLS). Used in two
// places that both need to cover the same blank window without leaking any
// protected content: ProductionAccessGate's pending-check render, and the
// route's loading.tsx (streamed in while page.tsx's data fetch is pending).
export function ProductionPacketSkeleton() {
  return (
    <div className="min-h-screen bg-surface-01">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-surface rounded-2xl p-5 shadow-[0px_4px_20px_rgba(14,19,32,0.04)] border border-outline-variant/30 space-y-4 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-14 aspect-[3/4] rounded-lg bg-outline-variant/40 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-2/3 rounded bg-outline-variant/40" />
              <div className="h-3 w-1/3 rounded bg-outline-variant/30" />
              <div className="h-3 w-1/2 rounded bg-outline-variant/30" />
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-outline-variant/30" />
        </div>

        <div className="bg-white/70 rounded-2xl border-[0.5px] border-outline-variant/40 shadow-sm p-6 animate-pulse space-y-3">
          <div className="h-3 w-1/4 rounded bg-outline-variant/40" />
          <div className="flex gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-2 flex-1 rounded-full bg-outline-variant/30" />
            ))}
          </div>
        </div>

        <div className="bg-white/70 rounded-2xl border-[0.5px] border-outline-variant/40 shadow-sm p-6 animate-pulse space-y-3">
          <div className="h-4 w-1/3 rounded bg-outline-variant/40" />
          <div className="h-3 w-2/3 rounded bg-outline-variant/30" />
          <div className="h-24 w-full rounded-lg bg-outline-variant/20 mt-4" />
        </div>
      </div>
    </div>
  )
}
