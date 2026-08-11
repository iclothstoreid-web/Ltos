export default function FabricExplorerLoading() {
  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-3 w-24 rounded bg-luxury-gold/20" />
        <div className="mt-3 h-8 w-64 rounded bg-luxury-ivory/10" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-luxury-taupe/10" />

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl border border-luxury-gold/10 bg-luxury-charcoal/30" />
          ))}
        </div>
      </div>
    </div>
  )
}
