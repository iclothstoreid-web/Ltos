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
import { buildPromptLayers, compressPromptByLayers } from '@/lib/design/promptBuilder/compression'
import { DEFAULT_MODEL } from '@/lib/ai/services/image'
import { startRenderSession, finishRenderSession, generateImageWithControlledRetry } from '@/lib/ai/renderSession/service'
import { classifyCustomerPhotoFraming, judgeRenderQuality } from '@/lib/design/renderQuality/qualityJudge'
import { validateComponentDna } from '@/lib/design/promptValidation/dnaValidator'
import { validateRenderRequest } from '@/lib/design/promptValidation/renderValidator'
import { getRenderRunMode, isDebugMode } from '@/lib/design/promptValidation/debugMode'
import {
  composeAiAssets,
  validateCollarReference,
  validatePlaketReference,
  validatePocketReference,
} from '@/lib/design/aiAssetComposer/composer'
import { evaluateCapability } from '@/lib/design/capabilityEngine/engine'
import { GLOBAL_BASE_HERO_IMAGE_URL } from '@/lib/design/renderEngine/baseHero'
import { IDENTITY_PRESERVATION } from '@/lib/design/renderEngine/identityPreservation'
import { buildReferenceBinding } from '@/lib/design/renderEngine/referenceBinding'

// DNA Debug Viewer pipeline endpoint — a read-only audit twin of
// /api/design/render/route.ts. It runs the EXACT same library calls (DNA
// Resolver -> Recipe Composer -> Prompt Builder -> Compression -> Image
// Service), never a re-implementation, so what this endpoint reports is
// guaranteed to match production behavior. Two deliberate differences from
// the production route:
//   1. Never reads/writes Render Cache — an audit tool that could return a
//      stale cached result without saying so would defeat its own purpose.
//   2. Only calls OpenAI (spends money) when the caller explicitly passes
//      `dryRun: false`; defaults to `dryRun: true` so simply opening the
//      debug page and clicking through components never costs anything.
//
// Prompt Architecture Realignment (2026-08-06) — this endpoint used to also
// run a parallel "Prompt Architecture V2" comparison path
// (promptArchitectureV2/layers.ts) and the pre-Sprint-PR-04 legacy
// Anchor/Material/Other/Negatives compression buckets. Both are retired:
// V2 never became production and this realignment IS the new locked
// architecture; the legacy buckets were superseded in production since
// Sprint PR-04 and this debug route had drifted out of sync with it (it
// never built Reference Binding/Reference Usage Policy/Component Reference
// Delta, and never passed plaket/pocket options to composeAiAssets) — this
// rewrite closes that drift by calling the exact same real pipeline
// functions route.ts calls, nothing reimplemented.

interface ComponentSelection {
  componentType: string
  componentId: string
}

interface DebugRequestBody {
  customerPhotoUrl?: string
  componentSelections?: ComponentSelection[]
  dryRun?: boolean
  // Separate opt-in from `dryRun`. `dryRun` only gates the expensive
  // gpt-image-1 generation call; this gates the (smaller, but still
  // real-money) GPT-4o-mini vision-judge calls (photo framing check +
  // post-render quality judge), so a developer can dry-run the pipeline for
  // free without accidentally also paying for vision judging every click.
  runVisionJudge?: boolean
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

  const { customerPhotoUrl, componentSelections, dryRun = true, runVisionJudge = false } = body
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

    // Model Thobe is catalog-only (Architecture Lock, 2026-08-04) — excluded
    // from DNA resolution entirely (mirrors route.ts exactly, so this audit
    // twin stays accurate). Still reported in `resolvedDna` for visibility,
    // but never reaches `resolved`/`entries`.
    if (option.category === 'model_thobe') {
      resolvedDna.push({
        componentType: selection.componentType,
        componentId: selection.componentId,
        category: option.category,
        name: option.name,
        ready: true,
        errors: [],
        garmentKeys: ['(catalog-only — excluded from Prompt Assembly)'],
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
  // SECTION 2b — DNA Validator — deterministic, per component, independent
  // of whether DNA Resolver marked it "ready".
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

  // ---------------------------------------------------------------------
  // SECTION 4 — Prompt Builder + Serializer (uncompressed diagnostic dump)
  // ---------------------------------------------------------------------
  const instruction = buildRenderInstruction(masterRecipe)
  const instructionValidation = validateRenderInstruction(instruction)
  const uncompressed = instruction ? serializeOpenAI({ instruction }) : null
  const serializerIssues = includesRegressionString(uncompressed)

  // Raw lookups (regardless of resolveDNA success) — shared by the AI Asset
  // Composer below AND the AI Capability Engine further down, so "not
  // selected" vs "selected but DNA/Asset invalid" stay distinguishable.
  const collarSelection = componentSelections.find((s) => rowsById.get(s.componentId)?.category === 'kerah')
  const collarOptionRaw = collarSelection ? (rowsById.get(collarSelection.componentId) ?? null) : null
  const plaketSelection = componentSelections.find((s) => rowsById.get(s.componentId)?.category === 'plaket')
  const plaketOptionRaw = plaketSelection ? (rowsById.get(plaketSelection.componentId) ?? null) : null
  const pocketSelection = componentSelections.find((s) => rowsById.get(s.componentId)?.category === 'saku')
  const pocketOptionRaw = pocketSelection ? (rowsById.get(pocketSelection.componentId) ?? null) : null

  // ---------------------------------------------------------------------
  // SECTION 5 — AI Asset Composer — must be computed before Capability
  // Engine/Prompt Builder, which both depend on it.
  // ---------------------------------------------------------------------
  const composedAssets = composeAiAssets({
    customerPhotoUrl,
    collarOption: collarOptionRaw,
    plaketOption: plaketOptionRaw,
    pocketOption: pocketOptionRaw,
  })
  const baseHeroAvailable = GLOBAL_BASE_HERO_IMAGE_URL !== null
  const referenceImageUrls = GLOBAL_BASE_HERO_IMAGE_URL
    ? [composedAssets.urls[0], GLOBAL_BASE_HERO_IMAGE_URL, ...composedAssets.urls.slice(1)]
    : composedAssets.urls
  const collarReferenceValidation = validateCollarReference({ collarOption: collarOptionRaw, composed: composedAssets })
  const plaketReferenceValidation = validatePlaketReference({ plaketOption: plaketOptionRaw, composed: composedAssets })
  const pocketReferenceValidation = validatePocketReference({ pocketOption: pocketOptionRaw, composed: composedAssets })

  // ---------------------------------------------------------------------
  // AI Capability Engine — the ONE place deciding render mode/quality/
  // strategy for this scenario.
  // ---------------------------------------------------------------------
  const componentDnaResults = dnaValidator
    .filter((d) => d.category !== 'model_thobe')
    .map((d) => ({ itemId: d.itemId, category: d.category, valid: d.valid }))

  const capability = evaluateCapability({
    customerPhotoPresent: !!customerPhotoUrl,
    baseHeroAvailable,
    componentDnaResults,
    unresolvedComponents: componentsMissing.map((m) => ({ itemId: m.componentId, category: m.componentType, reason: m.reason })),
  })

  const customerPhotoFraming = runVisionJudge ? await classifyCustomerPhotoFraming(customerPhotoUrl) : null

  const referenceImages = {
    customerPhoto: {
      url: customerPhotoUrl,
      included: referenceImageUrls.includes(customerPhotoUrl),
      framing: customerPhotoFraming,
    },
    baseHeroModel: {
      url: GLOBAL_BASE_HERO_IMAGE_URL,
      configured: baseHeroAvailable,
      included: baseHeroAvailable,
      note: baseHeroAvailable ? null : 'Base Hero Model belum dikonfigurasi (renderEngine/baseHero.ts).',
    },
    excludedByDesign: composedAssets.excluded.map((e) => e.category),
  }

  const aiAssets = [
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
    {
      referenceType: 'PLAKET_REFERENCE',
      referenceRole: 'PLAKET_SHAPE',
      name: plaketOptionRaw?.name ?? null,
      priority: 80,
      status: composedAssets.plaketReference ? 'ACTIVE' : 'INACTIVE',
      aiDnaStatus: plaketOptionRaw?.ai_dna.status ?? null,
      catalogActive: plaketOptionRaw?.is_active ?? null,
      included: !!composedAssets.plaketReference,
      validation: plaketReferenceValidation,
      transferredGeometry: ['Outline', 'Opening Length', 'Width', 'Button Spacing', 'Stitch-line Geometry'],
      ignored: ['Fabric texture', 'Fabric color', 'Stitching thread color', 'Lighting', 'Wrinkles', 'Shadows', 'Background', 'Photography style'],
    },
    {
      referenceType: 'POCKET_REFERENCE',
      referenceRole: 'POCKET_SHAPE',
      name: pocketOptionRaw?.name ?? null,
      priority: 70,
      status: composedAssets.pocketReference ? 'ACTIVE' : 'INACTIVE',
      aiDnaStatus: pocketOptionRaw?.ai_dna.status ?? null,
      catalogActive: pocketOptionRaw?.is_active ?? null,
      included: !!composedAssets.pocketReference,
      validation: pocketReferenceValidation,
      transferredGeometry: ['Outline', 'Placement', 'Proportion', 'Flap/Opening Geometry'],
      ignored: ['Fabric texture', 'Fabric color', 'Stitching thread color', 'Lighting', 'Wrinkles', 'Shadows', 'Background', 'Photography style'],
    },
  ]

  // ---------------------------------------------------------------------
  // SECTION 6 — Prompt Builder (13 fixed sections, real production path)
  // ---------------------------------------------------------------------
  const referenceUsagePolicyActive = composedAssets.referencesByCategory.size > 0 || baseHeroAvailable
  const referenceBindingContent = buildReferenceBinding({
    customerPhoto: true,
    baseHero: baseHeroAvailable,
    collar: composedAssets.referencesByCategory.has('kerah'),
    placket: composedAssets.referencesByCategory.has('plaket'),
    pocket: composedAssets.referencesByCategory.has('saku'),
  })
  const promptLayers = buildPromptLayers({
    entries,
    masterRecipe,
    identityPreservation: IDENTITY_PRESERVATION,
    referenceBinding: referenceBindingContent,
    referenceUsagePolicy: referenceUsagePolicyActive,
  })
  const layerCompression = compressPromptByLayers(promptLayers)
  const compressionIssues = includesRegressionString(layerCompression.compressed)

  // ---------------------------------------------------------------------
  // SECTION 7 — Final AI Request (payload that WOULD be / IS sent)
  // ---------------------------------------------------------------------
  const usesEdit = referenceImageUrls.length > 0
  const activePrompt = layerCompression.ok ? layerCompression.compressed : null
  const finalRequest = {
    model: 'gpt-image-1',
    endpoint: usesEdit ? 'images.edit' : 'images.generate',
    prompt: activePrompt,
    referenceImages: referenceImageUrls,
    mask: null as string | null,
    input_fidelity: usesEdit ? 'high' : null,
    imageCount: 1,
    timeoutMs: 60_000,
    size: null as string | null,
  }

  const renderRequestValidator = validateRenderRequest({
    customerPhotoUrl,
    referenceImageUrls,
    prompt: activePrompt,
    usesEdit,
    endpoint: finalRequest.endpoint,
    model: finalRequest.model,
    imageCount: finalRequest.imageCount,
  })
  const canSendRequest = capability.mode !== 'BLOCKED' && layerCompression.ok && renderRequestValidator.valid

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
    renderId?: string
  } = { executed: false }

  if (!dryRun && !canSendRequest) {
    aiResponse = {
      executed: false,
      cancelled: true,
      cancelReason: [
        ...(capability.mode === 'BLOCKED' ? [`[Capability] ${capability.blockedReason}`] : []),
        ...(!layerCompression.ok ? [`[Compression] ${layerCompression.error}`] : []),
        ...renderRequestValidator.checks.filter((c) => c.status === 'FAIL').map((c) => c.label),
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
      id: 'model_thobe_catalog_only',
      label: 'Model Thobe — Prompt Assembly participation',
      status: 'INFO' as const,
      reason:
        'Model Thobe adalah catalog-only sejak Architecture Lock (2026-08-04) — tidak lagi menyumbang Hero Image, Reference Instruction, atau Component Rules ke Prompt Assembly.',
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
      id: 'base_hero_included',
      label: 'Base Hero Model (Global Canvas) ikut',
      status: referenceImages.baseHeroModel.included ? 'PASS' : 'INFO',
      reason: referenceImages.baseHeroModel.note ?? 'Base Hero Model terkirim.',
    },
    {
      id: 'collar_reference_available',
      label: 'AI Asset — Collar Reference (optional — never blocks render)',
      status: collarReferenceValidation.valid ? 'PASS' : 'INFO',
      reason: collarReferenceValidation.reason,
    },
    {
      id: 'no_object_object',
      label: 'Prompt bukan [object Object] / undefined / null literal',
      status: serializerIssues.length === 0 && compressionIssues.length === 0 ? 'PASS' : 'FAIL',
      reason: [...serializerIssues, ...compressionIssues].length === 0
        ? 'Tidak ditemukan literal [object Object]/undefined/null di prompt.'
        : `Ditemukan: ${Array.from(new Set([...serializerIssues, ...compressionIssues])).join(', ')}`,
    },
    {
      id: 'compression_ok',
      label: 'Prompt Builder Compression OK (Priority 0 muat dalam budget)',
      status: layerCompression.ok ? 'PASS' : 'FAIL',
      reason: layerCompression.ok ? `${layerCompression.totalTokens} token terpakai.` : (layerCompression.error ?? ''),
    },
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
      layers: promptLayers,
      layerReport: layerCompression.layerReport,
      compressed: layerCompression.compressed,
      compressionOk: layerCompression.ok,
      compressionError: layerCompression.error,
      totalTokens: layerCompression.totalTokens,
      issues: compressionIssues,
    },
    serializer: {
      uncompressed,
      issues: serializerIssues,
    },
    finalRequest,
    referenceImages,
    aiResponse,
    renderValidator,
    validation,
    dnaValidator,
    renderRequestValidator,
    runMode,
    aiAssetComposer: composedAssets,
    capability,
    aiAssets,
  })
}
