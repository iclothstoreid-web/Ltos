import OpenAI, { APIConnectionTimeoutError, APIError } from "openai";
import type { RenderInstruction } from "@/lib/design/promptBuilder/types";
import { serializeOpenAI } from "@/lib/design/promptBuilder/serializer";
import type { CustomerDigitalProfile } from "@/lib/customerProfile/types";
import type { MasterDataOption } from "@/lib/design/masterData";
import { getOpenAIClient } from "../client";

// Image Generation Service — the ONLY door from LTOS domain code into an AI
// provider for image generation. Domain must never call src/lib/ai/providers
// directly; it calls this service, which reads the neutral RenderInstruction,
// asks the domain's own Prompt Serializer for provider-flavored prompt text,
// then hands that off to the OpenAI provider client. No storage, no DB, no UI
// this sprint — raw SDK output only.

const DEFAULT_MODEL = "gpt-image-1";
const DEFAULT_TIMEOUT_MS = 60_000;

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

  return file;
}

export interface GenerateImageInput {
  instruction: RenderInstruction;
  model?: string;
  timeoutMs?: number;
  // Design Knowledge Pipeline V1 (decision 6-8) — optional visual
  // references (Customer Photo + Official Garment Reference Image) sent
  // alongside the text prompt. Empty/omitted keeps the existing
  // text-to-image call exactly as before (decision 7). Recipe Composer and
  // Prompt Builder never populate or read this — it is Image Service's own
  // concern only (decision 12), assembled by buildReferenceImageUrls below.
  referenceImageUrls?: string[];
  // Added 2026-07-27 (DNA Resolver / render-pipeline integration) — lets a
  // caller that already ran its own token-budgeted compression (see
  // promptBuilder/compression.ts) hand this service a final prompt string
  // directly, instead of the service re-deriving one from `instruction` via
  // serializeOpenAI. Optional and additive: every existing caller keeps
  // getting the full uncompressed serialization exactly as before.
  promptOverride?: string;
}

export interface GeneratedImage {
  url?: string;
  b64Json?: string;
  revisedPrompt?: string;
}

export type GenerateImageResult =
  | { ok: true; images: GeneratedImage[]; raw: OpenAI.Images.ImagesResponse }
  | { ok: false; error: string };

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
  const prompt = input.promptOverride ?? serializeOpenAI({ instruction: input.instruction });

  if (!prompt) {
    return {
      ok: false,
      error: "RenderInstruction could not be serialized into a prompt (Prompt Serializer not implemented yet).",
    };
  }

  let client: OpenAI;
  try {
    client = getOpenAIClient();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "OpenAI client unavailable." };
  }

  const referenceImageUrls = input.referenceImageUrls ?? [];

  try {
    // decision 8: reference images present -> the image-input-capable
    // endpoint (images.edit); decision 7: none -> the existing
    // text-to-image call (images.generate), unchanged.
    const response =
      referenceImageUrls.length > 0
        ? await client.images.edit(
            {
              model: input.model ?? DEFAULT_MODEL,
              prompt,
              image: await Promise.all(referenceImageUrls.map((url) => fetchReferenceImageFile(url))),
              // Sprint AI-R1 — input_fidelity was previously unset (OpenAI
              // default applies), so reference images (Customer Photo, Model
              // Thobe official reference) were not guaranteed to be
              // preserved at high fidelity during the edit. "high" is only
              // valid on images.edit (no such param exists on
              // images.generate, the no-reference-image branch below).
              input_fidelity: "high",
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

    if (!response.data || response.data.length === 0) {
      return { ok: false, error: "OpenAI returned an empty image response." };
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
    };
  } catch (error) {
    if (error instanceof APIConnectionTimeoutError) {
      return { ok: false, error: "OpenAI image request timed out." };
    }

    if (error instanceof APIError) {
      return { ok: false, error: `OpenAI request failed: ${error.message}` };
    }

    return { ok: false, error: error instanceof Error ? error.message : "Unknown error generating image." };
  }
}

// Design Knowledge Pipeline V1 (decision 9-10) — the ONLY two visual
// references GPT Image ever receives: the Customer Photo and the Model
// Thobe's frozen Official Reference Image (`ai_dna.metadata.sourceImage`,
// set by markDnaGenerated). Every other category — Collar, Cuff, Plaket,
// Pocket, Button, Embroidery, Fabric, Color — is deliberately excluded here;
// those are described through Render Recipe -> Prompt Builder -> Prompt
// text only, never as an image input. Caller must pass the Model Thobe
// MasterDataOption specifically (not any other category) as `modelThobe`.
export function buildReferenceImageUrls(params: {
  customerDigitalProfile: CustomerDigitalProfile | null;
  modelThobe: MasterDataOption | null;
}): string[] {
  const urls: string[] = [];

  const customerPhotoUrl = params.customerDigitalProfile?.customerPhoto?.url;
  if (customerPhotoUrl) urls.push(customerPhotoUrl);

  const officialReferenceImage = params.modelThobe?.ai_dna.metadata.sourceImage;
  if (officialReferenceImage) urls.push(officialReferenceImage);

  return urls;
}
