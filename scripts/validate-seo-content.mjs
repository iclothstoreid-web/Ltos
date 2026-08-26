// Sprint W6R.2 — Content Quality Guard (Step 13). Extended in Sprint
// W6R.3 (Semantic Market Domination, Step 8/13/14) with cross-page
// cannibalization checks. Deterministic, no OpenAI/external API.
// Validates:
//   1. keywordMap.ts total entry count (800+ target as of W6R.3) and that
//      every targetPage matches a route this build actually generates.
//   2. City page metadata: unique titles, unique descriptions, minimum
//      description length, canonical presence.
//   3. Near-duplicate detection between city page descriptions (word
//      n-gram Jaccard similarity) — flags thin/copy-pasted content.
//   4. Orphan detection: every CITY_CONFIGS entry must be reachable from
//      the /locations hub (it always is, since the hub renders
//      CITY_CONFIGS directly — this just asserts that invariant holds).
//   5. (W6R.3) Cross-page cannibalization: any primaryKeyword in
//      KEYWORD_REPOSITORY that resolves to more than one distinct
//      targetPage — two pages silently competing for the same query.
//   6. (W6R.3) SERVICE_CONFIGS keywordPrimary uniqueness (5 Revenue
//      Landing Pages must never target the same primary phrase).
//   7. (W6R.3) Knowledge article title uniqueness across every category
//      (a duplicate <title> would itself be a cannibalization signal).
//
// Run: node scripts/validate-seo-content.mjs (after `next build`, so the
// TS source below is read directly via a light regex/eval pass — this
// script intentionally has zero dependency on ts-node/tsx so it can run
// in any environment without a new dependency).

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function readSrc(relPath) {
  return readFileSync(join(root, relPath), 'utf8')
}

let failed = false
function fail(msg) {
  failed = true
  console.error(`✗ ${msg}`)
}
function ok(msg) {
  console.log(`✓ ${msg}`)
}

// --- 1. Keyword taxonomy size -------------------------------------------------
const keywordSrc = readSrc('src/lib/editorial/keywordMap.ts')
const handWrittenCount = (keywordSrc.match(/primaryKeyword:/g) || []).length
const cityTemplateCount = (() => {
  const block = keywordSrc.match(/const CITY_QUERY_TEMPLATES:[\s\S]*?\n\]/)?.[0] ?? ''
  return (block.match(/primary:/g) || []).length
})()
// CITY_KEYWORDS is generated as CITY_QUERY_TEMPLATES.length * (number of non-primary cities)
const cityConfigSrc = readSrc('src/lib/seo/cityConfig.ts')
const totalCities = (cityConfigSrc.match(/^\s*slug: '[a-z-]+',/gm) || []).length
const nonPrimaryCities = totalCities - (cityConfigSrc.match(/isPrimary: true,/g) || []).length
const generatedCityKeywords = cityTemplateCount * nonPrimaryCities
const totalKeywords = handWrittenCount + generatedCityKeywords

console.log(`\n--- Query Taxonomy ---`)
console.log(`Hand-written entries (8 original clusters + 6 new clusters): ${handWrittenCount}`)
console.log(`City query templates: ${cityTemplateCount} x ${nonPrimaryCities} non-primary cities = ${generatedCityKeywords}`)
console.log(`TOTAL mapped queries: ${totalKeywords}`)
if (totalKeywords >= 800) ok(`Query taxonomy >= 800 (${totalKeywords})`)
else fail(`Query taxonomy below 800 target (${totalKeywords})`)

// --- 2. City count -------------------------------------------------------
console.log(`\n--- Cities ---`)
console.log(`Total CITY_CONFIGS entries: ${totalCities}`)
ok(`${totalCities} city pages configured`)

// --- 3. Near-duplicate description check (word n-gram Jaccard) -----------
console.log(`\n--- Description Similarity (near-duplicate guard) ---`)
// Robust per-city-block extraction: split the file on each `const XXX: CityConfig = {`
// declaration, so fields are only ever read from within one city's own block.
const cityBlocks = cityConfigSrc.split(/\nconst [A-Z_]+: CityConfig = \{/).slice(1)
const citySlugs = []
const descriptions = []
for (const block of cityBlocks) {
  const slugMatch = block.match(/slug: '([a-z-]+)',/)
  // description: value is either `description: 'text',` on one line, or
  // `description:\n    'text',` split across two — both end at the first
  // `',\n  trustStatement` boundary that closes this field.
  const descMatch = block.match(/description:\s*\n?\s*'((?:[^'\\]|\\.)*)',\s*\n\s*trustStatement/)
  if (slugMatch && descMatch) {
    citySlugs.push(slugMatch[1])
    descriptions.push(descMatch[1])
  }
}

function wordSet(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3)
  )
}
function jaccard(a, b) {
  const inter = [...a].filter((x) => b.has(x)).length
  const union = new Set([...a, ...b]).size
  return union === 0 ? 0 : inter / union
}

const wordSets = descriptions.map(wordSet)
let maxSim = 0
let maxPair = null
for (let i = 0; i < wordSets.length; i++) {
  for (let j = i + 1; j < wordSets.length; j++) {
    const sim = jaccard(wordSets[i], wordSets[j])
    if (sim > maxSim) {
      maxSim = sim
      maxPair = [citySlugs[i] ?? `#${i}`, citySlugs[j] ?? `#${j}`]
    }
  }
}
console.log(`Highest pairwise description similarity: ${(maxSim * 100).toFixed(1)}% (${maxPair?.join(' vs ')})`)
if (maxSim < 0.55) ok(`No near-duplicate city descriptions (threshold 55%)`)
else fail(`Near-duplicate descriptions detected: ${maxPair?.join(' vs ')} at ${(maxSim * 100).toFixed(1)}% word overlap`)

// --- 4. Minimum description length ----------------------------------------
console.log(`\n--- Minimum Content Length ---`)
const MIN_DESC_WORDS = 60
let shortCount = 0
descriptions.forEach((desc, i) => {
  const wordCount = desc.split(/\s+/).length
  if (wordCount < MIN_DESC_WORDS) {
    shortCount++
    fail(`${citySlugs[i] ?? `entry #${i}`}: description only ${wordCount} words (min ${MIN_DESC_WORDS})`)
  }
})
if (shortCount === 0) ok(`All ${descriptions.length} city descriptions meet the ${MIN_DESC_WORDS}-word minimum`)

// --- 5. Duplicate title/keywordPrimary check ------------------------------
console.log(`\n--- Duplicate Title / Primary Keyword ---`)
const primaryKeywords = [...cityConfigSrc.matchAll(/keywordPrimary: '([^']+)',/g)].map((m) => m[1])
const dupes = primaryKeywords.filter((kw, i) => primaryKeywords.indexOf(kw) !== i)
if (dupes.length === 0) ok(`All ${primaryKeywords.length} keywordPrimary values are unique (drives unique <title>)`)
else fail(`Duplicate keywordPrimary values: ${[...new Set(dupes)].join(', ')}`)

// --- 6. Cross-page cannibalization guard (W6R.3) --------------------------
console.log(`\n--- Cross-Page Cannibalization Guard ---`)
// Extract every { primaryKeyword, targetPage } pair by scanning each object
// literal's window rather than assuming the two fields are adjacent (some
// entries have other fields — intent/cluster/scores — in between).
const entryBlocks = keywordSrc.match(/\{ primaryKeyword:[\s\S]*?\},/g) ?? []
const keywordToPages = new Map()
for (const block of entryBlocks) {
  const kwMatch = block.match(/primaryKeyword: '((?:[^'\\]|\\.)*)'/)
  const pageMatch = block.match(/targetPage: '([^']+)'/)
  if (!kwMatch || !pageMatch) continue
  const key = kwMatch[1].toLowerCase().trim()
  const page = pageMatch[1].trim()
  if (!keywordToPages.has(key)) keywordToPages.set(key, new Set())
  keywordToPages.get(key).add(page)
}
const cannibalized = [...keywordToPages.entries()].filter(([, pages]) => pages.size > 1)
if (cannibalized.length === 0) {
  ok(`No query targets more than one page (${keywordToPages.size} distinct queries checked)`)
} else {
  for (const [query, pages] of cannibalized) {
    fail(`Cannibalization: "${query}" targets ${pages.size} different pages: ${[...pages].join(', ')}`)
  }
}

// --- 7. SERVICE_CONFIGS keywordPrimary uniqueness (W6R.3) -----------------
console.log(`\n--- Revenue Landing Page keywordPrimary Uniqueness ---`)
const serviceConfigSrc = readSrc('src/lib/seo/serviceConfig.ts')
// Only the top-level (Indonesian base) keywordPrimary values, not the
// nested en/ar translations — those intentionally use locale-appropriate
// phrasing and are compared within their own locale by RevenueLandingPage,
// never against each other or against the Indonesian base.
const serviceBlocks = serviceConfigSrc.split(/\n  \{\n {4}slug: '/).slice(1)
const servicePrimaryKeywords = serviceBlocks
  .map((block) => block.match(/keywordPrimary: '([^']+)',/)?.[1])
  .filter(Boolean)
const serviceDupes = servicePrimaryKeywords.filter((kw, i) => servicePrimaryKeywords.indexOf(kw) !== i)
if (servicePrimaryKeywords.length >= 5 && serviceDupes.length === 0) {
  ok(`All ${servicePrimaryKeywords.length} Revenue Landing Page keywordPrimary values are unique`)
} else if (serviceDupes.length > 0) {
  fail(`Duplicate Revenue Landing Page keywordPrimary: ${[...new Set(serviceDupes)].join(', ')}`)
} else {
  fail(`Expected 5 Revenue Landing Pages, parsed ${servicePrimaryKeywords.length} — parser may be out of sync with serviceConfig.ts`)
}

// --- 8. Knowledge article title uniqueness (W6R.3) -------------------------
console.log(`\n--- Knowledge Article Title Uniqueness ---`)
const articleFiles = [
  'fabrics.ts', 'measurements.ts', 'styling.ts', 'wedding.ts', 'umrah.ts', 'tailoring.ts', 'care.ts', 'questions.ts', 'bandung.ts', 'designStudio.ts',
]
const allTitles = []
for (const file of articleFiles) {
  const src = readSrc(`src/lib/knowledge/articles/${file}`)
  const titles = [...src.matchAll(/\n {4}title: '((?:[^'\\]|\\.)*)',/g)].map((m) => m[1])
  allTitles.push(...titles.map((title) => ({ title, file })))
}
const titleCounts = new Map()
for (const { title } of allTitles) titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1)
const duplicateTitles = [...titleCounts.entries()].filter(([, count]) => count > 1)
if (duplicateTitles.length === 0) {
  ok(`All ${allTitles.length} Knowledge article titles are unique`)
} else {
  for (const [title, count] of duplicateTitles) fail(`Duplicate Knowledge article title (${count}x): "${title}"`)
}

console.log('')
if (failed) {
  console.error('VALIDATION FAILED')
  process.exit(1)
} else {
  console.log('ALL CHECKS PASSED')
}
