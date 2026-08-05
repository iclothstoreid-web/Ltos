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
  validateCollarReference,
  validatePlaketReference,
  validatePocketReference,
  referenceBackedCategories,
} from '@/lib/design/aiAssetComposer/composer'
import { REFERENCE_CATEGORY_REGISTRY } from '@/lib/design/aiAssetComposer/registry'
import { GLOBAL_BASE_HERO_IMAGE_URL } from '@/lib/design/renderEngine/baseHero'
import { GLOBAL_REFERENCE_POLICY_GEOMETRY } from '@/lib/design/renderEngine/globalReferencePolicy'
import { buildReferenceBindingMap } from '@/lib/design/renderEngine/referenceBindingMap'
import { applyCollarComponentIdentity } from '@/lib/design/componentDefaultKnowledge/collar'
import type { CollarConstructionType } from '@/lib/design/componentDefaultKnowledge/collar'
import type { AssetInstructionLayer } from '@/lib/design/promptBuilder/compression'
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
  // DNA Color's `prompt` in as this row's ai_dna.referenceInstruction and
  // mark it ready IN-MEMORY ONLY (never persisted) so DNA Resolver's existing
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
        const colorText =
          dnaColor?.prompt || [dnaColor?.character, dnaColor?.family, dnaColor?.hex].filter(Boolean).join(', ')
        if (!colorText) return

        row.ai_dna = {
          ...row.ai_dna,
          status: row.ai_dna.status === 'pending' ? 'draft' : row.ai_dna.status,
          referenceInstruction: colorText,
        }
        row.render_recipe = {
          ...row.render_recipe,
          status: row.render_recipe.status === 'empty' ? 'configured' : row.render_recipe.status,
        }
      })
    })
  }

  // Material Resolver audit (2026-08-05) — same false-blocker pattern as
  // warna_bahan above, one category over. 'bahan' (Material) rows source
  // their real content from ai_dna (Hero Image/Reference Instruction/Lock
  // Rules/Negative Rules) and Component Default Knowledge (Engine,
  // componentDefaultKnowledge/registry.ts's `bahan` slot), never
  // render_recipe — but render_recipe.status still sits at the DB default
  // ('empty') forever for these rows since nothing in this app's UI ever
  // writes it to 'configured' (RenderRecipeSection.tsx only displays status,
  // never edits it). DNA Resolver's `validate()` (dnaResolver/resolver.ts,
  // untouched by this fix) still treats that as "not ready" and blocks the
  // render, even though ai_dna already has everything Material needs. Mark
  // it ready IN-MEMORY ONLY (never persisted) — only when ai_dna itself
  // already has real authored content (status !== 'pending', the exact same
  // condition DNA Resolver's own aiDna check one field over already
  // requires), so a genuinely-empty Material row is still correctly blocked.
  // No extra Supabase fetch needed (unlike warna_bahan's dna_colors join) —
  // Material's real content already lives on this same row's ai_dna. Does
  // not touch DNA Resolver, Recipe Composer, Compression, or Component
  // Default Knowledge at all.
  rowsById.forEach((row) => {
    if (row.category !== 'bahan' || row.ai_dna.status === 'pending') return
    row.render_recipe = {
      ...row.render_recipe,
      status: row.render_recipe.status === 'empty' ? 'configured' : row.render_recipe.status,
    }
  })

  // Look Cutting Architecture Lock (2026-08-05) — Look Cutting is NOT a
  // Visual Component: no Hero Image, no AI Asset, no Reference Image, no
  // Component Default Knowledge (componentDefaultKnowledge/registry.ts's
  // `look_cutting` slot stays EMPTY, untouched by this fix). It carries only
  // Variant Delta Knowledge — silhouette/fit/ease/shaping text on ai_dna
  // (referenceInstruction/lockRules/negativeRules) — the exact same "real
  // content already lives on ai_dna, render_recipe/status is vestigial"
  // shape as the bahan fix above, one category over. Unlike bahan though,
  // Look Cutting's own `ai_dna.status` can ALSO be stuck at 'pending' even
  // with real referenceInstruction text already authored (audited finding,
  // "Slim Fit" — see RND-20260805-000007): the only UI path that ever
  // advances ai_dna.status (AiDesignDnaSection's Activate button) is gated
  // on a catalog photo Look Cutting was never meant to need, so status
  // alone is not a trustworthy readiness signal here. Gate on the presence
  // of real Variant Delta Knowledge instead (referenceInstruction — the
  // same "don't bypass a genuinely-empty item" guard as warnaBahanRows' own
  // `if (!colorText) return` above), then mark BOTH ai_dna.status and
  // render_recipe.status ready IN-MEMORY ONLY, never persisted. Does not
  // touch DNA Resolver, Recipe Composer, Compression, or Component Default
  // Knowledge at all.
  rowsById.forEach((row) => {
    if (row.category !== 'look_cutting' || !row.ai_dna.referenceInstruction) return
    row.ai_dna = {
      ...row.ai_dna,
      status: row.ai_dna.status === 'pending' ? 'draft' : row.ai_dna.status,
    }
    row.render_recipe = {
      ...row.render_recipe,
      status: row.render_recipe.status === 'empty' ? 'configured' : row.render_recipe.status,
    }
  })

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

      // Architecture Lock (2026-08-04) — Model Thobe is catalog-only now
      // (thumbnail/name/description/selling point). It never contributes
      // Hero Image, Reference Instruction, Lock Rules, or Negative Rules to
      // Prompt Assembly, so it's excluded from DNA resolution entirely here
      // — never resolved, never pushed to `resolved` (so it never reaches
      // Recipe Composer's `entries`), and never a possible
      // `componentsMissing`/`unresolvedComponents` entry (so a pending/
      // invalid Model Thobe DNA can no longer block a render either — see
      // capabilityEngine/engine.ts).
      if (option.category === 'model_thobe') {
        debugLog(`  ├─ ${selection.componentType} → "${option.name}" [category=model_thobe] — catalog-only, excluded from Prompt Assembly`)
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
  const componentDnaResults = componentSelections
    .filter((s) => rowsById.get(s.componentId)?.category !== 'model_thobe')
    .map((s) => rowsById.get(s.componentId))
    .filter((option): option is MasterDataOption => !!option)
    .map((option) => {
      const validation = validateComponentDna({ itemId: option.id, category: option.category, aiDna: option.ai_dna })
      return { itemId: option.id, category: option.category, valid: validation.valid }
    })

  // AI Asset Library — kerah (Collar), plaket (Placket), and saku (Pocket)
  // each reuse the same "found regardless of resolve success" raw lookup
  // (validateCollarReference/validatePlaketReference/validatePocketReference
  // never block a render — Sprint AI Stability Phase 2 extended Plaket/
  // Pocket onto the exact mechanism Collar already used).
  //
  // Sprint R-05 (Phase 3) — loops over REFERENCE_CATEGORY_REGISTRY instead
  // of one hardcoded `find()` block per category. Model Thobe no longer has
  // an entry in that registry (Architecture Lock, 2026-08-04), so this loop
  // no longer needs a model_thobe special case at all.
  const referenceOptionByCategory = new Map<string, MasterDataOption | null>()
  REFERENCE_CATEGORY_REGISTRY.forEach((def) => {
    const selection = componentSelections.find((s) => rowsById.get(s.componentId)?.category === def.category)
    referenceOptionByCategory.set(def.category, selection ? (rowsById.get(selection.componentId) ?? null) : null)
  })
  const collarOptionRaw = referenceOptionByCategory.get('kerah') ?? null
  const plaketOptionRaw = referenceOptionByCategory.get('plaket') ?? null
  const pocketOptionRaw = referenceOptionByCategory.get('saku') ?? null

  const composedAssets = profiler.mark('asset_composer', () =>
    composeAiAssets({
      customerPhotoUrl,
      collarOption: collarOptionRaw,
      plaketOption: plaketOptionRaw,
      pocketOption: pocketOptionRaw,
    }),
  )

  // Global Base Hero (Architecture Lock, 2026-08-04) — the sole Global
  // Canvas owned by the Render Engine, always included when configured,
  // independent of which components were selected. composeAiAssets itself
  // is untouched; this augments its output only, inserted right after the
  // customer photo and before every AI-Asset-Composer-produced reference,
  // per the locked pipeline order (Customer Photo + Base Hero Model +
  // Component Identity Knowledge + Component Variant Knowledge + Material +
  // Color). No-op while renderEngine/baseHero.ts's constant is null (no
  // image has been uploaded yet).
  const baseHeroAvailable = GLOBAL_BASE_HERO_IMAGE_URL !== null
  const referenceImageUrls = GLOBAL_BASE_HERO_IMAGE_URL
    ? [composedAssets.urls[0], GLOBAL_BASE_HERO_IMAGE_URL, ...composedAssets.urls.slice(1)]
    : composedAssets.urls

  // Reference Image diagnostics (Sprint PR-01, P6; extended Sprint AI
  // Stability Phase 2) — validateCollarReference/validatePlaketReference/
  // validatePocketReference already existed (or now mirror what already
  // existed) but were never called anywhere in production; wiring them in
  // is what turns "reference image silently omitted" into a reported
  // reason. Model Reference's equivalent diagnostic is gone along with the
  // concept itself — Base Hero availability is just `baseHeroAvailable`
  // above, a plain boolean, since it isn't tied to any MasterDataOption.
  const collarReferenceStatus = validateCollarReference({ collarOption: collarOptionRaw, composed: composedAssets })
  const plaketReferenceStatus = validatePlaketReference({ plaketOption: plaketOptionRaw, composed: composedAssets })
  const pocketReferenceStatus = validatePocketReference({ pocketOption: pocketOptionRaw, composed: composedAssets })
  debugLog(`Base Hero Model: ${baseHeroAvailable ? '✅ configured' : '— not configured (renderEngine/baseHero.ts)'}`)
  debugLog(`Collar Reference: ${collarReferenceStatus.valid ? '✅' : '—'} ${collarReferenceStatus.reason}`)
  debugLog(`Plaket Reference: ${plaketReferenceStatus.valid ? '✅' : '—'} ${plaketReferenceStatus.reason}`)
  debugLog(`Pocket Reference: ${pocketReferenceStatus.valid ? '✅' : '—'} ${pocketReferenceStatus.reason}`)

  // Reference-First — categories whose Hero Image is actually being sent
  // this render (derived from composedAssets above, the same
  // isAiAssetActive gate that decided the image itself). Still used below
  // to decide which AI Asset caveat instruction layers apply and for debug
  // logging; no longer used to prune garment text (Reference-First Cleanup
  // removed the narrative fields that pruning used to target — every
  // category's `garment.referenceInstruction` is already right-sized).
  const referenceBacked = referenceBackedCategories(composedAssets)
  debugLog(`Reference-backed categories (photo sent): [${Array.from(referenceBacked).join(', ') || 'none'}]`)

  const unresolvedComponents: UnresolvedComponent[] = componentsMissing.map((m) => ({
    itemId: m.componentId,
    category: m.componentType,
    reason: m.reason,
  }))

  const capability = profiler.mark('capability_engine', () =>
    evaluateCapability({
      customerPhotoPresent: !!customerPhotoUrl,
      baseHeroAvailable,
      componentDnaResults,
      unresolvedComponents,
    }),
  )

  logStage('🟠', 'STAGE 2.5: AI CAPABILITY ENGINE')
  debugLog(`Mode: ${capability.mode} | Score: ${capability.capabilityScore}% | Quality: ${capability.qualityLevel}/5`)
  debugLog(`Warnings: [${capability.warnings.join(' | ') || 'none'}]`)

  // Fail Fast (P3/P8): a selected component that never resolved, or a
  // missing Customer Photo, are now the ONLY conditions allowed to stop a
  // render before OpenAI (Architecture Lock, 2026-08-04, removed the old
  // Model-Thobe-Anchor conditions — see capabilityEngine/engine.ts). No
  // more rendering ahead with a silently-dropped component.
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
  const referenceImagesPromise = profiler.markAsync('reference_image_fetch', () => prefetchReferenceImages(referenceImageUrls))
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
  const rawEntries: RenderRecipeEntry[] = resolved.map(({ option, recipe }, index) => ({
    itemId: option.id,
    category: option.category,
    recipe,
    priority: index,
  }))

  // Component Default Knowledge — Collar (locked brief, 2026-08-05). Recipe
  // Composer below is unmodified and only ever resolves Component Default
  // Knowledge by category (empty for 'kerah', see componentDefaultKnowledge/
  // registry.ts); this injects the item's own construction_type-selected
  // default (COLLAR_DEFAULT_1/COLLAR_DEFAULT_2) directly into its entry
  // before Composer runs — see componentDefaultKnowledge/collar.ts's own
  // comment for why this is safe to do without touching Composer itself.
  const collarConstructionTypeByItemId = new Map<string, CollarConstructionType | null>(
    resolved
      .filter(({ option }) => option.category === 'kerah')
      .map(({ option }) => [option.id, (option.construction_type as CollarConstructionType | null) ?? null])
  )
  const entries: RenderRecipeEntry[] = applyCollarComponentIdentity(rawEntries, collarConstructionTypeByItemId)

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
  const instruction = profiler.mark('prompt_builder', () => buildRenderInstruction(masterRecipe))
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
  // Engine) — reused here, not recomputed. `referenceImageUrls` (computed
  // above, right after composedAssets) naturally reflects
  // capability.strategy.includeBaseHero: the Global Base Hero slot is
  // included whenever GLOBAL_BASE_HERO_IMAGE_URL is configured, independent
  // of Collar/Plaket/Pocket AI Asset availability, which composeAiAssets
  // still gates per-item exactly as before.

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

  // Sprint R-04 — AI Asset caveat instructions (SILHOUETTE-only/COLLAR_
  // SHAPE-only/PLAKET_SHAPE-only/POCKET_SHAPE-only) built as layer
  // candidates here, one per reference actually composed in this request,
  // so they enter compressPromptByLayers alongside everything else instead
  // of being concatenated onto the compressed string afterward (the old
  // `applyAssetInstructions` call, removed below — see compression.ts's
  // AssetInstructionLayer doc comment for why that broke the token audit).
  // Sprint R-05 (Phase 3) — loops over REFERENCE_CATEGORY_REGISTRY instead
  // of 4 hardcoded ternaries; `composedAssets.referencesByCategory` (Sprint
  // R-05) is the one generic map every "is category X active" question here
  // reads from.
  //
  // Reference-First Cleanup / Duplication Fix — this layer carries ONLY the
  // registry's static caveat text. An earlier revision also appended the
  // item's own `ai_dna.referenceInstruction` here, but that text is ALSO
  // always present in this same category's own DNA slot / component layer
  // below (`garment.referenceInstruction`, set unconditionally by
  // dnaResolver/resolver.ts's buildGarmentSpec regardless of reference-
  // backed status) — sending both meant GPT Image received the identical
  // instruction twice for every reference-backed category. Reference
  // Instruction now has exactly one source in finalPrompt: `garment.
  // referenceInstruction`. This layer's content is unchanged from before
  // that duplication was introduced.
  const assetInstructionLayers: AssetInstructionLayer[] = REFERENCE_CATEGORY_REGISTRY.filter((def) =>
    composedAssets.referencesByCategory.has(def.category),
  ).map((def) => ({ id: `asset_instruction:${def.idSuffix}`, label: def.instructionLabel, content: def.instruction }))

  // Reference Policy Refactor (Sprint A, 2026-08-05) — the shared framing
  // every geometry-type AI Asset Instruction above now omits (hoisted to
  // GLOBAL_REFERENCE_POLICY_GEOMETRY, renderEngine/globalReferencePolicy.ts)
  // is sent here ONCE, as its own Priority 0 layer, instead of once per
  // active geometry-type reference — no change to AI Asset Composer, no
  // change to which/how many Hero Images are sent, only where this one
  // shared sentence lives in the assembly. Gated the same way every
  // asset_instruction layer already is: only when at least one geometry
  // reference (Collar/Plaket/Pocket) is actually active this render, so a
  // render with none of them selected pays nothing for it, same as before.
  // Priority 0 Budget Reserve (2026-08-05) — gate widened to `||
  // baseHeroAvailable`: this layer's content now also carries Base Hero's
  // silhouette-only/ignore-the-person instruction (globalReferencePolicy.ts's
  // own comment), and Base Hero is sent on every render independent of
  // whether any Collar/Plaket/Pocket reference is active.
  if (assetInstructionLayers.length > 0 || baseHeroAvailable) {
    assetInstructionLayers.unshift({
      id: 'asset_instruction:global_reference_policy_geometry',
      label: 'Global Reference Policy (Geometry)',
      content: GLOBAL_REFERENCE_POLICY_GEOMETRY,
    })
  }

  // Reference Binding Architecture V2 (2026-08-05) — root cause audit found
  // OpenAI's images.edit has no label/role/id/metadata field for an
  // individual image (verified against the installed SDK's own
  // ImageEditParamsBase type: `image` is a plain `Uploadable[]`), and the
  // prompt itself never bound a specific image to its role. This layer
  // closes that gap: built ENTIRELY from which images are actually active
  // this render (never a static "Image 1/2/3" list — see
  // renderEngine/referenceBindingMap.ts's own doc comment), one role
  // sentence per image, naming only what the image represents — no Lock
  // Rules/Negative Rules/Quality/Camera/Lighting/Material/Color, and no
  // detailed geometry (that stays exclusively in Component Delta below,
  // never duplicated here). Broader condition than the geometry-policy
  // block above: Customer Photo (and often Base Hero) are active even when
  // zero geometry-type categories are selected, so this uses its own
  // independent gate (`buildReferenceBindingMap` returns '' when nothing
  // qualifies) rather than reusing `assetInstructionLayers.length > 0`.
  // Unshifting AFTER the block above places this layer in front of
  // Global Reference Policy Geometry (which is itself in front of every
  // Component Delta) — Identity -> Reference Binding Map -> Global
  // Reference Policy -> Component Delta, as required.
  const referenceBindingMapContent = buildReferenceBindingMap({
    customerPhoto: true,
    baseHero: baseHeroAvailable,
    collar: composedAssets.referencesByCategory.has('kerah'),
    placket: composedAssets.referencesByCategory.has('plaket'),
    pocket: composedAssets.referencesByCategory.has('saku'),
  })
  if (referenceBindingMapContent) {
    assetInstructionLayers.unshift({
      id: 'asset_instruction:reference_binding_map',
      label: 'Reference Binding Map',
      content: referenceBindingMapContent,
    })
  }

  // Layer-Based Prompt Compression (Sprint PR-04) — replaces the old fixed
  // Anchor/Material/Other/Negatives buckets, which truncated by raw word
  // count with no concept of which content mattered more. Built from
  // `entries` (per-item, pre-merge) so each layer is exactly one
  // category's own resolved content — Material Color can never again be
  // silently cut just because it happened to serialize after Model
  // Thobe's now-richer content inside one shared bucket.
  const layerCompression = profiler.mark('prompt_compression', () => {
    const promptLayers = buildPromptLayers({
      entries,
      masterRecipe,
      identityTemplate: LAYER1_IDENTITY_TEMPLATE,
      assetInstructions: assetInstructionLayers,
    })
    return compressPromptByLayers(promptLayers)
  })

  logStage('🔵', 'STAGE 5b: LAYER-BASED COMPRESSION (~1200 token budget)')
  debugTable(layerCompression.layerReport)

  // Phase 4 (Sprint PR-04) — Priority 0 (Identity/Negative Rules/active AI
  // Asset Instructions/Model Thobe/Look Cutting/Material/Material Color) is
  // NEVER truncated or dropped to make room. If it alone exceeds the token
  // budget, the render is refused outright rather than silently deleting
  // one of those layers.
  if (!layerCompression.ok) {
    debugLog(`  ❌ ${layerCompression.error}`)
    outcome = { status: 'failed', requestCount: 0, retryCount: 0, model: null, errorMessage: layerCompression.error ?? 'Compression failed.' }
    return NextResponse.json(
      { success: false, error: layerCompression.error, componentsMissing, layerReport: layerCompression.layerReport, renderId },
      { status: 422 },
    )
  }

  // Phase 5 (Sprint PR-04, extended Sprint R-04) — final safety net before
  // the OpenAI call. Identity/Negative Rules/Lock Rules/Quality Foundation/
  // Global Render Recipe/Material/Material Color are always required once
  // Capability Engine hasn't already blocked the render; Look Cutting and
  // each AI Asset Instruction are only required when applicable to THIS
  // request (Look Cutting is a legitimate "(None)" optional field —
  // design-studio/types.ts's OPTIONAL_FIELDS; an Asset Instruction is only
  // meaningful when its reference was actually composed in — see
  // composedAssets above).
  // Architecture Lock (2026-08-04) — 'model_thobe' removed from this list.
  // It's excluded from `entries` entirely now (catalog-only), so it can
  // never appear in layerReport — requiring it here would hard-fail every
  // render.
  // Engine Priority Refactor (2026-08-04) — 'quality_foundation'/
  // 'global_render_recipe' added: both are now Priority 0
  // (promptBuilder/compression.ts's buildPromptLayers) and, like Identity/
  // Material/Material Color, always have non-empty content on every render
  // (renderEngine/qualityFoundation.ts, renderEngine/globalRenderRecipe.ts —
  // fixed Engine defaults, never per-item-dependent) — same explicit
  // defense-in-depth convention already applied to the other always-present
  // Priority 0 layers, not a new kind of check.
  const lookCuttingSelected = entries.some((e) => e.category === 'look_cutting')
  const requiredPriorityZeroIds = [
    'identity',
    'negative_rules',
    'lock_rules',
    'quality_foundation',
    'global_render_recipe',
    'material',
    'material_color',
    ...(lookCuttingSelected ? ['look_cutting'] : []),
    ...assetInstructionLayers.map((layer) => layer.id),
  ]
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

  // Sprint R-04 — `layerCompression.compressed` IS the final prompt now;
  // AI Asset Instructions already went through compressPromptByLayers as
  // Priority 0 layers above, so there is nothing left to concatenate here.
  // This is what makes the audited `layerReport`/`totalTokens` (Sprint
  // R-03's whole complaint) match what actually reaches OpenAI, byte for
  // byte — no post-compression step can silently grow the prompt again.
  const finalPrompt = layerCompression.compressed

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
        baseHeroAvailable,
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
