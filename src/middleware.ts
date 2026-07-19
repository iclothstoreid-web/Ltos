import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { normalizeRole } from '@/lib/rbac/roles'
import type { Role } from '@/types/rbac'

type RouteRule = {
  prefix: string
  roles: Role[]
  loginPath: string
}

// Checked in order — more specific prefixes must come before their broader
// parents (the /owner/master-data exception before the general /owner rule)
// since the first match wins. /production/* and /journey/* are deliberately
// absent: Production Flow stays on its QR-token flow and Customer Journey
// stays on its customer_token flow, neither gated by Role.
const ROUTE_RULES: RouteRule[] = [
  // Fitter keeps access to Master Data here — same grant as the existing
  // canManageMasterData() (src/lib/design/masterData.ts), which the
  // CheckInSidebar/DesignStudioTopBar "Kelola Master Data" links depend on.
  { prefix: '/owner/master-data', roles: ['owner', 'admin', 'fitter'], loginPath: '/owner/login' },
  { prefix: '/command-center', roles: ['owner', 'admin'], loginPath: '/owner/login' },
  { prefix: '/owner', roles: ['owner', 'admin'], loginPath: '/owner/login' },
  { prefix: '/workspace', roles: ['fitter', 'owner', 'admin'], loginPath: '/fitter/login' },
  { prefix: '/fitter', roles: ['fitter', 'owner', 'admin'], loginPath: '/fitter/login' },
  { prefix: '/inventory', roles: ['inventory', 'owner', 'admin'], loginPath: '/inventory/login' },
]

// Login/reset pages live under a protected prefix (e.g. /owner/login is
// under /owner) — excluded so an unauthenticated visit doesn't get bounced
// back to the very page it's trying to reach.
const PUBLIC_PATHS = [
  '/owner/login',
  '/owner/forgot-password',
  '/owner/reset-password',
  '/fitter/login',
  '/fitter/forgot-password',
  '/fitter/reset-password',
  '/inventory/login',
  '/inventory/forgot-password',
  '/inventory/reset-password',
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))
}

function matchRule(pathname: string): RouteRule | null {
  if (isPublicPath(pathname)) return null
  return ROUTE_RULES.find(rule => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) ?? null
}

export async function middleware(request: NextRequest) {
  const rule = matchRule(request.nextUrl.pathname)
  if (!rule) return NextResponse.next()

  const { supabase, response } = createMiddlewareClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Carries the refreshed auth cookies (if any) from `response` onto
  // whichever response actually gets returned below.
  function withRefreshedCookies(res: NextResponse) {
    response.cookies.getAll().forEach(cookie => res.cookies.set(cookie))
    return res
  }

  if (!user) {
    return withRefreshedCookies(NextResponse.redirect(new URL(rule.loginPath, request.url)))
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = normalizeRole(profile?.role)

  if (!role || !rule.roles.includes(role)) {
    return withRefreshedCookies(NextResponse.rewrite(new URL('/access-denied', request.url)))
  }

  return response
}

// Scopes Middleware to exactly the protected app prefixes — /production,
// /journey, /login, /, API routes, static assets, and Next.js internals are
// never matched, so they're never touched by this file.
export const config = {
  matcher: ['/owner/:path*', '/command-center/:path*', '/workspace/:path*', '/fitter/:path*', '/inventory/:path*'],
}
