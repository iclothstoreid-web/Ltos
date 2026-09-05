import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { normalizeRole } from '@/lib/rbac/roles'
import type { Role } from '@/types/rbac'
import { routing } from '@/i18n/routing'

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
  // Sprint K hub — does NOT share a prefix with the rule above
  // ('/owner/master-data-center' doesn't start with '/owner/master-data/'),
  // so it needs its own exception or Fitter's CheckInSidebar "Master Data"
  // link (which now points here) would 403 via the general /owner rule
  // below before MasterDataCenterHub's own canManageMasterData() check ever
  // runs. The hub itself hides Operator/Business Rules/Service Rules cards
  // from Fitter client-side (canManageOperators), and those pages have
  // their own stricter admin/owner gate — only the hub page needs Fitter in.
  { prefix: '/owner/master-data-center', roles: ['owner', 'admin', 'fitter'], loginPath: '/owner/login' },
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

// Sprint W11.5 — every surface that stays OUTSIDE locale routing: the
// role-gated auth app (still handled below by ROUTE_RULES), the QR-token
// Production Flow and customer_token Customer Journey (URL-load-bearing,
// see the comment above), the customer-facing /login entry, and
// /access-denied (a middleware rewrite target — routing it back through
// next-intl would be redundant and risks a rewrite/redirect loop).
const NO_LOCALE_PREFIXES = ['/owner', '/command-center', '/workspace', '/fitter', '/inventory', '/production', '/journey', '/customer-consultation', '/login', '/access-denied']

function isNoLocalePath(pathname: string): boolean {
  return NO_LOCALE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

function matchRule(pathname: string): RouteRule | null {
  if (isPublicPath(pathname)) return null
  return ROUTE_RULES.find((rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) ?? null
}

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') ?? ''
  const normalizedHost = host.split(':')[0].toLowerCase()
  const isLocalTailorHost = normalizedHost.includes('ltos') || normalizedHost.includes('localtailor')

  // PRODUCTION I18N ROUTING FIX — this used to unconditionally force
  // Local Tailor's apex "/" to "/en", which made Bahasa Indonesia (the
  // default locale, canonical at unprefixed "/" per localePrefix:
  // 'as-needed') permanently unreachable: every request to "/" — a fresh
  // visitor, an id-ID browser, or even clicking "Bahasa Indonesia" in the
  // language switcher itself — got bounced to English before next-intl's
  // own locale negotiation ever ran.
  //
  // Investigated why the rule existed rather than deleting it blindly: at
  // the time it was added (65f467b, alongside a same-commit fix to the
  // legacy unprefixed /login page), the concern was Local Tailor's apex
  // root "falling into the legacy auth flow". That is no longer possible
  // given this file's current shape — matchRule()/isNoLocalePath() only
  // ever match "/" against prefixed rules (ROUTE_RULES entries like
  // '/owner', '/workspace', NO_LOCALE_PREFIXES entries like '/login'),
  // and bare "/" matches none of them, so "/" already falls straight
  // through to `intlMiddleware(request)` below with no special-casing
  // needed — verified locally: requesting "/" on a host that does NOT
  // match isLocalTailorHost (so this block never ran) returns 200 with
  // negotiated locale content, never an auth page. The one-time legacy
  // /login concern this rule bundled together with "/" was separately and
  // more precisely fixed by the /login rule directly below (redirecting
  // to /owner/login instead of piggybacking on this one), so removing
  // this "/" branch changes nothing about /login's behavior.
  //
  // "/" now gets exactly the same treatment every other locale path on
  // this host already gets: it falls through to intlMiddleware, which
  // honors an explicit NEXT_LOCALE cookie (e.g. from the language
  // switcher) first, then Accept-Language, then the 'id' default —
  // restoring Indonesian as a reachable, explicit-choice-respecting
  // locale without touching localePrefix and without introducing an /id
  // prefix.

  // /login used to redirect here too, bouncing straight to the marketing
  // homepage — that was correct back when /login was only the old generic
  // Business-OS login page (src/app/login/page.tsx) with nowhere useful to
  // send traffic. Now that /owner/login is LTOS's real entry point (Owner
  // OS -> App Launcher), /login should open that instead of being swallowed
  // by the homepage redirect above.
  if (isLocalTailorHost && pathname === '/login') {
    return NextResponse.redirect(new URL('/owner/login', request.url))
  }

  // Auth-gated operational app — unchanged behavior, never touched by
  // locale detection/redirects.
  const rule = matchRule(pathname)
  if (rule) {
    const { supabase, response } = createMiddlewareClient(request)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Carries the refreshed auth cookies (if any) from `response` onto
    // whichever response actually gets returned below. A function
    // expression, not a declaration — this now sits inside the `if (rule)`
    // block, and ES5-strict-mode forbids block-scoped function
    // declarations.
    const withRefreshedCookies = (res: NextResponse) => {
      response.cookies.getAll().forEach((cookie) => res.cookies.set(cookie))
      return res
    }

    if (!user) {
      return withRefreshedCookies(NextResponse.redirect(new URL(rule.loginPath, request.url)))
    }

    // Sprint O.3 (TTFB) — 'name' added alongside the 'role' this query
    // already selected (same single round trip, no added cost) so identity
    // can be forwarded to Server Components below instead of them repeating
    // this exact auth.getUser()+profiles lookup a second time.
    const { data: profile } = await supabase.from('profiles').select('role, name').eq('id', user.id).single()
    const role = normalizeRole(profile?.role)

    if (!role || !rule.roles.includes(role)) {
      return withRefreshedCookies(NextResponse.rewrite(new URL('/access-denied', request.url)))
    }

    // Forward the identity middleware already verified as request headers, so
    // a Server Component can read it via next/headers instead of re-querying
    // Supabase. Route matcher guarantees middleware always runs first for
    // every path a Server Component would read these from.
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-name', profile?.name ?? '')
    requestHeaders.set('x-user-role', role)
    return withRefreshedCookies(NextResponse.next({ request: { headers: requestHeaders } }))
  }

  // Any other surface that must stay unprefixed and untouched by locale
  // detection (public login pages inside a gated prefix, production/
  // journey token flows, /login, /access-denied).
  if (isNoLocalePath(pathname) || isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Public marketing/SEO surface — Accept-Language detection, NEXT_LOCALE
  // cookie persistence, and "/", "/en", "/ar", "/fr", "/ja", "/de" routing.
  return intlMiddleware(request)
}

// Scopes Middleware to every path except Next.js internals, the API, and
// requested static files (anything with a dot in its last segment) — the
// function body above decides per-path whether that's the auth-gated app,
// an excluded unlocalized surface, or the locale-routed public site.
//
// `/design/:path*` is listed explicitly because a saved-design share slug
// (session.ts: `<payload>.<hmac>`) contains a dot, so the first pattern's
// `.*\..*` static-file exclusion would otherwise skip it entirely — and
// then next-intl never runs, so the canonical unprefixed
// `localtailor.id/design/<slug>` (default 'id' locale) 404s while only the
// `/en/`- and `/id/`-prefixed forms resolve. This second entry restores
// the share URL the save route actually hands out.
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/design/:path*'],
}
