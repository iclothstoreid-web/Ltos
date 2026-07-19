// Single source of truth for every LTOS application's base URL. This is the
// ONLY file allowed to read process.env for these values (Infrastructure
// Refactor sprint — eliminate hardcoded application URLs). Everywhere else
// must import APP_URLS instead of touching process.env or browser origin
// (window.location/document.location are forbidden — LTOS is multi-domain).
//
// Fallback is always localhost, never a production domain — production
// values are supplied via Vercel Environment Variables per app/domain.
const DEV_FALLBACK = 'http://localhost:3000'

function resolveAppUrl(value: string | undefined): string {
  return value && value.length > 0 ? value : DEV_FALLBACK
}

export const APP_URLS = {
  owner: resolveAppUrl(process.env.NEXT_PUBLIC_OWNER_URL),
  fitter: resolveAppUrl(process.env.NEXT_PUBLIC_FITTER_URL),
  inventory: resolveAppUrl(process.env.NEXT_PUBLIC_INVENTORY_URL),
  production: resolveAppUrl(process.env.NEXT_PUBLIC_PRODUCTION_URL),
  journey: resolveAppUrl(process.env.NEXT_PUBLIC_JOURNEY_URL),
  tracking: resolveAppUrl(process.env.NEXT_PUBLIC_TRACKING_URL),
} as const
