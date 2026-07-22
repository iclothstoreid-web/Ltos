import { getOpenAIClient } from "../client";

export type OpenAIHealthCheckResult =
  | { ok: true; sampleModel: string }
  | { ok: false; error: string };

export async function checkOpenAIHealth(): Promise<OpenAIHealthCheckResult> {
  try {
    const client = getOpenAIClient();
    const models = await client.models.list();
    const sampleModel = models.data[0]?.id ?? "unknown";
    return { ok: true, sampleModel };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
