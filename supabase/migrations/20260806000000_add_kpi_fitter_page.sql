-- Sprint K (LOCK V1): KPI Fitter dedicated page.
--
-- get_fitter_kpi_list/get_fitter_kpi_detail (20260804000001) only returned
-- consultation/order-created counts + one conversion rate. The brief wants a
-- full KPI Fitter page: Consultation, Closing, Conversion, Revenue, Average
-- Order, Repeat Customer, Consultation Time, Ranking, History. Everything
-- below composes existing tables only (consultations, business_events,
-- orders, quotations, order_payments) -- no new table, no new tracking.
--
-- Metric definitions (reusing existing columns only):
--   closing_rate_pct    = consultation -> order created (this is the OLD
--                         conversion_rate_pct, renamed for clarity now that
--                         a second, distinct conversion metric exists)
--   conversion_rate_pct = order created -> payment_status 'lunas' (paid in
--                         full), reusing the Commercial Engine's
--                         quotations/order_payments
--   total_revenue / average_order_value = sum/avg of quotations.total for
--                         orders traced back to this fitter's consultations
--   repeat_customer_pct = % of this fitter's converted orders whose customer
--                         already had a prior order (by created_at) before it
--   avg_consultation_minutes = avg minutes between consultation.created_at
--                         and the resulting order's created_at -- a proxy,
--                         since consultations has no session start/end
--                         timestamp of its own
--   ranking             = rank() over the fitter list ordered by revenue desc
--
-- Order <-> consultation linkage reuses the existing pattern from
-- get_production_customer_notes (20260724000000): business_events rows with
-- event_type = 'order.created' carry both consultation_id and order_id --
-- there is no direct consultation_id column on orders.

create index if not exists idx_business_events_consultation_event
  on public.business_events(consultation_id, event_type);

create index if not exists idx_orders_customer_created
  on public.orders(customer_id, created_at);

-- Return columns changed (new metrics added, conversion_rate_pct's meaning
-- split into closing_rate_pct + a new conversion_rate_pct) -- CREATE OR
-- REPLACE cannot change a function's OUT-parameter row type, must drop first.
drop function if exists public.get_fitter_kpi_list();

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
      case when coalesce(o.order_count, 0) = 0 then null
        else round(o.total_revenue / o.order_count, 0)
      end as average_order_value,
      case when coalesce(o.order_count, 0) = 0 then null
        else round(coalesce(o.lunas_count, 0)::numeric / o.order_count * 100, 1)
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
        sum(q.total) as total_revenue,
        count(*) filter (
          where coalesce((
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

create or replace function public.get_fitter_kpi_detail(p_fitter_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_operator public.production_operators;
  v_kpi record;
  v_result jsonb;
begin
  select * into v_operator from public.production_operators where id = p_fitter_id;
  if v_operator.id is null then
    raise exception 'Fitter tidak ditemukan.';
  end if;

  select * into v_kpi from public.get_fitter_kpi_list() where fitter_id = p_fitter_id;

  select jsonb_build_object(
    'fitter_id', v_operator.id,
    'nama', v_operator.nama,
    'divisi', v_operator.divisi,
    'status', v_operator.status,
    'total_konsultasi', coalesce(v_kpi.total_konsultasi, 0),
    'konsultasi_selesai', coalesce(v_kpi.konsultasi_selesai, 0),
    'order_dibuat', coalesce(v_kpi.order_dibuat, 0),
    'closing_rate_pct', v_kpi.closing_rate_pct,
    'conversion_rate_pct', v_kpi.conversion_rate_pct,
    'total_revenue', coalesce(v_kpi.total_revenue, 0),
    'average_order_value', v_kpi.average_order_value,
    'repeat_customer_pct', v_kpi.repeat_customer_pct,
    'avg_consultation_minutes', v_kpi.avg_consultation_minutes,
    'ranking', v_kpi.ranking,
    'riwayat_konsultasi', coalesce((
      select jsonb_agg(row_to_json(recent) order by recent.created_at desc)
      from (
        select
          k.id,
          k.consultation_number,
          k.status,
          k.created_at,
          cu.name as customer_name
        from public.consultations k
        left join public.customers cu on cu.id = k.customer_id
        where k.fitter_id = p_fitter_id
        order by k.created_at desc
        limit 20
      ) recent
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.get_fitter_kpi_list() to authenticated;
grant execute on function public.get_fitter_kpi_detail(uuid) to authenticated;
