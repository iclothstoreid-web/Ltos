import { getOpenAIClient } from '@/lib/ai/client'

// Render Quality Judge (Sprint AI-R2, Part 6 + the Part 1 "half-body customer
// photo -> laporkan" requirement) — NOT a biometric face-recognition system.
// There is no face-embedding/pose-estimation model anywhere in this codebase
// (confirmed: zero ML/vision dependencies besides the OpenAI SDK) and adding
// one (FaceNet/ArcFace/MediaPipe, model weights, a new inference service)
// would be exactly the kind of new infrastructure the brief's "JANGAN
// redesign architecture" rules out. This module instead asks a
// vision-capable OpenAI chat model to visually compare two images and
// self-report a 0-100 estimate per dimension. Treat every score here as a
// heuristic AI opinion, not a certified similarity metric — the debug UI
// and the sprint report both label it that way. Uses the same
// getOpenAIClient() every other AI call in this app goes through (src/lib/ai/client.ts) —
// no new provider, no new door into AI infra.

const JUDGE_MODEL = 'gpt-4o-mini'

export interface RenderQualityMetric {
  score: number
  threshold: number
  status: 'PASS' | 'FAIL'
  reasoning: string
}

export interface RenderQualityResult {
  ok: true
  faceSimilarity: RenderQualityMetric
  bodySimilarity: RenderQualityMetric
  poseSimilarity: RenderQualityMetric
  garmentSimilarity: RenderQualityMetric
  dnaCompliance: RenderQualityMetric
  overallStatus: 'PASS' | 'FAIL'
  rawJudgeText: string
}

export interface RenderQualityFailure {
  ok: false
  error: string
  rawJudgeText?: string
}

const THRESHOLDS = {
  faceSimilarity: 95,
  bodySimilarity: 95,
  poseSimilarity: 98,
  // Not explicitly thresholded in the brief (only Face/Body/Pose/DNA were
  // given numbers) — garmentSimilarity is treated as part of DNA Compliance
  // and held to the same 95% bar rather than inventing a separate number.
  garmentSimilarity: 95,
  dnaCompliance: 95,
} as const

function metricFromRaw(raw: unknown, key: keyof typeof THRESHOLDS): RenderQualityMetric {
  const record = (raw && typeof raw === 'object' ? (raw as Record<string, unknown>)[key] : null) as
    | { score?: unknown; reasoning?: unknown }
    | null
  const score = typeof record?.score === 'number' ? Math.max(0, Math.min(100, record.score)) : 0
  const threshold = THRESHOLDS[key]
  return {
    score,
    threshold,
    status: score >= threshold ? 'PASS' : 'FAIL',
    reasoning: typeof record?.reasoning === 'string' ? record.reasoning : '(judge tidak memberikan reasoning)',
  }
}

function extractJson(text: string): unknown {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) throw new Error('No JSON object found in judge response.')
  return JSON.parse(text.slice(start, end + 1))
}

// Compares the ORIGINAL customer photo against the FINAL rendered image.
// `expectedGarmentNote` is a short text description of what the garment is
// supposed to be (e.g. "Saudi Modern thobe, ankle length, long sleeve,
// standing collar") — Recipe Composer/Prompt Builder output, not invented
// here — used to help the judge score Garment Similarity / DNA Compliance
// against what was actually requested, not just "does it look like a robe."
export async function judgeRenderQuality(params: {
  customerPhotoUrl: string
  renderedImageUrl: string
  expectedGarmentNote: string
}): Promise<RenderQualityResult | RenderQualityFailure> {
  let client
  try {
    client = getOpenAIClient()
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'OpenAI client unavailable.' }
  }

  const prompt = [
    'You are a strict quality-control inspector for an AI clothing-render pipeline (a tailor shop\'s "virtual try-on").',
    'IMAGE 1 is the ORIGINAL customer photo. IMAGE 2 is the AI-RENDERED result — the pipeline is only supposed to change the clothing; everything else about the person and the shot must stay identical.',
    `Expected garment (from the shop's own design data, not your guess): ${params.expectedGarmentNote || '(tidak ada data)'}.`,
    'Score each dimension 0-100 (100 = perfectly preserved / perfectly matches expectation):',
    '- faceSimilarity: is it visibly the same face (identity, age, expression, skin tone, ethnicity)?',
    '- bodySimilarity: same body shape/proportions?',
    '- poseSimilarity: same pose, camera angle, framing (full body still fully visible, no new crop)?',
    '- garmentSimilarity: does the rendered garment match the Expected garment description above (silhouette, length, sleeve, collar)?',
    '- dnaCompliance: overall — did the render correctly apply ONLY the requested garment change while respecting every lock above?',
    'Respond with ONLY a raw JSON object, no markdown fences, no prose outside the JSON, in exactly this shape:',
    '{"faceSimilarity":{"score":0-100,"reasoning":"..."},"bodySimilarity":{"score":0-100,"reasoning":"..."},"poseSimilarity":{"score":0-100,"reasoning":"..."},"garmentSimilarity":{"score":0-100,"reasoning":"..."},"dnaCompliance":{"score":0-100,"reasoning":"..."}}',
  ].join('\n')

  let text: string
  try {
    const response = await client.chat.completions.create({
      model: JUDGE_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: params.customerPhotoUrl } },
            { type: 'image_url', image_url: { url: params.renderedImageUrl } },
          ],
        },
      ],
      temperature: 0,
    })
    text = response.choices[0]?.message?.content ?? ''
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Vision judge request failed.' }
  }

  let raw: unknown
  try {
    raw = extractJson(text)
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed to parse judge JSON.', rawJudgeText: text }
  }

  const faceSimilarity = metricFromRaw(raw, 'faceSimilarity')
  const bodySimilarity = metricFromRaw(raw, 'bodySimilarity')
  const poseSimilarity = metricFromRaw(raw, 'poseSimilarity')
  const garmentSimilarity = metricFromRaw(raw, 'garmentSimilarity')
  const dnaCompliance = metricFromRaw(raw, 'dnaCompliance')

  const overallStatus: 'PASS' | 'FAIL' =
    [faceSimilarity, bodySimilarity, poseSimilarity, garmentSimilarity, dnaCompliance].every((m) => m.status === 'PASS')
      ? 'PASS'
      : 'FAIL'

  return { ok: true, faceSimilarity, bodySimilarity, poseSimilarity, garmentSimilarity, dnaCompliance, overallStatus, rawJudgeText: text }
}

export interface PhotoFramingResult {
  ok: true
  framing: 'full_body' | 'half_body' | 'unclear'
  reasoning: string
}
export interface PhotoFramingFailure {
  ok: false
  error: string
}

// Part 1's "if the customer photo IS full body, the AI must not crop it; if
// the customer photo is half body, report it" — this only classifies the
// INPUT photo (a cheap, single-image check), it does not judge the render.
export async function classifyCustomerPhotoFraming(customerPhotoUrl: string): Promise<PhotoFramingResult | PhotoFramingFailure> {
  let client
  try {
    client = getOpenAIClient()
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'OpenAI client unavailable.' }
  }

  const prompt = [
    'Classify the framing of this photo of a person. Respond with ONLY a raw JSON object, no markdown, no prose:',
    '{"framing":"full_body"|"half_body"|"unclear","reasoning":"..."}',
    'full_body = entire body visible from head to feet. half_body = cropped above the waist/knees or feet not visible. unclear = cannot tell (e.g. heavily obscured, unusual angle).',
  ].join('\n')

  let text: string
  try {
    const response = await client.chat.completions.create({
      model: JUDGE_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: customerPhotoUrl } },
          ],
        },
      ],
      temperature: 0,
    })
    text = response.choices[0]?.message?.content ?? ''
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Framing classification request failed.' }
  }

  try {
    const raw = extractJson(text) as { framing?: unknown; reasoning?: unknown }
    const framing = raw.framing === 'full_body' || raw.framing === 'half_body' ? raw.framing : 'unclear'
    return { ok: true, framing, reasoning: typeof raw.reasoning === 'string' ? raw.reasoning : '' }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed to parse framing JSON.' }
  }
}
