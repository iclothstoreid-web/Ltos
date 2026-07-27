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
              image: await Promise.all(referenceImageUrls.map((url) => fetch(url))),
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

    return {
      ok: true,
      images: response.data.map((image) => ({
        url: image.url,
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
