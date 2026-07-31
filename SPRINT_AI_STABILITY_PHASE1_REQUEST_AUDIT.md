# LTOS AI Render Stability — Phase 1: AI Request Audit

Status: investigation only. **No code changed, no render generated, no API called.**

Audited against commit `9265acf` (`fix(render): best-fit pack Priority 1 layers...`), confirmed via the Vercel API to be the currently live production deployment (`dpl_3Er4jnKK616GxwQqLf8ApPBANrvZ`, state `READY`, target `production`). Working tree is clean for every file cited below (`git status` shows none of them modified/untracked) — this audit reflects what customers are actually hitting right now, not a local draft.

Also cross-checked against live `design_master_options` content in Supabase (project `ltos-v1`) via direct SQL — several findings below depend on *current data state*, not just code, and are called out as such.

---

## PIPELINE TRACE

```
AIPreviewPanel.tsx:120 (Buat Pratinjau Akhir)
  → validateRenderContextReadiness()  [customerProfile/renderContext.ts:47]
  → buildRenderContext()              [renderContext.ts:16]
DesignStudioWorkspace.tsx:171 handleRenderGenerate()
  → renderDesign()                    [services/renderService.ts:86]
       → mapContextToPayload()        [renderService.ts:33] — designSpecification → componentSelections[]
       → POST /api/design/render      [renderService.ts:90]
src/app/api/design/render/route.ts POST()
  1. Fetch design_master_options rows for selected ids           [route.ts:102]
  2. DNA State hash + Render Cache lookup (in-memory, process-local) [route.ts:168-194]
  3. resolveDNA() per component → DNA Resolver                   [route.ts:216]
  4. AI Capability Engine (BLOCKED/PREMIUM/HIGH/STANDARD/LIMITED) [route.ts:275-299]
  5. composeAiAssets() → which images (if any) accompany the text [route.ts:258]
  6. composeRenderRecipe() → Recipe Composer merge                [route.ts:313]
  7. buildRenderInstruction() → Prompt Builder                    [route.ts:327]
  8. buildPromptLayers() + compressPromptByLayers() → 7-layer, ~1200-token budget [route.ts:355-356]
  9. applyAssetInstructions() → append SILHOUETTE/COLLAR_SHAPE caveats [route.ts:401]
  10. generateImage()                 [ai/services/image.ts:114]
        → images.edit() if referenceImageUrls.length > 0 (ALWAYS true — see A.1)
        → images.generate() only when zero reference images (never happens today)
```

---

## A. INPUT

### 1. Is the customer photo sent to the AI? **YES**
`composeAiAssets()` (aiAssetComposer/composer.ts:146) builds `urls = [customerPhotoUrl, ...assets]` — the customer photo is **always** `urls[0]`. `route.ts:341` passes this as `referenceImageUrls` into `generateImage()`, which (`image.ts:131-153`) fetches each URL and hands the resulting `File[]` to `client.images.edit({ image: [...] })`. Because this array is never empty (customer photo is always in it), **`images.edit` is used on every single render — never `images.generate`.** This directly answers A.7 below too.

### 2. Is the garment reference image sent? **PARTIALLY, AND CURRENTLY NEVER IN PRODUCTION DATA**

Where: `composeAiAssets()` (aiAssetComposer/composer.ts:122-157) is the **only** place any garment reference image can be added. It only recognizes two categories:

```ts
export type ReferenceType = 'MODEL_THOBE' | 'COLLAR_REFERENCE' | 'FABRIC_REFERENCE' | 'EMBROIDERY_REFERENCE' | 'PATTERN_REFERENCE'
// only MODEL_THOBE and COLLAR_REFERENCE are implemented — types.ts:13-21
```

Gate (`composer.ts:112-119`, `isAiAssetActive`): an item's photo is only sent if **all four** are true: `is_active`, `ai_dna.status === 'approved'`, `ai_dna.metadata.sourceImage` present, `render_recipe.status !== 'empty'`.

**Live DB state right now** (queried directly, not assumed):

| Category | Item | dna_status | has_source_image | Sent as image? |
|---|---|---|---|---|
| model_thobe | Saudi Modern (only one) | `needs_regeneration` | **false** | **NO** |
| kerah | Basim Collar | `needs_regeneration` | true | **NO** (status ≠ approved) |
| kerah | all 6 others | `pending` | false | NO — would BLOCK the render if selected (see A.8) |
| plaket | Plaket Hexagonal | `approved` | true | **NO — Placket has no `ReferenceType` at all** |
| plaket | Plaket Straight Formal | `approved` | true | **NO — same** |
| saku | Patch Pocket Topstitched Medium | `approved` | **false** | NO — no photo exists even if wired |
| manset | Sudas Cuff | `needs_regeneration` | true | NO — no `MANSET_REFERENCE` type exists |

**Conclusion: as of right now, zero garment reference images are ever sent — every render in production is exactly 1 image (the customer photo) plus a text-only DNA description of every selected component.** This is not a one-off bug; it's the deterministic result of (a) an architecture that only implements 2 of 7 possible reference types, and (b) the one Model Thobe and the one Collar with a usable photo both being stuck at `needs_regeneration` instead of `approved`.

### 3. Is the previous render image sent during the second render? **NO**
The request body Design Studio sends (`RenderPayload`, `types/render.ts:26-32`) is exactly `{ customerPhotoUrl, componentSelections }`. There is no `previousRenderUrl`, `renderId`, or `editMode` field anywhere in this type, in `route.ts`'s `RenderRequestBody` (route.ts:74-77), or in `mapContextToPayload()` (renderService.ts:33-72). Every render — first, second, tenth — calls `images.edit` against the **original Measurement photo only**. The prior AI output is never fed back in.

### 4. Is DNA sent as plain text, JSON, structured schema, image reference, or other?

**Plain text**, flattened from structured internal objects, sent as the OpenAI `prompt` string (not as JSON, not as a separate structured field — the OpenAI Images API has no such field). The internal `RenderInstruction`/`MasterRenderRecipe` objects (structured JSON) exist only up to `compressPromptByLayers()`; `serializer.ts:65-74`'s `formatRecord()` converts them like this:

```
Garment — collar: rounded, length: standard, sleeve: long
```
i.e. `key: value, key: value` joined into one sentence per section, sections joined with `. `. The actual compressed string sent to OpenAI (`route.ts:401`, `finalPrompt`) is one long plain-English paragraph, e.g.:
```
Identity Lock: Keep exactly the same person... Model Thobe: geometry length long, ... Collar: geometry ... . Avoid: ... . [SILHOUETTE caveat if Model Reference present] [COLLAR_SHAPE caveat if Collar Reference present]
```

### 5. Which parameters are actually sent to the AI (`client.images.edit`, `image.ts:139-153`)?
- `model`: `"gpt-image-1"` (hardcoded default, `image.ts:15`)
- `prompt`: the compressed+asset-instruction-appended string above
- `image`: `File[]` — currently always length 1 (customer photo only, see A.2)
- `input_fidelity`: `"high"` (hardcoded, `image.ts:150`)
- timeout: 120s client-side (`image.ts:23`), `maxDuration = 120` on the route (`route.ts:67`)
- **No** `seed`, `size`, `quality`, `n`, `background`, or `mask` parameter anywhere in this pipeline (confirmed via grep — zero hits for `seed` under `src/lib/ai`).

### 6. How many images attached per request? **Currently always 1** (customer photo). Architecturally the ceiling is 3 (customer photo + Model Reference + Collar Reference) but that ceiling is never reached with the live DB content in A.2.

### 7. Does changing only COLOR regenerate the entire prompt, or is it an edit request?
**Both, and that's the problem.** It IS an "edit request" to OpenAI in the narrow technical sense — `images.edit` is used because `referenceImageUrls` is non-empty (A.1) — but "edit" here means "edit the ORIGINAL customer photo," not "edit the previous render." And the **prompt itself is 100% rebuilt from scratch** every time: `mapContextToPayload()` (renderService.ts:41-61) reads the **entire current `designSpecification`** object on every call — there is exactly one "Buat Pratinjau Akhir" button (`AIPreviewPanel.tsx:118-126`), no differential/patch call, no memory of what the last request contained. Changing only the Color field still re-sends Model Thobe + Look Cutting + Material + Collar + Cuff + Placket + Pocket + Bordir + Zig-Zag + Accessory (whichever are selected) as a fresh, complete text description, and OpenAI regenerates the entire garment from that description plus the same original photo — with no anchor tying the new output to the old one.

### 8. Does the system lock Model / Collar / Pocket / Placket / Sleeve / Length? **NO — for all six, and each fails differently:**

| Attribute | "Lock" mechanism | Status |
|---|---|---|
| Model | Image reference (SILHOUETTE role) possible | **Inactive** — Saudi Modern is `needs_regeneration`, no source image at all (A.2) |
| Collar | Image reference (COLLAR_SHAPE role) possible | **Inactive** — Basim has a photo but is `needs_regeneration`, not `approved` |
| Placket | — | **No mechanism exists in code** (`ReferenceType` has no PLAKET_REFERENCE, `composeAiAssets` doesn't accept a placket param at all) — text-only regardless of DB content |
| Pocket | — | **No mechanism exists in code**, and also no photo uploaded even if it did |
| Sleeve | Sub-key inside Model Thobe's `geometry`/`construction` (Priority 0 text, never truncated — `compression.ts:35`, `dnaValidator.ts:51`) | Text-only; Priority-0 only guarantees the text isn't *dropped from the prompt*, not that GPT Image reproduces it identically call-to-call |
| Length | Same as Sleeve | Same as Sleeve |

"Priority 0 / never truncated" (compression.ts:177-183) is the closest thing to a "lock" this system has, and it is a **prompt-completeness guarantee**, not a **rendering-determinism guarantee**. Nothing anywhere (no seed, no reference image, no prior-render anchor) constrains what GPT Image actually outputs for Sleeve/Length/Placket/Pocket run to run.

---

## B. OUTPUT

### 1. Is the rendered image persisted? **NO.**
`renderResult` is local `useState` inside `DesignStudioWorkspace.tsx:97`. The one function that writes to the database, `persist()` (`DesignStudioWorkspace.tsx:134-169`), only ever saves `selections` / Design Specification / fabric quantity to `consultations.notes` and a `business_events` row — it never touches `renderResult`. `route.ts`'s POST handler (full 443 lines read) has zero `supabase.storage` calls. No migration anywhere defines a render-image storage bucket (checked). The image URL returned to the browser (`renderedImageUrl`) is, for `gpt-image-1`, virtually always a `data:image/...;base64,...` string built client-visible only in `image.ts:174-179` (gpt-image-1 never returns `.url`, only `b64_json`) — it lives **only in that browser tab's memory**.

### 2. Why can the render disappear? **Exact reason, not a guess:**
Because it was never written anywhere durable. It exists only as React component state (`renderResult`, `DesignStudioWorkspace.tsx:97`) tied to that one mounted instance of `DesignStudioWorkspace`. Any full page reload, navigation away and back, session/token refresh, or component remount (including React Fast Refresh) destroys that state with nothing to rebuild it from — there is no `GET` path that could ever re-fetch a past render, because nothing was stored.

### 3. Is there Render History? **NO.** Confirmed via repo-wide search — no `render_history` table, type, or reference anywhere (migrations or `src/`).

### 4. Is there Render Session? **NO.** Same search, same result — no `render_session` concept exists. The closest thing, `renderCache/cache.ts`, is an in-memory `Map` scoped to **one server process** (resets on every redeploy/cold start, comment says so explicitly at `cache.ts:1-5`), keyed by a DNA-state hash for de-duplication only — it is not a history/session store and was never designed to be one.

---

## C. ROOT CAUSE

### Issue 1 — Collar / Placket / Pocket don't match selected DNA (first render)
**Evidence:** A.2 table above + `aiAssetComposer/types.ts:13-22` (only 2 of 7 reference types implemented) + `composer.ts:122-131` (function signature has no placket/saku parameter at all) + live DB (Placket has 2 *approved* Hero Images sitting unused; Pocket's approved DNA has no photo at all; Collar's one usable photo is stuck at `needs_regeneration`).
**Root Cause:** Placket and Pocket have **zero image-reference implementation** in this codebase — a structural gap, not a runtime bug — so they are always described in text only. Collar's only real candidate photo (Basim) is excluded purely by an approval-status gate (`needs_regeneration` ≠ `approved`), a **data state**, not a code defect. All three, lacking any geometric anchor, are reproduced by GPT Image from a compressed text description alone, which this model does not guarantee to render precisely.
**Recommended Fix (not implemented):** Re-review and approve Basim Collar's DNA if its content is final (immediate, zero-code, activates an existing photo). Separately, extend AI Asset Composer with `PLAKET_REFERENCE`/`POCKET_REFERENCE` — the module's own header comment already names this as the intended, additive extension path.

### Issue 2 — Rendered image disappeared from UI
**Evidence:** B.1/B.2 above.
**Root Cause:** No persistence layer exists for render output anywhere in the system — image bytes live only in one browser tab's React state.
**Recommended Fix (not implemented):** Persist every successful render (Storage upload + a row keyed to consultation/order, prompt used, DNA hash, timestamp) — i.e., build the Render History/Session concept that currently does not exist (B.3/B.4).

### Issue 3 — Second render (color-only change) drifted on Sleeve/Collar/Placket/Pocket
**Evidence:** A.3, A.7 (full prompt rebuilt from the entire current `designSpecification` every call, single Generate button, no diff logic) + A.5 (no `seed` parameter anywhere) + confirmed: `images.edit` always targets the **original customer photo**, never the prior render's own output.
**Root Cause:** "Change color" is not an edit operation in this system's request semantics — it is a brand-new, full-pipeline generation from the original photo, re-describing every selected component in text again, with **no continuity mechanism** (no seed, no prior-render reference image, no diff-aware prompting) connecting it to the previous output. Because nothing anchors sameness beyond the prose happening to repeat itself, and because GPT Image is inherently stochastic per call, any two renders — same selections or not — can legitimately diverge.
**Recommended Fix (not implemented):** When re-rendering with only a subset of fields changed (e.g., Color), feed the *previous render's own output image* back in as an additional/primary reference so GPT Image edits from it instead of regenerating from the original photo + text alone. Combine with Issue 1's fix (more real image anchors) to reduce how much is riding on text description alone.

---

## D. IMPLEMENTATION PLAN (priorities only — not implemented)

**Priority 1 — directly explains all 3 reported issues, highest impact:**
1. Persist every successful render (Storage + a `render_history`/`render_session` record). Fixes Issue 2 outright; is also the prerequisite for #2.
2. Feed the previous render's own output back into `images.edit` as a reference when re-rendering with partially-changed selections (e.g., color-only). Directly targets Issue 3.
3. Re-review and approve Basim Collar's AI Design DNA (data fix, no code) so its existing photo actually activates as a Collar Reference under the current gate.

**Priority 2 — structural gaps, real assets already sitting unused in the DB:**
4. Implement `PLAKET_REFERENCE` and `POCKET_REFERENCE` in AI Asset Composer, mirroring `COLLAR_REFERENCE` (already the documented extension point). Two Placket Hero Images are already approved and idle.
5. Upload a Hero Image for Patch Pocket Topstitched Medium so #4 has something to use for Pocket.
6. Author remaining `pending`/`empty` Collar/Cuff rows — right now customers are effectively limited to Basim/Sudas or a hard BLOCKED render for anything else.

**Priority 3 — quality/observability, lower urgency:**
7. Investigate whether `gpt-image-1` exposes any determinism control (seed or equivalent) worth wiring in to reduce drift on genuinely-fresh renders.
8. Make the Render Cache durable/scoped (currently a single in-memory Map, resets every redeploy, shared process-wide) — nice-to-have, not a reliability guarantee today.
9. Surface `promptLayerReport` (already computed and returned by the API, `route.ts:416`) in the Design Studio UI so a partially-compressed/truncated render is visibly flagged to the Fitter instead of looking identical to a full one.

---

Waiting for review before any implementation work begins.
