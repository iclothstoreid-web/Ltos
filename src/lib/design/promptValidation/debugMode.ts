// Debug / Production mode (Sprint AI-R2.5, Part 9). This is a logging
// verbosity switch ONLY — it never changes what gets rendered or which
// validators run, only how much of the payload/prompt/revised-prompt/
// validator output gets persisted alongside a Render Test Runner result
// (renderTestRunner/regressionReport.ts) or logged to the console.
//
// Debug:      full payload, prompt, revised prompt, every validator's full
//             detail all saved.
// Production: terse — PASS/FAIL summary only, no raw payload/prompt text.
//
// Controlled by RENDER_DEBUG_MODE env var so the Render Test Runner
// (a Node script, not a request handler) and any API route can share the
// same switch without threading a parameter through every call site.
// Defaults to 'debug' — this framework exists for developers, and a
// developer running `npm run render:test` who forgot to set the env var
// should get the verbose output, not silently truncated results.

export type RenderRunMode = 'debug' | 'production'

export function getRenderRunMode(): RenderRunMode {
  return process.env.RENDER_DEBUG_MODE === 'false' ? 'production' : 'debug'
}

export function isDebugMode(mode: RenderRunMode = getRenderRunMode()): boolean {
  return mode === 'debug'
}
