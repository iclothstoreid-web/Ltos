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
// `componentsMissing`, never treated as a hard failure — only an empty
// result set (nothing at all resolved) is a 422.

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

  // Priority mirrors the caller's own selection order (model_thobe first,
  // per RenderRecipeEntry's own "Model before Collar before Pocket"
  // convention) — there is no other ordering signal available per request.
  const entries: RenderRecipeEntry[] = resolved.map(({ option, recipe }, index) => ({
    itemId: option.id,
    category: option.category,
    recipe,
    priority: index,
  }))

  if (entries.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'No selected component has usable AI Design DNA / Render Recipe data yet.',
        componentsMissing,
      },
      { status: 422 },
    )
  }

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

  // Design Knowledge Pipeline V1 precedent (image.ts's buildReferenceImageUrls):
  // the only two visual references GPT Image receives are the Customer Photo
  // and the Model Thobe's frozen Official Reference Image.
  const modelThobeOption = resolved.find(({ option }) => option.category === 'model_thobe')?.option
  const referenceImageUrls = [customerPhotoUrl, modelThobeOption?.ai_dna.metadata.sourceImage].filter(
    (url): url is string => !!url,
  )

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

  const result = await generateImage({ instruction, referenceImageUrls, promptOverride: promptCompression.compressed })

  logStage('✅', 'STAGE 6: IMAGE SERVICE RESULT')
  console.log(result.ok ? `success — ${result.images.length} image(s) returned` : `❌ error: ${result.error}`)

  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: 502 })
  }

  return NextResponse.json({
    success: true,
    renderedImageUrl: result.images[0]?.url ?? null,
    promptUsed: promptCompression.compressed,
    promptCompression,
    promptUncompressed: uncompressed,
    componentsUsed: resolved.map(({ option }) => ({ id: option.id, name: option.name, category: option.category })),
    componentsMissing,
    debug: {
      masterRecipe,
      instruction,
      instructionValidation,
      referenceImageUrls,
    },
  })
}
