# Sprint PR-01 — Production Recovery Report

Fix-only sprint. Tidak ada fitur baru, tidak ada arsitektur baru, tidak ada perubahan skema database, tidak ada perubahan business workflow/UI. **Belum di-commit / belum di-deploy** — menunggu konfirmasi Anda (lihat penutup laporan).

---

## 1. BUILD BERHASIL

```
npx tsc --noEmit -p tsconfig.json   → 0 error
npm run build                       → ✓ Compiled successfully, 44/44 halaman ter-generate
```

Sebelum sprint ini: commit HEAD (`6cab50f`) gagal build di Vercel (`state: ERROR`) karena `route.ts` meng-import 3 modul yang tidak pernah ter-commit (`capabilityEngine/`, `aiAssetComposer/`, `promptArchitectureV2/`). Modul-modul itu sudah ada di working tree (belum pernah rusak secara internal) — begitu tsc/next build dijalankan terhadap working tree lengkap, hanya ditemukan 2 error, keduanya **tidak berkaitan dengan render pipeline**: import `OrderSnapshot` (sebuah `interface`) yang dipakai sebagai runtime value di `src/app/workspace/order-created/[orderId]/page.tsx` (sisa pekerjaan Milestone B yang belum selesai). Diperbaiki dengan mengubah dynamic import menjadi `import type` biasa — 2 baris, tanpa efek runtime apapun.

**Kesimpulan P0:** build sudah hijau. Begitu commit ini dibuat dan di-push, Vercel akan berhasil deploy — tidak ada lagi "Module not found."

---

## 2. SEMUA BUG YANG DIPERBAIKI

| # | Bug (dari audit sebelumnya) | Status sekarang |
|---|---|---|
| P0 | Build gagal karena modul tak pernah di-commit | ✅ Diverifikasi build bersih; tinggal commit (belum saya lakukan) |
| P1 | Dead reference ke modul yang "tidak pernah ada" | ✅ Modul-modul itu memang valid TypeScript, tidak ada dead path — begitu ter-commit, path UI→...→OpenAI utuh dan konsisten |
| P2 | `compression.ts` `stringifyRecord` tidak rekursif → `"[object Object]"` literal di prompt | ✅ Sudah diperbaiki (sebelum sprint ini, di working tree) — dikonfirmasi ulang, tidak ada regresi |
| P3 | Model Thobe yang gagal resolve di-drop diam-diam, render lanjut jadi generik | ✅ Diperbaiki — sekarang **hard block** dengan pesan jelas |
| P4 | Resolver tidak membaca field yang benar-benar dipakai DNA Warna (mis. Maroon) | ✅ Diperbaiki — fallback baca `description`/`tone`/`undertone`/`brightness`/`saturation` langsung dari jsonb `ai_dna`, plus merge `dna_colors` yang sudah ada tetap dipertahankan |
| P5 | Tidak ada instruksi identity-lock aktif; `input_fidelity` tidak pernah dikirim | ✅ `input_fidelity: "high"` dikonfirmasi sudah ada; instruksi identity-lock (`LAYER1_IDENTITY_TEMPLATE`, sudah dirancang sebelumnya tapi tak pernah dipakai) sekarang diaktifkan — selalu disisipkan ke prompt akhir |
| P6 | Reference image (Hero Image) tidak pernah divalidasi terhadap Render Recipe; kegagalan silent | ✅ Diperbaiki — gate sekarang juga mensyaratkan Render Recipe valid; alasan gagal/berhasil dilaporkan eksplisit di response (`referenceImageStatus`) |
| P7 | Render Cache key tidak memperhitungkan isi AI DNA/Render Recipe — edit Master Data bisa tak berefek | ✅ Diperbaiki — cache key sekarang menyertakan `ai_dna.version`/`render_recipe.version`; `version` juga sekarang benar-benar naik setiap DNA diubah (sebelumnya field ini tidak pernah di-increment) |
| P8 | Silent fallback untuk komponen wajib yang gagal resolve | ✅ Diperbaiki — SEMUA komponen yang dipilih customer (bukan hanya Model Thobe/Material) sekarang wajib resolve atau render berhenti dengan alasan jelas |

### Verifikasi langsung terhadap kasus yang dilaporkan (Saudi Modern / Lorenzo / Maroon / Basim Collar)

Saya menjalankan ulang logika baru terhadap data production yang sama (belum berubah di DB):

- **Saudi Modern**: `ai_dna.status = draft` tapi `construction/appearance/stitching/placement` masih `null` → `validateComponentDna` menilai **tidak valid** → render sekarang **berhenti dengan HTTP 422**, pesan: *"AI Design DNA utama (Model Thobe) kosong/tidak valid."* — BUKAN lagi diam-diam menghasilkan gambar generik.
- Ini berarti kombinasi PERSIS yang Anda laporkan **tidak akan lagi menghasilkan render yang salah** — ia akan menghasilkan error yang jelas, sampai Master Data Saudi Modern benar-benar dilengkapi (`ai_dna` 4 field yang masih kosong + `render_recipe` yang masih `empty`). **Itu adalah pekerjaan data, bukan kode**, dan sengaja tidak saya sentuh (di luar scope "no database redesign/no business rule change").
- **Maroon**: begitu Saudi Modern (atau Model Thobe lain) sudah lengkap dan render benar-benar jalan, warna Maroon akan ikut terbawa — baik lewat merge `dna_colors.prompt` yang sudah ada (Maroon punya `dna_color_id` valid) maupun lewat fallback resolver baru (P4) yang membaca `description` langsung.

---

## 3. FILE YANG BERUBAH (oleh saya, sprint ini)

| File | Jenis perubahan |
|---|---|
| `src/app/api/design/render/route.ts` | Restrukturisasi: fetch Supabase dipindah sebelum hash cache (P7); `unresolvedComponents` dialirkan ke Capability Engine (P3/P8); `validateModelReferenceAvailable`/`validateCollarReference` dipanggil & dilaporkan (P6); `LAYER1_IDENTITY_TEMPLATE` disisipkan ke prompt akhir (P5) |
| `src/lib/design/capabilityEngine/engine.ts` | Tambah field `unresolvedComponents` pada input + kondisi BLOCKED baru (P3/P8) |
| `src/lib/design/dnaResolver/resolver.ts` | Tambah `colorDescriptionFallback` untuk `warna_bahan` (P4) |
| `src/lib/design/aiAssetComposer/composer.ts` | `isAiAssetActive` sekarang juga mensyaratkan `render_recipe.status !== 'empty'`; `validateAiAssetAvailable` melaporkan alasan Render Recipe (P6) |
| `src/lib/design/aiDna/types.ts` | `markDnaGenerated`/`markDnaApproved`/`markDnaNeedsRegeneration` sekarang menaikkan `version` (P7) |
| `src/lib/design/dnaState/types.ts` | `DnaStateComponent` dapat field opsional `dnaVersion`/`recipeVersion` (P7) |
| `src/lib/design/dnaState/hash.ts` | `hashDnaState` menyertakan `dnaVersion`/`recipeVersion` (P7) |
| `src/app/api/design/render/debug/route.ts` | Diteruskan `unresolvedComponents` supaya tetap kompatibel dengan `evaluateCapability` yang sudah berubah signature-nya (bukan perbaikan bug, hanya menjaga tool debug tetap kompilasi) |
| `scripts/render-test-runner.ts` | Sama seperti di atas — menjaga kompatibilitas tipe |
| `src/app/workspace/order-created/[orderId]/page.tsx` | 2 baris: `OrderSnapshot` diimpor sebagai `import type` (bukan dynamic import runtime) — perbaikan build, tidak berkaitan dengan render pipeline (P0) |

**Tidak saya sentuh** (sudah dalam kondisi "M" sebelum sprint ini dimulai, dari pekerjaan lain yang sedang berjalan — Milestone B multi-garment, dsb): `TODO.md`, `package.json`, `package-lock.json`, `src/app/command-center/page.tsx`, `src/components/master-data/AiDesignDnaSection.tsx`, `src/components/workspace/measurement/PhotoUploader.tsx`, `src/lib/order/createOrder.ts`. File-file `promptBuilder/compression.ts`, `promptBuilder/serializer.ts`, `recipeComposer/composer.ts`, `recipeComposer/types.ts`, `src/lib/ai/services/image.ts` **sudah membawa perbaikan P2/P5 (rekursif stringify, Anchor-rule Model Thobe, `input_fidelity: high`) sebelum sprint ini dimulai** — saya verifikasi ulang isinya, tidak menulis ulang.

---

## 4. ALASAN SETIAP PERUBAHAN

- **Urutan fetch dipindah sebelum hash (route.ts)** — cache key butuh `ai_dna.version`/`render_recipe.version` untuk benar-benar mendeteksi perubahan Master Data (P7); versi itu hanya bisa didapat setelah query Supabase, jadi query harus jalan dulu. Konsekuensinya: cache hit tidak lagi 100% melewatkan Supabase (hanya melewatkan DNA Resolver→...→OpenAI, bagian yang jauh lebih mahal). Trade-off ini didokumentasikan di komentar kode.
- **`unresolvedComponents` di Capability Engine** — satu-satunya cara membuat "komponen gagal resolve" menjadi hard-block TANPA membongkar arsitektur PREMIUM/HIGH/STANDARD/LIMITED yang sudah ada: kondisi BLOCKED diperluas, bukan diganti. Komponen yang BERHASIL resolve tapi sebagian DNA-nya belum lengkap tetap mengikuti grading lama (LIMITED/STANDARD) — hanya komponen yang GAGAL TOTAL resolve yang sekarang menghentikan render.
- **`colorDescriptionFallback`** — dilakukan di level resolver (bukan hanya di route.ts) supaya berlaku untuk SEMUA `warna_bahan`, bukan hanya yang kebetulan punya `dna_color_id`. Membaca field lewat cast `Record<string, unknown>`, bukan menambah field baru ke `AiDesignDna` — skema DNA tidak berubah, resolver hanya dibuat toleran terhadap key ekstra yang jsonb memang sudah izinkan.
- **`isAiAssetActive` + render_recipe check** — brief eksplisit meminta 3 syarat (Approved, Hero Image, Render Recipe valid); kode sebelumnya hanya mengecek 2 dari 3.
- **`version` bump di aiDna/types.ts** — field `version` sudah ada di skema sejak awal justru untuk keperluan seperti ini, tapi tidak pernah benar-benar dipakai (selalu 1). Menaikkannya di 3 titik transisi (generate/approve/needs-regeneration) adalah memperbaiki implementasi yang belum selesai, bukan menambah struktur baru.
- **`LAYER1_IDENTITY_TEMPLATE` diaktifkan** — brief P5 secara eksplisit bilang "aktifkan implementation yang memang sudah dirancang, ini bug fix bukan fitur baru." Template ini sudah ditulis di `promptArchitectureV2/layers.ts` sejak Sprint AI-R2.5 tapi tidak pernah dipanggil dari `route.ts` — saya hanya menyambungkannya, tidak menulis arsitektur 4-layer baru (yang secara eksplisit didokumentasikan modul itu sendiri sebagai "keputusan masa depan, bukan sprint ini").

---

## CATATAN PENTING SEBELUM DEPLOY

1. **Perubahan ini BELUM di-commit dan BELUM di-push** — sesuai instruksi "FIX ONLY", saya tidak mengasumsikan Anda ingin langsung commit/deploy. Beri tahu saya jika Anda ingin saya:
   - commit semua perubahan file di atas (plus modul `capabilityEngine/`, `aiAssetComposer/`, `promptArchitectureV2/`, `renderQuality/` yang saat ini masih untracked — supaya build production benar-benar punya modul yang diimpor `route.ts`), atau
   - commit sebagian saja / Anda commit sendiri.
2. **Perilaku baru akan terlihat lebih "ketat"**: kombinasi Saudi Modern + Lorenzo + Maroon + Basim Collar sekarang akan gagal dengan pesan error (bukan gambar salah) sampai Master Data Saudi Modern dilengkapi. Ini disengaja (P3/P8), tapi berarti akan ada lebih banyak render yang BLOCKED di production sampai tim Master Data mengejar ketertinggalan data DNA — sepadan dengan tujuan sprint ("jangan biarkan GPT mengarang sendiri").
3. Belum saya jalankan render sungguhan ke OpenAI (butuh API call berbayar) — verifikasi di atas murni dari trace kode + data Supabase real, sama seperti audit sebelumnya.
