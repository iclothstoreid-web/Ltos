# AUDIT REPOSITORY — FITTER APP → DESIGN STUDIO

**Status:** LTOS V1.2.1
**Metode:** Pembacaan langsung source code (`src/`) + migrasi SQL (`supabase/migrations/`). Tidak ada asumsi, tidak ada memory, tidak ada rekomendasi. Repository saat ini adalah satu-satunya Source of Truth.
**Cakupan:** Fitter App (Check-in → Measurement handoff) → Design Studio → Consultation Review → Create Order → Price Snapshot → Material Reservation → Inventory Integration → Commercial Integration.

---

## 1. EXECUTIVE SUMMARY

Alur Fitter App yang benar-benar terbangun di repository saat ini:

```
Check-in (Customer Information)
  -> Measurement (di luar cakupan audit ini, hanya dilalui)
  -> Design Studio (Garment Blueprint: 9 accordion pilihan + Catatan + Estimasi Harga)
  -> Consultation Review (Estimasi Pengerjaan, Event Information, Estimation Validation,
     Readiness Gauge, Document Uploader, Price Summary, Decision Panel)
  -> Create Order (createOrderFromConsultation)
  -> Material Reservation (reserved_stock, bukan physical_stock)
  -> Order Created (Quotation persistence + Payment, QR, WhatsApp share)
  -> (kemudian, di Production) Persiapan Material -> physical_stock baru berkurang
```

Temuan utama (fakta, bukan opini):

1. **Design Categories terkunci pada 11 kategori** (`design_master_options_category_check`): `model_thobe, look_cutting, kerah, manset, plaket, saku, bahan, warna_bahan, aksesori, bordir, handmade_zigzag`. **Tidak ada kategori "Pergelangan" maupun "Variasi"** di manapun dalam repository — bukan field, bukan kategori master data, bukan kolom. Lihat Temuan Negatif di §2.2.
2. **Fabric Quantity (Sprint V1.2.1) berhenti di reservasi**, bukan di pengurangan stok fisik. `physical_stock` baru benar-benar berkurang saat operator menyelesaikan stage Production `material_prep` (modul terpisah, RPC terpisah, trigger terpisah) — lihat §2.19–§2.20.
3. **Price Snapshot dihitung di client (`buildDesignSpecification`)**, disimpan permanen di `consultations.notes` (bukan tabel baru). Baru menjadi baris `quotations` yang persisten ketika halaman **Order Created** dirender (`PaymentSummaryCard`'s `useEffect`) — bukan bagian dari transaksi `createOrderFromConsultation` itu sendiri. Lihat §2.21.
4. **Dua stub eksplisit tanpa efek nyata**: `notifyOrderCreated` (WhatsApp auto-send) dan `notifyLowStock` (WhatsApp-to-Finance) — keduanya hanya `console.info(...)`, tidak ada pengiriman apa pun.
5. **Event Information tersimpan tapi tidak pernah dibaca kembali** setelah Create Order — tidak ada satu pun layar (Order Summary, Production Packet) yang menampilkannya kembali.
6. **Customer Photos** (`FitterEnhancements.customerPhotos`) punya tipe data tapi **tidak ada UI penulis** di Consultation Review; tombol "Lihat Foto" di Measurement Summary Card sengaja `disabled`.
7. **Consultation "Simpan Konsultasi" (Approve)** hanya menulis satu baris `business_events`, tidak mengubah `consultations.status`, dan tidak dibaca oleh modul lain.
8. Seluruh alur Create Order berjalan sebagai **6 panggilan Supabase berurutan tanpa transaksi** (insert order, update consultation, 3x insert business_events, reserve inventory) — tidak ada rollback/compensating logic di kode.

Selebihnya (Design Studio picker workflow, Estimasi Pengerjaan, Estimation Validation, Readiness Gauge, Document Uploader, Commercial Engine inti, Delivery/Hari D) berstatus **COMPLETE** sesuai cakupan yang dikodekan, dengan detail per fitur di §2.

---

## 2. SELURUH FITUR YANG SUDAH ADA

### 2.1 Customer Information (Check-in)

1. **Nama fitur:** Customer Information / Check-in
2. **Tujuan:** Mencari pelanggan lama atau membuat pelanggan baru, lalu memulai sesi konsultasi baru dengan seorang fitter.
3. **Workflow:** `CustomerSearch` (ketik ≥2 karakter → debounce → `searchCustomers`) atau pilih dari daftar "Order Monitoring"/"Konsultasi Terakhir" → jika tidak ditemukan, `NewCustomerForm` → submit → `createNewCustomer` → pilih fitter via `OperatorAutocomplete` (scoped `FITTER_DIVISI`) → tombol "Mulai Konsultasi Baru" (disabled jika fitter belum dipilih) → `createConsultationSession` → sukses → tombol "Lanjutkan ke Pengukuran" → `router.push('/workspace/measurement/[consultationId]')`.
4. **Input:** `name` (wajib), `phone` (wajib), `address` (opsional) — `NewCustomerForm.tsx:13-15`. Fitter dipilih dari daftar operator divisi Fitter.
5. **Output:** baris `customers` baru dan/atau baris `consultations` baru dengan `consultation_number` yang digenerate DB (`generate_consultation_number()`), navigasi ke Measurement.
6. **Data dibaca:** `customers` (search: `name`/`phone`/`address` via `ilike`, limit 10, order `created_at desc`); `orders` join `customers(name)` untuk "Order Monitoring" (`getFitterOrders`); `consultations` join `customers(id,name,phone)` untuk "Konsultasi Terakhir" (`getRecentConsultations`, memfilter status `order_created` di client).
7. **Data ditulis:** `customers` insert (`name, phone, address, created_by`); `consultations` insert (`customer_id, fitter_id, notes:''`, `status:'check_in'`, `created_by`).
8. **RPC digunakan:** tidak ada RPC eksplisit terlihat di kode ini — `consultation_number` disebut sebagai hasil generator DB (`generate_consultation_number()`), tapi pemanggilannya tidak eksplisit di `actions.ts` (kemungkinan trigger/default kolom DB, bukan RPC yang dipanggil dari client).
9. **Table digunakan:** `customers`, `consultations`, `orders` (read, Order Monitoring), `profiles` (via OperatorAutocomplete/role check).
10. **Business rules:** unique constraint pada `customers.phone` (error code Postgres `23505` ditangani → pesan "Nomor HP sudah terdaftar."); autentikasi wajib (`supabase.auth.getUser()`) sebelum insert apa pun; `fitter_id` sengaja dipisah dari `created_by` (operator KPI vs akun login).
11. **Integrasi dengan modul lain:** Measurement (navigasi berikutnya); Order Summary (link dari Order Monitoring); Master Data (link nav, role-gated `canManageMasterData`).
12. **Status:** COMPLETE untuk pencarian/pembuatan pelanggan dan sesi konsultasi. Nav item "Studio", "Persediaan", "Pesanan", "Analitik" di `CheckInSidebar.tsx:13-19` hardcode `visible:false` — **placeholder yang tidak pernah dirender**.
13. **File utama:** `src/app/workspace/check-in/page.tsx`, `actions.ts`, `types.ts`, `components/NewCustomerForm.tsx`, `components/CustomerSearch.tsx`.

**Alur data (contoh field "phone"):** diketik di `NewCustomerForm` → dikirim ke `createNewCustomer` → disimpan di `customers.phone` → dipakai lagi oleh `searchCustomers` (pencarian ilike), `CustomerJourneyShareActions` (format nomor WhatsApp `formatPhoneForWhatsApp`), dan `PaymentSummaryCard`/`OrderSummaryWorkspace` (tampilan). **Source of Truth: `customers.phone`.**

---

### 2.2 Design Categories (arsitektur Master Data) — termasuk Temuan Negatif Pergelangan/Variasi

1. **Nama fitur:** Product Knowledge Base / `design_master_options`
2. **Tujuan:** satu tabel bersama untuk seluruh katalog pilihan desain (bukan satu tabel per kategori), dipakai Design Studio, Consultation Review, dan Order snapshot.
3. **Workflow:** admin/owner/artisan mengelola item di `/owner/master-data` (di luar cakupan Fitter App, hanya direferensikan); Design Studio hanya membaca (`fetchActiveMasterOptions`, `is_active=true`).
4. **Input:** (di luar Design Studio) nama, harga, foto, metadata, selling points, catatan internal.
5. **Output:** `MasterOptionsByCategory` (dikelompokkan per kategori) untuk seluruh selector Design Studio.
6. **Data dibaca:** `design_master_options` (`select * where is_active=true order by category, sort_order`) — `src/lib/design/masterData.ts:122-134`.
7. **Data ditulis:** tidak ditulis dari Design Studio/Fitter App (read-only di sisi ini).
8. **RPC digunakan:** tidak ada — akses langsung via PostgREST `.from('design_master_options')`.
9. **Table digunakan:** `design_master_options`.
10. **Business rules — LOCK (kutipan literal komentar kode, `masterData.ts:14-19`):** *"this list of categories is fixed. Owner/Fitter can only add/edit/deactivate/delete ITEMS inside an existing category ... never a new category itself ... A new category may only be introduced by an architecture change (a DB migration extending `design_master_options_category_check`) ... There is no '+ Kategori Baru' affordance."* Daftar kategori terkunci (`MASTER_DATA_CATEGORIES`, `masterData.ts:20-32`):

| Kategori (kode) | Label | Field DesignSelections | Komponen Selector |
|---|---|---|---|
| `model_thobe` | Model Thobe | `model` | `ModelSelector` |
| `look_cutting` | Look Cutting | `lookCutting` | `LookCuttingSelector` |
| `kerah` | Kerah | `collar` | `CollarCuffSelector` |
| `manset` | Manset | `cuff` | `CollarCuffSelector` |
| `plaket` | Plaket | `plaket` | `PocketPlaketSelector` |
| `saku` | Saku | `pocket` | `PocketPlaketSelector` |
| `bahan` | Material | `fabric` | `FabricSelector` |
| `warna_bahan` | Warna Material | `color` | `ColorSelector` |
| `aksesori` | Aksesori | `button` | `ButtonSelector` |
| `bordir` | Bordir | `embroidery` | `EmbroideryZigzagSelector` |
| `handmade_zigzag` | Handmade Zig-Zag | `handmadeZigzag` | `EmbroideryZigzagSelector` |

11. **Integrasi dengan modul lain:** Design Studio (baca), Recipe Composer/AI DNA (kolom tambahan pada baris yang sama, lihat §2.22), Inventory (`fetchMaterialIdsUsedInDesign` mencocokkan `design_master_options.material_id`).
12. **Status:** COMPLETE sebagai arsitektur data; kategori terkunci di level DB constraint.
13. **File utama:** `src/lib/design/masterData.ts`, `supabase/migrations/20260719000000_add_master_data_price_and_categories.sql`.

**TEMUAN NEGATIF — "Pergelangan" dan "Variasi":** Pencarian menyeluruh (`grep -i "pergelangan|variasi"`) di seluruh `src/` **tidak menemukan satu pun** kemunculan kedua istilah ini dalam konteks Design Studio/Fitter App (8 file yang cocok hanya menyangkut *body measurement points* di modul Measurement/Production — `patternFormulas.ts`, `SingleSelectPanel.tsx`, dll., bukan pilihan desain). Tidak ada kategori master data, field `DesignSelections`, kolom tabel, atau komponen bernama demikian. **Kedua item ini tidak eksis sebagai fitur di repository saat ini.**

---

### 2.3 Model (Model Busana / `model_thobe`)

1. **Nama fitur:** Model Selector
2. **Tujuan:** memilih model thobe dasar.
3. **Workflow:** grid 2 kolom, radio-card dengan foto (`option.photo_url`) atau ikon `checkroom` fallback; klik memanggil `onSelect(option.name)`; ikon "info" membuka `SpecDetailModal`.
4. **Input:** klik pilihan dari daftar aktif kategori `model_thobe`.
5. **Output:** `selections.model = option.name`.
6. **Data dibaca:** `masterOptions.model_thobe` (via props, sudah difetch di page.tsx).
7. **Data ditulis:** state React lokal (`DesignStudioWorkspace.selections.model`); dipersist ke `consultations.notes` blok `---LTOS_DESIGN_BLUEPRINT---` saat Save/Continue, dan ke blok `---LTOS_DESIGN_SPECIFICATION---` sebagai `{id,name}` ter-resolve.
8. **RPC digunakan:** tidak ada.
9. **Table digunakan:** `consultations` (tulis, tidak langsung dari komponen ini — lewat `persist()` di parent).
10. **Business rules:** nilai default = opsi aktif pertama kategori (`firstActiveOptionName`) jika konsultasi baru; tidak ada validasi lain.
11. **Integrasi:** `buildDesignSpecification` me-resolve nama → `{id,name,price}`; masuk ke Price Snapshot; disalin apa adanya ke Order snapshot (`business_events.event_data.design.model` saat Create Order) — tidak pernah berubah retroaktif walau katalog berubah nama/harga.
12. **Status:** COMPLETE.
13. **File utama:** `src/components/workspace/design-studio/ModelSelector.tsx`.

**Alur data:** pilih Model → `DesignSelections.model` (state) → `notesCodec` (`consultations.notes`) → `buildDesignSpecification` (`DesignSpecification.model` ber-ID) → dipakai lagi oleh `DesignSummaryPanel`, `EstimasiHargaPanel`, `GarmentPreviewSection` (Consultation Review), `createOrder.ts` (snapshot `business_events.event_data.design.model` + `.designSpecification.model`) → **berhenti** di `business_events` (`order.created`) sebagai *frozen snapshot*, dan di Production (`ProductionPacketWorkspace` membaca `event_data.designSpecification`). **Source of Truth setelah Create Order: baris `business_events` `event_type='order.created'`** (bukan lagi `design_master_options`, karena harga/nama bisa berubah di katalog tanpa memengaruhi order lama).

---

### 2.4 Kerah (Collar)

1. **Nama fitur:** Kerah Selector (bagian dari `CollarCuffSelector`)
2. **Tujuan:** memilih model kerah.
3. **Workflow:** `OptionGroup` (pill button) berlabel "Kerah", opsi dari kategori `kerah`; ikon info per pilihan membuka `SpecDetailModal`.
4. **Input/Output/Data:** sama arsitekturnya dengan §2.3, field `selections.collar`.
5. **Business rules:** sama seperti Model — default opsi aktif pertama.
6. **Integrasi:** sama pola snapshot seperti Model.
7. **Status:** COMPLETE.
8. **File utama:** `src/components/workspace/design-studio/CollarCuffSelector.tsx`, `OptionGroup.tsx`.

---

### 2.5 Manset (Cuff)

Arsitektur identik dengan Kerah — dirender berdampingan dalam accordion yang sama ("Kerah & Manset"), kategori master data `manset`, field `selections.cuff`. **File utama:** `CollarCuffSelector.tsx` (sama file dengan Kerah, dua `OptionGroup` independen). Status: COMPLETE.

---

### 2.6 Pergelangan

**TIDAK DITEMUKAN.** Lihat Temuan Negatif §2.2. Tidak ada field, kategori, atau komponen dengan nama ini di Design Studio maupun modul lain yang terkait konsultasi/desain.

---

### 2.7 Cutting (Look Cutting)

1. **Nama fitur:** Look Cutting Selector
2. **Tujuan:** memilih gaya potongan (mis. Slim/Standard/Regular Fit — seed default, bukan hardcoded).
3. **Workflow:** pill button, kategori `look_cutting`, field `selections.lookCutting`.
4. **Business rules / catatan kode (`LookCuttingSelector.tsx:12-16`):** *"this choice rides along in the Order snapshot as a reference for Production's Formulasi Pola stage, without altering that stage itself"* — artinya nilai ini **hanya referensi tampilan** di Production, tidak mengubah logika Formulasi Pola (field template Formulasi Pola adalah enum terpisah, tidak terhubung ke `look_cutting`, dikonfirmasi juga oleh komentar di `masterData.ts:288-291`).
5. **Integrasi:** dibaca kembali oleh Production Packet sebagai info tampilan saja.
6. **Status:** COMPLETE.
7. **File utama:** `src/components/workspace/design-studio/LookCuttingSelector.tsx`.

---

### 2.8 Variasi

**TIDAK DITEMUKAN.** Lihat Temuan Negatif §2.2. Tidak ada field/kategori/komponen bernama "Variasi" pada Design Studio. (Jika yang dimaksud adalah variasi Bordir/Handmade Zig-Zag, itu diaudit terpisah di §2.13 dengan nama field aslinya sesuai kode: `embroidery`/`handmadeZigzag`.)

---

### 2.9 Material (Bahan/Fabric)

1. **Nama fitur:** Fabric Selector
2. **Tujuan:** memilih jenis bahan/kain, dengan tampilan stok langsung dari Inventory (read-only).
3. **Workflow:** daftar baris dengan foto, nama, dan badge stok; klik memilih; ikon info membuka spesifikasi.
4. **Input:** klik opsi dari kategori `bahan`.
5. **Output:** `selections.fabric = option.name`; badge stok `"{available_stock} {unit} tersedia"` atau `"Menipis"` (jika `available_stock <= min_stock`) atau `"Stok belum terhubung"` jika tidak ada material dengan nama sama persis di tabel `materials`.
6. **Data dibaca:** `materialStock` prop, diisi server-side oleh `fetchMaterialStockByName(supabase, masterOptions.bahan.map(o=>o.name))` (`materials.ts:345-360`) — `select name, available_stock, min_stock, unit from materials where is_active=true and name in (...)`.
7. **Data ditulis:** tidak ada dari komponen ini (read-only Inventory→Fitter).
8. **RPC digunakan:** tidak ada (query langsung).
9. **Table digunakan:** `materials` (baca), `design_master_options` (baca, kategori `bahan`).
10. **Business rules:** pencocokan stok murni berdasarkan **nama identik** (`materialStock[option.name]`) — tidak ada `material_id` FK dari `design_master_options` yang dipakai di jalur ini (beda dengan `fetchMaterialIdsUsedInDesign` di modul Inventory yang memang memakai `material_id`); jika nama tidak identik persis, tampil "Stok belum terhubung" alih-alih memalsukan angka (komentar `FabricSelector.tsx:19-22`).
11. **Integrasi:** Inventory (`materials` table, read-only); Fabric Quantity Field (dirender tepat di bawah selector ini dalam accordion yang sama).
12. **Status:** COMPLETE sebagai tampilan stok read-only; **rapuh terhadap nama tidak identik** (bukan bug menurut definisi kode — perilaku "belum terhubung" ini disengaja).
13. **File utama:** `src/components/workspace/design-studio/FabricSelector.tsx`, `src/lib/inventory/materials.ts:345-360`.

**Alur data khusus Material:** pilih Bahan → `selections.fabric` (nama) → dipakai lagi oleh `reserveInventory` saat Create Order (`materialName: request.fabricName`) → RPC `reserve_material_for_order` mencocokkan `lower(materials.name) = lower(p_material_name)` → **berhenti** di `materials.reserved_stock` (increment) + baris `material_stock_movements` (`movement_type='reservation'`). **Source of Truth stok: tabel `materials` (kolom `reserved_stock`/`physical_stock`/`available_stock` generated).**

---

### 2.10 Warna (Warna Bahan)

1. **Nama fitur:** Color Selector
2. **Tujuan:** memilih warna bahan.
3. **Workflow:** grid swatch bulat (4 kolom), warna dari `option.metadata.hex` (bukan hardcoded map nama→hex), fallback `#c4c7c7` jika tidak ada.
4. **Input/Output:** `selections.color = option.name`.
5. **Data dibaca:** `masterOptions.warna_bahan`.
6. **Business rules:** tidak ada validasi hex format terlihat di komponen ini.
7. **Integrasi khusus — catatan penting:** `colorName` **ikut dikirim** ke `reserveInventory` sebagai bagian `InventoryReservationRequest`, **tetapi tidak pernah benar-benar dipakai** — `reserveInventory` (`src/lib/order/inventory.ts:20-24`) hanya meneruskan `orderId, materialName, quantity` ke `reserveMaterialForOrder`; RPC `reserve_material_for_order` bahkan **tidak punya parameter warna sama sekali**. Alasan tertulis di komentar: *"color has no quantity concept, so it's skipped"* (`inventory.ts:5-12`). Artinya reservasi stok tidak pernah membedakan per warna, hanya per nama bahan.
8. **Status:** COMPLETE sebagai pilihan desain; **field `colorName` mati (dead) di jalur reservasi inventory**.
9. **File utama:** `src/components/workspace/design-studio/ColorSelector.tsx`.

---

### 2.11 Saku (Pocket) & Plaket

Arsitektur identik dengan Kerah & Manset — satu accordion "Saku & Plaket" menampilkan dua `OptionGroup` independen (`PocketPlaketSelector.tsx`), kategori `saku` dan `plaket`, field `selections.pocket`/`selections.plaket`. Status: COMPLETE.

---

### 2.12 Kancing & Aksesori (Button)

1. **Nama fitur:** Button Selector
2. **Tujuan:** memilih model kancing/aksesori.
3. **Workflow:** pill button, kategori `aksesori`, field `selections.button`.
4. **Catatan:** label UI accordion "Kancing & Aksesori", tapi field internal tetap `button` (lihat komentar `ButtonSelector.tsx:12-13`).
5. **Status:** COMPLETE. **File:** `ButtonSelector.tsx`.

---

### 2.13 Bordir & Handmade Zig-Zag

1. **Nama fitur:** Embroidery/Zigzag Selector
2. **Tujuan:** memilih motif bordir dan/atau motif handmade zig-zag — dua kategori independen ditampilkan dalam satu accordion.
3. **Workflow:** dua `OptionGroup`, kategori `bordir` dan `handmade_zigzag`; field `selections.embroidery`/`selections.handmadeZigzag`.
4. **Catatan konteks:** kedua kategori ini awalnya "standalone catalogs" tanpa field `DesignSelections` sendiri, baru diberi field pada sprint "Design Specification Foundation" (komentar `types.ts:17-22`). `handmade_zigzag` juga satu-satunya kategori dengan label nama berbeda: "Nama Motif" bukan "Nama" (`masterData.ts:56-68`).
5. **Status:** COMPLETE. **File:** `EmbroideryZigzagSelector.tsx`.

---

### 2.14 Design Notes (Catatan Desain)

1. **Nama fitur:** Design Notes Field
2. **Tujuan:** catatan bebas fitter untuk konsultasi ini, terpisah dari struktur pilihan.
3. **Workflow:** textarea polos, `onChange` langsung update state `notes` di `DesignStudioWorkspace`.
4. **Input:** teks bebas.
5. **Output:** `DesignSpecification.notes`.
6. **Data dibaca:** `decodeDesignSpecification(consultation.notes)?.notes` saat load.
7. **Data ditulis:** blok `---LTOS_DESIGN_SPECIFICATION---` di `consultations.notes` (bukan blok `notesCodec` `key=value` — sengaja dipisah karena catatan bisa mengandung karakter `=`/`|` yang merusak parser, komentar `DesignNotesField.tsx:8-10`).
8. **RPC/Table:** tidak ada RPC; `consultations` (update, lewat `persist()` parent).
9. **Business rules:** tidak ada validasi panjang/format.
10. **Integrasi:** ditampilkan di `DesignSummaryPanel` (Design Studio) dan disalin ke Order snapshot (`business_events.event_data.designSpecification.notes`).
11. **Status:** COMPLETE.
12. **File utama:** `src/components/workspace/design-studio/DesignNotesField.tsx`.

---

### 2.15 Garment Blueprint (Cetak Biru Busana — panel kontainer)

1. **Nama fitur:** Garment Blueprint Panel
2. **Tujuan:** kontainer accordion kiri yang menyatukan seluruh 9 kelompok pilihan desain + Fabric Quantity + Design Notes, plus modal "Lihat Spesifikasi" bersama.
3. **Workflow:** 9 `Accordion` (index 1–9): Model Busana → Look Cutting → Pilihan Bahan (+ Fabric Quantity nested) → Warna Bahan → Kerah & Manset → Saku & Plaket → Kancing & Aksesori → Bordir & Handmade Zig-Zag → Catatan Desain. State `specOption` lokal panel ini mengontrol `SpecDetailModal`, terpisah total dari state `selections`.
4. **Input/Output:** meneruskan `onChange`/`selections` dari/ke parent `DesignStudioWorkspace` — panel ini sendiri tidak menyimpan apa pun.
5. **Data dibaca:** `masterOptions` (semua 11 kategori), `materialStock`.
6. **RPC/Table:** tidak langsung — agregat dari seluruh selector anak.
7. **Business rules:** tidak ada logika baru di level kontainer.
8. **Integrasi:** satu-satunya jembatan antara seluruh selector dan `DesignStudioWorkspace.persist()`.
9. **Status:** COMPLETE.
10. **File utama:** `src/components/workspace/design-studio/GarmentBlueprintPanel.tsx`, `Accordion.tsx`, `SpecDetailModal.tsx`.

---

### 2.16 Fabric Quantity (Sprint V1.2.1)

1. **Nama fitur:** Fabric Quantity Field
2. **Tujuan:** memberi nilai numerik kebutuhan kain (meter) secara manual, untuk mengaktifkan pipa Material Reservation yang sebelumnya selalu `null`.
3. **Workflow:** `<input type="number" step="0.1">` polos, ditempatkan di bawah `FabricSelector` dalam accordion "Pilihan Bahan"; tidak ada tombol simpan sendiri — ikut tersimpan saat Save/Continue Design Studio.
4. **Input:** angka meter, boleh kosong (`null`).
5. **Output:** `FabricQuantity.quantityMeters`.
6. **Data dibaca:** `decodeFabricQuantity(consultation.notes).quantityMeters` (blok `---LTOS_FABRIC_QTY---`).
7. **Data ditulis:** `consultations.notes` blok `---LTOS_FABRIC_QTY---` (JSON `{quantityMeters}`) — tidak ada kolom/tabel baru.
8. **RPC digunakan:** tidak langsung dari komponen ini; nilainya dikonsumsi nanti oleh `reserveInventory` → RPC `reserve_material_for_order`.
9. **Table digunakan:** `consultations` (tulis via `persist()`); `materials`/`material_stock_movements` (tulis, tidak langsung — di Create Order).
10. **Business rules — eksplisit dari komentar (`FabricQuantityField.tsx:8-12`):** *"Deliberately a plain number the Fitter types in — no calculator/formula derives it from measurements, per this sprint's LARANGAN."* Tidak ada validasi terhadap `materials.available_stock` di mana pun sepanjang pipa ini — RPC `reserve_material_for_order` akan tetap menambah `reserved_stock` walau melebihi `physical_stock`.
11. **Integrasi:** satu-satunya konsumen adalah `reserveInventory`/`reserve_material_for_order` saat Create Order. **Tidak ditampilkan kembali** di Order Summary maupun Production Packet (tidak ada referensi `fabricQuantityMeters`/nilai reservasi di file-file tersebut).
12. **Status:** COMPLETE untuk "input fitter → baris reservasi"; **tidak ada validasi stok, tidak ada tampilan balik ke staff setelah Create Order.**
13. **File utama:** `src/components/workspace/design-studio/FabricQuantityField.tsx`, `fabricQuantityCodec.ts`.

**Alur data Fabric Quantity (lengkap, lihat juga §1 poin 2):**
```
FabricQuantityField (input manual, meter)
  -> DesignStudioWorkspace.fabricQuantityMeters (state)
  -> encodeFabricQuantity() -> consultations.notes (blok ---LTOS_FABRIC_QTY---)
  -> [berhenti sementara di sini sampai Consultation Review]
  -> decodeFabricQuantity() dibaca lagi di ConsultationReviewWorkspace
  -> diteruskan ke createOrderFromConsultation(fabricQuantityMeters)
  -> reserveInventory() -> jika null/<=0: SKIP (tidak ada RPC dipanggil)
  -> jika >0: reserveMaterialForOrder() -> RPC reserve_material_for_order
  -> materials.reserved_stock += quantity (physical_stock TIDAK berubah)
  -> material_stock_movements insert (movement_type='reservation')
  -> [BERHENTI DI SINI — tidak ada tampilan balik]
  -> (nanti, terpisah) saat Production stage 'material_prep' selesai:
     releaseMaterialReservation() -> RPC release_material_reservation
     -> materials.physical_stock -= qty, reserved_stock -= qty (baru sekarang fisik berkurang)
```
**Source of Truth:** `materials.reserved_stock`/`physical_stock` (kolom generated `available_stock`). Tidak ada jaminan DB bahwa setiap reservasi akan pernah dirilis (jika stage `material_prep` tidak pernah dijalankan/dilewati, atau RPC gagal — errornya ditelan oleh `try/catch` di kedua sisi).

---

### 2.17 Estimasi Harga

1. **Nama fitur:** Estimasi Harga Panel
2. **Tujuan:** menampilkan rincian harga per pilihan dan totalnya, real-time, tanpa kalkulasi ulang.
3. **Workflow:** murni tampilan, di dalam `DesignSummaryPanel` (kolom kanan Design Studio), bukan accordion terpisah.
4. **Input:** tidak ada — hanya menerima `priceSnapshot` prop.
5. **Output:** daftar baris `{kategori, nama opsi, subtotal}` + total.
6. **Data dibaca:** `liveSpecification.priceSnapshot` — dihitung oleh `buildDesignSpecification()` di `DesignStudioWorkspace`, bukan oleh panel ini sendiri (komentar `EstimasiHargaPanel.tsx:27-30`: *"never recalculates its own price, so it can never drift from what persist() saves"*).
7. **Data ditulis:** tidak ada.
8. **RPC/Table:** tidak ada — murni turunan client-side dari `option.price` per kategori (`buildSpecification.ts:44-55`).
9. **Business rules:** `subtotal = option.price` per pilihan (tidak ada diskon/pajak di level ini); `total = sum(subtotal)`.
10. **Integrasi:** sama objek `PriceSnapshot` dipakai lagi oleh `PriceSummaryCard` (Consultation Review) dan `PaymentSummaryCard`/`upsertOrderQuotation` (Order Created, lihat §2.21).
11. **Status:** COMPLETE.
12. **File utama:** `src/components/workspace/design-studio/EstimasiHargaPanel.tsx`, `src/lib/designSpecification/buildSpecification.ts:44-55`.

---

### 2.18 AI Preview / Render Context (terkait erat, bukan bagian WAJIB tapi bagian nyata Design Studio)

1. **Nama fitur:** AI Preview Panel / Render Context Builder
2. **Tujuan:** memvalidasi kelengkapan data lalu merakit `RenderContext` (Customer Digital Profile + Design Specification) untuk AI Render Engine **yang belum dibangun**.
3. **Workflow:** tombol "Buat Pratinjau Akhir" → `validateRenderContextReadiness()` → jika tidak lengkap, tampilkan daftar pesan kurang (`missing[]`); jika lengkap → `buildRenderContext()` → disimpan di state lokal `renderContext` (tidak dipersist).
4. **Business rules (`renderContext.ts:31-41`):** field wajib untuk readiness = `model, lookCutting, fabric, color, collar, cuff, plaket, pocket, button` — **Bordir dan Handmade Zig-Zag sengaja tidak wajib** (dekoratif). Customer Digital Profile juga wajib ada (artinya Measurement harus sudah selesai).
5. **Integrasi:** tidak terhubung ke API AI apa pun — komentar (`AIPreviewPanel.tsx:16-20`) menegaskan *"No SVG/PNG/live garment rendering lives here ... the actual visual result will come exclusively from the AI Render Engine in a later sprint."*
6. **Status:** PARTIAL by design — hanya validasi + perakitan objek in-memory, tidak pernah dipersist, tidak ada AI call.
7. **File utama:** `AIPreviewPanel.tsx`, `src/lib/customerProfile/renderContext.ts`.

---

### 2.19 Estimasi Pengerjaan (Consultation Review)

1. **Nama fitur:** Estimasi Pengerjaan (Service Level picker)
2. **Tujuan:** fitter memilih tingkat kecepatan produksi (Standard/Fast/Very Fast) untuk order ini.
3. **Workflow:** `<select>` diisi dari `getServiceSlaRules()` (RPC `get_service_sla_rules`) saat mount → setiap perubahan langsung memicu `preview_service_validation` (RPC) untuk preview 🟢/🟡/🔴 + `estimated_completion` + `reasons[]`, dan langsung `persistEnhancements({estimasiPengerjaan})` (tanpa tombol simpan terpisah).
4. **Input:** pilihan `'' | 'Standard' | 'Fast' | 'Very Fast'`.
5. **Output:** preview ketersediaan inline; memicu refresh `estimatedProductionSpeed` di dalam blok Design Specification.
6. **Data dibaca:** blok `---LTOS_FITTER_ENHANCEMENTS---`; tabel `service_sla_rules` (via RPC).
7. **Data ditulis:** `consultations.notes` — dua blok sekaligus: `---LTOS_FITTER_ENHANCEMENTS---` (`{estimasiPengerjaan, customerPhotos, documents}`) dan `---LTOS_DESIGN_SPECIFICATION---` (refresh `estimatedProductionSpeed`).
8. **RPC digunakan:** `get_service_sla_rules`, `preview_service_validation`.
9. **Table digunakan:** `consultations` (update), `service_sla_rules` (baca, via RPC).
10. **Business rules:** mapping label→`ServiceLevel` **hardcoded** (`'Standard'→'standard'`, `'Fast'→'fast'`, `'Very Fast'→'very_fast'`) karena field ini mendahului Service Engine (komentar `service.ts:33-38`); jumlah hari SLA sendiri tidak pernah hardcoded, selalu dari RPC.
11. **Integrasi:** Design Studio (`buildDesignSpecification`, tidak mengumpulkan field ini sendiri); Create Order (`createOrder.ts:139` memakai `estimatedProductionSpeed` untuk memanggil `set_order_service`); Order Summary & Production Packet (tampil read-only).
12. **Status:** COMPLETE.
13. **File utama:** `src/components/workspace/consultation-review/EstimationCard.tsx`, `fitterEnhancementsCodec.ts`, `src/lib/order/service.ts`.

---

### 2.20 Event Information

1. **Nama fitur:** Event Information Card
2. **Tujuan:** menangkap jenis acara, tanggal target pemakaian, fleksibilitas deadline, dan catatan.
3. **Workflow:** field `eventType`/`targetUsageDate`/`deadlineFlexibility` langsung tersimpan tiap perubahan; `catatan` di-buffer lokal dan hanya tersimpan saat `onBlur` (jika berubah).
4. **Input:** `eventType` (enum 10 nilai: Harian/Kerja/Umroh/Haji/Pernikahan/Wisuda/Lebaran/Acara Resmi/Hadiah/Lainnya), `targetUsageDate` (ISO date), `deadlineFlexibility` (`strict`/`flexible`), `catatan` (teks bebas).
5. **Output:** tidak ada tampilan sendiri — hanya jadi input `EstimationValidationCard`.
6. **Data dibaca/ditulis:** blok `---LTOS_EVENT_INFO---` di `consultations.notes`.
7. **RPC/Table:** tidak ada RPC; `consultations` (update).
8. **Business rules — kutipan komentar (`eventInformationCodec.ts:34-36`):** *"Target Usage Date is the data every downstream engine reads... Event Type is context only — never fed into capacity or SLA math."* Tidak ada validasi format/tanggal lampau di file ini.
9. **Integrasi:** hanya dikonsumsi oleh `computeEstimationValidation` (§2.21) dan disalin ke Order snapshot (`business_events.event_data.eventInformation`). **Tidak ada satu pun layar (Order Summary, Production Packet) yang membacanya kembali** setelah Create Order — dikonfirmasi lewat pencarian menyeluruh referensi `eventInformation` di `src/`.
10. **Status:** PARTIAL secara efektif — lengkap sebagai input+persist, tapi **write-only setelah order dibuat** (data mati/tidak terpakai lagi).
11. **File utama:** `src/components/workspace/consultation-review/EventInformationCard.tsx`, `eventInformationCodec.ts`.

---

### 2.21 Consultation Review (halaman, kartu-kartu pendukung lain)

Kartu-kartu berikut adalah bagian dari halaman Consultation Review, masing-masing diaudit ringkas (detail lengkap ada di laporan riset, dirangkum di sini per 13 poin secara padat):

**a. Estimation Validation (SAFE/RISK/IMPOSSIBLE)**
- Tujuan: membandingkan `estimated_completion` vs `targetUsageDate` secara deterministik.
- Business rules (`estimationValidation.ts:29-55`): tanpa `estimated_completion` atau `targetUsageDate` → tidak ada verdict (`null`); `bufferDays = round((target-finish)/86400000)`; `bufferDays<0` → `RISK` jika fleksibel, else `IMPOSSIBLE`; `bufferDays===0` atau `overall_status='yellow'/'red'` → `RISK`; selain itu → `SAFE`. Rekomendasi statis untuk IMPOSSIBLE: *"Negosiasi tanggal pemakaian, Tawarkan Express Production, Ajukan Owner Override kapasitas, Tolak order"*.
- **Tidak pernah memblokir tombol "Buat Pesanan"** — dinyatakan eksplisit di komentar (`EstimationValidationCard.tsx:29-30`).
- Status: COMPLETE, non-blocking by design. **Tidak ditampilkan lagi setelah order dibuat.**

**b. Readiness Gauge**
- Gauge dari 2 sinyal biner (`measurementComplete`, `designComplete` — deteksi via keberadaan marker `---LTOS_DESIGN_BLUEPRINT---`), sehingga hanya bisa 0%/50%/100%. Tidak dipersist, tidak dibaca modul lain. Status: COMPLETE.

**c. Document Uploader (Referensi Customer)**
- Upload ke Storage bucket `consultation-documents`, kategori tetap (5 pilihan hardcoded), tersimpan di blok `---LTOS_FITTER_ENHANCEMENTS---.documents[]`. **Dibaca kembali** oleh Production (`getCustomerReferencesForOrder` → RPC `get_production_customer_notes`) dan Order Summary. Status: COMPLETE dan aktif dipakai.

**d. Customer Photos** (bagian dari Fitter Enhancements, bukan kartu sendiri)
- Tipe `customerPhotos.front/side/back` ada di `FitterEnhancementsCodec`, tapi **tidak ada UI penulis** di seluruh direktori `consultation-review/`. Tombol "Lihat Foto" di Measurement Summary Card sengaja `disabled` (`title="Dokumentasi foto belum tersimpan permanen..."`). Status: **STUB/tidak terjangkau dari UI manapun**.

**e. Price Summary Card**
- Tampilan read-only `priceSnapshot` (dari `DesignSpecification` yang sama). Tombol pembayaran (Tunai/Transfer/QRIS) sengaja `disabled` dengan tooltip "Pembayaran tersedia setelah Order dibuat" — alasan tertulis: `quotations`/`order_payments` butuh `order_id` yang belum ada. Status: COMPLETE, pembayaran sengaja ditunda ke layar lain.

**f. Decision Panel — "Simpan Konsultasi" (Approve)**
- Hanya insert 1 baris `business_events` (`event_type='consultation.approved'`), **tidak mengubah `consultations.status`**, **tidak dibaca modul lain manapun** (dikonfirmasi via pencarian). Status: fungsional tapi terisolasi/sempit.

**g. Decision Panel — "Buat Pesanan" (Create Order)**
- Memanggil `createOrderFromConsultation` langsung dari halaman ini (tidak navigasi ke halaman lain untuk membuat order) — detail penuh di §2.22.

**h. Measurement Summary Card, Garment Preview Section, Customer Summary Card**
- Seluruhnya tampilan read-only/navigasi; "Lihat Foto" (Measurement) dan preview visual garmen (Garment Preview) adalah **placeholder yang disengaja** (komentar eksplisit menyatakan tidak ada rendering engine).

**File utama seluruh §2.21:** `src/components/workspace/consultation-review/*.tsx`.

---

### 2.22 Create Order

1. **Nama fitur:** `createOrderFromConsultation`
2. **Tujuan:** mengonversi `consultations` menjadi `orders`, mencatat audit trail, memicu reservasi material, service level, dan notifikasi (best-effort).
3. **Workflow (urutan pasti, `src/lib/order/createOrder.ts:70-222`):**
   1. Guard: jika `consultation.status==='order_created'` → throw sebelum insert apa pun.
   2. `order_number = consultation_number.replace('LT-CS-','LT-ORD-')` (deterministik, tanpa generator DB).
   3. `customerToken = generateCustomerToken()`.
   4. Insert `orders` (`customer_id, order_number, current_state:'order', customer_token`).
   5. `qrPayload`/`customerJourneyUrl` dibangun.
   6. Best-effort: `set_order_service` (jika `estimatedProductionSpeed` terpetakan) — gagal hanya di-log, tidak menghentikan proses.
   7. Susun `OrderSnapshot` lengkap (customer, measurement, bodyTags, design, designSpecification, consultationNotes, qrPayload, eventInformation, estimationValidation).
   8. Update `consultations.status = 'order_created'`.
   9. 3x insert `business_events`: `order.created` (snapshot lengkap), `consultation.completed`, `workflow.order_created`.
   10. `reserveInventory(...)` — best-effort, error ditelan.
   11. `notifyOrderCreated(...)` — **stub, hanya `console.info`**.
   12. Return `{orderId, orderNumber, qrPayload, customerToken, customerJourneyUrl}` → halaman navigasi ke `/workspace/order-created/[orderId]`.
4. **Input:** `CreateOrderParams` (consultation+customers, measurementFields, bodyTags, humanNotes, selections, designSpecification?, eventInformation?, estimationValidation?, fabricQuantityMeters?, userId).
5. **Output:** `CreateOrderResult`.
6. **Data dibaca:** field dari objek `consultation` yang sudah di-fetch (tidak query ulang).
7. **Data ditulis:** `orders` (insert), `consultations` (update status), `business_events` (3 insert), `materials`/`material_stock_movements` (via reservasi).
8. **RPC digunakan:** `set_order_service` (best-effort), `reserve_material_for_order` (best-effort, kondisional).
9. **Table digunakan:** `orders`, `consultations`, `business_events`.
10. **Business rules:** guard duplikasi order per consultation; `current_state` literal `'order'` karena constraint DB tidak punya nilai `'confirmed'` (komentar `createOrder.ts:111-113`); tidak ada transaksi DB — 6 panggilan sekuensial terpisah, tanpa rollback jika gagal di tengah.
11. **Integrasi:** Service Engine, Inventory, QR, Notifications (stub), Commercial (tidak langsung — lihat §2.24).
12. **Status:** PARTIAL — inti (insert order + snapshot + status) COMPLETE; `notifyOrderCreated` STUB; tidak ada penanganan hasil reservasi (`void`, error ditelan); tidak transaksional.
13. **File utama:** `src/lib/order/createOrder.ts`.

---

### 2.23 Price Snapshot

1. **Nama fitur:** Price Snapshot
2. **Tujuan:** membekukan harga & ID setiap pilihan pada saat dipilih, agar perubahan katalog di kemudian hari tidak memengaruhi order lama.
3. **Workflow:** dihitung di client oleh `buildDesignSpecification()` setiap kali pilihan berubah; disimpan sebagai bagian `DesignSpecification.priceSnapshot` di blok `---LTOS_DESIGN_SPECIFICATION---`.
4. **Input:** `MasterOptionsByCategory` + `DesignSelections`.
5. **Output:** `PriceSnapshotLine[]` (`category, optionId, optionName, price, subtotal`) + `total`.
6. **Data dibaca:** `design_master_options` (untuk resolve harga saat ini, hanya saat pilihan berubah — bukan re-fetch harga lama).
7. **Data ditulis:** `consultations.notes` (blok Design Specification); kemudian, hanya jika `PaymentSummaryCard` dirender di layar Order Created, ditulis ke `quotations` (via `upsert_order_quotation`).
8. **RPC digunakan:** tidak ada untuk kalkulasi (murni client); `upsert_order_quotation` untuk persistensi ke Order.
9. **Table digunakan:** `consultations` (blok notes), `quotations` (setelah Order Created dirender).
10. **Business rules:** `subtotal = option.price` per baris; **tidak ada RPC/SQL yang menghitung ulang harga** — dinyatakan berulang di komentar migrasi Commercial Engine bahwa "pricing math" hidup sepenuhnya di `buildDesignSpecification()`.
11. **Integrasi:** Design Studio (`EstimasiHargaPanel`), Consultation Review (`PriceSummaryCard`, read-only), Order Created (`PaymentSummaryCard` — titik pertama Price Snapshot benar-benar menjadi baris `quotations`).
12. **Status:** PARTIAL secara arsitektur — **Price Snapshot → baris `quotations` bersifat oportunistik**, bukan bagian transaksi `createOrderFromConsultation`. Jika halaman Order Created/`PaymentSummaryCard` tidak pernah dirender untuk suatu order, **tidak ada jaminan baris `quotations` pernah dibuat** untuk order tersebut.
13. **File utama:** `src/lib/designSpecification/types.ts`, `buildSpecification.ts`, `src/components/workspace/order-created/PaymentSummaryCard.tsx`.

---

### 2.24 Material Reservation

1. **Nama fitur:** Material Reservation
2. **Tujuan:** menahan (bukan mengurangi) kuantitas bahan terhadap stok material saat order dibuat.
3. **Workflow:** `createOrder.ts` → `reserveInventory` → (skip jika `quantityMeters` null/≤0) → `reserveMaterialForOrder` → RPC `reserve_material_for_order`.
4. **Input:** `{orderId, fabricName (dipakai), colorName (TIDAK dipakai), quantityMeters}`.
5. **Output:** `void` di sisi pemanggil (hasil RPC berupa `Material|null` dibuang, tidak ditangkap).
6. **Data dibaca:** `materials` (match `lower(name)=lower(p_material_name) and is_active`, tanpa mempertimbangkan warna), `profiles.role`.
7. **Data ditulis:** `materials.reserved_stock += quantity`; `material_stock_movements` insert (`movement_type='reservation'`).
8. **RPC digunakan:** `reserve_material_for_order` (role gate: `admin`/`owner`/`artisan`).
9. **Table digunakan:** `materials`, `material_stock_movements`, `profiles`.
10. **Business rules:** quantity null/0/negatif → skip total (tidak ada RPC dipanggil); pencocokan nama case-insensitive, `limit 1` jika ada duplikat nama; **tidak pernah mengurangi `physical_stock`** (komentar SQL: *"Belum keluar gudang. Belum mengurangi Stock Fisik."*); tidak ada validasi terhadap `available_stock` sebelum menambah reservasi (bisa melebihi stok fisik).
11. **Integrasi:** hanya dipanggil dari Create Order; dirilis kembali oleh Production (`release_material_reservation`, lihat §2.25).
12. **Status:** COMPLETE sebagai mekanisme reservasi-saja; **`colorName` adalah parameter mati** (diterima tapi tidak pernah dipakai di sepanjang jalur, sampai ke tanda tangan RPC yang memang tidak punya parameter warna).
13. **File utama:** `src/lib/order/inventory.ts`, `src/lib/inventory/stock.ts`, `supabase/migrations/20260720000000_add_inventory.sql:251-293`.

---

### 2.25 Inventory Integration (pengurangan stok fisik)

1. **Nama fitur:** Release Material Reservation / Stock Deduction
2. **Tujuan:** benar-benar mengurangi `physical_stock` — terjadi terpisah dari Create Order, dipicu oleh modul Production.
3. **Workflow:** `ProductionPacketWorkspace.tsx:213-219` — setelah `completeStage(...)`, **jika** `currentRecord.stage === 'material_prep'`, panggil `releaseMaterialReservation(supabase, orderId)` (try/catch, error hanya `console.error`).
4. **Input:** `orderId`.
5. **Output:** `void`.
6. **Data dibaca:** `material_stock_movements` (menghitung delta reservasi vs rilis yang sudah tercatat, per `material_id`).
7. **Data ditulis:** `materials.reserved_stock` dan `materials.physical_stock` (keduanya dikurangi, `greatest(...,0)`); `material_stock_movements` insert (`movement_type='release'`); kondisional insert `business_events` (`event_type='inventory.low_stock'`, **tanpa `created_by`** — beda dari `inventory_adjust_stock` yang mengisi `created_by`) jika `available_stock <= min_stock` setelah update.
8. **RPC digunakan:** `release_material_reservation` (grant `anon, authenticated` — kiosk Production tidak selalu punya sesi login).
9. **Table digunakan:** `materials`, `material_stock_movements`, `business_events`.
10. **Business rules:** hanya memproses delta yang *masih outstanding* (reservasi belum dirilis penuh); tidak ada jaminan DB bahwa setiap reservasi pasti dirilis — jika stage `material_prep` tidak pernah dicapai/dilewati, atau RPC gagal (ditelan try/catch), `reserved_stock` tetap naik selamanya untuk order tersebut.
11. **Integrasi:** satu-satunya jembatan antara Create Order (reservasi) dan Production (pengurangan fisik nyata); terhubung juga ke `notifyLowStock` **secara tidak langsung** — event `inventory.low_stock` dibuat di DB tapi **tidak ada kode `src/` yang membaca event ini untuk memicu `notifyLowStock`** (dua hal ini terputus).
12. **Status:** PARTIAL — pengurangan fisik hanya terjadi kondisional pada 1 stage produksi tertentu; secara arsitektur ini adalah **dua transaksi terpisah** (reservasi saat Create Order, rilis saat Production) yang hanya terhubung lewat kecocokan `order_id` di `material_stock_movements`, tanpa constraint DB yang menjamin keduanya selalu berpasangan.
13. **File utama:** `src/components/workspace/production/ProductionPacketWorkspace.tsx:196-219`, `src/lib/inventory/stock.ts:36-39`, `supabase/migrations/20260720000000_add_inventory.sql:301-345`.

**Catatan tambahan:** jalur lain yang mengubah `physical_stock` adalah `inventory_adjust_stock` (stock_in/stock_out/adjustment) — dipakai eksklusif dari workspace Inventory manual (role `admin`/`owner`), **tidak terkait sama sekali** dengan alur order/Fitter App.

---

### 2.26 Commercial Integration

1. **Nama fitur:** Commercial Engine
2. **Tujuan:** menyimpan Price Snapshot sebagai `quotations`, mengelola diskon/KOL/override harga, mencatat pembayaran, dan merakit data invoice.
3. **Workflow (rangkai penuh):**
   - Design Studio menghitung `PriceSnapshot` (client) → Consultation Review menampilkannya read-only (`PriceSummaryCard`, **tidak ada RPC dipanggil di kartu ini**) → Order Created (`PaymentSummaryCard`) `useEffect` on-mount: `upsertOrderQuotation` (jika `priceSnapshot.lines.length>0`) → `getOrderInvoice` → tombol rekam pembayaran → `recordOrderPayment`.
   - Owner Command Center (`OrderCommercialSection`, di luar Fitter App) menambahkan diskon/KOL/override di atas baris `quotations` yang sama.
4. **Input:** `p_line_items`/`p_subtotal` (dari Price Snapshot), input diskon/KOL/override (admin/owner), input pembayaran (`amount, payment_type, payment_method`).
5. **Output:** objek invoice lengkap (`get_order_invoice`): `line_items, subtotal, discount_*, kol_*, override_*, total, payment_status (belum_ada_harga/belum_dibayar/dp_diterima/lunas), payments[]`.
6. **Data dibaca:** `quotations`, `order_payments`, `commercial_rules` (singleton config).
7. **Data ditulis:** `quotations` (upsert per `order_id`, unique constraint), `order_payments` (insert).
8. **RPC digunakan:** `upsert_order_quotation`, `apply_order_discount`, `apply_order_kol`, `set_order_price_override`, `clear_order_price_override`, `record_order_payment`, `get_order_payment_history` (**didefinisikan tapi tidak dipanggil dari `client.ts` manapun — dead dari sisi frontend**), `get_order_invoice`, `recompute_quotation_total` (internal), `get_commercial_rules`/`set_commercial_rules`.
9. **Table digunakan:** `quotations`, `order_payments`, `commercial_rules`.
10. **Business rules (server-side, `security definer`):**
    - `total = coalesce(override_amount, greatest(subtotal - discount_amount - kol_discount_amount, 0))`, dibulatkan ke `price_rounding_nearest` (jika bukan override).
    - Diskon/KOL/Override: role gate `admin`/`owner`; cap `max_discount_percent`/`kol_max_discount_percent` dari `commercial_rules`; override butuh `p_reason` non-kosong dan bisa dimatikan total via `owner_override_enabled`.
    - Pembayaran: **tidak ada role gate** di level RPC (`record_order_payment` granted ke `anon`+`authenticated`); aturan `full_payment_only` (menolak `dp`/`installment`) dan `min_dp_percent` (menolak DP di bawah persentase minimum) dari `commercial_rules`.
    - Pembayaran pertama pada quotation berstatus `draft` otomatis mengubahnya jadi `approved`.
    - Nilai default `commercial_rules` (`min_dp_percent=0, max_discount_percent=100, full_payment_only=false, kol_max_discount_percent=100, owner_override_enabled=true, price_rounding_nearest=0`) sengaja dipilih agar **tidak membatasi apa pun** sampai owner mengubahnya.
11. **Integrasi dengan Design Studio/Consultation Review:** **tidak ada panggilan langsung** dari `createOrder.ts` ke modul Commercial — hanya terhubung lewat `order_id` yang sama; `PriceSummaryCard` (Consultation Review) murni tampilan, tidak menyentuh RPC Commercial sama sekali.
12. **Status:** PARTIAL — mesin diskon/KOL/override/pembayaran/invoice-data COMPLETE dan diberi aturan server-side, tapi **penciptaan `quotations` per order bersifat oportunistik** (lihat §2.23); "invoice" hanya data-assembly, **tidak ada generasi PDF/dokumen** (dinyatakan eksplisit di komentar migrasi).
13. **File utama:** `src/lib/commercial/client.ts`, `types.ts`, `summary.ts`, `supabase/migrations/20260804000002_add_commercial_engine.sql`, `20260811000000_add_business_rules_runtime_config.sql`.

---

### 2.27 Delivery / Estimasi Pengerjaan Downstream (Service Engine, Hari D)

1. **Nama fitur:** Service Engine (Hari D) & Mark Delivered
2. **Tujuan:** mengunci tanggal target penyelesaian saat Create Order (best-effort), dan menyediakan jalur menandai order "Delivered".
3. **Workflow:** `set_order_service` (dipicu dari Create Order) → `resolve_hari_d` (cari sampai 90 hari ke depan, lewati Minggu, cari tanggal dengan kapasitas tersisa) → update `orders.service_level/hari_d/service_selected_at` → insert `business_events` `order.service_selected`. Jika gagal, ditelan — `get_production_packet` fallback ke `created_at + 14 hari`. `mark_order_delivered` mensyaratkan stage `shipping` berstatus `completed`, lalu set `orders.current_state='follow_up'` (nilai enum yang di-reuse sebagai sinyal "Delivered").
4–9. *(Lihat rincian RPC/tabel di riset — `orders`, `production_capacity_calendar`, `production_stage_records`, `service_sla_rules`, `business_events`.)*
10. **Business rules:** hari kerja Senin–Sabtu (Minggu dikecualikan); hari tanpa baris kalender kapasitas dianggap terbuka (bukan blokir); window pencarian 90 hari.
11. **Catatan keamanan (fakta, bukan rekomendasi):** RPC di migrasi Service SLA Engine (`set_order_service`, `get_service_sla_rules`, dll.) **tidak memiliki statement `grant`/`revoke` eksplisit** di file migrasinya (beda dengan migrasi Inventory/Commercial yang eksplisit `revoke all from public` lalu `grant to authenticated`) — bergantung pada grant default Postgres.
12. **Status:** COMPLETE untuk jalur yang ada.
13. **File utama:** `src/lib/order/delivery.ts`, `src/lib/order/service.ts`, `supabase/migrations/20260728000000_add_service_sla_engine.sql`, `20260805000000_add_delivery_hotfix.sql`.

---

### 2.28 QR & WhatsApp Notifications

1. **Nama fitur:** QR Payload + Notifikasi
2. **Tujuan:** membangun tautan QR (tracking pelanggan & Production internal) dan (dimaksudkan) mengirim notifikasi WhatsApp otomatis saat order dibuat.
3. **Workflow/Status per bagian:**
   - QR payload string (`buildQrPayload`, `buildProductionQrPayload`, `buildCustomerJourneyUrl`) — COMPLETE (string saja, rendering gambar QR dilakukan `qrcode.react` di komponen client terpisah).
   - `notifyOrderCreated` — **STUB**: badan fungsi hanya `console.info('[notifications] WhatsApp send not yet implemented, skipping', payload)`.
   - Share WhatsApp manual (`CustomerJourneyShareActions`) — tautan `wa.me/...` yang dibuka manual oleh staff, **bukan** pengiriman server-side.
   - `notifyLowStock` (`src/lib/inventory/notifications.ts`) — **STUB** serupa, dan **tidak terhubung** ke event `inventory.low_stock` yang dibuat DB (tidak ada kode yang membaca event tsb lalu memanggil fungsi ini).
4–9. Tidak ada RPC/table untuk bagian stub (murni `console.info`); QR murni string building, tanpa DB.
10. **Business rules:** `formatPhoneForWhatsApp` mengonversi awalan `0`→`62`, tanpa validasi jumlah digit.
11. **Integrasi:** dipanggil dari `createOrderFromConsultation` (poin 11 di §2.22), hasilnya diabaikan (fungsi bukan async, tidak di-await).
12. **Status:** PARTIAL — QR/link manual lengkap; kedua "auto-notify" adalah stub eksplisit berlabel jelas di komentar sumbernya sendiri.
13. **File utama:** `src/lib/order/qr.ts`, `whatsapp.ts`, `notifications.ts`, `src/lib/inventory/notifications.ts`.

---

## 3. CAPABILITY MATRIX

| # | Fitur | Ada UI | Ada Persist | Ada RPC | Dibaca Downstream | Status |
|---|---|---|---|---|---|---|
| 1 | Customer Information | ✅ | ✅ | — | ✅ (search, order monitoring) | COMPLETE |
| 2 | Design Categories (11 kategori) | ✅ (admin, di luar cakupan) | ✅ | — | ✅ | COMPLETE |
| 3 | Model | ✅ | ✅ | — | ✅ | COMPLETE |
| 4 | Kerah | ✅ | ✅ | — | ✅ | COMPLETE |
| 5 | Manset | ✅ | ✅ | — | ✅ | COMPLETE |
| 6 | Pergelangan | ❌ tidak ada | — | — | — | TIDAK ADA |
| 7 | Cutting (Look Cutting) | ✅ | ✅ | — | ✅ (referensi tampilan Production) | COMPLETE |
| 8 | Variasi | ❌ tidak ada | — | — | — | TIDAK ADA |
| 9 | Material (Bahan) | ✅ | ✅ | — | ✅ (stok Inventory, reservasi) | COMPLETE (nama-match rapuh) |
| 10 | Warna | ✅ | ✅ | — | parsial (color tidak dipakai reservasi) | COMPLETE (colorName dead di reservasi) |
| 11 | Saku & Plaket | ✅ | ✅ | — | ✅ | COMPLETE |
| 12 | Kancing & Aksesori | ✅ | ✅ | — | ✅ | COMPLETE |
| 13 | Bordir & Handmade Zig-Zag | ✅ | ✅ | — | ✅ (opsional, tidak wajib utk render) | COMPLETE |
| 14 | Design Notes | ✅ | ✅ | — | ✅ | COMPLETE |
| 15 | Garment Blueprint (kontainer) | ✅ | — | — | — | COMPLETE |
| 16 | Fabric Quantity | ✅ | ✅ | ✅ (reserve_material_for_order) | tidak (tak ada tampilan balik) | COMPLETE (sempit) |
| 17 | Estimasi Harga | ✅ | ✅ (via Design Spec) | — | ✅ | COMPLETE |
| 18 | AI Preview / Render Context | ✅ | ❌ (tidak dipersist) | — | — | PARTIAL by design |
| 19 | Estimasi Pengerjaan | ✅ | ✅ | ✅ x2 | ✅ (4 layar) | COMPLETE |
| 20 | Event Information | ✅ | ✅ | — | ❌ (write-only) | PARTIAL (data mati downstream) |
| 21 | Estimation Validation | ✅ | ✅ (via snapshot) | — | ❌ setelah order | COMPLETE, non-blocking |
| 22 | Consultation Review (Approve) | ✅ | ✅ (1 event) | — | ❌ | Sempit/terisolasi |
| 23 | Create Order | ✅ | ✅ | ✅ x2 (best-effort) | ✅ | PARTIAL (tanpa transaksi, notif stub) |
| 24 | Price Snapshot | ✅ | ✅ (notes) + oportunistik (quotations) | ✅ (upsert) | ✅ | PARTIAL (quotation tidak terjamin ada) |
| 25 | Material Reservation | — | ✅ | ✅ | ✅ (dirilis Production) | COMPLETE (reservasi-saja) |
| 26 | Inventory Integration (deduction) | ✅ (Production) | ✅ | ✅ | — | PARTIAL (2 transaksi terpisah) |
| 27 | Commercial Integration | ✅ (Order Created + Owner OS) | ✅ | ✅ (9 RPC) | ✅ | PARTIAL (invoice=data saja) |
| 28 | Delivery/Hari D | ✅ | ✅ | ✅ | ✅ | COMPLETE |
| 29 | QR/WhatsApp | ✅ (QR, share manual) / ❌ (auto-notify) | — | — | — | PARTIAL (2 stub) |

---

## 4. FLOW DIAGRAM (TEKS)

```
[Check-in]
  customers (insert/search) --+
  consultations (insert, status='check_in') --+
        |
        v
[Measurement]  (di luar cakupan audit — hanya dilalui; status -> 'measurement' -> 'design')
        |
        v
[Design Studio]  (consultations.status masih 'design'/'' sampai eksplisit 'review')
  Model / LookCutting / Bahan+FabricQuantity / Warna / Kerah+Manset /
  Saku+Plaket / Aksesori / Bordir+Zigzag / Catatan
        | (setiap Save)
        v
  consultations.notes:
    ---LTOS_DESIGN_BLUEPRINT---        (key=value, notesCodec)
    ---LTOS_DESIGN_SPECIFICATION---    (JSON, id+harga ter-resolve, Price Snapshot)
    ---LTOS_FABRIC_QTY---              (JSON, quantityMeters)
        | (tombol "Lanjutkan")
        v  consultations.status = 'review'
[Consultation Review]
  EventInformationCard   -> ---LTOS_EVENT_INFO---
  EstimationCard         -> ---LTOS_FITTER_ENHANCEMENTS--- + refresh Design Specification
  EstimationValidationCard (turunan, non-blocking, tidak dipersist sendiri)
  DocumentUploader       -> Storage consultation-documents + ---LTOS_FITTER_ENHANCEMENTS---.documents[]
  PriceSummaryCard       (read-only, tombol bayar disabled)
  DecisionPanel:
    "Simpan Konsultasi" -> business_events (consultation.approved) [terminal, terisolasi]
    "Buat Pesanan"      -> createOrderFromConsultation()
        |
        v
[Create Order]  (6 panggilan sekuensial, tanpa transaksi)
  orders (insert, current_state='order')
  consultations.status = 'order_created'
  business_events x3 (order.created [snapshot lengkap], consultation.completed, workflow.order_created)
  set_order_service (best-effort)      -> orders.service_level/hari_d
  reserveInventory (best-effort)       -> materials.reserved_stock += qty  [physical_stock TETAP]
  notifyOrderCreated                   -> STUB (console.info saja)
        |
        v
[Order Created]
  QR + Customer Journey URL ditampilkan
  CustomerJourneyShareActions -> wa.me link (manual, staff yang klik)
  PaymentSummaryCard (on mount):
    upsertOrderQuotation -> quotations (upsert per order_id)   <-- titik pertama Price Snapshot jadi row nyata
    getOrderInvoice      -> tampilan invoice (data saja)
    recordOrderPayment   -> order_payments (insert)
        |
        v
[Owner Command Center] (di luar Fitter App)
  applyOrderDiscount / applyOrderKol / setOrderPriceOverride -> quotations
        |
        v
[Production]  (di luar cakupan audit — hanya titik sambung)
  stage 'material_prep' selesai -> releaseMaterialReservation()
    -> materials.physical_stock -= qty, reserved_stock -= qty   <-- BARU DI SINI stok fisik berkurang
  stage 'shipping' selesai -> mark_order_delivered() -> orders.current_state='follow_up'
```

---

## 5. DATA FLOW MATRIX (per field kunci)

| Field | Dipilih di | Disimpan di (storage) | Dipakai lagi oleh | Berhenti di | Source of Truth |
|---|---|---|---|---|---|
| Nama/Telepon/Alamat Customer | Check-in `NewCustomerForm` | `customers` (kolom native) | Search, Order Monitoring, WhatsApp share, Order Summary | Tidak berhenti — dipakai selamanya | `customers` table |
| Model/Kerah/Manset/Cutting/Saku/Plaket/Aksesori/Bordir/Zigzag | Design Studio selectors | `consultations.notes` (blok `---LTOS_DESIGN_BLUEPRINT---` & `---LTOS_DESIGN_SPECIFICATION---`) | Consultation Review (Garment Preview, Price Summary), Create Order (snapshot) | `business_events` (`order.created`, event_data beku) | `business_events.order.created` setelah order dibuat; `consultations.notes` sebelum itu |
| Warna (nama) | Design Studio `ColorSelector` | sama seperti di atas | ditampilkan lagi; **tidak dipakai** RPC reservasi (parameter mati) | sama seperti di atas | sama, tapi tidak pernah menyentuh `materials` |
| Fabric Quantity (meter) | Design Studio `FabricQuantityField` | `consultations.notes` (`---LTOS_FABRIC_QTY---`) | `createOrderFromConsultation` -> `reserveInventory` | `materials.reserved_stock` (lalu `physical_stock` saat rilis Production) | `materials` table (reserved_stock/physical_stock) |
| Design Notes | Design Studio `DesignNotesField` | `consultations.notes` (`---LTOS_DESIGN_SPECIFICATION---.notes`) | `DesignSummaryPanel`, Order snapshot | `business_events.order.created.designSpecification.notes` | `business_events` setelah order |
| Estimasi Pengerjaan | Consultation Review `EstimationCard` | `---LTOS_FITTER_ENHANCEMENTS---` & refresh Design Spec | `createOrder.ts` (`set_order_service`), Order Summary, Production Packet | `orders.service_level`/`hari_d` | `orders` table |
| Event Information | Consultation Review `EventInformationCard` | `---LTOS_EVENT_INFO---` | `EstimationValidationCard` (in-memory saja), Order snapshot | `business_events.order.created.eventInformation` | **mati** — tidak dibaca lagi setelah ini |
| Price Snapshot | Design Studio (`buildDesignSpecification`) | `consultations.notes` | `PriceSummaryCard`, `EstimasiHargaPanel` | `quotations` (oportunistik, saat Order Created dirender) | `quotations` **jika** dibuat; jika tidak, hanya `business_events` snapshot |
| Dokumen Referensi Customer | Consultation Review `DocumentUploader` | Storage `consultation-documents` + `---LTOS_FITTER_ENHANCEMENTS---.documents[]` | Production (`get_production_customer_notes`), Order Summary | tetap dapat diakses selama order ada | `consultations.notes` (tidak disalin ke `business_events`) |
| Customer Photos | (tidak ada UI penulis di Consultation Review) | tipe data ada, tidak pernah terisi dari jalur ini | — | — | **N/A — tidak pernah tertulis dari Fitter App path yang diaudit** |

---

## 6. INTEGRATION MATRIX

| Modul Sumber | Modul Tujuan | Mekanisme | Arah | Catatan |
|---|---|---|---|---|
| Check-in | Measurement | `router.push` | satu arah | tombol "Lanjutkan ke Pengukuran" |
| Measurement | Design Studio | `consultations.status` transition | satu arah | di luar cakupan detail |
| Design Studio | Consultation Review | `router.push` setelah `persist('review')` | satu arah | |
| Design Studio | Inventory | `fetchMaterialStockByName` (read) | baca saja | pencocokan nama, bukan `material_id` |
| Consultation Review | Create Order (`src/lib/order`) | pemanggilan fungsi langsung (bukan navigasi lalu proses ulang) | langsung | `createOrderFromConsultation` dipanggil dari halaman yang sama |
| Create Order | Inventory | `reserveInventory` -> RPC | satu arah, best-effort | error ditelan |
| Create Order | Service Engine | `setOrderService` -> RPC | satu arah, best-effort | error ditelan |
| Create Order | Commercial Engine | **tidak ada** panggilan langsung | — | hanya terhubung via `order_id` yang sama |
| Order Created (`PaymentSummaryCard`) | Commercial Engine | `upsertOrderQuotation`, `getOrderInvoice`, `recordOrderPayment` | dua arah | titik pertama Commercial Engine benar-benar dipakai |
| Owner Command Center | Commercial Engine | `applyOrderDiscount`/`applyOrderKol`/`setOrderPriceOverride` | dua arah | di luar Fitter App |
| Production | Inventory | `releaseMaterialReservation` (saat stage `material_prep`) | satu arah | mengurangi `physical_stock` |
| Production | Delivery | `mark_order_delivered` (saat stage `shipping` selesai) | satu arah | |
| Inventory (`inventory.low_stock` event) | Notifications | **tidak terhubung** | — | event dibuat, tidak ada consumer di `src/` |
| Create Order | Notifications (WhatsApp auto) | `notifyOrderCreated` | **stub, tidak ada efek** | |
| Design Studio | AI Render Engine (masa depan) | `RenderContext` in-memory, tidak dipersist | tidak ada — belum dibangun | |

---

## 7. BUSINESS RULES MATRIX

| Aturan | Lokasi kode | Ringkasan |
|---|---|---|
| Kategori Design Master Data terkunci pada 11 nilai | `design_master_options_category_check` (migrasi), `masterData.ts:14-19` | Tidak bisa tambah kategori baru dari UI |
| Item Master Data hanya boleh dihapus jika belum pernah dipakai | `masterData.ts:277-327` (`isMasterDataOptionInUse`) | Cek `business_events` (order.created, design.saved/completed) + scan seluruh `consultations.notes` |
| Fabric Quantity: nilai manual, bukan kalkulasi | `FabricQuantityField.tsx:8-12` | Tidak ada formula dari pengukuran |
| Reservasi diskip jika quantity null/≤0 | `inventory.ts:14-17` | Tidak memanggil RPC sama sekali |
| Reservasi tidak membedakan warna | `inventory.ts:5-12` | `colorName` diterima tapi tidak diteruskan |
| Reservasi tidak mengurangi stok fisik | migrasi inventory (komentar SQL) | Hanya `reserved_stock` |
| Pengurangan stok fisik hanya di stage `material_prep` | `ProductionPacketWorkspace.tsx:213-219` | Kondisional, bisa terlewat |
| Duplikasi order dicegah per consultation | `createOrder.ts:93-98` | Guard status `order_created` |
| `current_state` order literal `'order'` | `createOrder.ts:111-113` | Karena constraint DB tidak punya `'confirmed'` |
| Estimasi Pengerjaan → Service Level: mapping hardcoded | `service.ts:33-50` | `'Standard'/'Fast'/'Very Fast'` → enum |
| Estimation Validation: SAFE/RISK/IMPOSSIBLE | `estimationValidation.ts:29-55` | Berdasarkan `bufferDays` & `overall_status`; non-blocking |
| Hari D: hari kerja Senin–Sabtu, window 90 hari | `20260728000000...sql` | Minggu dikecualikan |
| Delivered mensyaratkan stage `shipping` selesai | `mark_order_delivered` | Idempotent via `current_state<>'follow_up'` |
| Diskon/KOL/Override: role admin/owner + cap dari `commercial_rules` | `20260804000002`, `20260811000000` | Cap default 100% (tidak membatasi sampai diubah) |
| Override butuh alasan non-kosong, bisa dimatikan (`owner_override_enabled`) | `20260804000002:226-228`, `20260811000000:348-351` | |
| Pembayaran: aturan `full_payment_only`/`min_dp_percent`, **tanpa role gate** | `20260811000000:379-425` | `record_order_payment` bisa dipanggil `anon` |
| Total quotation dibulatkan sesuai `price_rounding_nearest` (kecuali override) | `recompute_quotation_total` | |
| RenderContext readiness: 9 field wajib, Bordir/Zigzag opsional | `renderContext.ts:31-41` | |
| Hard-delete Master Data hanya jika belum pernah dipakai | `masterData.ts:329-338` | Re-cek di level fungsi, bukan hanya UI |

---

## 8. MASTER DATA YANG DIPAKAI

- **`design_master_options`** — satu tabel untuk 11 kategori (lihat §2.2). Kolom relevan Fitter App: `id, category, name, metadata, sort_order, is_active, photo_url, selling_points, internal_notes, price, ai_dna, render_recipe`.
  - `ai_dna` (kolom, default DB) — lifecycle `pending/draft/approved/needs_regeneration`, dipakai Master Data Editor (admin), **bukan** Fitter App/Design Studio langsung. Struktur: `geometry, construction, appearance, materials, stitching, placement, negativeRules, metadata`.
  - `render_recipe` (kolom, default DB) — status `empty/configured`, struktur kamera/pose/lighting/dll., **belum ada UI/mutation path** (komentar `masterData.ts:86-89`), dan **belum ada Component DNA** untuk mengisi field `garment/fabricIdentity/stitching/embroidery` (kosong sampai sprint mendatang).
  - `Recipe Composer` (`src/lib/design/recipeComposer/composer.ts`) — logika merge/validate murni, **tidak dipanggil dari UI manapun** yang teraudit (tidak ada import dari halaman Design Studio/Consultation Review).
  - `Prompt Builder` (`src/lib/design/promptBuilder/`) — hanya file `builder.ts`/`serializer.ts`/`types.ts`, tidak diverifikasi dipanggil dari alur Fitter App (di luar cakupan pemanggilan yang ditemukan).
- **`service_sla_rules`** — dibaca via `get_service_sla_rules` (Estimasi Pengerjaan).
- **`materials`** / **`material_categories`** — dibaca Fabric Selector (stok), ditulis via reservasi/rilis.
- **`commercial_rules`** — singleton, dibaca semua RPC Commercial Engine.

---

## 9. RPC YANG DIPAKAI (seluruh alur yang diaudit)

| RPC | Dipanggil dari | Fungsi |
|---|---|---|
| `get_service_sla_rules` | `EstimationCard` | Ambil daftar tingkat layanan & SLA |
| `preview_service_validation` | `EstimationCard` | Preview ketersediaan/estimasi selesai |
| `set_order_service` | `createOrder.ts` (best-effort) | Kunci `service_level`/`hari_d` |
| `resolve_hari_d` | internal (dipanggil `set_order_service`) | Cari slot kapasitas |
| `reserve_material_for_order` | `reserveInventory` | Tambah `reserved_stock` |
| `release_material_reservation` | Production (`material_prep` selesai) | Kurangi `reserved_stock` + `physical_stock` |
| `inventory_adjust_stock` | Inventory workspace manual (di luar Fitter App) | stock_in/out/adjustment |
| `mark_order_delivered` | Delivery (dipicu manual/production) | Set `current_state='follow_up'` |
| `upsert_order_quotation` | `PaymentSummaryCard` (on mount) | Persist Price Snapshot sebagai `quotations` |
| `apply_order_discount` | Owner Command Center | Diskon |
| `apply_order_kol` | Owner Command Center | Diskon KOL |
| `set_order_price_override` / `clear_order_price_override` | Owner Command Center | Override harga |
| `recompute_quotation_total` | internal | Hitung ulang total |
| `record_order_payment` | `PaymentSummaryCard` | Rekam pembayaran |
| `get_order_payment_history` | **tidak dipanggil dari frontend manapun** | (dead dari sisi client) |
| `get_order_invoice` | `PaymentSummaryCard`, `OrderCommercialSection` | Rakit data invoice |
| `get_commercial_rules` / `set_commercial_rules` | seluruh RPC Commercial (internal) / Owner OS | Baca/tulis aturan komersial |
| `get_production_customer_notes` | Production, Order Summary | Baca dokumen referensi customer |
| `generate_consultation_number` (disebut di komentar, bukan RPC eksplisit dari client) | DB-side saat insert `consultations` | Nomor konsultasi otomatis |

---

## 10. TABLE YANG DIPAKAI

`customers`, `consultations`, `orders`, `business_events`, `design_master_options`, `materials`, `material_categories`, `material_stock_movements`, `quotations`, `order_payments`, `commercial_rules`, `service_sla_rules`, `production_capacity_calendar`, `production_stage_records`, `profiles`.

Catatan schema (dari grep migrasi): **tidak ditemukan `CREATE TABLE` untuk `orders`, `business_events`, `consultations`, `customers`, atau `quotations`** di 46 file migrasi yang ada — hanya `ALTER TABLE` inkremental. Skema dasar tabel-tabel ini berada di luar riwayat migrasi yang terlacak dalam audit ini.

---

## 11. REUSE YANG DIPAKAI

- **`OptionGroup.tsx`** — dipakai ulang oleh `CollarCuffSelector`, `PocketPlaketSelector`, `EmbroideryZigzagSelector` (pola pill-button dua kategori berdampingan).
- **`SpecDetailModal.tsx`** — satu modal dipakai oleh seluruh selector (Model, LookCutting, Fabric, Color, Collar/Cuff, Pocket/Plaket, Button, Embroidery/Zigzag) via `onViewSpec` callback yang sama.
- **Marker-block codec pattern** (`---LTOS_...---` di `consultations.notes`) — dipakai oleh `notesCodec.ts`, `designSpecification/codec.ts`, `fabricQuantityCodec.ts`, `fitterEnhancementsCodec.ts`, `eventInformationCodec.ts` — teknik identik, blok independen, tidak saling mengganggu.
- **`formatRupiah`** (`src/lib/format/money.ts`) — dipakai `EstimasiHargaPanel` dan seluruh tampilan Commercial Engine.
- **`fetchMaterialStockByName`** — satu fungsi dipakai Design Studio (`FabricSelector`) untuk baca stok; pola serupa (`uploadMasterDataPhoto`/`uploadMaterialPhoto`) dipakai ulang antara Master Data dan Material Master.
- **Pola upload Storage deterministik + upsert** — dipakai `uploadMasterDataPhoto`, `uploadMaterialPhoto`, `uploadConsultationPhoto`/`uploadConsultationDocument` (variasi kecil: upsert true/false tergantung kebijakan RLS bucket).
- **`canManageMasterData(role)`** — satu sumber kebenaran dipakai baik di gating UI (`CheckInSidebar`, tombol "Kelola Master Data" Design Studio) maupun (disebut) RLS DB.
- **Pola "OrderCreatedLockNotice"** — dipakai ulang oleh Design Studio dan Consultation Review page untuk mengunci akses begitu `consultation.status==='order_created'`.
- **`findOrderIdForConsultation`** — dipakai kedua halaman yang sama untuk mengarahkan ke order yang sudah terbentuk.

---

## 12. FILE STRUCTURE

```
src/app/workspace/
  check-in/                          (Customer Information)
    page.tsx, actions.ts, types.ts, components/*.tsx
  measurement/[consultationId]/      (di luar cakupan detail)
  design-studio/[consultationId]/
    page.tsx
  consultation-review/[consultationId]/
    page.tsx
  order-summary/[orderId]/
    page.tsx

src/components/workspace/design-studio/
  DesignStudioWorkspace.tsx          (orkestrator state + persist())
  GarmentBlueprintPanel.tsx          (kontainer 9 accordion)
  ModelSelector.tsx / LookCuttingSelector.tsx / FabricSelector.tsx /
  ColorSelector.tsx / CollarCuffSelector.tsx / PocketPlaketSelector.tsx /
  ButtonSelector.tsx / EmbroideryZigzagSelector.tsx / DesignNotesField.tsx
  FabricQuantityField.tsx, fabricQuantityCodec.ts
  EstimasiHargaPanel.tsx, DesignSummaryPanel.tsx
  AIPreviewPanel.tsx
  OptionGroup.tsx, Accordion.tsx, SpecDetailModal.tsx
  notesCodec.ts, types.ts

src/components/workspace/consultation-review/
  ConsultationReviewWorkspace.tsx    (orkestrator)
  EstimationCard.tsx, fitterEnhancementsCodec.ts
  EventInformationCard.tsx, eventInformationCodec.ts
  EstimationValidationCard.tsx
  ReadinessGauge.tsx, DocumentUploader.tsx, PriceSummaryCard.tsx
  DecisionPanel.tsx, ReviewFooter.tsx
  MeasurementSummaryCard.tsx, GarmentPreviewSection.tsx, CustomerSummaryCard.tsx
  ConsultationNotesCard.tsx, TopNavBar.tsx

src/lib/
  design/masterData.ts               (Product Knowledge Base)
  design/aiDna/, renderRecipe/, recipeComposer/, promptBuilder/  (fondasi AI Render, belum terhubung UI Fitter App)
  designSpecification/               (buildSpecification.ts, codec.ts, types.ts — Price Snapshot)
  customerProfile/renderContext.ts   (RenderContext, tidak dipersist)
  order/createOrder.ts, service.ts, inventory.ts, delivery.ts,
        notifications.ts, qr.ts, whatsapp.ts, lookup.ts, types.ts
  inventory/materials.ts, stock.ts, materialCalculator.ts, types.ts, access.ts, notifications.ts
  commercial/client.ts, types.ts, summary.ts
  consultation/media.ts

supabase/migrations/
  20260719000000_add_master_data_price_and_categories.sql
  20260720000000_add_inventory.sql
  20260728000000_add_service_sla_engine.sql
  20260804000002_add_commercial_engine.sql
  20260805000000_add_delivery_hotfix.sql
  20260811000000_add_business_rules_runtime_config.sql
  (+ 40 file migrasi lain, di luar rincian langsung Fitter App/Design Studio)
```

---

## 13. STATUS TIAP FITUR (ringkas)

| Fitur | Status |
|---|---|
| Customer Information | COMPLETE |
| Design Categories (arsitektur) | COMPLETE |
| Model, Kerah, Manset, Cutting, Saku, Plaket, Aksesori, Bordir, Handmade Zig-Zag | COMPLETE |
| Pergelangan | TIDAK ADA (bukan bagian repository) |
| Variasi | TIDAK ADA (bukan bagian repository) |
| Material (Bahan) | COMPLETE — pencocokan stok berbasis nama identik, bukan `material_id` |
| Warna | COMPLETE sebagai pilihan; `colorName` dead code di jalur reservasi |
| Design Notes | COMPLETE |
| Garment Blueprint (kontainer) | COMPLETE |
| Fabric Quantity | COMPLETE (sempit) — tidak ada validasi stok, tidak ada tampilan balik |
| Estimasi Harga | COMPLETE |
| AI Preview / Render Context | PARTIAL by design — fondasi saja, tidak ada AI |
| Estimasi Pengerjaan | COMPLETE |
| Event Information | PARTIAL — tersimpan tapi tidak pernah dibaca ulang |
| Estimation Validation | COMPLETE, non-blocking |
| Consultation Review (Approve) | Sempit/terisolasi — tidak mengubah status, tidak dibaca modul lain |
| Create Order | PARTIAL — inti lengkap; tidak transaksional; notifikasi stub |
| Price Snapshot → Order | PARTIAL — persist `quotations` oportunistik, bukan bagian transaksi Create Order |
| Material Reservation | COMPLETE (reservasi-saja); parameter warna dead |
| Inventory Integration (deduksi fisik) | PARTIAL — dua transaksi terpisah, tidak dijamin berpasangan |
| Commercial Integration | PARTIAL — mesin lengkap dan diberi aturan; invoice = data saja, tanpa PDF |
| Delivery/Hari D | COMPLETE |
| QR / WhatsApp Notifications | PARTIAL — QR & share manual lengkap; 2 auto-notify stub |

---

## 14. KESIMPULAN AKHIR

Repository saat ini memiliki **Design Studio yang lengkap secara struktural** untuk seluruh 11 kategori pilihan desain yang benar-benar terdaftar di `design_master_options` (Model, Look Cutting, Kerah, Manset, Plaket, Saku, Bahan, Warna Bahan, Aksesori, Bordir, Handmade Zig-Zag), masing-masing dengan mekanisme identik: baca master data aktif → pilih → simpan sebagai pasangan nama (blok `notes`) dan ID+harga beku (Design Specification) → tampil di ringkasan & estimasi harga. **"Pergelangan" dan "Variasi" tidak eksis di repository ini dalam bentuk apa pun** — bukan kategori, bukan field, bukan komponen.

Rantai nilai dari pilihan desain menuju uang dan stok memiliki **satu pola berulang**: setiap tahap menyimpan datanya sendiri secara lengkap, tetapi **sambungan antar-tahap berikutnya seringkali best-effort, non-transaksional, atau oportunistik**, bukan dijamin oleh constraint database:

- Fabric Quantity → Material Reservation: aktif sejak Sprint V1.2.1, namun berhenti di `reserved_stock`; pengurangan `physical_stock` bergantung pada operator Production menyelesaikan stage `material_prep` secara terpisah, tanpa jaminan pasangan.
- Price Snapshot → Quotation: baris `quotations` baru tercipta saat komponen `PaymentSummaryCard` di halaman Order Created benar-benar dirender — bukan bagian dari transaksi Create Order.
- Create Order sendiri terdiri dari 6 operasi Supabase berurutan tanpa transaksi/rollback, dengan dua panggilan best-effort (Service Engine, Inventory) yang kegagalannya hanya dicatat ke console.
- Dua titik notifikasi otomatis (`notifyOrderCreated`, `notifyLowStock`) adalah stub eksplisit tanpa efek nyata, dinyatakan sebagai demikian di komentar kode itu sendiri.
- Event Information dan hasil Estimation Validation tersimpan lengkap tetapi tidak pernah dibaca kembali oleh layar manapun setelah Create Order — data tersebut secara efektif menjadi arsip satu-arah di dalam `business_events`.

Commercial Engine dan Service/Delivery Engine masing-masing merupakan modul yang **matang dan diberi aturan server-side yang dapat dikonfigurasi** (`commercial_rules`, `service_sla_rules`), namun keduanya terhubung ke Create Order hanya melalui kesamaan `order_id`/`estimatedProductionSpeed`, bukan lewat pemanggilan langsung yang tegas dari `createOrder.ts` ke domain masing-masing (Commercial khususnya: tidak ada satu baris kode pun di `src/lib/order/` yang mengimpor dari `src/lib/commercial/`).

Dokumen ini mencerminkan kondisi repository pada commit yang aktif saat audit dilakukan, dibangun murni dari pembacaan source code dan migrasi SQL — tanpa asumsi, tanpa rekomendasi, tanpa perubahan kode atau database.
