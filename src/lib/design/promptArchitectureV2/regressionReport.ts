import { PIPELINE_VERSIONS, type PromptVersion } from './versions'

// Regression Report (Sprint AI-R2.5, Part 8) — turns a batch of Render Test
// Runner scenario results into one Markdown report with exactly the fields
// the brief lists: Tanggal, Model AI, Prompt Version, Serializer Version,
// Compression Version, Input Fidelity, Reference Images, Prompt, Revised
// Prompt, Validation, Output. Pure function — no filesystem access here;
// the Test Runner script decides where/whether to write this string.

export interface ScenarioValidationSummary {
  dnaValidator: { itemId: string; valid: boolean; errors: string[] }[]
  promptValidator: { valid: boolean; checks: { label: string; status: 'PASS' | 'FAIL' }[] } | null
  renderRequestValidator: { valid: boolean; checks: { label: string; status: 'PASS' | 'FAIL' }[] }
}

export interface ScenarioOutput {
  ok: boolean
  cancelled: boolean
  cancelReason?: string
  renderedImageUrl: string | null
  error?: string
}

export interface ScenarioCapabilitySummary {
  mode: 'PREMIUM' | 'HIGH' | 'STANDARD' | 'LIMITED' | 'BLOCKED'
  capabilityScore: number
  qualityLevel: number
  warnings: string[]
}

export interface ScenarioRunResult {
  customerId: string
  customerLabel: string
  dnaId: string
  dnaLabel: string
  promptVersion: PromptVersion
  timestamp: string
  model: string
  inputFidelity: string | null
  referenceImages: string[]
  prompt: string | null
  revisedPrompt: string | null
  validation: ScenarioValidationSummary
  output: ScenarioOutput
  /** Sprint AI-R3 — AI Capability Engine grade for this scenario. Optional
   *  only so a `skippedReason` result (no pipeline data to grade) doesn't
   *  need a fabricated value. */
  capability?: ScenarioCapabilitySummary
  skippedReason?: string
}

function statusIcon(pass: boolean): string {
  return pass ? '✅ PASS' : '❌ FAIL'
}

function formatValidationBlock(validation: ScenarioValidationSummary): string {
  const lines: string[] = []

  lines.push(`- DNA Validator: ${statusIcon(validation.dnaValidator.every((d) => d.valid))}`)
  validation.dnaValidator
    .filter((d) => !d.valid)
    .forEach((d) => lines.push(`  - ${d.itemId}: ${d.errors.join(' | ')}`))

  if (validation.promptValidator) {
    lines.push(`- Prompt Validator (4 layers): ${statusIcon(validation.promptValidator.valid)}`)
    validation.promptValidator.checks
      .filter((c) => c.status === 'FAIL')
      .forEach((c) => lines.push(`  - ${c.label}: FAIL`))
  }

  lines.push(`- Render Validator (deterministic): ${statusIcon(validation.renderRequestValidator.valid)}`)
  validation.renderRequestValidator.checks
    .filter((c) => c.status === 'FAIL')
    .forEach((c) => lines.push(`  - ${c.label}: FAIL`))

  return lines.join('\n')
}

function formatScenario(result: ScenarioRunResult): string {
  if (result.skippedReason) {
    return [
      `### ${result.customerLabel} × ${result.dnaLabel}`,
      '',
      `**SKIPPED** — ${result.skippedReason}`,
      '',
    ].join('\n')
  }

  return [
    `### ${result.customerLabel} × ${result.dnaLabel}`,
    '',
    `| Field | Value |`,
    `| --- | --- |`,
    `| Tanggal | ${result.timestamp} |`,
    `| Model AI | ${result.model} |`,
    `| Prompt Version | ${PIPELINE_VERSIONS.promptArchitecture[result.promptVersion]} |`,
    `| Serializer Version | ${PIPELINE_VERSIONS.serializer} |`,
    `| Compression Version | ${PIPELINE_VERSIONS.compression} |`,
    `| Input Fidelity | ${result.inputFidelity ?? '(tidak berlaku)'} |`,
    `| Capability | ${result.capability ? `${result.capability.mode} — ${result.capability.capabilityScore}% (quality ${result.capability.qualityLevel}/5)${result.capability.warnings.length ? ` — ${result.capability.warnings.join('; ')}` : ''}` : '(tidak dihitung)'} |`,
    `| Reference Images | ${result.referenceImages.length} — ${result.referenceImages.join(', ') || '—'} |`,
    `| Output | ${result.output.cancelled ? `CANCELLED (${result.output.cancelReason ?? '—'})` : result.output.ok ? `OK — ${result.output.renderedImageUrl ?? '(no url)'}` : `ERROR — ${result.output.error ?? '—'}`} |`,
    '',
    '**Prompt**',
    '```',
    result.prompt ?? '(null)',
    '```',
    '',
    '**Revised Prompt (GPT)**',
    '```',
    result.revisedPrompt ?? '(tidak ada — dry run/cancelled/OpenAI tidak mengembalikan revised_prompt)',
    '```',
    '',
    '**Validation**',
    formatValidationBlock(result.validation),
    '',
  ].join('\n')
}

export function generateRegressionReportMarkdown(results: ScenarioRunResult[], generatedAt: string = new Date().toISOString()): string {
  const total = results.length
  const skipped = results.filter((r) => r.skippedReason).length
  const cancelled = results.filter((r) => r.output?.cancelled).length
  const passed = results.filter((r) => !r.skippedReason && !r.output.cancelled && r.output.ok).length
  const failed = total - skipped - cancelled - passed

  return [
    '# AI Render — Regression Report',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Summary',
    '',
    `- Total scenarios: ${total}`,
    `- Passed: ${passed}`,
    `- Failed: ${failed}`,
    `- Cancelled by Render Validator: ${cancelled}`,
    `- Skipped (incomplete golden dataset entry): ${skipped}`,
    '',
    '## Scenarios',
    '',
    ...results.map(formatScenario),
  ].join('\n')
}
