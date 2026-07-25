# LTOS — Material Engineering Blueprint

**Status:** DRAFT — BLUEPRINT ONLY (no code, no migration, no engine)
**Sprint:** I.4
**Date:** 2026-07-25
**Basis:** Repository evidence (`src/lib/inventory/*`, `src/lib/order/inventory.ts`, `supabase/migrations/20260720000000_add_inventory.sql`, `20260807000000_add_material_master_fields.sql`), `ARCHITECTURE_LOCK_V1.md`, `OWNER_INTELLIGENCE_DISCOVERY.md`

> **Note on ADR-021:** The brief for this sprint cites "ADR-021 (Fabric Quantity)." No ADR-021 exists in `ARCHITECTURE_LOCK_V1.md` or anywhere else in the repository — the ADR list is LOCKED at ADR-001–ADR-020. The only ADR on this exact topic is **ADR-020: "Inventory Reservation = Wired but No-Op"** (`reserveInventory()` is called at Create Order, but `quantityMeters` is always `null`, so it never fires). This document treats the brief's reference as ADR-020 and flags the discrepancy here rather than fabricating a new ADR. If a real ADR-021 exists elsewhere, this document should be reconciled against it.

---

## 1. Domain Blueprint

Twelve stages, per the brief's lifecycle. Each stage lists Source of Truth / Writer / Reader / Dependency / Business Event / Runtime / Owner / Status.

### 1.1 Supplier

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `materials.supplier` (free text column) |
| **Writer** | `/owner/material-master` admin page → `updateMaterial()` (`src/lib/inventory/materials.ts`) |
| **Reader** | Material Master page, Material Detail Drawer |
| **Dependency** | None — not a foreign key, not a table |
| **Business Event** | None |
| **Runtime** | None — plain column read/write, no RPC |
| **Owner** | Owner/Admin (Inventory Hub) |
| **Status** | **Sebagian ada** — identity field only. No supplier entity, no purchase history per supplier, no performance tracking. `OWNER_INTELLIGENCE_DISCOVERY.md` §7 item 14 explicitly lists "Supplier performance" as NEW/unbuilt. |

### 1.2 Material Master

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `materials` + `material_categories` tables |
| **Writer** | Inventory Hub (`createMaterial`, `updateMaterial` in `src/lib/inventory/materials.ts`) |
| **Reader** | Inventory Hub, Fitter App (stock badge, read-only per ADR-013), Command Center (Inventory Alert Card) |
| **Dependency** | `material_categories` (category_id FK), `design_master_options.material_id` (optional linkage) |
| **Business Event** | None on create/update — only `inventory.low_stock` on stock crossing threshold (see 1.4) |
| **Runtime** | Direct table read/write under RLS (admin/owner insert/update; staff incl. artisan select) — no RPC needed since it's not a stock-mutating write |
| **Owner** | Owner/Admin (Inventory Hub); identity fields specifically via Material Master page per Sprint K's split (migration `20260807000000`) |
| **Status** | **Sudah ada** — mature, LOCKED-adjacent (11 fixed categories per ADR-012 analog for materials via `material_categories`, though categories here are CRUD-able per Sprint L, not hardcoded like Master Data's 11). |

### 1.3 Purchase

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | **None exists.** |
| **Writer** | N/A |
| **Reader** | N/A |
| **Dependency** | N/A |
| **Business Event** | None |
| **Runtime** | None |
| **Owner** | Unowned |
| **Status** | **Belum ada.** There is no purchase order, supplier invoice, or purchase-price-history record anywhere in the schema or codebase. The only "material entering the building" event is a manual `stock_in` movement via `inventory_adjust_stock` — this is a physical count correction, not a purchase transaction. It carries no supplier reference, no PO number, no purchase unit cost distinct from `materials.price` (which is the current *selling/costing* price used everywhere, not a purchase-cost ledger). This is the first structural gap in the chain: Supplier and Material Master exist as data, but nothing connects a purchase event to either. |

### 1.4 Stock

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `materials.physical_stock` / `reserved_stock` + generated `available_stock` (`physical_stock - reserved_stock`, stored column) + `material_stock_movements` (append-only ledger) |
| **Writer** | `inventory_adjust_stock(material_id, movement_type, quantity, notes)` — SECURITY DEFINER RPC, admin/owner only, movement_type ∈ {`stock_in`, `stock_out`, `adjustment`} |
| **Reader** | Inventory Hub (Dashboard, Material Detail Drawer "Riwayat Stok"), Fitter App (`fetchMaterialStockByName` — read-only stock badge) |
| **Dependency** | Material Master (`material_id` FK) |
| **Business Event** | `inventory.low_stock` fired inside `inventory_adjust_stock` (and inside `release_material_reservation`) whenever `available_stock <= min_stock` after the write |
| **Runtime** | SECURITY DEFINER RPC, direct table read under RLS |
| **Owner** | Inventory Hub (owner/admin) — enforced by grants: direct `UPDATE` on `materials` is column-restricted to descriptive fields only; `physical_stock`/`reserved_stock` can only change via the three RPC functions |
| **Status** | **Sudah ada** — mature. This is the most complete stage in the entire chain. |

### 1.5 Reservation

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `materials.reserved_stock` + `material_stock_movements` (movement_type = `reservation`) |
| **Writer** | `reserve_material_for_order(order_id, material_name, quantity)` RPC, called from `reserveInventory()` (`src/lib/order/inventory.ts`) inside `createOrderFromConsultation()` |
| **Reader** | Material Detail Drawer (`fetchMaterialOrderHistory`), Order Detail (`fetchOrderMaterialUsage`) |
| **Dependency** | Material Master (matched **by name**, not by `material_id` — a name mismatch silently returns `null`, never blocks order creation), Order Domain (`order_id` FK on the movement row) |
| **Business Event** | None directly (only the downstream `inventory.low_stock` if the reservation pushes availability under threshold) |
| **Runtime** | SECURITY DEFINER RPC |
| **Owner** | Written from the Order Domain (Fitter's Create Order flow), but the mutation itself lives in Inventory's RPC surface |
| **Status** | **Sebagian ada — wired but dormant (ADR-020).** The RPC, the ledger, and the read-side aggregation (`MaterialOrderUsage`/`OrderMaterialUsage`, `MaterialUsageStatus`) are all fully built (Sprint I.2). But `reserveInventory()` short-circuits whenever `request.quantityMeters === null` — and `createOrder.ts` **always** passes `quantityMeters: null` today, because no fabric-usage calculator exists to compute it. So in production, this RPC is never actually invoked with a real quantity; the entire Reservation stage is functionally inert despite being fully implemented in the database. |

### 1.6 Estimate

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `material_cost_templates` table ("Estimasi Biaya" tab) |
| **Writer** | `saveCostTemplate()` (`src/lib/inventory/materialCalculator.ts`), authored from the Material page's costing drawer |
| **Reader** | `fetchCostTemplates()` — same drawer, "Gunakan Template" |
| **Dependency** | Material Master (`MaterialEstimateRow.materialId` refs, price always **live-joined** at read time per ADR-014 — never denormalized into the template) |
| **Business Event** | None |
| **Runtime** | Direct table read/write, admin/owner RLS (same shape as `material_categories`) |
| **Owner** | Inventory Hub |
| **Status** | **Sebagian ada.** The template mechanism (rows + additional costs + `hargaJual` + notes) is solid and ADR-014-compliant (price never goes stale). But templates are **global and reusable**, not scoped to a specific order — there is no "this order's estimated material cost" record that persists per-order. An Estimate is a costing worksheet, not an order-linked commitment. |

### 1.7 Production

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `production_stage_records` (stage = `material_prep`, the kiosk's "Persiapan Material") — production's own domain — but the material *side-effect* of completing that stage lives in `material_stock_movements` |
| **Writer** | `ProductionPacketWorkspace.tsx` calls `releaseMaterialReservation(supabase, orderId)` immediately after marking "Persiapan Material" complete |
| **Reader** | Production Kiosk (own stage state), Inventory Hub (movement ledger) |
| **Dependency** | Reservation stage (release nets against open `reservation` movements for that `order_id`), Production Domain (`production_stage_records`) |
| **Business Event** | `inventory.low_stock` (same trigger as Stock) |
| **Runtime** | `release_material_reservation(order_id)` RPC — callable by `anon` (kiosk has no login, per ADR-011) |
| **Owner** | Production Kiosk triggers it; Inventory Hub owns the resulting ledger rows |
| **Status** | **Sebagian ada** — the RPC exists and is correctly wired to the kiosk's material-prep completion. But because Reservation (1.5) is dormant, this RPC's `for` loop over "open reservations for this order" almost always finds nothing, and the release is a no-op in practice too. When it *does* fire, it releases exactly the reserved quantity — see 1.8. |

### 1.8 Actual Consumption

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | **Not modeled as distinct from Reservation.** |
| **Writer** | `release_material_reservation()` deducts `physical_stock` by the *reserved* quantity, not an independently measured actual-usage quantity |
| **Reader** | N/A |
| **Dependency** | Reservation |
| **Business Event** | None distinct from `inventory.low_stock` |
| **Runtime** | Same RPC as Production (1.7) |
| **Owner** | Unowned as a concept |
| **Status** | **Belum ada.** There is no mechanism for an operator to record "I actually used 3.2m, not the 2.8m reserved" — the system assumes actual consumption always equals the reservation exactly. Combined with 1.5's dormancy, this means the codebase has no path today for a real fabric-usage number to ever reach `material_stock_movements` from production. Real depletion only happens via manual `stock_out`/`adjustment` (Inventory Hub, human-entered), which is disconnected from any specific order. |

### 1.9 Waste

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | **Does not exist.** |
| **Writer** | N/A |
| **Reader** | N/A |
| **Dependency** | N/A |
| **Business Event** | None |
| **Runtime** | None |
| **Owner** | Unowned |
| **Status** | **Belum ada.** `movement_type` is a fixed check constraint of exactly five values: `stock_in`, `stock_out`, `reservation`, `release`, `adjustment` (migration `20260720000000_add_inventory.sql`). None of these represent scrap/waste/off-cut. Today, waste can only be recorded by folding it into a generic `adjustment` — indistinguishable in the ledger from a stock-count correction, an audit error fix, or any other reason. There is no waste %, no waste-per-order, no waste-per-material-category signal anywhere. |

### 1.10 Cost

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | `materials.price` (live unit price, ADR-014) + `material_cost_templates` (`materialRows × live price + additionalCosts`, computed at render time) |
| **Writer** | `materials.price` via Material Master/Inventory update; template totals computed client-side, never persisted as a locked total |
| **Reader** | Estimasi Biaya drawer, Estimate Print View |
| **Dependency** | Material Master, Estimate |
| **Business Event** | None |
| **Runtime** | None (client-side arithmetic over live-fetched rows) |
| **Owner** | Inventory Hub |
| **Status** | **Sebagian ada.** A *prospective* cost estimate (what should this cost to make) is well supported. An *actual* cost incurred (what did this order really consume, priced) does not exist — there is no join from `material_stock_movements.release` quantities × price back to a specific order's realized cost. `OWNER_INTELLIGENCE_DISCOVERY.md` §8 names this exact gap: "Fabric usage per order — required for profit margin, material cost allocation." |

### 1.11 Margin

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | **Does not exist.** |
| **Writer** | N/A |
| **Reader** | N/A |
| **Dependency** | Cost (actual) + Commercial Domain revenue (`quotations.total`, already computed in `getCommercialSummary()`) |
| **Business Event** | None |
| **Runtime** | None |
| **Owner** | Unowned |
| **Status** | **Belum ada.** Grepping the entire codebase for "margin" as a business concept returns zero hits outside of CSS/unrelated matches. `OWNER_INTELLIGENCE_DISCOVERY.md` §9.3 already names "Margin Per Order" as a Sprint N.3 candidate, explicitly blocked on "NEW: Fabric usage calculator (fulfill ADR-020 — quantityMeters)" — i.e., blocked on Reservation (1.5) becoming non-dormant, which is blocked on Purchase/Actual Consumption/Waste never having been modeled either. Margin sits at the end of a chain where three upstream links (1.3, 1.8, 1.9) are missing and one (1.5) is dead code in practice. |

### 1.12 Analytics

| Aspek | Detail |
|-------|--------|
| **Source of Truth** | Derived, client-side, from `material_stock_movements` + `materials` |
| **Writer** | N/A (read-only aggregation) |
| **Reader** | `getMaterialAttentionList()` and `fetchMostUsedMaterials()` (`src/lib/inventory/materials.ts`), rendered in `MaterialIntelligencePanel.tsx` (Inventory Dashboard) and duplicated into Command Center's `InventoryAlertCard` |
| **Dependency** | Stock (attention list: `available_stock` vs `min_stock`), Production (usage ranking: sums `release` + `stock_out` movements) |
| **Business Event** | None |
| **Runtime** | Pure functions over already-fetched data — no new RPC |
| **Owner** | Inventory Hub (panel), Owner OS (Decision Card duplicate) |
| **Status** | **Sudah ada, tapi sempit.** Sprint I.1's Material Intelligence (low-stock/critical list, most-used ranking, reorder suggestion) is real and shipped. But it is **stock-level analytics only** — no cost analytics, no margin analytics, no waste analytics, no supplier analytics exist, because none of their source data exists (1.3, 1.9, 1.11). |

---

## 2. Lifecycle (Evidence-Grounded, Annotated)

```
Supplier                    [text field only — no entity, no history]
  ↓ (no FK, no writer)
Material Master              ✅ mature
  ↓
Purchase                    ❌ MISSING — chain breaks here
  ↓ (only proxy: manual stock_in, no PO/supplier/price-history link)
Stock                        ✅ mature (physical/reserved/available + ledger)
  ↓
Reservation                 ⚠️ built but DORMANT (quantityMeters always null — ADR-020)
  ↓
Estimate                    ⚠️ exists but order-DECOUPLED (global reusable templates)
  ↓
Production (material_prep release)  ⚠️ wired, but starves because Reservation never fires
  ↓
Actual Consumption           ❌ MISSING — release always assumed == reservation, never measured
  ↓
Waste                        ❌ MISSING — no movement_type, no field, no event
  ↓
Cost                         ⚠️ prospective (Estimate) only — no realized-cost-per-order
  ↓
Margin                       ❌ MISSING — explicitly named future work, blocked upstream
  ↓
Analytics                    ✅ mature, but STOCK-LEVEL ONLY (no cost/margin/waste/supplier signal)
```

**Reading this chain:** the lifecycle is not a smooth gradient from "done" to "not done" — it alternates. Material Master and Stock are genuinely mature (real RPCs, real RLS, real ledger). But Purchase is a complete void sitting directly upstream of Stock, and Reservation → Actual Consumption → Waste → Cost(actual) → Margin form a second void that happens to have partial scaffolding (Reservation's RPC, Estimate's templates) built around empty middle. Analytics, at the very end, can only ever be as good as its two real inputs (Stock, and manual movements) — it already reflects this honestly by staying in stock-only territory.

---

## 3. Data Ownership

| Stage | Table(s) | Owning Schema Object |
|-------|----------|---------------------|
| Supplier | `materials.supplier` (column) | `materials` |
| Material Master | `materials`, `material_categories` | `materials`, `material_categories` |
| Purchase | — | none |
| Stock | `materials.physical_stock/reserved_stock/available_stock`, `material_stock_movements` | `materials`, `material_stock_movements` |
| Reservation | `material_stock_movements` (type=`reservation`) | `material_stock_movements` |
| Estimate | `material_cost_templates` | `material_cost_templates` |
| Production (material side-effect) | `material_stock_movements` (type=`release`) | `material_stock_movements` |
| Actual Consumption | — (conflated into `release`) | none |
| Waste | — | none |
| Cost | `materials.price` (live), `material_cost_templates` (prospective) | `materials` |
| Margin | — | none |
| Analytics | — (derived) | none |

---

## 4. Runtime Ownership

| Stage | RPC / Function | Access | App Surface |
|-------|----------------|--------|-------------|
| Supplier | none (direct column update) | admin/owner | Inventory Hub / Material Master |
| Material Master | none (direct table CRUD) | admin/owner write, admin/owner/artisan read | Inventory Hub, Fitter App (read) |
| Purchase | none | — | — |
| Stock | `inventory_adjust_stock` | admin/owner | Inventory Hub |
| Reservation | `reserve_material_for_order` | admin/owner/artisan (called server-side from Create Order) | Fitter App (Create Order) → Inventory RPC |
| Estimate | none (direct table CRUD) | admin/owner | Inventory Hub |
| Production | `release_material_reservation` | anon (kiosk, ADR-011) | Production Kiosk → Inventory RPC |
| Actual Consumption | none | — | — |
| Waste | none | — | — |
| Cost | none (client-side arithmetic) | admin/owner | Inventory Hub |
| Margin | none | — | — |
| Analytics | none (pure client functions) | admin/owner | Inventory Hub, Owner OS (Command Center) |

---

## 5. Business Event Inventory

Only **one** Business Event exists across the entire Material Engineering domain:

| Event Type | Emitted By | Payload | Consumed By |
|-----------|-----------|---------|-------------|
| `inventory.low_stock` | `inventory_adjust_stock`, `release_material_reservation` | `material_id, name, available_stock, min_stock` | Nothing currently subscribes to it directly by event type — it exists in `business_events` for audit trail per the general Event Pattern (ARCHITECTURE_LOCK_V1 §10.3), and the same signal is independently re-derived live by `getMaterialAttentionList()` for the Dashboard/Command Center, rather than read back from the event log. |

**Missing events** (would be needed if the corresponding stage were built): `material.purchased`, `material.reserved` (currently silent — no event, only a ledger row), `material.consumed_actual`, `material.wasted`, `order.material_cost_recorded`, `order.margin_computed`. None of these exist today.

---

## 6. Gap Analysis

| Stage | Status | Evidence |
|-------|--------|----------|
| Supplier | Sebagian ada | `materials.supplier` text column only, migration `20260807000000` |
| Material Master | **Sudah ada** | `materials`/`material_categories`, full RLS + RPC-free CRUD |
| Purchase | **Belum ada** | No PO/supplier-invoice table or RPC anywhere in `supabase/migrations/` |
| Stock | **Sudah ada** | `inventory_adjust_stock`, generated `available_stock`, ledger |
| Reservation | Sebagian ada (dormant) | `reserve_material_for_order` exists; `createOrder.ts:205` hardcodes `quantityMeters: null`; ADR-020 |
| Estimate | Sebagian ada (order-decoupled) | `material_cost_templates` is global/reusable, not order-scoped |
| Production (material_prep release) | Sebagian ada (starved) | `release_material_reservation` correctly wired but has nothing to release |
| Actual Consumption | **Belum ada** | Release quantity == reservation quantity by construction, never independently entered |
| Waste | **Belum ada** | `movement_type` check constraint has exactly 5 values, none is waste |
| Cost | Sebagian ada (prospective only) | Estimate templates give a costing worksheet; no realized-cost-per-order join exists |
| Margin | **Belum ada** | Zero business-logic hits for "margin"; named as blocked future work in `OWNER_INTELLIGENCE_DISCOVERY.md` §9.3 |
| Analytics | Sebagian ada (stock-only) | `MaterialIntelligencePanel.tsx` covers low-stock + usage ranking only |

**Summary:** 2 of 12 stages fully mature (Material Master, Stock). 6 partial (Supplier, Reservation, Estimate, Production, Cost, Analytics) — each partial stage is missing exactly the piece that would let the *next* stage in the chain become real. 4 do not exist at all (Purchase, Actual Consumption, Waste, Margin), and three of those four (Purchase, Actual Consumption, Waste) are precisely the inputs Margin needs.

---

## 7. Recommendation

This blueprint does not propose implementation — per the sprint's Rules, no coding/migration/engine. The recommendation is sequencing logic only, so a future implementation sprint knows which gap to close first.

1. **Do not build Margin, Cost(actual), or Analytics-cost/waste next.** They all sit downstream of Purchase, Actual Consumption, and Waste — building them now would mean displaying numbers with no real data feeding them (the same trap `quantityMeters: null` already demonstrates: a wired but empty pipe).

2. **The single highest-leverage fix is closing Reservation's dormancy** (ADR-020's own framing) — a fabric-usage calculator that lets `createOrder.ts` populate a real `quantityMeters`. This one change unblocks Reservation, Production's release, and — since release already deducts `physical_stock` correctly — gives Stock and Analytics their first real per-order signal, at zero schema change (Reservation's RPC and ledger already exist).

3. **Actual Consumption and Waste should be modeled together**, not separately, since a waste figure is naturally "actual consumed − planned/reserved." This likely means extending `movement_type`'s check constraint (a migration, out of scope for this blueprint) rather than inventing a parallel table.

4. **Purchase is architecturally independent of the rest of the chain** — Material Master, Stock, and Cost don't strictly require it to function (they already don't). It can be sequenced later, and should be scoped as its own vertical (Supplier entity + PO + purchase-price history) rather than bolted onto `inventory_adjust_stock`'s existing `stock_in` movement type, which today conflates "physical count went up" with "we bought something" — two different business events wearing one label.

5. **Cost(actual) and Margin are the same sprint** — once Actual Consumption exists, Cost(actual) is `Σ(actual_qty × material.price)` per order, and Margin is `quotations.total − Cost(actual) − labor cost` (labor cost being its own separate, currently-nonexistent gap per `OWNER_INTELLIGENCE_DISCOVERY.md` §8's "Operator cost / labor cost" row — out of scope for Material Engineering specifically, but a hard dependency for Margin to be complete).

---

## 8. Sprint Breakdown (Sequencing Only — No Implementation Detail)

Aligned with the existing Sprint N.1/N.2/N.3 direction already recorded in `ARCHITECTURE_LOCK_V1.md` §13.1 and `OWNER_INTELLIGENCE_DISCOVERY.md` §9.

| Sprint | Focus | Closes Gap | Precondition |
|--------|-------|-----------|--------------|
| N.2 (existing plan) | Fabric-usage calculator → real `quantityMeters` at Create Order | Reservation (dormancy) | None — pure EXTEND of `createOrder.ts` + Design Studio fabric selection, reuses existing `reserve_material_for_order` RPC |
| N.2 (existing plan) | Estimasi Biaya + actual material cost tracking | Estimate → order-scoping, Cost (prospective→bridge to actual) | Depends on Reservation being live |
| (new, not yet in roadmap) | Actual Consumption + Waste movement types | Actual Consumption, Waste | Depends on Reservation being live; requires a migration (schema change to `movement_type` constraint) — out of scope to design here |
| N.3 (existing plan, "Margin Per Order Foundation") | Cost(actual) + Margin computation | Cost (actual), Margin | Depends on Actual Consumption existing; labor-cost gap must be scoped separately or Margin ships as "material margin" only |
| (unscheduled) | Supplier entity + Purchase Order + purchase-price history | Supplier, Purchase | Independent of the rest — can run in parallel with any of the above |
| (unscheduled) | Waste/margin/cost/supplier analytics | Analytics (expansion) | Depends on all of the above; purely additive once source data exists |

---

**This document is a Blueprint, not a Contract.** Unlike `ARCHITECTURE_LOCK_V1.md`, nothing here is LOCKED — it is evidence-based mapping of what exists versus what the brief's 12-stage lifecycle expects, to inform sprint planning. No table, RPC, or UI described as missing has been created by this document.
