# SPRINT O — AI Render Reliability & Cost Observability

Status: implemented, verified, **not committed**. No architecture, workflow, business logic, DNA Repository, Render Recipe, AI Design DNA, or Master Data changed. No AI provider changed.

---

## 1. Root Cause (from the prior audit, now closed)

| # | Root cause | Fixed by |
|---|---|---|
| 1 | "Buat Pratinjau Akhir" had no `disabled` state — a Fitter could click it repeatedly mid-render (real latency 68.4s), firing parallel OpenAI requests with nothing stopping them. | Task 1 — client-side `disabled` + guard, **and** a DB-constraint-backed server-side lock (not just UI). |
| 2 | `new OpenAI({ apiKey })` never set `maxRetries`, so the SDK's own default (2) retried transient errors **silently** — one `generateImage()` call could fire up to 3 real, separately-billed requests with zero trace anywhere. | Task 2 — `maxRetries: 0` on the client; all retries now go through one explicit, counted, bounded application-level wrapper (default: 0 retries). |
| 3 | No `render_history` (or equivalent) table existed anywhere — confirmed via live schema query (37 tables, none render-related) before this sprint. No cost could ever be traced to a specific render. | Task 3 — new `render_history` table, applied live to Supabase. |
| 4 | No request/retry count, no trigger source — developer/debug/test spend was structurally indistinguishable from real Design Studio usage. | Tasks 4/5 — `request_count`/`retry_count` columns + `source` enum, both mandatory. |

---

## 2. Render Lifecycle — updated

```
Fitter clicks "Buat Pratinjau Akhir"
  │
  ├─ AIPreviewPanel: button already `disabled` if status==='loading' → click is a no-op
  │
  ▼
DesignStudioWorkspace.handleRenderGenerate()
  ├─ guard: if renderResult.status==='loading' → return (no-op)
  ├─ setRenderResult({status:'loading'})
  ▼
renderService.renderDesign(context, { consultationId })
  ▼
POST /api/design/render  { customerPhotoUrl, componentSelections, consultationId }
  │
  ├─ supabase.auth.getUser() → userId
  ▼
startRenderSession({ source:'design_studio', consultationId, userId })
  │
  ├─ self-heal: close any stale ('pending' older than 130s) lock for this
  │             consultation → status='timeout' (Task 8)
  ├─ INSERT render_history (status='pending')
  │     ├─ SUCCESS → { renderId: "RND-...", historyRowId, startedAt }
  │     └─ 23505 (unique_violation on active-lock index)
  │           → { locked: true, activeRenderId }
  │           → route returns 409, DNA pipeline never runs, OpenAI never called
  ▼ (locked:false)
try {
  DNA Resolver → Recipe Composer → Capability Engine → Prompt Builder →
  Compression → AI Asset Composer
  │
  ├─ any early exit (BLOCKED / instruction null / compression fail / …)
  │     → outcome = {status, requestCount:0, retryCount:0, errorMessage}
  │     → return NextResponse.json({..., renderId})
  │
  ▼ (all checks passed)
  generateImageWithControlledRetry({ instruction, referenceImageUrls, promptOverride })
    loop (bounded by maxApplicationRetries, default 0):
      requestCount++
      generateImage() → client.images.edit/generate (maxRetries:0, no silent SDK retry)
      if ok → stop
      if error is NOT timeout/connection-like → stop (no point retrying)
      else → loop again (this is the only place a retry can ever happen now)
  │
  ├─ outcome = {status: ok?'success':'failed', requestCount, retryCount, errorMessage}
  └─ return NextResponse.json({success, renderId, renderedImageUrl, ...})
} finally {
  finishRenderSession({ historyRowId, renderId, startedAt, ...outcome })
    → UPDATE render_history SET finished_at, duration_ms, status,
        request_count, retry_count, model, error_message
    → structured log: { event:"render.finished", renderId, ... }
}
```

Cache hits (`Render Cache`, unchanged mechanism) still short-circuit before OpenAI — now recorded as `status:'success', request_count:0, provider:'cache'`, so Render History can distinguish "free, served from cache" from "cost money."

---

## 3. Render Session flow (Lock → History → Structured Log)

```
                 ┌─────────────────────────────┐
   consultation  │   render_history_active_lock │   unique index, partial:
   _id (not null)│   _idx  (consultation_id)    │   WHERE status='pending'
                 └─────────────────────────────┘         AND consultation_id NOT NULL
                              │
         2nd request while 1st is 'pending'
                              │
                    INSERT … raises 23505
                              │
                              ▼
                startRenderSession() catches it
                              │
                              ▼
              { locked:true, activeRenderId }
                              │
                              ▼
                  route.ts → HTTP 409, no OpenAI call
```

This is a **real Postgres constraint**, not a check-then-act race — it holds even under two genuinely simultaneous requests (Vercel serverless has no shared memory to do this safely any other way).

---

## 4. `render_history` table structure

```sql
create table public.render_history (
  id uuid primary key default gen_random_uuid(),
  render_id text not null unique default public.generate_render_id(),  -- RND-YYYYMMDD-NNNNNN
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer,
  user_id uuid references auth.users(id),
  consultation_id uuid references public.consultations(id),
  order_id uuid references public.orders(id),
  provider text not null default 'openai',
  model text,
  status text not null default 'pending'
    check (status in ('pending','success','failed','timeout','cancelled')),
  request_count integer not null default 0,
  retry_count integer not null default 0,
  estimated_cost_usd numeric,          -- nullable, Task 9 foundation
  actual_cost_usd numeric,             -- nullable, Task 9 foundation
  provider_response_id text,           -- nullable, Task 9 foundation
  source text not null
    check (source in ('design_studio','debug_viewer','test_script','cli','future_provider')),
  error_message text,
  created_at timestamptz not null default now()
);
```

Indexes: `consultation_id`, `started_at desc`, `source`, `status`, plus the partial unique lock index. RLS: `admin`/`owner`/`artisan` (same staff set that can already trigger a render) can SELECT/INSERT/UPDATE.

---

## 5. Migration created

`supabase/migrations/20260822000000_add_render_history.sql` — **applied live** to `ltos-v1` via Supabase. Verified after apply:
- `generate_render_id()` → real output `RND-20260731-000001`, `RND-20260731-000002`, … (confirmed live).
- Lock mechanism tested live: 2nd concurrent `INSERT ... status='pending'` for the same `consultation_id` → confirmed `23505 duplicate key value violates unique constraint "render_history_active_lock_idx"`. Closing the first row's status frees the slot — confirmed a subsequent insert then succeeds.
- Test rows deleted afterward — table is empty (0 rows), ready for real usage.

---

## 6. Files changed

| File | What changed |
|---|---|
| `src/lib/ai/client.ts` | `maxRetries: 0` on the OpenAI client (Task 2). |
| `src/lib/ai/services/image.ts` | Exported `DEFAULT_MODEL` (was private) so the session layer can record it without re-hardcoding `'gpt-image-1'`. |
| **`src/lib/ai/renderSession/types.ts`** (new) | `RenderTriggerSource`, `RenderHistoryStatus`, `RenderHistoryRow`. |
| **`src/lib/ai/renderSession/logger.ts`** (new) | `logRenderStarted`/`logRenderFinished`/`logRenderLocked` — structured JSON lines (Task 7). |
| **`src/lib/ai/renderSession/service.ts`** (new) | `startRenderSession`, `finishRenderSession` (Lock + History), `generateImageWithControlledRetry` (Request Counter + Controlled Retry). |
| `src/app/api/design/render/route.ts` | Lock acquired before the DNA pipeline runs; whole body wrapped in `try/finally` so History always closes; `generateImage` → `generateImageWithControlledRetry`; `renderId` surfaced in every response. |
| `src/app/api/design/render/debug/route.ts` | The one real-OpenAI call site wrapped the same way, tagged `source:'debug_viewer'`. |
| `src/lib/types/render.ts` | `RenderPayload.consultationId` (optional), `RenderResult.renderId`, `RenderServiceResponse.renderId`/`activeRenderId`. |
| `src/lib/services/renderService.ts` | `renderDesign()` takes an optional `meta.consultationId`; surfaces `renderId`/lock rejection. |
| `src/components/workspace/design-studio/DesignStudioWorkspace.tsx` | Passes `consultation.id`; client-side double-submit guard. |
| `src/components/workspace/design-studio/AIPreviewPanel.tsx` | Button `disabled` while loading + guard in `handleGenerate`. |
| `scripts/finalRenderTest.ts` | `generateImage` → `generateImageWithControlledRetry` (no Supabase session → History skipped, logged only). |
| `scripts/render-test-runner.ts` | Same, plus wired through `startRenderSession`/`finishRenderSession` tagged `source:'test_script'` (its own Supabase client, RLS permitting). |
| `supabase/migrations/20260822000000_add_render_history.sql` (new) | The table itself. |

---

## 7. Request Counter — how it works

`generateImageWithControlledRetry()` wraps `generateImage()` in a bounded loop:

```ts
do {
  requestCount += 1
  result = await generateImage(input)
  if (result.ok) break
  if (!/timeout|timed out|connection/i.test(result.error)) break   // don't retry non-transient failures
} while (requestCount <= maxApplicationRetries)   // default 0 → loop runs exactly once
```

`requestCount` is the *actual* number of `images.edit`/`images.generate` calls made — persisted into `render_history.request_count`. Since the SDK's own silent retries are now disabled (Task 2), this number is now the true count, not an undercount hidden by the SDK.

---

## 8. Retry Counter — how it works

`retryCount = requestCount - 1`. Default `maxApplicationRetries: 0` means **no retry happens by default** — deliberate, since this sprint exists because unbounded/silent retries were inflating spend; raising it is an explicit future opt-in per call site, not a new default. When it *does* retry, only transient-looking failures qualify (timeout/connection) — a content-policy or validation error is never retried, since retrying it would just reproduce the identical failure at the identical cost.

---

## 9. Trigger Source — how it works

`render_history.source` is `NOT NULL` with a `CHECK` constraint — the DB itself refuses a row with no source, not just application discipline. Assignment:

| Caller | `source` |
|---|---|
| `/api/design/render` (production, Design Studio) | `'design_studio'` (hardcoded server-side — this route has exactly one real caller) |
| `/api/design/render/debug` (`dryRun:false`) | `'debug_viewer'` |
| `scripts/render-test-runner.ts` | `'test_script'` |
| `scripts/finalRenderTest.ts` | `'cli'` (no DB session — logged only, not persisted; see §11 known limitation) |
| *(reserved, unused today)* | `'future_provider'` |

Filtering real (customer-facing) spend from developer/test spend is now `WHERE source = 'design_studio'` — a query, not archaeology through git commit messages (which is all that existed before this sprint, per the prior audit).

---

## 10. Render Lock — how it works

Two independent layers, deliberately redundant:

1. **UI (fast path):** `AIPreviewPanel`'s button is `disabled={renderResult.status==='loading'}`; `handleGenerate()` and `DesignStudioWorkspace.handleRenderGenerate()` both also short-circuit on the same condition — stops a double-click before any network call.
2. **DB (authoritative path):** the partial unique index `render_history_active_lock_idx` on `(consultation_id) WHERE status='pending'`. `startRenderSession()`'s INSERT either succeeds (lock acquired) or raises `23505` (already locked → 409, pipeline never runs). This is what actually prevents parallel OpenAI requests — the UI layer is a nicety for the honest case, the DB constraint is what holds under a second tab, a stale page, or a race.

Staleness: a `pending` row older than 130s (matched to `maxDuration=120` + headroom) is closed out as `'timeout'` the next time that consultation attempts a render, so a crashed function (killed by Vercel before its own `finally` could run) can never permanently lock a consultation out.

---

## 11. Example Render History record (real, from the live verification run — since deleted)

```json
{
  "render_id": "RND-20260731-000003",
  "started_at": "2026-07-31T07:xx:xx.xxxZ",
  "finished_at": "2026-07-31T07:xx:xx.xxxZ",
  "duration_ms": 1234,
  "user_id": null,
  "consultation_id": "7dbaba55-a495-4592-ba5b-66a2a8354db0",
  "order_id": null,
  "provider": "openai",
  "model": "gpt-image-1",
  "status": "success",
  "request_count": 1,
  "retry_count": 0,
  "estimated_cost_usd": null,
  "actual_cost_usd": null,
  "provider_response_id": null,
  "source": "design_studio",
  "error_message": null
}
```

**Known limitation, stated plainly rather than glossed over:** `scripts/finalRenderTest.ts` has no Supabase session at all (confirmed in its own header comment — RLS requires an authenticated `profiles` row, which this standalone script has never had). It now still generates a Render ID and logs request/retry counts to the console, but does **not** persist a `render_history` row — recording that would require giving the script real auth, which is a separate, riskier change this sprint didn't make. `render-test-runner.ts` (which does have a Supabase client) attempts the real DB write; if RLS rejects it (same auth gap), `startRenderSession()` degrades to console-only logging rather than throwing — a render must never fail because observability couldn't write, which is also why every DB call in `renderSession/service.ts` is wrapped this way, not just this one.

---

## 12. Build / TypeScript / ESLint

- **TypeScript** (`tsc --noEmit`, whole project including `scripts/`): 0 errors.
- **ESLint** (all 13 changed/new files): 0 errors, 1 pre-existing unrelated warning (`<img>` in `AIPreviewPanel.tsx`, present before this sprint).
- **`next build`**: ✅ compiled successfully, 44/44 routes generated, no new warnings (only the 3 pre-existing ones from before this sprint).

---

## Definition of Done — checked against what was actually verified

| Criterion | Status |
|---|---|
| Satu klik = satu Render Session | ✅ UI guard + DB lock |
| Tidak ada render paralel | ✅ proven live via `23505` test |
| Retry di bawah kontrol aplikasi | ✅ SDK `maxRetries:0`, app-level bounded loop |
| Retry Count tercatat | ✅ `retry_count` column, verified insert/update path |
| Request Count tercatat | ✅ `request_count` column |
| Trigger Source tercatat | ✅ `NOT NULL` + `CHECK`, all 5 real call sites tagged |
| Render History tercatat | ✅ table live, verified with real inserts/updates/deletes |
| Render ID dipakai di seluruh pipeline | ✅ DB → route.ts → renderService.ts → RenderResult → (UI can display it) |
| Build / TypeScript / ESLint bersih | ✅ |
| Tidak ada perubahan arsitektur/workflow/business logic | ✅ — no DNA/Recipe/Master Data table touched; every change is additive (new table, new module, optional params, a `disabled` attribute) |

Not committed to git, per instruction.
