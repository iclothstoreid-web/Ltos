# Sprint PR-04 — Prompt Compression Refactor Report

Build: `tsc --noEmit` 0 error, `npm run build` ✓ Compiled successfully. Belum di-commit.

## Apa yang diubah
Hanya `src/lib/design/promptBuilder/compression.ts` (fungsi lama `compressPrompt`/`buildCompressedSections`/`PromptSection` dipertahankan utuh — masih dipakai `promptArchitectureV2/layers.ts` untuk V2/debug tooling), `src/app/api/design/render/route.ts` (ganti pemanggilan compression lama ke yang baru, tambah gate Phase 4/5), dan `src/lib/types/render.ts` + `src/lib/services/renderService.ts` (field respons `promptCompression.totalTokens` → `promptTotalTokens`, konsekuensi langsung dari perubahan compression, bukan perubahan terpisah). Tidak menyentuh DNA, Resolver, Recipe Composer, Master Data, atau AI Engine (model/input_fidelity/dsb tetap sama persis).

## Arsitektur baru
Layer dibangun dari `entries` (output DNA Resolver **sebelum** digabung Recipe Composer) — bukan dari `MasterRenderRecipe` yang sudah rata. Ini penting: setiap Layer sekarang benar-benar berasal dari SATU kategori saja (Model Thobe / Look Cutting / Material / Material Color terpisah sempurna), sehingga tabrakan key yang menyebabkan Maroon hilang tidak mungkin lagi terjadi di prompt yang dikirim — sama sekali tanpa menyentuh aturan Anchor di Recipe Composer (yang tetap dipakai, tidak berubah, untuk `MasterRenderRecipe`/`serializeOpenAI` yang lama).

7 layer: Identity Lock, Model Thobe, Look Cutting, Material, Material Color (semua Priority 0 — tidak pernah dipotong), Selected Components per kategori yang benar-benar dipilih (Priority 1, skip otomatis untuk None), Visual Description (camera/lighting/composition/background/quality/pose/negativeRules, Priority 2 — dipotong duluan).

`compressPromptByLayers`: Priority 0 selalu utuh; sisa budget diberikan ke Priority 1 dulu (baru dipotong/dibuang kalau kurang), sisanya lagi ke Priority 2. Kalau Priority 0 saja sudah melebihi budget walau Priority 1+2 dibuang total → `ok:false`, render dibatalkan dengan pesan jelas (Phase 4), TIDAK PERNAH memotong Priority 0.

`validatePriorityZeroIntact` (Phase 5): dipanggil di route.ts tepat sebelum `generateImage` — kalau salah satu dari Identity/Model Thobe/Material/Material Color (dan Look Cutting kalau memang dipilih customer, bukan None) tidak `included` di layer report, request dibatalkan sebelum sampai ke OpenAI.

## Temuan penting: budget 270 token sudah tidak realistis
Regression test (data real Saudi Modern pasca sprint sebelumnya) membuktikan Priority 0 SAJA sudah butuh ~620-660 token — budget lama (270) akan membuat SETIAP render gagal sekarang, bukan cuma kadang kehilangan Maroon. Saya naikkan default budget compression ke **1200 token** (dijelaskan di kode: diukur dari kebutuhan nyata P0 + ruang untuk 1 Selected Component + Visual Description; GPT-image-1 sendiri tidak punya batas prompt sedekat ini). Ini murni parameter algoritma compression, tidak menyentuh model/AI Engine.

## Regression Test (Phase 6) — dijalankan nyata, bukan hand-trace
Skenario: Saudi Modern + Slim Fit (sintetis — Look Cutting nyata masih 0 row per Sprint PR-03) + Lorenzo + Maroon + Rounded Collar (Basim).

```
Layer            Token  Priority  Included
Identity Lock     34    0         true
Model Thobe      348    0         true
Look Cutting      38    0         true
Material         146    0         true
Material Color    94    0         true
Kerah             76    1         true
Visual Desc      250    2         true

Phase 5 validation: valid=true, missing=[]
Final prompt (~986 token) — semua berikut TERBUKTI ada:
  Model masuk: true | Material masuk: true | Color masuk: true
  Collar masuk: true | Identity masuk: true | Look Cutting masuk: true
```

Kombinasi nyata saat ini (tanpa Look Cutting, karena memang belum ada datanya) juga diverifikasi: Model/Material/Color/Collar/Identity semua masuk, Look Cutting benar-benar 0 token dan TIDAK dianggap error (karena tidak pernah dipilih — bukan kehilangan, memang None).

## Success Criteria
✅ Identity/Model/Look Cutting/Material/Material Color tidak lagi bisa hilang karena compression — dijamin secara algoritmik (Priority 0 tidak pernah dipotong), bukan cuma kebetulan muat.
✅ Kalau budget tidak cukup, request gagal dengan alasan jelas (Phase 4/5), tidak lagi menghapus informasi diam-diam.
