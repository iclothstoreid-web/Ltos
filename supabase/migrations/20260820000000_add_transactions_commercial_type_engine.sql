-- Milestone A: Multi-Garment + Commercial Engine Foundation
--
-- Adds `transactions` as the commercial/payment container that sits above
-- `orders`. `orders` stays exactly what it is today -- the production/
-- garment unit (QR, production_stage_records, pattern_formulations all stay
-- keyed by order_id, completely untouched by this migration).
--
-- Commercial data (quotations/order_payments) moves from order-grain to
-- transaction-grain now, while every transaction is still guaranteed 1:1
-- with an order (no multi-garment UI exists yet) -- this is the trivial
-- version of that migration. Deferring it to the future multi-garment
-- sprint would mean doing it again against real N-orders-per-transaction
-- data, which is a much harder migration.
--
-- Every existing commercial RPC (apply_order_discount, apply_order_kol,
-- set_order_price_override, clear_order_price_override,
-- record_order_payment, upsert_order_quotation, get_order_payment_history,
-- get_order_invoice) keeps its existing p_order_id parameter and resolves
-- the transaction internally via resolve_transaction_id() -- zero signature
-- changes, zero TypeScript caller changes required for this migration.

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_number text not null unique,
  primary_customer_id uuid not null references public.customers(id),
  status text not null default 'open' check (status in ('open', 'closed')),
  commercial_type text not null default 'normal'
    check (commercial_type in ('normal', 'dp', 'full_payment', 'kol', 'sponsor', 'warranty', 'internal_sample')),
  commercial_type_reason text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

alter table public.transactions enable row level security;

-- Mirrors the existing "All staff can read orders" / "Admin/Owner can
-- create orders" policies exactly -- transactions are created in the same
-- request (createOrderFromConsultation) that already successfully inserts
-- into orders under this same policy shape.
create policy "All staff can read transactions"
  on public.transactions for select
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()));

create policy "Admin/Owner can create transactions"
  on public.transactions for insert
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['owner', 'admin'])
  ));

-- orders gains transaction_id: nullable while backfilling, then locked NOT NULL.
alter table public.orders add column transaction_id uuid references public.transactions(id);

-- Backfill: one transaction per existing order. order_number is always
-- 'LT-ORD-XXXXXX' (createOrderFromConsultation), so substr(order_number, 8)
-- recovers the shared suffix -- transaction_number is therefore guaranteed
-- unique since order_number already is.
insert into public.transactions (transaction_number, primary_customer_id, status, commercial_type, created_at)
select 'LT-TRX-' || substr(o.order_number, 8), o.customer_id, 'closed', 'normal', o.created_at
from public.orders o
where o.transaction_id is null;

update public.orders o
set transaction_id = t.id
from public.transactions t
where o.transaction_id is null
  and t.transaction_number = 'LT-TRX-' || substr(o.order_number, 8);

alter table public.orders alter column transaction_id set not null;

-- Commercial engine moves to transaction-grain.
alter table public.quotations add column transaction_id uuid references public.transactions(id);

update public.quotations q
set transaction_id = o.transaction_id
from public.orders o
where q.order_id = o.id;

alter table public.quotations alter column transaction_id set not null;
alter table public.quotations drop constraint quotations_order_id_key;
alter table public.quotations add constraint quotations_transaction_id_key unique (transaction_id);

alter table public.order_payments add column transaction_id uuid references public.transactions(id);

update public.order_payments p
set transaction_id = o.transaction_id
from public.orders o
where p.order_id = o.id;

alter table public.order_payments alter column transaction_id set not null;
create index idx_order_payments_transaction_id on public.order_payments(transaction_id);

-- Non-billable enforcement: a quotation for a KOL/Sponsor/Warranty/Internal
-- Sample transaction is created directly in this terminal status, so it can
-- never transition to 'approved' -- the existing revenue query in
-- command-center/page.tsx (status='approved') already excludes it correctly
-- without any query change, via the state machine rather than a duplicated
-- filter.
alter table public.quotations drop constraint quotations_status_check;
alter table public.quotations add constraint quotations_status_check
  check (status in ('draft', 'sent', 'approved', 'rejected', 'not_billable'));

-- Shared lookup, used by every commercial RPC below so the
-- order_id -> transaction_id resolution is written exactly once.
create or replace function public.resolve_transaction_id(p_order_id uuid)
returns uuid
language sql
stable
security definer
set search_path to 'public'
as $$
  select transaction_id from public.orders where id = p_order_id;
$$;

grant execute on function public.resolve_transaction_id(uuid) to authenticated, anon;

create or replace function public.upsert_order_quotation(
  p_order_id uuid,
  p_line_items jsonb,
  p_subtotal numeric
)
returns quotations
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.quotations;
  v_transaction_id uuid;
  v_commercial_type text;
  v_status text;
begin
  v_transaction_id := public.resolve_transaction_id(p_order_id);
  if v_transaction_id is null then
    raise exception 'Order tidak memiliki transaksi terkait.';
  end if;

  select commercial_type into v_commercial_type from public.transactions where id = v_transaction_id;
  v_status := case
    when v_commercial_type in ('kol', 'sponsor', 'warranty', 'internal_sample') then 'not_billable'
    else 'draft'
  end;

  insert into public.quotations (order_id, transaction_id, amount, subtotal, line_items, total, status, created_by)
  values (p_order_id, v_transaction_id, p_subtotal, p_subtotal, p_line_items, p_subtotal, v_status, auth.uid())
  on conflict (transaction_id) do update
    set subtotal = excluded.subtotal,
        line_items = excluded.line_items
  returning * into v_row;

  perform public.recompute_quotation_total(v_row.id);
  select * into v_row from public.quotations where id = v_row.id;
  return v_row;
end;
$$;

-- NOTE: apply_order_discount/apply_order_kol/set_order_price_override/
-- record_order_payment were already extended once by
-- 20260811000000_add_business_rules_runtime_config.sql to read live
-- Commercial Rules (max_discount_percent/kol_max_discount_percent/
-- owner_override_enabled/min_dp_percent/full_payment_only). That logic is
-- preserved verbatim below -- only the quotation lookup changes from
-- order_id to transaction_id.

create or replace function public.apply_order_discount(
  p_order_id uuid,
  p_discount_type text,
  p_discount_value numeric,
  p_reason text default null
)
returns quotations
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.quotations;
  v_transaction_id uuid;
  v_amount numeric;
  v_max_percent numeric;
  v_effective_percent numeric;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat memberikan diskon.';
  end if;

  if p_discount_type not in ('percentage', 'fixed') then
    raise exception 'Tipe diskon tidak valid: %', p_discount_type;
  end if;

  v_transaction_id := public.resolve_transaction_id(p_order_id);
  select * into v_row from public.quotations where transaction_id = v_transaction_id;
  if v_row.id is null then
    raise exception 'Belum ada data harga (quotation) untuk order ini.';
  end if;

  v_amount := case
    when p_discount_type = 'percentage' then round(v_row.subtotal * p_discount_value / 100, 0)
    else p_discount_value
  end;

  select max_discount_percent into v_max_percent from public.commercial_rules where id = true;
  if v_row.subtotal > 0 and v_max_percent is not null then
    v_effective_percent := v_amount / v_row.subtotal * 100;
    if v_effective_percent > v_max_percent then
      raise exception 'Diskon (% %%) melebihi batas Maksimal Diskon (% %%) dari Commercial Rules.', round(v_effective_percent, 2), v_max_percent;
    end if;
  end if;

  update public.quotations
  set discount_type = p_discount_type,
      discount_value = p_discount_value,
      discount_amount = v_amount,
      discount_reason = p_reason
  where id = v_row.id
  returning * into v_row;

  perform public.recompute_quotation_total(v_row.id);
  select * into v_row from public.quotations where id = v_row.id;
  return v_row;
end;
$$;

create or replace function public.apply_order_kol(
  p_order_id uuid,
  p_kol_code text,
  p_kol_discount_amount numeric,
  p_notes text default null
)
returns quotations
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.quotations;
  v_transaction_id uuid;
  v_max_percent numeric;
  v_effective_percent numeric;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengatur diskon KOL.';
  end if;

  v_transaction_id := public.resolve_transaction_id(p_order_id);
  select * into v_row from public.quotations where transaction_id = v_transaction_id;
  if v_row.id is null then
    raise exception 'Belum ada data harga (quotation) untuk order ini.';
  end if;

  select kol_max_discount_percent into v_max_percent from public.commercial_rules where id = true;
  if v_row.subtotal > 0 and v_max_percent is not null then
    v_effective_percent := p_kol_discount_amount / v_row.subtotal * 100;
    if v_effective_percent > v_max_percent then
      raise exception 'Diskon KOL (% %%) melebihi batas Maksimal Diskon KOL (% %%) dari Commercial Rules.', round(v_effective_percent, 2), v_max_percent;
    end if;
  end if;

  update public.quotations
  set kol_code = p_kol_code,
      kol_discount_amount = p_kol_discount_amount,
      kol_notes = p_notes
  where id = v_row.id
  returning * into v_row;

  perform public.recompute_quotation_total(v_row.id);
  select * into v_row from public.quotations where id = v_row.id;
  return v_row;
end;
$$;

create or replace function public.set_order_price_override(
  p_order_id uuid,
  p_override_amount numeric,
  p_reason text
)
returns quotations
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.quotations;
  v_transaction_id uuid;
  v_enabled boolean;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat melakukan override harga.';
  end if;

  select owner_override_enabled into v_enabled from public.commercial_rules where id = true;
  if not coalesce(v_enabled, true) then
    raise exception 'Owner Override Harga sedang dinonaktifkan (Commercial Rules).';
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'Alasan override wajib diisi.';
  end if;

  v_transaction_id := public.resolve_transaction_id(p_order_id);
  select * into v_row from public.quotations where transaction_id = v_transaction_id;
  if v_row.id is null then
    raise exception 'Belum ada data harga (quotation) untuk order ini.';
  end if;

  update public.quotations
  set override_amount = p_override_amount,
      override_reason = p_reason,
      override_by = auth.uid(),
      override_at = now()
  where id = v_row.id
  returning * into v_row;

  perform public.recompute_quotation_total(v_row.id);
  select * into v_row from public.quotations where id = v_row.id;
  return v_row;
end;
$$;

create or replace function public.clear_order_price_override(p_order_id uuid)
returns quotations
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.quotations;
  v_transaction_id uuid;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengubah override harga.';
  end if;

  v_transaction_id := public.resolve_transaction_id(p_order_id);
  select * into v_row from public.quotations where transaction_id = v_transaction_id;
  if v_row.id is null then
    raise exception 'Belum ada data harga (quotation) untuk order ini.';
  end if;

  update public.quotations
  set override_amount = null, override_reason = null, override_by = null, override_at = null
  where id = v_row.id
  returning * into v_row;

  perform public.recompute_quotation_total(v_row.id);
  select * into v_row from public.quotations where id = v_row.id;
  return v_row;
end;
$$;

-- NOTE: min_dp_percent/full_payment_only checks below are preserved
-- verbatim from 20260811000000_add_business_rules_runtime_config.sql; only
-- the quotation lookup changes from order_id to transaction_id, plus the
-- new non-billable-commercial-type guard.
create or replace function public.record_order_payment(
  p_order_id uuid,
  p_amount numeric,
  p_payment_type text,
  p_payment_method text default null,
  p_notes text default null
)
returns order_payments
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_transaction_id uuid;
  v_commercial_type text;
  v_quotation public.quotations;
  v_payment public.order_payments;
  v_rules public.commercial_rules;
  v_min_dp_amount numeric;
begin
  v_transaction_id := public.resolve_transaction_id(p_order_id);
  select commercial_type into v_commercial_type from public.transactions where id = v_transaction_id;

  if v_commercial_type in ('kol', 'sponsor', 'warranty', 'internal_sample') then
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

  insert into public.order_payments (order_id, transaction_id, quotation_id, amount, payment_type, payment_method, notes, recorded_by)
  values (p_order_id, v_transaction_id, v_quotation.id, p_amount, p_payment_type, p_payment_method, p_notes, auth.uid())
  returning * into v_payment;

  if v_quotation.status = 'draft' then
    update public.quotations set status = 'approved', approved_at = now() where id = v_quotation.id;
  end if;

  return v_payment;
end;
$$;

create or replace function public.get_order_payment_history(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_transaction_id uuid;
  v_result jsonb;
begin
  v_transaction_id := public.resolve_transaction_id(p_order_id);

  select jsonb_build_object(
    'payments', coalesce((
      select jsonb_agg(row_to_json(pay) order by pay.paid_at desc)
      from public.order_payments pay
      where pay.transaction_id = v_transaction_id
    ), '[]'::jsonb),
    'total_paid', coalesce((select sum(amount) from public.order_payments where transaction_id = v_transaction_id), 0)
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.get_order_invoice(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_quotation public.quotations;
  v_order public.orders;
  v_transaction public.transactions;
  v_customer_name text;
  v_total_paid numeric;
  v_invoice_notes text;
  v_result jsonb;
begin
  select * into v_order from public.orders where id = p_order_id;
  if v_order.id is null then
    raise exception 'Order tidak ditemukan.';
  end if;

  select * into v_transaction from public.transactions where id = v_order.transaction_id;
  select name into v_customer_name from public.customers where id = v_order.customer_id;
  select * into v_quotation from public.quotations where transaction_id = v_order.transaction_id;
  select invoice_notes into v_invoice_notes from public.commercial_rules where id = true;

  v_total_paid := coalesce((select sum(amount) from public.order_payments where transaction_id = v_order.transaction_id), 0);

  select jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'customer_name', v_customer_name,
    'transaction_id', v_transaction.id,
    'transaction_number', v_transaction.transaction_number,
    'commercial_type', v_transaction.commercial_type,
    'has_quotation', v_quotation.id is not null,
    'line_items', coalesce(v_quotation.line_items, '[]'::jsonb),
    'subtotal', coalesce(v_quotation.subtotal, 0),
    'discount_type', v_quotation.discount_type,
    'discount_value', coalesce(v_quotation.discount_value, 0),
    'discount_amount', coalesce(v_quotation.discount_amount, 0),
    'discount_reason', v_quotation.discount_reason,
    'kol_code', v_quotation.kol_code,
    'kol_discount_amount', coalesce(v_quotation.kol_discount_amount, 0),
    'kol_notes', v_quotation.kol_notes,
    'override_amount', v_quotation.override_amount,
    'override_reason', v_quotation.override_reason,
    'override_at', v_quotation.override_at,
    'total', coalesce(v_quotation.total, 0),
    'status', coalesce(v_quotation.status, 'draft'),
    'total_paid', v_total_paid,
    'balance_due', greatest(coalesce(v_quotation.total, 0) - v_total_paid, 0),
    'payment_status', case
      when v_quotation.id is null then 'belum_ada_harga'
      when v_quotation.status = 'not_billable' then 'tidak_ada_tagihan'
      when v_total_paid <= 0 then 'belum_dibayar'
      when v_total_paid < v_quotation.total then 'dp_diterima'
      else 'lunas'
    end,
    'payments', coalesce((
      select jsonb_agg(row_to_json(pay) order by pay.paid_at desc)
      from public.order_payments pay
      where pay.transaction_id = v_order.transaction_id
    ), '[]'::jsonb),
    'invoice_notes', coalesce(v_invoice_notes, '')
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.upsert_order_quotation(uuid, jsonb, numeric) to authenticated, anon;
grant execute on function public.apply_order_discount(uuid, text, numeric, text) to authenticated, anon;
grant execute on function public.apply_order_kol(uuid, text, numeric, text) to authenticated, anon;
grant execute on function public.set_order_price_override(uuid, numeric, text) to authenticated, anon;
grant execute on function public.clear_order_price_override(uuid) to authenticated, anon;
grant execute on function public.record_order_payment(uuid, numeric, text, text, text) to authenticated, anon;
grant execute on function public.get_order_payment_history(uuid) to authenticated, anon;
grant execute on function public.get_order_invoice(uuid) to authenticated, anon;
