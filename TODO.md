# Sprint N.1 — Owner Decision Layer V1 Implementation

## TODO Checklist

### Step 1: Create Decision Card Types
- [x] Add `DecisionCard` related types to `src/lib/decision/types.ts`

### Step 2: Create Decision Card Components
- [x] Create `src/components/command-center/OwnerCommandCenter/DecisionCards/`
- [x] Create `OperationalAlertCard.tsx` — SLA, bottleneck, operator overload
- [x] Create `CommercialAlertCard.tsx` — Outstanding payment, high discount/override
- [x] Create `InventoryAlertCard.tsx` — Low stock, reorder recommendation
- [x] Create `BusinessInsightCard.tsx` — Completion rate, QC return, trends
- [x] Create `index.tsx` — Container composing 4 cards

### Step 3: Integrate into OwnerCommandCenter
- [x] Edit `OwnerCommandCenter.tsx` — Add DecisionCardsSection + props
- [x] Edit `src/app/command-center/page.tsx` — Compute card data from existing RPCs

### Step 4: Build Verification
- [x] Run `npm run build`
- [x] Run Typecheck
- [x] Run Lint

