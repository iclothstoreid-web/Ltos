import { headers } from 'next/headers'
import type { Role, UserProfile } from '@/types/rbac'

// Server-only. Sprint O.5 — previously called supabase.auth.getUser() itself
// (same round trip every page already made independently). Now reads the
// identity middleware already verified and forwarded as request headers
// (x-user-id/x-user-name/x-user-role, see src/middleware.ts) — zero network
// calls. Only reachable behind middleware's matcher (/owner, /command-center,
// /workspace, /fitter, /inventory); returns null off that path, same as
// auth.getUser() would for an unauthenticated request.
//
// SessionUser is intentionally not the full Supabase `User` type: middleware
// only forwards id/name/role, not the rest of the Auth user object (email,
// app_metadata, etc.). Nothing in the codebase currently reads those other
// fields on this function's result (zero callers before this sprint).
export interface SessionUser {
  id: string
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const id = headers().get('x-user-id')
  if (!id) return null
  return { id }
}

// email/createdAt are not part of what middleware forwards (only
// id/name/role) so they're always null/empty here — unchanged from before,
// nothing currently reads them on this function's result.
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const id = headers().get('x-user-id')
  if (!id) return null

  const role = headers().get('x-user-role') as Role | null

  return {
    id,
    email: null,
    name: headers().get('x-user-name') ?? '',
    role: role || null,
    createdAt: '',
  }
}

export async function getCurrentRole(): Promise<Role | null> {
  const profile = await getCurrentUserProfile()
  return profile?.role ?? null
}
