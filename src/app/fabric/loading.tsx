import { MaterialGridSkeleton } from '@/components/fabric/MaterialGrid'

export default function FabricExplorerLoading() {
  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-3 w-24 rounded bg-luxury-gold/20" />
        <div className="mt-3 h-8 w-64 rounded bg-luxury-ivory/10" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-luxury-taupe/10" />
        <div className="mt-6 h-9 w-full max-w-md rounded-full bg-luxury-charcoal/40" />

        <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
          <div className="hidden space-y-4 lg:block">
            <div className="h-4 w-16 rounded bg-luxury-taupe/10" />
            <div className="h-4 w-20 rounded bg-luxury-taupe/10" />
            <div className="h-4 w-24 rounded bg-luxury-taupe/10" />
          </div>
          <MaterialGridSkeleton />
        </div>
      </div>
    </div>
  )
}
