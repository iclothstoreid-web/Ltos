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

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}
