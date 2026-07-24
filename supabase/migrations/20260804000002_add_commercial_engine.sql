-- Sprint K: Commercial Engine
--
-- Pricing itself already exists and is correct (buildDesignSpecification /
-- PriceSnapshot in src/lib/designSpecification/ sums design_master_options
-- prices client-side) — this migration does NOT reimplement pricing math in
-- SQL (would duplicate logic). It gives the already-computed PriceSnapshot
-- somewhere real to live once an Order exists: `quotations` (1 row per
-- order — subtotal/discount/KOL/override/total) plus a new `order_payments`
-- table (DP/Full/Installment history). get_order_invoice() is the
-- "Invoice Foundation" — one read assembling the whole commercial packet.

alter table public.quotations
  add column if not exists subtotal numeric not null default 0,
  add column if not exists line_items jsonb not null default '[]'::jsonb,
  add column if not exists discount_type text,
  add column if not exists discount_value numeric not null default 0,
  add column if not exists discount_amount numeric not null default 0,
  add column if not exists discount_reason text,
  add column if not exists kol_code text,
  add column if not exists kol_discount_amount numeric not null default 0,
  add column if not exists kol_notes text,
  add column if not exists override_amount numeric,
  add column if not exists override_reason text,
  add column if not exists override_by uuid references public.profiles(id),
  add column if not exists override_at timestamptz,
  add column if not exists total numeric not null default 0,
  add column if not exists created_by uuid references public.profiles(id);

alter table public.quotations
  add constraint quotations_discount_type_check
  check (discount_type is null or discount_type in ('percentage', 'fixed'));

-- One commercial record per order.
alter table public.quotations
  add constraint quotations_order_id_key unique (order_id);

create table if not exists public.order_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  quotation_id uuid references public.quotations(id),
  amount numeric not null check (amount > 0),
  payment_type text not null check (payment_type in ('dp', 'installment', 'pelunasan', 'full')),
  payment_method text check (payment_method in ('tunai', 'transfer', 'qris')),
  notes text,
  recorded_by uuid references public.profiles(id),
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_order_payments_order_id on public.order_payments(order_id);

alter table public.order_payments enable row level security;

create policy "All staff can read order payments"
  on public.order_payments for select
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()));

-- Recompute total from subtotal - discount - kol, or override_amount if set.
create or replace function public.recompute_quotation_total(p_quotation_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.quotations;
begin
  select * into v_row from public.quotations where id = p_quotation_id;
  update public.quotations
  set
    total = coalesce(
      v_row.override_amount,
      greatest(v_row.subtotal - v_row.discount_amount - v_row.kol_discount_amount, 0)
    ),
    amount = coalesce(
      v_row.override_amount,
      greatest(v_row.subtotal - v_row.discount_amount - v_row.kol_discount_amount, 0)
    )
  where id = p_quotation_id;
end;
$$;

-- Pricing Master write path: persists the client-computed PriceSnapshot for
-- an order (create-or-update, 1:1 via the unique order_id). Called once an
-- Order exists (Order Created screen) — Design Studio / Consultation Review
-- still only ever *display* the live snapshot, never persist it, since no
-- Order exists yet at that point.
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
begin
  insert into public.quotations (order_id, amount, subtotal, line_items, total, created_by)
  values (p_order_id, p_subtotal, p_subtotal, p_line_items, p_subtotal, auth.uid())
  on conflict (order_id) do update
    set subtotal = excluded.subtotal,
        line_items = excluded.line_items
  returning * into v_row;

  perform public.recompute_quotation_total(v_row.id);
  select * into v_row from public.quotations where id = v_row.id;
  return v_row;
end;
$$;

-- Discount — owner/admin only.
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
  v_amount numeric;
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

  select * into v_row from public.quotations where order_id = p_order_id;
  if v_row.id is null then
    raise exception 'Belum ada data harga (quotation) untuk order ini.';
  end if;

  v_amount := case
    when p_discount_type = 'percentage' then round(v_row.subtotal * p_discount_value / 100, 0)
    else p_discount_value
  end;

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

-- KOL (Key Opinion Leader referral discount) — owner/admin only.
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
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengatur diskon KOL.';
  end if;

  select * into v_row from public.quotations where order_id = p_order_id;
  if v_row.id is null then
    raise exception 'Belum ada data harga (quotation) untuk order ini.';
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

-- Owner Override — owner/admin only. Final total wins over subtotal/discount/kol.
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
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat melakukan override harga.';
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'Alasan override wajib diisi.';
  end if;

  select * into v_row from public.quotations where order_id = p_order_id;
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
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengubah override harga.';
  end if;

  select * into v_row from public.quotations where order_id = p_order_id;
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

-- Payment History — DP / Full Payment / Installment. Any staff can record a
-- payment (front-desk collects cash/transfer/QRIS); the first payment moves
-- a draft quotation to 'approved'.
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
  v_quotation public.quotations;
  v_payment public.order_payments;
begin
  select * into v_quotation from public.quotations where order_id = p_order_id;
  if v_quotation.id is null then
    raise exception 'Belum ada data harga (quotation) untuk order ini.';
  end if;

  insert into public.order_payments (order_id, quotation_id, amount, payment_type, payment_method, notes, recorded_by)
  values (p_order_id, v_quotation.id, p_amount, p_payment_type, p_payment_method, p_notes, auth.uid())
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
  v_result jsonb;
begin
  select jsonb_build_object(
    'payments', coalesce((
      select jsonb_agg(row_to_json(pay) order by pay.paid_at desc)
      from public.order_payments pay
      where pay.order_id = p_order_id
    ), '[]'::jsonb),
    'total_paid', coalesce((select sum(amount) from public.order_payments where order_id = p_order_id), 0)
  ) into v_result;

  return v_result;
end;
$$;

-- Invoice Foundation — one read assembling the whole commercial packet for
-- an order (line items, discount, KOL, override, total, payments, balance).
-- No PDF/document generation here (out of scope); this is the data
-- foundation an invoice view/print renders from.
create or replace function public.get_order_invoice(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_quotation public.quotations;
  v_order public.orders;
  v_customer_name text;
  v_total_paid numeric;
  v_result jsonb;
begin
  select * into v_order from public.orders where id = p_order_id;
  if v_order.id is null then
    raise exception 'Order tidak ditemukan.';
  end if;

  select name into v_customer_name from public.customers where id = v_order.customer_id;
  select * into v_quotation from public.quotations where order_id = p_order_id;

  v_total_paid := coalesce((select sum(amount) from public.order_payments where order_id = p_order_id), 0);

  select jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'customer_name', v_customer_name,
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
      when v_total_paid <= 0 then 'belum_dibayar'
      when v_total_paid < v_quotation.total then 'dp_diterima'
      else 'lunas'
    end,
    'payments', coalesce((
      select jsonb_agg(row_to_json(pay) order by pay.paid_at desc)
      from public.order_payments pay
      where pay.order_id = p_order_id
    ), '[]'::jsonb)
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
