# LTOS AI Render Stability — Phase 2: DNA Reference Engine

Status: implemented, verified, **not committed**. No render generated, no API called (per phase rules).

Scope lock: this phase fixes ONLY the root cause confirmed in `SPRINT_AI_STABILITY_PHASE1_REQUEST_AUDIT.md`, Issue 1 / Priority 2 item 4 — "Implement `PLAKET_REFERENCE` and `POCKET_REFERENCE` in AI Asset Composer, mirroring `COLLAR_REFERENCE`." Nothing else was touched: no persistence, no render session, no prompt-architecture redesign, no rendering-model change.

---

## 1. Files changed

| File | Change |
|---|---|
| `src/lib/design/aiAssetComposer/types.ts` | Added `PLAKET_REFERENCE` / `POCKET_REFERENCE` to `ReferenceType`; added `PLAKET_SHAPE` / `POCKET_SHAPE` to `ReferenceRole`; added their `REFERENCE_PRIORITY` entries (80, 70). |
| `src/lib/design/aiAssetComposer/composer.ts` | Added `PLAKET_REFERENCE_SHAPE_INSTRUCTION` / `POCKET_REFERENCE_SHAPE_INSTRUCTION`; extended `ComposedAiAssets`/`ComposeAiAssetsInput` with `plaketReference`/`pocketReference` and `plaketOption`/`pocketOption`; extended `composeAiAssets()`, `applyAssetInstructions()`; added `validatePlaketReference()`/`validatePocketReference()`. |
| `src/app/api/design/render/route.ts` | Looks up the selected Plaket/Pocket rows the same way Collar already was; passes them into `composeAiAssets()`; runs the two new validators; logs and returns their status alongside Model/Collar. |

No DB migration, no new table, no new column, no new upload flow — the brief's "reuse the existing AI Asset system" requirement.

---

## 2. Architecture changes

None beyond extending the one existing extension point. `composeAiAssets()` remains the **sole** place that decides which images accompany a render (Single Source of Truth, as required). Placket and Pocket now flow through the exact same 4-condition gate (`is_active`, `ai_dna.status === 'approved'`, `ai_dna.metadata.sourceImage` present, `render_recipe.status !== 'empty'`) that Model Thobe and Collar already used — no second implementation was created.

```
Reference Image (photo_url -> ai_dna.metadata.sourceImage, frozen on generate)
  ↓
composeAiAssets()      [aiAssetComposer/composer.ts]  ← Model/Collar/Plaket/Pocket, same gate
  ↓
Payload Builder        [route.ts: referenceImageUrls = composedAssets.urls]
  ↓
AI Request              generateImage({ referenceImageUrls, promptOverride })
```

`FABRIC_REFERENCE` / `EMBROIDERY_REFERENCE` / `PATTERN_REFERENCE` remain reserved names only, per the audit — not touched, since nothing in Phase 1 called for them.

---

## 3. DNA categories supported (image reference)

| Category | Reference type | Role | Status this phase |
|---|---|---|---|
| Model (model_thobe) | `MODEL_THOBE` | `SILHOUETTE` | Already existed — unchanged |
| Collar (kerah) | `COLLAR_REFERENCE` | `COLLAR_SHAPE` | Already existed — unchanged |
| **Placket (plaket)** | **`PLAKET_REFERENCE`** | **`PLAKET_SHAPE`** | **NEW this phase** |
| **Pocket (saku)** | **`POCKET_REFERENCE`** | **`POCKET_SHAPE`** | **NEW this phase** |
| Sleeve | — | — | No standalone master-data category — it's a sub-key of Model Thobe's own `geometry`/`construction` DNA (text-only), not a selectable item with its own Hero Image. No reference mechanism is structurally possible here without a new category, which the audit did not call for. |
| Cuff (manset) | — | — | Not implemented this phase (audit's Priority 2 item 4 named only Plaket/Pocket). Sudas Cuff has a photo but is `needs_regeneration`, not `approved` — same data-state gap as Collar, and out of this phase's locked scope. |
| Fabric / Embroidery / Pattern | reserved names only | — | Untouched, per audit |

---

## 4/5. Validation evidence — every DNA category, before vs. after (live DB, `ltos-v1`, queried directly)

| Category | Item | Reference Found (has sourceImage) | Approved | Attached — BEFORE | Attached — AFTER |
|---|---|---|---|---|---|
| Model | Saudi Modern | **NO** (`sourceImage` null) | needs_regeneration | NO | NO — unchanged, blocked by missing sourceImage (unrelated data gap, not this phase's scope) |
| Collar | Basim Collar | YES | needs_regeneration | NO | NO — unchanged, blocked by approval status (data gap, not code) |
| Collar | 6 others | NO | pending | NO | NO — unchanged |
| **Placket** | **Plaket Hexagonal** | **YES** | **approved** | **NO — no `ReferenceType` existed** | **YES — now composed in as `PLAKET_REFERENCE`/`PLAKET_SHAPE`** |
| **Pocket** | **Patch Pocket Topstitched Medium** | **NO** (`sourceImage` null) | approved | **NO — no `ReferenceType` existed** | **Still NO — pipeline now supports it, but no Hero Image has been generated for this item yet (data gap, Priority 2 item 5 in Phase 1's plan, out of this phase's scope)** |
| Cuff | Sudas Cuff | YES | needs_regeneration | NO | NO — no `MANSET_REFERENCE` type; not in this phase's scope |
| Sleeve | (sub-key, no item) | N/A | N/A | NO | NO — structurally not a referenceable category |

Per-stage trace for **Plaket Hexagonal** (the one category with a real, live effect this phase):

1. Reference Image exists? **YES** (`ai_dna.metadata.sourceImage` populated)
2. Approved? **YES** (`ai_dna.status = 'approved'`)
3. `composeAiAssets()` finds it? **YES** — `plaketReference` populated, passes all 4 gate conditions
4. Payload Builder attaches it? **YES** — included in `composedAssets.urls` → `referenceImageUrls`
5. Reaches the AI request? **YES** — part of the `image` array sent to `client.images.edit()`, and `PLAKET_REFERENCE_SHAPE_INSTRUCTION` is appended to the prompt via `applyAssetInstructions()`

Per-stage trace for **Patch Pocket Topstitched Medium** (pipeline ready, data not):

1. Reference Image exists? **NO** — `ai_dna.metadata.sourceImage` is null (no Hero Image was ever generated for this item)
2. Approved? YES (irrelevant while step 1 fails)
3. `composeAiAssets()` finds it? **NO** — `isAiAssetActive()` gate fails at the sourceImage check
4. Payload Builder attaches it? NO
5. Reaches the AI request? NO

---

## 6. Example AI request — image count only

A render selecting Saudi Modern (model) + Basim Collar + Plaket Hexagonal + Patch Pocket, with today's live data:

- **Before this phase:** 1 image (customer photo only)
- **After this phase:** 2 images (customer photo + Plaket Hexagonal reference)

Model/Collar/Pocket still contribute 0 images each — correctly, per the data-state gaps documented above, none of which this phase was scoped to touch. The ceiling is now 5 images (customer photo + Model + Collar + Plaket + Pocket) once each item's own `ai_dna.status` reaches `approved` with a real Hero Image — architecturally supported today, not yet true of the live catalog beyond Plaket.

---

## 7. Backward compatibility

`plaketOption`/`pocketOption` are optional parameters on `ComposeAiAssetsInput`, defaulting to `null`. Every existing caller of `composeAiAssets()` that does not pass them (e.g. `src/app/api/design/render/debug/route.ts`, the read-only Debug Viewer twin) continues to compile and behave exactly as before — `plaketReference`/`pocketReference` simply resolve to `null` for those callers, same as `collarReference` would if `collarOption` were omitted. No existing field was renamed, removed, or changed in meaning.

---

## 8. Build

`npm run build` — ✅ compiled successfully, all 44 routes generated, zero new warnings from changed files (only 2 pre-existing, unrelated `<img>`/`exhaustive-deps` warnings elsewhere).

## 9. TypeScript

`npx tsc --noEmit` — ✅ zero errors.

## 10. ESLint

`npx eslint` on all 3 changed files — ✅ zero errors, zero warnings.

---

## Stop

Per phase rules: no render generated, no image API called, no persistence added, no prompt redesign beyond the two new geometry-only caveats mirroring Collar's own. Stopping here — not continuing to a next phase.
