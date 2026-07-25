# LTOS — Estimation Engineering Blueprint

**Status:** DRAFT — BLUEPRINT ONLY (no code, no migration, no engine)
**Sprint:** E.1
**Date:** 2026-07-25
**Basis:** Repository evidence (`src/lib/order/service.ts`, `src/lib/order/estimationValidation.ts`, `src/lib/designSpecification/*`, `src/lib/inventory/materialCalculator.ts`, `src/lib/decision/types.ts`, `supabase/migrations/20260728000000_add_service_sla_engine.sql`, `20260729000000_add_service_validation_preview.sql`, `20260808000000_add_capacity_engine.sql`, `20260814000000_add_priority_capacity_engine.sql`), `ARCHITECTURE_LOCK_V1.md`, `MATERIAL_ENGINEERING_BLUEPRINT.md`

---

## 1. Estimation Map

LTOS has **six** distinct estimation types in the repository today — one more than the brief's example list, since Capacity turned out to split into a computed engine and a per-order validation product built on top of it, plus a sixth kind (Delivery) that turned out to be a deliberate non-estimate.

### 1.1 Harga (Price)

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `PriceSnapshot` (`src/lib/designSpecification/types.ts`) — `{ lines: PriceSnapshotLine[], total }`, each line freezing `optionId/optionName/price/subtotal` at the moment a pilihan is picked |
| **Writer** | `buildDesignSpecification()` (`src/lib/designSpecification/buildSpecification.ts`), invoked live as the Fitter picks options in Design Studio; persisted as part of the order snapshot at Create Order (ADR-009) |
| **Reader** | `EstimasiHargaPanel.tsx` (Design Studio live sidebar), `DesignSummaryPanel.tsx`, downstream Commercial Engine (quotation seeds from this snapshot) |
| **Runtime** | None — pure client-side computation over already-fetched Master Data prices, re-run on every selection change |
| **Business Rules** | None specific to pricing math itself; Commercial Rules (`min_dp_percent`, `max_discount_percent`, etc.) apply *after* this estimate, once it becomes a quotation |
| **Dependency** | Master Data Domain (`design_master_options.price`, live at selection time) |
| **Status** | **Sudah matang.** Explicitly designed to never drift: `EstimasiHargaPanel` "never recalculates its own price, so it can never drift from what persist() saves as the actual Price Snapshot." Frozen-at-selection semantics match ADR-009's snapshot philosophy exactly. |

### 1.2 Waktu / SLA (Estimated Completion)

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `orders.service_level` + `orders.hari_d` (set once, locked) → `estimated_completion` computed on every read by `add_working_days(hari_d, working_days)` |
| **Writer** | `set_order_service()` RPC — resolves and locks `hari_d` via `resolve_hari_d()` at the moment the customer's service choice is committed; never recomputed after |
| **Reader** | `get_production_packet()` (Production Kiosk `HeroCard`, Owner OS `OrderDetailModal`), `get_sla_risk_orders()` (Decision Center), `preview_service_validation()` (Consultation Review, before an order exists) |
| **Runtime** | `resolve_hari_d()`, `add_working_days()`, `validate_service_selection()`, `preview_service_validation()`, `set_order_service()`, `get_service_sla_rules()`/`set_service_sla_rule()` — all SECURITY DEFINER RPC (`supabase/migrations/20260728000000_add_service_sla_engine.sql`, `20260729000000_add_service_validation_preview.sql`) |
| **Business Rules** | `service_sla_rules` table — working-day counts per service level (`standard`=14, `fast`=9, `very_fast`=3), editable via `set_service_sla_rule()`, never hardcoded in app code per its own table comment |
| **Dependency** | Capacity (Hari D resolution reads `compute_daily_capacity`/`production_capacity_calendar`), KPI (validation's third signal reads `get_production_kpis()` backlog) |
| **Status** | **Sudah matang.** Deterministic working-day math (Senin–Sabtu, Sunday closed), business-rule-driven, with an explicit legacy fallback (`created_at + 14 days`) for pre-Sprint-C orders that never got a `service_level`/`hari_d`. The "Estimasi Pengerjaan" dropdown Fitters see in Consultation Review (`EstimationCard.tsx`) is this same engine's input surface, not a separate estimation type — it just predates the Service Engine as a free-text-encoded field (`fitterEnhancementsCodec.ts`) and is mapped onto it via `mapEstimasiToServiceLevel()`. |

### 1.3 Material (Estimasi Biaya)

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `material_cost_templates` — `MaterialEstimateRow{materialId, quantity}` refs + `AdditionalCostRow[]` + `hargaJual` |
| **Writer** | `saveCostTemplate()` (`src/lib/inventory/materialCalculator.ts`), authored in the Inventory Material page's Estimasi Biaya drawer |
| **Reader** | Same drawer's "Gunakan Template," `EstimatePrintView.tsx` |
| **Runtime** | None — direct table CRUD; totals computed client-side at render time against **live** `materials.price` (ADR-014 — price is never denormalized into the template) |
| **Business Rules** | None — no ceiling/floor rule on `hargaJual` or margin |
| **Dependency** | Material Master (live price join) |
| **Status** | **Sebagian matang** — fully covered in `MATERIAL_ENGINEERING_BLUEPRINT.md` §1.6/§1.10. The estimate mechanism itself is solid (never goes stale on price), but it is a **global, reusable worksheet, not order-scoped** — there is no persisted "this order's estimated material cost" record, and (per that blueprint) no path from this prospective estimate to a realized actual-cost figure. |

### 1.4 Capacity (Computed Daily Capacity)

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `compute_daily_capacity(p_date)` — `MIN(divisi_capacity − divisi_load)` across staffed production divisions; `production_capacity_calendar.max_orders` is override-only (`null` = use computed engine) |
| **Writer** | Computed engine is read-only/derived (no writer); override path is `set_capacity_calendar_day()` (admin/owner, mandatory reason, audit-logged) |
| **Reader** | `get_capacity_calendar()` (Owner OS Capacity Calendar UI), `resolve_hari_d()` (consumes the effective value internally for the Waktu/SLA estimate) |
| **Runtime** | `compute_daily_capacity`, `get_capacity_calendar`, `set_capacity_calendar_day` — SECURITY DEFINER RPC (`supabase/migrations/20260808000000_add_capacity_engine.sql`) |
| **Business Rules** | Divisions with zero active operators are excluded from the `MIN()` rather than forcing capacity to zero everywhere (explicit, documented business decision — "an unstaffed divisi is not yet a trackable bottleneck, it's a data-tagging gap") |
| **Dependency** | Production Domain (`production_operators.max_concurrent_capacity`, `production_stage_records` active load), Business Rules Domain (override audit) |
| **Status** | **Sebagian matang.** The computed/override split, audit trail, and Sprint L dedup work are all mature. But the migration's own comment documents a real scope limit: `compute_daily_capacity(p_date)` **ignores `p_date`** — "there is no per-day operator work schedule in this app yet... this is a live snapshot of today's operator state applied uniformly to every date, not a true per-date forecast." Every future date on the Capacity Calendar shows today's headroom, not a projection that accounts for orders already committed to land on intervening dates in a way that would change *future* operator load. |

### 1.5 SLA / Estimation Validation (SAFE / RISK / IMPOSSIBLE)

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `EstimationValidationResult` (`src/lib/order/estimationValidation.ts`) — a **client-side-only**, never-persisted comparison |
| **Writer** | `computeEstimationValidation()` — pure function, no RPC, no table |
| **Reader** | `EstimationValidationCard.tsx` (Consultation Review, Milestone 3 Consultation Decision Engine) |
| **Runtime** | None — takes the already-fetched `ServiceValidationResult` (from 1.2's `preview_service_validation`) and the Fitter-entered Target Usage Date, and derives a verdict client-side |
| **Business Rules** | Hardcoded verdict thresholds in the function itself (buffer < 0 + inflexible → IMPOSSIBLE; buffer < 0 + flexible, buffer = 0, or upstream yellow/red → RISK; else SAFE) — **not** a Business Rules Runtime Config table, unlike every other rule set in the app |
| **Dependency** | Waktu/SLA (1.2) entirely — this stage adds zero new data, only a comparison against Target Usage Date + Deadline Flexibility |
| **Status** | **Sudah matang** for what it does, but narrow in scope: it is a read-only recommendation layer, never gates Create Order (`OWNER_INTELLIGENCE_DISCOVERY.md`/prior sprint notes confirm no gating exists), and its thresholds are the one ungoverned rule set in the entire Estimation domain — every other business-tunable number here (`service_sla_rules`, capacity overrides) lives in a config table; this one is a literal constant in TypeScript. |

### 1.6 Delivery (Estimasi Tiba / Shipping ETA)

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | **Does not exist.** |
| **Writer** | N/A |
| **Reader** | `ShippingInfoSection.tsx` renders whatever string it's given |
| **Runtime** | None |
| **Business Rules** | None |
| **Dependency** | N/A |
| **Status** | **Belum ada.** `MILESTONE_5_CONTENT.shipping.shippingInfo.estimatedArrival` is a **hardcoded static string** — `'Akan diinformasikan segera'` ("will be informed soon") — in `src/lib/journey/milestoneContent.ts`. Courier and tracking number are real (sourced from the Shipping stage per `ProductionPacketWorkspace`/`ShippingReferencePanel`), but arrival date is not computed from anything: no carrier API, no fixed transit-day rule, no distance/region heuristic. This mirrors `OrderStatusSection.tsx`'s Milestone 1 copy, which carries the same honesty comment verbatim: *"No production-time estimator exists in this repo... an honest 'will be informed' beats a fabricated date."* That comment is accurate for Milestone 1's own display choice (it deliberately doesn't surface the real `estimated_completion` from 1.2 at that milestone), but for Milestone 5 specifically there is no underlying estimator to surface even if the team wanted to — this is a genuine gap, not just a display omission. |

---

## 2. Dependency Map

```
Master Data Domain (design_master_options.price)
  → Harga (Price Snapshot)
      → Commercial Domain (quotation seeds from this estimate)

Business Rules Domain (service_sla_rules)
  → Waktu/SLA (Hari D + Estimated Completion)
      → Capacity (resolve_hari_d consumes compute_daily_capacity)
      → KPI Domain (validate_service_selection's 3rd signal reads production backlog)
      → SLA/Estimation Validation (compares this against Target Usage Date)
      → Decision Domain (get_sla_risk_orders reuses the same estimated_completion)

Production Domain (production_operators, production_stage_records)
  → Capacity (compute_daily_capacity)
      → Waktu/SLA (via resolve_hari_d)

Material Master (materials.price, live join)
  → Material (Estimasi Biaya) — see MATERIAL_ENGINEERING_BLUEPRINT.md for the fuller chain

Waktu/SLA
  → SLA/Estimation Validation (pure downstream comparison, adds no new data)

(nothing)
  → Delivery — no upstream dependency because no computation exists
```

**Reading this map:** Harga and Material are parallel, independent estimates (both anchored on Master Data prices, neither depends on the other). Waktu/SLA is the hub — Capacity feeds it, and both SLA/Estimation Validation and the Decision Center's SLA Risk dashboard are pure downstream consumers of its one number (`estimated_completion`), not separate estimation engines in their own right. Delivery sits completely outside this graph — it has no dependency because it has no computation.

---

## 3. Runtime Ownership

| Estimation | RPC / Function | Access | App Surface | Persisted? |
|-----------|----------------|--------|-------------|-----------|
| Harga | none (client function) | all authenticated | Design Studio | Yes — frozen into order snapshot (ADR-009) |
| Waktu/SLA | `resolve_hari_d`, `add_working_days`, `validate_service_selection`, `preview_service_validation`, `set_order_service`, `get_service_sla_rules`, `set_service_sla_rule` | anon/authenticated read; admin/owner write on rules; authenticated write on `set_order_service` | Consultation Review, Production Kiosk, Owner OS | Yes — `orders.service_level`/`hari_d` locked once; `estimated_completion` recomputed live on every read |
| Material (Estimasi Biaya) | none (direct table CRUD) | admin/owner | Inventory Hub | Yes — as a reusable template, not order-scoped |
| Capacity | `compute_daily_capacity`, `get_capacity_calendar`, `set_capacity_calendar_day` | authenticated read; admin/owner override write | Owner OS (Business Rules → Capacity Calendar) | Override only — computed value is never persisted, recomputed on every call |
| SLA/Estimation Validation | none (client function) | all authenticated | Consultation Review (Milestone 3) | No — ephemeral, recomputed on every render |
| Delivery | none | — | Customer Journey (Milestone 5) | No — static copy, not a computation |

---

## 4. Gap Analysis

| Estimation | Status | Evidence |
|-----------|--------|----------|
| Harga (Price) | **Sudah matang** | `PriceSnapshot`, frozen-at-selection, ADR-009-aligned, zero drift by construction |
| Waktu/SLA (Estimated Completion) | **Sudah matang** | Full RPC surface, business-rule-driven day counts, legacy fallback for old orders, reused consistently across Kiosk/Owner OS/Decision Center |
| Material (Estimasi Biaya) | **Sebagian matang** | Solid live-price mechanism, but order-decoupled — no per-order estimate record (detailed in `MATERIAL_ENGINEERING_BLUEPRINT.md`) |
| Capacity (Computed Daily Capacity) | **Sebagian matang** | Real computed/override engine with audit trail, but explicitly documented as a same-day snapshot applied to every future date, not a true per-date forecast |
| SLA/Estimation Validation (SAFE/RISK/IMPOSSIBLE) | **Sudah matang (scope-limited)** | Correct and shipped, but its verdict thresholds are hardcoded in TypeScript rather than living in a Business Rules config table like every sibling engine, and it never gates Create Order |
| Delivery (Shipping ETA) | **Belum ada** | `estimatedArrival` is a literal hardcoded string in `milestoneContent.ts` — no computation, no data source, no business rule |

**Summary:** 2 of 6 fully mature (Harga, Waktu/SLA). 3 partial, each for a different reason (Material: order-decoupled; Capacity: not a true per-date forecast; SLA Validation: correct but its rules aren't config-driven). 1 does not exist (Delivery).

---

## 5. Recommendation

Sequencing logic only — no implementation detail, per this sprint's Rules.

1. **Delivery ETA is the only true "belum ada" and the lowest-risk fix.** Unlike Margin in the Material blueprint, this doesn't need new upstream data — a fixed transit-day-by-courier rule (even a flat "+2 hari kerja dari tanggal Approve Shipping," business-rule-configurable like `service_sla_rules`) would replace the static string with a real, if simple, estimate. No new dependency chain to build first.

2. **SLA/Estimation Validation's hardcoded thresholds are the one inconsistency worth flagging**, not fixing urgently — every other business-tunable number in this domain (`service_sla_rules.working_days`, capacity overrides) lives in a Business Rules config table per the Obligatory Pattern in `ARCHITECTURE_LOCK_V1.md` §10.3 ("Parameter yang bisa berubah → Business Rules Runtime Config, bukan hardcode"). The verdict thresholds (buffer days, yellow/red escalation) are the exception. Whether this is worth reconciling depends on whether Owner ever wants to tune "how much buffer counts as RISK" without a redeploy.

3. **Capacity's "not a true per-date forecast" limitation should not be silently treated as solved.** Any future feature that promises multi-week capacity planning (e.g., "can we accept this order landing in 6 weeks") would currently be answering with today's operator snapshot, not a real projection. This is an honest, documented limitation already (the migration comment says so plainly) — the recommendation is simply to keep surfacing that caveat in any UI that displays future dates from `get_capacity_calendar`, not to imply otherwise.

4. **Material's Estimate gap is already covered** by `MATERIAL_ENGINEERING_BLUEPRINT.md` §7 — no duplicate recommendation needed here; that blueprint's sequencing (fabric-usage calculator → order-scoped actual cost → Margin) is the correct path and also happens to be the thing that would eventually let a *Material* estimate become order-scoped.

---

## 6. Sprint Breakdown (Sequencing Only)

| Sprint | Focus | Closes Gap | Precondition |
|--------|-------|-----------|--------------|
| (unscheduled) | Shipping ETA business rule (e.g., transit-days-by-courier config, mirroring `service_sla_rules`'s shape) | Delivery | None — independent of every other estimation type |
| (unscheduled) | Move SLA/Estimation Validation's verdict thresholds into a Business Rules config table | SLA/Estimation Validation (governance-only, not a functional gap) | None — purely a consistency fix with the rest of the Business Rules Domain |
| N.2 (existing plan, per `MATERIAL_ENGINEERING_BLUEPRINT.md`) | Fabric-usage calculator → order-scoped Material estimate | Material (Estimasi Biaya) | Shared precondition with the Material blueprint's own sprint plan |
| (unscheduled, larger) | Per-date operator work schedule (so `compute_daily_capacity` can actually vary by `p_date`) | Capacity (true forecast) | Requires modeling scheduled Libur/Cuti as date ranges instead of a manually-toggled current status — out of scope to design here |

---

**This document is a Blueprint, not a Contract.** Nothing here is LOCKED. It maps what estimation logic exists in the repository today against the six categories named in the brief, to inform future sprint sequencing. No RPC, table, or business rule described as missing has been created by this document.
