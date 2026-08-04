// Render Test Runner (Sprint AI-R2.5, Part 7) — `npm run render:test`.
//
// Loads the Golden Dataset (render-testing/customers + render-testing/dna),
// runs every customer × DNA-scenario combination through the REAL pipeline
// (DNA Resolver -> DNA Validator -> Recipe Composer -> Prompt Builder ->
// Serializer/Compression [V1] and Prompt Architecture V2 -> Render
// Validator), and writes a timestamped result + regression report. Never
// overwrites a previous run — every invocation gets its own timestamp
// folder/file.
//
// Standalone Node script, NOT a Next.js request handler — it builds its own
// Supabase client from env vars (@/lib/supabase/server's createClient()
// depends on next/headers cookies(), which only exists inside a request).
// Every pipeline function it calls is imported from the same modules the
// real API routes use — this script never re-implements pipeline logic.
//
// Usage:
//   npm run render:test                      # dry run, V1, all scenarios
//   npm run render:test -- --live             # actually calls OpenAI (spends money) for scenarios that pass validation
//   npm run render:test -- --promptVersion=v2 # use Prompt Architecture V2 instead of V1
//   npm run render:test -- --promptVersion=both
//   npm run render:test -- --runVisionJudge   # also run the AI quality judge on --live results (spends more money)

import 'dotenv/config'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

import type { MasterDataOption } from '../src/lib/design/masterData'
import { resolveDNA } from '../src/lib/design/dnaResolver/resolver'
import type { DNAResolverInput } from '../src/lib/design/dnaResolver/types'
import { composeRenderRecipe } from '../src/lib/design/recipeComposer/composer'
import { DEFAULT_GLOBAL_RENDER_POLICY } from '../src/lib/design/recipeComposer/types'
import type { RenderRecipeEntry } from '../src/lib/design/recipeComposer/types'
import type { RenderRecipe } from '../src/lib/design/renderRecipe/types'
import { buildRenderInstruction } from '../src/lib/design/promptBuilder/builder'
import { buildCompressedSections, compressPrompt } from '../src/lib/design/promptBuilder/compression'
import { startRenderSession, finishRenderSession, generateImageWithControlledRetry } from '../src/lib/ai/renderSession/service'
import { DEFAULT_MODEL } from '../src/lib/ai/services/image'
import { buildPromptLayersV2, compressPromptLayersV2 } from '../src/lib/design/promptArchitectureV2/layers'
import { validatePromptLayers } from '../src/lib/design/promptArchitectureV2/promptValidator'
import { validateComponentDna } from '../src/lib/design/promptArchitectureV2/dnaValidator'
import { validateRenderRequest } from '../src/lib/design/promptArchitectureV2/renderValidator'
import { getRenderRunMode, isDebugMode } from '../src/lib/design/promptArchitectureV2/debugMode'
import { generateRegressionReportMarkdown, type ScenarioRunResult } from '../src/lib/design/promptArchitectureV2/regressionReport'
import type { PromptVersion } from '../src/lib/design/promptArchitectureV2/versions'
import { composeAiAssets, applyAssetInstructions } from '../src/lib/design/aiAssetComposer/composer'
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
const promptVersionArg = (args.find((a) => a.startsWith('--promptVersion='))?.split('=')[1] ?? 'v1') as
  | PromptVersion
  | 'both'
const promptVersionsToRun: PromptVersion[] = promptVersionArg === 'both' ? ['v1', 'v2'] : [promptVersionArg]

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

// Production mode (Part 9) — terse persisted summary only, no raw
// payload/prompt/revised-prompt text.
function summarizeForProduction(payload: unknown): Record<string, unknown> {
  const p = payload as Partial<ScenarioRunResult> & Record<string, unknown>
  return {
    customerId: p.customerId,
    dnaId: p.dnaId,
    promptVersion: p.promptVersion,
    ok: (p.output as { ok?: boolean } | undefined)?.ok ?? false,
    cancelled: (p.output as { cancelled?: boolean } | undefined)?.cancelled ?? false,
    skippedReason: p.skippedReason ?? null,
  }
}

async function runScenario(
  customer: CustomerManifestEntry,
  dna: DnaScenarioManifestEntry,
  promptVersion: PromptVersion,
): Promise<ScenarioRunResult> {
  const baseFields = {
    customerId: customer.id,
    customerLabel: customer.label,
    dnaId: dna.id,
    dnaLabel: dna.label,
    promptVersion,
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
      validation: {
        dnaValidator: [],
        promptValidator: null,
        renderRequestValidator: { valid: false, checks: [] },
      },
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
      validation: { dnaValidator: [], promptValidator: null, renderRequestValidator: { valid: false, checks: [] } },
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
      validation: { dnaValidator: [], promptValidator: null, renderRequestValidator: { valid: false, checks: [] } },
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
    // Architecture Lock (2026-08-04) — Model Thobe is catalog-only now,
    // excluded from DNA resolution entirely (mirrors route.ts exactly).
    if (option.category === 'model_thobe') return
    const input: DNAResolverInput = { itemId: option.id, category: option.category, aiDna: option.ai_dna, renderRecipe: option.render_recipe }
    const { recipe, ready, errors } = resolveDNA(input)
    if (ready && recipe) {
      resolved.push({ option, recipe })
    } else {
      unresolvedComponents.push({ itemId: option.id, category: option.category, reason: errors.join(' ') })
    }
  })

  const entries: RenderRecipeEntry[] = resolved.map(({ option, recipe }, index) => ({ itemId: option.id, category: option.category, recipe, priority: index }))
  const masterRecipe = entries.length > 0 ? composeRenderRecipe({ entries, policy: DEFAULT_GLOBAL_RENDER_POLICY }) : null
  const instruction = buildRenderInstruction(masterRecipe)

  const collarSelection = dna.componentSelections.find((c) => rowsById.get(c.componentId as string)?.category === 'kerah')
  const collarOptionRaw = collarSelection ? (rowsById.get(collarSelection.componentId as string) ?? null) : null
  const composedAssets = composeAiAssets({
    customerPhotoUrl: customer.photoUrl,
    collarOption: collarOptionRaw,
  })
  // Global Base Hero (Architecture Lock, 2026-08-04) — mirrors route.ts's
  // insertion exactly.
  const baseHeroAvailable = GLOBAL_BASE_HERO_IMAGE_URL !== null
  const referenceImageUrls = GLOBAL_BASE_HERO_IMAGE_URL
    ? [composedAssets.urls[0], GLOBAL_BASE_HERO_IMAGE_URL, ...composedAssets.urls.slice(1)]
    : composedAssets.urls

  // AI Capability Engine (Sprint AI-R3) — same gate as route.ts/debug route.
  // Architecture Lock (2026-08-04) removed Model Thobe from this input.
  const componentDnaResults = dnaValidatorResults
    .filter((d) => d.category !== 'model_thobe')
    .map((d) => ({ itemId: d.itemId, category: d.category, valid: d.valid }))
  const capability = evaluateCapability({
    customerPhotoPresent: !!customer.photoUrl,
    baseHeroAvailable,
    componentDnaResults,
    unresolvedComponents,
  })

  let prompt: string | null = null
  let promptValidatorResult: { valid: boolean; checks: { label: string; status: 'PASS' | 'FAIL' }[] } | null = null

  if (promptVersion === 'v1') {
    const compression = instruction ? compressPrompt(buildCompressedSections(instruction)) : null
    prompt = compression?.compressed ?? null
  } else {
    const layers = buildPromptLayersV2(instruction)
    const compressed = compressPromptLayersV2(layers)
    prompt = compressed.compressed
    promptValidatorResult = validatePromptLayers(layers)
  }

  // AI Asset Lifecycle — SILHOUETTE-only and/or COLLAR_SHAPE-only caveats,
  // appended only for whichever AI Assets are actually included.
  if (prompt) prompt = applyAssetInstructions(prompt, composedAssets)

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

  const canSend =
    capability.mode !== 'BLOCKED' && renderRequestValidator.valid && (promptVersion !== 'v2' || (promptValidatorResult?.valid ?? false))

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
  } else if (instruction && prompt) {
    // Sprint O (Task 5, Trigger Source) — tagged 'test_script' so this
    // golden-dataset spend is always filterable apart from real Design
    // Studio usage in Render History. `supabase` is this script's own
    // module-level client (may be null if env vars are missing, or may
    // fail RLS since this script has no login session — either way,
    // startRenderSession() degrades to a local, non-persisted Render ID
    // rather than ever blocking the actual render).
    const session = await startRenderSession({ supabase, source: 'test_script', model: DEFAULT_MODEL })
    const renderId = session.locked ? 'RND-TEST-LOCKED' : session.renderId
    const startedAtIso = session.locked ? new Date().toISOString() : session.startedAt
    const historyRowId = session.locked ? null : session.historyRowId

    const { result, requestCount, retryCount } = await generateImageWithControlledRetry({
      input: { instruction, referenceImageUrls, promptOverride: prompt },
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
      promptValidator: promptValidatorResult,
      renderRequestValidator,
    },
    capability: { mode: capability.mode, capabilityScore: capability.capabilityScore, qualityLevel: capability.qualityLevel, warnings: capability.warnings },
    output,
  }
}

async function main() {
  log(`Render Test Runner — run ${runTimestamp}`)
  log(`Mode: ${runMode} | Live: ${isLive} | Prompt version(s): ${promptVersionsToRun.join(', ')} | Vision judge: ${runVisionJudge}`)
  log(`Customers: ${customers.length} | DNA scenarios: ${dnaScenarios.length} | Combinations: ${customers.length * dnaScenarios.length * promptVersionsToRun.length}`)

  const allResults: ScenarioRunResult[] = []

  for (const customer of customers) {
    for (const dna of dnaScenarios) {
      for (const promptVersion of promptVersionsToRun) {
        const result = await runScenario(customer, dna, promptVersion)
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
        log(`[${promptVersion}] ${customer.label} × ${dna.label}:${capabilityTag} ${status}`)

        saveScenarioResult(`${customer.id}__${dna.id}__${promptVersion}.json`, result)
      }
    }
  }

  const reportMarkdown = generateRegressionReportMarkdown(allResults, runTimestamp)
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
