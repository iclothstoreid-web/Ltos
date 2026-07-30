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
import { buildCompressedSections, compressPrompt } from '@/lib/design/promptBuilder/compression'
import { generateImage } from '@/lib/ai/services/image'
import { composeAiAssets, applyAssetInstructions } from '@/lib/design/aiAssetComposer/composer'
import { validateComponentDna } from '@/lib/design/promptArchitectureV2/dnaValidator'
import { evaluateCapability } from '@/lib/design/capabilityEngine/engine'
import type { DnaState } from '@/lib/design/dnaState/types'
import { hashDnaState } from '@/lib/design/dnaState/hash'
import { detectDirtyLayers } from '@/lib/design/dirtyLayer/detect'
import { getCachedRender, setCachedRender } from '@/lib/design/renderCache/cache'

// Debug logging (2026-07-28) — this endpoint's real callers have been
// reporting collar/pocket/color loss in rendered output with no visibility
// into which pipeline stage drops them. These logs make every stage's
// actual data inspectable (server console + response.debug) without
// altering any of the pipeline's own logic — pure observation, no new
// behavior. Remove once the loss is root-caused.
const SEP = '='.repeat(80)
function logStage(emoji: string, title: string) {
  console.log(`\n${SEP}\n${emoji} ${title}\n${SEP}`)
}

// Incremental Render Engine V1 (Task 3/6/7) — remembers only the most
// recently *processed* DNA State for this server process, purely so Dirty
// Layer Detection has something to diff against for the debug log below.
// Never read for any business decision (it is not per-consultation, not
// persisted) — Render Cache is what actually decides hit/miss; this is
// observation only, same convention as the STAGE 1-6 debug logging.
let lastDnaState: DnaState | null = null

// Design Render orchestration endpoint — the first live caller of the
// DNA Resolver -> Recipe Composer -> Prompt Builder -> Image Service chain
// (every prior sprint in this pipeline shipped as a library with zero
// callers). Reads real design_master_options rows through the same
// cookie-based, RLS-respecting server client every other route in this app
// uses (src/lib/supabase/server.ts) — no service-role key, matching
// existing convention.
//
// Gracefully handles partial data on purpose: current master data only has
// model_thobe/kerah/warna_bahan rows past pending/empty, so most real
// requests will resolve only a subset of the requested components. A
// component that isn't found or isn't resolvable is reported in
// `componentsMissing`, never treated as a hard failure on its own — the AI
// Capability Engine (Sprint AI-R3, capabilityEngine/engine.ts) is what
// decides render mode/quality from that partial data, and 422 is now
// reserved for exactly 3 conditions (see STAGE 2.5 below): no Customer
// Photo, no Model Thobe selected, or the Model Thobe's own AI Design DNA
// empty/invalid. Everything else degrades gracefully instead of blocking.

interface ComponentSelection {
  componentType: string
  componentId: string
}

interface RenderRequestBody {
  customerPhotoUrl?: string
  componentSelections?: ComponentSelection[]
}

export async function POST(req: NextRequest) {
  let body: RenderRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { customerPhotoUrl, componentSelections } = body

  logStage('🔵', 'STAGE 1: INPUT PAYLOAD')
  console.log(JSON.stringify({ customerPhotoUrl, componentSelections }, null, 2))

  if (!customerPhotoUrl || !Array.isArray(componentSelections) || componentSelections.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Missing customerPhotoUrl or componentSelections.' },
      { status: 400 },
    )
  }

  // DNA State (Task 1) — the request body IS the DNA State; hashing it here,
  // before any Supabase/DNA Resolver/Recipe Composer/OpenAI work happens,
  // is what lets a Render Cache hit skip that entire chain rather than only
  // skip the final image call.
  const dnaState: DnaState = {
    customerPhotoUrl,
    components: componentSelections.map((selection) => ({
      category: selection.componentType,
      itemId: selection.componentId,
    })),
  }
  const dnaHash = hashDnaState(dnaState)

  logStage('🟤', 'STAGE 1.5: DNA STATE HASH + DIRTY LAYER + CACHE LOOKUP')
  const dirty = detectDirtyLayers(lastDnaState, dnaState)
  console.log(`DNA State hash: ${dnaHash}`)
  console.log(`Dirty layers:     [${dirty.dirtyLayers.join(', ') || 'none'}]`)
  console.log(`Unchanged layers: [${dirty.unchangedLayers.join(', ') || 'none'}]`)
  lastDnaState = dnaState

  const cached = getCachedRender<Record<string, unknown>>(dnaHash)
  if (cached) {
    console.log(`✅ Cache HIT (cached at ${cached.cachedAt}) — returning previously rendered result, no re-render.`)
    return NextResponse.json(cached.response)
  }
  console.log('Cache MISS — proceeding with full render pipeline.')

  const supabase = createClient()
  const ids = componentSelections.map((selection) => selection.componentId).filter(Boolean)

  const { data: rows, error } = await supabase.from('design_master_options').select('*').in('id', ids)
  if (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch components.', details: error.message }, { status: 500 })
  }

  logStage('🟡', 'STAGE 2: DNA RESOLVER — components fetched from Supabase')
  console.log(`Requested ${ids.length} id(s), found ${rows?.length ?? 0} row(s) in design_master_options`)

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
  }

  const componentsMissing: { componentId: string; componentType: string; reason: string }[] = []
  const resolved: { option: MasterDataOption; recipe: RenderRecipe }[] = []

  componentSelections.forEach((selection) => {
    const option = rowsById.get(selection.componentId)
    if (!option) {
      console.log(`  ├─ ${selection.componentType} (${selection.componentId}): ⚠️  not_found in Supabase`)
      componentsMissing.push({ ...selection, reason: 'not_found' })
      return
    }

    console.log(`  ├─ ${selection.componentType} → "${option.name}" [category=${option.category}]`)
    console.log(`  │    ai_dna.status=${option.ai_dna.status}  render_recipe.status=${option.render_recipe.status}`)

    const input: DNAResolverInput = {
      itemId: option.id,
      category: option.category,
      aiDna: option.ai_dna,
      renderRecipe: option.render_recipe,
    }
    const { recipe, ready, errors } = resolveDNA(input)
    if (!ready || !recipe) {
      console.log(`  │    ⚠️  not ready: ${errors.join(' ')}`)
      componentsMissing.push({ ...selection, reason: errors.join(' ') })
      return
    }

    console.log(`  │    ✅ resolved — garment keys: [${Object.keys(recipe.garment).join(', ') || 'none'}]`)
    resolved.push({ option, recipe })
  })

  console.log(`\n✅ Resolved ${resolved.length}/${componentSelections.length} component(s); ${componentsMissing.length} missing`)

  // ---------------------------------------------------------------------
  // AI Capability Engine (Sprint AI-R3) — the SOLE gate for whether this
  // render is even attempted. Replaces the old binary "entries.length===0
  // -> 422" / "Model Reference missing -> 422" hard stops (Phase 4 of the
  // brief: "Hapus aturan Model Reference tidak ada -> 422"). Uses raw
  // rowsById lookups (not `resolved`) for the DNA Validator checks below,
  // same convention as the DNA Debug Viewer (debug/route.ts) — a component
  // that failed resolveDNA (e.g. render_recipe.status still 'empty') still
  // gets graded here, it doesn't just silently vanish.
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

  // AI Asset Library — kerah (Collar) reuses the same "found regardless of
  // resolve success" raw lookup as Model Thobe above, since a Collar
  // Reference is optional (validateCollarReference never blocks a render).
  const collarSelection = componentSelections.find((s) => rowsById.get(s.componentId)?.category === 'kerah')
  const collarOptionRaw = collarSelection ? (rowsById.get(collarSelection.componentId) ?? null) : null

  const composedAssets = composeAiAssets({ customerPhotoUrl, modelThobeOption: modelThobeOptionRaw, collarOption: collarOptionRaw })

  const capability = evaluateCapability({
    customerPhotoPresent: !!customerPhotoUrl,
    modelThobeSelected: !!modelThobeOptionRaw,
    modelThobeDnaValid: modelThobeDnaValidation?.valid ?? false,
    modelReferenceAvailable: !!composedAssets.modelReference,
    otherComponentDnaResults,
  })

  logStage('🟠', 'STAGE 2.5: AI CAPABILITY ENGINE')
  console.log(`Mode: ${capability.mode} | Score: ${capability.capabilityScore}% | Quality: ${capability.qualityLevel}/5`)
  console.log(`Warnings: [${capability.warnings.join(' | ') || 'none'}]`)

  // The ONLY 3 conditions allowed to stop a render before OpenAI (Phase 4).
  if (capability.mode === 'BLOCKED') {
    console.log(`  ❌ BLOCKED — ${capability.blockedReason}`)
    return NextResponse.json(
      { success: false, error: capability.blockedReason, componentsMissing, capability },
      { status: 422 },
    )
  }

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
  console.log(`Entries (priority order): ${entries.map((e) => `${e.category}#${e.priority}`).join(', ')}`)
  const masterRecipe = composeRenderRecipe({ entries, policy: DEFAULT_GLOBAL_RENDER_POLICY })
  if (masterRecipe) {
    ;(
      ['camera', 'pose', 'lighting', 'composition', 'focus', 'fabricBehavior', 'visibilityRules', 'garment', 'fabricIdentity', 'stitching', 'embroidery', 'background', 'quality', 'style'] as const
    ).forEach((key) => {
      const keys = Object.keys(masterRecipe[key] ?? {})
      console.log(`  ├─ ${key}: ${keys.length ? `{${keys.join(', ')}}` : '✗ empty'}`)
    })
    console.log(`  └─ negativeRules: [${masterRecipe.negativeRules.join(', ')}]`)
  } else {
    console.log('  ⚠️  composeRenderRecipe returned null')
  }

  logStage('🟢', 'STAGE 4: PROMPT BUILDER — RenderInstruction')
  const instruction = buildRenderInstruction(masterRecipe)
  const instructionValidation = validateRenderInstruction(instruction)
  console.log(JSON.stringify(instruction, null, 2))
  console.log(`Validation: ${instructionValidation.valid ? '✅ valid' : `⚠️  ${instructionValidation.errors.join(' | ')}`}`)
  if (!instruction) {
    return NextResponse.json({ success: false, error: 'Render Instruction could not be compiled.' }, { status: 422 })
  }

  // AI Asset Composer already ran (STAGE 2.5, alongside the Capability
  // Engine) — reused here, not recomputed. `referenceImageUrls` naturally
  // reflects capability.strategy.includeModelReference: composeAiAssets
  // only includes the Model Reference URL when one was actually approved
  // and active, so a HIGH/STANDARD/LIMITED render simply omits it instead
  // of failing.
  const referenceImageUrls = composedAssets.urls

  logStage('🔵', 'STAGE 5: PROMPT SERIALIZER + COMPRESSION (~270 token budget)')
  const uncompressed = serializeOpenAI({ instruction })
  console.log(`Uncompressed prompt (${uncompressed?.length ?? 0} chars):`)
  console.log(uncompressed)

  // Per the Prompt Compression Strategy (~270 tokens total) — this compressed
  // string is what actually reaches OpenAI (passed as `promptOverride` below),
  // not the full uncompressed serializeOpenAI() output.
  const promptCompression = compressPrompt(buildCompressedSections(instruction))
  console.log(`\nCompressed prompt (~${promptCompression.totalTokens} tokens):`)
  console.log(promptCompression.compressed)
  console.log(`Sections included: [${promptCompression.metadata.sectionsIncluded.join(', ')}]`)
  console.log(`Sections omitted:  [${promptCompression.metadata.sectionsOmitted.join(', ')}]`)

  console.log(`\nReference images sent to OpenAI: ${referenceImageUrls.length ? referenceImageUrls.join(', ') : 'none'}`)

  // Reference DNA Architecture V1 + AI Asset Library — the SILHOUETTE-only
  // (Model Reference) and/or COLLAR_SHAPE-only (Collar Reference) caveats
  // are appended only for whichever reference images are actually
  // included, so GPT Image never mistakes a reference photo's own
  // collar/cuff/fabric/color for what to render.
  const finalPrompt = applyAssetInstructions(promptCompression.compressed, composedAssets)
  const result = await generateImage({ instruction, referenceImageUrls, promptOverride: finalPrompt })

  logStage('✅', 'STAGE 6: IMAGE SERVICE RESULT')
  console.log(result.ok ? `success — ${result.images.length} image(s) returned` : `❌ error: ${result.error}`)

  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: 502 })
  }

  const responseBody = {
    success: true,
    renderedImageUrl: result.images[0]?.url ?? null,
    promptUsed: finalPrompt,
    promptCompression,
    promptUncompressed: uncompressed,
    componentsUsed: resolved.map(({ option }) => ({ id: option.id, name: option.name, category: option.category })),
    componentsMissing,
    capability,
    debug: {
      masterRecipe,
      instruction,
      instructionValidation,
      referenceImageUrls,
      aiAssetComposer: composedAssets,
      dnaState: { hash: dnaHash },
      dirtyLayers: dirty,
    },
  }

  // Render Cache (Task 6) — only a successful render is ever cached, so a
  // 422/502 (e.g. incomplete master data) never sticks around and blocks a
  // later request once the underlying data is fixed.
  setCachedRender(dnaHash, responseBody)

  return NextResponse.json(responseBody)
}
