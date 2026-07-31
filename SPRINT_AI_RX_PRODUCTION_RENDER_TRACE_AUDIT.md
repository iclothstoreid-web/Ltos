# Sprint AI-RX — Production Render Trace Audit

Status: investigasi selesai. **Tidak ada kode yang diubah, tidak ada commit, tidak ada deploy** — sesuai brief.

Scope kasus: Model **Saudi Modern**, Material **Lorenzo Premium Gold Class**, Color **Maroon**, Collar **Basim Collar / Rounded Collar**.

---

## RINGKASAN — TEMUAN PALING PENTING DULU

Sebelum masuk ke 8 fase yang diminta, ada satu fakta yang mengubah seluruh premis audit ini:

> **Kode yang ada di working tree/HEAD repo (commit `6cab50f`) BUKAN kode yang sedang berjalan di production.**
> Deploy Vercel dari commit `6cab50f` **berstatus `ERROR`** (build gagal). Production saat ini masih melayani deploy dari commit sebelumnya, **`f1c1579`** (`dpl_8yYUHSdqNGW4dxProHvhdzaYH4go`, state `READY`).

Bukti (dijalankan langsung terhadap Vercel API project `ltos`, team `local-tailor`):

| Deployment (commit) | State | Target |
|---|---|---|
| `6cab50f` "DNA Color Repository + Material Color Mapping" | **ERROR** | production |
| `f1c1579` "Commercial Engine Milestone A" | **READY** ← ini yang live | production |

Penyebab build gagal: `src/app/api/design/render/route.ts` di commit `6cab50f` meng-import 3 modul —

```
src/lib/design/aiAssetComposer/composer.ts
src/lib/design/capabilityEngine/engine.ts
src/lib/design/promptArchitectureV2/dnaValidator.ts
```

— yang **tidak pernah ada di history git manapun** (`git log --oneline --all -- src/lib/design/capabilityEngine/` dan 2 path lain semuanya kosong). Ketiganya hanya ada sebagai file **untracked** (`??`) di working tree lokal ini. Next.js build gagal dengan "Module not found," Vercel menandai deploy `ERROR`, dan production terus melayani `f1c1579`.

**Konsekuensi untuk seluruh audit ini:** Semua fitur berikut yang Anda kira sudah aktif **TIDAK PERNAH berjalan di production sama sekali**, karena belum pernah berhasil ter-deploy:
- AI Capability Engine (gate BLOCKED/PREMIUM/HIGH/STANDARD/LIMITED)
- AI Asset Composer (gate `ai_dna.status === 'approved'` untuk Model Reference / Collar Reference)
- DNA Validator (`promptArchitectureV2`)
- Merge `dna_colors.prompt` → `warna_bahan.ai_dna.appearance` (fitur paling baru, commit `6cab50f` itu sendiri)
- `input_fidelity: "high"` pada `images.edit`
- Model Thobe "Anchor" collision-protection di Recipe Composer

Karena itu, **seluruh Phase 1–7 di bawah ini di-trace terhadap kode yang benar-benar live (`f1c1579`)**, bukan terhadap working tree. Setiap kali working tree berbeda dari live, saya tandai eksplisit.

---

## PHASE 1 — TRACE EXECUTION PATH PRODUCTION

Tombol "Buat Pratinjau Akhir":

```
AIPreviewPanel.tsx:120 (onClick handleGenerate)
  → validateRenderContextReadiness()   [src/lib/customerProfile/renderContext.ts:47]
  → buildRenderContext()               [renderContext.ts:16]
       ↓
DesignStudioWorkspace.tsx:171 handleRenderGenerate(context)
  → renderDesign(context)              [src/lib/services/renderService.ts:86]
       → mapContextToPayload(context)  [renderService.ts:33] — designSpecification → componentSelections[]
       → fetch POST /api/design/render [renderService.ts:90]
       ↓
src/app/api/design/render/route.ts POST()   ← LIVE version = commit f1c1579, BUKAN working tree
  1. hashDnaState(dnaState)                         [dnaState/hash.ts:9]
  2. detectDirtyLayers(prev, next)                   [dirtyLayer/detect.ts:45]  (observation only)
  3. getCachedRender(hash)                           [renderCache/cache.ts:25]  ← bisa short-circuit di sini
  4. supabase.from('design_master_options').select('*').in('id', ids)
  5. per component: resolveDNA(input)                [dnaResolver/resolver.ts:61]
  6. if (entries.length === 0) → 422                 (satu-satunya hard block di live code)
  7. composeRenderRecipe({entries, policy})          [recipeComposer/composer.ts:217 versi f1c1579]
  8. buildRenderInstruction(masterRecipe)             [promptBuilder/builder.ts:41]
  9. validateRenderInstruction(instruction)           [builder.ts:80]  (hanya di-log, tidak pernah blocking)
 10. referenceImageUrls = [customerPhotoUrl, modelThobeOption?.ai_dna.metadata.sourceImage].filter(Boolean)
 11. serializeOpenAI({instruction})                  [promptBuilder/serializer.ts:90]  (uncompressed, untuk log saja)
 12. compressPrompt(buildCompressedSections(instruction)) [promptBuilder/compression.ts:50 & :113]
 13. generateImage({instruction, referenceImageUrls, promptOverride: promptCompression.compressed})
       ↓
src/lib/ai/services/image.ts generateImage()        ← LIVE version = f1c1579
 14. client.images.edit({model:"gpt-image-1", prompt, image:[...]})   (tidak ada input_fidelity/size/quality)
 15. OpenAI response → data:image/{format};base64,... dibangun manual karena gpt-image-1 tidak isi .url
       ↓
 16. setCachedRender(hash, responseBody)             [renderCache/cache.ts:37]
       ↓
NextResponse.json(responseBody) → RenderResult → AIPreviewPanel menampilkan gambar
```

**Modul yang DIPANGGIL live:** DNA Resolver, Recipe Composer, Prompt Builder (builder+serializer+compression), Image Service, DNA State Hash, Dirty Layer Detector, Render Cache.
**Modul yang TIDAK PERNAH dipanggil di production** (ada di disk, tidak pernah di-deploy): AI Capability Engine, AI Asset Composer, Prompt Architecture V2 DNA Validator, DNA Color merge block.

---

## PHASE 2 — TRACE SETIAP KOMPONEN (data real dari Supabase, project `ltos-v1`)

| Komponen | ID dipilih | Record ditemukan? | Status AI DNA | Render Recipe | Lolos `resolveDNA`? | Masuk "AI Asset" (live: cek `sourceImage`, bukan Composer)? | Masuk Prompt Builder? | Terkirim ke OpenAI? |
|---|---|---|---|---|---|---|---|---|
| **Model Thobe** — Saudi Modern | `3ea66afd-30e0-4bf6-9411-14defab8e9be` | ✅ ya | `draft` | **`empty`** | ❌ **TIDAK** — `render_recipe.status==='empty'` (resolver.ts:25) | ❌ tidak — `ai_dna.metadata.sourceImage = null` juga | ❌ tidak — masuk `componentsMissing`, tidak masuk `entries` | ❌ tidak sebagai referensi gambar; tidak berkontribusi teks apapun |
| **Material** — Lorenzo Premium Gold Class | `976794cd-3a4a-4d16-9e02-9efe0eda7699` | ✅ ya | `needs_regeneration` | `configured` | ✅ ya (`needs_regeneration` ≠ `pending`, tidak diblok) | — (bukan kategori yang bisa jadi image reference) | ✅ ya, priority 0 | ✅ ya, sebagai teks (lihat Phase 4) |
| **Color** — Maroon | `c1d30b1e-728f-4374-bfa7-171d9fc99c1f` | ✅ ya | `approved` | `configured` | ✅ ya | — | ✅ ya, priority 1 — **tapi kontribusinya KOSONG** (lihat catatan) | ❌ **tidak** — tidak ada teks warna sama sekali yang mencapai prompt |
| **Collar** — Basim Collar | `71f730db-e833-4fe0-884f-61c5d8f7175a` | ✅ ya | `needs_regeneration` | `configured` | ✅ ya | ❌ tidak — logika live hanya cek Model Thobe untuk reference image, Collar tidak pernah jadi image reference di kode yang live | ✅ ya, priority 2 (**tertinggi** di antara yang resolve) | ✅ ya, sebagai teks — dan **memenangkan semua collision `garment.*` key** karena priority tertinggi |
| Look Cutting / Cuff / Pocket / Placket / Button / Aksesori / Bordir / Zigzag | tidak disebutkan user | — | — | — | — | — | — | Field opsional (`OPTIONAL_FIELDS`, `types.ts`) memakai sentinel `(None)` → tidak pernah masuk `componentSelections` sama sekali kalau dipilih "(None)"; kalau dipilih item nyata, jalurnya identik dengan Collar di atas |

**Catatan kritis pada baris Maroon:** `ai_dna` Maroon di DB **tidak punya key `geometry/construction/appearance/materials/stitching/placement` sama sekali** — datanya ada di key lain (`tone`, `undertone`, `brightness`, `saturation`, `description`) yang tidak pernah dibaca oleh `AI_DNA_GARMENT_FIELDS` (`dnaResolver/resolver.ts:12`). Jadi Maroon **lolos** `resolveDNA` (statusnya bukan `pending`/`empty`) tapi `buildGarmentSpec` menghasilkan objek kosong `{}` untuknya. Kontribusi tekstual Maroon ke render = **nol**, independen dari fitur `dna_colors` merge yang belum live.

**Catatan kritis priority order:** `DesignSpecification` field order = `model, fabric, color, collar, cuff, ...` (`designSpecification/types.ts:32-39`). Karena Model Thobe di-drop dari `resolved`, priority index dihitung ulang dari 0 pada array yang sudah difilter: **fabric(Lorenzo)=0, color(Maroon)=1, collar(Basim)=2**. Recipe Composer versi live (`recipeComposer/composer.ts` commit `f1c1579`) **tidak punya** aturan "Model Thobe selalu menang collision di key `garment`" — aturan itu (`resolveRecipeConflict`'s Anchor exception) **hanya ada di working tree, tidak pernah di-commit sama sekali** (`git diff f1c1579 HEAD -- composer.ts` kosong; `git status` menandai file ini `M` — perbedaannya murni uncommitted). Akibatnya **Basim Collar (priority 2) menang setiap collision** melawan Lorenzo (priority 0) pada key `garment.geometry`, `garment.construction`, `garment.materials`, `garment.appearance` — lihat Phase 4 untuk isi persisnya.

---

## PHASE 3 — FALLBACK DETECTION (kode live, `f1c1579`)

| Kondisi | Lokasi kode | Hasil akhir |
|---|---|---|
| `ai_dna.status === 'pending'` ATAU `render_recipe.status === 'empty'` | `dnaResolver/resolver.ts:22-27` (`validate()`) | Komponen di-drop ke `componentsMissing`; **tidak** masuk `entries`, **tidak** ikut merge Recipe Composer, **tidak** ikut prompt sama sekali. Bukan error yang tampil ke user — render tetap lanjut kalau komponen lain resolve. Ini yang terjadi pada Saudi Modern. |
| `entries.length === 0` (SEMUA komponen gagal resolve) | `route.ts` (live) baris "if (entries.length === 0)" | **Satu-satunya** hard block: HTTP 422 `"No selected component has usable AI Design DNA / Render Recipe data yet."` |
| `composeRenderRecipe` menerima entries tidak valid (`validateRenderRecipeEntries` gagal) | `recipeComposer/composer.ts:227-229` | `composeRenderRecipe` return `null` → `buildRenderInstruction(null)` → `null` → route.ts return 422 `"Render Instruction could not be compiled."` |
| `validateRenderInstruction` menemukan section kosong (Background/Stitching/Embroidery/Quality — lihat Phase 4) | `promptBuilder/builder.ts:80-93` | **Hanya di-console.log**, tidak pernah mem-block. Section kosong itu diam-diam hilang dari compressed prompt (`sectionsOmitted`). |
| `referenceImageUrls` (live) = `[customerPhotoUrl, modelThobeOption?.ai_dna.metadata.sourceImage].filter(Boolean)` | route.ts (live) | Kalau Model Thobe tidak resolve (kasus kita) atau `sourceImage` null (Saudi Modern memang null) → array cuma berisi foto customer sendiri. Karena `customerPhotoUrl` wajib ada (dicek di awal route.ts), array selalu ≥1 elemen → `images.edit` **selalu** dipakai (cabang `images.generate` tanpa gambar tidak pernah tereksekusi pada kasus manapun). |
| Fetch reference image gagal / Content-Type generik | `image.ts` `fetchReferenceImageFile` (live, TANPA `input_fidelity`) | Fallback MIME: header → ekstensi URL → default `image/jpeg`. Tidak pernah gagal keras, hanya bisa salah tebak MIME. |
| OpenAI API error / timeout | `image.ts` catch block | HTTP 502 dengan pesan error OpenAI. |
| `getCachedRender(hash)` hit | `renderCache/cache.ts:25`, dipanggil di route.ts **sebelum** Supabase/DNA Resolver/Recipe Composer/OpenAI dipanggil sama sekali | Return response yang di-cache **persis seperti render sebelumnya** — Supabase TIDAK di-query ulang. Hash = `sha1(customerPhotoUrl + sorted "category:itemId" list)` (`dnaState/hash.ts:9-19`) — **TIDAK** mengikutsertakan isi `ai_dna`/`render_recipe` sama sekali. Lihat Phase 7. |

---

## PHASE 4 — OPENAI REQUEST PROOF

Tidak ada log request OpenAI sungguhan yang bisa saya baca (tidak ada akses ke Vercel runtime logs untuk request historis, dan brief melarang menjalankan render baru / mengubah state). Yang saya lakukan sebagai gantinya: **replay manual, baris-demi-baris, algoritma `compression.ts`/`composer.ts`/`builder.ts` versi LIVE (`f1c1579`) terhadap isi `ai_dna`/`render_recipe` JSON yang SEBENARNYA ada di Supabase production** (diambil langsung, lihat query di atas). Ini bukan simulasi asumtif — setiap field yang saya tulis di bawah adalah nilai kolom database yang nyata.

**Model & endpoint:** `gpt-image-1`, `client.images.edit(...)` (karena `referenceImageUrls.length > 0`, selalu true di sini).
**`input_fidelity`:** **tidak diset sama sekali** di kode live — parameter ini hanya ada di working tree, tidak pernah ter-deploy. OpenAI memakai default-nya sendiri.
**`size` / `quality`:** **tidak pernah diset** di kode manapun (live maupun working tree) — OpenAI default berlaku terus (kemungkinan besar bujur sangkar 1024×1024 auto, bukan rasio 3:4 yang ditampilkan UI).
**`input_image` yang benar-benar terkirim:** **hanya 1** — foto customer (`customerPhotoUrl`). Bukan 2 seperti disangka: Model Reference **tidak terkirim** karena Saudi Modern gagal resolve dan `sourceImage`-nya memang `null` di DB. Collar tidak pernah jadi image reference di kode live sama sekali (logika itu hanya ada di `aiAssetComposer`, yang belum live).

**`masterRecipe.garment` hasil merge nyata** (priority: Lorenzo=0, Maroon=1, Basim=2 — higher wins, tanpa Anchor-rule):

| key | pemenang | isi (ringkas) |
|---|---|---|
| `geometry` | **Basim Collar** (priority 2 > Lorenzo priority 0) | `{leafShape, collarSpread, collarLeafHeight:"6cm", standingBaseHeight:"3.5cm"}` — ini geometri **KERAH**, bukan geometri gamis |
| `construction` | **Basim Collar** | `{layers:"2-ply...", foldLine, leafEdge, anchorPoint, centerBackSeam}` — konstruksi **KERAH** |
| `appearance` | **Basim Collar** | string `"Modern formal: clean geometry, minimal detail, smooth surface, no texture manipulation"` |
| `materials` | **Basim Collar** | `{base:"White or light neutral base", type:"cotton or cotton-poly blend", drape:...}` — ini bahan **KERAH (putih)**, BUKAN Lorenzo (wool-blend), BUKAN Maroon |
| `stitching` | Lorenzo (Basim null, tidak collision) | `{stitch_type, thread_color_rule, visible_seam_treatment}` |
| `placement` | Lorenzo (Basim null) | `{relation_to_body:"...wraps around full torso, sleeves, dan body length"}` |

**Tidak ada satupun key yang menyebut**: "thobe", "gamis", "ankle-length", "138cm", "straight modern cut" — semua itu ada di `ai_dna.geometry` milik **Saudi Modern**, dan Saudi Modern di-drop total dari pipeline pada langkah `resolveDNA`.

**Bug tambahan yang ditemukan saat replay — nested object jadi `"[object Object]"` literal:**
`compression.ts` versi live (`f1c1579`) —

```ts
function stringifyRecord(record: Record<string, unknown>): string {
  return Object.entries(record)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key} ${Array.isArray(value) ? value.join('/') : String(value)}`)
    .join(', ')
}
```

`String(value)` pada sebuah objek JS menghasilkan literal `"[object Object]"`. `garment.geometry`, `garment.construction`, `garment.materials`, `garment.stitching`, `garment.placement` di atas **semuanya objek**, bukan string. Jadi isi section "Anchor" yang benar-benar terkirim ke OpenAI adalah:

```
geometry [object Object], construction [object Object], appearance Modern formal: clean geometry,
minimal detail, smooth surface, no texture manipulation, materials [object Object],
stitching [object Object], placement [object Object]; neck_angle Straight, relaxed, looking
slightly forward, chest_position Natural, symmetrical, relaxed posture, subject_orientation
Facing camera, neutral natural stance; what_is_hidden Interior seams hidden, backing details
minimal, what_is_visible Entire fabric surface, full body visible, seams visible, texture detail crisp
```

6 dari sekitar 12 pasangan key-value di bagian "Anchor" (budget token terbesar, 150 token) secara harfiah adalah string `[object Object]` — bukan asumsi, ini hasil pasti dari `String()` pada objek JS. (Perbaikan untuk bug ini SUDAH ditulis di working tree `compression.ts` — fungsi rekursif `stringifyValue` — tapi **belum pernah di-commit/deploy**.)

**`Material` section (maxTokens 15):** hanya diisi dari `masterRecipe.fabricBehavior` (satu-satunya field yang Lorenzo isi lewat `render_recipe.fabricBehavior`) — **tidak pernah menyebut "wool", "twill", "Lorenzo", atau warna apapun**, karena `fabricIdentity` tidak pernah diisi oleh komponen manapun (field ini ada di skema tapi tidak ada satupun `render_recipe` yang mengisinya), dan `dna_colors`/warna tidak pernah mencapai field manapun yang dibaca compression.ts.

**`Negatives`:** union dari `negativeRules` Lorenzo (5) + Basim (10) + Maroon (0, key tidak ada) + policy ([]), dipotong ke ~50 token.

**Kesimpulan Phase 4:** prompt akhir yang benar-benar dikirim ke `gpt-image-1` menggambarkan sebuah item dengan geometri/konstruksi/bahan **kerah putih 2-ply**, tanpa panjang/siluet gamis, tanpa kata "maroon"/warna apapun, dengan ~30% teks di section terpenting berupa sampah `[object Object]`, ditemani **hanya 1 gambar** (foto wajah customer) tanpa instruksi identity-lock apapun.

---

## PHASE 5 — MASTER DATA VALIDATION

| Komponen | Status AI DNA | Dipakai / Diabaikan | Rule yang menyebabkan |
|---|---|---|---|
| Saudi Modern (Model Thobe) | `draft` | ❌ **Diabaikan total** | Bukan status DNA-nya yang memblokir (`draft` lolos gate `pending`) — yang memblokir adalah **`render_recipe.status === 'empty'`** (`dnaResolver/resolver.ts:25-27`). AI DNA `draft` yang isinya sudah lumayan lengkap (geometry ada) tidak relevan karena Render Recipe row-nya sendiri belum pernah dikonfigurasi. |
| Lorenzo Premium Gold Class | `needs_regeneration` | ✅ Dipakai | `needs_regeneration` **tidak** ada di daftar blokir manapun di kode live — satu-satunya status yang diblokir adalah `pending`. "Needs Regeneration" murni label siklus-hidup di UI, tidak menggerbang apapun di render pipeline saat ini. |
| Basim Collar | `needs_regeneration` | ✅ Dipakai (dan mendominasi hasil — lihat Phase 4) | Sama seperti di atas. |
| Maroon | `approved` | ⚠️ "Dipakai" secara status, tapi **isinya kosong** | Lolos gate status, tapi field yang dibaca DNA Resolver (`geometry/construction/appearance/materials/stitching/placement`) tidak ada satupun di row ini — datanya ada di key lain (`tone/description/dst`) yang tidak pernah dipetakan. Bukan soal status, ini soal **skema data yang tidak match dengan yang dibaca resolver**. |

---

## PHASE 6 — RENDER DECISION REPORT

| Komponen | Dipilih Customer | Status | Masuk Prompt | Masuk OpenAI | Dipakai Render |
|---|---|---|---|---|---|
| Saudi Modern (Model Thobe) | Selected | `draft` / Recipe `empty` | **No** | No (juga bukan image reference — `sourceImage` null) | **No** |
| Lorenzo Premium Gold Class | Selected | `needs_regeneration` / Recipe `configured` | Yes (stitching, placement, sebagian fabricBehavior) | Yes (teks) | Partial (kalah collision di geometry/construction/materials/appearance) |
| Maroon | Selected | `approved` / Recipe `configured` | Yes secara status, **isi kosong** | **No — tidak ada teks warna sama sekali** | **No** |
| Basim Collar | Selected | `needs_regeneration` / Recipe `configured` | Yes — dan **menang semua collision garment** | Yes (teks) | Yes, tapi **salah label** (kerah dianggap "garment" utuh) |

---

## PHASE 7 — ROOT CAUSE (murni berdasarkan bukti di atas, belum ada solusi)

1. **Kode yang dikira aktif (Capability Engine, AI Asset Composer, DNA merge warna, Anchor collision-rule, `input_fidelity`) tidak pernah berjalan di production** — commit yang membawa semuanya (`6cab50f`) gagal build di Vercel (`ERROR`) karena mengimpor modul yang tidak pernah di-commit. Production masih menjalankan `f1c1579`, versi jauh lebih sederhana tanpa proteksi-proteksi itu.

2. **"Saudi Modern menjadi polo shirt/jeans"** — Model Thobe (satu-satunya sumber informasi siluet/panjang/potongan gamis) di-drop total dari pipeline karena `render_recipe.status = 'empty'` pada row DB-nya (bukan bug kode — `resolveDNA` bekerja sesuai desainnya). Tidak ada fallback/default apapun untuk siluet garmen di level manapun (`DEFAULT_GLOBAL_RENDER_POLICY` semuanya objek kosong). Prompt akhir yang terkirim ke `gpt-image-1` sama sekali tidak menyebut "thobe/gamis/ankle-length" — GPT-Image lalu menebak bebas berdasarkan foto + teks "kerah putih formal modern" yang tersisa, dan hasilnya bisa berupa item generik apa saja termasuk polo/kemeja kasual.

3. **"Warna Maroon tidak dipakai"** — dua penyebab independen: (a) fitur yang seharusnya menyuntikkan `dna_colors.prompt` ke `warna_bahan.ai_dna.appearance` belum pernah live (bagian dari commit `6cab50f` yang gagal deploy); (b) terlepas dari itu, row Maroon di DB tidak punya satupun field yang dibaca `AI_DNA_GARMENT_FIELDS`/`RECIPE_RECORD_FIELDS` — teks warna sesungguhnya ("Deep maroon... #800020...") tersimpan di key `description`/`rendering_approach` yang tidak pernah dibaca modul manapun di pipeline ini, live atau tidak.

4. **"Wajah customer berubah"** — kombinasi tiga faktor yang semuanya terbukti dari kode live: (a) tidak ada satupun instruksi identity-preservation di prompt manapun dalam kode yang live (teks itu hanya ada di `aiAssetComposer`, tidak pernah deploy); (b) `input_fidelity` tidak pernah diset pada `images.edit` di kode live, jadi OpenAI memakai default fidelity-nya sendiri terhadap foto customer; (c) hanya 1 gambar (foto customer) dikirim tanpa gambar acuan model apapun, dan prompt teks yang menyertainya rusak (`[object Object]` × 6, salah label kerah-sebagai-garment) sehingga sinyal yang diterima GPT-Image untuk "pertahankan wajah, ubah pakaian saja" jauh lebih lemah daripada seharusnya.

5. **Bug tambahan yang terbukti sepanjang jalan** (bukan pemicu utama 4 gejala di atas, tapi nyata dan berkontribusi):
   - `compression.ts` live: `stringifyRecord` tidak rekursif → setiap field DNA berbentuk objek (mayoritas field di `ai_dna`) menjadi literal `"[object Object]"` di prompt asli, bukan cuma untuk kasus ini.
   - `RECIPE_RECORD_FIELDS` di Recipe Composer tidak termasuk `background`/`quality` per-komponen — data kualitas render (mis. "Ultra high definition 4K" milik Lorenzo) tidak pernah terbaca sama sekali, hanya `GlobalRenderPolicy` (kosong) yang dipakai.
   - Render Cache (`renderCache/cache.ts`) di-key oleh `sha1(customerPhotoUrl + kategori:itemId)` saja — **tidak mengikutsertakan isi `ai_dna`/`render_recipe` sama sekali**. Kalau kombinasi ID yang sama pernah berhasil di-render sebelumnya (di server instance yang sama, sebelum cold start), request berikutnya dengan ID yang sama akan mengembalikan hasil lama walau Master Data sudah diedit — ini penjelasan konkret untuk keluhan **"AI Asset Master Data terlihat tidak berpengaruh."**
   - DNA Resolver memetakan SETIAP kategori (Model/Collar/Cuff/Pocket/dst) ke key `garment` yang sama persis (`geometry/construction/appearance/materials/stitching/placement`), dan Recipe Composer versi live tidak punya proteksi collision berbasis kategori — komponen manapun dengan priority tertinggi bisa "menimpa" identitas garmen milik komponen lain, seperti terbukti di kasus Basim Collar vs Lorenzo di atas.

---

## PHASE 8 — FIX PLAN (baru sekarang, setelah root cause)

### P0 — Harus diperbaiki
1. **Perbaiki build `6cab50f` sebelum apapun lain** — commit modul `capabilityEngine/`, `aiAssetComposer/`, `promptArchitectureV2/` yang saat ini untracked, atau revert import-nya, supaya `next build` tidak gagal lagi. Sampai ini beres, setiap perbaikan lain yang ditulis di working tree **tidak akan pernah ikut ter-deploy**.
2. **Isi `render_recipe` Saudi Modern** (status masih `empty`) — tanpa ini, Model Thobe manapun yang statusnya sama akan selalu di-drop total dari render, apapun perbaikan lain yang dilakukan.
3. **Perbaiki skema data Maroon** (dan kemungkinan seluruh `warna_bahan`) supaya kontennya benar-benar ada di field yang dibaca `AI_DNA_GARMENT_FIELDS` — via jalur `dna_colors` merge (setelah P0.1 beres) atau langsung isi `ai_dna.appearance` row warna itu sendiri.
4. **Namespace `garment` per kategori** di Recipe Composer (mis. `garment.model.geometry` vs `garment.kerah.geometry`) atau kembalikan Anchor-rule (Model Thobe selalu menang) — supaya kerah tidak pernah lagi menimpa identitas garmen utuh seperti terbukti di Phase 4.

### P1 — Penting
5. Perbaiki `compression.ts` `stringifyRecord` supaya rekursif (perbaikannya sudah ada di working tree, tinggal ikut ter-commit setelah P0.1).
6. Ubah kunci Render Cache (`dnaState/hash.ts`) supaya ikut memasukkan `updated_at`/versi `ai_dna` & `render_recipe`, bukan cuma ID komponen — supaya edit Master Data langsung terlihat efeknya tanpa perlu cold start server.
7. Set `input_fidelity: "high"` pada `images.edit` (sudah ditulis di working tree, tinggal ikut commit) dan tambahkan instruksi identity-preservation eksplisit di prompt live (saat ini instruksi itu hanya ada di kode `aiAssetComposer` yang belum live).
8. Alirkan `quality`/`background` per-komponen ke Recipe Composer (saat ini `RECIPE_RECORD_FIELDS` mengabaikannya total, hanya baca dari `GlobalRenderPolicy` yang kosong).

### P2 — Penyempurnaan
9. Set `size`/`quality` eksplisit di `images.edit`/`images.generate` supaya rasio gambar (3:4 sesuai UI) tidak bergantung ke default OpenAI.
10. Tambahkan CI check yang menjalankan `next build` sebelum push ke `main`, supaya kegagalan seperti `6cab50f` terdeteksi sebelum push, bukan setelah baca dashboard Vercel.
11. Pertimbangkan validasi eksplisit "Render Recipe status = empty" sebagai warning yang tampil ke Fitter di Design Studio (bukan cuma di `componentsMissing` JSON) supaya kejadian "Model Thobe di-drop diam-diam" terlihat sebelum render, bukan sesudah.
