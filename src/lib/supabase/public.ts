import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Stateless anon client for public, unauthenticated read paths (Fabric
// Explorer) — unlike src/lib/supabase/server.ts's client, this never calls
// cookies()/headers(), so routes using it (including generateStaticParams,
// which runs at build time with no request context at all) can be fully
// statically generated instead of opting out of Static Generation.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
