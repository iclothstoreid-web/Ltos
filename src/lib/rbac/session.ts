import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import type { Role, UserProfile } from '@/types/rbac'
import { normalizeRole } from './roles'

// Server-only. Same supabase.auth.getUser() call every page already makes —
// centralized here so future callers don't repeat it. Does not redirect;
// existing pages keep their own redirect/gate logic.
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Server-only. Fetches the profiles row for the current session and
// normalizes its role into the RBAC Role vocabulary (see normalizeRole).
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, role, created_at')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return {
    id: profile.id,
    email: user.email ?? null,
    name: profile.name,
    role: normalizeRole(profile.role),
    createdAt: profile.created_at,
  }
}

export async function getCurrentRole(): Promise<Role | null> {
  const profile = await getCurrentUserProfile()
  return profile?.role ?? null
}
