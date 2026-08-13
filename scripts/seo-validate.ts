// SEO / AI-Discoverability Validation — `npm run seo:validate`.
//
// Sprint W7-12. A static-analysis utility, not a live crawler: it doesn't
// spin up a server or hit real URLs (no OpenAI/network calls, per the W7
// brief's own "JANGAN GUNAKAN API OPENAI" instruction). It checks two
// things that can be verified from source alone:
//
//   1. Schema builders (src/lib/seo/schema.ts) — every builder is called
//      with representative sample data and the result is checked for the
//      required schema.org fields (@context/@type + whatever that type
//      requires). This catches a builder returning a malformed shape
//      before it ever reaches a page.
//   2. Every public marketing page.tsx (the routes robots.ts leaves
//      crawlable — staff/internal routes are intentionally excluded) is
//      scanned for a `metadata` export or `generateMetadata` function, and
//      for its <h1> count. The h1 check is a heuristic: content coming
//      from a child component (not the page.tsx source itself) won't be
//      seen, so a 0-count result here is a prompt to check manually, not
//      an automatic failure — noted in the report output.
//
// Usage: npm run seo:validate

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  breadcrumbSchema,
  productSchema,
  serviceSchema,
  faqSchema,
  howToSchema,
  personSchema,
  articleSchema,
} from '../src/lib/seo/schema'
import { CITY_CONFIGS } from '../src/lib/seo/cityConfig'
import { buildLocationLocalBusinessSchema, buildLocationsHubLocalBusinessSchema } from '../src/lib/seo/localBusiness'

const APP_DIR = path.join(__dirname, '..', 'src', 'app')

// Mirrors src/app/robots.ts's disallow list — internal/staff route
// prefixes are out of scope for a public SEO audit.
const EXCLUDED_PREFIXES = [
  'owner',
  'workspace',
  'inventory',
  'production',
  'fitter',
  'command-center',
  'login',
  'api',
  'access-denied',
  // Not marketing pages: customer_token-gated per-order tracking flow, same
  // "deliberately absent from role gating" status as /production (see
  // src/middleware.ts's ROUTE_RULES comment). Each URL is a private link
  // for one customer, not content meant to rank in search.
  'journey',
]

interface CheckResult {
  name: string
  pass: boolean
  detail?: string
}

const results: CheckResult[] = []

function check(name: string, pass: boolean, detail?: string) {
  results.push({ name, pass, detail })
}

function hasField(obj: Record<string, unknown>, field: string): boolean {
  return field in obj && obj[field] !== undefined && obj[field] !== null
}

// ---------------------------------------------------------------------------
// 1. Schema builder shape checks
// ---------------------------------------------------------------------------

function validateSchemaBuilders() {
  const org = organizationSchema()
  check('organizationSchema() has @context/@type/name/url', hasField(org, '@context') && hasField(org, '@type') && hasField(org, 'name') && hasField(org, 'url'))

  const lb = localBusinessSchema()
  check('localBusinessSchema() has @type=LocalBusiness + address', lb['@type'] === 'LocalBusiness' && hasField(lb, 'address'))

  const ws = websiteSchema()
  check('websiteSchema() has @type=WebSite + url', ws['@type'] === 'WebSite' && hasField(ws, 'url'))

  const bc = breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Test', path: '/test' }])
  const itemListElement = bc.itemListElement as unknown[]
  check('breadcrumbSchema() itemListElement matches input length', Array.isArray(itemListElement) && itemListElement.length === 2)

  const product = productSchema({ name: 'Test Product', description: 'Test', url: 'https://example.com/test' })
  check('productSchema() has offers + brand', hasField(product, 'offers') && hasField(product, 'brand'))

  const service = serviceSchema({ name: 'Test Service', description: 'Test', url: 'https://example.com/test' })
  check('serviceSchema() has provider', hasField(service, 'provider'))

  const faq = faqSchema([{ question: 'Q?', answer: 'A.' }])
  check('faqSchema() with items returns FAQPage', faq !== null && faq['@type'] === 'FAQPage')
  check('faqSchema() with no items returns null', faqSchema([]) === null)

  const howTo = howToSchema({ name: 'Test HowTo', description: 'Test', steps: [{ name: 'Step 1', text: 'Do this.' }] })
  const steps = howTo.step as unknown[]
  check('howToSchema() step array matches input length', Array.isArray(steps) && steps.length === 1)

  const person = personSchema({ name: 'Test Person', url: 'https://example.com/authors/test' })
  check('personSchema() has worksFor', hasField(person, 'worksFor'))

  const article = articleSchema({ headline: 'Test', description: 'Test', url: 'https://example.com/test', datePublished: '2026-01-01' })
  check('articleSchema() has mainEntityOfPage', hasField(article, 'mainEntityOfPage'))
}

// ---------------------------------------------------------------------------
// 1b. Sprint W8-B §2 — real per-city JSON-LD, empty-field validation.
// Unlike section 1 above (sample data against the generic builders), this
// runs the ACTUAL cityConfig.ts data through the ACTUAL page-level schema
// builders (buildLocationLocalBusinessSchema et al.) and recursively checks
// for empty strings/arrays — the concrete "tidak ada field kosong"
// requirement, not just a shape check.
// ---------------------------------------------------------------------------

function findEmptyFields(value: unknown, path: string): string[] {
  const empties: string[] = []

  if (typeof value === 'string' && value.trim() === '') {
    empties.push(path)
  } else if (value === null) {
    empties.push(path)
  } else if (Array.isArray(value)) {
    if (value.length === 0) empties.push(path)
    else value.forEach((item, i) => empties.push(...findEmptyFields(item, `${path}[${i}]`)))
  } else if (typeof value === 'object' && value !== undefined) {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      empties.push(...findEmptyFields(nested, `${path}.${key}`))
    }
  }

  return empties
}

function validateRealCitySchema() {
  for (const city of CITY_CONFIGS) {
    const localBusiness = buildLocationLocalBusinessSchema(city)
    const emptiesLb = findEmptyFields(localBusiness, `localBusiness(${city.slug})`)
    check(`/locations/${city.slug} — Tailor schema has no empty fields`, emptiesLb.length === 0, emptiesLb.join(', '))

    const faq = faqSchema(city.faq)
    const emptiesFaq = faq ? findEmptyFields(faq, `faq(${city.slug})`) : []
    check(`/locations/${city.slug} — FAQPage schema has no empty fields`, emptiesFaq.length === 0, emptiesFaq.join(', '))

    const breadcrumb = breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Locations', path: '/locations' },
      { name: city.city, path: `/locations/${city.slug}` },
    ])
    const emptiesBc = findEmptyFields(breadcrumb, `breadcrumb(${city.slug})`)
    check(`/locations/${city.slug} — BreadcrumbList schema has no empty fields`, emptiesBc.length === 0, emptiesBc.join(', '))
  }

  const hub = buildLocationsHubLocalBusinessSchema(CITY_CONFIGS)
  const emptiesHub = findEmptyFields(hub, 'locationsHub')
  check('/locations — hub Tailor schema has no empty fields', emptiesHub.length === 0, emptiesHub.join(', '))
}

// ---------------------------------------------------------------------------
// 2. Metadata + heading audit over public page.tsx files
// ---------------------------------------------------------------------------

function findPublicPageFiles(dir: string, routeSegments: string[] = []): { file: string; route: string }[] {
  const found: { file: string; route: string }[] = []
  const entries = readdirSync(dir)

  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      const segment = entry
      // Skip route groups/parallel routes markers and excluded prefixes only
      // at the top level (routeSegments.length === 0 means we're listing
      // src/app's direct children).
      if (routeSegments.length === 0 && EXCLUDED_PREFIXES.includes(segment)) continue
      found.push(...findPublicPageFiles(fullPath, [...routeSegments, segment]))
    } else if (entry === 'page.tsx') {
      found.push({ file: fullPath, route: '/' + routeSegments.join('/') })
    }
  }

  return found
}

function auditPublicPages() {
  if (!existsSync(APP_DIR)) {
    check('src/app directory exists', false)
    return
  }

  const pages = findPublicPageFiles(APP_DIR)
  check(`Discovered public page.tsx routes`, pages.length > 0, `${pages.length} routes scanned`)

  for (const { file, route } of pages) {
    const source = readFileSync(file, 'utf-8')
    const hasMetadataExport = /export\s+const\s+metadata\s*[:=]/.test(source)
    const hasGenerateMetadata = /export\s+(async\s+)?function\s+generateMetadata/.test(source)
    check(`${route || '/'} — has metadata export or generateMetadata()`, hasMetadataExport || hasGenerateMetadata, file)

    const h1Count = (source.match(/<h1[\s>]/g) ?? []).length
    if (h1Count > 1) {
      check(`${route || '/'} — at most one <h1> in page.tsx source`, false, `found ${h1Count}`)
    } else if (h1Count === 0) {
      // Heuristic-only: an h1 rendered by a child component won't show up
      // here. Recorded as informational, not a failure.
      check(`${route || '/'} — <h1> present in page.tsx source (informational)`, true, 'not found in this file — verify child components render one')
    } else {
      check(`${route || '/'} — exactly one <h1> in page.tsx source`, true)
    }
  }
}

// ---------------------------------------------------------------------------

function main() {
  validateSchemaBuilders()
  validateRealCitySchema()
  auditPublicPages()

  const failed = results.filter((r) => !r.pass)
  const passed = results.filter((r) => r.pass)

  console.log(`\nSEO Validation — ${passed.length} passed, ${failed.length} failed\n`)

  for (const r of results) {
    const marker = r.pass ? 'PASS' : 'FAIL'
    console.log(`[${marker}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`)
  }

  if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed.`)
    process.exit(1)
  }

  console.log('\nAll checks passed.')
}

main()
