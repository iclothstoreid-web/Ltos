import OpenAI, { APIConnectionTimeoutError, APIError } from "openai";
import type { RenderInstruction } from "@/lib/design/promptBuilder/types";
import { serializeOpenAI } from "@/lib/design/promptBuilder/serializer";
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
  const prompt = serializeOpenAI({ instruction: input.instruction });

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

  try {
    const response = await client.images.generate(
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
