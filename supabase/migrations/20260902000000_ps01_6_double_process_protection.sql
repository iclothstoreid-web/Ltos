-- Sprint PS-01.6: Locking & Double-Process Protection
--
-- Audited every operational flow listed in the brief (Start Production,
-- Finish Stage, QC Start/Finish, Assign Operator, Assign Queue, Delivery,
-- Hold/Unhold, Payment, Commercial actions, Measurement/Design completion,
-- Order creation, QR-triggered actions, main Workspace action buttons)
-- specifically for double-click / duplicate RPC invocation / browser retry
-- / multi-tab submit / repeated QR scan — the scenarios PS-01.1-PS-01.5
-- targeted concurrent-*different*-actor races, not "the same logical
-- submission arriving twice." Most flows turn out to already be safe
-- against this by the atomic/optimistic-lock/transactional guards those
-- sprints put in place (a duplicate call just hits the same WHERE guard
-- and gets a clean rejection, since "arrives twice" and "arrives from two
-- different racing actors" are the same shape at the database level).
-- Two genuine gaps remained, both fixed here; see the report for the full
-- flow-by-flow audit table.

-- ============================================================
-- 1. finalize_order_creation() -- Order Creation
--
-- Found during this audit (not previously caught): the "already has an
-- Order" guard was `if exists(...) then raise` followed by the actual
-- `update consultations set status='order_created'` much later in the
-- function -- check-then-act. Combined with a real client-side gap
-- (ConsultationReviewWorkspace.handleCreateOrder re-enabled its "Buat
-- Pesanan" button via `finally { setLoading(false) }` immediately after
-- the fire-and-forget `router.push`, before navigation actually left the
-- page), two submissions for the same consultation -- a fast double-click,
-- or a browser retrying a slow request -- could both pass the exists-check
-- before either committed, each creating a real order + transaction +
-- business_events. Two live orders for one consultation.
--
-- Also fixes a latent bug from PS-01.5 itself: adding the `p_order_id`
-- parameter via CREATE OR REPLACE created a second overload instead of
-- replacing the function (same trap as add_garment_to_transaction, caught
-- there but missed here) -- never triggered in practice because every
-- caller already passed all 11 named params, but left two definitions of
-- this function sitting in the database. Cleaned up here.
--
-- Fix: the guard is now the atomic claim itself. The UPDATE that marks the
-- consultation order_created runs FIRST, conditioned on
-- `status <> 'order_created'`, before any transaction/order/event is
-- created. Only one concurrent call can ever win it; the loser gets the
-- exact same exception as before, immediately, with zero side effects (no
-- orphaned transaction row). Verified live: two calls for the same
-- consultation -> exactly 1 order created, 0 orphaned rows from the
-- rejected second call.
-- ============================================================

drop function if exists public.finalize_order_creation(
  uuid, uuid, text, uuid, text, text, text, text, jsonb, uuid
);

create or replace function public.finalize_order_creation(
  p_consultation_id uuid,
  p_existing_transaction_id uuid,
  p_new_transaction_number text,
  p_customer_id uuid,
  p_commercial_type text,
  p_order_number text,
  p_customer_token text,
  p_service_level text,
  p_order_snapshot jsonb,
  p_created_by uuid,
  p_order_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_transaction_id uuid;
  v_transaction_status text;
  v_add_result jsonb;
  v_order_id uuid;
  v_claimed uuid;
begin
  update public.consultations
  set status = 'order_created', updated_at = now()
  where id = p_consultation_id and status <> 'order_created'
  returning id into v_claimed;

  if v_claimed is null then
    raise exception 'Konsultasi ini sudah memiliki Order sebelumnya. Order tidak dapat dibuat dua kali dari konsultasi yang sama.';
  end if;

  if p_existing_transaction_id is not null then
    select status into v_transaction_status
    from public.transactions where id = p_existing_transaction_id;

    if v_transaction_status is null then
      raise exception 'Existing transaction not found';
    end if;
    if v_transaction_status <> 'open' then
      raise exception 'Transaksi yang dipilih tidak dalam status OPEN. Silakan buat transaksi baru.';
    end if;

    v_transaction_id := p_existing_transaction_id;
  else
    insert into public.transactions (transaction_number, primary_customer_id, status, commercial_type, created_by)
    values (p_new_transaction_number, p_customer_id, 'open', p_commercial_type, p_created_by)
    returning id into v_transaction_id;
  end if;

  v_add_result := public.add_garment_to_transaction(
    v_transaction_id, p_customer_id, p_order_number, p_customer_token, p_order_id
  );
  v_order_id := (v_add_result ->> 'order_id')::uuid;

  if p_service_level is not null then
    begin
      perform public.set_order_service(v_order_id, p_service_level);
    exception when others then
      null;
    end;
  end if;

  insert into public.business_events (consultation_id, order_id, event_type, event_data, created_by)
  values (
    p_consultation_id, v_order_id, 'order.created',
    p_order_snapshot || jsonb_build_object('order_number', p_order_number),
    p_created_by
  );

  insert into public.business_events (consultation_id, order_id, event_type, event_data, created_by)
  values (
    p_consultation_id, v_order_id, 'consultation.completed',
    jsonb_build_object('order_number', p_order_number),
    p_created_by
  );

  insert into public.business_events (consultation_id, order_id, event_type, event_data, created_by)
  values (
    p_consultation_id, v_order_id, 'workflow.order_created',
    jsonb_build_object('from_status', 'review', 'to_status', 'order_created', 'order_state', 'order'),
    p_created_by
  );

  return jsonb_build_object('order_id', v_order_id, 'transaction_id', v_transaction_id);
end;
$function$;

-- ============================================================
-- 2. record_order_payment() -- Payment Confirmation
--
-- Flagged (found, not fixed) all the way back in PS-01.1: every payment is
-- a plain INSERT with no dedup of any kind. Unlike every UPDATE-based
-- action in this app (start/complete_stage, assign_stage_operator, etc.),
-- an INSERT has no natural "already done" row-state to guard on -- a
-- double-click on "Simpan", a browser retrying a slow POST, or the same
-- payment submitted from two tabs each creates a genuinely NEW row. The
-- client-side `disabled={saving}` guard on PaymentSummaryCard's Simpan
-- button (already correct, set synchronously before the RPC call) only
-- protects against a double-click *within one already-loaded page* -- it
-- does nothing for a network-level retry or a second tab.
--
-- Fix: idempotency key, the standard tool for exactly this shape of
-- problem. `order_payments.idempotency_key` is a nullable, UNIQUE column
-- (Postgres allows unlimited NULLs in a UNIQUE column, so this is a no-op
-- for any caller that doesn't pass one). The client generates one UUID per
-- "payment intent" (when the Catat Pembayaran form opens, not per click),
-- and record_order_payment now checks for an existing row with that key
-- before inserting; if found, returns the SAME row instead of creating a
-- second one -- true idempotent replay, not just a rejected duplicate.
-- ============================================================

alter table public.order_payments
  add column if not exists idempotency_key text;

alter table public.order_payments
  add constraint order_payments_idempotency_key_key unique (idempotency_key);

create or replace function public.record_order_payment(
  p_order_id uuid,
  p_amount numeric,
  p_payment_type text,
  p_payment_method text default null::text,
  p_notes text default null::text,
  p_idempotency_key text default null::text
)
returns order_payments
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_transaction_id uuid;
  v_commercial_type text;
  v_quotation public.quotations;
  v_payment public.order_payments;
  v_rules public.commercial_rules;
  v_min_dp_amount numeric;
begin
  if p_idempotency_key is not null then
    select * into v_payment from public.order_payments where idempotency_key = p_idempotency_key;
    if v_payment.id is not null then
      -- Exact same submission already recorded (double-click, retry, or a
      -- second tab racing this one) -- hand back the original result
      -- instead of validating/inserting again.
      return v_payment;
    end if;
  end if;

  v_transaction_id := public.resolve_transaction_id(p_order_id);
  select commercial_type into v_commercial_type from public.transactions where id = v_transaction_id;

  if not public.commercial_type_requires_invoice(v_commercial_type) then
    raise exception 'Order ini tidak memerlukan pembayaran (Tipe Komersial: %).', v_commercial_type;
  end if;

  select * into v_quotation from public.quotations where transaction_id = v_transaction_id;
  if v_quotation.id is null then
    raise exception 'Belum ada data harga (quotation) untuk order ini.';
  end if;

  select * into v_rules from public.commercial_rules where id = true;

  if coalesce(v_rules.full_payment_only, false) and p_payment_type in ('dp', 'installment') then
    raise exception 'Aturan bisnis saat ini mewajibkan Full Payment — DP/Cicilan tidak diterima (Commercial Rules).';
  end if;

  if p_payment_type = 'dp' and v_quotation.total > 0 and v_rules.min_dp_percent > 0 then
    v_min_dp_amount := v_quotation.total * v_rules.min_dp_percent / 100;
    if p_amount < v_min_dp_amount then
      raise exception 'DP minimal % %% dari total (minimal Rp%) sesuai Commercial Rules.', v_rules.min_dp_percent, round(v_min_dp_amount);
    end if;
  end if;

  begin
    insert into public.order_payments (
      order_id, transaction_id, quotation_id, amount, payment_type, payment_method, notes, recorded_by, idempotency_key
    )
    values (
      p_order_id, v_transaction_id, v_quotation.id, p_amount, p_payment_type, p_payment_method, p_notes, auth.uid(), p_idempotency_key
    )
    returning * into v_payment;
  exception when unique_violation then
    -- Lost a race against another concurrent request carrying the exact
    -- same idempotency key (two tabs submitting the same intent at once).
    select * into v_payment from public.order_payments where idempotency_key = p_idempotency_key;
  end;

  if v_quotation.status = 'draft' then
    update public.quotations set status = 'approved', approved_at = now() where id = v_quotation.id;
  end if;

  return v_payment;
end;
$function$;
