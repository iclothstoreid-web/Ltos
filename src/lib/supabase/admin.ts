import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedAdminClient: SupabaseClient | null = null

/**
 * Server-only privileged client for trusted machine-to-machine flows such as
 * provider webhooks. Prefer Supabase's current secret key; the legacy
 * service-role key remains supported for this existing project.
 * Never expose either key through a NEXT_PUBLIC_* variable.
 */
export function createAdminClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase admin client can only be used on the server.')
  }

  if (cachedAdminClient) return cachedAdminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !secretKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or server Supabase secret (SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY).'
    )
  }

  cachedAdminClient = createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  return cachedAdminClient
}
