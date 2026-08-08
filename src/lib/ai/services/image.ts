import OpenAI, { APIConnectionTimeoutError, APIError } from "openai";
import { getOpenAIClient } from "../client";

// Image Generation Service — the ONLY door from LTOS domain code into an AI
// provider for image generation. Domain must never call src/lib/ai/providers
// directly; it calls this service, which hands the caller-supplied final
// prompt string (`promptOverride` — see promptBuilder/finalPrompt.ts) off to
// the OpenAI provider client. No storage, no DB, no UI this sprint — raw SDK
// output only.
//
// Prompt UAT Source of Truth realignment (this sprint) — RenderInstruction /
// Prompt Serializer (the neutral-representation indirection this module used
// to read through) are retired: every real caller already computes its own
// final prompt string via promptBuilder/finalPrompt.ts and always supplies
// it as `promptOverride`, so that indirection had been dead weight (see
// route.ts's own header comment on the realignment).

export const DEFAULT_MODEL = "gpt-image-1";
// Final Production Render Test (2026-07-31) — measured real gpt-image-1
// images.edit latency at input_fidelity "high" with a full 7-component DNA
// prompt + 1 reference image: 68.4s. The previous 60_000ms default was
// aborting real production renders (APIConnectionTimeoutError) after the
// image had already been generated successfully server-side — confirmed by
// re-running the identical request with a longer timeout and getting a
// normal 200. Raised with headroom above the observed worst case.
const DEFAULT_TIMEOUT_MS = 120_000;

// OpenAI's images.edit only accepts image/jpeg, image/png, image/webp. The
// OpenAI SDK's own File conversion (openai/internal/to-file.js) trusts a
// fetch() Response's Content-Type header verbatim when building the upload —
// it never inspects the actual bytes. Supabase Storage sometimes serves a
// reference image with a generic Content-Type (e.g. application/octet-stream)
// when the original upload didn't carry a real image MIME type all the way
// through to Storage, and that bad header would otherwise reach OpenAI as-is
// and get rejected even though the bytes are a valid photo. Normalizing once
// here — before any reference image reaches OpenAI — is what fixes that,
// regardless of which upload path produced the bad header.
const SUPPORTED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXTENSION_TO_MIME_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};
const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const DEFAULT_IMAGE_MIME_TYPE = "image/jpeg";

// Sprint O.1 finalization — this trace previously ran unconditionally on
// every reference-image fetch in production (dead weight once the MIME
// normalization bug it was added to diagnose is no longer being actively
// investigated). Gated behind the same debug convention route.ts uses so it
// can still be turned back on (env var, no redeploy) if the "still
// application/octet-stream in prod" question ever comes back.
const IMAGE_SERVICE_DEBUG_LOG = process.env.RENDER_DEBUG_LOG === "true" || process.env.NODE_ENV !== "production";

async function fetchReferenceImageFile(url: string): Promise<File> {
  const response = await fetch(url);
  const storageHeaderContentType = response.headers.get("content-type");
  const reportedType = storageHeaderContentType?.split(";")[0]?.trim().toLowerCase();
  const extension = new URL(url).pathname.split(".").pop()?.toLowerCase();

  const mimeType =
    (reportedType && SUPPORTED_IMAGE_MIME_TYPES.has(reportedType) ? reportedType : undefined) ??
    (extension ? EXTENSION_TO_MIME_TYPE[extension] : undefined) ??
    DEFAULT_IMAGE_MIME_TYPE;

  const bytes = await response.arrayBuffer();
  const blob = new Blob([bytes], { type: mimeType });
  const filename = `reference-image.${MIME_TYPE_TO_EXTENSION[mimeType]}`;
  const file = new File([blob], filename, { type: mimeType });

  // TEMPORARY DEBUG LOGGING (2026-07-29) — added to prove in production
  // whether MIME normalization actually runs before the OpenAI call. Remove
  // once the "still application/octet-stream in prod" report is confirmed
  // fixed or root-caused further.
  if (IMAGE_SERVICE_DEBUG_LOG) {
    console.log(
      [
        "[fetchReferenceImageFile] MIME normalization trace",
        `URL: ${url}`,
        `Storage Header (Content-Type): ${storageHeaderContentType ?? "(none)"}`,
        `Blob Type: ${blob.type}`,
        `Normalized File Type: ${file.type}`,
        `Filename: ${file.name}`,
        `Extension used: ${extension ?? "(none)"}`,
      ].join("\n"),
    );
  }

  return file;
}

export interface GenerateImageInput {
  model?: string;
  timeoutMs?: number;
  // Design Knowledge Pipeline V1 (decision 6-8) — optional visual
  // references (Customer Photo + Official Garment Reference Image) sent
  // alongside the text prompt. Empty/omitted keeps the existing
  // text-to-image call exactly as before (decision 7). Recipe Composer and
  // Prompt Builder never populate or read this — it is Image Service's own
  // concern only (decision 12), assembled by AI Asset Composer
  // (src/lib/design/aiAssetComposer/composer.ts).
  referenceImageUrls?: string[];
  // Sprint O.1 (Task 6) — lets a caller that already downloaded the
  // reference images itself (e.g. kicked off concurrently with its own
  // CPU-bound prompt-building stages, see route.ts) hand the resulting
  // Files straight in, so this call skips re-downloading them. Must be the
  // same length/order as `referenceImageUrls` when both are provided.
  // Omitted = fetch them here exactly as before (unchanged default path,
  // still used by the Debug Viewer and QA scripts).
  referenceImageFiles?: File[];
  // The final prompt string, already assembled by promptBuilder/
  // finalPrompt.ts (Identity Lock/Reference Binding/Garment/Material/Color/
  // Kerah/Plaket/Saku/Manset/Output, concatenated). Every real caller
  // supplies this — it is the only source of prompt text this service reads
  // now (see this file's header comment).
  promptOverride: string;
  // Identity Protection Mask (Render Investigation, 2026-08-06) — see
  // ai/services/identityMask.ts. Optional and additive: omitted (the
  // default) sends the request exactly as before this feature existed.
  // Per OpenAI's own images.edit contract, a mask applies to the FIRST
  // entry in `image` — this pipeline's `referenceImageUrls`/
  // `referenceImageFiles` always place the Customer Photo first
  // (aiAssetComposer/composer.ts), so this mask is always scoped to the
  // customer's own photo, never a Hero Image.
  maskFile?: File;
}

export interface GeneratedImage {
  url?: string;
  b64Json?: string;
  revisedPrompt?: string;
}

// Sprint O.1 (Task 1/5) — request-sent / response-received wall-clock
// timestamps for the ONE real network call to the AI provider, so the
// caller (route.ts's Render Profiler) can report exactly how much of a
// render's total time was spent waiting on OpenAI vs. everything else,
// without this module needing to know what a "profiler" is.
export interface ProviderTiming {
  requestSentAt: number;
  responseReceivedAt: number;
}

// Cost Observability (Sprint O foundation, completed this finalization) —
// raw token usage exactly as OpenAI reports it for gpt-image-1, passed
// through untouched. Deliberately NOT converted to a dollar estimate here:
// gpt-image-1's per-token pricing isn't something this module should hardcode
// (rates change, and a wrong embedded rate would silently mislead financial
// reporting) — persisting the real counts lets a future sprint compute cost
// against whatever OpenAI's pricing is AT THAT TIME. `undefined` (not an
// empty object) when the provider didn't include a usage block.
export type ProviderUsage = OpenAI.Images.ImagesResponse.Usage;

export type GenerateImageResult =
  | { ok: true; images: GeneratedImage[]; raw: OpenAI.Images.ImagesResponse; timing: ProviderTiming; usage?: ProviderUsage }
  | { ok: false; error: string; timing: ProviderTiming };

// Sprint O.1 (Task 4/6) — extracted so a caller can kick this off as soon as
// it knows the reference URLs (right after AI Asset Composer resolves them),
// concurrently with the recipe/prompt/compression stages that follow before
// generateImage() is ever called — those stages don't depend on the
// downloaded bytes, only on Supabase rows already in memory. Already
// downloads every URL in parallel (Promise.all) — this only changes WHEN
// that parallel download can start, not how it works.
export function prefetchReferenceImages(urls: string[]): Promise<File[]> {
  return Promise.all(urls.map((url) => fetchReferenceImageFile(url)));
}

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
  const prompt = input.promptOverride;

  if (!prompt) {
    const now = Date.now();
    return {
      ok: false,
      error: "No prompt supplied (promptOverride is required).",
      timing: { requestSentAt: now, responseReceivedAt: now },
    };
  }

  let client: OpenAI;
  try {
    client = getOpenAIClient();
  } catch (error) {
    const now = Date.now();
    return {
      ok: false,
      error: error instanceof Error ? error.message : "OpenAI client unavailable.",
      timing: { requestSentAt: now, responseReceivedAt: now },
    };
  }

  const referenceImageUrls = input.referenceImageUrls ?? [];
  // Bracket ONLY the real network call to OpenAI — reference-image download
  // (when this function does it itself, i.e. `referenceImageFiles` wasn't
  // pre-fetched by the caller) is deliberately excluded from `timing` so
  // provider latency never gets inflated by an unrelated Supabase Storage
  // download.
  let requestSentAt = 0;

  try {
    const referenceImageFiles = input.referenceImageFiles ?? (await Promise.all(referenceImageUrls.map((url) => fetchReferenceImageFile(url))));
    requestSentAt = Date.now();

    // decision 8: reference images present -> the image-input-capable
    // endpoint (images.edit); decision 7: none -> the existing
    // text-to-image call (images.generate), unchanged.
    const response =
      referenceImageUrls.length > 0
        ? await client.images.edit(
            {
              model: input.model ?? DEFAULT_MODEL,
              prompt,
              image: referenceImageFiles,
              // Sprint AI-R1 — input_fidelity was previously unset (OpenAI
              // default applies), so reference images (Customer Photo, Model
              // Thobe official reference) were not guaranteed to be
              // preserved at high fidelity during the edit. "high" is only
              // valid on images.edit (no such param exists on
              // images.generate, the no-reference-image branch below).
              input_fidelity: "high",
              // Identity Protection Mask — omitted entirely (not `mask:
              // undefined`) when the caller didn't supply one, so a request
              // with no mask is byte-identical to what this endpoint sent
              // before this feature existed.
              ...(input.maskFile ? { mask: input.maskFile } : {}),
            },
            { timeout: input.timeoutMs ?? DEFAULT_TIMEOUT_MS },
          )
        : await client.images.generate(
            {
              model: input.model ?? DEFAULT_MODEL,
              prompt,
            },
            { timeout: input.timeoutMs ?? DEFAULT_TIMEOUT_MS },
          );

    const responseReceivedAt = Date.now();

    if (!response.data || response.data.length === 0) {
      return { ok: false, error: "OpenAI returned an empty image response.", timing: { requestSentAt, responseReceivedAt } };
    }

    // GPT Image models (gpt-image-1 and family) never populate `image.url` —
    // per the OpenAI SDK's own Image type, that field is "Unsupported for
    // the GPT image models"; they return `b64_json` only. Without this, every
    // gpt-image-1 render came back `ok: true` with a fully generated image
    // that the caller could never display, since route.ts/RenderResult only
    // ever read `.url`. Building a displayable data: URL from the base64
    // payload here (once, in the one place that already knows the SDK
    // response shape) is what actually makes the image reach the UI.
    const outputFormat = response.output_format ?? "png";

    return {
      ok: true,
      images: response.data.map((image) => ({
        url: image.url ?? (image.b64_json ? `data:image/${outputFormat};base64,${image.b64_json}` : undefined),
        b64Json: image.b64_json,
        revisedPrompt: image.revised_prompt,
      })),
      raw: response,
      timing: { requestSentAt, responseReceivedAt },
      usage: response.usage,
    };
  } catch (error) {
    const responseReceivedAt = Date.now();
    if (error instanceof APIConnectionTimeoutError) {
      return { ok: false, error: "OpenAI image request timed out.", timing: { requestSentAt, responseReceivedAt } };
    }

    if (error instanceof APIError) {
      return { ok: false, error: `OpenAI request failed: ${error.message}`, timing: { requestSentAt, responseReceivedAt } };
    }

    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error generating image.",
      timing: { requestSentAt, responseReceivedAt },
    };
  }
}
