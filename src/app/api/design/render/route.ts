import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { MasterDataOption } from '@/lib/design/masterData'
import { resolveDNA } from '@/lib/design/dnaResolver/resolver'
import type { DNAResolverInput } from '@/lib/design/dnaResolver/types'
import { composeRenderRecipe } from '@/lib/design/recipeComposer/composer'
import { DEFAULT_GLOBAL_RENDER_POLICY } from '@/lib/design/recipeComposer/types'
import type { RenderRecipeEntry } from '@/lib/design/recipeComposer/types'
import type { RenderRecipe } from '@/lib/design/renderRecipe/types'
import { buildRenderInstruction } from '@/lib/design/promptBuilder/builder'
import { serializeOpenAI } from '@/lib/design/promptBuilder/serializer'
import { buildCompressedSections, compressPrompt } from '@/lib/design/promptBuilder/compression'
import { generateImage } from '@/lib/ai/services/image'

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
      componentsMissing.push({ ...selection, reason: 'not_found' })
      return
    }

    const input: DNAResolverInput = {
      itemId: option.id,
      category: option.category,
      aiDna: option.ai_dna,
      renderRecipe: option.render_recipe,
    }
    const { recipe, ready, errors } = resolveDNA(input)
    if (!ready || !recipe) {
      componentsMissing.push({ ...selection, reason: errors.join(' ') })
      return
    }

    resolved.push({ option, recipe })
  })

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

  const masterRecipe = composeRenderRecipe({ entries, policy: DEFAULT_GLOBAL_RENDER_POLICY })
  const instruction = buildRenderInstruction(masterRecipe)
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

  // Per the Prompt Compression Strategy (~270 tokens total) — this compressed
  // string is what actually reaches OpenAI (passed as `promptOverride` below),
  // not the full uncompressed serializeOpenAI() output.
  const promptCompression = compressPrompt(buildCompressedSections(instruction))

  const result = await generateImage({ instruction, referenceImageUrls, promptOverride: promptCompression.compressed })

  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: 502 })
  }

  return NextResponse.json({
    success: true,
    renderedImageUrl: result.images[0]?.url ?? null,
    promptUsed: promptCompression.compressed,
    promptCompression,
    promptUncompressed: serializeOpenAI({ instruction }),
    componentsUsed: resolved.map(({ option }) => ({ id: option.id, name: option.name, category: option.category })),
    componentsMissing,
  })
}
