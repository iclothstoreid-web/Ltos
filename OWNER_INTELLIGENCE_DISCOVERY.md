# LTOS — Owner Intelligence Discovery
## Sprint N.0 · Owner OS Audit

**Date:** 2026-08-21  
**Authority:** Principal Product Architect / Enterprise UX Architect / Business Intelligence Architect  
**Basis:** ARCHITECTURE_LOCK_V1.md + Repository Source of Truth  
**Method:** Discovery Only — No Code, No Migration, No New RPC, No New Dashboard

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Engine Audit by Domain](#2-engine-audit-by-domain)
3. [Owner Decision Matrix](#3-owner-decision-matrix)
4. [Decision Coverage](#4-decision-coverage)
5. [Existing Intelligence](#5-existing-intelligence)
6. [Missing Intelligence](#6-missing-intelligence)
7. [Decision Priority](#7-decision-priority)
8. [Reuse Opportunity](#8-reuse-opportunity)
9. [Recommendation](#9-recommendation)

---

## 1. Executive Summary

LTOS V1 telah membangun **10 engine runtime** yang matang dan teruji. Namun dari sudut pandang **Owner** (pemilik bisnis), sistem saat ini memiliki **asimetri informasi**: engine menghasilkan data teknis yang kaya, tetapi tidak semuanya diterjemahkan menjadi keputusan bisnis yang dapat ditindaklanjuti.

### Skor Kesiapan Owner OS

| Dimensi | Skor | Keterangan |
|---------|------|------------|
| **Visibilitas Produksi** | 8/10 | Owner bisa melihat bottleneck, SLA risk, kanban |
| **Visibilitas Keuangan** | 6/10 | Revenue, cash collected, outstanding ada, tetapi biaya produksi tidak terlihat |
| **Visibilitas Kapasitas** | 7/10 | Capacity dashboard ada, tetapi tidak terkait langsung dengan keputusan "terima/tolak order" |
| **Visibilitas Material** | 4/10 | Low stock terlihat, tetapi fabric usage, reorder point, biaya material per order tidak |
| **Keputusan Harga** | 5/10 | Owner bisa override harga, tetapi tidak bisa melihat margin per order |
| **Keputusan SDM** | 5/10 | Owner lihat KPI operator, tetapi tidak bisa simulasi "tambah operator" |
| **Keputusan SLA** | 6/10 | SLA risk terlihat, tetapi tidak ada simulasi "percepat order" |
| **Keputusan Strategis** | 3/10 | Tidak ada profitabilitas, tren, forecasting, atau what-if simulation |

### Temuan Utama

1. **Engine sudah matang, tetapi Owner tidak bisa mengambil keputusan langsung dari dashboard.** Sebagian besar informasi bersifat *read-only monitoring*, bukan *decision support*.

2. **Missing link terbesar: Biaya.** Owner tidak bisa melihat biaya produksi per order, biaya material terpakai, atau margin. Ini adalah *blind spot* kritis untuk bisnis garment.

3. **Keputusan "terima/tolak order" tidak memiliki dasar data.** Capacity dashboard menunjukkan utilization, tetapi tidak menjawab "apakah saya bisa menerima order baru hari ini?".

4. **Tidak ada simulasi.** Owner tidak bisa melakukan *what-if*: "Bagaimana jika saya tambah 2 operator?" atau "Bagaimana jika saya percepat SLA order ini?".

5. **Commercial engine kuat, tetapi tidak terhubung ke production.** Owner lihat revenue dan outstanding, tetapi tidak bisa melihat profitabilitas per order karena biaya produksi tidak dilacak.

---

## 2. Engine Audit by Domain

### 2.1 Commercial Engine

**Engine Capability:**
- 7+ RPC: upsert quotation, apply discount, apply KOL, price override, record payment, get invoice, recompute total
- Commercial Rules runtime config (min DP, max discount, KOL, rounding)
- Invoice foundation with line items, payment tracking, balance due

**Can Owner See Results?**
- ✅ Commercial Center page: Sales, Cash Collected, Outstanding, DP Outstanding
- ✅ Engine Overview Section: Revenue Today, Revenue This Month
- ✅ KPI Cards: Revenue Today, Revenue This Month
- ⚠️ Invoice detail available via Order Detail Modal (drill-down)

**Can Owner Make Decisions?**
- ✅ Set commercial rules (min DP, max discount, KOL, override, invoice notes)
- ✅ Record payments
- ✅ Apply discount/KOL/override per order
- ❌ **Cannot see margin per order** (no cost data linked)
- ❌ **Cannot see profitability trends** (revenue - cost = profit tidak ada)
- ❌ **Cannot see payment aging** (how long has an invoice been outstanding?)

**Missing Information:**
- Biaya material per order (fabric usage tidak dihitung)
- Biaya tenaga kerja per order (operator cost tidak dilacak)
- Margin per order (harga jual - biaya)
- Payment aging report (piutang berdasarkan umur)
- Revenue forecasting

---

### 2.2 Production Engine

**Engine Capability:**
- 8 production stages LOCKED, append-only stage records
- Start stage, complete stage, assign operator, emergency override
- Production Rules runtime config (QR required, QC checklist, max alter, alter return stage, delivery confirmation, auto-close)

**Can Owner See Results?**
- ✅ Production Live Kanban (Waiting, Cutting, Sewing, QC, Ready)
- ✅ Bottleneck Panel (severity-based, with suggested actions)
- ✅ Executive Briefing (rekomendasi otomatis berdasarkan bottleneck)
- ✅ Agenda Panel (QC review, delivery ready)

**Can Owner Make Decisions?**
- ✅ Assign operator to stage (via Bottleneck Panel → AssignOperatorModal)
- ✅ Emergency override per order/stage
- ✅ Set production rules (QR, QC, alter, delivery config)
- ❌ **Cannot see which orders are stuck and why** (reason for delay tidak terlihat)
- ❌ **Cannot reprioritize orders** (no manual priority override for production queue)
- ❌ **Cannot see production cost per order** (operator hours tidak dilacak ke biaya)

**Missing Information:**
- Per-order production timeline (visual Gantt)
- Stage dwell time per order (berapa lama di setiap stage)
- Operator assignment history per order (siapa mengerjakan apa)
- Production cost per order (estimasi vs aktual)
- Rework rate per order/operator

---

### 2.3 Capacity Engine

**Engine Capability:**
- Computed max_orders (auto-calculated from active operators)
- Manual override with mandatory reason + audit log
- Capacity dashboard (total capacity, used, remaining, utilization %)
- Operator overload detection

**Can Owner See Results?**
- ✅ Capacity Dashboard in Engine Overview (total, used, remaining, utilization)
- ✅ Capacity Calendar page in Business Rules
- ✅ Capacity warnings in Today's Action (over capacity, full days, operator overload)
- ❌ **Cannot see "can I accept a new order today?"** (no real-time admission check)

**Can Owner Make Decisions?**
- ✅ Override capacity per date (with reason)
- ✅ View override audit log
- ❌ **Cannot simulate capacity impact** (what if I add 2 operators?)
- ❌ **Cannot see order acceptance decision support** (dashboard tells utilization, not admission)
- ❌ **Cannot see backlog by SLA impact** (how many orders will go over SLA if I accept more?)

**Missing Information:**
- Order acceptance recommendation (terima/tolak berdasarkan kapasitas)
- Capacity impact simulation (what-if analysis)
- SLA risk projection for new orders (jika terima order hari ini, kapan selesai?)
- Operator requirement planning (berapa operator tambahan yang dibutuhkan)

---

### 2.4 Queue Engine (Queue Recommendation)

**Engine Capability:**
- Queue position and priority rank per order (from get_sla_risk_orders)
- Business Priority classification (critical, high, normal)
- Queue Recommendation section in Decision Center

**Can Owner See Results?**
- ✅ Queue Recommendation Section (rekomendasi antrian per order)
- ✅ Priority Today Section (risk level buckets)
- ✅ Business Priority Board (priority-based grouping)

**Can Owner Make Decisions?**
- ✅ View which orders need priority
- ❌ **Cannot manually reorder queue** (no drag-to-prioritize)
- ❌ **Cannot set manual priority override** (business_priority is auto-computed)
- ❌ **Cannot see queue impact of decisions** (if I prioritize order A, order B will be delayed by X hours)

**Missing Information:**
- Queue reorder capability (manual priority)
- Impact analysis of reprioritization
- Estimated completion per order (beyond SLA classification)
- Bottleneck projection (where will the next bottleneck form?)

---

### 2.5 KPI Engine

**Engine Capability:**
- 6+ RPC: KPI Dashboard, Operator KPI List, Divisi KPI List, Operator KPI Detail, Capacity Dashboard, Bottleneck Dashboard
- Operator performance (efficiency, utilization, avg duration)
- Divisi-level breakdown
- Bottleneck detection (slowest stage, most backlogged, busiest operator)

**Can Owner See Results?**
- ✅ KPI Operator page (full operator list with performance metrics)
- ✅ KPI Fitter page
- ✅ Divisi KPI breakdown
- ✅ Bottleneck Summary in Decision Center
- ✅ Operator drill-down (OrderDetailModal, OperatorDetailModal)
- ✅ Artisan Performance Grid in Dashboard

**Can Owner Make Decisions?**
- ✅ View operator performance
- ✅ View divisi performance
- ❌ **Cannot compare operators side-by-side** (no comparison view)
- ❌ **Cannot set operator performance targets** (no target KPI setting)
- ❌ **Cannot see trend over time** (KPI is snapshot, not historical)
- ❌ **Cannot identify training needs** (no skill gap analysis)

**Missing Information:**
- KPI trend over time (line chart, not just snapshot)
- Operator comparison view
- Performance target setting
- Skill matrix / capability mapping
- Training need identification

---

### 2.6 Business Rules Engine

**Engine Capability:**
- 5 Runtime Config sets: Commercial, Production, Return, Notification, Capacity
- Full CRUD for each via RPC (get / set)
- Singleton pattern (one config, live-read by engines)

**Can Owner See Results?**
- ✅ Business Rules Hub (6 cards: Commercial, Production, Capacity, Return, Service, Notification)
- ✅ Individual rule pages for each set
- ✅ Capacity Calendar management

**Can Owner Make Decisions?**
- ✅ Change all business rules via UI
- ❌ **Cannot see rule change history** (no audit log for rule changes — only capacity override has audit)
- ❌ **Cannot see rule impact** (if I change min DP, which orders are affected?)
- ❌ **Cannot schedule rule changes** (no effective date)

**Missing Information:**
- Rule change audit log (who changed what and when)
- Rule impact analysis (what orders will be affected by this change)
- Rule scheduling (effective date for rule changes)
- Rule validation (verify rule consistency before applying)

---

### 2.7 Notification Engine

**Engine Capability:**
- RPC-based assignment notifications (kiosk-wide, no per-operator login)
- list_pending_assignments, mark_notification_read
- Notification rules config (assignment_notification_enabled)

**Can Owner See Results?**
- ⚠️ Notifications are kiosk-wide — Owner doesn't see notifications
- ✅ Notification rules can be configured

**Can Owner Make Decisions?**
- ✅ Enable/disable assignment notifications
- ❌ **Cannot see notification history**
- ❌ **Cannot send manual notifications to operators**
- ❌ **Cannot receive notifications themselves** (no Owner notification inbox)

**Missing Information:**
- Owner notification inbox (alerts for critical events)
- Manual broadcast to kiosk
- Notification delivery status
- Critical event alerting (SLA breach, stock out, etc.)

---

### 2.8 Customer Engine (Journey)

**Engine Capability:**
- Token-based public customer portal
- 5 Milestones LOCKED, 2 delivery sub-states
- Customer photos, timeline, shipping info

**Can Owner See Results?**
- ✅ Customer journey is customer-facing, not Owner-facing
- ⚠️ Owner can see journey via customer token (manually)
- ❌ **No aggregated customer experience view for Owner**

**Can Owner Make Decisions?**
- ❌ **Cannot see NPS or satisfaction data**
- ❌ **Cannot see customer communication history aggregated**
- ❌ **Cannot see repeat customer rate**

**Missing Information:**
- Customer satisfaction overview
- Repeat customer rate
- Customer communication summary
- NPS or feedback aggregation

---

### 2.9 Inventory Engine

**Engine Capability:**
- Materials CRUD with categories, stock movements, pricing
- Low stock detection (available_stock <= min_stock)
- Material stock badge for Fitter App (read-only)
- Estimation cost templates

**Can Owner See Results?**
- ✅ Inventory Dashboard (total material, stok menipis count, reserved, activity)
- ✅ Material list with stock levels
- ✅ Low stock items in Bottleneck Panel (kritis severity)
- ✅ Stock movement history

**Can Owner Make Decisions?**
- ✅ Manage materials (CRUD)
- ✅ Manage categories
- ✅ View stock movements
- ❌ **Cannot see reorder recommendation** (when to reorder, how much)
- ❌ **Cannot see fabric usage per order** (quantityMeters always null — no-op)
- ❌ **Cannot see material cost per order** (harga material tidak di-link ke production)
- ❌ **Cannot see inventory value** (total nilai stok)

**Missing Information:**
- Reorder point recommendation
- Fabric usage calculator per order (quantityMeters — planned but no-op)
- Material cost allocation per order
- Inventory turnover rate
- Total inventory value
- Supplier performance

---

## 3. Owner Decision Matrix

### 3.1 Keputusan Operasional Harian

| Keputusan | Engine Pendukung | Status | Informasi yang Hilang |
|-----------|-----------------|--------|----------------------|
| **Tambah operator?** | Capacity, KPI | ⚠️ Parsial | Simulasi: jika tambah N operator, kapasitas naik X%. Biaya tambahan vs revenue |
| **Lembur?** | Capacity | ❌ Tidak | Tidak ada mekanisme lembur. Tidak ada tracking lembur operator |
| **Tolak order?** | Capacity, SLA | ⚠️ Parsial | Dashboard tidak memberikan rekomendasi "terima/tolak". Owner harus hitung manual |
| **Percepat order?** | Production, SLA | ⚠️ Parsial | SLA risk terlihat, tetapi tidak ada mekanisme "percepat" selain emergency override yang sifatnya audit |
| **Ubah SLA?** | Service Rules | ❌ Tidak | SLA di-set per order (standard/fast/very_fast). Owner tidak bisa mengubah SLA order yang sudah berjalan |
| **Ubah harga?** | Commercial | ✅ Ya | Price override, discount, KOL — semua sudah ada |
| **Ubah kapasitas?** | Capacity | ✅ Ya | Override per date dengan mandatory reason |
| **Reorder material?** | Inventory | ❌ Tidak | Tidak ada reorder point recommendation. Owner harus monitor stok manual |
| **Assign operator?** | Production, Notification | ✅ Ya | Assign operator ke stage via Bottleneck Panel |

### 3.2 Keputusan Bisnis Strategis

| Keputusan | Engine Pendukung | Status | Informasi yang Hilang |
|-----------|-----------------|--------|----------------------|
| **Naikkan harga?** | Commercial | ⚠️ Parsial | Owner bisa ubah pricing di master data, tetapi tidak tahu margin saat ini |
| **Tambah lini produk?** | Master Data | ❌ Tidak | Tidak ada data permintaan pasar, tidak ada analisis produk terlaris |
| **Evaluasi operator?** | KPI | ⚠️ Parsial | Lihat performa, tetapi tidak ada benchmark atau target |
| **Evaluasi profit?** | Commercial, Inventory | ❌ Tidak | Tidak ada P&L per order, per periode, per produk |
| **Evaluasi service level?** | SLA, KPI | ⚠️ Parsial | SLA compliance rate tidak di-track secara historis |
| **Investasi mesin?** | Capacity, Production | ❌ Tidak | Tidak ada data bottleneck yang cukup untuk justifikasi investasi |

### 3.3 Keputusan yang Sama Sekali Tidak Didukung

| Keputusan | Mengapa Penting | What Would Enable It |
|-----------|----------------|---------------------|
| **Berapa margin order ini?** | Inti bisnis — tanpa ini, Owner buta finansial | Cost tracking (material + labor) per order |
| **Kapan order ini selesai?** | Janji ke customer, planning | Estimated completion date yang akurat (beyond SLA) |
| **Apakah saya untung bulan ini?** | Kesehatan bisnis | Revenue - Cost (material + labor + overhead) |
| **Siapa operator terbaik?** | SDM decisions | Performance comparison + trend |
| **Material apa yang harus saya beli?** | Inventory management | Reorder point + usage forecast |
| **Apakah capacity saya cukup?** | Growth planning | What-if simulation |

---

## 4. Decision Coverage

### Coverage Matrix

| Decision | Commercial | Production | Capacity | Queue | KPI | Business Rules | Notification | Customer | Inventory | Journey |
|----------|-----------|------------|----------|-------|-----|----------------|--------------|----------|-----------|---------|
| **Set Harga** | ✅ RPC+UI | — | — | — | — | ✅ Config | — | — | — | — |
| **Record Payment** | ✅ RPC+UI | — | — | — | — | ✅ Config | — | — | — | — |
| **Assign Operator** | — | ✅ RPC+UI | — | — | — | — | ✅ Auto | — | — | — |
| **Override Kapasitas** | — | — | ✅ RPC+UI | — | — | — | — | — | — | — |
| **Emergency Override** | — | ✅ RPC+UI | — | — | — | — | — | — | — | — |
| **Set Business Rules** | ✅ Config | ✅ Config | ✅ Config | — | — | ✅ UI | ✅ Config | — | — | — |
| **Manage Material** | — | — | — | — | — | — | — | — | ✅ RPC+UI | — |
| **Lihat SLA Risk** | — | — | — | — | — | — | — | — | — | — |
| | | | | | | | | | | |
| **Tolak/Terima Order** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Percepat Order** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Tambah Operator** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Reorder Material** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Lihat Margin** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Lihat Profit** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Coverage Score: 11 of 48 cells = **23%**

---

## 5. Existing Intelligence

Apa yang **sudah** dimiliki LTOS untuk Owner:

### 5.1 Real-time Production Intelligence
- SLA risk classification per order (over_sla, risk, on_track)
- Business priority classification (critical, high, normal)
- Bottleneck detection (stage, operator, backlog count)
- Queue position and recommendation
- Live kanban (5 columns: waiting, cutting, sewing, qc, ready)

### 5.2 Financial Intelligence
- Revenue today and this month (from approved quotations)
- Cash collected (from payments)
- Outstanding payment tracking
- DP outstanding count
- Per-order invoice with line items, discounts, payments

### 5.3 Capacity Intelligence
- Total operator capacity (computed)
- Capacity used and remaining
- Capacity utilization %
- Full capacity day warnings
- Operator overload detection

### 5.4 Performance Intelligence
- Operator KPI (efficiency, utilization, avg duration, jobs done)
- Divisi KPI (SDM count, capacity, throughput)
- Fitter KPI
- Bottleneck dashboard (slowest stage, most backlogged, busiest operator)

### 5.5 CRM Intelligence
- New leads today
- Consultations today
- Waiting quotation count
- Follow-up today count
- VIP customer count
- Low stock material alerts

### 5.6 Business Rules Intelligence
- 5 config sets with full UI management
- Capacity calendar with override audit
- Service level SLA window configuration

---

## 6. Missing Intelligence

Apa yang **belum** terlihat oleh Owner:

### 6.1 Financial Blind Spots (Critical)

| Missing | Dampak | Data Already Exists? |
|---------|--------|----------------------|
| **Margin per order** | Owner tidak tahu untung/rugi per order | ❌ Tidak — biaya material no-op, biaya tenaga kerja tidak di-track |
| **Profit per periode** | Owner tidak tahu kesehatan bisnis | ❌ Tidak — sama seperti di atas |
| **Biaya produksi per order** | Tidak bisa kalkulasi margin | ❌ Tidak — fabric usage (quantityMeters) adalah no-op |
| **Payment aging** | Tidak bisa tagih piutang tepat waktu | ⚠️ Parsial — data payment ada, tapi aging report tidak |
| **Revenue forecast** | Tidak bisa planning | ❌ Tidak |
| **Cost trend** | Tidak bisa kontrol biaya | ❌ Tidak |

### 6.2 Operational Blind Spots (High)

| Missing | Dampak | Data Already Exists? |
|---------|--------|----------------------|
| **Estimated completion date** | Tidak bisa janji ke customer dengan akurat | ⚠️ Parsial — SLA classification ada, tapi ECD tidak |
| **Order acceptance decision** | Tidak tahu apakah bisa terima order baru | ⚠️ Parsial — capacity utilization ada, tapi admission check tidak |
| **Production timeline per order** | Tidak bisa tracking progress detail | ✅ Data di production_stage_records, tapi tidak divisualisasikan sebagai timeline/Gantt |
| **Stage dwell time** | Tidak tahu stage mana yang lambat | ✅ Data ada (started_at, completed_at), tapi tidak ditampilkan per order |
| **Operator skill matrix** | Tidak tahu operator bisa apa saja | ❌ Tidak — tidak ada skill/capability mapping |
| **Rework rate** | Tidak tahu kualitas produksi | ⚠️ Parsial — alter decision di-track, tapi rework rate tidak diaggregasi |

### 6.3 Strategic Blind Spots (Medium)

| Missing | Dampak | Data Already Exists? |
|---------|--------|----------------------|
| **Performance trend** | Tidak tahu apakah membaik/memburuk | ⚠️ Parsial — KPI snapshot ada, history tidak |
| **Customer lifetime value** | Tidak tahu customer mana yang paling bernilai | ❌ Tidak |
| **Product profitability** | Tidak tahu produk mana paling untung | ❌ Tidak |
| **Capacity planning** | Tidak tahu kapan perlu tambah SDM/mesin | ❌ Tidak |
| **Supplier performance** | Tidak tahu supplier mana yang reliable | ❌ Tidak |
| **Inventory turnover** | Tidak tahu perputaran stok | ⚠️ Parsial — data movement ada, turnover tidak dihitung |

### 6.4 UX Blind Spots

| Missing | Dampak |
|---------|--------|
| **No decision summary** | Owner harus buka banyak halaman untuk mengambil satu keputusan |
| **No what-if simulation** | Owner tidak bisa mencoba skenario sebelum mengambil keputusan |
| **No alert/notification** | Owner tidak tahu kalau ada yang kritis (harus buka dashboard) |
| **No mobile view** | Owner tidak bisa monitor dari HP |
| **No export/report** | Owner tidak bisa download laporan untuk meeting/akuntan |

---

## 7. Decision Priority

Prioritas berdasarkan **dampak bisnis** dan **effort implementasi** (REUSE > EXTEND > NEW):

### P1 — Critical (High Business Impact, Low Effort)

| # | Decision | Engine | Reuse Opportunity | Estimated Effort |
|---|----------|--------|-------------------|------------------|
| 1 | **Lihat margin per order** (partial) | Commercial + Inventory | REUSE: Commercial Engine RPC sudah ada. EXTEND: Tambah field biaya ke quotation line items | 2-3 hari |
| 2 | **Estimated completion date** | Production + SLA | REUSE: get_sla_risk_orders sudah punya hari_d, estimated_completion. EXTEND: Tampilkan di Owner dashboard | 1 hari |
| 3 | **Reorder material recommendation** | Inventory | REUSE: Inventory data lengkap (min_stock, available_stock, usage). EXTEND: Hitung reorder point + tampilkan rekomendasi | 2 hari |
| 4 | **Production timeline per order** | Production | REUSE: production_stage_records data lengkap. EXTEND: Visualisasikan sebagai timeline/Gantt | 2-3 hari |

### P2 — High (High Business Impact, Medium Effort)

| # | Decision | Engine | Reuse Opportunity | Estimated Effort |
|---|----------|--------|-------------------|------------------|
| 5 | **Order acceptance recommendation** | Capacity + SLA | REUSE: get_capacity_dashboard, get_owner_summary. EXTEND: Admission check logic + UI | 3-4 hari |
| 6 | **Profit per periode** | Commercial + Production | NEW: Cost tracking untuk material + labor. EXTEND: Revenue - Cost aggregation | 5-7 hari |
| 7 | **Payment aging report** | Commercial | REUSE: get_order_invoice, order_payments. EXTEND: Aging bucket calculation + UI | 2 hari |
| 8 | **Operator comparison** | KPI | REUSE: get_operator_kpi_list. EXTEND: Side-by-side comparison view | 2 hari |

### P3 — Medium (Medium Business Impact, Variable Effort)

| # | Decision | Engine | Reuse Opportunity | Estimated Effort |
|---|----------|--------|-------------------|------------------|
| 9 | **Performance trend over time** | KPI | NEW: Historical KPI snapshot table + trend visualization | 4-5 hari |
| 10 | **What-if capacity simulation** | Capacity | EXTEND: Capacity engine + simulation UI | 5-7 hari |
| 11 | **Rework rate dashboard** | Production + KPI | REUSE: production_stage_records decision=alter. EXTEND: Aggregation + visualization | 2 hari |
| 12 | **Stage dwell time per order** | Production | REUSE: production_stage_records data. EXTEND: Duration calculation + display | 2 hari |

### P4 — Low (Lower Business Impact, Higher Effort)

| # | Decision | Engine | Reuse Opportunity | Estimated Effort |
|---|----------|--------|-------------------|------------------|
| 13 | **Customer lifetime value** | Customer + Commercial | NEW: CLV calculation | 5-7 hari |
| 14 | **Supplier performance** | Inventory | NEW: Supplier tracking + performance metrics | 5-7 hari |
| 15 | **Inventory turnover** | Inventory | REUSE: material_stock_movements. EXTEND: Turnover calculation | 2 hari |
| 16 | **Owner notification/alert** | Notification | EXTEND: Notification engine untuk Owner | 3-4 hari |

---

## 8. Reuse Opportunity

Semua rekomendasi P1 dapat dibangun **tanpa RPC baru** — hanya EXTEND pada data yang sudah ada:

### Reuse Map

| Engine | Data yang Sudah Ada | Dapat Digunakan Untuk |
|--------|---------------------|----------------------|
| **Production** | production_stage_records (order_id, stage, status, started_at, completed_at, attempt, decision) | Timeline per order, dwell time, rework rate, operator performance |
| **Decision** | get_owner_summary, get_sla_risk_orders | Estimated completion, SLA projection, bottleneck prediction |
| **Commercial** | quotations, order_payments, get_order_invoice | Payment aging, revenue breakdown, customer payment behavior |
| **Inventory** | materials (price, available_stock, min_stock), material_stock_movements | Reorder point, inventory value, material cost |
| **Capacity** | capacity_calendar, get_capacity_dashboard | Admission check, utilization trend, capacity planning |
| **KPI** | get_operator_kpi_list, get_operator_kpi_detail | Operator comparison, performance trend baseline |
| **Business Rules** | 5 config sets | Rule impact analysis, what-if simulation input |

### Data Gap

| Data | Status | Required For |
|------|--------|-------------|
| **Fabric usage per order (quantityMeters)** | ❌ No-op (planned in ADR-020) | Profit margin, material cost allocation |
| **Operator cost / labor cost** | ❌ Tidak ada | Profit margin, production cost |
| **Historical KPI snapshots** | ❌ Tidak ada (snapshot only) | Performance trend |

---

## 9. Recommendation

### 9.1 Immediate Wins (Sprint N.1) — REUSE Only

1. **Estimated Completion Date on Dashboard**
   - REUSE: `get_sla_risk_orders` already returns `estimated_completion`
   - EXTEND: Display estimated completion per order in Bottleneck Panel and Production Live Kanban
   - Value: Owner can tell customer when order will be ready

2. **Production Timeline Visualization**
   - REUSE: `production_stage_records` has complete started_at/completed_at per stage
   - EXTEND: Render as horizontal timeline/Gantt in Order Detail Modal
   - Value: Owner can see exactly where each order is and how long it's been there

3. **Reorder Material Recommendation**
   - REUSE: `materials.available_stock`, `materials.min_stock`, usage data from movements
   - EXTEND: Calculate reorder point = min_stock × 2, suggest reorder quantity = reorder_point - available_stock
   - Value: Owner never runs out of critical materials

4. **Payment Aging in Commercial Center**
   - REUSE: `order_payments` + `quotations` data already fetched
   - EXTEND: Group outstanding by age buckets (0-7 hari, 8-14 hari, 15-30 hari, >30 hari)
   - Value: Owner can prioritize collection

### 9.2 Sprint N.2 — EXTEND

5. **Order Acceptance Check**
   - EXTEND `get_owner_summary` or client-compute: if remaining_capacity > 0 AND no operator_overload AND no full_capacity_days → "Aman terima order"
   - Display in Engine Overview as traffic light (Hijau/Kuning/Merah)
   - Value: Owner knows instantly whether to accept new orders

6. **Operator Performance Dashboard**
   - REUSE `get_operator_kpi_list` data
   - EXTEND: Sortable table with efficiency, utilization, throughput, quality (alter rate)
   - Add trend arrows jika data history memungkinkan
   - Value: Owner can identify top performers and who needs coaching

### 9.3 Sprint N.3 — EXTEND + Minor NEW

7. **Margin Per Order (Foundation)**
   - NEW: Fabric usage calculator (fulfill ADR-020 — quantityMeters)
   - EXTEND: Cost per order = Σ(material_price × quantity) + Σ(operator_hours × operator_rate)
   - Display margin = revenue - cost in Order Detail Modal
   - Value: Owner knows if each order is profitable

8. **Rework Rate Dashboard**
   - REUSE: `production_stage_records.decision = 'alter'`
   - EXTEND: Rework rate = total_alter / total_completed per operator, per divisi, per periode
   - Value: Owner can identify quality issues early

### 9.4 What NOT To Do

| Jangan | Alasan |
|--------|--------|
| ❌ Buat dashboard baru | Reuse OwnerCommandCenter yang sudah ada |
| ❌ Buat RPC baru untuk P1 items | Semua data sudah ada via existing RPC |
| ❌ Implementasi AI/ML | Rule-based sudah cukup untuk 90% keputusan Owner |
| ❌ Ubah workflow/stages/milestones | LOCKED — tidak boleh diubah |
| ❌ Buat per-operator login | Kiosk tetap no-login |
| ❌ Implementasi WebSocket | Polling sudah cukup untuk MVP Owner |

### 9.5 Prinsip Implementasi

```
REUSE (P1 items) > EXTEND (P2 items) > NEW (hanya fabric usage calculator)
```

1. **Setiap rekomendasi harus dapat diimplementasikan tanpa mengubah fondasi yang sudah ada.**
2. **Setiap rekomendasi P1 cukup dengan client-side logic + EXTEND existing UI.**
3. **Tidak ada rekomendasi yang memerlukan RPC baru, table baru, atau migration baru untuk P1.**
4. **Owner harus bisa mengambil keputusan dalam 1-2 klik dari dashboard, bukan dari halaman terpisah.**

---

## Appendix: Data Source Reference

| Data | Source | Existing Consumer | Dapat Direuse Untuk |
|------|--------|-------------------|---------------------|
| production_stage_records | Table | Production Kiosk, Journey, Command Center | Timeline, dwell time, rework |
| get_owner_summary | RPC | Decision Center, Engine Overview | Capacity warning, SLA, bottleneck |
| get_sla_risk_orders | RPC | Decision Center, Engine Overview | ECD, queue recommendation |
| get_order_invoice | RPC | Commercial Center, Order Detail Modal | Payment aging, margin baseline |
| materials + movements | Table | Inventory Hub, Bottleneck Panel | Reorder, inventory value |
| get_operator_kpi_list | RPC | Engine Overview, KPI Operator | Comparison, targets |
| get_capacity_dashboard | RPC | Engine Overview | Admission check baseline |
| get_kpi_dashboard | RPC | Engine Overview | Performance trend baseline |
| business_rules_config | Table | Business Rules UI | Rule impact analysis |

