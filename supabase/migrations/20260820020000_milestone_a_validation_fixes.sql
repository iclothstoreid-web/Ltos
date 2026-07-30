-- Milestone A validation pass (pre-commit architecture audit):
--
-- 1. The "non-billable" commercial-type predicate was duplicated as an
--    inline `in ('kol','sponsor','warranty','internal_sample')` literal in
--    both upsert_order_quotation and record_order_payment. Extracted into
--    one function so it's a true single source of truth at the DB layer
--    too (src/lib/commercial/commercialType.ts is already the single
--    source of truth on the TypeScript side).
--
-- 2. get_fitter_kpi_list() (Sprint K, predates Commercial Type Engine)
--    summed quotations.total for every order tied to a fitter with no
--    status filter at all. Before this sprint every quotation was
--    implicitly billable, so this was harmless; now that 'not_billable'
--    quotations exist (KOL/Sponsor/Warranty/Internal Sample), this
--    function would count their subtotal as real Fitter revenue and
--    inflate/deflate conversion_rate_pct off a denominator that includes
--    orders that can never be 'lunas' by design. Fixed to exclude them
--    from total_revenue/average_order_value/conversion_rate_pct, while
--    order_dibuat/closing_rate_pct/repeat_customer_pct (non-monetary
--    metrics) are intentionally left counting every order, billable or not.

create or replace function public.commercial_type_requires_invoice(p_commercial_type text)
returns boolean
language sql
immutable
as $$
  select p_commercial_type not in ('kol', 'sponsor', 'warranty', 'internal_sample');
$$;

grant execute on function public.commercial_type_requires_invoice(text) to authenticated, anon;

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
    when public.commercial_type_requires_invoice(v_commercial_type) then 'draft'
    else 'not_billable'
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

  insert into public.order_payments (order_id, transaction_id, quotation_id, amount, payment_type, payment_method, notes, recorded_by)
  values (p_order_id, v_transaction_id, v_quotation.id, p_amount, p_payment_type, p_payment_method, p_notes, auth.uid())
  returning * into v_payment;

  if v_quotation.status = 'draft' then
    update public.quotations set status = 'approved', approved_at = now() where id = v_quotation.id;
  end if;

  return v_payment;
end;
$$;

-- Fix 2: exclude non-billable quotations from Fitter revenue metrics.
create or replace function public.get_fitter_kpi_list()
returns table(
  fitter_id uuid,
  nama text,
  divisi text,
  status text,
  total_konsultasi bigint,
  konsultasi_selesai bigint,
  order_dibuat bigint,
  closing_rate_pct numeric,
  conversion_rate_pct numeric,
  total_revenue numeric,
  average_order_value numeric,
  repeat_customer_pct numeric,
  avg_consultation_minutes numeric,
  ranking bigint
)
language sql
security definer
set search_path to 'public'
as $$
  with base as (
    select
      po.id as fitter_id,
      po.nama,
      po.divisi,
      po.status,
      coalesce(c.total, 0) as total_konsultasi,
      coalesce(c.selesai, 0) as konsultasi_selesai,
      coalesce(c.order_created, 0) as order_dibuat,
      case when coalesce(c.total, 0) = 0 then null
        else round(coalesce(c.order_created, 0)::numeric / c.total * 100, 1)
      end as closing_rate_pct,
      coalesce(o.order_count, 0) as order_count,
      coalesce(o.total_revenue, 0) as total_revenue,
      case when coalesce(o.billable_order_count, 0) = 0 then null
        else round(o.total_revenue / o.billable_order_count, 0)
      end as average_order_value,
      case when coalesce(o.billable_order_count, 0) = 0 then null
        else round(coalesce(o.lunas_count, 0)::numeric / o.billable_order_count * 100, 1)
      end as conversion_rate_pct,
      case when coalesce(o.order_count, 0) = 0 then null
        else round(coalesce(o.repeat_count, 0)::numeric / o.order_count * 100, 1)
      end as repeat_customer_pct,
      cm.avg_consultation_minutes
    from public.production_operators po
    join lateral (
      select
        count(*) as total,
        count(*) filter (where k.status <> 'check_in') as selesai,
        count(*) filter (where k.status = 'order_created') as order_created
      from public.consultations k
      where k.fitter_id = po.id
    ) c on true
    left join lateral (
      select
        count(*) as order_count,
        count(*) filter (where q.status <> 'not_billable') as billable_order_count,
        sum(q.total) filter (where q.status <> 'not_billable') as total_revenue,
        count(*) filter (
          where q.status <> 'not_billable' and coalesce((
            select sum(op.amount) from public.order_payments op where op.order_id = ord.id
          ), 0) >= q.total and q.total > 0
        ) as lunas_count,
        count(*) filter (
          where exists (
            select 1 from public.orders prior
            where prior.customer_id = ord.customer_id and prior.created_at < ord.created_at
          )
        ) as repeat_count
      from public.consultations k
      join public.business_events be on be.consultation_id = k.id and be.event_type = 'order.created'
      join public.orders ord on ord.id = be.order_id
      join public.quotations q on q.order_id = ord.id
      where k.fitter_id = po.id
    ) o on true
    left join lateral (
      select avg(extract(epoch from (ord.created_at - k.created_at)) / 60) as avg_consultation_minutes
      from public.consultations k
      join public.business_events be on be.consultation_id = k.id and be.event_type = 'order.created'
      join public.orders ord on ord.id = be.order_id
      where k.fitter_id = po.id
    ) cm on true
    where po.deleted_at is null and c.total > 0
  )
  select
    fitter_id, nama, divisi, status,
    total_konsultasi, konsultasi_selesai, order_dibuat,
    closing_rate_pct, conversion_rate_pct,
    total_revenue, average_order_value, repeat_customer_pct,
    round(avg_consultation_minutes, 0) as avg_consultation_minutes,
    rank() over (order by total_revenue desc) as ranking
  from base
  order by total_konsultasi desc, nama;
$$;
