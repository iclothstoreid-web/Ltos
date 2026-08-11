import type { FabricSearchParams } from '@/lib/materials/searchParamsHelpers'

interface FabricSearchFormProps {
  basePath: string
  searchParams: FabricSearchParams
  lockedCategory?: string
}

// Plain <form method="GET"> — submits as a normal navigation, no client JS.
// Every other active filter is carried forward as a hidden input so
// searching doesn't clear category/texture/weight/season/price_tier (only
// `search` and `limit` change: limit resets since a new search invalidates
// whatever "page" the user had loaded).
export function FabricSearchForm({ basePath, searchParams, lockedCategory }: FabricSearchFormProps) {
  const currentSearch = typeof searchParams.search === 'string' ? searchParams.search : ''

  const preserved: { key: string; value: string }[] = []
  for (const key of ['texture', 'weight', 'season', 'price_tier', 'sort'] as const) {
    const value = searchParams[key]
    if (typeof value === 'string' && value) preserved.push({ key, value })
  }
  if (!lockedCategory && typeof searchParams.category === 'string' && searchParams.category) {
    preserved.push({ key: 'category', value: searchParams.category })
  }

  return (
    <form method="GET" action={basePath} role="search" className="flex items-center gap-2">
      <label htmlFor="fabric-search" className="sr-only">
        Search fabrics by name, category, composition, or texture
      </label>
      <input
        id="fabric-search"
        type="search"
        name="search"
        defaultValue={currentSearch}
        placeholder="Search fabrics (e.g. oxford, cotton, crisp)…"
        className="w-full rounded-full border border-luxury-gold/20 bg-luxury-charcoal/30 px-4 py-2 font-luxury-sans text-sm text-luxury-ivory placeholder:text-luxury-taupe/70 focus:border-luxury-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold/50"
      />
      {preserved.map((p) => (
        <input key={p.key} type="hidden" name={p.key} value={p.value} />
      ))}
      <button
        type="submit"
        className="shrink-0 rounded-full border border-luxury-gold/25 px-4 py-2 font-luxury-sans text-[11px] uppercase tracking-[0.14em] text-luxury-ivory transition hover:border-luxury-gold hover:text-luxury-gold focus-visible:ring-2 focus-visible:ring-luxury-gold/50"
      >
        Search
      </button>
    </form>
  )
}
