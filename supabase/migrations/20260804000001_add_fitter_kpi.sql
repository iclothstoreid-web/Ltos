-- Sprint K: Fitter KPI
--
-- "Pilih fitter sebelum konsultasi. Semua consultation menjadi KPI fitter."
-- A Fitter is just a production_operators row (reused, not a new table) —
-- same pattern as every other kiosk operator picker in this app. Check-In
-- now records who actually ran the consultation (fitter_id) separately from
-- consultations.created_by (the logged-in auth account, which may be a
-- shared kiosk login), mirroring how Production already separates
-- operator_id from the logged-in-less kiosk.

alter table public.consultations
  add column if not exists fitter_id uuid references public.production_operators(id);

create index if not exists idx_consultations_fitter_id on public.consultations(fitter_id);

-- Daftar Fitter (KPI Operator Center gains a "KPI Fitter" tab) — total
-- konsultasi, konsultasi yang menjadi Order, dan conversion rate per fitter.
-- Composes existing tables only, no new aggregation table.
create or replace function public.get_fitter_kpi_list()
returns table(
  fitter_id uuid,
  nama text,
  divisi text,
  status text,
  total_konsultasi bigint,
  konsultasi_selesai bigint,
  order_dibuat bigint,
  conversion_rate_pct numeric
)
language sql
security definer
set search_path to 'public'
as $$
  select
    po.id,
    po.nama,
    po.divisi,
    po.status,
    coalesce(c.total, 0) as total_konsultasi,
    coalesce(c.selesai, 0) as konsultasi_selesai,
    coalesce(c.order_created, 0) as order_dibuat,
    case when coalesce(c.total, 0) = 0 then null
      else round(coalesce(c.order_created, 0)::numeric / c.total * 100, 1)
    end as conversion_rate_pct
  from public.production_operators po
  join lateral (
    select
      count(*) as total,
      count(*) filter (where k.status <> 'check_in') as selesai,
      count(*) filter (where k.status = 'order_created') as order_created
    from public.consultations k
    where k.fitter_id = po.id
  ) c on true
  where po.deleted_at is null and c.total > 0
  order by c.total desc, po.nama;
$$;

-- Detail Fitter (drill-down modal) — profile + recent consultations list.
create or replace function public.get_fitter_kpi_detail(p_fitter_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_operator public.production_operators;
  v_result jsonb;
begin
  select * into v_operator from public.production_operators where id = p_fitter_id;
  if v_operator.id is null then
    raise exception 'Fitter tidak ditemukan.';
  end if;

  select jsonb_build_object(
    'fitter_id', v_operator.id,
    'nama', v_operator.nama,
    'divisi', v_operator.divisi,
    'status', v_operator.status,
    'total_konsultasi', (select count(*) from public.consultations where fitter_id = p_fitter_id),
    'konsultasi_selesai', (
      select count(*) from public.consultations where fitter_id = p_fitter_id and status <> 'check_in'
    ),
    'order_dibuat', (
      select count(*) from public.consultations where fitter_id = p_fitter_id and status = 'order_created'
    ),
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
