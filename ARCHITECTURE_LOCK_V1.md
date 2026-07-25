# LTOS V1 — Architecture Lock Document

**Status:** FINAL — LOCKED  
**Version:** LTOS V1  
**Date:** 2026-08-20  
**Authority:** Principal Enterprise Architect  
**Basis:** Audit Phase 1–3 & Sprint M.1–M.2 — Repository Source of Truth

---

## 1. Executive Summary

LTOS V1 telah menyelesaikan seluruh Audit Phase 1–3 dan Sprint M.1–M.2. Berdasarkan evidence dari repository, sistem mencapai status **Production Ready Foundation**.

### Penilaian

| Kriteria | Status | Evidence |
|----------|--------|----------|
| Workflow Utuh | ✅ LOCKED | 11 Workflow States + 9 Queue Types + 8 Production Stages + 5 Customer Milestones |
| Runtime Engine | ✅ LOCKED | Commercial, Production, Capacity, Notification, KPI, Decision engines via SECURITY DEFINER RPC |
| Business Rules Config | ✅ LOCKED | 5 Runtime Config tables (Commercial, Production, Return, Notification, Capacity) |
| RBAC + Middleware | ✅ LOCKED | 5 app gates, 3 DB roles → 6 app roles, route protection aktif |
| Customer Journey | ✅ LOCKED | Token-based public access, 5 milestones, 2 delivery sub-states |
| Inventory Hub | ✅ PARTIAL | Stock movements + materials implemented; no fabric-usage calculator |
| Database Migration | ✅ LOCKED | 50+ migrations, full audit trail, RLS on all tables |
| TypeScript | ✅ READY | Strict mode, full type coverage across 60+ lib modules |
| Lint | ✅ READY | ESLint configured, Next.js lint pipeline |

**Verdict:** LTOS V1 **Production Ready Foundation**. Seluruh arsitektur inti telah terkunci. Sprint berikutnya hanya boleh EXTEND atau REUSE — tidak boleh mengubah fondasi yang sudah ada.

---

## 2. Domain Architecture

### Domain Map

```
┌─────────────────────────────────────────────────────────────┐
│                        LTOS V1 DOMAINS                       │
├────────────┬──────────────┬────────────────┬─────────────────┤
│  Frontend  │  Owner OS    │  Fitter App    │  Inventory Hub  │
│            │  (admin/own) │  (artisan)      │  (owner/inv)   │
├────────────┼──────────────┼────────────────┼─────────────────┤
│  Auth      │  Login/Pass  │  Login/Pass    │  Login/Pass     │
│  Layer     │  + RBAC      │  + RBAC        │  + RBAC         │
├────────────┼──────────────┼────────────────┼─────────────────┤
│  Public    │  Customer Journey (token-based)                │
│  Layer     │  Production Kiosk (QR-token, no login)         │
├────────────┴──────────────┴────────────────┴─────────────────┤
│                   Supabase Backend                           │
│  RPC Layer (SECURITY DEFINER)  │  Row-Level Security         │
│  Migrations (50+)              │  Triggers + Functions       │
└──────────────────────────────────────────────────────────────┘
```

### 2.1 Customer Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Mengelola data pelanggan dan preferensi |
| **Boundary** | `customers` table, `customer_tokens`, Customer Digital Profile |
| **Dependency** | Orders, Consultations, Business Events |
| **Owner** | Fitter App (write), Owner OS (read/write) |
| **Source of Truth** | `customers` table (Supabase) |

### 2.2 Consultation Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Mengelola sesi konsultasi antara Fitter dan Customer |
| **Boundary** | `consultations` table, `consultation_status`, `consultation_notes` |
| **Dependency** | Customer Domain, Master Data Domain |
| **Owner** | Fitter App |
| **Source of Truth** | `consultations` table + `business_events` (event_type = 'consultation.*') |

### 2.3 Measurement Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Mengelola data ukuran badan customer |
| **Boundary** | `measurements` table, MeasurementFields type |
| **Dependency** | Order Domain, Consultation Domain |
| **Owner** | Fitter App |
| **Source of Truth** | `measurements` table + snapshot di `business_events.event_data` |

### 2.4 Design Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Mengelola pemilihan desain garment dan Master Data catalog |
| **Boundary** | `design_master_options` table, DesignSpecification, 11 Master Data Categories (LOCKED) |
| **Dependency** | Master Data Domain, Inventory Domain (material stock badge) |
| **Owner** | Fitter App, Owner OS (master data management) |
| **Source of Truth** | `design_master_options` + `design_specifications` via DesignSpecification codec |

### 2.5 Commercial Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Mengelola pricing, diskon, KOL, pembayaran, invoice |
| **Boundary** | `quotations`, `order_payments`, Commercial Rules Runtime Config |
| **Dependency** | Order Domain, Business Rules Domain |
| **Owner** | Owner OS (admin/owner) |
| **Source of Truth** | Commercial Engine RPCs (`upsert_order_quotation`, `apply_order_discount`, `apply_order_kol`, `set_order_price_override`, `record_order_payment`, `get_order_invoice`) |

### 2.6 Production Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Mengelola alur produksi garment — 8 stage LOCKED |
| **Boundary** | `production_stage_records`, `production_operators`, `master_divisions`, Production Rules |
| **Dependency** | Order Domain, Capacity Domain, KPI Domain |
| **Owner** | Production Kiosk (QR-token), Owner OS (monitoring) |
| **Source of Truth** | `production_stage_records` tables + Production RPCs |

### 2.7 QC Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Quality Control garment — decision: approved/alter/skipped |
| **Boundary** | QC checklist items, Return Rules, Stage Records dengan decision field |
| **Dependency** | Production Domain |
| **Owner** | Production Kiosk |
| **Source of Truth** | `production_stage_records` (stage=qc, decision, alter_category) |

### 2.8 Delivery Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Mengelola pengiriman garment ke customer |
| **Boundary** | `mark_order_delivered` RPC, shipping info di stage_records, courier + tracking |
| **Dependency** | Production Domain, Customer Journey Domain |
| **Owner** | Owner OS (mark delivered), Production Kiosk (set shipping info) |
| **Source of Truth** | `production_stage_records` (stage=shipping) + `orders.current_state` |

### 2.9 Journey Domain (Customer)

| Aspek | Detail |
|-------|--------|
| **Purpose** | Customer-facing tracking portal dengan token-based access |
| **Boundary** | 5 Journey Milestones (LOCKED), 2 delivery sub-states (shipping/delivered) |
| **Dependency** | Order Domain, Production Domain (stage_records) |
| **Owner** | Customer (read-only via token) |
| **Source of Truth** | `orders.customer_token` → `get_production_packet` RPC + `business_events` |

### 2.10 Inventory Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Mengelola stok material, kategori, stock movements |
| **Boundary** | `materials`, `material_categories`, `material_stock_movements`, Estimasi Biaya templates |
| **Dependency** | Master Data Domain (material_id linkage), Order Domain (reservation) |
| **Owner** | Inventory Hub (owner/admin) |
| **Source of Truth** | `materials` table + Stock Movement ledger |

### 2.11 Notification Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Mengelola notifikasi internal (kiosk assignments, production events) |
| **Boundary** | `notifications` table, Notification Rules Runtime Config |
| **Dependency** | Production Domain |
| **Owner** | System (trigger-based), Owner OS (config) |
| **Source of Truth** | `notifications` table + `list_pending_assignments` RPC |

### 2.12 Business Rules Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Runtime Configuration untuk seluruh engine |
| **Boundary** | 5 config sets: Commercial, Production, Return, Notification, Capacity |
| **Dependency** | All domain engines |
| **Owner** | Owner OS (admin/owner write, all read) |
| **Source of Truth** | Business Rules RPCs (`get_*_rules` / `set_*_rules`) |

### 2.13 Capacity Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Mengelola kapasitas produksi harian |
| **Boundary** | `capacity_calendar`, computed/override split, operator capacity |
| **Dependency** | Production Domain, KPI Domain |
| **Owner** | Owner OS |
| **Source of Truth** | `get_capacity_calendar` RPC + `set_capacity_calendar_day` RPC |

### 2.14 KPI Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Mengelola metrik performa produksi dan operator |
| **Boundary** | KPI Dashboard, Operator KPI, Divisi KPI, Bottleneck, Capacity Dashboard |
| **Dependency** | Production Domain, Capacity Domain |
| **Owner** | Owner OS (read-only) |
| **Source of Truth** | KPI Engine RPCs (`get_kpi_dashboard`, `get_operator_kpi_list`, `get_divisi_kpi_list`, etc.) |

### 2.15 Owner OS Domain

| Aspek | Detail |
|-------|--------|
| **Purpose** | Command center untuk owner/admin — Decision Center, Priority Task, Dashboard |
| **Boundary** | `/command-center`, `/owner/*`, OwnerSummary, SlaRiskOrders, Today's Action |
| **Dependency** | All domains |
| **Owner** | Owner + Admin roles |
| **Source of Truth** | `get_owner_summary` RPC + `get_sla_risk_orders` RPC |

---

## 3. Source of Truth Contract

### 3.1 Customer Domain

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `customers` table (Supabase) |
| **Writer** | Fitter App (via Check-In) |
| **Reader** | All apps (Owner OS, Fitter App, Production Kiosk via RPC, Customer Journey via token) |
| **Dependency** | Orders (`customer_id` FK), Consultations (`customer_id` FK), Business Events (snapshot) |

### 3.2 Consultation Domain

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `consultations` table + `business_events` (event_type = 'consultation.*') |
| **Writer** | Fitter App |
| **Reader** | Fitter App, Owner OS |
| **Dependency** | Customers, Master Data |

### 3.3 Measurement Domain

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `measurements` table + OrderSnapshot di `business_events` |
| **Writer** | Fitter App |
| **Reader** | Fitter App, Production Kiosk (via get_production_packet), Owner OS |
| **Dependency** | Orders, Consultations |

### 3.4 Design Domain

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `design_master_options` table (Master Data) + DesignSpecification (Order) |
| **Writer** | Owner OS / Fitter App (Master Data), Fitter App (Design Studio) |
| **Reader** | All apps |
| **Dependency** | Inventory Domain (material stock badge) |

### 3.5 Commercial Domain

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `quotations` + `order_payments` tables + Commercial Rules config |
| **Writer** | Commercial Engine RPCs (upsert, apply discount/KOL/override, record payment) |
| **Reader** | Owner OS (invoice, summary), Fitter App (invoice preview) |
| **Dependency** | Orders, Design (PriceSnapshot) |

### 3.6 Production Domain

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `production_stage_records` (append-only) + `production_operators` + `master_divisions` |
| **Writer** | Production RPCs (start_stage, complete_stage, assign_stage_operator) |
| **Reader** | Production Kiosk (via get_production_packet), Owner OS (monitoring), Customer Journey (via milestone) |
| **Dependency** | Orders, Capacity, KPI |

### 3.7 QC Domain

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `production_stage_records` (stage=qc, decision, alter_category) |
| **Writer** | Production Kiosk (complete_stage with decision) |
| **Reader** | Production Kiosk, Owner OS |
| **Dependency** | Production Domain, Return Rules |

### 3.8 Delivery Domain

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `production_stage_records` (stage=shipping, courier, tracking_number) + `orders.current_state` |
| **Writer** | Production Kiosk (set_shipping_info), Owner OS (mark_order_delivered) |
| **Reader** | Customer Journey, Owner OS |
| **Dependency** | Production Domain |

### 3.9 Journey Domain

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | Derived — `production_stage_records` + `orders.customer_token` |
| **Writer** | None (read-only by design) |
| **Reader** | Customer (via unique customer_token URL) |
| **Dependency** | Orders, Production Domain |

### 3.10 Inventory Domain

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `materials` + `material_categories` + `material_stock_movements` tables |
| **Writer** | Inventory Hub (owner/admin) |
| **Reader** | Inventory Hub, Fitter App (stock badge only) |
| **Dependency** | Master Data (material_id linkage) |

### 3.11 Business Rules Domain

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | Runtime Config tables (business_rules_config) |
| **Writer** | Owner OS (admin/owner via RPC gate) |
| **Reader** | All engines (anon kiosk via RPC) |
| **Dependency** | All domains |

---

## 4. Runtime Engine Contract

### 4.1 Commercial Runtime

| Aspek | Detail |
|-------|--------|
| **Status** | ✅ **Matang** — mature, fully tested |
| **Entry Points** | `upsert_order_quotation`, `apply_order_discount`, `apply_order_kol`, `set_order_price_override`, `record_order_payment`, `get_order_invoice`, `recompute_quotation_total` |
| **Architecture** | SECURITY DEFINER RPC — pricing math di DesignSpecification, persistance via RPC |
| **Rules** | `get_commercial_rules` / `set_commercial_rules` |
| **Access** | Anon (read), Admin/Owner (write via RPC gate) |

### 4.2 Production Runtime

| Aspek | Detail |
|-------|--------|
| **Status** | ✅ **Matang** — 8 stages LOCKED, append-only stage records |
| **Entry Points** | `get_production_packet`, `start_stage`, `complete_stage`, `assign_stage_operator`, `emergency_override_stage` |
| **Architecture** | SECURITY DEFINER RPC — kiosk anon, no login |
| **Rules** | `get_production_rules` / `set_production_rules` |
| **Key Design** | `production_stage_records` adalah append-only. Setiap attempt adalah row baru. Tidak pernah ada UPDATE pada stage yang sudah selesai. |

### 4.3 Notification Runtime

| Aspek | Detail |
|-------|--------|
| **Status** | ✅ **Matang** — RPC-based assignment notifications |
| **Entry Points** | `assign_stage_operator` (create), `list_pending_assignments` (read), `mark_notification_read` (ack) |
| **Architecture** | RPC — kiosk-wide, no per-operator login |
| **Rules** | `get_notification_rules` / `set_notification_rules` |
| **Key Design** | Notifikasi bersifat kiosk-wide karena operator tidak punya login |

### 4.4 Capacity Runtime

| Aspek | Detail |
|-------|--------|
| **Status** | ✅ **Matang** — computed/override split |
| **Entry Points** | `get_capacity_calendar`, `set_capacity_calendar_day`, `get_capacity_override_audit_log` |
| **Architecture** | RPC — computed max_orders dengan manual override + mandatory reason |
| **Access** | Admin/Owner (write via RPC gate) |

### 4.5 Journey Runtime

| Aspek | Detail |
|-------|--------|
| **Status** | ✅ **Matang** — token-based, 5 milestones LOCKED |
| **Entry Points** | `get_customer_journey_snapshot`, `get_production_packet` (via customer_token) |
| **Architecture** | RPC — public anon, token-based access |
| **Key Design** | Milestone 5 memiliki 2 sub-states: 'shipping' (default) dan 'delivered' (ketika current_state = 'follow_up') |

### 4.6 Owner Runtime (Decision Center)

| Aspek | Detail |
|-------|--------|
| **Status** | ✅ **Matang** — Owner Summary + SLA Risk + Bottleneck |
| **Entry Points** | `get_owner_summary`, `get_sla_risk_orders` |
| **Architecture** | RPC — composes every Sprint B-H signal into one read |
| **Client Logic** | `computeTodaysActions` — rule-based, no AI |

### 4.7 KPI Runtime

| Aspek | Detail |
|-------|--------|
| **Status** | ✅ **Matang** — 6+ RPC untuk operator, divisi, dashboard |
| **Entry Points** | `get_kpi_dashboard`, `get_capacity_dashboard`, `get_bottleneck_dashboard`, `get_operator_kpi_list`, `get_divisi_kpi_list`, `get_operator_kpi_detail` |
| **Architecture** | RPC — read-only, SECURITY DEFINER |

---

## 5. Business Rules Contract

### 5.1 Commercial Rules

| Aspek | Detail |
|-------|--------|
| **Config Keys** | `min_dp_percent`, `max_discount_percent`, `full_payment_only`, `kol_max_discount_percent`, `owner_override_enabled`, `invoice_notes`, `price_rounding_nearest` |
| **Writer** | Owner OS (admin/owner) via `set_commercial_rules` RPC (admin/owner-gated) |
| **Reader** | All apps via `get_commercial_rules` RPC (anon) |
| **Changed By** | Only admin/owner via Business Rules page |

### 5.2 Production Rules

| Aspek | Detail |
|-------|--------|
| **Config Keys** | `qr_required`, `qc_checklist_required`, `max_alter_attempts`, `alter_return_stage`, `delivery_confirmation_required`, `auto_close_after_delivered` |
| **Writer** | Owner OS (admin/owner) via `set_production_rules` RPC (admin/owner-gated) |
| **Reader** | Production Kiosk via `get_production_rules` RPC (anon) |
| **Changed By** | Only admin/owner |

### 5.3 Capacity Rules

| Aspek | Detail |
|-------|--------|
| **Config Keys** | Per-date override via `set_capacity_calendar_day` dengan mandatory reason |
| **Writer** | Owner OS (admin/owner) via RPC (admin/owner-gated) |
| **Reader** | All via `get_capacity_calendar` RPC |
| **Changed By** | Only admin/owner, logged to `capacity_override_audit_log` |

### 5.4 Notification Rules

| Aspek | Detail |
|-------|--------|
| **Config Keys** | `assignment_notification_enabled` |
| **Writer** | Owner OS via `set_notification_rules` RPC |
| **Reader** | System (assign_stage_operator reads config server-side) |
| **Changed By** | Only admin/owner |

### 5.5 Return Rules

| Aspek | Detail |
|-------|--------|
| **Config Keys** | `reasons` (string array — QC "Kategori Temuan" picklist) |
| **Writer** | Owner OS via `set_return_rules` RPC |
| **Reader** | Production Kiosk via `get_return_rules` RPC (anon) |
| **Changed By** | Only admin/owner |

### 5.6 Service Rules (SLA Engine)

| Aspek | Detail |
|-------|--------|
| **Config** | Service levels: `standard`, `fast`, `very_fast` — masing-masing dengan SLA window |
| **Writer** | System (via `set_order_service` RPC) |
| **Reader** | All via `get_service_availability` RPC |
| **Changed By** | SLA params via Business Rules page |

---

## 6. Workflow Contract

### 6.1 Workflow Final — LOCKED

```
Lead
  ↓
Consultation
  ↓
Appointment
  ↓
Measurement
  ↓
Quotation
  ↓
Order Confirmed (order)
  ↓
Assign Artisan (assign)
  ↓
Production
  ↓
Quality Check (qc)
  ↓
Delivery
  ↓
Follow Up
```

### 6.2 Production Stages — LOCKED (8 stages, never reorder)

```
material_prep → pattern_formulation → cutting → sewing → qc → finishing → packing → shipping
```

### 6.3 Customer Journey Milestones — LOCKED (5 milestones)

```
Milestone 1: Order Confirm & Fitting
Milestone 2: Cutting & Sewing
Milestone 3: Quality Control
Milestone 4: Finishing & Packing
Milestone 5: Shipping
```

### 6.4 Milestone 5 Sub-states

| State | Condition |
|-------|-----------|
| `shipping` | `orders.current_state` = 'delivery' (default for Milestone 5) |
| `delivered` | `orders.current_state` = 'follow_up' (set by `mark_order_delivered` RPC) |

### 6.5 Queue Types — LOCKED (9 types)

```
consultation → appointment → measurement → quotation → assign → production → qc → delivery → follow_up
```

### 6.6 Workflow Rules

1. **Workflow ini LOCKED.** Tidak ada state baru yang boleh ditambahkan tanpa Architecture Change.
2. `orders.current_state` adalah **bukan runtime utama**. Runtime Production menggunakan `production_stage_records` sebagai source of truth.
3. Setiap transisi state dicatat sebagai `business_events` (event_type = 'workflow.*').
4. QC Decision (approved/alter/skipped) ada di `production_stage_records.decision` — **bukan** di orders.current_state.
5. `follow_up` adalah satu-satunya nilai `orders.current_state` yang berarti order sudah delivered.

---

## 7. Architecture Decision Record (ADR)

### ADR-001: QC Checklist ≠ Return Rules
- **Konteks:** Awalnya QC checklist items dan Return Rules adalah satu set hardcoded.
- **Keputusan:** Dipisah. QC checklist = production_rules config; Return Rules = standalone config dengan reasons array.
- **Evidence:** `QC_CHECKLIST` const di `src/lib/ltos.ts` vs `ReturnRules` interface di `src/lib/production/types.ts`, migration `20260813000000_add_return_notification_rules.sql`.

### ADR-002: Production Runtime memakai `production_stage_records`
- **Konteks:** Production bisa pakai `orders.current_state` atau table terpisah.
- **Keputusan:** `production_stage_records` adalah append-only log dengan attempt number. `orders.current_state` tidak diupdate per stage.
- **Evidence:** `StageRecord` interface dengan field `attempt`, `decision`, `alter_category`. Migrations `20260730000000_add_production_queue_engine.sql` dkk.

### ADR-003: `orders.current_state` bukan runtime utama
- **Konteks:** Banyak keputusan bergantung pada `orders.current_state`.
- **Keputusan:** `orders.current_state` hanya untuk workflow high-level. Production, QC, Delivery menggunakan `production_stage_records` sebagai source of truth.
- **Evidence:** `resolveDeliveryState()` dan `resolveJourneyMilestone()` di `src/lib/journey/milestone.ts` menggunakan `production_stage_records` sebagai prioritas.

### ADR-004: Commercial adalah Runtime Matang
- **Konteks:** Pricing math ada di client-side (DesignSpecification) atau server-side.
- **Keputusan:** Pricing math di `buildDesignSpecification()` (client), persistance via SECURITY DEFINER RPC (server). Commercial Rules dibaca server-side oleh setiap RPC.
- **Evidence:** `src/lib/commercial/client.ts`, `src/lib/commercial/summary.ts`, migration `20260804000002_add_commercial_engine.sql`.

### ADR-005: Notification memakai RPC, bukan WebSocket/Realtime
- **Konteks:** Operator tidak punya login, perlu lihat notifikasi.
- **Keputusan:** Notifikasi kiosk-wide, poll-based via `list_pending_assignments` RPC. Tidak ada WebSocket.
- **Evidence:** `src/lib/production/client.ts` — `listPendingAssignments`, `markNotificationRead`. Migration `20260726000000_add_operator_assignment_and_notifications.sql`.

### ADR-006: Runtime Validation berada di server
- **Konteks:** Client bisa bypass validation.
- **Keputusan:** Semua validasi write ada di SECURITY DEFINER RPC — client hanya panggil RPC, tidak pernah langsung INSERT/UPDATE ke table production.
- **Evidence:** Semua client Production (`src/lib/production/client.ts`) dan Commercial (`src/lib/commercial/client.ts`) hanya panggil RPC.

### ADR-007: Emergency Override ≠ Skip Stage
- **Konteks:** Kebutuhan untuk "lewati stage" tanpa menghapus stage.
- **Keputusan:** Emergency Override adalah per-order, per-stage, always-audited. Tidak ada "skip stage" toggle global.
- **Evidence:** `src/lib/production/client.ts` — `emergencyOverrideStage`. `20260812000000_replace_skip_stage_with_emergency_override.sql`.

### ADR-008: Customer Token ≠ Order Number
- **Konteks:** Customer Journey perlu ID yang aman dipublikasikan.
- **Keputusan:** `customer_token` adalah UUID tanpa dash (32 chars), di-generate di Create Order, UNIQUE, terpisah dari `order_number` dan `order_id`.
- **Evidence:** `src/lib/order/qr.ts` — `generateCustomerToken()`. Migration `20260716000000_add_customer_token_and_journey_lookup.sql`.

### ADR-009: Order Snapshot di Business Events, bukan di Orders
- **Konteks:** Data order (design, measurement, notes) perlu immutable.
- **Keputusan:** Snapshot disimpan di `business_events` (event_type='order.created') sebagai jsonb. `orders` table tetap ramping dengan kolom minimal.
- **Evidence:** `src/lib/order/createOrder.ts` — snapshot object. `OrderSnapshot` interface di `src/lib/order/types.ts`.

### ADR-010: Order Number = Consultation Number yang di-replace prefix
- **Konteks:** Need deterministic, unique order number.
- **Keputusan:** Order number derived dari consultation_number: `LT-CS-XXX` → `LT-ORD-XXX`. Tidak ada sequence generator terpisah.
- **Evidence:** `src/lib/order/createOrder.ts` — baris `consultation.consultation_number.replace('LT-CS-', 'LT-ORD-')`.

### ADR-011: Production Kiosk = No Login, QR-Token Only
- **Konteks:** Operator tidak punya akun, perlu akses production.
- **Keputusan:** Kiosk menggunakan QR token + SECURITY DEFINER RPC. Tidak ada middleware route protection untuk `/production/*`.
- **Evidence:** `src/middleware.ts` — route `/production/*` tidak ada di `ROUTE_RULES`.

### ADR-012: Master Data Categories = LOCKED, 11 fixed
- **Konteks:** Boleh/tidaknya nambah kategori lewat UI.
- **Keputusan:** 11 kategori fixed via DB check constraint. Tidak ada "+ Kategori Baru" affordance. Kategori baru hanya via migration.
- **Evidence:** `MASTER_DATA_CATEGORIES` di `src/lib/design/masterData.ts`.

### ADR-013: Fitter = READ-ONLY on Inventory
- **Konteks:** Fitter perlu lihat stock tapi tidak boleh edit.
- **Keputusan:** `INVENTORY_MANAGER_ROLES` hanya admin + owner. Fitter hanya lihat stock badge via read-only query.
- **Evidence:** `src/lib/inventory/access.ts` — `canManageInventory()`.

### ADR-014: Material Price = Live dari Inventory, tidak dari template
- **Konteks:** Estimasi Biaya template menyimpan material qty tapi harga bisa berubah.
- **Keputusan:** `MaterialEstimateRow` hanya simpan refs (materialId) + qty. Harga selalu live-join ke `materials` table.
- **Evidence:** `src/lib/inventory/types.ts` — `MaterialEstimateRow` interface.

### ADR-015: RBAC — 3 DB roles mapped to 6 App roles
- **Konteks:** Database hanya punya owner/admin/artisan, tapi app perlu lebih banyak role.
- **Keputusan:** `normalizeRole()` maps 'artisan' → 'fitter'. Role 'inventory', 'production', 'customer' reserved untuk future use.
- **Evidence:** `src/lib/rbac/roles.ts`.

### ADR-016: QC Decision (Alter) = new attempt, no UPDATE
- **Konteks:** QC "Alter" decision mengirim kembali ke stage sebelumnya.
- **Keputusan:** Append-only. QC "Alter" = complete_stage dengan decision='alter', yang membuat attempt baru di `alter_return_stage`. Tidak pernah UPDATE row yang sudah completed.
- **Evidence:** `src/lib/production/types.ts` — `StageRecord.attempt`. `completeStage` RPC behavior.

### ADR-017: Capacity = Computed + Override, Bukan Manual
- **Konteks:** Awalnya capacity calendar manual input.
- **Keputusan:** Sprint K mengubah menjadi computed engine. `computed_max_orders` dihitung otomatis. Override hanya via `set_capacity_calendar_day` dengan mandatory reason + audit log.
- **Evidence:** `src/lib/capacity/types.ts` — `CapacityCalendarDay` dengan `computed_max_orders` dan `effective_max_orders`.

### ADR-018: Customer Photos = INSERT-only, no UPSERT
- **Konteks:** Bucket RLS hanya grant INSERT.
- **Keputusan:** Path unik per attempt (`${consultationId}/${slot}-${timestamp}.${ext}`). Tidak bisa overwrite.
- **Evidence:** `src/lib/consultation/media.ts` — `uploadConsultationPhoto()`.

### ADR-019: Order Created Notification = Belum Implementasi (placeholder)
- **Konteks:** Perlu kirim WhatsApp/tracking ke customer saat order dibuat.
- **Keputusan:** `notifyOrderCreated()` adalah no-op dengan console.info. Callback shape disiapkan, integrasi belum ada.
- **Evidence:** `src/lib/order/notifications.ts`.

### ADR-020: Inventory Reservation = Wired but No-Op
- **Konteks:** Inventory table sudah ada, tapi fabric-usage calculator belum.
- **Keputusan:** `reserveInventory()` dipanggil di `createOrderFromConsultation()` tapi `quantityMeters` = null, jadi no-op.
- **Evidence:** `src/lib/order/createOrder.ts` — pemanggilan `reserveInventory`.

---

## 8. Legacy Contract

### 8.1 Legacy Aktif

| Legacy | Lokasi | Alasan Dipertahankan |
|--------|--------|----------------------|
| `QC_CHECKLIST` (hardcoded array) | `src/lib/ltos.ts` | Migration ke Return Rules belum complete; masih dipakai sebagai fallback |
| Hardcoded `STATE_LABELS` | `src/lib/ltos.ts` | Masih jadi source of truth untuk UI display |
| `QueueAssignment` langsung dari Supabase | Various components | Migration ke Priority Engine belum complete |
| `consultations.notes` encoding format | `design-studio/notesCodec.ts` | Data lama masih pakai format `key=value\|key=value` |

### 8.2 Legacy Compatibility

| Legacy | Lokasi | Kompatibilitas |
|--------|--------|----------------|
| Pre-Sprint-C orders (no service_level) | `get_production_packet` | Fallback ke `created_at + 14 days` jika service_level null |
| Order snapshot tanpa `designSpecification` | `OrderSnapshot` interface | Optional field — null untuk order lama |
| Order snapshot tanpa `eventInformation` | `OrderSnapshot` interface | Optional field — null untuk order lama |
| Order snapshot tanpa `estimationValidation` | `OrderSnapshot` interface | Optional field — null untuk order lama |

### 8.3 Legacy Orphan

| Legacy | Lokasi | Status |
|--------|--------|--------|
| `legacy_queue_rpcs` | Migration `20260721000100_revoke_legacy_queue_rpcs.sql` | **REVOKED** — dihapus via migration |
| `skip_stage` concept | Migration `20260812000000_replace_skip_stage_with_emergency_override.sql` | **REPLACED** — diganti dengan Emergency Override |
| `operator_rpc_overloads` | Migration `20260804000004_drop_orphaned_operator_rpc_overloads.sql` | **DROPPED** — overloads tidak terpakai |

### 8.4 Legacy yang Sengaja Dipertahankan

| Legacy | Alasan |
|--------|--------|
| `consultations.notes` encoding (text format) | Backward compatibility dengan konsultasi lama yang belum memiliki `business_events` |
| Pre-SLA order estimation (14 days default) | Agar order lama tetap punya estimasi |
| Multiple `customer_photos` per slot | Tidak ada migration untuk deduplikasi — path timestamp-based memastikan uniqueness forward |

---

## 9. Dependency Contract

### 9.1 Dependency Chain

```
Customer Domain
  → Orders Domain
      → Commercial Domain (quotations, payments)
      → Production Domain (stage_records, operators)
          → QC Domain (stage=qc, decision)
          → Delivery Domain (stage=shipping)
      → Journey Domain (customer_token → milestones)
      → Capacity Domain (Hari D, SLA)
      → KPI Domain (performance metrics)
      → Decision Center Domain (SLA Risk, bottleneck)

Consultation Domain
  → Customer Domain
  → Master Data Domain (design selections)
  → Measurement Domain
  → Orders Domain (order.created event)

Master Data Domain
  → Inventory Domain (material stock badge, read-only)
  → Design Domain (DesignSpecification)

Business Rules Domain
  → Commercial Domain (Commercial Rules)
  → Production Domain (Production Rules)
  → Capacity Domain (Capacity Rules)
  → Notification Domain (Notification Rules)

Inventory Domain
  → Orders Domain (reservation, read)
  → Master Data Domain (material_id linkage)
```

### 9.2 Database Dependency Chain

```
customers
  ← consultations (customer_id FK)
  ← orders (customer_id FK)

orders
  ← production_stage_records (order_id FK)
  ← quotations (order_id FK)
  ← order_payments (order_id FK → quotations)
  ← business_events (order_id FK)
  ← material_stock_movements (order_id FK)
  ← communication_messages (order_id FK)

design_master_options
  ← materials (optional material_id linkage)

materials
  ← material_categories (category_id FK)
  ← material_stock_movements (material_id FK)

production_operators
  ← master_divisions (division_id FK)
  ← production_stage_records (operator_id)

master_divisions
  ← production_operators (division_id FK)
```

### 9.3 Runtime → Database Mapping

| Runtime | Primary Table(s) | Read RPC(s) | Write RPC(s) |
|---------|-----------------|-------------|--------------|
| Commercial | `quotations`, `order_payments` | `get_order_invoice` | `upsert_order_quotation`, `apply_order_discount`, `apply_order_kol`, `set_order_price_override`, `record_order_payment` |
| Production | `production_stage_records` | `get_production_packet` | `start_stage`, `complete_stage`, `assign_stage_operator` |
| Notification | `notifications` | `list_pending_assignments` | `mark_notification_read` |
| Capacity | `capacity_calendar`, `capacity_override_audit_log` | `get_capacity_calendar` | `set_capacity_calendar_day` |
| KPI | (read-only, aggregated) | `get_kpi_dashboard`, `get_operator_kpi_list`, `get_divisi_kpi_list`, `get_operator_kpi_detail` | — |
| Decision | (composite) | `get_owner_summary`, `get_sla_risk_orders` | — |
| Journey | `orders`, `production_stage_records` | `get_customer_journey_snapshot`, `get_production_packet` | — |

### 9.4 UI → Runtime Dependency

| UI Surface | Runtime | Auth |
|------------|---------|------|
| Owner Dashboard (`/command-center`) | Decision, KPI, Commercial, Capacity | owner/admin |
| Owner Business Rules (`/owner/business-rules`) | Business Rules (all 5) | owner/admin |
| Owner Master Data (`/owner/master-data`) | None (direct table) | owner/admin/fitter |
| Owner Master Data Center (`/owner/master-data-center`) | None (direct table) | owner/admin/fitter |
| Owner Communications (`/owner/communications`) | None (direct table) | owner/admin |
| Fitter Check-In (`/workspace/check-in`) | None (direct table) | fitter/owner/admin |
| Fitter Measurement (`/workspace/measurement`) | None (direct table) | fitter/owner/admin |
| Fitter Design Studio (`/workspace/design-studio`) | None (direct table) | fitter/owner/admin |
| Fitter Consultation Review (`/workspace/consultation-review`) | None (direct table) | fitter/owner/admin |
| Production Kiosk (`/production`) | Production, Notification | anon (QR token) |
| Inventory Hub (`/inventory`) | Inventory | inventory/owner/admin |
| Customer Journey (`/journey/[token]`) | Journey | anon (customer token) |
| Owner KPI Fitter (`/command-center/kpi-fitter`) | KPI | owner/admin |
| Owner KPI Operator (`/command-center/kpi-operator`) | KPI | owner/admin |

---

## 10. Implementation Guardrail

### 10.1 Priority Matrix

```
PRIORITY 1: REUSE
  - Gunakan RPC yang sudah ada sebelum membuat yang baru
  - Gunakan Business Rules config daripada hardcode
  - Gunakan Business Events untuk audit trail
  - Gunakan tipe dari src/types dan src/lib/*/types.ts

PRIORITY 2: EXTEND
  - Tambah field ke table yang sudah ada (via migration)
  - Tambah parameter ke RPC yang sudah ada (via migration)
  - Tambah rule key ke Business Rules config
  - Tambah item ke Return Rules reasons array

PRIORITY 3: NEW (only if REUSE and EXTEND not possible)
  - Table baru → harus dengan RLS policy
  - RPC baru → harus SECURITY DEFINER
  - Route baru → harus di middleware.ts
```

### 10.2 What NOT To Do

| Dilarang | Alasan |
|----------|--------|
| ❌ Menambah Workflow State baru | Workflow LOCKED (11 states) |
| ❌ Menambah Production Stage baru | 8 stages LOCKED, never reorder |
| ❌ Menambah Master Data Category baru (via UI) | 11 categories LOCKED, hanya via migration |
| ❌ Menambah Customer Journey Milestone baru | 5 milestones LOCKED |
| ❌ Skip Stage toggle global | Emergency Override sudah ada untuk kasus per-order |
| ❌ Direct INSERT/UPDATE ke production_stage_records | Harus via RPC |
| ❌ Hapus data Master Data yang sudah dipakai | Gunakan Nonaktifkan, bukan Hapus |
| ❌ Ubah customer_token setelah Create Order | Generated sekali dan immutable |
| ❌ Buat custom login untuk Operator Production | Kiosk tetap no-login, QR-based |
| ❌ Overwrite customer photo yang sudah ada | INSERT-only, path unik per attempt |
| ❌ Buat WebSocket/Realtime untuk notifications | Cukup RPC-based, kiosk-wide polling |
| ❌ Simpan harga material di template Estimasi | Harga selalu live dari `materials` table |
| ❌ Ubah `orders.current_state` langsung di database | Harus via workflow events / RPC |

### 10.3 Obligatory Patterns

Setiap sprint berikutnya WAJIB mengikuti pattern yang sudah ada:

1. **RPC Pattern:** Write operations → SECURITY DEFINER RPC. Client → panggil RPC.
2. **Event Pattern:** Semua transisi state → `business_events` row dengan event_type dan event_data.
3. **Config Pattern:** Parameter yang bisa berubah → Business Rules Runtime Config, bukan hardcode.
4. **Audit Pattern:** Semua override → audit log table dengan mandatory reason + changed_by.
5. **Type Pattern:** Semua data shape → tipe di `src/types/` atau `src/lib/*/types.ts`.
6. **Access Pattern:** Role gate → di RPC (server) + middleware (route) + component (UI).

---

## 11. Production Readiness

### 11.1 Repository

| Aspek | Status | Evidence |
|-------|--------|----------|
| Git | ✅ READY | .gitignore configured |
| Build | ✅ READY | `next build` functional |
| Package | ✅ READY | package.json with all deps |

### 11.2 Database

| Aspek | Status | Evidence |
|-------|--------|----------|
| Migrations | ✅ READY | 50+ migrations, sequential dates |
| RLS | ✅ READY | Row-level security on all tables |
| Functions | ✅ READY | SECURITY DEFINER on all write RPCs |
| Indexes | ✅ READY | Index on customer_token, event_type, order_id |

### 11.3 Runtime

| Aspek | Status | Evidence |
|-------|--------|----------|
| Commercial | ✅ READY | 7+ RPC, mature, rules config |
| Production | ✅ READY | 8 stages, append-only, emergency override |
| Notification | ✅ READY | RPC-based, kiosk-wide, configurable |
| Capacity | ✅ READY | Computed + override, audit logged |
| Journey | ✅ READY | 5 milestones, token-based, 2 sub-states |
| KPI | ✅ READY | 6+ RPC, divisi breakdown |
| Decision | ✅ READY | Owner Summary, SLA Risk, Bottleneck |

### 11.4 Security

| Aspek | Status | Evidence |
|-------|--------|----------|
| Middleware | ✅ READY | 5 app prefixes protected |
| RBAC | ✅ READY | 3 DB roles → 6 app roles |
| RPC Gates | ✅ READY | Write RPCs gated by role |
| Route Protection | ✅ READY | Login/access-denied redirect |
| Public Routes | ✅ READY | /production (anon QR), /journey (token) |

### 11.5 Workflow

| Aspek | Status | Evidence |
|-------|--------|----------|
| States | ✅ READY | 11 LOCKED |
| Queue Types | ✅ READY | 9 LOCKED |
| Production Stages | ✅ READY | 8 LOCKED |
| Journey Milestones | ✅ READY | 5 LOCKED |

### 11.6 Components

| Aspek | Status | Evidence |
|-------|--------|----------|
| Owner OS | ✅ READY | Command Center, Business Rules, Master Data, KPI, Communications |
| Fitter App | ✅ READY | Check-In, Measurement, Design Studio, Consultation Review |
| Production Kiosk | ✅ READY | Production workspace, QR scan, Stage management |
| Inventory Hub | ✅ PARTIAL | Stock management OK. Fabric-usage calculator missing. Estimasi Biaya templates OK. |
| Customer Journey | ✅ READY | Timeline, Milestones, Photo grid, Shipping info |

### 11.7 Build

| Aspek | Status | Evidence |
|-------|--------|----------|
| Next.js | ✅ READY | 14.2.5 |
| Tailwind | ✅ READY | 3.4 configured |
| PostCSS | ✅ READY | Configured |

### 11.8 TypeScript

| Aspek | Status | Evidence |
|-------|--------|----------|
| Strict Mode | ✅ READY | tsconfig strict |
| Type Coverage | ✅ READY | Full coverage across 60+ lib modules |
| Zod | ✅ READY | Runtime validation available |

### 11.9 Lint

| Aspek | Status | Evidence |
|-------|--------|----------|
| ESLint | ✅ READY | Configured with next/core-web-vitals |
| Pipeline | ✅ READY | `next lint` in scripts |

### 11.10 Summary

| Domain | Status |
|--------|--------|
| Repository | ✅ **READY** |
| Database | ✅ **READY** |
| Commercial Runtime | ✅ **READY** |
| Production Runtime | ✅ **READY** |
| Owner Runtime (Decision Center) | ✅ **READY** |
| Notification Runtime | ✅ **READY** |
| Customer Journey | ✅ **READY** |
| Inventory Hub | ⚠️ **PARTIAL** (no fabric-usage calculator) |
| Build (Next.js) | ✅ **READY** |
| TypeScript | ✅ **READY** |
| Lint | ✅ **READY** |
| Security (Middleware + RBAC) | ✅ **READY** |
| Workflow | ✅ **READY** |

---

## 12. Remaining Backlog

### 12.1 Critical

| Item | Domain | Evidence |
|------|--------|----------|
| WhatsApp / Messaging integration | Notification | `notifyOrderCreated()` adalah intentional no-op — `console.info` |
| Fabric-usage calculator | Inventory | `quantityMeters` selalu null, `reserveInventory` no-op |
| Order snapshot migration untuk data lama | Legacy | Pre-Sprint-C orders tidak punya service_level, designSpecification, eventInformation |

### 12.2 High

| Item | Domain | Evidence |
|------|--------|----------|
| Fitter login tidak bisa akses Inventory Hub | Access | `INVENTORY_MANAGER_ROLES` = ['admin','owner'] — Fitter read-only |
| Production Kiosk tidak ada per-operator auth | Access | Kiosk anon, no login — semua operator lihat semua assignment |
| QC Checklist masih hardcoded sebagai fallback | Production | `QC_CHECKLIST` di `src/lib/ltos.ts` — harus migrasi penuh ke Return Rules |
| Auto-close feature untuk Delivered orders | Production | `auto_close_after_delivered` di Production Rules — perlu implementation |

### 12.3 Medium

| Item | Domain | Evidence |
|------|--------|----------|
| UI untuk Business Rules Capacity Calendar | Capacity | RPC sudah ada (`get_capacity_calendar`), UI di Business Rules page |
| UI untuk Service Rules SLA Engine | Service | RPC sudah ada (`get_service_availability`), UI belum |
| Operator Division assignment dari Owner OS | Production | RPC `upsert_operator` + `list_active_operators` sudah ada |
| Production Intelligence Sprint J items | Intelligence | `get_owner_summary` + SLA risk sudah ada, beberapa decision intelligence belum |

### 12.4 Low

| Item | Domain | Evidence |
|------|--------|----------|
| Design Studio AI DNA regeneration trigger | AI | `ai_dna` sudah ada di master options, trigger markNeedsRegeneration sudah ada |
| Mannequin render integration | UI | Mannequin component exists but render pipeline belum |

---

## 13. Sprint Recommendation

### 13.1 Recommended Sprint Order (berdasarkan evidence)

**Sprint N.1 — Foundation Completion**
```
Focus: Critical backlog items
1. WhatsApp / Messaging integration (Notification Domain)
2. Fabric-usage calculator (Inventory Domain)
3. Order snapshot backfill migration (Legacy Domain)
```

**Sprint N.2 — Inventory Completion**
```
Focus: Inventory Hub production readiness
4. Inventory → Design Studio live stock integration
5. Estimasi Biaya + actual material cost tracking
6. Inventory KPI / low stock alerts
```

**Sprint O.1 — Service Engine UI**
```
Focus: Service Rules + SLA management UI
7. Business Rules → Service Rules UI
8. Capacity Calendar management UI
9. SLA monitoring dashboard refinement
```

**Sprint O.2 — Production Intelligence**
```
Focus: Decision Center enhancement
10. Bottleneck prediction refinement
11. Operator performance trend analysis
12. Capacity planning recommendations
```

**Sprint P.1 — Customer Journey Completion**
```
Focus: Customer-facing features
13. WhatsApp notification integration (reuse from N.1)
14. AI-powered Design Preview
15. Customer feedback / Follow Up automation
```

### 13.2 Sprint Rules

1. **Tidak ada sprint yang mengubah fondasi.** Workflow, stages, milestones, categories — semua LOCKED.
2. **Tidak ada sprint yang membuat RPC baru tanpa reuse RPC existing terlebih dahulu.**
3. **Tidak ada sprint yang menambah auth baru.** Production tetap no-login QR, Journey tetap token-based.
4. **Setiap sprint WAJIB mengikuti Implementation Guardrail (Section 10).**

---

## Appendix A: Auth Matrix

| Route Prefix | Allowed Roles | Login Path | Auth Method |
|-------------|---------------|------------|-------------|
| `/owner/*` | owner, admin | `/owner/login` | Supabase Auth + Profile Role |
| `/command-center/*` | owner, admin | `/owner/login` | Supabase Auth + Profile Role |
| `/owner/master-data` | owner, admin, fitter | `/owner/login` | Supabase Auth + Profile Role |
| `/owner/master-data-center` | owner, admin, fitter | `/owner/login` | Supabase Auth + Profile Role |
| `/workspace/*` | fitter, owner, admin | `/fitter/login` | Supabase Auth + Profile Role |
| `/fitter/*` | fitter, owner, admin | `/fitter/login` | Supabase Auth + Profile Role |
| `/inventory/*` | inventory, owner, admin | `/inventory/login` | Supabase Auth + Profile Role |
| `/production/*` | **PUBLIC (anon)** | N/A | QR Token |
| `/journey/*` | **PUBLIC (anon)** | N/A | Customer Token |

## Appendix B: Migration Timeline

| Sprint | Migrations | Focus |
|--------|-----------|-------|
| Sprint A | `20260716–20260718` | Customer Journey Foundation |
| Sprint B | `20260719–20260720` | Master Data + Inventory |
| Sprint C | `20260721–20260729` | Quotation, Material Cost, Packing Video, Shipping, Service SLA |
| Sprint D | `20260730–20260731` | Production Queue Engine + Monitoring |
| Sprint E | `20260801–20260804` | KPI, Capacity, Operator, Fitter KPI, Commercial Engine |
| Sprint F | `20260804–20260805` | Business Rules Gate, Legacy Cleanup, Delivery Hotfix |
| Sprint G | `20260806–20260809` | KPI Fitter, Material Master, Capacity Engine, Divisi KPI |
| Sprint H | `20260810–20260811` | Operator Division, Business Rules Runtime Config |
| Sprint I | `20260812–20260814` | Emergency Override, Return Rules, Priority Capacity |
| Sprint L | `20260815–20260818` | Capacity Dedup, Material Category CRUD, Owner Search, Order Tracking |
| Sprint M.1 | `20260819` | Notifications RLS, Production Rules Server Validation |
| Sprint M.2 | `20260820` | Emergency Override Auto-Close |

---

**Dokumen ini adalah ARCHITECTURE CONTRACT LTOS V1.**  
**Seluruh isi berbasis evidence dari audit yang sudah selesai.**  
**Setiap perubahan pada kontrak ini memerlukan Architecture Change Request.**

