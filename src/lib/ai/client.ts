import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (typeof window !== "undefined") {
    throw new Error("getOpenAIClient() is server-only and must not run in the browser.");
  }

  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  // Sprint O (Task 2, Controlled Retry Policy) — the SDK's own default
  // (maxRetries: 2, see node_modules/openai/client.js) retries transient
  // errors SILENTLY before this app ever sees a failure: a single
  // generateImage() call could fire up to 3 real, separately-billed
  // gpt-image-1 requests with zero trace in application code or logs. That
  // is a confirmed, code-verified mechanism behind unexplained OpenAI
  // spend (see SPRINT_AI_STABILITY render/cost audits). maxRetries: 0
  // disables it entirely — any retry from here on only happens through
  // src/lib/ai/renderSession/service.ts's generateImageWithControlledRetry,
  // which is explicit, bounded, and counted into Render History.
  cachedClient = new OpenAI({ apiKey, maxRetries: 0 });
  return cachedClient;
}
