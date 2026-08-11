import 'server-only'
import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'

// Stateless anon client for public, unauthenticated read paths (Fabric
// Explorer) — unlike src/lib/supabase/server.ts's client, this never calls
// cookies()/headers(), so routes using it (including generateStaticParams,
// which runs at build time with no request context at all) can be fully
// statically generated instead of opting out of Static Generation.
//
// Sprint W3-6 §10 — wrapped in React's cache() so every call within one
// request/render pass returns the same client instance instead of a fresh
// one each time. This is what actually makes repository-level
// memoization (getAllMaterials, etc. — also cache()-wrapped) effective:
// cache() keys on argument identity, and a materialRepository function
// called with two different client objects would never hit the cache
// even with identical other params. Before this, a page whose
// generateMetadata and page body both resolve the same material (the
// fabric detail page does exactly this) fetched the entire catalog
// twice, once per call site, every request.
export const createPublicClient = cache(function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
})
