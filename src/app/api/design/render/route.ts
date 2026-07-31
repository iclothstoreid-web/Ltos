import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { MasterDataOption } from '@/lib/design/masterData'
import { resolveDNA } from '@/lib/design/dnaResolver/resolver'
import type { DNAResolverInput } from '@/lib/design/dnaResolver/types'
import { composeRenderRecipe } from '@/lib/design/recipeComposer/composer'
import { DEFAULT_GLOBAL_RENDER_POLICY } from '@/lib/design/recipeComposer/types'
import type { RenderRecipeEntry } from '@/lib/design/recipeComposer/types'
import type { RenderRecipe } from '@/lib/design/renderRecipe/types'
import { buildRenderInstruction, validateRenderInstruction } from '@/lib/design/promptBuilder/builder'
import { serializeOpenAI } from '@/lib/design/promptBuilder/serializer'
import { buildPromptLayers, compressPromptByLayers, validatePriorityZeroIntact } from '@/lib/design/promptBuilder/compression'
import { DEFAULT_MODEL } from '@/lib/ai/services/image'
import { startRenderSession, finishRenderSession, generateImageWithControlledRetry } from '@/lib/ai/renderSession/service'
import {
  composeAiAssets,
  applyAssetInstructions,
  validateModelReferenceAvailable,
  validateCollarReference,
  validatePlaketReference,
  validatePocketReference,
  referenceBackedCategories,
} from '@/lib/design/aiAssetComposer/composer'
import { validateComponentDna } from '@/lib/design/promptArchitectureV2/dnaValidator'
import { evaluateCapability } from '@/lib/design/capabilityEngine/engine'
import type { UnresolvedComponent } from '@/lib/design/capabilityEngine/engine'
import { LAYER1_IDENTITY_TEMPLATE } from '@/lib/design/promptArchitectureV2/layers'
import type { DnaState } from '@/lib/design/dnaState/types'
import { hashDnaState } from '@/lib/design/dnaState/hash'
import { detectDirtyLayers } from '@/lib/design/dirtyLayer/detect'
import { getCachedRender, setCachedRender } from '@/lib/design/renderCache/cache'
import { createRenderProfiler, formatProfileReport } from '@/lib/ai/renderProfiler/profiler'
import { prefetchReferenceImages } from '@/lib/ai/services/image'
import type { ProviderUsage } from '@/lib/ai/services/image'

// Debug logging (2026-07-28) — this endpoint's real callers have been
// reporting collar/pocket/color loss in rendered output with no visibility
// into which pipeline stage drops them. These logs make every stage's
// actual data inspectable (server console + response.debug) without
// altering any of the pipeline's own logic — pure observation, no new
// behavior. Remove once the loss is root-caused.
//
// Sprint O.1 (Task 3/6, Audit Duplicate Work) — a real profiling probe this
// sprint (see SPRINT_O1 report) measured this whole diagnostic block
// (JSON.stringify of the full instruction/masterRecipe + the uncompressed
// prompt dump below) at well under 1ms of CPU per request — not the
// latency bottleneck (OpenAI's own generation time is ~99%+ of total). It's
// still real, unconditional work done on every production render for a
// payload (`promptUncompressed`, `debug`) that has zero confirmed
// consumers (verified: no client code reads `data.debug` or
// `data.promptUncompressed` — see report). Gating it behind
// RENDER_DEBUG_LOG removes that always-on cost/response-payload growth
// without losing the ability to turn it back on for a specific
// investigation (env var, no redeploy needed).
const RENDER_DEBUG_LOG = process.env.RENDER_DEBUG_LOG === 'true' || process.env.NODE_ENV !== 'production'
const SEP = '='.repeat(80)
function logStage(emoji: string, title: string) {
  if (!RENDER_DEBUG_LOG) return
  console.log(`\n${SEP}\n${emoji} ${title}\n${SEP}`)
}
function debugLog(...args: unknown[]) {
  if (!RENDER_DEBUG_LOG) return
  console.log(...args)
}
function debugTable(data: unknown) {
  if (!RENDER_DEBUG_LOG) return
  console.table(data)
}

// Incremental Render Engine V1 (Task 3/6/7) — remembers only the most
// recently *processed* DNA State for this server process, purely so Dirty
// Layer Detection has something to diff against for the debug log below.
// Never read for any business decision (it is not per-consultation, not
// persisted) — Render Cache is what actually decides hit/miss; this is
// observation only, same convention as the STAGE 1-6 debug logging.
let lastDnaState: DnaState | null = null

// Design Render orchestration endpoint — DNA Resolver -> Recipe Composer ->
// Prompt Builder -> Image Service, gated by the AI Capability Engine.
//
// Sprint PR-01 (Production Recovery) — this endpoint previously tolerated a
// selected component silently failing to resolve (dropped into
// `componentsMissing`, render proceeded anyway on whatever else resolved).
// That is exactly the "silent fallback" the brief requires removed: a
// customer who picked Saudi Modern got a render with no trace of Saudi
// Modern in it and no error telling them why. Fail Fast (P3/P8) below makes
// ANY unresolved *selected* component (not the "(None)" sentinel — that
// never reaches `componentSelections` at all, see design-studio/types.ts's
// OPTIONAL_FIELDS) a hard BLOCKED response via the Capability Engine,
// instead of a quiet `componentsMissing` entry the render just continues
// past.
// Final Production Render Test (2026-07-31) — real gpt-image-1 generation
// measured at 68.4s (see image.ts's DEFAULT_TIMEOUT_MS comment); without an
// explicit maxDuration this route falls back to the Vercel plan/framework
// default, which can be shorter than that and would kill the function
// before the OpenAI client's own (now-raised) timeout ever fires.
export const maxDuration = 120

interface ComponentSelection {
  componentType: string
  componentId: string
}

interface RenderRequestBody {
  customerPhotoUrl?: string
  componentSelections?: ComponentSelection[]
  // Sprint O (Render Session) — optional so an older client build still
  // works exactly as before (Render History just records consultation_id
  // as null for that request instead of blocking it).
  consultationId?: string
}

export async function POST(req: NextRequest) {
  // Render Profiler (Sprint O.1, Task 1/2) — created before anything else
  // runs so "request masuk" is the profiler's own creation instant; every
  // stage below is timed against it. See src/lib/ai/renderProfiler.
  const profiler = createRenderProfiler()

  let body: RenderRequestBody
  try {
    body = await profiler.markAsync('request_parse', () => req.json())
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { customerPhotoUrl, componentSelections, consultationId } = body

  logStage('🔵', 'STAGE 1: INPUT PAYLOAD')
  debugLog(JSON.stringify({ customerPhotoUrl, componentSelections, consultationId }, null, 2))

  if (!customerPhotoUrl || !Array.isArray(componentSelections) || componentSelections.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Missing customerPhotoUrl or componentSelections.' },
      { status: 400 },
    )
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await profiler.markAsync('auth_check', () => supabase.auth.getUser())

  // Render Request Lock (Sprint O, Task 1) — acquired BEFORE any pipeline
  // work starts, so a rejected (locked) request never pays for the DNA
  // Resolver/Recipe Composer/Compression work either, not just the OpenAI
  // call. See src/lib/ai/renderSession/service.ts for the DB-constraint-
  // backed (not check-then-act) locking mechanism.
  const session = await profiler.markAsync('session_start', () =>
    startRenderSession({
      supabase,
      source: 'design_studio',
      consultationId: consultationId ?? null,
      userId: user?.id ?? null,
      model: DEFAULT_MODEL,
    }),
  )

  if (session.locked) {
    return NextResponse.json(
      {
        success: false,
        error: 'Render lain untuk consultation ini masih berjalan. Tunggu hingga selesai sebelum mencoba lagi.',
        activeRenderId: session.activeRenderId,
      },
      { status: 409 },
    )
  }

  const { renderId, historyRowId, startedAt } = session

  // Render History Engine outcome — set right before every return path
  // below (including the cache-hit fast path); read once in `finally` so
  // the Render History row and Structured Logging both close out exactly
  // once per request, regardless of which branch actually returned.
  let outcome: {
    status: 'success' | 'failed' | 'cancelled'
    requestCount: number
    retryCount: number
    model: string | null
    errorMessage: string | null
    provider?: string
    providerUsage?: ProviderUsage | null
  } = {
    status: 'failed',
    requestCount: 0,
    retryCount: 0,
    model: null,
    errorMessage: 'Unhandled exception before the render pipeline completed.',
  }

  try {
    const ids = componentSelections.map((selection) => selection.componentId).filter(Boolean)

    const { data: rows, error } = await profiler.markAsync('fetch_components', async () =>
      supabase.from('design_master_options').select('*').in('id', ids),
    )
    if (error) {
      outcome = { status: 'failed', requestCount: 0, retryCount: 0, model: null, errorMessage: error.message }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch components.', details: error.message, renderId },
        { status: 500 },
      )
    }

    logStage('🟡', 'STAGE 2: DNA RESOLVER — components fetched from Supabase')
  debugLog(`Requested ${ids.length} id(s), found ${rows?.length ?? 0} row(s) in design_master_options`)

  // Trust the DB row's own `category`, not the caller's `componentType`
  // string — the request body's componentType is only ever a UI label, and
  // reconciling it against MASTER_DATA_CATEGORY's real keys (e.g. "warna" vs
  // "warna_bahan", "zigzag" vs "handmade_zigzag") would just be a second,
  // redundant source of truth that could disagree with the row itself.
  const rowsById = new Map<string, MasterDataOption>((rows ?? []).map((row: MasterDataOption) => [row.id, row]))

  // Architecture Lock: DNA Color Repository + Material Color Mapping —
  // 'warna_bahan' rows are now a 1:1 render-pipeline mirror of a dna_colors
  // row (see src/lib/design/dnaColors.ts); the mirror's OWN ai_dna/
  // render_recipe are never hand-authored anymore (no admin UI writes them),
  // so they sit at the DB default (pending/empty) forever. Merge the linked
  // DNA Color's `prompt` in as this row's ai_dna.appearance and mark it
  // ready IN-MEMORY ONLY (never persisted) so DNA Resolver's existing
  // pending/empty gate doesn't block it — dna_colors.prompt is the ONLY
  // color content that ever reaches OpenAI this way; material_colors'
  // supplier_color_code is never read here. Does not touch DNA Resolver,
  // Recipe Composer, or Compression at all.
  const warnaBahanRows = Array.from(rowsById.values()).filter(
    (row) => row.category === 'warna_bahan' && row.dna_color_id
  )
  if (warnaBahanRows.length > 0) {
    await profiler.markAsync('fetch_dna_colors', async () => {
      const { data: dnaColorRows } = await supabase
        .from('dna_colors')
        .select('id, prompt, character, family, hex')
        .in('id', warnaBahanRows.map((row) => row.dna_color_id as string))

      const dnaColorsById = new Map((dnaColorRows ?? []).map((c) => [c.id, c]))
      warnaBahanRows.forEach((row) => {
        const dnaColor = dnaColorsById.get(row.dna_color_id as string)
        const appearance =
          dnaColor?.prompt || [dnaColor?.character, dnaColor?.family, dnaColor?.hex].filter(Boolean).join(', ')
        if (!appearance) return

        row.ai_dna = {
          ...row.ai_dna,
          status: row.ai_dna.status === 'pending' ? 'draft' : row.ai_dna.status,
          appearance,
        }
        row.render_recipe = {
          ...row.render_recipe,
          status: row.render_recipe.status === 'empty' ? 'configured' : row.render_recipe.status,
        }
      })
    })
  }

  // DNA State (Task 1) — Sprint PR-01 (P7, Cache Invalidation) moved this
  // hash computation to AFTER the Supabase fetch above (it used to run
  // before, purely on the request body, so a cache hit could skip Supabase
  // entirely). That was cache-incorrect: hashing only {category, itemId}
  // meant editing a Master Data item's AI Design DNA / Render Recipe (which
  // never changes its id) produced the exact same hash as before the edit,
  // so a Render Cache hit could silently serve a render made under the OLD
  // DNA. Including each component's real `ai_dna.version`/
  // `render_recipe.version` (bumped by aiDna/types.ts's mark* functions on
  // every real edit) fixes that at the cost of always paying for one
  // Supabase SELECT even on a cache hit — a fixed, cheap cost compared to
  // the OpenAI call a cache hit still saves.
  const dnaState: DnaState = {
    customerPhotoUrl,
    components: componentSelections.map((selection) => {
      const option = rowsById.get(selection.componentId)
      return {
        category: selection.componentType,
        itemId: selection.componentId,
        dnaVersion: option?.ai_dna.version,
        recipeVersion: option?.render_recipe.version,
      }
    }),
  }
  const dnaHash = hashDnaState(dnaState)

  logStage('🟤', 'STAGE 1.5: DNA STATE HASH + DIRTY LAYER + CACHE LOOKUP')
  const dirty = detectDirtyLayers(lastDnaState, dnaState)
  debugLog(`DNA State hash: ${dnaHash}`)
  debugLog(`Dirty layers:     [${dirty.dirtyLayers.join(', ') || 'none'}]`)
  debugLog(`Unchanged layers: [${dirty.unchangedLayers.join(', ') || 'none'}]`)
  lastDnaState = dnaState

  const cached = getCachedRender<Record<string, unknown>>(dnaHash)
  if (cached) {
    debugLog(`✅ Cache HIT (cached at ${cached.cachedAt}) — returning previously rendered result, no re-render.`)
    // Zero OpenAI requests for a cache hit — `provider: 'cache'` keeps this
    // visibly distinct from a real spend in Render History.
    outcome = { status: 'success', requestCount: 0, retryCount: 0, model: null, errorMessage: null, provider: 'cache' }
    return NextResponse.json({ ...cached.response, renderId })
  }
  debugLog('Cache MISS — proceeding with full render pipeline.')

  const componentsMissing: { componentId: string; componentType: string; reason: string }[] = []
  const resolved: { option: MasterDataOption; recipe: RenderRecipe }[] = []

  profiler.mark('dna_resolver', () => {
    componentSelections.forEach((selection) => {
      const option = rowsById.get(selection.componentId)
      if (!option) {
        debugLog(`  ├─ ${selection.componentType} (${selection.componentId}): ⚠️  not_found in Supabase`)
        componentsMissing.push({ ...selection, reason: 'Item tidak ditemukan di design_master_options.' })
        return
      }

      debugLog(`  ├─ ${selection.componentType} → "${option.name}" [category=${option.category}]`)
      debugLog(`  │    ai_dna.status=${option.ai_dna.status}  render_recipe.status=${option.render_recipe.status}`)

      const input: DNAResolverInput = {
        itemId: option.id,
        category: option.category,
        aiDna: option.ai_dna,
        renderRecipe: option.render_recipe,
      }
      const { recipe, ready, errors } = resolveDNA(input)
      if (!ready || !recipe) {
        debugLog(`  │    ⚠️  not ready: ${errors.join(' ')}`)
        componentsMissing.push({ ...selection, reason: `"${option.name}" — ${errors.join(' ')}` })
        return
      }

      debugLog(`  │    ✅ resolved — garment keys: [${Object.keys(recipe.garment).join(', ') || 'none'}]`)
      resolved.push({ option, recipe })
    })
  })

  debugLog(`\n✅ Resolved ${resolved.length}/${componentSelections.length} component(s); ${componentsMissing.length} missing`)

  // ---------------------------------------------------------------------
  // AI Capability Engine (Sprint AI-R3, extended Sprint PR-01 P3/P8) — the
  // SOLE gate for whether this render is even attempted. A component that
  // failed resolveDNA (e.g. render_recipe.status still 'empty') is now a
  // BLOCKING condition (`unresolvedComponents`), not something the render
  // silently continues past — see the module doc comment on
  // EvaluateCapabilityInput.unresolvedComponents.
  // ---------------------------------------------------------------------
  const modelThobeSelection = componentSelections.find((s) => rowsById.get(s.componentId)?.category === 'model_thobe')
  const modelThobeOptionRaw = modelThobeSelection ? (rowsById.get(modelThobeSelection.componentId) ?? null) : null
  const modelThobeDnaValidation = modelThobeOptionRaw
    ? validateComponentDna({ itemId: modelThobeOptionRaw.id, category: modelThobeOptionRaw.category, aiDna: modelThobeOptionRaw.ai_dna })
    : null

  const otherComponentDnaResults = componentSelections
    .filter((s) => s.componentId !== modelThobeSelection?.componentId)
    .map((s) => rowsById.get(s.componentId))
    .filter((option): option is MasterDataOption => !!option)
    .map((option) => {
      const validation = validateComponentDna({ itemId: option.id, category: option.category, aiDna: option.ai_dna })
      return { itemId: option.id, category: option.category, valid: validation.valid }
    })

  // AI Asset Library — kerah (Collar), plaket (Placket), and saku (Pocket)
  // all reuse the same "found regardless of resolve success" raw lookup as
  // Model Thobe above, since each of these references is optional
  // (validateCollarReference/validatePlaketReference/validatePocketReference
  // never block a render — Sprint AI Stability Phase 2 extended Plaket/
  // Pocket onto the exact mechanism Collar already used).
  const collarSelection = componentSelections.find((s) => rowsById.get(s.componentId)?.category === 'kerah')
  const collarOptionRaw = collarSelection ? (rowsById.get(collarSelection.componentId) ?? null) : null

  const plaketSelection = componentSelections.find((s) => rowsById.get(s.componentId)?.category === 'plaket')
  const plaketOptionRaw = plaketSelection ? (rowsById.get(plaketSelection.componentId) ?? null) : null

  const pocketSelection = componentSelections.find((s) => rowsById.get(s.componentId)?.category === 'saku')
  const pocketOptionRaw = pocketSelection ? (rowsById.get(pocketSelection.componentId) ?? null) : null

  const composedAssets = profiler.mark('asset_composer', () =>
    composeAiAssets({
      customerPhotoUrl,
      modelThobeOption: modelThobeOptionRaw,
      collarOption: collarOptionRaw,
      plaketOption: plaketOptionRaw,
      pocketOption: pocketOptionRaw,
    }),
  )

  // Reference Image diagnostics (Sprint PR-01, P6; extended Sprint AI
  // Stability Phase 2) — validateModelReferenceAvailable/
  // validateCollarReference/validatePlaketReference/validatePocketReference
  // already existed (or now mirror what already existed) but were never
  // called anywhere in production; wiring them in is what turns "reference
  // image silently omitted" into a reported reason.
  const modelReferenceStatus = validateModelReferenceAvailable({ modelThobeOption: modelThobeOptionRaw, composed: composedAssets })
  const collarReferenceStatus = validateCollarReference({ collarOption: collarOptionRaw, composed: composedAssets })
  const plaketReferenceStatus = validatePlaketReference({ plaketOption: plaketOptionRaw, composed: composedAssets })
  const pocketReferenceStatus = validatePocketReference({ pocketOption: pocketOptionRaw, composed: composedAssets })
  debugLog(`Model Reference: ${modelReferenceStatus.valid ? '✅' : '—'} ${modelReferenceStatus.reason}`)
  debugLog(`Collar Reference: ${collarReferenceStatus.valid ? '✅' : '—'} ${collarReferenceStatus.reason}`)
  debugLog(`Plaket Reference: ${plaketReferenceStatus.valid ? '✅' : '—'} ${plaketReferenceStatus.reason}`)
  debugLog(`Pocket Reference: ${pocketReferenceStatus.valid ? '✅' : '—'} ${pocketReferenceStatus.reason}`)

  // Reference-First (Sprint R-02) — categories whose Hero Image is actually
  // being sent this render (derived from composedAssets above, the same
  // isAiAssetActive gate that decided the image itself). Threaded into
  // Prompt Builder (diagnostic instruction) and Prompt Compression (the
  // real prompt sent to OpenAI) below so a reference-backed category's
  // narrative DNA collapses to Lock Rules instead of full prose — see
  // promptBuilder/lockRules.ts.
  const referenceBacked = referenceBackedCategories(composedAssets)
  debugLog(`Reference-backed categories (Lock Rules only): [${Array.from(referenceBacked).join(', ') || 'none'}]`)

  const unresolvedComponents: UnresolvedComponent[] = componentsMissing.map((m) => ({
    itemId: m.componentId,
    category: m.componentType,
    reason: m.reason,
  }))

  const capability = profiler.mark('capability_engine', () =>
    evaluateCapability({
      customerPhotoPresent: !!customerPhotoUrl,
      modelThobeSelected: !!modelThobeOptionRaw,
      modelThobeDnaValid: modelThobeDnaValidation?.valid ?? false,
      modelReferenceAvailable: !!composedAssets.modelReference,
      otherComponentDnaResults,
      unresolvedComponents,
    }),
  )

  logStage('🟠', 'STAGE 2.5: AI CAPABILITY ENGINE')
  debugLog(`Mode: ${capability.mode} | Score: ${capability.capabilityScore}% | Quality: ${capability.qualityLevel}/5`)
  debugLog(`Warnings: [${capability.warnings.join(' | ') || 'none'}]`)

  // Fail Fast (P3/P8): a selected component that never resolved, an invalid
  // Model Thobe DNA, a missing Model Thobe, or a missing Customer Photo are
  // now the ONLY conditions allowed to stop a render before OpenAI — but
  // unlike before Sprint PR-01, "a selected component never resolved" is
  // one of them. No more rendering ahead with a silently-dropped component.
  if (capability.mode === 'BLOCKED') {
    debugLog(`  ❌ BLOCKED — ${capability.blockedReason}`)
    outcome = {
      status: 'cancelled',
      requestCount: 0,
      retryCount: 0,
      model: null,
      errorMessage: capability.blockedReason ?? 'BLOCKED by AI Capability Engine.',
    }
    return NextResponse.json(
      { success: false, error: capability.blockedReason, componentsMissing, capability, renderId },
      { status: 422 },
    )
  }

  // Reference Image Prefetch (Sprint O.1, Task 4/6) — `composedAssets.urls`
  // is already fully known at this point (composeAiAssets ran above); the
  // download from Supabase Storage doesn't need anything Recipe
  // Composer/Prompt Builder/Compression produce, so it's kicked off here
  // and only awaited right before the OpenAI call, overlapping the
  // download with those CPU-bound stages instead of paying for both in
  // sequence (previously: image.ts only started this fetch AFTER prompt
  // compression fully finished).
  const referenceImagesPromise = profiler.markAsync('reference_image_fetch', () => prefetchReferenceImages(composedAssets.urls))
  // Suppress Node's "unhandled promise rejection" warning for the case where
  // an earlier stage below returns/throws before this is ever awaited (e.g.
  // Prompt Compression rejects the render) — the real rejection is still
  // delivered normally to whichever `await referenceImagesPromise` actually
  // runs further down; this extra handler only exists to not crash/warn on
  // the ones that don't.
  referenceImagesPromise.catch(() => {})

  // Priority mirrors the caller's own selection order (model_thobe first,
  // per RenderRecipeEntry's own "Model before Collar before Pocket"
  // convention) — there is no other ordering signal available per request.
  const entries: RenderRecipeEntry[] = resolved.map(({ option, recipe }, index) => ({
    itemId: option.id,
    category: option.category,
    recipe,
    priority: index,
  }))

  logStage('🟣', 'STAGE 3: RECIPE COMPOSER — merging component recipes')
  debugLog(`Entries (priority order): ${entries.map((e) => `${e.category}#${e.priority}`).join(', ')}`)
  const masterRecipe = profiler.mark('recipe_composer', () => composeRenderRecipe({ entries, policy: DEFAULT_GLOBAL_RENDER_POLICY }))
  if (masterRecipe) {
    ;(
      ['camera', 'pose', 'lighting', 'composition', 'focus', 'fabricBehavior', 'visibilityRules', 'garment', 'fabricIdentity', 'stitching', 'embroidery', 'background', 'quality', 'style'] as const
    ).forEach((key) => {
      const keys = Object.keys(masterRecipe[key] ?? {})
      debugLog(`  ├─ ${key}: ${keys.length ? `{${keys.join(', ')}}` : '✗ empty'}`)
    })
    debugLog(`  └─ negativeRules: [${masterRecipe.negativeRules.join(', ')}]`)
  } else {
    debugLog('  ⚠️  composeRenderRecipe returned null')
  }

  logStage('🟢', 'STAGE 4: PROMPT BUILDER — RenderInstruction')
  const instruction = profiler.mark('prompt_builder', () => buildRenderInstruction(masterRecipe, referenceBacked))
  const instructionValidation = validateRenderInstruction(instruction)
  debugLog(JSON.stringify(instruction, null, 2))
  debugLog(`Validation: ${instructionValidation.valid ? '✅ valid' : `⚠️  ${instructionValidation.errors.join(' | ')}`}`)
  if (!instruction) {
    outcome = {
      status: 'failed',
      requestCount: 0,
      retryCount: 0,
      model: null,
      errorMessage: 'Render Instruction could not be compiled.',
    }
    return NextResponse.json({ success: false, error: 'Render Instruction could not be compiled.', renderId }, { status: 422 })
  }

  // AI Asset Composer already ran (STAGE 2.5, alongside the Capability
  // Engine) — reused here, not recomputed. `referenceImageUrls` naturally
  // reflects capability.strategy.includeModelReference: composeAiAssets
  // only includes the Model Reference URL when one was actually approved
  // and active, so a HIGH/STANDARD/LIMITED render simply omits it instead
  // of failing.
  const referenceImageUrls = composedAssets.urls

  logStage('🔵', 'STAGE 5: PROMPT SERIALIZER (uncompressed, diagnostic only)')
  // Sprint O.1 (Task 3, Audit Duplicate Work) — this uncompressed
  // serialization exists purely for diagnostics (its own comment says so);
  // it's never sent to OpenAI (`finalPrompt` below, from the COMPRESSED
  // layers, is) and no client reads `promptUncompressed` from the response
  // (verified — see SPRINT_O1 report). Only computed when a debug build/env
  // actually wants it, instead of unconditionally on every production
  // render.
  const uncompressed = profiler.mark('prompt_serialize_uncompressed', () => (RENDER_DEBUG_LOG ? serializeOpenAI({ instruction }) : null))
  debugLog(`Uncompressed prompt (${uncompressed?.length ?? 0} chars):`)
  debugLog(uncompressed)

  // Layer-Based Prompt Compression (Sprint PR-04) — replaces the old fixed
  // Anchor/Material/Other/Negatives buckets, which truncated by raw word
  // count with no concept of which content mattered more. Built from
  // `entries` (per-item, pre-merge) so each layer is exactly one
  // category's own resolved content — Material Color can never again be
  // silently cut just because it happened to serialize after Model
  // Thobe's now-richer content inside one shared bucket.
  const layerCompression = profiler.mark('prompt_compression', () => {
    const promptLayers = buildPromptLayers({ entries, masterRecipe, identityTemplate: LAYER1_IDENTITY_TEMPLATE, referenceBackedCategories: referenceBacked })
    return compressPromptByLayers(promptLayers)
  })

  logStage('🔵', 'STAGE 5b: LAYER-BASED COMPRESSION (~270 token budget)')
  debugTable(layerCompression.layerReport)

  // Phase 4 (Sprint PR-04) — Priority 0 (Identity/Model Thobe/Look
  // Cutting/Material/Material Color) is NEVER truncated or dropped to make
  // room. If it alone exceeds the token budget, the render is refused
  // outright rather than silently deleting one of those layers.
  if (!layerCompression.ok) {
    debugLog(`  ❌ ${layerCompression.error}`)
    outcome = { status: 'failed', requestCount: 0, retryCount: 0, model: null, errorMessage: layerCompression.error ?? 'Compression failed.' }
    return NextResponse.json(
      { success: false, error: layerCompression.error, componentsMissing, layerReport: layerCompression.layerReport, renderId },
      { status: 422 },
    )
  }

  // Phase 5 (Sprint PR-04) — final safety net before the OpenAI call.
  // Identity/Model Thobe/Material/Material Color are always required once
  // Capability Engine hasn't already blocked the render; Look Cutting is
  // only required when the customer actually selected a real one (it is a
  // legitimate "(None)" optional field — see design-studio/types.ts's
  // OPTIONAL_FIELDS — so its absence on its own is never an error).
  const lookCuttingSelected = entries.some((e) => e.category === 'look_cutting')
  const requiredPriorityZeroIds = ['identity', 'model_thobe', 'material', 'material_color', ...(lookCuttingSelected ? ['look_cutting'] : [])]
  const priorityZeroCheck = validatePriorityZeroIntact(layerCompression.layerReport, requiredPriorityZeroIds)
  if (!priorityZeroCheck.valid) {
    const message = `Prompt akhir kehilangan layer wajib sebelum dikirim ke OpenAI: ${priorityZeroCheck.missing.join(', ')}.`
    debugLog(`  ❌ ${message}`)
    outcome = { status: 'failed', requestCount: 0, retryCount: 0, model: null, errorMessage: message }
    return NextResponse.json(
      { success: false, error: message, componentsMissing, layerReport: layerCompression.layerReport, renderId },
      { status: 422 },
    )
  }

  debugLog(`\nCompressed prompt (~${layerCompression.totalTokens} tokens):`)
  debugLog(layerCompression.compressed)

  debugLog(`\nReference images sent to OpenAI: ${referenceImageUrls.length ? referenceImageUrls.join(', ') : 'none'}`)

  // Reference DNA Architecture V1 + AI Asset Library — the SILHOUETTE-only
  // (Model Reference) and/or COLLAR_SHAPE-only (Collar Reference) caveats
  // are appended only for whichever reference images are actually
  // included, so GPT Image never mistakes a reference photo's own
  // collar/cuff/fabric/color for what to render.
  const finalPrompt = profiler.mark('asset_instructions', () => applyAssetInstructions(layerCompression.compressed, composedAssets))

  // Reference images were kicked off (STAGE 2.5) concurrently with Recipe
  // Composer/Prompt Builder/Compression above — awaited here, right before
  // they're actually needed, so generateImage() never re-downloads them.
  const referenceImageFiles = await referenceImagesPromise

  // Request Counter / Controlled Retry (Sprint O, Task 2/4) — replaces the
  // bare generateImage() call. maxApplicationRetries defaults to 0 (see
  // renderSession/service.ts), so this is currently identical in behavior
  // to a single generateImage() call — the difference is that every
  // attempt is now counted and the count is persisted, instead of the
  // OpenAI SDK's own default retries (now disabled, src/lib/ai/client.ts)
  // silently happening with zero record of it ever occurring.
  const { result, requestCount, retryCount, attempts, usage } = await generateImageWithControlledRetry({
    input: { instruction, referenceImageUrls, referenceImageFiles, promptOverride: finalPrompt },
  })

  // Sprint O.1 (Task 1/5) — one 'openai_request' stage per real network
  // attempt (controlled retries included), so Render Profiler's
  // providerDurationMs reflects every OpenAI call this request actually
  // made, not just the last one.
  attempts.forEach((attempt, index) => {
    profiler.record(`openai_request_attempt_${index + 1}`, attempt.requestSentAt, attempt.responseReceivedAt)
  })

  logStage('✅', 'STAGE 6: IMAGE SERVICE RESULT')
  debugLog(
    result.ok
      ? `success — ${result.images.length} image(s) returned (requests: ${requestCount}, retries: ${retryCount})`
      : `❌ error: ${result.error} (requests: ${requestCount}, retries: ${retryCount})`,
  )

  if (!result.ok) {
    outcome = { status: 'failed', requestCount, retryCount, model: DEFAULT_MODEL, errorMessage: result.error }
    return NextResponse.json({ success: false, error: result.error, renderId }, { status: 502 })
  }

  const responseBody = profiler.mark('save_result', () => {
    const body = {
      success: true,
      renderId,
      renderedImageUrl: result.images[0]?.url ?? null,
      promptUsed: finalPrompt,
      promptLayerReport: layerCompression.layerReport,
      promptTotalTokens: layerCompression.totalTokens,
      componentsUsed: resolved.map(({ option }) => ({ id: option.id, name: option.name, category: option.category })),
      componentsMissing,
      capability,
      referenceImageStatus: {
        modelReference: modelReferenceStatus,
        collarReference: collarReferenceStatus,
        plaketReference: plaketReferenceStatus,
        pocketReference: pocketReferenceStatus,
      },
      // Sprint O.1 (Task 3) — `promptUncompressed`/`debug` were computed and
      // sent on every production response with zero confirmed consumers
      // (verified — see SPRINT_O1 report); the 2026-07-28 comment on
      // `debug`'s original addition already called it temporary ("Remove
      // once the loss is root-caused"). Kept available on demand
      // (RENDER_DEBUG_LOG) for exactly the investigation it was built for,
      // instead of shipping on every render regardless of need.
      ...(RENDER_DEBUG_LOG
        ? {
            promptUncompressed: uncompressed,
            debug: {
              masterRecipe,
              instruction,
              instructionValidation,
              referenceImageUrls,
              aiAssetComposer: composedAssets,
              referenceBackedCategories: Array.from(referenceBacked),
              dnaState: { hash: dnaHash },
              dirtyLayers: dirty,
            },
          }
        : {}),
    }

    // Render Cache (Task 6) — only a successful render is ever cached, so a
    // 422/502 (e.g. incomplete master data) never sticks around and blocks a
    // later request once the underlying data is fixed.
    setCachedRender(dnaHash, body)
    return body
  })

  outcome = { status: 'success', requestCount, retryCount, model: DEFAULT_MODEL, errorMessage: null, providerUsage: usage ?? null }
  return NextResponse.json(responseBody)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unhandled exception in render pipeline.'
    console.error('[render/route] unhandled exception:', message)
    outcome = { status: 'failed', requestCount: 0, retryCount: 0, model: null, errorMessage: message }
    return NextResponse.json({ success: false, error: message, renderId }, { status: 500 })
  } finally {
    // Render Profiler (Sprint O.1, Task 1/2/8) — computed once, here, so
    // EVERY exit path (success, 4xx validation, 5xx error) gets its
    // breakdown persisted, not just a successful render.
    const profileReport = profiler.report()
    if (RENDER_DEBUG_LOG) console.table(formatProfileReport(profileReport))

    await finishRenderSession({
      supabase,
      historyRowId,
      renderId,
      startedAt,
      status: outcome.status,
      requestCount: outcome.requestCount,
      retryCount: outcome.retryCount,
      model: outcome.model,
      provider: outcome.provider,
      errorMessage: outcome.errorMessage,
      preprocessingDurationMs: profileReport.preprocessingDurationMs,
      providerDurationMs: profileReport.providerDurationMs,
      postprocessingDurationMs: profileReport.postprocessingDurationMs,
      providerUsage: outcome.providerUsage,
    })
  }
}
