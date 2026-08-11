import type { MetadataRoute } from 'next'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'

// Sprint W3-5 §12 — first robots.txt this project has had. Disallow list
// covers every internal/staff route prefix in the app (owner, workspace,
// inventory, production, fitter, command-center, login, api) — all
// already login-gated by middleware/RLS, so this changes nothing about
// access, only crawler guidance: staff tools have no business being
// indexed. Everything else (homepage, /fabric, /design-studio, /design/*,
// /journey/*) is left crawlable by default.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/owner/',
        '/workspace/',
        '/inventory/',
        '/production',
        '/production/',
        '/fitter/',
        '/command-center',
        '/command-center/',
        '/login',
        '/api/',
      ],
    },
    sitemap: `${FABRIC_SITE_ORIGIN}/sitemap.xml`,
  }
}
