// Sprint W3-6 — shared response headers for every /api/materials* route.
//
// Cache-Control: `s-maxage` lets Vercel's edge cache serve repeat requests
// without re-invoking the function; `stale-while-revalidate` serves a
// stale copy instantly while refreshing in the background rather than
// making a request wait on a fresh DB round trip. Matches the same
// 1-hour/1-day rhythm the fabric pages themselves use (revalidate = 3600).
//
// X-Robots-Tag: these are data endpoints, not content pages — the site's
// canonical, indexable version of this information is the /fabric page
// itself (SEO §: "canonical tetap halaman web"). robots.ts already
// disallows /api/ entirely; this header is defense-in-depth for crawlers
// that fetch the URL directly without checking robots.txt first.
export function buildApiHeaders(): HeadersInit {
  return {
    'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    'X-Robots-Tag': 'noindex',
  }
}
