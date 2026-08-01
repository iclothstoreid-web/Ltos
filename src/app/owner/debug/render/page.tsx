'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  MASTER_DATA_CATEGORIES,
  masterDataCategoryLabel,
  fetchAllMasterOptions,
  type MasterDataCategory,
  type MasterDataOption,
  type MasterOptionsByCategory,
} from '@/lib/design/masterData'

// DNA Debug Viewer (Sprint AI-R1) — internal developer tool only. Not linked
// from any customer- or fitter-facing navigation; reached by typing the URL
// directly. Calls /api/design/render/debug, which runs the exact same
// pipeline functions as the real render endpoint (never a re-implementation
// of pipeline logic in this file) and returns a full stage-by-stage report.

interface ValidationRow {
  id: string
  label: string
  status: 'PASS' | 'FAIL' | 'INFO'
  reason: string
}

interface OverrideRow {
  field: string
  key: string
  winner: { itemId: string; category: string } | null
  losers: { itemId: string; category: string }[]
}

interface DebugResponse {
  success: boolean
  error?: string
  rawDna: {
    componentType: string
    componentId: string
    found: boolean
    name: string | null
    category: string | null
    ai_dna: unknown
    render_recipe: unknown
  }[]
  resolvedDna: {
    componentType: string
    componentId: string
    category: string | null
    name: string | null
    ready: boolean
    errors: string[]
    garmentKeys: string[]
  }[]
  componentsMissing: { componentId: string; componentType: string; reason: string }[]
  recipeComposer: {
    masterRecipe: Record<string, unknown> | null
    trace: Record<string, { key: string; value: unknown; resolvedFrom: { itemId: string; category: string } | null; overriddenSources: { itemId: string; category: string }[] }[]> | null
    overrides: OverrideRow[]
  }
  promptBuilder: {
    instruction: Record<string, unknown> | null
    instructionValidation: { valid: boolean; errors: string[] }
  }
  serializer: { uncompressed: string | null; issues: string[] }
  compression: {
    before: string | null
    beforeChars: number
    after: string
    afterChars: number
    totalTokens: number
    sectionsIncluded: string[]
    sectionsOmitted: string[]
    estimatedTokens: Record<string, number>
    issues: string[]
  } | null
  finalRequest: {
    model: string
    endpoint: string
    prompt: string | null
    promptVersionUsed: 'v1' | 'v2'
    referenceImages: string[]
    mask: string | null
    input_fidelity: string | null
    imageCount: number
    timeoutMs: number
    size: string | null
  }
  referenceImages: {
    customerPhoto: {
      url: string
      included: boolean
      framing: { ok: true; framing: 'full_body' | 'half_body' | 'unclear'; reasoning: string } | { ok: false; error: string } | null
    }
    modelThobeReference: { itemId: string | null; name: string | null; url: string | null; included: boolean; note: string | null }
    excludedByDesign: string[]
  }
  aiResponse: {
    executed: boolean
    ok?: boolean
    cancelled?: boolean
    cancelReason?: string
    renderedImageUrl?: string | null
    revisedPrompt?: string | null
    usage?: unknown
    latencyMs?: number
    responseSizeBytes?: number
    error?: string
  }
  renderValidator:
    | null
    | {
        ok: true
        overallStatus: 'PASS' | 'FAIL'
        faceSimilarity: RenderQualityMetric
        bodySimilarity: RenderQualityMetric
        poseSimilarity: RenderQualityMetric
        garmentSimilarity: RenderQualityMetric
        dnaCompliance: RenderQualityMetric
      }
    | { ok: false; error: string }
  validation: ValidationRow[]
  dnaValidator: {
    itemId: string
    category: string
    valid: boolean
    requiredFields: string[]
    missingFields: string[]
    errors: string[]
  }[]
  promptArchitectureV2: {
    layers: { identity: string; composition: string; garmentDna: string; quality: string; negativeRules: string[] }
    merged: string
    compressed: string
    totalTokens: number
    sectionsIncluded: string[]
    sectionsOmitted: string[]
    promptValidator: { valid: boolean; checks: { layer: string; label: string; status: 'PASS' | 'FAIL'; reason: string }[] }
    issues: string[]
  }
  renderRequestValidator: {
    valid: boolean
    cancelled: boolean
    checks: { id: string; label: string; status: 'PASS' | 'FAIL'; reason: string }[]
  }
  runMode: 'debug' | 'production'
  aiAssetComposer: {
    customerPhotoUrl: string
    modelReference: { type: string; role: string; priority: number; itemId: string; url: string } | null
    collarReference: { type: string; role: string; priority: number; itemId: string; url: string } | null
    urls: string[]
    excluded: { category: string; reason: string }[]
    backgroundReferenceCount: 0
    mannequinReferenceCount: 0
  }
  aiAssets: {
    referenceType: string
    referenceRole: string
    name: string | null
    priority: number
    status: 'ACTIVE' | 'INACTIVE'
    aiDnaStatus: string | null
    catalogActive: boolean | null
    included: boolean
    validation: { valid: boolean; reason: string }
    transferredGeometry: string[]
    ignored: string[]
  }[]
  capability: {
    mode: 'PREMIUM' | 'HIGH' | 'STANDARD' | 'LIMITED' | 'BLOCKED'
    capabilityScore: number
    qualityLevel: number
    warnings: string[]
    missingReferences: string[]
    missingDNA: string[]
    strategy: {
      includeCustomerPhoto: boolean
      includeModelReference: boolean
      includeDna: boolean
      includeIdentityLock: boolean
      sendToOpenAI: boolean
    }
    blockedReason: string | null
  }
}

interface RenderQualityMetric {
  score: number
  threshold: number
  status: 'PASS' | 'FAIL'
  reasoning: string
}

function StatusBadge({ status }: { status: 'PASS' | 'FAIL' | 'INFO' }) {
  const styles =
    status === 'PASS'
      ? 'bg-green-100 text-green-800 border-green-300'
      : status === 'FAIL'
        ? 'bg-red-100 text-red-800 border-red-300'
        : 'bg-gray-100 text-gray-700 border-gray-300'
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${styles}`}>{status}</span>
  )
}

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-4 rounded-[14px] border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-gray-900"
      >
        <span>{title}</span>
        <span className="text-gray-400">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="border-t border-gray-100 px-4 py-3">{children}</div>}
    </div>
  )
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-96 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-green-300">
      {JSON.stringify(value, null, 2) ?? 'null'}
    </pre>
  )
}

export default function RenderDebugPage() {
  const [optionsByCategory, setOptionsByCategory] = useState<MasterOptionsByCategory | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState('')
  const [selected, setSelected] = useState<Partial<Record<MasterDataCategory, string>>>({})
  const [dryRun, setDryRun] = useState(true)
  const [runVisionJudge, setRunVisionJudge] = useState(false)
  const [promptVersion, setPromptVersion] = useState<'v1' | 'v2'>('v1')
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [result, setResult] = useState<DebugResponse | null>(null)

  useEffect(() => {
    const supabase = createClient()
    fetchAllMasterOptions(supabase)
      .then(setOptionsByCategory)
      .catch((err) => setLoadError(err instanceof Error ? err.message : String(err)))
  }, [])

  const componentSelections = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, id]) => !!id)
        .map(([componentType, componentId]) => ({ componentType, componentId: componentId as string })),
    [selected],
  )

  function optionLabel(option: MasterDataOption) {
    return `${option.name} (${option.ai_dna.status}/${option.render_recipe.status})`
  }

  async function runDebug() {
    setRunning(true)
    setRunError(null)
    setResult(null)
    try {
      const res = await fetch('/api/design/render/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerPhotoUrl, componentSelections, dryRun, runVisionJudge, promptVersion }),
      })
      const json = (await res.json()) as DebugResponse
      if (!res.ok || !json.success) {
        setRunError(json.error ?? `Request failed (${res.status})`)
      } else {
        setResult(json)
      }
    } catch (err) {
      setRunError(err instanceof Error ? err.message : String(err))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">AI Render — DNA Debug Viewer</h1>
      <p className="mb-6 text-sm text-gray-500">
        Internal developer tool. Menjalankan pipeline nyata (DNA Resolver → Recipe Composer → Prompt Builder →
        Serializer → Compression → Image Service) dan menampilkan setiap tahap tanpa menyembunyikan field apa pun.
      </p>

      <div className="mb-6 rounded-[14px] border border-gray-200 bg-white p-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Customer Photo URL</label>
        <input
          type="text"
          value={customerPhotoUrl}
          onChange={(e) => setCustomerPhotoUrl(e.target.value)}
          placeholder="https://.../customer-photo.jpg"
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        {loadError && <p className="mb-2 text-sm text-red-600">Gagal memuat master data: {loadError}</p>}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MASTER_DATA_CATEGORIES.map((category) => (
            <div key={category}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{masterDataCategoryLabel(category)}</label>
              <select
                value={selected[category] ?? ''}
                onChange={(e) =>
                  setSelected((prev) => ({ ...prev, [category]: e.target.value || undefined }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">— tidak dipilih —</option>
                {(optionsByCategory?.[category] ?? []).map((option) => (
                  <option key={option.id} value={option.id}>
                    {optionLabel(option)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
            Dry run (jangan panggil OpenAI image render sungguhan)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={runVisionJudge} onChange={(e) => setRunVisionJudge(e.target.checked)} />
            Jalankan Vision Judge (biaya kecil, GPT-4o-mini — cek framing foto + Render Quality Judge)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            Prompt Version dikirim ke OpenAI:
            <select
              value={promptVersion}
              onChange={(e) => setPromptVersion(e.target.value as 'v1' | 'v2')}
              className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="v1">V1 (legacy serializer/compression — dipakai production)</option>
              <option value="v2">V2 (4-layer architecture — perbandingan/regresi saja)</option>
            </select>
          </label>
          <button
            type="button"
            onClick={runDebug}
            disabled={running || !customerPhotoUrl || componentSelections.length === 0}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {running ? 'Menjalankan...' : 'Run Debug Pipeline'}
          </button>
        </div>
        {runError && <p className="mt-2 text-sm text-red-600">{runError}</p>}
      </div>

      {result && (
        <>
          <div
            className={`mb-6 rounded-[14px] border p-4 ${
              result.capability.mode === 'BLOCKED'
                ? 'border-red-300 bg-red-50'
                : result.capability.mode === 'PREMIUM'
                  ? 'border-green-300 bg-green-50'
                  : 'border-amber-300 bg-amber-50'
            }`}
          >
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              AI Capability Engine (Sprint AI-R3) — Render Capability
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <div className="text-lg font-bold text-gray-900">Mode: {result.capability.mode}</div>
              <div className="text-sm text-gray-700">
                Capability: <strong>{result.capability.capabilityScore}%</strong>
              </div>
              <div className="text-sm text-gray-700">
                Quality:{' '}
                <span aria-label={`${result.capability.qualityLevel}/5`}>
                  {'★'.repeat(result.capability.mode === 'BLOCKED' ? 0 : result.capability.qualityLevel)}
                  {'☆'.repeat(5 - (result.capability.mode === 'BLOCKED' ? 0 : result.capability.qualityLevel))}
                </span>
              </div>
            </div>
            {result.capability.mode === 'BLOCKED' ? (
              <div className="mt-2 text-sm font-semibold text-red-700">Blocked: {result.capability.blockedReason}</div>
            ) : (
              <>
                <div className="mt-2 text-sm text-gray-700">
                  Warnings: {result.capability.warnings.length > 0 ? result.capability.warnings.join(' | ') : 'None'}
                </div>
                {result.capability.missingReferences.length > 0 && (
                  <div className="text-xs text-amber-700">Missing Reference: {result.capability.missingReferences.join(', ')}</div>
                )}
                {result.capability.missingDNA.length > 0 && (
                  <div className="text-xs text-amber-700">Missing DNA: {result.capability.missingDNA.join(', ')}</div>
                )}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                  <span>Customer Photo: {result.capability.strategy.includeCustomerPhoto ? '✅' : '—'}</span>
                  <span>Model Reference: {result.capability.strategy.includeModelReference ? '✅' : '—'}</span>
                  <span>DNA: {result.capability.strategy.includeDna ? '✅' : '—'}</span>
                  <span>Identity Lock: {result.capability.strategy.includeIdentityLock ? '✅' : '—'}</span>
                </div>
              </>
            )}
          </div>

          <Section title="Prompt Inspector (Part 5) — DNA → Resolved DNA → Recipe → Serialized → Compressed → Final → GPT Revised Prompt" defaultOpen>
            <div className="space-y-2">
              {[
                { step: 1, label: 'DNA (raw)', content: result.rawDna.map((r) => `${r.componentType}: ${r.name ?? 'not found'}`).join(' | ') || '—' },
                { step: 2, label: 'Resolved DNA', content: result.resolvedDna.map((r) => `${r.componentType}: ${r.ready ? 'ready' : 'NOT ready'}`).join(' | ') || '—' },
                { step: 3, label: 'Recipe (Master Render Recipe)', content: result.recipeComposer.masterRecipe ? Object.keys(result.recipeComposer.masterRecipe).filter((k) => k !== 'sources' && k !== 'composedAt').join(', ') : '(null — compose gagal / entries kosong)' },
                { step: 4, label: 'Serialized Prompt (uncompressed)', content: result.serializer.uncompressed ?? '(null)' },
                { step: 5, label: 'Compressed Prompt', content: result.compression?.after ?? '(belum berjalan)' },
                { step: 6, label: 'Final Prompt (dikirim ke OpenAI)', content: result.finalRequest.prompt ?? '(null)' },
                { step: 7, label: 'GPT Revised Prompt', content: result.aiResponse.executed ? (result.aiResponse.revisedPrompt ?? '(OpenAI tidak mengembalikan revised_prompt)') : '(belum dijalankan — dry run atau belum render)' },
              ].map((item, i, arr) => (
                <div key={item.step}>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-2">
                    <div className="text-xs font-semibold text-gray-500">
                      {item.step}. {item.label}
                    </div>
                    <div className="mt-1 whitespace-pre-wrap break-words text-xs text-gray-800">{item.content}</div>
                  </div>
                  {i < arr.length - 1 && <div className="py-1 text-center text-gray-300">↓</div>}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Prompt Inspector V2 (Part 1+2) — Layer 1 → Layer 2 → Layer 3 → Layer 4 → Merged → Compressed → Final → GPT Revised Prompt" defaultOpen>
            <div className="mb-2 text-xs italic text-gray-500">
              Perbandingan saja — hanya dipakai untuk request nyata ke OpenAI jika &quot;Prompt Version&quot; = V2 di atas. Production
              (/api/design/render/route.ts) tetap selalu memakai V1.
            </div>
            <div className="space-y-2">
              {[
                { label: 'Layer 1 — Identity (template permanen)', content: result.promptArchitectureV2.layers.identity },
                { label: 'Layer 2 — Composition (template permanen)', content: result.promptArchitectureV2.layers.composition },
                { label: 'Layer 3 — Garment DNA (dari Recipe Composer)', content: result.promptArchitectureV2.layers.garmentDna || '(kosong)' },
                { label: 'Layer 4 — Quality (template permanen)', content: result.promptArchitectureV2.layers.quality },
                { label: 'Merged Prompt', content: result.promptArchitectureV2.merged },
                { label: 'Compressed Prompt', content: result.promptArchitectureV2.compressed },
                {
                  label: 'Final Prompt (dikirim ke OpenAI jika Prompt Version=V2)',
                  content: result.finalRequest.promptVersionUsed === 'v2'
                    ? (result.finalRequest.prompt ?? '(null)')
                    : '(tidak dipakai untuk request ini — Prompt Version aktif: v1)',
                },
                {
                  label: 'GPT Revised Prompt',
                  content: result.aiResponse.executed && result.finalRequest.promptVersionUsed === 'v2'
                    ? (result.aiResponse.revisedPrompt ?? '(OpenAI tidak mengembalikan revised_prompt)')
                    : '(belum dijalankan dengan V2 — dry run, cancelled, atau Prompt Version=v1)',
                },
              ].map((item, i, arr) => (
                <div key={item.label}>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-2">
                    <div className="text-xs font-semibold text-gray-500">{item.label}</div>
                    <div className="mt-1 whitespace-pre-wrap break-words text-xs text-gray-800">{item.content}</div>
                  </div>
                  {i < arr.length - 1 && <div className="py-1 text-center text-gray-300">↓</div>}
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>Tokens (est.): {result.promptArchitectureV2.totalTokens}</div>
              <div>Sections included: {result.promptArchitectureV2.sectionsIncluded.join(', ') || '—'}</div>
              <div className="col-span-2 text-red-600">
                Sections omitted: {result.promptArchitectureV2.sectionsOmitted.join(', ') || '—'}
              </div>
            </div>
            {result.promptArchitectureV2.issues.length > 0 && (
              <div className="mt-1 text-xs font-semibold text-red-600">FAIL — ditemukan: {result.promptArchitectureV2.issues.join(', ')}</div>
            )}
            <div className="mt-3 mb-1 text-sm font-semibold text-gray-800">
              Prompt Validator (Part 3):{' '}
              <StatusBadge status={result.promptArchitectureV2.promptValidator.valid ? 'PASS' : 'FAIL'} />
            </div>
            <div className="space-y-1">
              {result.promptArchitectureV2.promptValidator.checks.map((check) => (
                <div key={check.layer} className="flex items-start gap-3 rounded-lg border border-gray-100 p-2">
                  <StatusBadge status={check.status} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{check.label}</div>
                    <div className="text-xs text-gray-500">{check.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="DNA Validator (Part 4) — per-component, deterministic">
            {result.dnaValidator.length === 0 ? (
              <div className="text-xs text-gray-500">Tidak ada komponen untuk divalidasi.</div>
            ) : (
              <div className="space-y-2">
                {result.dnaValidator.map((row) => (
                  <div key={row.itemId} className="rounded-lg border border-gray-100 p-2">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={row.valid ? 'PASS' : 'FAIL'} />
                      <div className="text-sm font-medium text-gray-900">
                        {row.category} — {row.itemId}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Required fields: {row.requiredFields.join(', ') || '—'}
                    </div>
                    {row.missingFields.length > 0 && (
                      <div className="text-xs text-red-600">Missing: {row.missingFields.join(', ')}</div>
                    )}
                    {row.errors.length > 0 && (
                      <div className="mt-1 text-xs text-red-600">{row.errors.join(' | ')}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Render Validator — Deterministic (Part 5, tanpa AI)" defaultOpen>
            <div className="mb-2 text-sm font-semibold text-gray-800">
              Overall:{' '}
              <StatusBadge status={result.renderRequestValidator.valid ? 'PASS' : 'FAIL'} />{' '}
              {result.renderRequestValidator.cancelled && !dryRun && (
                <span className="text-xs font-normal text-red-600">— Render dibatalkan, request TIDAK dikirim ke OpenAI.</span>
              )}
            </div>
            <div className="space-y-1">
              {result.renderRequestValidator.checks.map((check) => (
                <div key={check.id} className="flex items-start gap-3 rounded-lg border border-gray-100 p-2">
                  <StatusBadge status={check.status} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{check.label}</div>
                    <div className="text-xs text-gray-500">{check.reason}</div>
                  </div>
                </div>
              ))}
            </div>
            {result.aiResponse.cancelled && (
              <div className="mt-2 text-xs font-semibold text-red-600">Cancel reason: {result.aiResponse.cancelReason}</div>
            )}
          </Section>

          <Section title="Section 9 — Validation" defaultOpen>
            <div className="space-y-2">
              {result.validation.map((row) => (
                <div key={row.id} className="flex items-start gap-3 rounded-lg border border-gray-100 p-2">
                  <StatusBadge status={row.status} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{row.label}</div>
                    <div className="text-xs text-gray-500">{row.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Section 1 — Raw DNA (per component)">
            {result.rawDna.map((item) => (
              <div key={item.componentId} className="mb-3">
                <div className="mb-1 text-sm font-semibold text-gray-800">
                  {item.componentType} — {item.name ?? '(not found)'} {item.category ? `[${item.category}]` : ''}
                </div>
                <JsonBlock value={{ ai_dna: item.ai_dna, render_recipe: item.render_recipe }} />
              </div>
            ))}
          </Section>

          <Section title="Section 2 — Resolved DNA (resolveDNA output)">
            <table className="mb-3 w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500">
                  <th className="py-1 pr-2">Component</th>
                  <th className="py-1 pr-2">Category</th>
                  <th className="py-1 pr-2">Ready</th>
                  <th className="py-1 pr-2">Garment keys</th>
                  <th className="py-1 pr-2">Errors</th>
                </tr>
              </thead>
              <tbody>
                {result.resolvedDna.map((row) => (
                  <tr key={row.componentId} className="border-t border-gray-100">
                    <td className="py-1 pr-2">{row.componentType} — {row.name ?? '—'}</td>
                    <td className="py-1 pr-2">{row.category ?? '—'}</td>
                    <td className="py-1 pr-2">
                      <StatusBadge status={row.ready ? 'PASS' : 'FAIL'} />
                    </td>
                    <td className="py-1 pr-2">{row.garmentKeys.join(', ') || '—'}</td>
                    <td className="py-1 pr-2 text-red-600">{row.errors.join(' ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-xs text-gray-500">componentsMissing: {result.componentsMissing.length}</div>
            {result.componentsMissing.length > 0 && <JsonBlock value={result.componentsMissing} />}
          </Section>

          <Section title="Section 3 — Recipe Composer (merge + provenance)">
            <div className="mb-3">
              <div className="mb-1 text-sm font-semibold text-gray-800">Overrides</div>
              {result.recipeComposer.overrides.length === 0 ? (
                <div className="text-xs text-gray-500">Tidak ada override terdeteksi.</div>
              ) : (
                <div className="space-y-1">
                  {result.recipeComposer.overrides.map((override, i) => (
                    <div key={i} className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-800">
                      <strong>{override.field}.{override.key}</strong> ← <strong>{override.winner?.category ?? '?'}</strong>{' '}
                      OVERRIDE {override.losers.map((l) => l.category).join(', ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-1 text-sm font-semibold text-gray-800">Field provenance trace</div>
            <JsonBlock value={result.recipeComposer.trace} />
            <div className="mt-3 mb-1 text-sm font-semibold text-gray-800">Master Render Recipe (merged)</div>
            <JsonBlock value={result.recipeComposer.masterRecipe} />
          </Section>

          <Section title="Section 4 — Serializer (RenderInstruction + uncompressed prompt)">
            <div className="mb-1 text-sm font-semibold text-gray-800">
              Instruction Validation:{' '}
              <StatusBadge status={result.promptBuilder.instructionValidation.valid ? 'PASS' : 'FAIL'} />
            </div>
            {result.promptBuilder.instructionValidation.errors.length > 0 && (
              <div className="mb-2 text-xs text-red-600">{result.promptBuilder.instructionValidation.errors.join(' | ')}</div>
            )}
            <JsonBlock value={result.promptBuilder.instruction} />
            <div className="mt-3 mb-1 text-sm font-semibold text-gray-800">Uncompressed prompt</div>
            <pre className="whitespace-pre-wrap rounded-lg bg-gray-100 p-3 text-xs text-gray-800">
              {result.serializer.uncompressed ?? '(null)'}
            </pre>
            {result.serializer.issues.length > 0 && (
              <div className="mt-1 text-xs font-semibold text-red-600">FAIL — ditemukan: {result.serializer.issues.join(', ')}</div>
            )}
          </Section>

          <Section title="Section 5 — Compression (before / after)">
            {result.compression ? (
              <>
                <div className="mb-2 grid grid-cols-2 gap-3 text-xs">
                  <div>Chars before: {result.compression.beforeChars}</div>
                  <div>Chars after: {result.compression.afterChars}</div>
                  <div>Tokens (est.): {result.compression.totalTokens}</div>
                  <div>Sections included: {result.compression.sectionsIncluded.join(', ') || '—'}</div>
                  <div className="col-span-2 text-red-600">
                    Sections omitted: {result.compression.sectionsOmitted.join(', ') || '—'}
                  </div>
                </div>
                <pre className="whitespace-pre-wrap rounded-lg bg-gray-100 p-3 text-xs text-gray-800">{result.compression.after}</pre>
                {result.compression.issues.length > 0 && (
                  <div className="mt-1 text-xs font-semibold text-red-600">FAIL — ditemukan: {result.compression.issues.join(', ')}</div>
                )}
              </>
            ) : (
              <div className="text-xs text-gray-500">Compression belum berjalan (instruction kosong).</div>
            )}
          </Section>

          <Section title="Section 6 — Final AI Request">
            <JsonBlock value={result.finalRequest} />
          </Section>

          <Section title="AI Asset Composer (renamed from Reference Composer — AI Asset Lifecycle)" defaultOpen>
            <div className="space-y-2 text-xs">
              <div>
                Model Reference:{' '}
                <StatusBadge status={result.aiAssetComposer.modelReference ? 'PASS' : 'FAIL'} />{' '}
                {result.aiAssetComposer.modelReference
                  ? `type=${result.aiAssetComposer.modelReference.type} role=${result.aiAssetComposer.modelReference.role} priority=${result.aiAssetComposer.modelReference.priority} item=${result.aiAssetComposer.modelReference.itemId}`
                  : 'tidak tersedia — render tidak boleh dikirim.'}
              </div>
              <div>
                Collar Reference:{' '}
                <StatusBadge status={result.aiAssetComposer.collarReference ? 'PASS' : 'INFO'} />{' '}
                {result.aiAssetComposer.collarReference
                  ? `type=${result.aiAssetComposer.collarReference.type} role=${result.aiAssetComposer.collarReference.role} priority=${result.aiAssetComposer.collarReference.priority} item=${result.aiAssetComposer.collarReference.itemId}`
                  : 'tidak tersedia — optional, render tetap berjalan menggunakan DNA.'}
              </div>
              <div>
                Excluded categories (text-only, tidak pernah jadi image reference):{' '}
                {result.aiAssetComposer.excluded.map((e) => e.category).join(', ') || '—'}
              </div>
              <div>
                Background reference count: {result.aiAssetComposer.backgroundReferenceCount} | Mannequin reference count:{' '}
                {result.aiAssetComposer.mannequinReferenceCount}
              </div>
              {result.aiAssetComposer.modelReference && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-800">
                  SILHOUETTE-only instruction ditambahkan ke final prompt (lihat Section 6) karena Model Reference disertakan —
                  GPT Image diinstruksikan untuk TIDAK meniru collar/cuff/pocket/placket/embroidery/button/fabric/color dari foto
                  referensi ini.
                </div>
              )}
              {result.aiAssetComposer.collarReference && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-800">
                  COLLAR_SHAPE-only instruction ditambahkan ke final prompt (lihat Section 6) karena Collar Reference disertakan —
                  GPT Image diinstruksikan untuk hanya mengambil outline/curvature/opening/height kerah, TIDAK meniru fabric/color/
                  stitching/lighting/background dari foto referensi ini.
                </div>
              )}
            </div>
          </Section>

          <Section title="AI Assets (AI Asset Lifecycle — derived from Approved AI Design DNA, never manually created)" defaultOpen>
            <div className="space-y-3">
              {result.aiAssets.map((asset) => (
                <div key={asset.referenceType} className="rounded-lg border border-gray-200 p-3 text-xs">
                  <div className="mb-1 flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-gray-900">{asset.referenceType}</span>
                    <StatusBadge status={asset.included ? 'PASS' : 'INFO'} />
                    <span className="text-gray-600">Nama: {asset.name ?? '—'}</span>
                    <span className="text-gray-600">Role: {asset.referenceRole}</span>
                    <span className="text-gray-600">Priority: {asset.priority}</span>
                    <span className="text-gray-600">Status: {asset.status}</span>
                    <span className="text-gray-400">(AI Design DNA: {asset.aiDnaStatus ?? '—'}, catalog {asset.catalogActive === null ? '—' : asset.catalogActive ? 'active' : 'inactive'})</span>
                  </div>
                  <div className="text-gray-500">{asset.validation.reason}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <div className="mb-1 font-semibold text-gray-700">Transferred Geometry</div>
                      {asset.transferredGeometry.map((g) => (
                        <div key={g} className="text-green-700">✓ {g}</div>
                      ))}
                    </div>
                    <div>
                      <div className="mb-1 font-semibold text-gray-700">Ignored</div>
                      {asset.ignored.map((g) => (
                        <div key={g} className="text-gray-500">✓ {g}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Section 7 — Reference Images">
            <div className="space-y-2 text-xs">
              <div>
                Customer Photo: <StatusBadge status={result.referenceImages.customerPhoto.included ? 'PASS' : 'FAIL'} />{' '}
                {result.referenceImages.customerPhoto.url}
              </div>
              {result.referenceImages.customerPhoto.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result.referenceImages.customerPhoto.url} alt="Customer" className="h-32 rounded-lg border object-cover" />
              )}
              {result.referenceImages.customerPhoto.framing && (
                <div>
                  Photo framing (Part 1):{' '}
                  {result.referenceImages.customerPhoto.framing.ok ? (
                    <>
                      <StatusBadge status={result.referenceImages.customerPhoto.framing.framing === 'full_body' ? 'PASS' : 'FAIL'} />{' '}
                      {result.referenceImages.customerPhoto.framing.framing} — {result.referenceImages.customerPhoto.framing.reasoning}
                    </>
                  ) : (
                    <span className="text-red-600">Judge error: {result.referenceImages.customerPhoto.framing.error}</span>
                  )}
                </div>
              )}
              <div>
                Model Thobe Reference:{' '}
                <StatusBadge status={result.referenceImages.modelThobeReference.included ? 'PASS' : 'INFO'} />{' '}
                {result.referenceImages.modelThobeReference.name ?? '—'}
              </div>
              {result.referenceImages.modelThobeReference.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.referenceImages.modelThobeReference.url}
                  alt="Model Thobe reference"
                  className="h-32 rounded-lg border object-cover"
                />
              )}
              {result.referenceImages.modelThobeReference.note && (
                <div className="text-amber-700">{result.referenceImages.modelThobeReference.note}</div>
              )}
              <div className="text-gray-500">
                Excluded by design (text-only, tidak pernah jadi image input): {result.referenceImages.excludedByDesign.join(', ') || '—'}
              </div>
            </div>
          </Section>

          <Section title="Section 8 — AI Response">
            {!result.aiResponse.executed ? (
              <div className="text-xs text-gray-500">Dry run — OpenAI tidak dipanggil.</div>
            ) : (
              <>
                {result.aiResponse.ok && result.aiResponse.renderedImageUrl && (
                  <div className="mb-3 grid grid-cols-2 gap-3">
                    <div>
                      <div className="mb-1 text-xs font-semibold text-gray-500">Render sebelum (Customer Photo)</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={result.referenceImages.customerPhoto.url} alt="Sebelum" className="w-full rounded-lg border object-cover" />
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-semibold text-gray-500">Render sesudah (AI Output)</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={result.aiResponse.renderedImageUrl} alt="Sesudah" className="w-full rounded-lg border object-cover" />
                    </div>
                  </div>
                )}
                <JsonBlock value={{ ...result.aiResponse, renderedImageUrl: result.aiResponse.renderedImageUrl ? '(preview di atas — data URL disingkat)' : null }} />
              </>
            )}
          </Section>

          <Section title="Section 6b — Render Validator (Part 6, heuristik AI vision-judge)" defaultOpen>
            {!result.renderValidator ? (
              <div className="text-xs text-gray-500">
                Belum dijalankan — perlu &quot;Jalankan Vision Judge&quot; dicentang DAN render sungguhan (dry run OFF) berhasil.
              </div>
            ) : !result.renderValidator.ok ? (
              <div className="text-xs text-red-600">Judge error: {result.renderValidator.error}</div>
            ) : (
              <>
                <div className="mb-2 text-sm font-semibold text-gray-800">
                  Overall: <StatusBadge status={result.renderValidator.overallStatus} />
                </div>
                <div className="space-y-2">
                  {(
                    [
                      ['Face Similarity', result.renderValidator.faceSimilarity],
                      ['Body Similarity', result.renderValidator.bodySimilarity],
                      ['Pose Similarity', result.renderValidator.poseSimilarity],
                      ['Garment Similarity', result.renderValidator.garmentSimilarity],
                      ['DNA Compliance', result.renderValidator.dnaCompliance],
                    ] as [string, RenderQualityMetric][]
                  ).map(([label, metric]) => (
                    <div key={label} className="flex items-start gap-3 rounded-lg border border-gray-100 p-2">
                      <StatusBadge status={metric.status} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {label}: {metric.score}% (threshold ≥{metric.threshold}%)
                        </div>
                        <div className="text-xs text-gray-500">{metric.reasoning}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs italic text-gray-400">
                  Skor ini opini AI vision-judge (GPT-4o-mini membandingkan 2 gambar), BUKAN metrik biometrik tersertifikasi
                  (tidak ada model face-recognition/pose-estimation di codebase ini).
                </div>
              </>
            )}
          </Section>
        </>
      )}
    </div>
  )
}
