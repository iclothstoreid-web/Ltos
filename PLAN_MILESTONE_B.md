# MILESTONE B — Multi Garment Transaction Engine
## Revised Plan (incorporating feedback)

---

## Dependency Audit Results

### Transaction Status References
Only 3 locations reference `'open'`/`'closed'` transaction status:
1. `src/lib/order/createOrder.ts:131` — sets `status: 'open'`
2. `supabase/migrations/20260820000000_add_transactions_commercial_type_engine.sql:26` — check constraint
3. `supabase/migrations/20260820000000_add_transactions_commercial_type_engine.sql:60` — backfill

No dashboard, workflow, notification, or automation modules consume transaction status. Safe to expand.

### Fitter Navigation Audit
Existing routes under `/workspace/`:
- `check-in` — entry point
- `consultation-review/[consultationId]` — review page (decision to create order)
- `design-studio/[consultationId]` — design selection
- `measurement/[orderId]` — measurements
- `order-created/[orderId]` — order confirmation (target for rewrite)
- `order-summary/[orderId]` — summary
- `production/[orderId]` — production workspace
- `qc/[orderId]` — quality check

No transaction-level page exists. We will **extend** `order-created` to become Transaction Confirmation, and add Garment List functionality **inside** the existing consultation-review flow.

---

## Revised Plan

### Phase 1: Database Migration
**File:** `supabase/migrations/20260821000000_milestone_b_multi_garment.sql`

1. **Expand transaction status** from `('open', 'closed')` to `('open', 'partially_completed', 'completed', 'cancelled')` — ADD new values, do NOT remove existing ones (backward compatible)
2. **Add `garment_index`** to `orders` (integer, default 1) — sequential index within a transaction
3. **Add `duplicated_from_order_id`** to `orders` (nullable uuid references orders.id) — for duplicate tracking
4. **NOT adding `family_order` boolean** — derived from multiple unique `customer_id`s in same transaction
5. **New RPCs:**
   - `add_garment_to_transaction` — creates new order under existing OPEN transaction
   - `duplicate_garment` — copies design/measurement/snapshot, fresh production identity
   - `remove_garment_from_transaction` — removes order if before production started
   - `get_transaction_detail` — returns transaction + all orders + their snapshots
   - `get_open_transactions_for_customer` — for Scenario 4 prompt
   - `update_transaction_status` — updates status with validation

### Phase 2: Transaction Service Layer
**New files:**
- `src/lib/transaction/types.ts` — Transaction types
- `src/lib/transaction/client.ts` — Transaction service functions

### Phase 3: Update createOrderFromConsultation()
**File:** `src/lib/order/createOrder.ts`

- Add `existingTransactionId` parameter
- If provided and transaction is OPEN, create order under that transaction
- If not provided, create new transaction (current default behavior)
- Auto-calculate `garment_index` per transaction

### Phase 4: Transaction Confirmation (Rewrite order-created page)
**Modified file:** `src/app/workspace/order-created/[orderId]/page.tsx`
**New files:**
- `src/components/workspace/order-created/TransactionConfirmation.tsx`
- `src/components/workspace/order-created/GarmentOrderList.tsx`
- `src/components/workspace/order-created/TransactionSummaryCard.tsx`

The order-created page now shows ALL garments in the transaction, not just the current order. Includes Add/Duplicate garment actions from this page.

### Phase 5: Garment List in Consultation Review (No new top-level route)
**Modified file:** `src/components/workspace/consultation-review/ConsultationReviewWorkspace.tsx`
**New files:**
- `src/components/workspace/consultation-review/ExistingGarmentList.tsx` — Shows existing garments in same transaction (when adding to existing)
- `src/components/workspace/consultation-review/OpenTransactionPrompt.tsx` — Scenario 4 prompt

Rather than creating `/fitter/transaction/[transactionId]`, we integrate the garment list into:
1. `order-created` page (post-create view, shows all garments in transaction)
2. `consultation-review` page (pre-create view, shows existing garments if adding to transaction)

### Phase 6: Scenario 4 — Open Transaction Prompt
**New file:** `src/components/workspace/consultation-review/OpenTransactionPrompt.tsx`

When a returning customer has an OPEN transaction, prompt:
- "Tambahkan ke transaksi yang masih berjalan?" → opens Consultation Review with existing transaction
- OR "Buat transaksi baru?" → creates new transaction as normal

### Phase 7: Owner Dashboard — Multi-Garment KPIs
**Modified files:**
- `src/app/command-center/page.tsx`
- `src/components/command-center/OwnerCommandCenter/OwnerCommandCenter.tsx`
- `src/lib/commercial/transactionSummary.ts`

**New component:**
- `src/components/command-center/OwnerCommandCenter/TransactionKPISection.tsx`

**New KPIs (all drill-down):**
- Average Garments per Transaction
- Largest Transaction (by garment count)
- Open Transactions
- Completed Transactions
- Family Orders (derived: transactions with >1 unique customer_id)
- KOL Transactions
- Sponsor Transactions
- Warranty Transactions
- Internal Sample Transactions

---

## Dependent Files to Be Edited

| File | Change |
|------|--------|
| `src/lib/order/createOrder.ts` | Add `existingTransactionId` param, support multi-order |
| `src/app/workspace/order-created/[orderId]/page.tsx` | Rewrite to show transaction-level view |
| `src/components/workspace/consultation-review/ConsultationReviewWorkspace.tsx` | Add existing garment list + Scenario 4 prompt |
| `src/app/command-center/page.tsx` | Add multi-garment KPIs |
| `src/components/command-center/OwnerCommandCenter/OwnerCommandCenter.tsx` | Add new KPI section + props |
| `src/lib/commercial/transactionSummary.ts` | Update for new statuses + multi-garment metrics |

## New Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/20260821000000_milestone_b_multi_garment.sql` | DB migration |
| `src/lib/transaction/types.ts` | Transaction types |
| `src/lib/transaction/client.ts` | Transaction service functions |
| `src/components/workspace/order-created/TransactionConfirmation.tsx` | Transaction-level confirmation |
| `src/components/workspace/order-created/GarmentOrderList.tsx` | All garments in transaction |
| `src/components/workspace/order-created/TransactionSummaryCard.tsx` | Total value, payment, commercial type |
| `src/components/workspace/consultation-review/ExistingGarmentList.tsx` | Existing garments when adding to transaction |
| `src/components/workspace/consultation-review/OpenTransactionPrompt.tsx` | Scenario 4 prompt |
| `src/components/command-center/OwnerCommandCenter/TransactionKPISection.tsx` | Multi-garment KPIs |

## Key Constraints
1. **No new top-level route** — reuse existing `order-created` and `consultation-review`
2. **No `family_order` flag** — derive from multiple customer_ids per transaction
3. **Backward compatible** — existing status values preserved, existing orders unchanged
4. **Commercial stays transaction-grain** — already correct
5. **Production stays order-grain** — no changes needed
6. **Duplicate garment** — copies design/measurement/snapshot, fresh production identity (new QR, order_number, stage_records)

