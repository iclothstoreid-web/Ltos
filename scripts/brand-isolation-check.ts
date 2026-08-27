// Single-Brand Guard — `npm run brand:check`.
//
// LTOS is a single-brand system: Local Tailor. Tarda was removed in
// "refactor: remove Tarda and restore Local Tailor single brand". This
// guard fails the build if runtime / public / search-facing code
// reintroduces Tarda in any form.
//
// Static-analysis only (no server, no network, no OpenAI). Mirrors
// scripts/seo-validate.ts's shape (CheckResult list, exit 1 on any FAIL),
// runs under `tsx` like the other scripts.
//
// What it enforces:
//   1. The brand layer is collapsed: no TARDA_CONFIG / ALL_BRANDS export,
//      no src/lib/brand/resolver.ts, and BRAND / LOCAL_TAILOR_CONFIG are
//      Local Tailor with canonical localtailor.id.
//   2. LOCAL_TAILOR_CONFIG.assets point only at existing Local Tailor
//      files, none containing "Tarda"; the removed Tarda assets
//      (tarda-home.svg, og-image.png, tarda*.json) are gone.
//   3. The file-based Next.js icons (src/app/icon.svg / favicon.ico /
//      apple-icon.png) exist and icon.svg has no "Tarda"; every
//      public/brand SVG is Tarda-label-free.
//   4. The one PWA manifest is the conventional public/manifest.json and
//      is Local Tailor; manifest-tarda.json / manifest-local-tailor.json
//      are gone.
//   5. Search-engine identity constants (PRIMARY_ENTITY, CITY_BUSINESS,
//      FABRIC_SITE_ORIGIN) are Local Tailor / Bandung / localtailor.id.
//   6. No runtime "tarda" token (string literal, JSX, identifier, or
//      import path) anywhere under the runtime/public/search surface —
//      only comments and the one DOCUMENTED_LEGACY redirect source in
//      next.config.js are allowed.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { BRAND, LOCAL_TAILOR_CONFIG } from '../src/lib/brand/config'
import * as brandConfigModule from '../src/lib/brand/config'
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

// ---------------------------------------------------------------------------
// 1. The brand layer is collapsed to a single brand
// ---------------------------------------------------------------------------
check('src/lib/brand/config.ts has no TARDA_CONFIG export', !('TARDA_CONFIG' in brandConfigModule))
check('src/lib/brand/config.ts has no ALL_BRANDS export', !('ALL_BRANDS' in brandConfigModule))
check('src/lib/brand/resolver.ts is deleted (host no longer selects a brand)', !existsSync(path.join(ROOT, 'src/lib/brand/resolver.ts')))
check('BRAND.id === "local-tailor"', BRAND.id === 'local-tailor', BRAND.id)
check('BRAND.canonicalDomain === "localtailor.id"', BRAND.canonicalDomain === 'localtailor.id', BRAND.canonicalDomain)
check('BRAND / LOCAL_TAILOR_CONFIG are the same object', BRAND === LOCAL_TAILOR_CONFIG)
check(
  'BRAND.domains are the three supported Local Tailor hosts',
  ['localtailor.id', 'www.localtailor.id', 'ltos.vercel.app'].every((d) => BRAND.domains.includes(d)) &&
    !BRAND.domains.some((d) => /tarda/i.test(d)),
  BRAND.domains.join(', ')
)

// ---------------------------------------------------------------------------
// 2. LOCAL_TAILOR_CONFIG assets + removed Tarda assets
// ---------------------------------------------------------------------------
for (const [key, value] of Object.entries(LOCAL_TAILOR_CONFIG.assets ?? {})) {
  if (typeof value !== 'string') continue
  check(`assets.${key} has no "tarda" in its path`, !/tarda/i.test(value), value)
  check(`assets.${key} is not the old shared og-image.png`, value !== '/brand/og-image.png', value)
  const inPublic = path.join(ROOT, 'public', value.replace(/^\//, ''))
  const inAppDir = path.join(ROOT, 'src/app', value.replace(/^\//, ''))
  const onDisk = existsSync(inPublic) ? inPublic : inAppDir
  if (/\.(svg|png|json)$/.test(value)) {
    check(`assets.${key} exists on disk`, existsSync(onDisk), onDisk)
    if (existsSync(onDisk) && value.endsWith('.svg')) {
      check(`assets.${key} SVG contains no "Tarda"`, !/tarda/i.test(readFileSync(onDisk, 'utf8')))
    }
  }
}
for (const gone of ['public/brand/tarda-home.svg', 'public/brand/tarda.svg', 'public/brand/og-image.png', 'public/manifest-tarda.json', 'public/manifest-local-tailor.json']) {
  check(`${gone} is removed`, !existsSync(path.join(ROOT, gone)))
}

// ---------------------------------------------------------------------------
// 3. File-based Next.js icons + public/brand SVGs
// ---------------------------------------------------------------------------
for (const icon of ['src/app/icon.svg', 'src/app/favicon.ico', 'src/app/apple-icon.png']) {
  check(`${icon} exists`, existsSync(path.join(ROOT, icon)))
}
const iconSvg = path.join(ROOT, 'src/app/icon.svg')
if (existsSync(iconSvg)) check('src/app/icon.svg contains no "Tarda"', !/tarda/i.test(readFileSync(iconSvg, 'utf8')))

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
  check(`${rel} contains no "Tarda"`, !/tarda/i.test(readFileSync(svg, 'utf8')))
}

// ---------------------------------------------------------------------------
// 4. The single PWA manifest lives at the conventional public/manifest.json
// ---------------------------------------------------------------------------
const ltManifestPath = path.join(ROOT, 'public/manifest.json')
check('public/manifest.json exists (the one PWA manifest)', existsSync(ltManifestPath))
if (existsSync(ltManifestPath)) {
  const raw = readFileSync(ltManifestPath, 'utf8')
  check('manifest.json has no "Tarda"', !/tarda/i.test(raw))
  check('manifest.json has no "Bogor"', !/bogor/i.test(raw))
  const m = JSON.parse(raw) as { name?: string; icons?: { src: string }[] }
  check('manifest.json name is "Local Tailor …"', /local tailor/i.test(m.name ?? ''), m.name)
  for (const ic of m.icons ?? []) {
    check(
      `manifest icon ${ic.src} exists`,
      existsSync(path.join(ROOT, 'public', ic.src.replace(/^\//, ''))) || existsSync(path.join(ROOT, 'src/app', ic.src.replace(/^\//, ''))),
      ic.src
    )
  }
}

// ---------------------------------------------------------------------------
// 5. Search-engine identity constants
// ---------------------------------------------------------------------------
check('PRIMARY_ENTITY.name is "Local Tailor"', PRIMARY_ENTITY.name === 'Local Tailor', PRIMARY_ENTITY.name)
check('PRIMARY_ENTITY.addressLocality is not Bogor', !/bogor/i.test(PRIMARY_ENTITY.addressLocality), PRIMARY_ENTITY.addressLocality)
check('PRIMARY_ENTITY has no "tarda"', !/tarda/i.test(JSON.stringify(PRIMARY_ENTITY)))
check('CITY_BUSINESS.name is a Local Tailor name', /local tailor/i.test(CITY_BUSINESS.name) && !/tarda/i.test(CITY_BUSINESS.name), CITY_BUSINESS.name)
check('CITY_BUSINESS locality/address is Bandung, not Bogor', /bandung/i.test(CITY_BUSINESS.addressLocality) && !/bogor/i.test(CITY_BUSINESS.streetAddress), `${CITY_BUSINESS.addressLocality} / ${CITY_BUSINESS.streetAddress}`)
check('FABRIC_SITE_ORIGIN is localtailor.id', /^https:\/\/(www\.)?localtailor\.id$/.test(FABRIC_SITE_ORIGIN) && !/tarda/i.test(FABRIC_SITE_ORIGIN), FABRIC_SITE_ORIGIN)

// ---------------------------------------------------------------------------
// 6. No runtime "tarda" token anywhere under the runtime/public surface
// ---------------------------------------------------------------------------
// Directories whose .ts/.tsx/.js/.json files render into, or shape, a
// public or authenticated runtime surface.
const RUNTIME_ROOTS = ['src', 'messages']
const RUNTIME_FILES = ['next.config.js', 'middleware.ts', 'tailwind.config.ts']
// The ONLY place a "tarda" token may appear outside a comment: a documented
// legacy inbound 301 redirect SOURCE (old public URL slug -> current Local
// Tailor page). It is never canonical, never in the sitemap, never linked.
const DOCUMENTED_LEGACY: Record<string, RegExp[]> = {
  'next.config.js': [/apa-itu-design-studio-tarda/],
}
// This guard script itself necessarily contains the word.
const SELF = 'scripts/brand-isolation-check.ts'

// Strip line/block-comment content so only real code/strings are scanned.
function stripComments(src: string): string[] {
  const noBlock = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  return noBlock.split('\n').map((line) => line.replace(/\r$/, '').replace(/\/\/.*/, ''))
}

function scanRuntimeFile(rel: string) {
  const abs = path.join(ROOT, rel)
  if (!existsSync(abs)) return
  if (rel.split(path.sep).join('/') === SELF) return
  const allowed = DOCUMENTED_LEGACY[rel.split(path.sep).join('/')] ?? []
  stripComments(readFileSync(abs, 'utf8')).forEach((codeLine, i) => {
    if (!/tarda/i.test(codeLine)) return
    if (allowed.some((re) => re.test(codeLine))) return
    check(`${rel.split(path.sep).join('/')}:${i + 1} — runtime "tarda" token`, false, codeLine.trim().slice(0, 120))
  })
}

function walkRuntime(rel: string) {
  const abs = path.join(ROOT, rel)
  if (!existsSync(abs)) return
  for (const entry of readdirSync(abs)) {
    if (entry === 'node_modules' || entry === '.next') continue
    const r = path.join(rel, entry)
    if (statSync(path.join(ROOT, r)).isDirectory()) walkRuntime(r)
    else if (/\.(ts|tsx|js|jsx|json)$/.test(entry)) scanRuntimeFile(r)
  }
}
RUNTIME_ROOTS.forEach(walkRuntime)
RUNTIME_FILES.forEach(scanRuntimeFile)

// ---------------------------------------------------------------------------
const failed = results.filter((r) => !r.pass)
console.log(`\nSingle-Brand Guard — ${results.length - failed.length} passed, ${failed.length} failed\n`)
for (const r of results) console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`)
if (failed.length > 0) {
  console.error(`\n${failed.length} check(s) failed — Tarda has re-entered a Local Tailor runtime/public surface.`)
  process.exit(1)
}
console.log('\nLTOS is single-brand Local Tailor: no Tarda in any runtime/public/search surface.')
