// Render Test Runner — `npm run render:test`.
//
// Loads the Golden Dataset (render-testing/customers + render-testing/dna),
// runs every customer x DNA-scenario combination through the REAL pipeline
// (DNA Resolver -> DNA Validator -> Prompt Builder [10 fixed blocks] ->
// Render Validator), and writes a timestamped result + regression report.
// Never overwrites a previous run — every invocation gets its own timestamp
// folder/file.
//
// Prompt UAT Source of Truth realignment (this sprint) — Recipe Composer and
// the old 13-fixed-section/token-budget Prompt Builder (promptBuilder/
// compression.ts) are retired along with the production pipeline they
// exercised (see route.ts's own header comment). This runner now assembles
// the Prompt Final the same way route.ts does: each category's own
// ai_dna.referenceInstruction (Color: its `color` field), read straight off
// DNA Resolver's output, concatenated by promptBuilder/finalPrompt.ts.
//
// Standalone Node script, NOT a Next.js request handler — it builds its own
// Supabase client from env vars (@/lib/supabase/server's createClient()
// depends on next/headers cookies(), which only exists inside a request).
// Every pipeline function it calls is imported from the same modules the
// real API routes use — this script never re-implements pipeline logic.
//
// Usage:
//   npm run render:test                    # dry run, all scenarios
//   npm run render:test -- --live          # actually calls OpenAI (spends money) for scenarios that pass validation
//   npm run render:test -- --runVisionJudge # also run the AI quality judge on --live results (spends more money)

import 'dotenv/config'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

import type { MasterDataCategory, MasterDataOption } from '../src/lib/design/masterData'
import { resolveDNA } from '../src/lib/design/dnaResolver/resolver'
import type { DNAResolverInput } from '../src/lib/design/dnaResolver/types'
import type { RenderRecipe } from '../src/lib/design/renderRecipe/types'
import { buildFinalPrompt } from '../src/lib/design/promptBuilder/finalPrompt'
import { startRenderSession, finishRenderSession, generateImageWithControlledRetry } from '../src/lib/ai/renderSession/service'
import { DEFAULT_MODEL } from '../src/lib/ai/services/image'
import { validateComponentDna } from '../src/lib/design/promptValidation/dnaValidator'
import { validateRenderRequest } from '../src/lib/design/promptValidation/renderValidator'
import { getRenderRunMode, isDebugMode } from '../src/lib/design/promptValidation/debugMode'
import { composeAiAssets } from '../src/lib/design/aiAssetComposer/composer'
import { evaluateCapability } from '../src/lib/design/capabilityEngine/engine'
import { GLOBAL_BASE_HERO_IMAGE_URL } from '../src/lib/design/renderEngine/baseHero'

const ROOT = path.resolve(__dirname, '..')
const RENDER_TESTING_DIR = path.join(ROOT, 'render-testing')

// ---------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------
const args = process.argv.slice(2)
const isLive = args.includes('--live')
const runVisionJudge = args.includes('--runVisionJudge')

const runMode = getRenderRunMode()

// ---------------------------------------------------------------------
// Golden Dataset manifests
// ---------------------------------------------------------------------
interface CustomerManifestEntry {
  id: string
  label: string
  photoUrl: string | null
  note: string
}
interface DnaScenarioManifestEntry {
  id: string
  label: string
  componentSelections: { componentType: string; componentId: string | null }[]
  note: string
}

interface ScenarioRunResult {
  customerId: string
  customerLabel: string
  dnaId: string
  dnaLabel: string
  timestamp: string
  model: string
  inputFidelity: string | null
  referenceImages: string[]
  prompt: string | null
  revisedPrompt: string | null
  validation: {
    dnaValidator: { itemId: string; valid: boolean; errors: string[] }[]
    renderRequestValidator: { valid: boolean; checks: { label: string; status: 'PASS' | 'FAIL' }[] }
  }
  capability?: { mode: string; capabilityScore: number; qualityLevel: number; warnings: string[] }
  output: { ok: boolean; cancelled: boolean; cancelReason?: string; renderedImageUrl: string | null; error?: string }
  skippedReason?: string
}

function loadJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(path.join(RENDER_TESTING_DIR, relativePath), 'utf-8')) as T
}

const customers = loadJson<{ customers: CustomerManifestEntry[] }>('customers/manifest.json').customers
const dnaScenarios = loadJson<{ scenarios: DnaScenarioManifestEntry[] }>('dna/manifest.json').scenarios

// ---------------------------------------------------------------------
// Supabase (service context, no Next.js request) — read-only, same table
// every API route reads (design_master_options). Requires the same env
// vars the app itself uses (see src/lib/supabase/*.ts).
// ---------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// ---------------------------------------------------------------------
// Run bookkeeping — one timestamp for the whole run, never reused.
// ---------------------------------------------------------------------
const runTimestamp = new Date().toISOString()
const runTimestampSafe = runTimestamp.replace(/[:.]/g, '-')
const resultsDir = path.join(RENDER_TESTING_DIR, 'results', runTimestampSafe)
mkdirSync(resultsDir, { recursive: true })

function log(...parts: unknown[]) {
  console.log(...parts)
}

function saveScenarioResult(filename: string, payload: unknown) {
  const body = isDebugMode(runMode) ? payload : { debugMode: false, summaryOnly: true, ...summarizeForProduction(payload) }
  writeFileSync(path.join(resultsDir, filename), JSON.stringify(body, null, 2), 'utf-8')
}

// Production mode — terse persisted summary only, no raw payload/prompt/
// revised-prompt text.
function summarizeForProduction(payload: unknown): Record<string, unknown> {
  const p = payload as Partial<ScenarioRunResult> & Record<string, unknown>
  return {
    customerId: p.customerId,
    dnaId: p.dnaId,
    ok: (p.output as { ok?: boolean } | undefined)?.ok ?? false,
    cancelled: (p.output as { cancelled?: boolean } | undefined)?.cancelled ?? false,
    skippedReason: p.skippedReason ?? null,
  }
}

async function runScenario(customer: CustomerManifestEntry, dna: DnaScenarioManifestEntry): Promise<ScenarioRunResult> {
  const baseFields = {
    customerId: customer.id,
    customerLabel: customer.label,
    dnaId: dna.id,
    dnaLabel: dna.label,
    timestamp: runTimestamp,
    model: 'gpt-image-1',
  }

  // Golden Dataset entries start as placeholders (photoUrl/componentId all
  // null) until real assets/master-data are supplied — see render-testing/
  // README.md. Skip cleanly rather than crashing or fabricating data.
  const missingComponentIds = dna.componentSelections.filter((c) => !c.componentId)
  if (!customer.photoUrl || missingComponentIds.length > 0) {
    return {
      ...baseFields,
      inputFidelity: null,
      referenceImages: [],
      prompt: null,
      revisedPrompt: null,
      validation: { dnaValidator: [], renderRequestValidator: { valid: false, checks: [] } },
      output: { ok: false, cancelled: false, renderedImageUrl: null },
      skippedReason: !customer.photoUrl
        ? `Customer "${customer.id}" belum punya photoUrl.`
        : `DNA scenario "${dna.id}" punya componentId kosong: ${missingComponentIds.map((c) => c.componentType).join(', ')}.`,
    }
  }

  if (!supabase) {
    return {
      ...baseFields,
      inputFidelity: null,
      referenceImages: [],
      prompt: null,
      revisedPrompt: null,
      validation: { dnaValidator: [], renderRequestValidator: { valid: false, checks: [] } },
      output: { ok: false, cancelled: false, renderedImageUrl: null },
      skippedReason: 'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY tidak diset (lihat .env.local).',
    }
  }

  const ids = dna.componentSelections.map((c) => c.componentId).filter((id): id is string => !!id)
  const { data: rows, error } = await supabase.from('design_master_options').select('*').in('id', ids)
  if (error) {
    return {
      ...baseFields,
      inputFidelity: null,
      referenceImages: [],
      prompt: null,
      revisedPrompt: null,
      validation: { dnaValidator: [], renderRequestValidator: { valid: false, checks: [] } },
      output: { ok: false, cancelled: false, renderedImageUrl: null },
      skippedReason: `Supabase query gagal: ${error.message}`,
    }
  }

  const rowsById = new Map<string, MasterDataOption>((rows ?? []).map((row: MasterDataOption) => [row.id, row]))

  const dnaValidatorResults = dna.componentSelections
    .map((c) => rowsById.get(c.componentId as string))
    .filter((option): option is MasterDataOption => !!option)
    .map((option) => validateComponentDna({ itemId: option.id, category: option.category, aiDna: option.ai_dna }))

  const resolved: { option: MasterDataOption; recipe: RenderRecipe }[] = []
  const unresolvedComponents: { itemId: string; category: string; reason: string }[] = []
  dna.componentSelections.forEach((selection) => {
    const option = rowsById.get(selection.componentId as string)
    if (!option) {
      unresolvedComponents.push({ itemId: selection.componentId as string, category: selection.componentType as string, reason: 'not_found' })
      return
    }
    // Model Thobe is catalog-only (Architecture Lock, 2026-08-04) — excluded
    // from DNA resolution entirely (mirrors route.ts exactly).
    if (option.category === 'model_thobe') return
    const input: DNAResolverInput = { itemId: option.id, category: option.category, aiDna: option.ai_dna, renderRecipe: option.render_recipe }
    const { recipe, ready, errors } = resolveDNA(input)
    if (ready && recipe) {
      resolved.push({ option, recipe })
    } else {
      unresolvedComponents.push({ itemId: option.id, category: option.category, reason: errors.join(' ') })
    }
  })

  const collarSelection = dna.componentSelections.find((c) => rowsById.get(c.componentId as string)?.category === 'kerah')
  const collarOptionRaw = collarSelection ? (rowsById.get(collarSelection.componentId as string) ?? null) : null
  const plaketSelection = dna.componentSelections.find((c) => rowsById.get(c.componentId as string)?.category === 'plaket')
  const plaketOptionRaw = plaketSelection ? (rowsById.get(plaketSelection.componentId as string) ?? null) : null
  const pocketSelection = dna.componentSelections.find((c) => rowsById.get(c.componentId as string)?.category === 'saku')
  const pocketOptionRaw = pocketSelection ? (rowsById.get(pocketSelection.componentId as string) ?? null) : null
  const mansetSelection = dna.componentSelections.find((c) => rowsById.get(c.componentId as string)?.category === 'manset')
  const mansetOptionRaw = mansetSelection ? (rowsById.get(mansetSelection.componentId as string) ?? null) : null

  const composedAssets = composeAiAssets({
    customerPhotoUrl: customer.photoUrl,
    collarOption: collarOptionRaw,
    plaketOption: plaketOptionRaw,
    pocketOption: pocketOptionRaw,
    mansetOption: mansetOptionRaw,
  })
  // Global Base Hero (Architecture Lock, 2026-08-04) — mirrors route.ts's
  // insertion exactly.
  const baseHeroAvailable = GLOBAL_BASE_HERO_IMAGE_URL !== null
  const referenceImageUrls = GLOBAL_BASE_HERO_IMAGE_URL
    ? [composedAssets.urls[0], GLOBAL_BASE_HERO_IMAGE_URL, ...composedAssets.urls.slice(1)]
    : composedAssets.urls

  // AI Capability Engine — same gate as route.ts/debug route. Architecture
  // Lock (2026-08-04) removed Model Thobe from this input.
  const componentDnaResults = dnaValidatorResults
    .filter((d) => d.category !== 'model_thobe')
    .map((d) => ({ itemId: d.itemId, category: d.category, valid: d.valid }))
  const capability = evaluateCapability({
    customerPhotoPresent: !!customer.photoUrl,
    baseHeroAvailable,
    componentDnaResults,
    unresolvedComponents,
  })

  // Prompt Builder — Prompt Final (10 fixed blocks, real production path,
  // see promptBuilder/finalPrompt.ts). Each category reads straight off
  // `resolved`'s own DNA-Resolver output.
  const extractReferenceText = (category: MasterDataCategory): string | null => {
    const entry = resolved.find(({ option }) => option.category === category)
    if (!entry) return null
    const garment = entry.recipe.garment as Record<string, unknown>
    const raw = category === 'warna_bahan' ? garment.color : garment.referenceInstruction
    return typeof raw === 'string' && raw.trim().length > 0 ? raw : null
  }
  const prompt = buildFinalPrompt({
    material: extractReferenceText('bahan'),
    color: extractReferenceText('warna_bahan'),
    lookCutting: extractReferenceText('look_cutting'),
    kerah: extractReferenceText('kerah'),
    plaket: extractReferenceText('plaket'),
    saku: extractReferenceText('saku'),
    manset: extractReferenceText('manset'),
    aksesori: extractReferenceText('aksesori'),
    bordir: extractReferenceText('bordir'),
    handmadeZigzag: extractReferenceText('handmade_zigzag'),
  })

  const usesEdit = referenceImageUrls.length > 0
  const renderRequestValidator = validateRenderRequest({
    customerPhotoUrl: customer.photoUrl,
    referenceImageUrls,
    prompt,
    usesEdit,
    endpoint: usesEdit ? 'images.edit' : 'images.generate',
    model: 'gpt-image-1',
    imageCount: 1,
  })

  const canSend = capability.mode !== 'BLOCKED' && renderRequestValidator.valid

  let output: ScenarioRunResult['output'] = { ok: false, cancelled: false, renderedImageUrl: null }
  let revisedPrompt: string | null = null

  if (!isLive) {
    output = { ok: false, cancelled: false, renderedImageUrl: null }
  } else if (!canSend) {
    output = {
      ok: false,
      cancelled: true,
      cancelReason: [
        ...(capability.mode === 'BLOCKED' ? [`[Capability] ${capability.blockedReason}`] : []),
        ...renderRequestValidator.checks.filter((c) => c.status === 'FAIL').map((c) => c.label),
      ].join('; ') || 'Validator gagal.',
      renderedImageUrl: null,
    }
  } else if (resolved.length > 0) {
    // Sprint O (Task 5, Trigger Source) — tagged 'test_script' so this
    // golden-dataset spend is always filterable apart from real Design
    // Studio usage in Render History.
    const session = await startRenderSession({ supabase, source: 'test_script', model: DEFAULT_MODEL })
    const renderId = session.locked ? 'RND-TEST-LOCKED' : session.renderId
    const startedAtIso = session.locked ? new Date().toISOString() : session.startedAt
    const historyRowId = session.locked ? null : session.historyRowId

    const { result, requestCount, retryCount } = await generateImageWithControlledRetry({
      input: { referenceImageUrls, promptOverride: prompt },
    })
    if (result.ok) {
      output = { ok: true, cancelled: false, renderedImageUrl: result.images[0]?.url ?? null }
      revisedPrompt = result.images[0]?.revisedPrompt ?? null
    } else {
      output = { ok: false, cancelled: false, renderedImageUrl: null, error: result.error }
    }

    await finishRenderSession({
      supabase,
      historyRowId,
      renderId,
      startedAt: startedAtIso,
      status: result.ok ? 'success' : 'failed',
      requestCount,
      retryCount,
      model: DEFAULT_MODEL,
      errorMessage: result.ok ? null : result.error,
    })
  }

  if (runVisionJudge && output.ok && output.renderedImageUrl) {
    const { judgeRenderQuality } = await import('../src/lib/design/renderQuality/qualityJudge')
    const expectedGarmentNote = resolved.map(({ option }) => `${option.category}: ${option.name}`).join('; ')
    const judged = await judgeRenderQuality({ customerPhotoUrl: customer.photoUrl, renderedImageUrl: output.renderedImageUrl, expectedGarmentNote })
    log(`  vision judge: ${judged.ok ? judged.overallStatus : `error: ${judged.error}`}`)
  }

  return {
    ...baseFields,
    inputFidelity: usesEdit ? 'high' : null,
    referenceImages: referenceImageUrls,
    prompt,
    revisedPrompt,
    validation: {
      dnaValidator: dnaValidatorResults.map((d) => ({ itemId: d.itemId, valid: d.valid, errors: d.errors })),
      renderRequestValidator,
    },
    capability: { mode: capability.mode, capabilityScore: capability.capabilityScore, qualityLevel: capability.qualityLevel, warnings: capability.warnings },
    output,
  }
}

function statusIcon(pass: boolean): string {
  return pass ? '✅ PASS' : '❌ FAIL'
}

function formatScenarioMarkdown(result: ScenarioRunResult): string {
  if (result.skippedReason) {
    return [`### ${result.customerLabel} x ${result.dnaLabel}`, '', `**SKIPPED** — ${result.skippedReason}`, ''].join('\n')
  }

  return [
    `### ${result.customerLabel} x ${result.dnaLabel}`,
    '',
    `| Field | Value |`,
    `| --- | --- |`,
    `| Tanggal | ${result.timestamp} |`,
    `| Model AI | ${result.model} |`,
    `| Input Fidelity | ${result.inputFidelity ?? '(tidak berlaku)'} |`,
    `| Capability | ${result.capability ? `${result.capability.mode} — ${result.capability.capabilityScore}% (quality ${result.capability.qualityLevel}/5)${result.capability.warnings.length ? ` — ${result.capability.warnings.join('; ')}` : ''}` : '(tidak dihitung)'} |`,
    `| Reference Images | ${result.referenceImages.length} — ${result.referenceImages.join(', ') || '—'} |`,
    `| Output | ${result.output.cancelled ? `CANCELLED (${result.output.cancelReason ?? '—'})` : result.output.ok ? `OK — ${result.output.renderedImageUrl ?? '(no url)'}` : `ERROR — ${result.output.error ?? '—'}`} |`,
    '',
    '**Prompt (10 fixed blocks)**',
    '```',
    result.prompt ?? '(null)',
    '```',
    '',
    '**Revised Prompt (GPT)**',
    '```',
    result.revisedPrompt ?? '(tidak ada — dry run/cancelled/OpenAI tidak mengembalikan revised_prompt)',
    '```',
    '',
    '**Validation**',
    `- DNA Validator: ${statusIcon(result.validation.dnaValidator.every((d) => d.valid))}`,
    ...result.validation.dnaValidator.filter((d) => !d.valid).map((d) => `  - ${d.itemId}: ${d.errors.join(' | ')}`),
    `- Render Validator (deterministic): ${statusIcon(result.validation.renderRequestValidator.valid)}`,
    ...result.validation.renderRequestValidator.checks.filter((c) => c.status === 'FAIL').map((c) => `  - ${c.label}: FAIL`),
    '',
  ].join('\n')
}

function generateRegressionReportMarkdown(results: ScenarioRunResult[]): string {
  const total = results.length
  const skipped = results.filter((r) => r.skippedReason).length
  const cancelled = results.filter((r) => r.output?.cancelled).length
  const passed = results.filter((r) => !r.skippedReason && !r.output.cancelled && r.output.ok).length
  const failed = total - skipped - cancelled - passed

  return [
    '# AI Render — Regression Report',
    '',
    `Generated: ${runTimestamp}`,
    '',
    '## Summary',
    '',
    `- Total scenarios: ${total}`,
    `- Passed: ${passed}`,
    `- Failed: ${failed}`,
    `- Cancelled by Render Validator: ${cancelled}`,
    `- Skipped (incomplete golden dataset entry): ${skipped}`,
    '',
    '## Scenarios',
    '',
    ...results.map(formatScenarioMarkdown),
  ].join('\n')
}

async function main() {
  log(`Render Test Runner — run ${runTimestamp}`)
  log(`Mode: ${runMode} | Live: ${isLive} | Vision judge: ${runVisionJudge}`)
  log(`Customers: ${customers.length} | DNA scenarios: ${dnaScenarios.length} | Combinations: ${customers.length * dnaScenarios.length}`)

  const allResults: ScenarioRunResult[] = []

  for (const customer of customers) {
    for (const dna of dnaScenarios) {
      const result = await runScenario(customer, dna)
      allResults.push(result)

      const capabilityTag = result.capability ? ` [${result.capability.mode} ${result.capability.capabilityScore}%]` : ''
      const status = result.skippedReason
        ? `SKIPPED — ${result.skippedReason}`
        : result.output.cancelled
          ? `CANCELLED — ${result.output.cancelReason}`
          : result.output.ok
            ? 'OK'
            : isLive
              ? `ERROR — ${result.output.error ?? 'unknown'}`
              : 'DRY RUN'
      log(`${customer.label} x ${dna.label}:${capabilityTag} ${status}`)

      saveScenarioResult(`${customer.id}__${dna.id}.json`, result)
    }
  }

  const reportMarkdown = generateRegressionReportMarkdown(allResults)
  const reportsDir = path.join(RENDER_TESTING_DIR, 'reports')
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true })
  const reportPath = path.join(reportsDir, `${runTimestampSafe}.md`)
  writeFileSync(reportPath, reportMarkdown, 'utf-8')

  log(`\nResults saved to: render-testing/results/${runTimestampSafe}/`)
  log(`Report saved to:  render-testing/reports/${runTimestampSafe}.md`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
