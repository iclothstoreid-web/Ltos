# LTOS — CHANGELOG V1

**Release:** v1.1.0 — LTOS V1 Golden Release
**Date:** 2026-07-25

> **Note on version number:** `v1.0.0` was already tagged and pushed earlier (2026-07-24, commit `baaf668`, "LTOS V1 baseline" — Sprint A–K plus the Delivery workflow hotfix). That tag is left untouched. This document and its corresponding `v1.1.0` tag represent the actual V1 Golden Release — everything through Sprint N.2, with the full sprint/ADR/architecture history below (which subsumes the earlier baseline).
**Basis:** Git history (`main`), `ARCHITECTURE_LOCK_V1.md`, `OWNER_INTELLIGENCE_DISCOVERY.md`, `MATERIAL_ENGINEERING_BLUEPRINT.md`, `ESTIMATION_ENGINEERING_BLUEPRINT.md`, production Supabase project `ltos-v1`

---

## 1. Sprints

| Sprint | Commit(s) | Date | Summary |
|---|---|---|---|
| Bootstrap | `67e6419`…`2c77048` | 2026-07-11–12 | Initial project scaffold (Next.js app, Supabase client, base config) — pre-sprint upload/cleanup history |
| Sprint X | `634a2cd` | 2026-07-16 | Early internal sprint closure ("Sprint X selesai") |
| Phase 1 | `23b6a4a`, `07264cf`, `8779363`, `e637a9c` | 2026-07-19 | Validation sprint 1; **LTOS Phase 1 complete** release; Production Flow separated from Workspace; Command Center renamed to Owner OS |
| Stabilization | `98cd350`, `7591a36`, `66e988c`, `a32630e`, `3d6309a`, `06f0dd7`, `7fc5b94`, `a9e39ec` | 2026-07-20 | Production stabilization, customer experience media pipeline, upload sync fix, responsive optimization, mannequin positioning fixes |
| Sprint 01 | `92d2e64` | 2026-07-22 | Production workflow + AI foundation complete |
| — | `d79f980` | 2026-07-23 | Cutting Model, Pergelangan, Tugaskan, back-guard features |
| Sprint B | `5c3a64d` | 2026-07-23 | Backend foundation: KPI, Capacity, Hari D, Operator Performance |
| Sprint C | `a9ec341` | 2026-07-23 | Service/SLA/Estimated Completion Engine + Service Validation |
| Sprint D–H | `edd1ca7` | 2026-07-23 | Queue/Monitoring/Waiting-Time/KPI/Intelligence + Decision Center wiring |
| Sprint K | `c90ab81`, `ae71503`, `a356153`, `12b37e2`, `baaf668`, `870931d`, `0440727`, `fccbd2b`, `dca23a2` | 2026-07-24 | Commercial Engine, Master Data Center, Operator Management, Fitter KPI, Capacity Integration; Business Operating System Foundation; LOCK V1 gap closure (Business Rules hub, Material Master, KPI Fitter, Capacity Engine); Business Rules as Runtime Configuration; Delivery workflow hotfix + Master Division; KPI Operator divisi breakdown + Operator↔Division FK migration; sidebar/session cleanup |
| Sprint L | `3c6e1f9` | 2026-07-25 | Capacity Engine dedup, Material Category CRUD, Owner Global Search, Order On Track customer name |
| Sprint M.1/M.2 | `a4b4825` | 2026-07-25 | Security hardening, server-side validation, runtime consistency fixes |
| Sprint N.0 | *(discovery only)* | 2026-07-25 | `OWNER_INTELLIGENCE_DISCOVERY.md` — Owner OS audit, decision coverage scored at 23% (11/48 cells) |
| Sprint N.1 | `fd47dc7` | 2026-07-25 | Owner Decision Layer V1 — 4 Decision Cards (Operational, Commercial, Inventory, Business Insight) on Owner Command Center |
| Sprint N.2 | `a4aadbc` | 2026-07-25 | Actionable Decision Layer V1 — drill-down items per Decision Card, Material Intelligence Panel on Inventory Dashboard |
| Sprint I.4 | *(discovery only)* | 2026-07-25 | `MATERIAL_ENGINEERING_BLUEPRINT.md` — 12-stage material lifecycle gap map (2/12 mature) |
| Sprint E.1 | *(discovery only)* | 2026-07-25 | `ESTIMATION_ENGINEERING_BLUEPRINT.md` — 6-type estimation gap map (2/6 mature) |

---

## 2. Epics

1. **Foundation & Core Workflow** — Bootstrap → Phase 1 → Sprint 01. Established the 11-state workflow, RBAC, Supabase RLS baseline, and Production Kiosk foundation.
2. **Customer Experience & Production Media** — Stabilization sprints. Customer photo/media pipeline, packing video, shipping info.
3. **Intelligence Foundation** — Sprint B, C, D–H. KPI, Capacity, SLA engine, Queue/Monitoring/Decision Center wiring.
4. **Business Operating System** — Sprint K (all sub-commits). Commercial Engine, Business Rules Runtime Config, Master Data Center, Operator Management, Capacity Engine.
5. **V1 Lock & Owner Decision Layer** — Sprint L, M.1/M.2, N.0, N.1, N.2. Final hardening, security fixes, and the Owner Decision Layer (cards + drill-downs) that this release ships with.

---

## 3. Architecture Decision Records (ADR-001–ADR-020)

All LOCKED per `ARCHITECTURE_LOCK_V1.md` §7 — none in Proposed state.

| ADR | Title |
|---|---|
| ADR-001 | QC Checklist ≠ Return Rules |
| ADR-002 | Production Runtime memakai `production_stage_records` |
| ADR-003 | `orders.current_state` bukan runtime utama |
| ADR-004 | Commercial adalah Runtime Matang |
| ADR-005 | Notification memakai RPC, bukan WebSocket/Realtime |
| ADR-006 | Runtime Validation berada di server |
| ADR-007 | Emergency Override ≠ Skip Stage |
| ADR-008 | Customer Token ≠ Order Number |
| ADR-009 | Order Snapshot di Business Events, bukan di Orders |
| ADR-010 | Order Number = Consultation Number yang di-replace prefix |
| ADR-011 | Production Kiosk = No Login, QR-Token Only |
| ADR-012 | Master Data Categories = LOCKED, 11 fixed |
| ADR-013 | Fitter = READ-ONLY on Inventory |
| ADR-014 | Material Price = Live dari Inventory, tidak dari template |
| ADR-015 | RBAC — 3 DB roles mapped to 6 App roles |
| ADR-016 | QC Decision (Alter) = new attempt, no UPDATE |
| ADR-017 | Capacity = Computed + Override, Bukan Manual |
| ADR-018 | Customer Photos = INSERT-only, no UPSERT |
| ADR-019 | Order Created Notification = Belum Implementasi (placeholder) |
| ADR-020 | Inventory Reservation = Wired but No-Op |

*Note: a brief for Sprint I.4 referenced "ADR-021 (Fabric Quantity)" — no such ADR exists. `MATERIAL_ENGINEERING_BLUEPRINT.md` already reconciled this to ADR-020; treated as a naming artifact, not a real pending ADR.*

---

## 4. Architecture Lock (Summary)

Per `ARCHITECTURE_LOCK_V1.md` — LOCKED, requires an Architecture Change Request to modify:

- **Workflow:** 11 states (Lead → Consultation → Appointment → Measurement → Quotation → Order → Assign → Production → QC → Delivery → Follow Up)
- **Production Stages:** 8, never reorder (`material_prep → pattern_formulation → cutting → sewing → qc → finishing → packing → shipping`)
- **Customer Journey Milestones:** 5, with 2 delivery sub-states (`shipping` / `delivered`)
- **Queue Types:** 9 (`consultation → appointment → measurement → quotation → assign → production → qc → delivery → follow_up`)
- **Master Data Categories:** 11, fixed via DB check constraint
- **RBAC:** 3 DB roles (owner/admin/artisan) mapped to 6 app roles
- **15 Domains** mapped with Source of Truth / Writer / Reader / Dependency contracts (§2–3)
- **7 Runtime Engines** (Commercial, Production, Notification, Capacity, Journey, Owner/Decision, KPI) — all SECURITY DEFINER RPC-based, all rated Matang (mature)
- **6 Business Rules config sets** (Commercial, Production, Capacity, Notification, Return, Service)

---

## 5. Feature Complete (Domain Status)

| Domain | Status |
|---|---|
| Customer | Complete |
| Consultation | Complete |
| Measurement | Complete |
| Design / Master Data | Complete |
| Commercial | Complete (runtime) |
| Production | Complete |
| QC | Complete |
| Delivery | Partial — core flow complete; Shipping ETA is a static placeholder string, not computed |
| Customer Journey | Complete |
| Business Rules | Complete |
| Capacity | Partial — computed/override engine mature; documented as same-day snapshot, not true per-date forecast |
| Notification | Partial — kiosk-wide RPC notification complete; WhatsApp/customer messaging is an intentional no-op (ADR-019) |
| KPI | Complete (snapshot); historical trend out of scope for V1 |
| Inventory | Partial — Material Master + Stock mature (2/12 lifecycle stages); Reservation wired-but-dormant (ADR-020); Purchase, Actual Consumption, Waste, Margin do not exist |
| Owner OS / Decision Center | Partial — Sprint N.1 + N.2 shipped; decision coverage measured at 23% (11/48 cells), an accepted V1 ceiling per `OWNER_INTELLIGENCE_DISCOVERY.md` |

---

## 6. Deferred to V1.1

- Fabric-usage calculator → close Reservation's dormancy (ADR-020)
- Actual Consumption + Waste movement types (requires schema change)
- Cost(actual) + Margin per order; Purchase/Supplier entity + PO history
- Shipping ETA business rule (replace hardcoded placeholder)
- SLA/Estimation Validation thresholds → move into Business Rules config
- Per-date operator capacity forecast (currently a same-day snapshot applied to all future dates)
- WhatsApp/customer messaging integration (ADR-019)
- Owner Decision Intelligence P2–P4 items (order acceptance recommendation, operator comparison, KPI trend history, what-if capacity simulation, payment aging, owner notification inbox)

---

## 7. Known Gap — Migration History (Accepted)

The repository's `supabase/migrations/` folder contains 46 files, starting `20260716000000_add_customer_token_and_journey_lookup.sql`. The production database (`ltos-v1`, ref `vdgkbzpdgmlzyxaiznka`) has **68 applied migrations**, including 22 earlier ones dated 2026-07-12–2026-07-18 that predate this repo's migration-file discipline:

`001_create_core_entities`, `002_create_business_events`, `003_create_rls_policies`, `005_create_helper_views`, `ltos_sprint_01_check_in`, `ltos_sprint_02_measurement_workspace`, `ltos_sprint_02_fitter_measurement`, `production_workflow_tables`, `production_workflow_functions_and_storage`, `production_evidence_bucket_policy_fix`, `get_production_packet_include_operator_name`, `complete_stage_generalize_return_and_packet_notes`, `complete_stage_accept_scan_completed_at`, `drop_old_complete_stage_overload`, `create_design_master_options`, `create_communication_messages`, `add_order_communication_rpcs`, `master_data_product_knowledge_base`, `master_data_delete_policy`, `lock_master_data_categories`, `add_ai_design_dna_to_master_options`, `add_render_recipe_to_master_options`.

**Status: accepted historical gap, not remediated in this release.** These migrations are live and correct in production; they are simply not represented as versioned files in this repo. No migration was created or altered to close this gap as part of the V1.0.0 release (out of scope per release rules). A future dedicated task should decide whether to backfill baseline migration files for historical completeness.

All 46 migrations present in the repo have a 1:1 name match in production — no divergence found in anything the repo *does* track.

---

**This document is the official V1 changelog. It supersedes no other document — `ARCHITECTURE_LOCK_V1.md` remains the architecture contract.**
