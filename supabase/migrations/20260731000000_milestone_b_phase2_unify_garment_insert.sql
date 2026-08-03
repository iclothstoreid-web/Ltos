-- Milestone B Phase 2: Transaction Service Layer / createOrderFromConsultation
-- refactor.
--
-- Architecture Decision 1 (Single Source of Truth for "Add Garment"): the
-- previous add_garment_to_transaction() (20260821000000) duplicated the order
-- insert + garment_index calculation that also lived inline in
-- createOrderFromConsultation(), and additionally wrote its own minimal
-- order.created business_events row ({order_number, transaction_id,
-- garment_index, added_to_existing_transaction}) instead of the full
-- OrderSnapshot every other order.created event carries. That drift is
-- exactly what get_transaction_detail()/duplicate_garment() would have
-- silently tolerated (they only read whatever is there) while Owner OS /
-- Customer Journey readers of order.created would have seen an
-- inconsistent, incomplete shape depending on which code path created the
-- garment.
--
-- Fix: narrow this RPC to the one thing only the database can do
-- atomically -- validate the transaction is OPEN, compute the next
-- garment_index, insert the order row. It no longer writes business_events
-- at all. createOrderFromConsultation() (src/lib/order/createOrder.ts) is
-- now the single caller, for BOTH the "brand new transaction" and "existing
-- OPEN transaction" cases, and is the single place that assembles + writes
-- the order.created snapshot afterward via buildOrderSnapshot()
-- (src/lib/order/snapshot.ts, Decision 2). The p_consultation_id /
-- p_consultation_number params existed only to feed that now-removed
-- business_events insert, so they're dropped too -- this is a new function
-- signature, not the same one being redesigned, so the old 6-arg overload
-- is dropped explicitly rather than left as dead-but-callable.
--
-- No caller outside this migration's own creation ever shipped: the TS
-- wrapper (addGarmentToTransaction in src/lib/transaction/client.ts) had no
-- callers before this Phase 2 change, so this is safe to narrow without a
-- back-compat shim.

drop function if exists public.add_garment_to_transaction(uuid, uuid, text, text, uuid, text);

create or replace function public.add_garment_to_transaction(
  p_transaction_id uuid,
  p_customer_id uuid,
  p_order_number text,
  p_customer_token text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_transaction public.transactions;
  v_order public.orders;
  v_garment_index integer;
  v_result jsonb;
begin
  -- Validate transaction exists and is OPEN
  select * into v_transaction from public.transactions where id = p_transaction_id;
  if v_transaction.id is null then
    raise exception 'Transaksi tidak ditemukan.';
  end if;
  if v_transaction.status != 'open' then
    raise exception 'Transaksi tidak dalam status OPEN. Status saat ini: %', v_transaction.status;
  end if;

  -- Calculate next garment_index for this transaction
  select coalesce(max(garment_index), 0) + 1
  into v_garment_index
  from public.orders
  where transaction_id = p_transaction_id;

  -- Create the order. The caller writes the order.created business_events
  -- snapshot itself immediately after this returns (it needs the real
  -- order_id for qrPayload, which doesn't exist until this insert runs).
  insert into public.orders (
    customer_id,
    order_number,
    current_state,
    customer_token,
    transaction_id,
    garment_index,
    duplicated_from_order_id
  ) values (
    p_customer_id,
    p_order_number,
    'order',
    p_customer_token,
    p_transaction_id,
    v_garment_index,
    null
  )
  returning * into v_order;

  select jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'garment_index', v_garment_index,
    'transaction_id', v_transaction.id,
    'transaction_number', v_transaction.transaction_number
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.add_garment_to_transaction(uuid, uuid, text, text) to authenticated, anon;
