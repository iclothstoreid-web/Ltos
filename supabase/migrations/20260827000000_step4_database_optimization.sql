-- ============================================================
-- STEP 4: Database Optimization (Indexing, Composite Index, RPC
-- Performance, Query Plan). Data Fetching & Database Performance track.
--
-- Scope discipline: indexes + one narrow RPC fix only. No schema change,
-- no business logic change, no column/table rename, no UI change.
-- Every index below is backed by either:
--   (a) a live EXPLAIN (ANALYZE, BUFFERS) run on this project showing a
--       Seq Scan / extra Sort / OR-join Nested Loop for that exact shape, or
--   (b) a confirmed real call site (app code or RPC body) using that exact
--       WHERE/JOIN/ORDER BY combination -- not a blind FK-linter pass.
-- Audit-trail FK columns (created_by/updated_by/override_by/recorded_by)
-- flagged by the Supabase performance advisor are deliberately NOT indexed
-- here: no query in the codebase filters or joins on them, so the index
-- would only cost write overhead with no read benefit.
-- ============================================================

-- ------------------------------------------------------------
-- 1. business_events (order_id, event_type, created_at)
-- ------------------------------------------------------------
-- Confirmed via EXPLAIN: `where order_id = X and event_type = 'order.created'
-- order by created_at desc limit 1` currently does Bitmap Heap Scan on the
-- order_id-only index, re-filters event_type on the heap, then a separate
-- Sort node. Same shape is hit by: get_production_packet (order snapshot
-- lookup), get_production_customer_notes, order-summary/order-created pages,
-- lookup.ts, check-in actions.ts (IN(order_ids) variant), and
-- compute_queue_snapshot's latest_event CTE (event_type-first, distinct on
-- order_id, order by created_at desc). Leading with event_type also serves
-- that whole-table scan pattern, so one composite covers both shapes.
create index if not exists idx_business_events_event_order_created
  on public.business_events (event_type, order_id, created_at desc);

-- ------------------------------------------------------------
-- 2. quotations (status, created_at)
-- ------------------------------------------------------------
-- Confirmed via EXPLAIN: `where status <> 'not_billable' order by created_at
-- desc` (getCommercialSummary, Owner OS Commercial pillar) is a full Seq Scan
-- + Sort today -- quotations has no index at all beyond pkey and
-- unique(transaction_id).
create index if not exists idx_quotations_status_created_at
  on public.quotations (status, created_at desc);

-- ------------------------------------------------------------
-- 3. production_stage_records (stage, status, completed_at)
-- ------------------------------------------------------------
-- Confirmed via EXPLAIN: `where stage = 'shipping' and status = 'completed'
-- and completed_at >= ...` is a Seq Scan today. This exact shape (with
-- varying completed_at bounds) is repeated across get_production_kpis
-- (today/7d/30d throughput, 3x), get_kpi_dashboard's own throughput queries,
-- transactionSummary.ts, and the owner/communications in_progress filter.
create index if not exists idx_stage_records_stage_status_completed
  on public.production_stage_records (stage, status, completed_at);

-- ------------------------------------------------------------
-- 4. production_stage_records (order_id, stage, attempt)
-- ------------------------------------------------------------
-- The existing (order_id, stage) index doesn't cover the "latest attempt"
-- access pattern: `distinct on (order_id, stage) ... order by order_id,
-- stage, attempt desc`, used by compute_queue_snapshot's latest_attempt CTE
-- on every queue/dashboard/order-packet call, and by get_production_packet's
-- own progress subquery. Adding attempt as a third key lets both skip an
-- in-memory per-group sort.
create index if not exists idx_stage_records_order_stage_attempt
  on public.production_stage_records (order_id, stage, attempt desc);

-- ------------------------------------------------------------
-- 5. production_stage_records (assigned_operator_id, status) /
--    (operator_id, status)
-- ------------------------------------------------------------
-- Confirmed via EXPLAIN: get_operator_capacity's
-- `left join production_stage_records r on r.assigned_operator_id = po.id
-- or r.operator_id = po.id` is a Nested Loop with an OR join filter that
-- scans production_stage_records in full for every operator (both join
-- columns were previously unindexed -- flagged by the Supabase performance
-- advisor as unindexed FKs). get_operator_performance joins operator_id the
-- same way. get_operator_capacity itself is called by get_capacity_dashboard
-- and twice by get_bottleneck_dashboard (see function fix below), so this is
-- on the hot path for every Owner OS Capacity/Bottleneck/KPI load.
create index if not exists idx_stage_records_assigned_operator_status
  on public.production_stage_records (assigned_operator_id, status);

create index if not exists idx_stage_records_operator_status
  on public.production_stage_records (operator_id, status);

-- ------------------------------------------------------------
-- 6. consultations (customer_id, created_at)
-- ------------------------------------------------------------
-- Confirmed via EXPLAIN: `where customer_id = X order by created_at desc`
-- (check-in kiosk actions.ts: customer search, recent-consultations list,
-- open-consultation count -- 3 call sites, hit on every check-in) uses the
-- existing customer_id-only index but still needs a separate Sort node.
create index if not exists idx_consultations_customer_created
  on public.consultations (customer_id, created_at desc);

-- ------------------------------------------------------------
-- 7. orders (transaction_id)
-- ------------------------------------------------------------
-- Unindexed FK (orders_transaction_id_fkey), and genuinely joined on:
-- compute_queue_snapshot's quoted_orders CTE
-- (`join quotations q on q.transaction_id = o2.transaction_id`, scanning
-- all orders every call) plus the multi-garment transaction RPCs
-- (get_transaction_detail, add_garment_to_transaction, duplicate_garment).
create index if not exists idx_orders_transaction_id
  on public.orders (transaction_id);

-- ------------------------------------------------------------
-- 8. design_master_options (category, sort_order)
-- ------------------------------------------------------------
-- Two real call sites in masterData.ts share this shape: the Design Studio
-- active-catalog read (`where is_active = true order by category,
-- sort_order`, every Design Studio page load) and the next-sort_order probe
-- (`where category = X order by sort_order desc limit 1`, every catalog
-- insert/reorder).
create index if not exists idx_design_master_options_category_sort
  on public.design_master_options (category, sort_order);

-- ------------------------------------------------------------
-- 9. measurements (consultation_id, created_at)
-- ------------------------------------------------------------
-- Same shape as consultations above: `where consultation_id = X order by
-- created_at desc limit 1`, hit on the Measurement and Consultation Review
-- workspace pages. Existing index is consultation_id-only.
create index if not exists idx_measurements_consultation_created
  on public.measurements (consultation_id, created_at desc);

-- ============================================================
-- Redundant index removal
-- ============================================================
-- queue_assignments is dead: 0 rows, and per command-center/page.tsx's own
-- comment, the page that used to read it was replaced by
-- compute_queue_snapshot()-based /command-center. No remaining call site
-- (grepped app code + all migrations) queries this table by queue_type or
-- status. Confirmed unused by the Supabase performance advisor too.
drop index if exists public.idx_queue_assignments_queue_type;
drop index if exists public.idx_queue_assignments_status;

-- orders(customer_id, created_at): no call site filters orders by
-- customer_id -- Milestone A/B moved the customer-grain query to
-- transactions.primary_customer_id (get_open_transactions_for_customer).
-- Confirmed unused by the Supabase performance advisor.
drop index if exists public.idx_orders_customer_created;

-- ============================================================
-- RPC fix: get_bottleneck_dashboard called get_operator_capacity() twice
-- (once for busiest, once for most-idle operator) in the same function
-- body -- a self-inflicted N+1 re-running the operator/stage-records join
-- above twice per call. Materializing it once into a CTE and picking both
-- extremes from the same result set is a pure query-shape change: same
-- deterministic max/min picks, same NULL filtering, byte-identical output.
-- ============================================================
create or replace function public.get_bottleneck_dashboard()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_kpis jsonb;
  v_slowest_stage text;
  v_slowest_stage_hours numeric;
  v_most_backlogged_stage text;
  v_most_backlogged_stage_count numeric;
  v_busiest_operator text;
  v_busiest_operator_pct numeric;
  v_most_idle_operator text;
  v_most_idle_operator_pct numeric;
begin
  v_kpis := public.get_production_kpis();

  select stage, value::numeric into v_slowest_stage, v_slowest_stage_hours
  from jsonb_each_text(coalesce(v_kpis -> 'avg_stage_duration_hours', '{}'::jsonb)) as t(stage, value)
  order by value::numeric desc
  limit 1;

  select stage, value::numeric into v_most_backlogged_stage, v_most_backlogged_stage_count
  from jsonb_each_text(coalesce(v_kpis -> 'stage_backlog', '{}'::jsonb)) as t(stage, value)
  order by value::numeric desc
  limit 1;

  with oc as (
    select * from public.get_operator_capacity() where utilization_pct is not null
  )
  select
    (select nama from oc order by utilization_pct desc limit 1),
    (select utilization_pct from oc order by utilization_pct desc limit 1),
    (select nama from oc order by utilization_pct asc limit 1),
    (select utilization_pct from oc order by utilization_pct asc limit 1)
  into v_busiest_operator, v_busiest_operator_pct, v_most_idle_operator, v_most_idle_operator_pct;

  return jsonb_build_object(
    'slowest_stage', v_slowest_stage,
    'slowest_stage_avg_hours', v_slowest_stage_hours,
    'most_backlogged_stage', v_most_backlogged_stage,
    'most_backlogged_stage_count', v_most_backlogged_stage_count,
    'busiest_operator', v_busiest_operator,
    'busiest_operator_utilization_pct', v_busiest_operator_pct,
    'most_idle_operator', v_most_idle_operator,
    'most_idle_operator_utilization_pct', v_most_idle_operator_pct
  );
end;
$$;

-- ============================================================
-- Refresh planner statistics for every touched table.
-- ============================================================
analyze public.business_events;
analyze public.quotations;
analyze public.production_stage_records;
analyze public.consultations;
analyze public.orders;
analyze public.design_master_options;
analyze public.measurements;
