# MILESTONE B — Multi-Garment Transaction Engine

Status: **Phase 1 in progress**. Not committed, not applied to production until
explicitly approved per-phase (see [[project_ltos_multi_garment_commercial_milestone_a]]
for why Milestone A stayed strictly transaction-grain / 1 order per
transaction, and why this phase exists to lift that limit).

## Phase 1 — Database Layer (this phase)

- [x] `transactions.status` expanded: `open | partially_completed | completed | cancelled` (legacy `closed` rows migrated to `completed`)
- [x] `orders.garment_index` (per-transaction sequence, backfilled to 1 for all pre-existing orders)
- [x] `orders.duplicated_from_order_id` (origin tracking for duplicated garments)
- [x] RPC `add_garment_to_transaction` — new order under an OPEN transaction
- [x] RPC `duplicate_garment` — copies snapshot, fresh production identity
- [x] RPC `remove_garment_from_transaction` — soft-delete only if no production started
- [x] RPC `get_transaction_detail` — full transaction + garments read
- [x] RPC `get_open_transactions_for_customer` — Scenario 4 prompt data
- [x] RPC `update_transaction_status` — OPEN → PARTIALLY_COMPLETED/COMPLETED/CANCELLED, admin/owner-gated
- [x] **Validation fix**: `remove_garment_from_transaction` nulled `orders.transaction_id`, which Milestone A locked `NOT NULL` — would have failed on every call. Added `orders.removed_from_transaction_at` (soft-delete timestamp) instead; `get_transaction_detail`/`get_open_transactions_for_customer` exclude removed garments from active counts.
- [x] **Validation fix**: `compute_queue_snapshot()` (pre-existing Fitter Queue RPC) checked `quotations.order_id = o.id` directly to decide the 'approval' bottleneck — correct only under 1-garment-per-transaction. Now multi-garment transactions are possible, garments #2+ would misclassify forever. Fixed to resolve via `transaction_id` instead, matching every other transaction-grain lookup.
- [ ] Apply migration to live Supabase project
- [ ] Build / TypeScript / ESLint verification
- [ ] Report to user, STOP for approval

### Known findings carried forward (not fixed in Phase 1 — need a Phase 2+ decision, not a mechanical fix)
- `add_garment_to_transaction`'s `business_events` insert logs a minimal event (`order_number`/`transaction_id`/`garment_index`/`added_to_existing_transaction`), not a full `OrderSnapshot` (no `measurement`/`design`/`qrPayload`/etc). Whichever Phase 2 frontend calls this RPC must also write the full snapshot event itself, the same way `createOrderFromConsultation()` does — otherwise `get_production_packet`/`OrderDetailModal`/etc. will see an incomplete order for garments #2+.
- `duplicate_garment`'s copied snapshot only patches the `order_number` key via `jsonb_set` — the copied `qrPayload` still encodes the **source** order's id. Low severity (only read by `OrderSuccessHero.tsx`'s one-time display; the real production-floor QR is always rebuilt fresh from `order.id` at render time, never read from the snapshot) but should be patched by whichever Phase 2 client code calls `duplicateGarment()`, since fixing it correctly needs `APP_URLS` (TS-side config), not something to duplicate into SQL.
- `get_fitter_kpi_list()`'s revenue/conversion metrics join `quotations.order_id = ord.id` — once multiple garments (possibly from different fitters' consultations) share one transaction/quotation, there's no unambiguous way to attribute that shared revenue to one fitter. This needs an explicit business-rule decision (split evenly? attribute to the transaction's originating fitter only? something else?), not a mechanical SQL fix. Left as-is (garments #2+ silently undercounted) until that decision is made.
- **Duplicated business logic found**: `createOrderFromConsultation()` (`src/lib/order/createOrder.ts`) already has its own inline TypeScript implementation of "add a garment to an existing OPEN transaction" (`existingTransactionId` param — validates status, computes next `garment_index`, inserts the order) that duplicates what the SQL RPC `add_garment_to_transaction` does server-side. Two sources of truth for the same operation. Needs a decision before Phase 2 UI wiring: keep the RPC and delete the TS duplicate, or vice versa — not decided in Phase 1.

## Phase 2+ (not started, sequence TBD pending Phase 1 approval)

- [ ] `src/lib/transaction/types.ts` / `client.ts` — service layer (already drafted, dormant, untracked)
- [ ] Transaction Confirmation UI (`TransactionConfirmation.tsx`, `GarmentOrderList.tsx`, `TransactionSummaryCard.tsx` — already drafted, dormant, untracked)
- [ ] Wire `order-created/[orderId]/page.tsx` to the transaction view — **must ship in the same commit as the dormant components it imports**. A prior attempt to wire this (commit `a89a99c`) broke every production deploy with "Module not found" because Vercel only clones committed files; it was reverted in `4ca6ae7`. Never repeat that sequencing.
- [ ] Garment list + Open Transaction prompt in Consultation Review (`ExistingGarmentList.tsx`, `OpenTransactionPrompt.tsx` — already drafted, dormant, untracked)
- [ ] Owner Dashboard multi-garment KPIs (`TransactionKPISection.tsx`, `multiGarmentKPIs.ts` — already drafted, dormant, untracked)
- [ ] Resolve the 4 "known findings" above before or during whichever phase touches that code path
- [ ] Full build/TypeScript/ESLint/backward-compatibility verification
