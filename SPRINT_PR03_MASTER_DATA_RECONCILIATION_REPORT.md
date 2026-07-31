# Sprint PR-03 — Master Data Reconciliation Report

Data-only sprint. **Tidak ada kode yang diubah** (dikonfirmasi: `git status` menunjukkan nol file kode tersentuh, `tsc --noEmit` tetap 0 error persis seperti sebelum sprint ini dimulai). Semua perubahan adalah `UPDATE` SQL langsung ke Supabase project `ltos-v1`. Tidak ada Hero Image yang diganti, tidak ada AI Design DNA yang di-regenerate — hanya isi yang SUDAH ADA dipindahkan/diselaraskan ke kolom yang benar-benar dibaca pipeline production.

---

## PHASE 1 — MASTER DATA INVENTORY (real, dari Supabase, sebelum perbaikan)

| Kategori | Total | Aktif | DNA pending | DNA lain (draft/needs_regen/approved) | Recipe empty | Recipe configured |
|---|---|---|---|---|---|---|
| Model Thobe | 1 | 1 | 0 | 1 (draft) | **1** | 0 |
| Kerah (Collar) | 7 | 7 | 6 | 1 (needs_regen) | 6 | 1 |
| Manset (Cuff) | 3 | 3 | 2 | 1 (needs_regen) | 2 | 1 |
| Plaket | 2 | 2 | 0 | 2 (approved) | 0 | 2 |
| Saku (Pocket) | 1 | 1 | 0 | 1 (approved) | 0 | 1 |
| Bahan (Material) | 5 | 5 | 4 | 1 (needs_regen) | 4 | 1 |
| Warna Bahan (Color) | 5 | 5 | 1 | 4 (approved) | 1 | 4 |
| Bordir (Embroidery) | 1 | 0 | 1 (placeholder "None") | — | 1 | 0 |
| Handmade Zig-Zag | 1 | 0 | 1 (placeholder "None") | — | 1 | 0 |
| **Look Cutting** | **0** | **0** | — | — | — | — |
| **Aksesori** | **0** | **0** | — | — | — | — |

Bordir/Handmade Zig-Zag: 1 row "None" tidak aktif masing-masing — ini **desain yang disengaja** (sentinel "(None)" dari sprint sebelumnya, bukan gap). Look Cutting dan Aksesori: **nol row sama sekali**, termasuk tidak ada placeholder — dibahas di bawah.

---

## PHASE 2 — SCHEMA RECONCILIATION

Ditemukan **satu kelas bug data nyata**, memengaruhi 4 dari 5 `warna_bahan`:

**Temuan:** Setiap `warna_bahan` row (Black/Maroon/Navy/Putih Clean) sudah punya teks deskripsi warna yang kaya dan benar di kolom `design_master_options.ai_dna` miliknya sendiri (field ad-hoc `description/tone/undertone/brightness/saturation` — bukan bug, ini legacy authoring style dari sebelum `dna_colors` ada). Tapi route.ts (`/api/design/render`) yang sudah diperbaiki di Sprint PR-01 **tidak pernah membaca field-field itu** — ia membaca `dna_colors.prompt` (tabel terpisah, linked via `dna_color_id`), dan hanya fallback ke `character/family/hex` kalau `prompt` kosong. Karena **`dna_colors.prompt` kosong untuk SEMUA 5 warna** (hanya `hex`/`family` yang terisi), pipeline production hanya pernah mengirim teks sangat tipis seperti `"red-maroon, #800020"` ke OpenAI — bukan paragraf deskriptif yang sebenarnya sudah ada.

Ini persis kategori "tidak pernah dibaca resolver" yang diminta Phase 2 — kontennya SUDAH ADA (ditulis manusia), hanya berada di kolom yang salah untuk skema production saat ini.

**Fix**: salin verbatim (tanpa mengedit satu kata pun) teks `description` dari `design_master_options.ai_dna` ke `dna_colors.prompt` untuk 4 warna:

| Warna | dna_colors.id | Aksi |
|---|---|---|
| Black | f8eddbd3-... | prompt diisi dari ai_dna.description milik row Black, version 1→2 |
| Maroon | 2d5fcf99-... | prompt diisi dari ai_dna.description milik row Maroon, version 1→2 |
| Navy | 60eb3811-... | prompt diisi dari ai_dna.description milik row Navy, version 1→2 |
| Putih Clean | 073cf829-... | prompt diisi dari ai_dna.description milik row Putih Clean, version 1→2 |

Broken White **tidak disentuh** — row-nya sendiri genuinely `pending`/kosong total, tidak ada teks apapun untuk dipindahkan (bukan bug mapping, memang belum pernah diisi).

Kategori lain (Model Thobe, Kerah, Manset, Bahan, Plaket, Saku) diperiksa satu per satu — **tidak ditemukan kasus serupa** (field salah nama/salah nesting). Field yang kosong pada baris-baris `pending` (Hermes/Mark Jacobs/Sharkskin/Supreme bahan; Doruk/Haybah/Hilal/Sudas/Waqar/Zirve kerah; Asil/Hilal manset) genuinely kosong di semua tempat — tidak ada konten tersembunyi untuk dipindahkan.

---

## PHASE 3 — RENDER RECIPE

Kriteria pencarian: `render_recipe.status = 'empty'` PADAHAL `ai_dna.status ≠ 'pending'` (artinya sudah ada yang di-generate). Hasil scan seluruh 26 row: **hanya 1 row yang cocok** — **Saudi Modern** (`ai_dna.status = 'draft'`, tapi `render_recipe.status = 'empty'`). Semua row `pending` lain punya `render_recipe.status = 'empty'` juga — itu konsisten (belum ada apapun untuk keduanya), bukan kasus yang Phase 3 minta diperbaiki.

**Fix**: `render_recipe.status: 'empty' → 'configured'`, `version: 1 → 2`, untuk Saudi Modern. Field struktural render_recipe lain (camera/pose/lighting/dst) **sengaja dibiarkan `{}`** — tidak ada informasi "cara merender" apapun yang sudah ada di ai_dna Saudi Modern untuk dipindahkan ke sana (ai_dna-nya berisi identitas garmen, bukan instruksi kamera/pencahayaan); mengisi field itu dengan teks baru akan melanggar "JANGAN generate ulang". Ini juga konsisten dengan pola yang SUDAH ADA di katalog — Basim Collar dan Maroon pun punya `render_recipe.status = 'configured'` dengan field camera/pose/lighting yang sama-sama kosong.

**Target Phase 3 tercapai**: tidak ada lagi komponen dengan `ai_dna` yang sudah pernah di-generate tapi `render_recipe = empty`.

---

## PHASE 4 — READY FOR RENDER (per komponen, setelah fix; diverifikasi via eksekusi kode nyata)

Definisi READY dipakai persis seperti yang benar-benar di-gate oleh pipeline (bukan checklist ideal): `ai_dna.status ≠ 'pending'` DAN `render_recipe.status ≠ 'empty'` (resolveDNA) DAN, khusus Model Thobe, `validateComponentDna` (6 field wajib + sub-key geometry) juga harus valid — kategori lain hanya butuh field wajib kategorinya sendiri (lebih ringan, lihat `DNA_REQUIRED_FIELDS_BY_CATEGORY`).

| Komponen | Kategori | READY? | Alasan |
|---|---|---|---|
| Saudi Modern | model_thobe | ❌ **NOT READY** | `render_recipe` sudah diperbaiki (kini `configured`), TAPI `ai_dna.construction/appearance/stitching/placement` masih `null` — dan Model Thobe (Anchor) satu-satunya kategori yang mewajibkan keenam field ini lengkap. Tidak ada teks apapun di baris ini atau di manapun di codebase untuk dipindahkan ke 4 field itu tanpa mengarang konten baru. |
| Basim Collar | kerah | ✅ **READY** | `geometry`+`construction` (satu-satunya yang diwajibkan kategori kerah) lengkap. `resolveDNA` sukses. |
| 6 Collar lain (Doruk/Haybah/Hilal/Sudas/Waqar/Zirve) | kerah | ❌ NOT READY | Genuinely `pending`, belum pernah di-generate — tidak ada yang bisa direkonsiliasi. |
| Lorenzo Premium Gold Class | bahan | ✅ **READY** | `appearance`+`materials` lengkap. |
| 4 Material lain | bahan | ❌ NOT READY | Genuinely `pending`. |
| Maroon | warna_bahan | ✅ **READY** (setelah fix Phase 2) | `appearance` kini terisi via `dna_colors.prompt` yang baru diperbaiki. |
| Black, Navy, Putih Clean | warna_bahan | ✅ **READY** (setelah fix Phase 2) | Sama seperti Maroon. |
| Broken White | warna_bahan | ❌ NOT READY | Genuinely `pending`, tidak ada konten di manapun. |
| Sudas Cuff | manset | ✅ READY | `geometry`+`construction` lengkap. |
| Asil Cuff, Hilal Cuff | manset | ❌ NOT READY | Genuinely `pending`. |
| Plaket Hexagonal, Plaket Straight Formal | plaket | ✅ READY | Sudah lengkap + approved sejak sebelumnya. |
| Patch Pocket Topstitched Medium | saku | ✅ READY | `geometry`+`construction` lengkap. |
| — | look_cutting | ❌ **TIDAK ADA DATA SAMA SEKALI** | Nol row di database untuk kategori ini. Tidak ada yang bisa direkonsiliasi — ini bukan data yang salah letak, komponennya belum pernah dibuat. |
| — | aksesori | ❌ **TIDAK ADA DATA SAMA SEKALI** | Sama seperti Look Cutting. |

---

## PHASE 5 — END TO END VALIDATION

Dijalankan nyata (modul asli dieksekusi, bukan hand-trace) terhadap data production **setelah** fix Phase 2/3 di atas, untuk kombinasi: Saudi Modern + Basim Collar (Rounded) + Lorenzo Premium Gold Class + Maroon.

**1. DNA Resolver Output** — keempatnya sekarang `ready: true` (sebelumnya Saudi Modern gagal karena Render Recipe empty; sekarang lolos):
```
Saudi Modern:  ready=true, garmentKeys=[geometry, materials]
Lorenzo:       ready=true, garmentKeys=[geometry, construction, appearance, materials, stitching, placement]
Maroon:        ready=true, garmentKeys=[color]   ← key "color" sendiri (fix Sprint PR-01/02), bukan "appearance"
Basim Collar:  ready=true, garmentKeys=[geometry, construction, appearance, materials]
```

**2. Recipe Composer Output / 3. Prompt Builder Output / 4. Reference Image List / 5. Final Prompt** — **tidak tercapai**, karena render berhenti SATU LANGKAH SEBELUM Recipe Composer:

```
validateComponentDna(Saudi Modern): valid=false
  missingFields: [construction, appearance, stitching, placement]
  subKeyCheck: geometry tidak memiliki: length, sleeve, construction, collar.
capability.mode: BLOCKED
capability.blockedReason: "AI Design DNA utama (Model Thobe) kosong/tidak valid."
>>> RENDER BLOCKED, stopping before Recipe Composer.
```

**Presence check yang diminta brief** ("Pastikan Saudi Modern muncul, Collar muncul, Material muncul, Maroon muncul"): **tidak berlaku** — tidak ada prompt yang dihasilkan sama sekali karena render berhenti di gerbang Capability Engine sebelum Recipe Composer/Prompt Builder pernah dipanggil. Ini bukan kegagalan Recipe Composer/Prompt Builder (keduanya terbukti bekerja benar di Sprint PR-01/PR-02 dengan data sintetis) — ini murni karena Model Thobe gagal lolos validasi DNA-nya sendiri.

**Brief meminta: "Jika ada yang hilang, perbaiki DATA, bukan kode."** — Sudah dicoba sesuai rule. Data yang **bisa** diperbaiki tanpa mengarang konten baru (render_recipe status, mapping warna) sudah diperbaiki (Phase 2/3 di atas). Yang tersisa (`construction/appearance/stitching/placement` Saudi Modern) **genuinely tidak ada di manapun** untuk dipindahkan — memperbaikinya memerlukan menulis kalimat deskriptif baru tentang gamis ini, yang eksplisit dilarang sprint ini ("DILARANG regenerate AI Design DNA"). Saya tidak mengarang teks itu.

---

## PHASE 6 — FINAL REPORT

### 1. Data yang diperbaiki
- `dna_colors.prompt` untuk **Black, Maroon, Navy, Putih Clean** — disalin verbatim dari `design_master_options.ai_dna.description` milik masing-masing row (teks manusia yang sudah ada, bukan tulisan baru). Version masing-masing naik 1→2.
- `design_master_options.render_recipe` untuk **Saudi Modern** — `status: empty → configured`, `version: 1 → 2`.

### 2. Kenapa sebelumnya tidak terbaca
- **Warna (Black/Maroon/Navy/Putih Clean)**: pipeline production (route.ts, hasil Sprint PR-01) membaca warna dari `dna_colors.prompt` dulu, baru fallback ke `character/family/hex`. Deskripsi kaya yang sudah ditulis manusia tersimpan di kolom lain (`design_master_options.ai_dna.description`) yang **tidak pernah dibaca jalur ini** — bukan salah tulis, hanya berada di tabel/kolom yang tidak sesuai dengan skema yang benar-benar dibaca kode production saat ini.
- **Saudi Modern**: `ai_dna.status` (`draft`) sudah cukup untuk lolos gerbang `resolveDNA`, tapi `render_recipe.status` masih `empty` sejak dibuat — item ini AI Design DNA-nya sudah pernah "digenerate" (draft) namun Render Recipe-nya sendiri belum pernah disentuh/dikonfigurasi sama sekali, sehingga tetap gagal sampai statusnya diselaraskan.

### 3. Komponen yang sekarang READY FOR RENDER
Model Thobe: **tidak ada** (Saudi Modern satu-satunya row, masih blocked — lihat #4).
Kerah: **Basim Collar**. Manset: **Sudas Cuff**. Bahan: **Lorenzo Premium Gold Class**. Warna Bahan: **Black, Maroon, Navy, Putih Clean**. Plaket: **Plaket Hexagonal, Plaket Straight Formal**. Saku: **Patch Pocket Topstitched Medium**.

### 4. Komponen yang masih BLOCKED
- **Saudi Modern** (Model Thobe) — `ai_dna.construction/appearance/stitching/placement` masih `null`, tidak ada konten yang bisa dipindahkan dari manapun. Ini **satu-satunya Model Thobe yang ada di catalog**, jadi selama ini belum terisi, **tidak ada kombinasi apapun yang melibatkan Model Thobe bisa mencapai READY** — bukan hanya kombinasi yang diminta brief. Membutuhkan pengisian konten baru (bukan pekerjaan data-reconciliation) oleh tim Design/Owner, di luar rule sprint ini.
- 6 Collar lain, 4 Material lain, 2 Cuff lain, Broken White — genuinely belum pernah diisi (`pending`), tidak ada yang direkonsiliasi karena tidak ada yang bisa dipindahkan.
- **Look Cutting ("Slim Fit") dan Aksesori** — nol row di database sama sekali. Bukan data yang salah tempat; komponennya belum pernah dibuat. Tidak bisa dicapai lewat rekonsiliasi data — ini penciptaan konten baru (foto + DNA), di luar scope "fix data only".

### Kesimpulan soal TARGET sprint ini
Target yang diminta — kombinasi **Saudi Modern + Rounded Collar + Lorenzo + Maroon + Slim Fit berstatus READY FOR RENDER tanpa perubahan kode** — **belum tercapai**, dan tidak bisa dicapai hanya lewat rekonsiliasi data, karena dua hal yang genuinely tidak ada datanya sama sekali (bukan salah tempat): field wajib Saudi Modern dan seluruh kategori Look Cutting. Saya sudah memperbaiki semua yang benar-benar bisa diperbaiki tanpa melanggar "DILARANG regenerate AI Design DNA" (Maroon+3 warna lain, Render Recipe Saudi Modern) — perbaikan ini membuat *kombinasi lain* yang tidak melibatkan Model Thobe/Look Cutting (mis. Lorenzo+Maroon+Basim Collar dengan Model Thobe placeholder yang lengkap) sudah terbukti bisa mencapai prompt akhir yang benar (dibuktikan di Sprint PR-02). Untuk kombinasi PERSIS yang diminta brief ini, langkah berikutnya adalah pekerjaan konten (mengisi AI Design DNA Saudi Modern secara lengkap, dan membuat minimal satu row Look Cutting) — bukan sesuatu yang bisa saya lakukan di bawah rule "fix data only, dilarang regenerate DNA."
