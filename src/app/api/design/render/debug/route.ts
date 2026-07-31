import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { MasterDataOption } from '@/lib/design/masterData'
import { resolveDNA } from '@/lib/design/dnaResolver/resolver'
import type { DNAResolverInput } from '@/lib/design/dnaResolver/types'
import { composeRenderRecipe, composeRenderRecipeTrace, RECIPE_RECORD_FIELDS } from '@/lib/design/recipeComposer/composer'
import { DEFAULT_GLOBAL_RENDER_POLICY } from '@/lib/design/recipeComposer/types'
import type { RenderRecipeEntry } from '@/lib/design/recipeComposer/types'
import type { RenderRecipe } from '@/lib/design/renderRecipe/types'
import { buildRenderInstruction, validateRenderInstruction } from '@/lib/design/promptBuilder/builder'
import { serializeOpenAI } from '@/lib/design/promptBuilder/serializer'
import { buildCompressedSections, compressPrompt } from '@/lib/design/promptBuilder/compression'
import { DEFAULT_MODEL } from '@/lib/ai/services/image'
import { startRenderSession, finishRenderSession, generateImageWithControlledRetry } from '@/lib/ai/renderSession/service'
import { classifyCustomerPhotoFraming, judgeRenderQuality } from '@/lib/design/renderQuality/qualityJudge'
import { buildPromptLayersV2, mergePromptLayersV2, compressPromptLayersV2 } from '@/lib/design/promptArchitectureV2/layers'
import { validatePromptLayers } from '@/lib/design/promptArchitectureV2/promptValidator'
import { validateComponentDna } from '@/lib/design/promptArchitectureV2/dnaValidator'
import { validateRenderRequest } from '@/lib/design/promptArchitectureV2/renderValidator'
import { getRenderRunMode, isDebugMode } from '@/lib/design/promptArchitectureV2/debugMode'
import { composeAiAssets, applyAssetInstructions, validateModelReferenceAvailable, validateCollarReference } from '@/lib/design/aiAssetComposer/composer'
import { evaluateCapability } from '@/lib/design/capabilityEngine/engine'

// DNA Debug Viewer pipeline endpoint (Sprint AI-R1) — a read-only audit twin
// of /api/design/render/route.ts. It runs the EXACT same library calls
// (DNA Resolver -> Recipe Composer -> Prompt Builder -> Serializer ->
// Compression -> Image Service), never a re-implementation, so what this
// endpoint reports is guaranteed to match production behavior. Two
// deliberate differences from the production route:
//   1. Never reads/writes Render Cache — an audit tool that could return a
//      stale cached result without saying so would defeat its own purpose.
//   2. Only calls OpenAI (spends money) when the caller explicitly passes
//      `dryRun: false`; defaults to `dryRun: true` so simply opening the
//      debug page and clicking through components never costs anything.
// Every stage below is captured into the response even when an earlier
// stage is incomplete, so a developer can see exactly where a real render
// would stop, instead of getting an early 4xx like the production route.

interface ComponentSelection {
  componentType: string
  componentId: string
}

interface DebugRequestBody {
  customerPhotoUrl?: string
  componentSelections?: ComponentSelection[]
  dryRun?: boolean
  // Sprint AI-R2 — separate opt-in from `dryRun`. `dryRun` only gates the
  // expensive gpt-image-1 generation call; this gates the (smaller, but
  // still real-money) GPT-4o-mini vision-judge calls (photo framing check +
  // post-render quality judge), so a developer can dry-run the pipeline for
  // free without accidentally also paying for vision judging every click.
  runVisionJudge?: boolean
  // Sprint AI-R2.5 — which prompt architecture actually gets sent to OpenAI
  // when dryRun is false. Defaults to 'v1' (the existing, production-used
  // serializer/compression path — unchanged). 'v2' sends the new 4-layer
  // Prompt Architecture V2 (promptArchitectureV2/layers.ts) instead, purely
  // for comparison/regression testing — the real production route
  // (/api/design/render/route.ts) still only ever uses V1.
  promptVersion?: 'v1' | 'v2'
}

function includesRegressionString(text: string | null | undefined): string[] {
  if (!text) return []
  const hits: string[] = []
  if (text.includes('[object Object]')) hits.push('[object Object]')
  if (/\bundefined\b/.test(text)) hits.push('undefined')
  if (/\bnull\b/.test(text)) hits.push('null')
  return hits
}

export async function POST(req: NextRequest) {
  let body: DebugRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { customerPhotoUrl, componentSelections, dryRun = true, runVisionJudge = false, promptVersion = 'v1' } = body
  const runMode = getRenderRunMode()

  if (!customerPhotoUrl || !Array.isArray(componentSelections) || componentSelections.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Missing customerPhotoUrl or componentSelections.' },
      { status: 400 },
    )
  }

  // ---------------------------------------------------------------------
  // SECTION 1 — Raw DNA
  // ---------------------------------------------------------------------
  const supabase = createClient()
  const ids = componentSelections.map((selection) => selection.componentId).filter(Boolean)

  const { data: rows, error } = await supabase.from('design_master_options').select('*').in('id', ids)
  if (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch components.', details: error.message }, { status: 500 })
  }

  const rowsById = new Map<string, MasterDataOption>((rows ?? []).map((row: MasterDataOption) => [row.id, row]))

  const rawDna = componentSelections.map((selection) => {
    const option = rowsById.get(selection.componentId)
    return {
      componentType: selection.componentType,
      componentId: selection.componentId,
      found: !!option,
      name: option?.name ?? null,
      category: option?.category ?? null,
      ai_dna: option?.ai_dna ?? null,
      render_recipe: option?.render_recipe ?? null,
    }
  })

  // ---------------------------------------------------------------------
  // SECTION 2 — Resolved DNA (resolveDNA per component)
  // ---------------------------------------------------------------------
  const componentsMissing: { componentId: string; componentType: string; reason: string }[] = []
  const resolved: { option: MasterDataOption; recipe: RenderRecipe }[] = []
  const resolvedDna: {
    componentType: string
    componentId: string
    category: string | null
    name: string | null
    ready: boolean
    errors: string[]
    garmentKeys: string[]
  }[] = []

  componentSelections.forEach((selection) => {
    const option = rowsById.get(selection.componentId)
    if (!option) {
      componentsMissing.push({ ...selection, reason: 'not_found' })
      resolvedDna.push({
        componentType: selection.componentType,
        componentId: selection.componentId,
        category: null,
        name: null,
        ready: false,
        errors: ['Component not found in design_master_options.'],
        garmentKeys: [],
      })
      return
    }

    const input: DNAResolverInput = {
      itemId: option.id,
      category: option.category,
      aiDna: option.ai_dna,
      renderRecipe: option.render_recipe,
    }
    const { recipe, ready, errors } = resolveDNA(input)

    resolvedDna.push({
      componentType: selection.componentType,
      componentId: selection.componentId,
      category: option.category,
      name: option.name,
      ready,
      errors,
      garmentKeys: recipe ? Object.keys(recipe.garment) : [],
    })

    if (!ready || !recipe) {
      componentsMissing.push({ ...selection, reason: errors.join(' ') || 'not_ready' })
      return
    }

    resolved.push({ option, recipe })
  })

  const entries: RenderRecipeEntry[] = resolved.map(({ option, recipe }, index) => ({
    itemId: option.id,
    category: option.category,
    recipe,
    priority: index,
  }))

  // ---------------------------------------------------------------------
  // SECTION 2b — DNA Validator (Sprint AI-R2.5, Part 4) — deterministic,
  // per component, independent of whether DNA Resolver marked it "ready".
  // Runs over every found component so an incomplete-but-technically-ready
  // item still surfaces a FAIL here instead of silently passing through.
  // ---------------------------------------------------------------------
  const dnaValidator = componentSelections
    .map((selection) => rowsById.get(selection.componentId))
    .filter((option): option is MasterDataOption => !!option)
    .map((option) => validateComponentDna({ itemId: option.id, category: option.category, aiDna: option.ai_dna }))

  // ---------------------------------------------------------------------
  // SECTION 3 — Recipe Composer (merge + field-level provenance trace)
  // ---------------------------------------------------------------------
  const masterRecipe = entries.length > 0 ? composeRenderRecipe({ entries, policy: DEFAULT_GLOBAL_RENDER_POLICY }) : null
  const trace = entries.length > 0 ? composeRenderRecipeTrace({ entries, policy: DEFAULT_GLOBAL_RENDER_POLICY }) : null

  const overrides: { field: string; key: string; winner: { itemId: string; category: string } | null; losers: { itemId: string; category: string }[] }[] = []
  if (trace) {
    RECIPE_RECORD_FIELDS.forEach((field) => {
      trace[field].forEach((entry) => {
        if (entry.overriddenSources.length > 0) {
          overrides.push({
            field,
            key: entry.key,
            winner: entry.resolvedFrom ? { itemId: entry.resolvedFrom.itemId, category: entry.resolvedFrom.category } : null,
            losers: entry.overriddenSources.map((source) => ({ itemId: source.itemId, category: source.category })),
          })
        }
      })
    })
  }

  const modelThobeEntry = resolved.find(({ option }) => option.category === 'model_thobe')
  const anchorOverridden = overrides.some(
    (override) => override.field === 'garment' && override.losers.some((loser) => loser.category === 'model_thobe'),
  )

  // ---------------------------------------------------------------------
  // SECTION 4 — Prompt Builder + Serializer (uncompressed)
  // ---------------------------------------------------------------------
  const instruction = buildRenderInstruction(masterRecipe)
  const instructionValidation = validateRenderInstruction(instruction)
  const uncompressed = instruction ? serializeOpenAI({ instruction }) : null
  const serializerIssues = includesRegressionString(uncompressed)

  // ---------------------------------------------------------------------
  // SECTION 5 — Compression
  // ---------------------------------------------------------------------
  const promptCompression = instruction ? compressPrompt(buildCompressedSections(instruction)) : null
  const compressionIssues = promptCompression ? includesRegressionString(promptCompression.compressed) : []

  // ---------------------------------------------------------------------
  // SECTION 5b — Prompt Architecture V2 (Sprint AI-R2.5, Part 1+2) —
  // Layer 1 Identity -> Layer 2 Composition -> Layer 3 Garment DNA ->
  // Layer 4 Quality -> merged -> compressed. Always computed (cheap, no AI)
  // so the Prompt Inspector can show V1 and V2 side by side regardless of
  // which one `promptVersion` selects for the actual OpenAI call below.
  // ---------------------------------------------------------------------
  const promptLayersV2 = buildPromptLayersV2(instruction)
  const mergedPromptV2 = mergePromptLayersV2(promptLayersV2)
  const compressedPromptV2 = compressPromptLayersV2(promptLayersV2)
  const promptValidatorV2 = validatePromptLayers(promptLayersV2)
  const v2Issues = includesRegressionString(compressedPromptV2.compressed)

  // Raw lookups (regardless of resolveDNA success) — shared by the AI Asset
  // Composer below AND the AI Capability Engine further down, so "not
  // selected" vs "selected but DNA/Asset invalid" stay distinguishable in
  // both, from a single source instead of two independently-computed
  // near-duplicates (a redundancy this sprint's report flags and removes).
  const modelThobeSelection = componentSelections.find((s) => rowsById.get(s.componentId)?.category === 'model_thobe')
  const modelThobeOptionRaw = modelThobeSelection ? (rowsById.get(modelThobeSelection.componentId) ?? null) : null
  const collarSelection = componentSelections.find((s) => rowsById.get(s.componentId)?.category === 'kerah')
  const collarOptionRaw = collarSelection ? (rowsById.get(collarSelection.componentId) ?? null) : null

  // ---------------------------------------------------------------------
  // SECTION 7 — AI Asset Composer (renamed from Reference Composer this
  // sprint — "AI Asset Lifecycle") — must be computed before Section 6/8,
  // which both depend on it.
  // ---------------------------------------------------------------------
  const otherSelectedCategories = componentSelections
    .map((selection) => rowsById.get(selection.componentId)?.category)
    .filter((category): category is MasterDataOption['category'] => !!category && category !== 'model_thobe')

  const composedAssets = composeAiAssets({
    customerPhotoUrl,
    modelThobeOption: modelThobeOptionRaw,
    collarOption: collarOptionRaw,
    otherSelectedCategories,
  })
  const referenceImageUrls = composedAssets.urls
  const modelReferenceValidation = validateModelReferenceAvailable({ modelThobeOption: modelThobeOptionRaw, composed: composedAssets })
  const collarReferenceValidation = validateCollarReference({ collarOption: collarOptionRaw, composed: composedAssets })

  // ---------------------------------------------------------------------
  // AI Capability Engine (Sprint AI-R3) — the ONE place deciding render
  // mode/quality/strategy for this scenario.
  // ---------------------------------------------------------------------
  const modelThobeDnaResult = dnaValidator.find((d) => d.itemId === modelThobeOptionRaw?.id)
  const otherComponentDnaResults = dnaValidator
    .filter((d) => d.itemId !== modelThobeOptionRaw?.id)
    .map((d) => ({ itemId: d.itemId, category: d.category, valid: d.valid }))

  const capability = evaluateCapability({
    customerPhotoPresent: !!customerPhotoUrl,
    modelThobeSelected: !!modelThobeOptionRaw,
    modelThobeDnaValid: modelThobeDnaResult?.valid ?? false,
    modelReferenceAvailable: modelReferenceValidation.valid,
    otherComponentDnaResults,
    unresolvedComponents: componentsMissing.map((m) => ({ itemId: m.componentId, category: m.componentType, reason: m.reason })),
  })

  // Part 1's "if customer photo IS full body, no crop is allowed; if it's
  // half body, report it" — classifies the INPUT photo only, independent of
  // whether a render actually runs. Opt-in (runVisionJudge) since it's a
  // real, billed OpenAI call.
  const customerPhotoFraming = runVisionJudge ? await classifyCustomerPhotoFraming(customerPhotoUrl) : null

  const referenceImages = {
    customerPhoto: {
      url: customerPhotoUrl,
      included: referenceImageUrls.includes(customerPhotoUrl),
      framing: customerPhotoFraming,
    },
    modelThobeReference: {
      itemId: composedAssets.modelReference?.itemId ?? modelThobeOptionRaw?.id ?? null,
      name: modelThobeOptionRaw?.name ?? null,
      url: composedAssets.modelReference?.url ?? null,
      included: !!composedAssets.modelReference,
      note: modelReferenceValidation.valid ? null : modelReferenceValidation.reason,
    },
    // Architecture decision (aiAssetComposer/composer.ts), not a bug: every
    // other category only ever reaches the AI provider as text (via Render
    // Recipe -> Prompt Builder), never as an image input. Listed here so
    // this is visible, not silently assumed.
    excludedByDesign: composedAssets.excluded.map((e) => e.category),
  }

  // ---------------------------------------------------------------------
  // AI Assets (AI Asset Library / AI Asset Lifecycle turns) — every
  // currently-implemented AI Asset, its lifecycle metadata, and exactly
  // what it is/isn't allowed to transfer. Debug Viewer section. `status`
  // reflects whether the Asset is ACTIVE (composed in) or not; `aiDnaStatus`
  // + `catalogActive` are the two independent conditions that determine it
  // (see aiAssetComposer's `isAiAssetActive`) — surfaced separately so a
  // FAIL is diagnosable (not approved yet? or just deactivated in catalog?).
  // ---------------------------------------------------------------------
  const aiAssets = [
    {
      referenceType: 'MODEL_THOBE',
      referenceRole: 'SILHOUETTE',
      name: modelThobeOptionRaw?.name ?? null,
      priority: 100,
      status: composedAssets.modelReference ? 'ACTIVE' : 'INACTIVE',
      aiDnaStatus: modelThobeOptionRaw?.ai_dna.status ?? null,
      catalogActive: modelThobeOptionRaw?.is_active ?? null,
      included: !!composedAssets.modelReference,
      validation: modelReferenceValidation,
      transferredGeometry: ['Silhouette', 'Proportion', 'Length', 'Drape'],
      ignored: ['Color', 'Texture', 'Stitching', 'Collar', 'Cuff', 'Pocket', 'Background'],
    },
    {
      referenceType: 'COLLAR_REFERENCE',
      referenceRole: 'COLLAR_SHAPE',
      name: collarOptionRaw?.name ?? null,
      priority: 90,
      status: composedAssets.collarReference ? 'ACTIVE' : 'INACTIVE',
      aiDnaStatus: collarOptionRaw?.ai_dna.status ?? null,
      catalogActive: collarOptionRaw?.is_active ?? null,
      included: !!composedAssets.collarReference,
      validation: collarReferenceValidation,
      transferredGeometry: ['Outline', 'Curvature', 'Opening', 'Height', 'Proportion', 'Profile'],
      ignored: ['Color', 'Texture', 'Stitching', 'Background', 'Lighting', 'Shadows', 'Wrinkles'],
    },
  ]

  // ---------------------------------------------------------------------
  // SECTION 6 — Final AI Request (payload that WOULD be / IS sent)
  // ---------------------------------------------------------------------
  const usesEdit = referenceImageUrls.length > 0
  const basePrompt = promptVersion === 'v2' ? compressedPromptV2.compressed : (promptCompression?.compressed ?? null)
  // Reference DNA Architecture V1 + AI Asset Library — SILHOUETTE-only
  // and/or COLLAR_SHAPE-only caveats, appended only for whichever reference
  // images are actually included.
  const activePrompt = basePrompt ? applyAssetInstructions(basePrompt, composedAssets) : basePrompt
  const finalRequest = {
    model: 'gpt-image-1',
    endpoint: usesEdit ? 'images.edit' : 'images.generate',
    prompt: activePrompt,
    promptVersionUsed: promptVersion,
    referenceImages: referenceImageUrls,
    mask: null as string | null,
    input_fidelity: usesEdit ? 'high' : null,
    imageCount: 1,
    timeoutMs: 60_000,
    size: null as string | null,
  }

  // ---------------------------------------------------------------------
  // Render Validator (Sprint AI-R2.5 Part 5) — deterministic, no AI, checks
  // request-SHAPE correctness only (non-empty prompt, no serialization
  // bugs, correct model/endpoint/fidelity/count). Render QUALITY grading
  // (including Model Reference availability) is the AI Capability Engine's
  // job now (Sprint AI-R3) — a missing Model Reference no longer appears
  // here at all, see renderValidator.ts's own note.
  // ---------------------------------------------------------------------
  const renderRequestValidator = validateRenderRequest({
    customerPhotoUrl,
    referenceImageUrls,
    modelThobePresent: !!modelThobeEntry,
    prompt: activePrompt,
    usesEdit,
    endpoint: finalRequest.endpoint,
    model: finalRequest.model,
    imageCount: finalRequest.imageCount,
  })
  // The ONLY 3 conditions allowed to block a render (Sprint AI-R3 Phase 4)
  // live in capability.mode === 'BLOCKED'; renderRequestValidator still
  // gates on pure request-shape bugs (e.g. a broken prompt), which stay
  // fatal regardless of capability grade.
  const canSendRequest =
    capability.mode !== 'BLOCKED' && renderRequestValidator.valid && (promptVersion !== 'v2' || promptValidatorV2.valid)

  // ---------------------------------------------------------------------
  // SECTION 8 — AI Response (only when dryRun === false AND validators PASS)
  // ---------------------------------------------------------------------
  let aiResponse: {
    executed: boolean
    ok?: boolean
    cancelled?: boolean
    cancelReason?: string
    renderedImageUrl?: string | null
    revisedPrompt?: string | null
    usage?: unknown
    latencyMs?: number
    responseSizeBytes?: number
    error?: string
    // Sprint O — Debug Viewer renders now flow through the same Render
    // Session (Lock/History/Request Counter) as production, tagged
    // source: 'debug_viewer' so this spend is always filterable apart from
    // real Design Studio usage in Render History.
    renderId?: string
  } = { executed: false }

  if (!dryRun && !canSendRequest) {
    aiResponse = {
      executed: false,
      cancelled: true,
      cancelReason: [
        ...(capability.mode === 'BLOCKED' ? [`[Capability] ${capability.blockedReason}`] : []),
        ...renderRequestValidator.checks.filter((c) => c.status === 'FAIL').map((c) => c.label),
        ...(promptVersion === 'v2' ? promptValidatorV2.checks.filter((c) => c.status === 'FAIL').map((c) => c.label) : []),
      ].join('; ') || 'Validator gagal.',
    }
  } else if (!dryRun && instruction && activePrompt) {
    const {
      data: { user: debugUser },
    } = await supabase.auth.getUser()
    const session = await startRenderSession({
      supabase,
      source: 'debug_viewer',
      consultationId: null,
      userId: debugUser?.id ?? null,
      model: DEFAULT_MODEL,
    })
    // consultationId is always null here, so the Render Request Lock's
    // unique index (scoped to consultation_id IS NOT NULL) never applies —
    // `session.locked` is structurally impossible for this route, but the
    // type is still a union, so this satisfies it rather than asserting.
    const renderId = session.locked ? 'RND-DEBUG-LOCKED' : session.renderId
    const startedAt = session.locked ? new Date().toISOString() : session.startedAt
    const historyRowId = session.locked ? null : session.historyRowId

    const startedAtMs = Date.now()
    const { result, requestCount, retryCount } = await generateImageWithControlledRetry({
      input: { instruction, referenceImageUrls, promptOverride: activePrompt },
    })
    const latencyMs = Date.now() - startedAtMs

    if (result.ok) {
      aiResponse = {
        executed: true,
        ok: true,
        renderedImageUrl: result.images[0]?.url ?? null,
        revisedPrompt: result.images[0]?.revisedPrompt ?? null,
        usage: isDebugMode(runMode) ? ((result.raw as { usage?: unknown }).usage ?? null) : undefined,
        latencyMs,
        responseSizeBytes: JSON.stringify(result.raw).length,
        renderId,
      }
    } else {
      aiResponse = { executed: true, ok: false, latencyMs, error: result.error, renderId }
    }

    await finishRenderSession({
      supabase,
      historyRowId,
      renderId,
      startedAt,
      status: result.ok ? 'success' : 'failed',
      requestCount,
      retryCount,
      model: DEFAULT_MODEL,
      errorMessage: result.ok ? null : result.error,
    })
  }

  // ---------------------------------------------------------------------
  // Render Validator (Part 6) — only meaningful once a real render exists
  // (needs the actual output image), and only run when the developer
  // opted into vision-judge spend. Compares the ORIGINAL customer photo
  // against the RENDERED image; see qualityJudge.ts for why this is a
  // heuristic AI opinion, not a certified biometric similarity score.
  // ---------------------------------------------------------------------
  const expectedGarmentNote = resolved.map(({ option }) => `${option.category}: ${option.name}`).join('; ')
  const renderValidator =
    runVisionJudge && aiResponse.ok && aiResponse.renderedImageUrl
      ? await judgeRenderQuality({
          customerPhotoUrl,
          renderedImageUrl: aiResponse.renderedImageUrl,
          expectedGarmentNote,
        })
      : null

  // ---------------------------------------------------------------------
  // SECTION 9 — Validation checklist
  // ---------------------------------------------------------------------
  const validation = [
    {
      id: 'capability_mode',
      label: `AI Capability Engine — Mode: ${capability.mode} (${capability.capabilityScore}%, quality ${capability.qualityLevel}/5)`,
      status: capability.mode === 'BLOCKED' ? 'FAIL' : 'PASS',
      reason: capability.mode === 'BLOCKED' ? (capability.blockedReason ?? '') : capability.warnings.join(' | ') || 'Tidak ada warning.',
    },
    {
      id: 'anchor_not_overridden',
      label: 'Model Thobe (Anchor) tidak di-override oleh Collar/Cuff/Pocket',
      status: modelThobeEntry ? (anchorOverridden ? 'FAIL' : 'PASS') : 'INFO',
      reason: !modelThobeEntry
        ? 'Tidak ada komponen model_thobe pada selection ini.'
        : anchorOverridden
          ? `garment field di-override oleh: ${overrides.filter((o) => o.field === 'garment').map((o) => `${o.key}<-${o.winner?.category}`).join(', ')}`
          : 'Tidak ada key garment milik Model Thobe yang kalah dari komponen lain.',
    },
    {
      id: 'render_recipe_ready',
      label: 'Render Recipe Ready (semua komponen resolve sukses)',
      status: componentsMissing.length === 0 ? 'PASS' : 'FAIL',
      reason: componentsMissing.length === 0
        ? 'Semua komponen berhasil di-resolve.'
        : `${componentsMissing.length} komponen belum ready: ${componentsMissing.map((c) => `${c.componentType} (${c.reason})`).join('; ')}`,
    },
    {
      id: 'customer_image_included',
      label: 'Customer Image ikut',
      status: referenceImages.customerPhoto.included ? 'PASS' : 'FAIL',
      reason: referenceImages.customerPhoto.included ? 'customerPhotoUrl ada di referenceImages.' : 'customerPhotoUrl kosong.',
    },
    {
      id: 'reference_image_included',
      label: 'Reference Image (Model Thobe) ikut',
      status: referenceImages.modelThobeReference.included ? 'PASS' : modelThobeEntry ? 'FAIL' : 'INFO',
      reason: referenceImages.modelThobeReference.note ?? 'Model Thobe reference image terkirim.',
    },
    {
      id: 'collar_reference_available',
      label: 'AI Asset — Collar Reference (COLLAR_REFERENCE, optional — never blocks render)',
      status: collarReferenceValidation.valid ? 'PASS' : 'INFO',
      reason: collarReferenceValidation.reason,
    },
    {
      id: 'no_object_object',
      label: 'Prompt bukan [object Object] / undefined / null literal (V1 serializer+compression)',
      status: serializerIssues.length === 0 && compressionIssues.length === 0 ? 'PASS' : 'FAIL',
      reason: [...serializerIssues, ...compressionIssues].length === 0
        ? 'Tidak ditemukan literal [object Object]/undefined/null di prompt.'
        : `Ditemukan: ${Array.from(new Set([...serializerIssues, ...compressionIssues])).join(', ')}`,
    },
    {
      id: 'compression_within_budget',
      label: 'Compression OK (≤270 token budget)',
      status: promptCompression && promptCompression.totalTokens <= 270 ? 'PASS' : 'FAIL',
      reason: promptCompression ? `${promptCompression.totalTokens} token terpakai.` : 'Compression belum berjalan.',
    },
    {
      id: 'v2_no_regression_strings',
      label: 'Prompt V2 bukan [object Object] / undefined / null literal',
      status: v2Issues.length === 0 ? 'PASS' : 'FAIL',
      reason: v2Issues.length === 0 ? 'Tidak ditemukan.' : `Ditemukan: ${v2Issues.join(', ')}`,
    },
    // Render Validator (Part 5, deterministic, no AI) — evaluated against
    // whichever prompt version (`promptVersion`) was actually selected for
    // sending; this is the SAME check object that gated the generateImage
    // call above (renderRequestValidator), not a recomputation.
    ...renderRequestValidator.checks.map((check) => ({ id: `render_validator_${check.id}`, label: `[Render Validator] ${check.label}`, status: check.status, reason: check.reason })),
    ...(renderValidator
      ? renderValidator.ok
        ? ([
            { id: 'face_similarity', label: `Face Similarity (>=${renderValidator.faceSimilarity.threshold}%)`, status: renderValidator.faceSimilarity.status, reason: `${renderValidator.faceSimilarity.score}% — ${renderValidator.faceSimilarity.reasoning}` },
            { id: 'body_similarity', label: `Body Similarity (>=${renderValidator.bodySimilarity.threshold}%)`, status: renderValidator.bodySimilarity.status, reason: `${renderValidator.bodySimilarity.score}% — ${renderValidator.bodySimilarity.reasoning}` },
            { id: 'pose_similarity', label: `Pose Similarity (>=${renderValidator.poseSimilarity.threshold}%)`, status: renderValidator.poseSimilarity.status, reason: `${renderValidator.poseSimilarity.score}% — ${renderValidator.poseSimilarity.reasoning}` },
            { id: 'garment_similarity', label: `Garment Similarity (>=${renderValidator.garmentSimilarity.threshold}%)`, status: renderValidator.garmentSimilarity.status, reason: `${renderValidator.garmentSimilarity.score}% — ${renderValidator.garmentSimilarity.reasoning}` },
            { id: 'dna_compliance', label: `DNA Compliance (>=${renderValidator.dnaCompliance.threshold}%)`, status: renderValidator.dnaCompliance.status, reason: `${renderValidator.dnaCompliance.score}% — ${renderValidator.dnaCompliance.reasoning}` },
          ] as const)
        : ([{ id: 'render_validator_error', label: 'Render Validator (vision judge)', status: 'FAIL' as const, reason: renderValidator.error }] as const)
      : []),
  ]

  return NextResponse.json({
    success: true,
    rawDna,
    resolvedDna,
    componentsMissing,
    recipeComposer: {
      masterRecipe,
      trace,
      overrides,
    },
    promptBuilder: {
      instruction,
      instructionValidation,
    },
    serializer: {
      uncompressed,
      issues: serializerIssues,
    },
    compression: promptCompression
      ? {
          before: uncompressed,
          beforeChars: uncompressed?.length ?? 0,
          after: promptCompression.compressed,
          afterChars: promptCompression.compressed.length,
          totalTokens: promptCompression.totalTokens,
          sectionsIncluded: promptCompression.metadata.sectionsIncluded,
          sectionsOmitted: promptCompression.metadata.sectionsOmitted,
          estimatedTokens: promptCompression.metadata.estimatedTokens,
          issues: compressionIssues,
        }
      : null,
    finalRequest,
    referenceImages,
    aiResponse,
    renderValidator,
    validation,
    dnaValidator,
    promptArchitectureV2: {
      layers: promptLayersV2,
      merged: mergedPromptV2,
      compressed: compressedPromptV2.compressed,
      totalTokens: compressedPromptV2.totalTokens,
      sectionsIncluded: compressedPromptV2.metadata.sectionsIncluded,
      sectionsOmitted: compressedPromptV2.metadata.sectionsOmitted,
      promptValidator: promptValidatorV2,
      issues: v2Issues,
    },
    renderRequestValidator,
    runMode,
    aiAssetComposer: composedAssets,
    capability,
    aiAssets,
  })
}
