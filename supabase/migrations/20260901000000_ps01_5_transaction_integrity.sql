-- Sprint PS-01.5: Transaction Integrity
--
-- Two kinds of fix, both keeping every existing RPC's external contract
-- (params/return shape/error text) unchanged for any caller that doesn't
-- opt into the new pieces:
--
-- 1. resolve_hari_d()/set_order_service() -- close the Hari-D capacity
--    overbooking race flagged (found, not fixed) in PS-01.3. This is the
--    one place in the whole audit that genuinely needs a lock: a cross-row
--    COUNT check with no single row to serialize on naturally.
--
-- 2. Three client-side flows that performed one logical multi-table write
--    as several SEPARATE network round-trips (createOrderFromConsultation,
--    MeasurementWorkspace's decision handler, DesignStudioWorkspace's
--    persist) -- each round-trip commits independently, so a later step
--    failing after an earlier one already committed leaves permanently
--    inconsistent rows (most severely: an `orders` row with no
--    `order.created` business_events snapshot, which breaks
--    get_production_packet for that order). Each is folded into one new
--    SECURITY DEFINER RPC, so the whole flow is one Postgres transaction
--    (all-or-nothing) the same way every other multi-step write in this
--    app already is. No new tables/columns; the TypeScript callers keep
--    doing the exact same business-logic computation (snapshot shape,
--    encode/decode) they always did -- they just persist the result in one
--    call instead of several.

-- ============================================================
-- 1. set_order_service() -- Hari-D capacity race
--
-- Race (see PS-01.3 report): two concurrent set_order_service calls for
-- two DIFFERENT orders can both run resolve_hari_d(), both read the same
-- pre-commit `count(*) where hari_d = X`, both see room, and both commit
-- to the same day X -- silent overbooking. A single-row UPDATE can't fix
-- this on its own because the two transactions never touch the same row
-- (different orders); there is nothing for Postgres's normal row-level
-- locking to serialize.
--
-- Fix: pg_advisory_xact_lock(namespace, days_since_epoch) scoped to the
-- ONE candidate date, taken right before the authoritative recheck and
-- held until this transaction commits or rolls back. Two transactions
-- contending for the SAME date are now forced to run one after the other;
-- transactions targeting DIFFERENT dates never block each other. Chosen
-- over a plain (session-scoped) pg_advisory_lock because Supabase runs
-- behind a transaction-mode pooler (Supavisor/PgBouncer) -- a session lock
-- can leak across unrelated requests when the pooler hands the underlying
-- connection to a different client mid-lock. pg_advisory_xact_lock is the
-- only form that is actually safe under that pooling mode: it always
-- releases automatically at COMMIT/ROLLBACK, so a raised exception can
-- never leave a stuck lock behind.
--
-- resolve_hari_d() itself is UNCHANGED (still a fast, lock-free search --
-- correct, since by itself it never commits anything) -- all new logic is
-- in set_order_service, the only place that actually writes a hari_d.
-- Deadlock note: every caller searches forward from current_date in the
-- same increasing order, so two transactions can never be waiting on each
-- other's locks in a cycle.
-- ============================================================

create or replace function public.set_order_service(p_order_id uuid, p_service_level text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_hari_d date;
  v_search_start date := current_date;
  v_attempt integer := 0;
  v_override integer;
  v_effective integer;
  v_committed integer;
begin
  if p_service_level not in ('standard', 'fast', 'very_fast') then
    raise exception 'Unknown service_level: %', p_service_level;
  end if;

  if not exists (select 1 from public.orders where id = p_order_id) then
    raise exception 'Order not found';
  end if;

  loop
    v_attempt := v_attempt + 1;
    if v_attempt > 90 then
      raise exception 'No production capacity slot available within the search window';
    end if;

    -- Fast, unprotected search for a candidate date -- unchanged utility,
    -- may already be stale by the time we act on it, which is fine: it's
    -- only a starting guess for the authoritative check below.
    v_hari_d := public.resolve_hari_d(v_search_start);
    if v_hari_d is null then
      raise exception 'No production capacity slot available within the search window';
    end if;

    -- Serialize only against other transactions contending for this exact
    -- calendar date. Transaction-scoped: safe under connection pooling,
    -- self-releasing on any exit path (return, exception, or normal end).
    perform pg_advisory_xact_lock(hashtext('ltos_hari_d_capacity'), (v_hari_d - date '2000-01-01'));

    select max_orders into v_override
    from public.production_capacity_calendar
    where calendar_date = v_hari_d;

    v_effective := coalesce(v_override, public.compute_daily_capacity(v_hari_d));

    select count(*) into v_committed
    from public.orders
    where hari_d = v_hari_d;

    if v_committed < v_effective then
      exit; -- genuinely available, and now lock-protected through commit
    end if;

    -- Lost the race (or the plain search above was already stale) -- this
    -- date really is full under the authoritative, lock-protected count.
    -- Try the next day. The now-unneeded lock on v_hari_d stays held until
    -- this transaction ends; harmless, since the date is in fact full.
    v_search_start := v_hari_d + 1;
  end loop;

  update public.orders
  set service_level = p_service_level,
      hari_d = v_hari_d,
      service_selected_at = now(),
      updated_at = now()
  where id = p_order_id;

  insert into public.business_events (order_id, event_type, event_data)
  values (
    p_order_id,
    'order.service_selected',
    jsonb_build_object('service_level', p_service_level, 'hari_d', v_hari_d)
  );

  return jsonb_build_object(
    'order_id', p_order_id,
    'service_level', p_service_level,
    'hari_d', v_hari_d
  );
end;
$function$;

-- ============================================================
-- 2a. finalize_order_creation() -- backs createOrderFromConsultation()
--
-- Before: src/lib/order/createOrder.ts made 7+ separate network calls
-- (verify/insert transaction, add_garment_to_transaction RPC,
-- set_order_service RPC, consultations UPDATE, 3x business_events INSERT).
-- If any call after the order insert failed -- e.g. the consultations
-- UPDATE hitting a PS-01.2 stale-write conflict, or a dropped connection --
-- the `orders` row and its `transactions` row were already permanently
-- committed, but the 'order.created' business_events snapshot (which
-- get_production_packet reads customer_name/design/measurements from) and
-- the other two events might never be written. Result: a real order row
-- Production would open to blank/broken data, with no way to retry (the
-- consultation's status/order_number make a second Create Order attempt
-- fail as a duplicate).
--
-- Fix: one RPC, one transaction. All the snapshot-shape computation
-- (buildOrderSnapshot, encode/decode, QR payload) stays exactly where it
-- was in TypeScript -- only already-computed values cross the wire, and
-- the RPC just persists them together with the existing
-- add_garment_to_transaction/set_order_service RPCs called directly
-- (same transaction, so their own PS-01.1/PS-01.3 atomicity guarantees
-- compose cleanly with this one). set_order_service's "best effort" -- an
-- order must still be created even with no capacity slot found -- is kept
-- identical via a nested EXCEPTION block, matching the try/catch that used
-- to live in createOrder.ts.
--
-- buildQrPayload(orderId) has always embedded the real DB order id (never
-- order_number/customer id -- a deliberate rule, see qr.ts), and that QR
-- payload is itself part of the snapshot this RPC persists atomically --
-- so the order id has to be known in TypeScript BEFORE this call, not
-- handed back after. add_garment_to_transaction() gains one optional
-- `p_order_id` param (defaults to null) so it can accept a client-generated
-- id instead of always falling back to gen_random_uuid(); every existing
-- caller that omits it (GarmentOrderList's "add another garment" flow)
-- keeps its exact prior behavior.
--
-- CREATE OR REPLACE does NOT replace a function when the parameter list
-- changes shape (even by just appending one) -- Postgres treats it as a
-- new overload instead, which left the old 4-arg signature and the new
-- 5-arg one ambiguously matching every existing 4-arg call site. The old
-- signature must be dropped explicitly first.
-- ============================================================

drop function if exists public.add_garment_to_transaction(uuid, uuid, text, text);

create or replace function public.add_garment_to_transaction(
  p_transaction_id uuid,
  p_customer_id uuid,
  p_order_number text,
  p_customer_token text,
  p_order_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_transaction public.transactions;
  v_order public.orders;
  v_garment_index integer;
  v_result jsonb;
  v_attempt integer := 0;
begin
  select * into v_transaction from public.transactions where id = p_transaction_id;
  if v_transaction.id is null then
    raise exception 'Transaksi tidak ditemukan.';
  end if;
  if v_transaction.status != 'open' then
    raise exception 'Transaksi tidak dalam status OPEN. Status saat ini: %', v_transaction.status;
  end if;

  loop
    v_attempt := v_attempt + 1;

    select coalesce(max(garment_index), 0) + 1
    into v_garment_index
    from public.orders
    where transaction_id = p_transaction_id;

    begin
      insert into public.orders (
        id,
        customer_id,
        order_number,
        current_state,
        customer_token,
        transaction_id,
        garment_index,
        duplicated_from_order_id
      ) values (
        coalesce(p_order_id, gen_random_uuid()),
        p_customer_id,
        p_order_number,
        'order',
        p_customer_token,
        p_transaction_id,
        v_garment_index,
        null
      )
      returning * into v_order;

      exit;
    exception when unique_violation then
      if v_attempt >= 10 then
        raise exception 'Gagal menetapkan nomor garment setelah beberapa percobaan bersamaan. Coba lagi.';
      end if;
    end;
  end loop;

  select jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'garment_index', v_garment_index,
    'transaction_id', v_transaction.id,
    'transaction_number', v_transaction.transaction_number
  ) into v_result;

  return v_result;
end;
$function$;

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
begin
  if exists (
    select 1 from public.consultations
    where id = p_consultation_id and status = 'order_created'
  ) then
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

  -- Same order-insert primitive every other "add garment" caller uses
  -- (PS-01.1/PS-01.3 hardened) -- called directly, so it's part of this
  -- same transaction, not a separate round trip. p_order_id is whatever
  -- TypeScript already generated for buildQrPayload/the snapshot; when
  -- null (no other caller passes it), falls back to gen_random_uuid() same
  -- as before this sprint.
  v_add_result := public.add_garment_to_transaction(
    v_transaction_id, p_customer_id, p_order_number, p_customer_token, p_order_id
  );
  v_order_id := (v_add_result ->> 'order_id')::uuid;

  if p_service_level is not null then
    begin
      perform public.set_order_service(v_order_id, p_service_level);
    exception when others then
      -- Best-effort, matches createOrder.ts's existing try/catch: the order
      -- still gets created with no service_level/hari_d, falling back to
      -- the +14 day estimate, same as before this sprint.
      null;
    end;
  end if;

  update public.consultations
  set status = 'order_created', updated_at = now()
  where id = p_consultation_id;

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
-- 2b. record_measurement_decision() -- backs MeasurementWorkspace's
-- handleDecision('valid' | 'remeasure')
--
-- Before: measurements INSERT, then (valid path) business_events INSERT +
-- consultations UPDATE, or (remeasure path) business_events INSERT +
-- consultations UPDATE -- 3 separate calls. A failure on the last call
-- (e.g. the PS-01.2 optimistic-lock conflict on consultations) leaves an
-- orphaned measurements row with no completion/rejection event and no
-- status advance; retrying re-inserts another measurements row.
--
-- Fix: one RPC, mirrors complete_stage()'s existing p_decision-branch
-- shape for consistency. The PS-01.2 optimistic-lock guard on
-- consultations (`updated_at` must still match) is preserved exactly --
-- same StaleConsultationError-equivalent behavior, just enforced inside
-- this RPC's UPDATE instead of the TS helper. Numeric measurement fields
-- stay individually typed params (matching save_pattern_formulation's
-- style), not a jsonb blob needing re-parsing server-side.
-- ============================================================

create or replace function public.record_measurement_decision(
  p_consultation_id uuid,
  p_decision text,
  p_chest numeric,
  p_shoulder numeric,
  p_sleeve numeric,
  p_length numeric,
  p_height_cm integer,
  p_weight_kg numeric,
  p_age_years integer,
  p_measurement_notes text,
  p_event_data jsonb,
  p_next_consultation_notes text,
  p_expected_updated_at timestamptz,
  p_created_by uuid
)
returns timestamptz
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_new_updated_at timestamptz;
begin
  if p_decision not in ('valid', 'remeasure') then
    raise exception 'Unknown decision: %', p_decision;
  end if;

  insert into public.measurements (
    consultation_id, chest, shoulder, sleeve, length, notes, height_cm, weight_kg, age_years
  ) values (
    p_consultation_id, p_chest, p_shoulder, p_sleeve, p_length, p_measurement_notes,
    p_height_cm, p_weight_kg, p_age_years
  );

  if p_decision = 'valid' then
    insert into public.business_events (consultation_id, event_type, event_data, created_by)
    values (p_consultation_id, 'measurement.completed', p_event_data, p_created_by);

    update public.consultations
    set status = 'design', notes = p_next_consultation_notes, updated_at = now()
    where id = p_consultation_id and updated_at = p_expected_updated_at
    returning updated_at into v_new_updated_at;
  else
    insert into public.business_events (consultation_id, event_type, event_data, created_by)
    values (p_consultation_id, 'measurement.rejected', p_event_data, p_created_by);

    update public.consultations
    set status = 'measurement', updated_at = now()
    where id = p_consultation_id and updated_at = p_expected_updated_at
    returning updated_at into v_new_updated_at;
  end if;

  if v_new_updated_at is null then
    raise exception 'Data konsultasi ini sudah diubah oleh proses lain sejak terakhir dimuat. Muat ulang halaman sebelum menyimpan lagi.';
  end if;

  return v_new_updated_at;
end;
$function$;

-- ============================================================
-- 2c. save_design_selections() -- backs DesignStudioWorkspace's persist()
--
-- Before: consultations UPDATE (notes, optionally status='review') then a
-- separate business_events INSERT ('design.saved'/'design.completed'). A
-- failure on the event insert after the notes update already committed
-- silently loses the audit trail for that save/completion with no retry
-- path (the notes are already saved, so re-clicking "Simpan" just looks
-- like a no-op success next time).
--
-- Fix: one RPC, same PS-01.2 optimistic-lock guard preserved.
-- ============================================================

create or replace function public.save_design_selections(
  p_consultation_id uuid,
  p_notes text,
  p_next_status text,
  p_event_type text,
  p_event_data jsonb,
  p_expected_updated_at timestamptz,
  p_created_by uuid
)
returns timestamptz
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_new_updated_at timestamptz;
begin
  update public.consultations
  set notes = p_notes,
      status = coalesce(p_next_status, status),
      updated_at = now()
  where id = p_consultation_id and updated_at = p_expected_updated_at
  returning updated_at into v_new_updated_at;

  if v_new_updated_at is null then
    raise exception 'Data konsultasi ini sudah diubah oleh proses lain sejak terakhir dimuat. Muat ulang halaman sebelum menyimpan lagi.';
  end if;

  insert into public.business_events (consultation_id, event_type, event_data, created_by)
  values (p_consultation_id, p_event_type, p_event_data, p_created_by);

  return v_new_updated_at;
end;
$function$;
