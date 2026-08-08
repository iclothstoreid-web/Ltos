import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { MasterDataCategory, MasterDataOption } from '@/lib/design/masterData'
import { resolveDNA } from '@/lib/design/dnaResolver/resolver'
import type { DNAResolverInput } from '@/lib/design/dnaResolver/types'
import type { RenderRecipe } from '@/lib/design/renderRecipe/types'
import { buildFinalPrompt } from '@/lib/design/promptBuilder/finalPrompt'
import { DEFAULT_MODEL } from '@/lib/ai/services/image'
import { startRenderSession, finishRenderSession, generateImageWithControlledRetry } from '@/lib/ai/renderSession/service'
import {
  composeAiAssets,
  validateCollarReference,
  validatePlaketReference,
  validatePocketReference,
  validateMansetReference,
  referenceBackedCategories,
} from '@/lib/design/aiAssetComposer/composer'
import { REFERENCE_CATEGORY_REGISTRY } from '@/lib/design/aiAssetComposer/registry'
import { GLOBAL_BASE_HERO_IMAGE_URL } from '@/lib/design/renderEngine/baseHero'
import { validateComponentDna } from '@/lib/design/promptValidation/dnaValidator'
import { evaluateCapability } from '@/lib/design/capabilityEngine/engine'
import type { UnresolvedComponent } from '@/lib/design/capabilityEngine/engine'
import type { DnaState } from '@/lib/design/dnaState/types'
import { hashDnaState } from '@/lib/design/dnaState/hash'
import { detectDirtyLayers } from '@/lib/design/dirtyLayer/detect'
import { getCachedRender, setCachedRender } from '@/lib/design/renderCache/cache'
import { createRenderProfiler, formatProfileReport } from '@/lib/ai/renderProfiler/profiler'
import { prefetchReferenceImages } from '@/lib/ai/services/image'
import type { ProviderUsage } from '@/lib/ai/services/image'
import { generateIdentityProtectionMask } from '@/lib/ai/services/identityMask'

// Debug logging (2026-07-28) — this endpoint's real callers have been
// reporting collar/pocket/color loss in rendered output with no visibility
// into which pipeline stage drops them. These logs make every stage's
// actual data inspectable (server console + response.debug) without
// altering any of the pipeline's own logic — pure observation, no new
// behavior. Remove once the loss is root-caused.
//
// Sprint O.1 (Task 3/6, Audit Duplicate Work) — a real profiling probe this
// sprint (see SPRINT_O1 report) measured this whole diagnostic block at
// well under 1ms of CPU per request — not the latency bottleneck (OpenAI's
// own generation time is ~99%+ of total). Gated behind RENDER_DEBUG_LOG so
// it costs nothing on a production render by default.
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

// Incremental Render Engine V1 (Task 3/6/7) — remembers only the most
// recently *processed* DNA State for this server process, purely so Dirty
// Layer Detection has something to diff against for the debug log below.
// Never read for any business decision (it is not per-consultation, not
// persisted) — Render Cache is what actually decides hit/miss; this is
// observation only, same convention as the STAGE 1-6 debug logging.
let lastDnaState: DnaState | null = null

// Design Render orchestration endpoint — DNA Resolver -> Prompt Builder ->
// Image Service, gated by the AI Capability Engine.
//
// Prompt UAT Source of Truth realignment (this sprint) — Recipe Composer,
// Component Default Knowledge, and the old 13-fixed-section/token-budget
// Prompt Builder (promptBuilder/compression.ts) are retired. The Prompt
// Final is now a fixed 10-block concatenation (Identity Lock/Reference
// Binding/Garment/Material/Color/Kerah/Plaket/Saku/Manset/Output, see
// promptBuilder/finalPrompt.ts) with zero wrappers/labels — Material/Color/
// Kerah/Plaket/Saku/Manset each contribute exactly their own selected
// item's ai_dna.referenceInstruction (Color: its `color` field, per DNA
// Resolver's own carve-out), read directly off `resolved` below. DNA
// Resolver itself, the AI Capability Engine, and AI Asset Composer (which
// Hero Images actually attach as images) are all unchanged — this
// realignment only changes what TEXT becomes the final prompt string, never
// which components block a render or which images are sent.
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

  // Identity Protection Mask (Render Investigation, 2026-08-06) — kicked
  // off as early as possible (customerPhotoUrl, just validated above, is
  // its only input), so its OpenAI vision-detection call overlaps every
  // CPU-bound stage below instead of adding to the critical path. Awaited
  // right before the image-generation call, alongside
  // referenceImagesPromise. Never blocks or fails a render — a mask that
  // can't be safely built (no clear face, unusual EXIF orientation, the
  // detection call itself failing) resolves to null, and the render
  // proceeds exactly as it did before this feature existed — see
  // identityMask.ts's fail-open contract.
  const identityMaskPromise = generateIdentityProtectionMask(customerPhotoUrl)
  identityMaskPromise.catch(() => {})

  const supabase = createClient()
  const {
    data: { user },
  } = await profiler.markAsync('auth_check', () => supabase.auth.getUser())

  // Render Request Lock (Sprint O, Task 1) — acquired BEFORE any pipeline
  // work starts, so a rejected (locked) request never pays for the DNA
  // Resolver work either, not just the OpenAI call. See
  // src/lib/ai/renderSession/service.ts for the DB-constraint-backed (not
  // check-then-act) locking mechanism.
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
  // supplier_color_code is never read here. Does not touch DNA Resolver at
  // all.
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
  // their real content from ai_dna.referenceInstruction, never
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
  rowsById.forEach((row) => {
    if (row.category !== 'bahan' || row.ai_dna.status === 'pending') return
    row.render_recipe = {
      ...row.render_recipe,
      status: row.render_recipe.status === 'empty' ? 'configured' : row.render_recipe.status,
    }
  })

  // Collar (Kerah) false-blocker fix (Final Pipeline Validation, 2026-08-06)
  // — the exact same pattern as the bahan fix immediately above, one
  // category over. Mark it ready IN-MEMORY ONLY (never persisted) — only
  // when ai_dna itself already has real authored content (status !==
  // 'pending'), so a genuinely-empty Collar row is still correctly blocked.
  rowsById.forEach((row) => {
    if (row.category !== 'kerah' || row.ai_dna.status === 'pending') return
    row.render_recipe = {
      ...row.render_recipe,
      status: row.render_recipe.status === 'empty' ? 'configured' : row.render_recipe.status,
    }
  })

  // Look Cutting Architecture Lock (2026-08-05) — Look Cutting is NOT a
  // Visual Component: no Hero Image, no AI Asset, no Reference Image. It
  // carries only Variant Delta Knowledge (referenceInstruction text) — the
  // same "real content already lives on ai_dna, render_recipe/status is
  // vestigial" shape as the bahan fix above. Its own `ai_dna.status` can ALSO
  // be stuck at 'pending' even with real referenceInstruction text already
  // authored (the only UI path that ever advances ai_dna.status is gated on
  // a catalog photo Look Cutting was never meant to need), so status alone
  // is not a trustworthy readiness signal here. Gate on the presence of real
  // referenceInstruction text instead, then mark BOTH ai_dna.status and
  // render_recipe.status ready IN-MEMORY ONLY, never persisted. Restored
  // this sprint — Look Cutting's Builder slot is a real, permanent feature,
  // not something the Prompt UAT realignment retires.
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
      // anything to Prompt Assembly, so it's excluded from DNA resolution
      // entirely here.
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
  // never block a render).
  const referenceOptionByCategory = new Map<string, MasterDataOption | null>()
  REFERENCE_CATEGORY_REGISTRY.forEach((def) => {
    const selection = componentSelections.find((s) => rowsById.get(s.componentId)?.category === def.category)
    referenceOptionByCategory.set(def.category, selection ? (rowsById.get(selection.componentId) ?? null) : null)
  })
  const collarOptionRaw = referenceOptionByCategory.get('kerah') ?? null
  const plaketOptionRaw = referenceOptionByCategory.get('plaket') ?? null
  const pocketOptionRaw = referenceOptionByCategory.get('saku') ?? null
  const mansetOptionRaw = referenceOptionByCategory.get('manset') ?? null

  const composedAssets = profiler.mark('asset_composer', () =>
    composeAiAssets({
      customerPhotoUrl,
      collarOption: collarOptionRaw,
      plaketOption: plaketOptionRaw,
      pocketOption: pocketOptionRaw,
      mansetOption: mansetOptionRaw,
    }),
  )

  // Global Base Hero (Architecture Lock, 2026-08-04) — the sole Global
  // Canvas owned by the Render Engine, always included when configured,
  // independent of which components were selected.
  const baseHeroAvailable = GLOBAL_BASE_HERO_IMAGE_URL !== null
  const referenceImageUrls = GLOBAL_BASE_HERO_IMAGE_URL
    ? [composedAssets.urls[0], GLOBAL_BASE_HERO_IMAGE_URL, ...composedAssets.urls.slice(1)]
    : composedAssets.urls

  // Reference Image diagnostics (Sprint PR-01, P6; extended Sprint AI
  // Stability Phase 2).
  const collarReferenceStatus = validateCollarReference({ collarOption: collarOptionRaw, composed: composedAssets })
  const plaketReferenceStatus = validatePlaketReference({ plaketOption: plaketOptionRaw, composed: composedAssets })
  const pocketReferenceStatus = validatePocketReference({ pocketOption: pocketOptionRaw, composed: composedAssets })
  const mansetReferenceStatus = validateMansetReference({ mansetOption: mansetOptionRaw, composed: composedAssets })
  debugLog(`Base Hero Model: ${baseHeroAvailable ? '✅ configured' : '— not configured (renderEngine/baseHero.ts)'}`)
  debugLog(`Collar Reference: ${collarReferenceStatus.valid ? '✅' : '—'} ${collarReferenceStatus.reason}`)
  debugLog(`Plaket Reference: ${plaketReferenceStatus.valid ? '✅' : '—'} ${plaketReferenceStatus.reason}`)
  debugLog(`Pocket Reference: ${pocketReferenceStatus.valid ? '✅' : '—'} ${pocketReferenceStatus.reason}`)
  debugLog(`Cuff Reference: ${mansetReferenceStatus.valid ? '✅' : '—'} ${mansetReferenceStatus.reason}`)

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
  // missing Customer Photo, are the ONLY conditions allowed to stop a
  // render before OpenAI.
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

  // Nothing resolved at all (e.g. every selection was model_thobe, which is
  // catalog-only and never reaches `resolved`) — there is no Prompt Final
  // to assemble beyond the fixed Engine blocks. Mirrors the old
  // "RenderInstruction could not be compiled" gate this replaces.
  if (resolved.length === 0) {
    outcome = {
      status: 'failed',
      requestCount: 0,
      retryCount: 0,
      model: null,
      errorMessage: 'Tidak ada komponen yang berhasil diresolusi untuk Prompt Final.',
    }
    return NextResponse.json({ success: false, error: 'Tidak ada komponen yang berhasil diresolusi.', renderId }, { status: 422 })
  }

  // Reference Image Prefetch (Sprint O.1, Task 4/6) — `composedAssets.urls`
  // is already fully known at this point; the download from Supabase
  // Storage is kicked off here and only awaited right before the OpenAI
  // call, overlapping the download with the CPU-bound stages below.
  const referenceImagesPromise = profiler.markAsync('reference_image_fetch', () => prefetchReferenceImages(referenceImageUrls))
  // Suppress Node's "unhandled promise rejection" warning for the case where
  // an earlier stage below returns/throws before this is ever awaited.
  referenceImagesPromise.catch(() => {})

  // Prompt Builder — Prompt Final (10 fixed blocks, Prompt UAT Source of
  // Truth realignment, this sprint). Material/Color/Kerah/Plaket/Saku/Manset
  // each read straight off `resolved`'s own DNA-Resolver output — no Recipe
  // Composer merge, no Component Rules, no wrapper text. A category not
  // present in `resolved` (not selected, or resolved as empty) simply
  // contributes no block.
  const extractReferenceText = (category: MasterDataCategory): string | null => {
    const entry = resolved.find(({ option }) => option.category === category)
    if (!entry) return null
    const garment = entry.recipe.garment as Record<string, unknown>
    const raw = category === 'warna_bahan' ? garment.color : garment.referenceInstruction
    return typeof raw === 'string' && raw.trim().length > 0 ? raw : null
  }

  logStage('🟢', 'STAGE 3: PROMPT BUILDER — Prompt Final')
  const finalPrompt = profiler.mark('prompt_builder', () =>
    buildFinalPrompt({
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
    }),
  )
  debugLog(`\nPrompt Final (${finalPrompt.length} chars):`)
  debugLog(finalPrompt)
  debugLog(`\nReference images sent to OpenAI: ${referenceImageUrls.length ? referenceImageUrls.join(', ') : 'none'}`)

  // Reference images were kicked off (STAGE 2.5) concurrently with Prompt
  // Builder above — awaited here, right before they're actually needed, so
  // generateImage() never re-downloads them.
  const referenceImageFiles = await referenceImagesPromise
  // Identity Protection Mask — kicked off right after STAGE 1's input
  // validation; awaited here alongside the reference images it doesn't
  // depend on. null (no mask) is a normal, non-error outcome — see
  // identityMask.ts.
  const identityMaskFile = await identityMaskPromise
  debugLog(`Identity Protection Mask: ${identityMaskFile ? '✅ applied (scoped to Customer Photo)' : '— not applied this render (see identityMask.ts fail-open conditions)'}`)

  // Request Counter / Controlled Retry (Sprint O, Task 2/4) — replaces the
  // bare generateImage() call. maxApplicationRetries defaults to 0 (see
  // renderSession/service.ts), so this is currently identical in behavior
  // to a single generateImage() call — the difference is that every
  // attempt is now counted and the count is persisted.
  const { result, requestCount, retryCount, attempts, usage } = await generateImageWithControlledRetry({
    input: { referenceImageUrls, referenceImageFiles, promptOverride: finalPrompt, maskFile: identityMaskFile ?? undefined },
  })

  // Sprint O.1 (Task 1/5) — one 'openai_request' stage per real network
  // attempt (controlled retries included), so Render Profiler's
  // providerDurationMs reflects every OpenAI call this request actually
  // made, not just the last one.
  attempts.forEach((attempt, index) => {
    profiler.record(`openai_request_attempt_${index + 1}`, attempt.requestSentAt, attempt.responseReceivedAt)
  })

  logStage('✅', 'STAGE 4: IMAGE SERVICE RESULT')
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
      componentsUsed: resolved.map(({ option }) => ({ id: option.id, name: option.name, category: option.category })),
      componentsMissing,
      capability,
      referenceImageStatus: {
        baseHeroAvailable,
        collarReference: collarReferenceStatus,
        plaketReference: plaketReferenceStatus,
        pocketReference: pocketReferenceStatus,
        mansetReference: mansetReferenceStatus,
      },
      identityProtectionMask: { applied: identityMaskFile !== null },
      // Sprint O.1 (Task 3) — kept available on demand (RENDER_DEBUG_LOG)
      // for investigation, instead of shipping on every render regardless
      // of need.
      ...(RENDER_DEBUG_LOG
        ? {
            debug: {
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
