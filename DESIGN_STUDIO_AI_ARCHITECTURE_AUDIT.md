# AUDIT — DESIGN STUDIO AI ARCHITECTURE (DNA / Blueprint / Repository / Render Recipe / Prompt Builder)

**Tanggal:** 2026-07-30
**Metode:** Pembacaan langsung source code (`src/`) dan migrasi SQL (`supabase/migrations/`), dilakukan via 4 pass eksplorasi paralel + cross-check terhadap 2 dokumen audit sebelumnya (`ARCHITECTURE_LOCK_V1.md`, `FITTER_DESIGN_STUDIO_AUDIT.md`). Tidak ada perubahan kode. Tidak ada asumsi — setiap klaim dari memori/sprint notes sebelumnya diverifikasi ulang terhadap source code saat ini, dan ditandai **"diklaim tapi tidak ditemukan"** bila tidak terbukti.
**Cakupan:** Seluruh lapisan AI Design Studio — Component DNA Repository, AI Design DNA (`ai_dna`), Render Recipe, Recipe Composer, DNA Resolver, Prompt Builder (V1 & Architecture V2), AI Asset Composer, Capability Engine, Render Quality/Vision Judge, endpoint render, dan seluruh tabel/skema Supabase terkait. **Di luar cakupan:** picker UI 11 kategori Design Studio dan alur Commercial/Order (sudah diaudit tuntas di `FITTER_DESIGN_STUDIO_AUDIT.md` — dirujuk, tidak diulang).

---

## RINGKASAN EKSEKUTIF

Ada **dua sistem "DNA" yang berbeda dan tidak saling terhubung** dalam repository ini:

1. **Component DNA Repository** (markdown, `src/lib/design/componentDna/`) — struktur 3-file/5-section yang rapi, tapi **hanya berisi 1 entri** (`kerah-kemeja-bulat`) dan **tidak pernah dibaca oleh kode apa pun**. Murni dokumentasi statis.
2. **AI Design DNA** (`design_master_options.ai_dna`, kolom JSONB + tipe `AiDesignDna`) — **inilah yang benar-benar live**: dipakai di UI Master Data, DNA Resolver, Capability Engine, dan endpoint render produksi.

Pipeline render produksi (`/api/design/render`) **benar-benar tersambung end-to-end** dan merupakan live caller pertama dari rantai DNA Resolver → Recipe Composer → Prompt Builder → Image Service (dikonfirmasi lewat pembacaan langsung `route.ts`, bukan komentar). Namun beberapa lapisan besar yang sudah dibangun penuh — **Prompt Architecture V2** (4-layer + 3 validator) dan **Render Quality Vision Judge** (GPT-4o-mini) — **nol pemanggil dari alur produksi**; keduanya hanya bisa dijangkau lewat endpoint debug (`/api/design/render/debug`) atau `npm run render:test`.

Temuan paling kritis secara arsitektur: **kolom `design_master_options.ai_dna` dan `.render_recipe` dipakai di kode sebagai kolom yang pasti ada dengan default DB tertentu, tapi tidak ada satu pun file migrasi di `supabase/migrations/` yang membuat kolom ini** — bahkan nama migrasi yang disebut di komentar kode (`add_ai_design_dna_to_master_options`, `add_render_recipe_to_master_options`) tidak eksis di manapun di repository. Ini adalah gap provenance skema, bukan asumsi — lihat §8.

Golden Test Dataset (`render-testing/`) masih 100% kosong (`photoUrl`/`componentId` semuanya `null`), dinyatakan eksplisit "BLOCKED" di README-nya sendiri.

---

## 1. SELURUH STRUKTUR DNA YANG DITEMUKAN

### 1.1 `AiDesignDna` — struktur DNA yang LIVE (dipakai UI + render pipeline)

**File:** `src/lib/design/aiDna/types.ts:13-24`

```
AiDesignDna {
  status: 'pending' | 'draft' | 'approved' | 'needs_regeneration'
  version: number
  geometry: unknown | null
  construction: unknown | null
  appearance: unknown | null
  materials: unknown | null
  stitching: unknown | null
  placement: unknown | null
  negativeRules: string[]
  metadata: { generatedAt, approvedAt, sourceImage, approvedBy }
}
```

- Lifecycle field: `status` (`AiDnaStatus`), urutan tampilan `AI_DNA_LIFECYCLE_ORDER` (types.ts:48-58).
- Transisi status: `markDnaNeedsRegeneration` (65-68, hanya dari draft/approved), `markDnaGenerated` (80-87, →draft, membekukan `metadata.sourceImage`), `markDnaApproved` (99-107, **satu-satunya** fungsi yang boleh set `approved`, hanya dari draft).
- Default `DEFAULT_AI_DESIGN_DNA` (30-46) — diklaim di komentar (line 26-29) sebagai cermin default kolom DB, tapi migrasi sumbernya tidak ditemukan (lihat §8).
- Dipakai sebagai field wajib `MasterDataOption.ai_dna` — `src/lib/design/masterData.ts:84`; write path `masterData.ts:254`.
- Dikonsumsi oleh: `src/lib/design/dnaResolver/resolver.ts` (input), `src/lib/design/promptArchitectureV2/dnaValidator.ts:104` (`validateComponentDna`), `src/lib/design/aiAssetComposer/composer.ts:108-110` (gate `status==='approved'`), `src/lib/ai/services/image.ts:193,208` (baca `metadata.sourceImage`), endpoint `/api/design/render/route.ts:147,152,181,189` dan `/debug/route.ts`, UI `AiDesignDnaSection.tsx` + `MasterDataManager.tsx`.

### 1.2 `RenderRecipe` — struktur per-item untuk render (status masih "empty" secara default)

**File:** `src/lib/design/renderRecipe/types.ts:15-38`

```
RenderRecipe {
  status: 'empty' | 'configured'
  version: number
  camera, pose, lighting, composition, focus,
  fabricBehavior, visibilityRules: Record<string, unknown>
  garment, fabricIdentity, stitching, embroidery: Record<string, unknown>
  renderPriority: string[]
  negativeRules: string[]
}
```

- `DEFAULT_RENDER_RECIPE` (44-60), komentar sama-sama merujuk migrasi yang tidak ditemukan (§8).
- Komentar eksplisit (line 25-31): field `garment/fabricIdentity/stitching/embroidery` adalah "Producers for what **Component DNA (still unbuilt)** will eventually describe" — kontradiktif dengan fakta bahwa `componentDna/kerah-kemeja-bulat` **sudah ada di disk** (§1.4) tapi memang benar tidak pernah dibaca kode manapun, jadi dari sudut pandang runtime, klaim "unbuilt" itu akurat secara fungsional.
- `src/lib/design/renderRecipe/builder.ts` — **3 fungsi, ketiganya stub no-op**: `buildRenderRecipe` (line 16, selalu `null`, "No implementation this sprint"), `mergeRenderRecipes` (line 31, selalu `null`), `validateRenderRecipe` (line 43, selalu `{valid:true, errors:[]}`).
- UI: `src/components/master-data/RenderRecipeSection.tsx:10-11` — komentar eksplisit: **"Placeholder only ... Belum perlu Editor. Belum perlu Form. Cukup placeholder."** Hanya menampilkan Status/Version, tidak ada editor camera/pose/lighting/dll.

### 1.3 `AiDesignDna` vs `RenderRecipe` — bukan struktur yang sama

Kedua tipe ini independen (kolom terpisah di `design_master_options`), disatukan hanya oleh **DNA Resolver** (§6) menjadi satu `RenderRecipe` hasil resolusi per item, yang kemudian jadi input **Recipe Composer** (§3).

### 1.4 Component DNA Repository (markdown) — struktur "locked", isi minimal

**Path:** `src/lib/design/componentDna/kerah/kerah-kemeja-bulat/`

```
metadata.json
dna.id.md
dna.en.md
```

Ini **satu-satunya entri yang ada di seluruh repository** — tidak ada folder komponen DNA lain untuk kategori manapun.

- `metadata.json`: `{ id, category, name, version }` — 4 key datar.
- `dna.id.md` / `dna.en.md`: struktur identik, 5 section:
  1. `## 1. Metadata` — duplikasi metadata.json
  2. `## 2. Geometry` — shape, symmetry, spread, tip shape/radius, opening angle, curvature, proportions
  3. `## 3. Construction` — stiffness, thickness, folded edge, seam visibility, transition, center-front join, interfacing
  4. `## 4. Anchor Point` — neckline, center placket, shoulder transition, symmetry axis
  5. `## 5. Constraint` — daftar aturan keras yang tidak boleh dilanggar

Catatan di kedua file: konten ini adalah "Blueprint resmi (official reference)" dan sumber visual tunggal, `sourceImage = OFFICIAL_REFERENCE_PENDING` (belum ada aset Storage terhubung).

**Fakta kunci (dikonfirmasi lewat grep):** tidak ada satu baris TypeScript pun di seluruh repo yang mengimpor/mem-parsing `dna.id.md`, `dna.en.md`, atau `metadata.json` di folder ini. Satu-satunya referensi tekstual adalah komentar di `promptArchitectureV2/dnaValidator.ts:18` yang justru menyatakan skema semacam ini **tidak ada** di jalur DNA yang live. Struktur markdown ini adalah **dokumentasi terisolasi**, terpisah total dari pipeline `ai_dna`/`render_recipe`/DNA Resolver yang benar-benar dipakai render endpoint.

### 1.5 Tipe DNA/struktur lain yang ditemukan (bukan "DNA" garment, tapi bernama serupa)

- `DNAResolverInput` / `DNAResolverOutput` — `src/lib/design/dnaResolver/types.ts:21-35` (lihat §6).
- `CapabilityResult` / `CapabilityMode` — `src/lib/design/capabilityEngine/types.ts` (grading, bukan struktur DNA — lihat §6/§9).
- Tidak ditemukan: tipe/interface bernama "Blueprint" untuk AI (lihat §2).

---

## 2. SELURUH BLUEPRINT YANG DITEMUKAN

**Hasil pencarian menyeluruh (case-insensitive "blueprint") di `src/lib/design/**`: hanya 2 kecocokan, keduanya BUKAN skema/interface/generator AI-rendering.**

1. `src/lib/design/masterData.ts:399` — `const NOTES_DESIGN_MARKER = '---LTOS_DESIGN_BLUEPRINT---'`. Ini adalah marker string di dalam `consultations.notes` (format `key=value|key=value`), bagian dari mekanisme picker Design Studio lama yang sudah diaudit di `FITTER_DESIGN_STUDIO_AUDIT.md §2.15` — **bukan** struktur AI.
2. `src/lib/design/promptArchitectureV2/dnaValidator.ts:18` — komentar yang justru menegaskan **tidak ada** skema bernama demikian: *"no componentDna/blueprint anywhere names those exact keys — confirmed by search."*

Di luar itu, `GarmentBlueprintPanel.tsx` (UI container 9-accordion picker desain, sudah diaudit di laporan sebelumnya) memakai kata "Blueprint" hanya sebagai nama komponen UI — bukan skema AI.

**Kesimpulan: tidak ada blueprint schema, blueprint interface, atau blueprint generator untuk AI rendering di repository ini.** Klaim apa pun sebelumnya soal "Blueprint AI" — ❌ **tidak ditemukan.**

---

## 3. SELURUH RENDER RECIPE / RENDER RULE / PROMPT FRAGMENT / PROMPT BUILDER / SERIALIZER

### 3.1 Render Recipe (per-item) — lihat §1.2. Status: tipe + kolom DB ada, tapi authoring-nya stub (`builder.ts` 3 fungsi no-op, UI placeholder-only).

### 3.2 Recipe Composer — mesin merge, **live dan berfungsi penuh**

**File:** `src/lib/design/recipeComposer/composer.ts` (363 baris) + `types.ts` (112 baris)

- `GlobalRenderPolicy` (types.ts:19-27): `camera, pose, lighting, background, quality, style` + `negativeRules: string[]`. Satu-satunya nilai populated: `DEFAULT_GLOBAL_RENDER_POLICY` (types.ts:45-59) — framing full-body-locked, identity/pose locked, 5 negative rules hardcoded.
- `RenderRecipeEntry` (types.ts:66-71): `{itemId, category, recipe: RenderRecipe, priority}`.
- `MasterRenderRecipe` (types.ts:87-112) — output composer: 11 record field + `background/quality/style` (dari policy) + `negativeRules` + `sources: RecipeSource[]` (provenance per field) + `composedAt`. **Komentar eksplisit (types.ts:83-86): "NEVER persisted — temporary, assembled on demand only. Never stores a prompt/sentence, only structured data."** Dikonfirmasi: tidak ada import Supabase/DB di file ini sama sekali.
- `composeRenderRecipe(input)` (composer.ts:217-270) — normalize → validate → sort by priority → merge 11 field via `mergeRecordField` (per-field merge lintas seluruh entries, composer.ts:157-182). Konflik antar item diselesaikan `resolveRecipeConflict` (126-143): priority menang, **kecuali field `garment` — kategori `model_thobe` selalu menang sebagai "Anchor"** (131-136).
- Ada jalur debug paralel `composeRenderRecipeTrace`/`traceRecordField` (272-363), eksplisit "never called by composeRenderRecipe or any production caller" — hanya dipakai endpoint debug.
- **Live caller:** `src/app/api/design/render/route.ts:234` — dipanggil langsung di endpoint produksi.

### 3.3 Prompt Builder V1 — `src/lib/design/promptBuilder/` — **live, dipakai produksi**

4 file: `types.ts` (45), `builder.ts` (94), `compression.ts` (147), `serializer.ts` (123).

- `RenderInstruction` (types.ts:27-40) — `subject, body, garment, camera, lighting, composition, background, fabric, stitching, embroidery, quality` + `negativeRules`. Komentar: "never persisted... never a Prompt itself."
- `buildRenderInstruction(recipe)` (builder.ts:41-60) — remap tetap dari `MasterRenderRecipe` (mis. `pose→subject`, `visibilityRules→body`). `validateRenderInstruction` (80-94) hanya melaporkan section kosong, tidak memperbaiki.
- **Compression** (`compression.ts`) — bukan tokenizer sungguhan (`WORDS_PER_TOKEN = 1/1.3`, line 12), murni pemotongan berbasis jumlah kata ke budget token per section. `buildCompressedSections(instruction)` (113-147) memetakan ke 4 bucket tetap: **Anchor** (garment+subject+body, 150 token), **Material** (fabric, 15 token), **Other** (sisanya, 55 token), **Negatives** (50 token). `compressPrompt(sections, totalBudget=270)` (50-80) memangkas greedy ke total ~270 token.
- **Serializer** (`serializer.ts`) — `serializeOpenAI` (90-111) satu-satunya yang implementasi nyata, target `gpt-image-1` (komentar line 8-9), format tetap (fixed section order 29-41), `negativeRules` dilipat jadi klausa `Avoid: ...` (OpenAI tidak punya param negative-prompt). **`serializeGemini`/`serializeClaude` (113-123) keduanya literal `return null`**, "No implementation this sprint."
- **Live caller (kedua fungsi):** `src/app/api/design/render/route.ts:265` (`serializeOpenAI`, hanya untuk logging uncompressed) dan `route.ts:272` (`buildCompressedSections`+`compressPrompt` — **string inilah yang benar-benar dikirim ke OpenAI** via `promptOverride`, line 286).

### 3.4 Prompt Architecture V2 — `src/lib/design/promptArchitectureV2/` — **dibangun lengkap, TIDAK dipakai produksi**

7 file: `layers.ts` (125), `promptValidator.ts` (43), `dnaValidator.ts` (137), `renderValidator.ts` (148), `debugMode.ts` (26), `versions.ts` (20), `regressionReport.ts` (144).

**4 Layer (layers.ts):**
1. Layer 1 Identity — `LAYER1_IDENTITY_TEMPLATE` (34-39), hardcoded.
2. Layer 2 Composition — `LAYER2_COMPOSITION_TEMPLATE` (41-45), hardcoded.
3. Layer 3 Garment DNA — `buildLayer3GarmentDna(instruction)` (57-66), satu-satunya layer data-driven (dari `RenderInstruction.garment/fabric/stitching/embroidery`).
4. Layer 4 Quality — `LAYER4_QUALITY_TEMPLATE` (47-50), hardcoded.

`buildPromptLayersV2`/`mergePromptLayersV2`/`compressPromptLayersV2` (81-125) menyusun & mengompresi 4 layer (reuse mesin compression V1 dengan section boundary sendiri).

**3 Validator deterministik:**
1. `validatePromptLayers` (promptValidator.ts:30-43) — cek 4 layer tidak kosong.
2. `validateComponentDna` (dnaValidator.ts:104-137) — per kategori, cek 6 field `AiDesignDna` (`geometry/construction/appearance/materials/stitching/placement`) terhadap tabel wajib `DNA_REQUIRED_FIELDS_BY_CATEGORY` (32-46).
3. `validateRenderRequest` (renderValidator.ts:69-148) — 11 pemeriksaan non-AI (foto customer ada, reference image ada, Model Thobe ada, prompt tidak kosong/`[object Object]`, `input_fidelity` HIGH, model/endpoint benar, body-framing-lock string ada, dll). Komentar file: "Tanpa AI. Minimal." — dipisahkan tegas dari vision judge AI (§6/§9).

**Komentar header modul sendiri (layers.ts:5-12) menyatakan ini "a NEW, parallel prompt construction path used only by the Render Test Framework... never replaces promptBuilder/serializer.ts (still V1, still what the real production route /api/design/render/route.ts calls)."** Dikonfirmasi via grep: `route.ts` (produksi) **tidak pernah** mengimpor apa pun dari `promptArchitectureV2/`. Satu-satunya pemanggil live: `debug/route.ts:15-19,238-241,384` dan `scripts/render-test-runner.ts`.

### 3.5 "Prompt Fragment" — ❌ TIDAK DITEMUKAN

Grep case-insensitive "fragment" di `src/lib/design/**`: nol kecocokan. Tidak ada tipe/fungsi/konsep bernama demikian di manapun.

### 3.6 "AI Knowledge" — tidak ada modul terpisah

Tidak ada knowledge base/retrieval/embedding/vector-store. Kata "Knowledge" hanya muncul sebagai nama informal untuk tabel `design_master_options` di komentar (`masterData.ts:6,133` — "Product Knowledge Base", satu tabel untuk 11 kategori) dan referensi sprint lama ("Design Knowledge Pipeline V1") di komentar `aiDna/types.ts:72` dan `image.ts:81,191` — bukan sistem knowledge base sungguhan.

---

## 4. MASTER DATA DESIGN — STATUS PER KATEGORI

11 kategori terkunci via CHECK constraint `design_master_options_category_check`, satu tabel `design_master_options` (dikonfirmasi ulang, sama dengan `FITTER_DESIGN_STUDIO_AUDIT.md §2.2`, sumber: `supabase/migrations/20260719000000_add_master_data_price_and_categories.sql:11-19`, mirror kode di `src/lib/design/masterData.ts:14-32`):

| Diminta user | Nama kode/kategori DB | Field `DesignSelections` | Status |
|---|---|---|---|
| Collar | `kerah` | `collar` | ✅ Ada — `CollarCuffSelector.tsx` |
| Sleeve | — | — | ❌ **Tidak ada** — tidak ada kategori/field "lengan"/"sleeve" di manapun |
| Cuff | `manset` | `cuff` | ✅ Ada — `CollarCuffSelector.tsx` (file sama dengan Collar) |
| Pocket | `saku` | `pocket` | ✅ Ada — `PocketPlaketSelector.tsx` |
| Fabric | `bahan` | `fabric` | ✅ Ada — `FabricSelector.tsx` |
| Color | `warna_bahan` | `color` | ✅ Ada — `ColorSelector.tsx` |
| Pattern | — | — | ❌ **Tidak ada sebagai kategori generik.** Yang ada hanya `bordir` (embroidery) dan `handmade_zigzag` — motif dekoratif spesifik, bukan "Pattern" umum |
| Cutting | `look_cutting` | `lookCutting` | ✅ Ada — `LookCuttingSelector.tsx` |
| Silhouette | — | — | ❌ **Tidak ada kategori literal "Silhouette".** Yang paling dekat secara konsep adalah `model_thobe` (Model Busana/`ModelSelector.tsx`), tapi tidak dinamai atau distrukturkan sebagai "Silhouette" di manapun |

Kategori lain yang ada di DB tapi tidak diminta user: `plaket`, `aksesori` (kode field: `button`).

**Catatan konsistensi dengan audit sebelumnya:** `FITTER_DESIGN_STUDIO_AUDIT.md §2.2/§2.6/§2.8` sudah mengonfirmasi "Pergelangan" dan "Variasi" juga tidak eksis — temuan baru di atas (Sleeve, Pattern generik, Silhouette literal) konsisten dengan pola yang sama: **hanya 11 kategori yang terkunci di DB yang benar-benar eksis; nama lain yang terdengar mirip tidak dianggap ada kecuali cocok literal.**

Setiap kategori Master Data (termasuk kategori di atas) sekarang membawa **2 kolom tambahan** yang menjadi fokus audit ini: `ai_dna` dan `render_recipe` (lihat §1, §8) — tapi field ini adalah lapisan AI, terpisah dari field pemilihan (`DesignSelections`) yang dipakai picker Design Studio.

---

## 5. SELURUH REPOSITORY DESIGN

Sudah dirinci di §1.4. Ringkasan struktur folder:

```
src/lib/design/componentDna/
  kerah/
    kerah-kemeja-bulat/
      metadata.json     { id, category, name, version }
      dna.id.md          5 section: Metadata, Geometry, Construction, Anchor Point, Constraint
      dna.en.md          struktur identik, versi Inggris
```

**Tidak ada folder lain** untuk kategori lain (manset, saku, plaket, bahan, warna_bahan, aksesori, bordir, handmade_zigzag, look_cutting, model_thobe) — hanya `kerah/kerah-kemeja-bulat` yang eksis di disk. Tidak ada file index/README yang mendaftar seluruh repository atau menjelaskan konvensi secara tertulis di dalam folder itu sendiri — konvensi hanya bisa disimpulkan dari isi file yang ada.

**Tidak ada mekanisme yang menghubungkan Repository ini ke kolom `ai_dna`/`render_recipe`.** Tidak ada importer, tidak ada script sync, tidak ada build step yang membaca markdown ini dan menulis ke database. Repository markdown dan kolom DB `ai_dna` adalah **dua sumber data DNA yang paralel dan terputus**.

---

## 6. SELURUH AI PROMPT BUILDER (Prompt Builder, DNA Resolver, Recipe Composer, Prompt Serializer, AI Knowledge)

Sudah dirinci per bagian: Prompt Builder V1 (§3.3, live), Prompt Architecture V2 (§3.4, dibangun tapi hanya debug), Recipe Composer (§3.2, live), Prompt Serializer (bagian dari §3.3, live untuk OpenAI saja), AI Knowledge (§3.6, tidak eksis sebagai sistem terpisah).

**DNA Resolver** — `src/lib/design/dnaResolver/` (`types.ts`, `resolver.ts`):

- Posisi dalam pipeline (komentar header): `design_master_options (ai_dna, render_recipe) → DNA Resolver → RenderRecipe → Recipe Composer → ...`
- Input: `DNAResolverInput {itemId, category, aiDna: AiDesignDna, renderRecipe: RenderRecipe}` (types.ts:21-26).
- Output: `DNAResolverOutput {recipe: RenderRecipe | null, ready: boolean, errors: string[]}` (types.ts:28-35) — **outputnya adalah `RenderRecipe`, bukan tipe "Blueprint" apa pun.**
- Logika (`resolver.ts`): `validate()` (19-30) gate pada `aiDna.status !== 'pending'` dan `renderRecipe.status !== 'empty'`; `buildGarmentSpec()` (39-50) menyalin 6 field `AiDesignDna` (`AI_DNA_GARMENT_FIELDS`, line 12) ke `RenderRecipe.garment`, key milik `renderRecipe` sendiri menang jika bentrok; `resolveDNA()` (61-81) menggabungkan `negativeRules` dari kedua sumber (defensif `?? []` untuk baris legacy — komentar 68-73 menyebut baris seperti `warna_bahan`/`saku` pernah dibuat dengan bentuk non-standar).
- **Live caller:** `src/app/api/design/render/route.ts:155`.

---

## 7. VISION AI FLOW — ALUR AKTUAL (bukan konseptual)

### 7.1 Alur produksi (yang benar-benar bisa diklik user)

```
[Design Studio UI]
  User memilih opsi (Model, Kerah, dst.) → DesignSelections (state)
       |
       v
  AIPreviewPanel — tombol "Buat Pratinjau Akhir"
    (src/components/workspace/design-studio/AIPreviewPanel.tsx:118-126, handleGenerate)
       |
       v  validateRenderContextReadiness() → jika tidak lengkap, tampilkan missing[]
       v  buildRenderContext() (customerProfile/renderContext.ts)
       |
       v
  DesignStudioWorkspace.handleRenderGenerate()  (DesignStudioWorkspace.tsx:165-169)
       |
       v
  renderService.renderDesign(context)  (src/lib/services/renderService.ts:86+)
    mapContextToPayload() (33-72) → POST /api/design/render
       |
       v
  [POST /api/design/render/route.ts]  (321 baris, endpoint produksi nyata)
    1. hashDnaState() (line 101)
    2. detectDirtyLayers() (104) — diff terhadap cache
    3. getCachedRender() (110) — kalau hit, return cached response, STOP di sini
    4. fetch design_master_options dari Supabase (120)
    5. resolveDNA() per component (155)               <- DNA Resolver
    6. validateComponentDna() Anchor + lainnya (181,189)
    7. composeAiAssets() (199)                          <- AI Asset Composer
    8. evaluateCapability() (201)                        <- Capability Engine
       -> HARD 422 hanya jika capability.mode === 'BLOCKED' (214-220)
    9. composeRenderRecipe() (234)                       <- Recipe Composer
    10. buildRenderInstruction() / validateRenderInstruction() (248-249)
    11. serializeOpenAI() (265) — hanya untuk logging uncompressed
    12. buildCompressedSections() + compressPrompt() (272) <- prompt FINAL yang dipakai
    13. applyAssetInstructions() (285)
    14. generateImage() (286)  → src/lib/ai/services/image.ts → OpenAI gpt-image-1
       |
       v
  Response {renderedImageUrl, promptUsed, capability, componentsUsed/Missing, debug}
    → setCachedRender() (318)
       |
       v
  AIPreviewPanel menampilkan gambar (baris 51-63)
```

### 7.2 Cabang yang TIDAK terjangkau dari alur produksi di atas

- **`promptArchitectureV2/`** (4-layer + 3 validator) — hanya dipanggil `debug/route.ts` dan `render-test-runner.ts`.
- **`renderQuality/qualityJudge.ts`** (vision judge GPT-4o-mini) — hanya dipanggil `debug/route.ts` (opt-in flag `runVisionJudge`, default `false`) dan `render-test-runner.ts` (`--live --runVisionJudge`). **Tidak pernah dipanggil dari `route.ts` produksi maupun dari klik UI Design Studio manapun.**
- **`src/app/owner/debug/render/page.tsx`** ("DNA Debug Viewer", 872 baris) — halaman developer internal, "Not linked from any customer- or fitter-facing navigation; reached by typing the URL directly" (komentar file, baris 14-18). Memanggil `/api/design/render/debug`, menampilkan 13 seksi inspeksi (Capability, Prompt Inspector, Prompt V2, DNA Validator, Render Validator, DNA mentah/resolved, Recipe Composer trace, Serializer/Compression, Final Request JSON, AI Asset status, lifecycle cards, framing classification, vision-judge scores).
- **`render-testing/` golden dataset** — lihat §10, seluruhnya masih kosong/blocked.

### 7.3 Ringkasan gate hidup/mati di jalur produksi

| Gate | Live di produksi? |
|---|---|
| Capability Engine (BLOCKED → 422) | ✅ Ya |
| AI Asset Composer (approved-only reference) | ✅ Ya |
| DNA Validator (`validateComponentDna`, non-AI) | ✅ Ya |
| Render Validator (`validateRenderRequest`, non-AI, prompt-architecture-v2) | ❌ Tidak — hanya debug |
| Vision Judge (AI, kesamaan wajah/tubuh/pose) | ❌ Tidak — hanya debug opt-in / test runner |

---

## 8. TABEL SUPABASE TERKAIT

### 8.1 `design_master_options`

**Temuan kritis:** tidak ada `CREATE TABLE public.design_master_options` di seluruh 50 file `supabase/migrations/`. Tabel ini hanya muncul lewat `ALTER TABLE` inkremental yang ditemukan:

- `price numeric not null default 0` — `20260719000000_add_master_data_price_and_categories.sql:8-9`
- CHECK constraint kategori (drop+recreate untuk menambah `bordir`/`handmade_zigzag`) — `20260719000000_add_master_data_price_and_categories.sql:11-19`
- `material_id uuid references public.materials(id)` — `20260720000000_add_inventory.sql:63-64`

**`ai_dna` dan `render_recipe` — kolom ini TIDAK ditemukan di migrasi manapun.** Grep case-insensitive `ai_dna|render_recipe` di seluruh `.sql` (migrations + `supabase/ops/`): nol kecocokan. Nama migrasi yang disebut berulang kali di komentar kode (`add_ai_design_dna_to_master_options` di `aiDna/types.ts:29`, `add_render_recipe_to_master_options` di `renderRecipe/types.ts:43`, dan `masterData.ts:81-89`) **tidak eksis sebagai file di repository ini**. Ini artinya salah satu dari dua kemungkinan (murni fakta, tidak diasumsikan mana yang benar): (a) kolom ini pernah diterapkan langsung ke Supabase remote tanpa migrasi lokal yang commit, atau (b) kode mengasumsikan kolom yang belum benar-benar ada di skema manapun. **Ini adalah gap provenance skema yang nyata dan perlu diverifikasi langsung ke instance Supabase**, bukan sekadar dokumentasi hilang.

Kolom aplikasi (`src/lib/design/masterData.ts:70-90`) yang diasumsikan selalu ada: `id, category, name, metadata (jsonb), sort_order, is_active, photo_url, selling_points, internal_notes, price, material_id, ai_dna (jsonb), render_recipe (jsonb)`.

### 8.2 Tabel lain yang relevan

| Tabel | Dibuat di | Kolom kunci |
|---|---|---|
| `master_divisions` | `20260805000001_add_master_division.sql:14-21` | id, name, sort_order, is_active |
| `material_categories` | `20260720000000_add_inventory.sql:13-18` | id, name (unique), sort_order |
| `materials` | `20260720000000_add_inventory.sql:20-36`, diperluas `20260807000000_add_material_master_fields.sql:14-16` | category_id FK, name, sku, physical_stock, reserved_stock, available_stock (generated), supplier, default_color |
| `material_stock_movements` | `20260720000000_add_inventory.sql:44-55` | material_id FK, movement_type, quantity, order_id FK |

### 8.3 Tabel bernama "dna"/"blueprint"/"repository"/"recipe"/"prompt"/"knowledge"

**Tidak ada satu pun.** Grep keyword di seluruh migrasi hanya menemukan kata "render(s)" dalam konteks prosa UI ("invoice view/print renders") di 4 file yang tidak berkaitan (`sprint_l_owner_global_search`, `add_return_notification_rules`, `add_business_rules_runtime_config`, `add_commercial_engine`) — bukan definisi tabel/kolom.

### 8.4 RPC terkait design/DNA/blueprint/recipe/render/master_option

**Tidak ada satu pun.** Regex atas seluruh deklarasi `create (or replace) function public.*` di migrasi untuk nama mengandung `master_option`, `dna`, `blueprint`, `recipe`, atau `render` — nol hasil. Satu-satunya RPC "master_*" adalah untuk `master_divisions` (`get_active_divisions`, `list_all_divisions`, `create_division`, dll — `20260805000001_add_master_division.sql:50-198`), tidak terkait Design/DNA. **Seluruh akses ke `design_master_options` (termasuk kolom `ai_dna`/`render_recipe`) berjalan lewat PostgREST langsung di bawah RLS, bukan RPC** — ini menyimpang dari pola wajib yang dikunci `ARCHITECTURE_LOCK_V1.md §10.3 poin 1` ("Write operations → SECURITY DEFINER RPC. Client → panggil RPC.") — dicatat sebagai fakta observasi, bukan penilaian benar/salah.

---

## 9. SELURUH API / SERVER ACTION / RPC / ROUTE HANDLER UNTUK DESIGN STUDIO

| Jenis | Path | Detail |
|---|---|---|
| Route Handler (produksi) | `src/app/api/design/render/route.ts` | `POST` (line 70). Handler tunggal, alur lengkap di §7.1. |
| Route Handler (debug) | `src/app/api/design/render/debug/route.ts` | `POST` (line 71), 601 baris. "read-only audit twin", default `dryRun:true`, `runVisionJudge:false`. |
| Server Action (`'use server'`) | — | **Tidak ditemukan satu pun** di `src/app/workspace/design-studio/`, `src/components/workspace/design-studio/`, `src/components/master-data/`, `src/app/owner/master-data*` — semua komponen di sana adalah client component (`'use client'`) yang memanggil Supabase langsung atau lewat 2 route handler di atas. |
| RPC Postgres | — | **Tidak ada** untuk domain Design/DNA/Recipe/Render/Master Option (lihat §8.4). |
| Halaman debug internal | `src/app/owner/debug/render/page.tsx` | Bukan API, tapi konsumen `/api/design/render/debug`; tidak ada di navigasi customer/fitter. |

---

## 10. SELURUH TODO / FILE YANG BELUM SELESAI

**Tidak ditemukan literal `TODO`/`FIXME`/`not committed`/`NOT wired`/`stub`** di 77 file berjalur `design|dna|blueprint|recipe|prompt|render|master-data` (grep case-insensitive menyeluruh). Semua indikasi "belum selesai" ditulis sebagai komentar prosa, bukan tag:

- `src/components/master-data/RenderRecipeSection.tsx:10-11` — *"Placeholder only ... Belum perlu Editor. Belum perlu Form. Cukup placeholder."* Tidak ada editor untuk camera/pose/lighting/composition/dll pada Render Recipe.
- `src/lib/design/recipeComposer/types.ts:18` — *"Placeholder only this sprint; no editor exists yet."*
- `src/lib/design/renderRecipe/builder.ts:16,31,43` — 3 fungsi eksplisit "No implementation this sprint".
- `src/lib/design/aiAssetComposer/types.ts:14-21` — `FABRIC_REFERENCE`/`EMBROIDERY_REFERENCE`/`PATTERN_REFERENCE` adalah "reserved names with no composer logic, no role, no priority, and no caller anywhere in this codebase" — baru `MODEL_THOBE` dan `COLLAR_REFERENCE` yang berfungsi.
- `src/components/master-data/AiDesignDnaSection.tsx:98-109` — tombol "Advanced DNA"/"Expert DNA" disabled, tooltip: *"Belum aktif — bagian dari fase AI Vision Integration berikutnya."*
- `src/components/workspace/design-studio/DesignStudioFooter.tsx:44-46` — komentar eksplisit: tidak ada kalkulator harga/quotation nyata, ditampilkan *"Estimasi belum tersedia"* sebagai placeholder jujur.
- `src/components/workspace/design-studio/FabricSelector.tsx:25` — komentar: *"'Stok belum terhubung' placeholder instead of fabricating a number."*
- `render-testing/README.md` — bagian *"Current status — BLOCKED on real data"* (line 21-38): seluruh `customers/manifest.json` (`photoUrl: null` di 5 entri) dan `dna/manifest.json` (`componentId: null` di 5 skenario) belum diisi. Sample hasil run (`render-testing/results/2026-07-29T16-01-41-228Z/...json`) menunjukkan setiap skenario di-skip: `skippedReason: "Customer ... belum punya photoUrl."`.
- `src/lib/design/promptArchitectureV2/dnaValidator.ts:16-19` — pernyataan eksplisit bahwa skema sub-key DNA yang lebih rinci (mis. Length/Sleeve/Silhouette per §4) *"nowhere defined ... no migration, no seed data, no componentDna/blueprint anywhere names those exact keys."*
- Sisanya (mayoritas match "Belum ada ...") adalah copy empty-state UI rutin (mis. `MasterDataManager.tsx:392,486,565,602`, `MasterDivisionManager.tsx:164`, `DesignSummaryPanel.tsx:78`, dll) — bukan penanda kode belum selesai, murni teks tampilan saat data kosong.

**File/direktori baru yang belum ter-commit (dari git status saat audit):** `src/lib/design/aiAssetComposer/`, `src/lib/design/capabilityEngine/`, `src/lib/design/promptArchitectureV2/`, `src/lib/design/renderQuality/`, `src/app/api/design/render/debug/`, `src/app/owner/debug/`, `render-testing/`, `scripts/` — seluruhnya berstatus untracked/modified di working tree, belum masuk git history.

---

## 11. DEPENDENCY GRAPH

### 11.1 Yang benar-benar LIVE (dikonfirmasi lewat call-site, bukan komentar)

```
Design Studio (UI, user memilih opsi)
  ↓
AIPreviewPanel → RenderContext (readiness check)
  ↓  POST /api/design/render
design_master_options (kolom ai_dna, render_recipe — provenance migrasi TIDAK ditemukan, §8.1)
  ↓
DNA Resolver (resolveDNA)              — per komponen: ai_dna + render_recipe → RenderRecipe
  ↓
Capability Engine (evaluateCapability) — gate BLOCKED/LIMITED/STANDARD/HIGH/PREMIUM
  ↓
AI Asset Composer (composeAiAssets)    — reference image, gate ai_dna.status==='approved'
  ↓
Recipe Composer (composeRenderRecipe)  — merge N item RenderRecipeEntry + GlobalRenderPolicy → MasterRenderRecipe (tidak pernah dipersist)
  ↓
Prompt Builder V1 (buildRenderInstruction → serializeOpenAI + compressPrompt)
  ↓
Image Service (generateImage → OpenAI gpt-image-1)
  ↓
renderedImageUrl → Render Cache → ditampilkan di AIPreviewPanel
```

### 11.2 Cabang yang dibangun tapi TERPUTUS dari rantai live di atas

```
Component DNA Repository (markdown, componentDna/kerah/kerah-kemeja-bulat/)
  → (TIDAK ADA importer/reader apa pun)  ✗ terputus total dari DNA Resolver

Prompt Architecture V2 (4 layer + 3 validator)
  → hanya dipanggil oleh /api/design/render/debug dan render-test-runner.ts  ✗ nol pemanggil produksi

Render Quality / Vision Judge (GPT-4o-mini, judgeRenderQuality)
  → hanya dipanggil oleh /api/design/render/debug (opt-in) dan render-test-runner.ts (--live)  ✗ nol pemanggil produksi

Golden Test Dataset (render-testing/)
  → seluruh photoUrl/componentId = null  ✗ tidak bisa dijalankan dengan data nyata
```

### 11.3 Diagram gaya ringkas (sesuai format yang diminta)

```
Design Studio
  ↓
DNA (ai_dna + render_recipe kolom DB — LIVE, tapi provenance migrasi hilang)
  ↓
[Repository markdown — TERPUTUS, tidak dibaca siapa pun]
  ↓ (jalur nyata melewati Repository, langsung dari DNA Resolver)
DNA Resolver → Recipe Composer → Prompt Builder (V1, live) / Prompt Architecture V2 (dibangun, tidak dipakai)
  ↓
Image Generator (OpenAI gpt-image-1)
  ↓
[Render Quality Vision Judge — dibangun, tidak dipanggil produksi]
```

---

## 12. PERBANDINGAN DENGAN ARSITEKTUR YANG SUDAH DI-LOCK

**Catatan metodologi:** Tidak ada satu dokumen "ARCHITECTURE LOCK" resmi khusus untuk pipeline AI Design Studio ini (berbeda dengan `ARCHITECTURE_LOCK_V1.md` yang mengunci arsitektur bisnis inti — workflow, production stages, RBAC, dll., dan sama sekali tidak membahas AI DNA/Render pipeline). Tabel di bawah membandingkan implementasi saat ini terhadap **spesifikasi yang terakumulasi lintas sprint** (Component DNA Repository, AI Design DNA, Render Recipe, Recipe Composer, DNA Resolver, Prompt Builder, Prompt Architecture V2, AI Capability Engine, AI Asset Composer/Lifecycle, Render Quality Vision Judge) — seluruhnya berstatus **belum di-commit ke git** per snapshot git status saat audit ini dibuat.

| Komponen | Status |
|---|---|
| AI Design DNA (`ai_dna`, lifecycle status, UI Master Data) | ✅ **Sudah sesuai** — implementasi penuh, live di UI + resolver + render endpoint. |
| DNA Resolver | ✅ **Sudah sesuai** — implementasi penuh, live caller dari `route.ts`. |
| Recipe Composer (merge engine, tidak dipersist) | ✅ **Sudah sesuai** — implementasi penuh sesuai spesifikasi ("never persisted"), live caller dari `route.ts`. |
| Prompt Builder V1 (builder + compression + serializer OpenAI) | ✅ **Sudah sesuai** — implementasi penuh, live caller dari `route.ts`. |
| AI Capability Engine (5 level PREMIUM→BLOCKED) | ✅ **Sudah sesuai** — implementasi penuh, live gate di `route.ts`. |
| AI Asset Composer + approval gate + tombol Approve | ✅ **Sudah sesuai** untuk `MODEL_THOBE`/`COLLAR_REFERENCE`; 3 dari 5 tipe reference (`FABRIC/EMBROIDERY/PATTERN_REFERENCE`) hanya nama reserved tanpa logika. |
| Component DNA Repository (markdown 3-file/5-section) | ⚠️ **Sebagian sesuai** — struktur folder benar dan berkualitas untuk 1 entri (`kerah-kemeja-bulat`), tapi terputus total dari pipeline DNA yang live; tidak ada entri lain; tidak ada mekanisme sync. |
| Render Recipe (struktur per-item, authoring) | ⚠️ **Sebagian sesuai** — tipe & kolom DB ada, tapi authoring (`builder.ts`) 3 fungsi stub no-op dan UI eksplisit "placeholder only, belum perlu editor". |
| Prompt Architecture V2 (4-layer + 3 validator) | ⚠️ **Sebagian sesuai** — dibangun lengkap dan benar secara struktural, tapi nol pemanggil produksi; hanya reachable dari debug route/test runner. |
| Render Quality Vision Judge (GPT-4o-mini) | ⚠️ **Sebagian sesuai** — implementasi nyata (real API call), tapi nol pemanggil produksi; hanya reachable dari debug route (opt-in) / test runner (`--live`). |
| Golden Test Dataset (`render-testing/`) | ❌ **Belum ada** — scaffolding kosong total, semua `photoUrl`/`componentId` null, dinyatakan eksplisit "BLOCKED" di README-nya sendiri. |
| Blueprint (skema AI terstruktur) | ❌ **Belum ada** — tidak ditemukan sebagai konsep di manapun; hanya nama komponen UI lama (`GarmentBlueprintPanel`) dan marker string notes, tidak relevan dengan AI rendering. |
| Provenance skema DB `ai_dna`/`render_recipe` | ❌ **Belum ada** (gap governance) — kode mengasumsikan kolom+default dari migrasi bernama eksplisit, tapi migrasi tersebut tidak eksis di repository manapun. |
| Master Data write path via RPC (pola wajib `ARCHITECTURE_LOCK_V1 §10.3`) | ⚠️ **Sebagian sesuai / menyimpang** — `design_master_options` (termasuk `ai_dna`/`render_recipe`) ditulis langsung via PostgREST di bawah RLS, tanpa RPC, berbeda dari pola Commercial/Production yang dikunci. |
| AI Prompt Fragment | ❌ **Belum ada** — konsep ini tidak eksis di repository dalam bentuk apa pun. |
| AI Knowledge base (retrieval/embedding) | ❌ **Belum ada** — tidak ada sistem knowledge base; istilah hanya dipakai informal untuk menyebut tabel `design_master_options`. |

---

## LAMPIRAN — DAFTAR FILE UTAMA PER LAPISAN

```
src/lib/design/
  aiDna/types.ts                    AiDesignDna (LIVE)
  renderRecipe/types.ts             RenderRecipe (tipe ada, builder.ts stub)
  renderRecipe/builder.ts           3 fungsi stub no-op
  componentDna/kerah/kerah-kemeja-bulat/
    metadata.json, dna.id.md, dna.en.md      (Repository, terputus)
  dnaResolver/types.ts, resolver.ts          (LIVE)
  recipeComposer/types.ts, composer.ts       (LIVE)
  promptBuilder/types.ts, builder.ts,
                compression.ts, serializer.ts  (LIVE — V1)
  promptArchitectureV2/layers.ts, promptValidator.ts,
                dnaValidator.ts, renderValidator.ts,
                debugMode.ts, versions.ts, regressionReport.ts  (dibangun, debug-only)
  aiAssetComposer/types.ts, composer.ts      (LIVE untuk MODEL_THOBE/COLLAR_REFERENCE)
  capabilityEngine/types.ts, engine.ts       (LIVE)
  renderQuality/qualityJudge.ts              (implementasi nyata, debug-only)
  masterData.ts                              (tabel + kategori terkunci)

src/lib/ai/services/image.ts                 (Image Service, OpenAI gpt-image-1, LIVE)

src/app/api/design/render/route.ts           (endpoint produksi, LIVE)
src/app/api/design/render/debug/route.ts     (endpoint debug, twin read-only)
src/app/owner/debug/render/page.tsx          (DNA Debug Viewer, tidak ada di nav)

src/components/master-data/
  AiDesignDnaSection.tsx, RenderRecipeSection.tsx, MasterDataManager.tsx

render-testing/                              (golden dataset, KOSONG/BLOCKED)
scripts/render-test-runner.ts                (npm run render:test)

supabase/migrations/
  20260719000000_add_master_data_price_and_categories.sql   (price, category check)
  20260720000000_add_inventory.sql                            (material_id FK)
  [tidak ada migrasi untuk ai_dna / render_recipe — lihat §8.1]
```

---

**Dokumen ini murni hasil pembacaan source code dan migrasi SQL pada snapshot repository saat audit dilakukan (2026-07-30), tanpa perubahan kode, tanpa asumsi, tanpa rekomendasi implementasi.**
