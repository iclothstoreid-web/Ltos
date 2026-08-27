// Brand Isolation Guard — `npm run brand:check`.
//
// Static-analysis only (no server, no network, no OpenAI). Fails the build
// if TARDA brand identity could leak onto the Local Tailor public site.
// Mirrors scripts/seo-validate.ts's shape (CheckResult list, exit 1 on any
// FAIL). Runs in CI-friendly `tsx` like the other scripts.
//
// What it enforces:
//   1. Host -> brand resolution: every Local Tailor host, AND an
//      unidentified (no-host) state, resolves to `local-tailor`, never
//      `tarda`. tarda.vercel.app still resolves to `tarda`.
//   2. LOCAL_TAILOR_CONFIG.assets never point at a TARDA asset
//      (og-image.png / tarda-home.svg / tarda.svg) and every asset file
//      exists on disk with no "Tarda" string inside.
//   3. The file-based Next.js icons (src/app/icon.svg / favicon.ico /
//      apple-icon.png) exist, and icon.svg contains no "Tarda".
//   4. public/manifest-local-tailor.json says "Local Tailor" (not "Tarda"
//      / "Bogor") and references only files that exist.
//   5. The search-engine identity constants every canonical / OG / JSON-LD
//      builder falls back to (PRIMARY_ENTITY, CITY_BUSINESS, FABRIC_SITE_
//      ORIGIN) are Local Tailor / Bandung / localtailor.id — never Tarda,
//      and never Bogor as the business's own locality.
//   6. The public marketing + search source surface (incl. sitemap routes
//      and next.config.js) contains no ungated "Tarda" / "tarda.vercel.app"
//      / "Tarda, Bogor" reference. Lines that are legitimately TARDA-only
//      (a `brand.id === 'tarda'` branch, a TARDA_-prefixed constant, the
//      TARDA_CONFIG object, or a comment) are allowed.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { getBrandFromHost } from '../src/lib/brand/resolver'
import { LOCAL_TAILOR_CONFIG, TARDA_CONFIG } from '../src/lib/brand/config'
import { PRIMARY_ENTITY } from '../src/lib/seo/entities'
import { CITY_BUSINESS } from '../src/lib/seo/cityConfig'
import { FABRIC_SITE_ORIGIN } from '../src/lib/materials/seo'

const ROOT = path.join(__dirname, '..')

interface CheckResult {
  name: string
  pass: boolean
  detail?: string
}
const results: CheckResult[] = []
const check = (name: string, pass: boolean, detail?: string) => results.push({ name, pass, detail })

const TARDA_ASSET_PATHS = ['/brand/og-image.png', '/brand/tarda-home.svg', '/brand/tarda.svg']

// ---------------------------------------------------------------------------
// 1. Host -> brand resolution
// ---------------------------------------------------------------------------
for (const host of ['localtailor.id', 'www.localtailor.id', 'ltos.vercel.app', 'localtailor.id:443', undefined]) {
  check(
    `getBrandFromHost(${host === undefined ? '<no host>' : host}) === local-tailor`,
    getBrandFromHost(host as string | undefined).id === 'local-tailor'
  )
}
check('getBrandFromHost("tarda.vercel.app") === tarda (TARDA still isolated to its own host)', getBrandFromHost('tarda.vercel.app').id === 'tarda')

// ---------------------------------------------------------------------------
// 2. LOCAL_TAILOR_CONFIG assets
// ---------------------------------------------------------------------------
for (const [key, value] of Object.entries(LOCAL_TAILOR_CONFIG.assets ?? {})) {
  if (typeof value !== 'string') continue
  check(`LOCAL_TAILOR_CONFIG.assets.${key} is not a TARDA asset`, !TARDA_ASSET_PATHS.includes(value), value)
  check(`LOCAL_TAILOR_CONFIG.assets.${key} has no "tarda" in its path`, !/tarda/i.test(value), value)
  // A root-relative asset path can be served either from public/ or from
  // src/app/ (the Next.js file-based icon convention — src/app/icon.svg
  // etc. are exposed at the site root just like public/ files).
  const inPublic = path.join(ROOT, 'public', value.replace(/^\//, ''))
  const inAppDir = path.join(ROOT, 'src/app', value.replace(/^\//, ''))
  const onDisk = existsSync(inPublic) ? inPublic : inAppDir
  if (value.endsWith('.svg') || value.endsWith('.png') || value.endsWith('.json')) {
    check(`LOCAL_TAILOR_CONFIG.assets.${key} exists on disk`, existsSync(onDisk), onDisk)
    if (existsSync(onDisk) && value.endsWith('.svg')) {
      check(`LOCAL_TAILOR_CONFIG.assets.${key} SVG contains no "Tarda"`, !/tarda/i.test(readFileSync(onDisk, 'utf8')))
    }
  }
}
check('TARDA_CONFIG is still isolated to tarda.vercel.app', TARDA_CONFIG.domains.length === 1 && TARDA_CONFIG.domains[0] === 'tarda.vercel.app')

// ---------------------------------------------------------------------------
// 3. File-based Next.js icons
// ---------------------------------------------------------------------------
for (const icon of ['src/app/icon.svg', 'src/app/favicon.ico', 'src/app/apple-icon.png']) {
  check(`${icon} exists`, existsSync(path.join(ROOT, icon)))
}
const iconSvg = path.join(ROOT, 'src/app/icon.svg')
if (existsSync(iconSvg)) check('src/app/icon.svg contains no "Tarda"', !/tarda/i.test(readFileSync(iconSvg, 'utf8')))

// Every SVG under public/brand/ that Local Tailor can serve/inject must be
// Tarda-label-free (tarda-home.svg / og-image.png are TARDA-only art with
// no accessible "Tarda" string — still checked).
const brandDir = path.join(ROOT, 'public/brand')
function walkSvgs(dir: string): string[] {
  return readdirSync(dir).flatMap((e) => {
    const p = path.join(dir, e)
    if (statSync(p).isDirectory()) return walkSvgs(p)
    return p.endsWith('.svg') ? [p] : []
  })
}
for (const svg of walkSvgs(brandDir)) {
  const rel = path.relative(ROOT, svg)
  // tarda-home.svg is TARDA's own wordmark art, referenced only from the
  // brand.id === 'tarda' path — allowed to exist, checked to carry no
  // literal "Tarda" text/label a crawler could read.
  check(`${rel} carries no readable "Tarda" label`, !/aria-label="[^"]*tarda[^"]*"|<title>[^<]*tarda[^<]*<\/title/i.test(readFileSync(svg, 'utf8')))
}

// ---------------------------------------------------------------------------
// 4. manifest-local-tailor.json
// ---------------------------------------------------------------------------
const ltManifestPath = path.join(ROOT, 'public/manifest-local-tailor.json')
check('public/manifest-local-tailor.json exists', existsSync(ltManifestPath))
if (existsSync(ltManifestPath)) {
  const raw = readFileSync(ltManifestPath, 'utf8')
  check('manifest-local-tailor.json has no "Tarda"', !/tarda/i.test(raw))
  check('manifest-local-tailor.json has no "Bogor"', !/bogor/i.test(raw))
  const m = JSON.parse(raw) as { name?: string; icons?: { src: string }[] }
  check('manifest-local-tailor.json name is "Local Tailor …"', /local tailor/i.test(m.name ?? ''), m.name)
  for (const ic of m.icons ?? []) {
    check(`manifest icon ${ic.src} exists`, existsSync(path.join(ROOT, 'public', ic.src.replace(/^\//, ''))) || existsSync(path.join(ROOT, 'src/app', ic.src.replace(/^\//, ''))), ic.src)
  }
}

// The bare, conventional /manifest.json path serves on ANY host (Vercel
// serves public/ files regardless of domain), so if it exists it must NOT
// carry Tarda identity — Tarda's manifest lives at /manifest-tarda.json,
// reached only via TARDA_CONFIG on its own host.
const bareManifest = path.join(ROOT, 'public/manifest.json')
check('public/manifest.json does not serve Tarda identity on the bare path', !existsSync(bareManifest) || !/tarda|bogor/i.test(readFileSync(bareManifest, 'utf8')), existsSync(bareManifest) ? 'present' : '404 (removed)')
check('TARDA_CONFIG.assets.manifest is a Tarda-scoped filename, not the bare /manifest.json', TARDA_CONFIG.assets?.manifest !== '/manifest.json', TARDA_CONFIG.assets?.manifest)

// ---------------------------------------------------------------------------
// 5. Search-engine identity constants — the business name / locality / site
//    origin that every canonical, OG, and JSON-LD builder falls back to
//    must be Local Tailor / Bandung / localtailor.id, never Tarda / Bogor.
// ---------------------------------------------------------------------------
{
  check('PRIMARY_ENTITY.name is "Local Tailor"', PRIMARY_ENTITY.name === 'Local Tailor', PRIMARY_ENTITY.name)
  check('PRIMARY_ENTITY.addressLocality is not Bogor', !/bogor/i.test(PRIMARY_ENTITY.addressLocality), PRIMARY_ENTITY.addressLocality)
  check('PRIMARY_ENTITY has no "tarda"', !/tarda/i.test(JSON.stringify(PRIMARY_ENTITY)))
  check('CITY_BUSINESS.name is a Local Tailor name (not "Tarda, Bogor")', /local tailor/i.test(CITY_BUSINESS.name) && !/tarda/i.test(CITY_BUSINESS.name), CITY_BUSINESS.name)
  check('CITY_BUSINESS business locality/address is Bandung, not Bogor', /bandung/i.test(CITY_BUSINESS.addressLocality) && !/bogor/i.test(CITY_BUSINESS.streetAddress), `${CITY_BUSINESS.addressLocality} / ${CITY_BUSINESS.streetAddress}`)
  check('FABRIC_SITE_ORIGIN is localtailor.id', /^https:\/\/(www\.)?localtailor\.id$/.test(FABRIC_SITE_ORIGIN) && !/tarda/i.test(FABRIC_SITE_ORIGIN), FABRIC_SITE_ORIGIN)
}

// ---------------------------------------------------------------------------
// 6. Public marketing + search source surface — no ungated TARDA reference
// ---------------------------------------------------------------------------
const SURFACE_DIRS = [
  'src/components/marketing',
  'src/lib/marketing',
  'src/lib/seo',
  'src/lib/materials',
  'src/lib/configurator',
  'src/lib/content',
  'src/lib/knowledge',
  'src/lib/sitemap',
  'src/app/[locale]',
  'src/app/design',
  'src/app/sitemap.xml',
  'src/app/sitemap-pages.xml',
  'src/app/sitemap-knowledge.xml',
  'src/app/sitemap-journal.xml',
  'src/app/sitemap-images.xml',
  'messages',
]
// NOTE: src/lib/brand/config.ts is deliberately NOT scanned textually — it
// is the one file that legitimately *defines* TARDA_CONFIG (footerLabel
// 'Tarda, Bogor', canonicalDomain 'tarda.vercel.app'). Its structural
// safety is asserted above (LOCAL_TAILOR_CONFIG.assets + TARDA_CONFIG.domains).
const SURFACE_FILES = ['src/app/layout.tsx', 'src/app/robots.ts', 'src/lib/brand/resolver.ts', 'next.config.js']
const FORBIDDEN = /tarda\.vercel\.app|showroom tarda|tarda workshop|tim tarda|tarda,\s*bogor/i
// A line may legitimately mention TARDA if it is a TARDA-only code path.
// A line is allowed to name TARDA if it is: a `brand.id === 'tarda'` (or
// `id === 'tarda'`) branch, the TARDA_CONFIG object, a `'tarda'` literal
// comparison, a TARDA_-prefixed constant (the repo convention for a
// Tarda-only value that is gated at its point of use), or a comment.
const ALLOWED_LINE = /brand\.id\s*===\s*['"]tarda['"]|id\s*===\s*['"]tarda['"]|TARDA_CONFIG|\bTARDA_[A-Z0-9_]+\b|tarda['"]\s*\?|'tarda'|"tarda"|getBrandFromHost\(['"]tarda|^\s*(\/\/|\*|\/\*)/

function scanFile(rel: string) {
  const abs = path.join(ROOT, rel)
  if (!existsSync(abs)) return
  const lines = readFileSync(abs, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (FORBIDDEN.test(line) && !ALLOWED_LINE.test(line)) {
      check(`${rel}:${i + 1} — no ungated TARDA reference`, false, line.trim().slice(0, 120))
    }
    // Bare "Tarda" in a rendered string literal (not a comment, not gated)
    if (/['"`][^'"`]*\bTarda\b[^'"`]*['"`]/.test(line) && !ALLOWED_LINE.test(line) && !/local tailor/i.test(line)) {
      check(`${rel}:${i + 1} — no "Tarda" in a rendered string`, false, line.trim().slice(0, 120))
    }
  })
}
function scanDir(rel: string) {
  const abs = path.join(ROOT, rel)
  if (!existsSync(abs)) return
  for (const entry of readdirSync(abs)) {
    const p = path.join(abs, entry)
    const r = path.relative(ROOT, p)
    if (statSync(p).isDirectory()) scanDir(r)
    else if (/\.(ts|tsx|json)$/.test(entry)) scanFile(r)
  }
}
SURFACE_DIRS.forEach(scanDir)
SURFACE_FILES.forEach(scanFile)

// ---------------------------------------------------------------------------
const failed = results.filter((r) => !r.pass)
console.log(`\nBrand Isolation — ${results.length - failed.length} passed, ${failed.length} failed\n`)
for (const r of results) console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`)
if (failed.length > 0) {
  console.error(`\n${failed.length} brand-isolation check(s) failed — TARDA could leak onto localtailor.id.`)
  process.exit(1)
}
console.log('\nNo TARDA leakage into the Local Tailor public surface.')
