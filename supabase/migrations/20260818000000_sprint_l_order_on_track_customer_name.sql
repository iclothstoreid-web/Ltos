-- Sprint L Phase 6: Order On Track card showed only the order number
-- (ORD-000123) with no customer name. Neither compute_queue_snapshot() nor
-- get_sla_risk_orders() ever joined customers, so this is a real backend
-- change, not a frontend-only fix. Additive column on both (DROP+CREATE
-- since the return table shape changes, same precedent as
-- 20260814000000/20260808000000) -- no other column, filter, or ordering
-- changes.

drop function if exists public.compute_queue_snapshot();

create or replace function public.compute_queue_snapshot()
returns table (
  order_id uuid,
  order_number text,
  customer_name text,
  service_level text,
  hari_d date,
  created_at timestamptz,
  is_on_hold boolean,
  current_stage text,
  current_stage_status text,
  queue_status text,
  priority_rank integer,
  queue_position integer,
  bottleneck_category text,
  target_usage_date date,
  estimation_verdict text
)
language sql
security definer
set search_path to 'public'
as $$
  with stage_seq (stage, ord) as (
    values
      ('material_prep', 1), ('pattern_formulation', 2), ('cutting', 3),
      ('sewing', 4), ('qc', 5), ('finishing', 6), ('packing', 7), ('shipping', 8)
  ),
  latest_attempt as (
    select distinct on (r.order_id, r.stage)
      r.order_id, r.stage, r.status, r.operator_id, r.assigned_operator_id,
      r.courier, r.tracking_number
    from public.production_stage_records r
    order by r.order_id, r.stage, r.attempt desc
  ),
  order_stage_status as (
    select o.id as order_id, ss.stage, ss.ord,
      coalesce(la.status, 'pending') as status,
      la.operator_id, la.assigned_operator_id, la.courier, la.tracking_number
    from public.orders o
    cross join stage_seq ss
    left join latest_attempt la on la.order_id = o.id and la.stage = ss.stage
  ),
  current_per_order as (
    select distinct on (order_id)
      order_id, stage as current_stage, status as current_stage_status,
      operator_id, assigned_operator_id, courier, tracking_number
    from order_stage_status
    where status <> 'completed'
    order by order_id, ord
  ),
  quoted_orders as (
    select distinct order_id from public.quotations
  ),
  operator_capacity as (
    select * from public.get_operator_capacity()
  ),
  latest_event as (
    select distinct on (order_id) order_id, event_data
    from public.business_events
    where event_type = 'order.created' and order_id is not null
    order by order_id, created_at desc
  ),
  classified as (
    select
      o.id as order_id,
      o.order_number,
      c.name as customer_name,
      o.service_level,
      o.hari_d,
      o.created_at,
      o.is_on_hold,
      cpo.current_stage,
      cpo.current_stage_status,
      case
        when o.is_on_hold then 'hold'
        when cpo.current_stage is null then 'completed'
        when cpo.current_stage_status = 'in_progress' then 'in_progress'
        when o.hari_d is not null and o.hari_d > current_date then 'waiting'
        else 'ready'
      end as queue_status,
      case o.service_level
        when 'very_fast' then 1
        when 'fast' then 2
        when 'standard' then 3
        else 4
      end as priority_rank,
      case
        when o.is_on_hold or cpo.current_stage is null then null
        when o.hari_d is not null and o.hari_d > current_date then 'capacity'
        when cpo.current_stage = 'material_prep' and not exists (
          select 1 from quoted_orders qo where qo.order_id = o.id
        ) then 'approval'
        when cpo.current_stage = 'material_prep' then 'material'
        when cpo.current_stage in ('cutting', 'sewing')
          and cpo.assigned_operator_id is null and cpo.operator_id is null
          then 'operator'
        when cpo.current_stage in ('cutting', 'sewing')
          and exists (
            select 1 from operator_capacity oc
            where oc.operator_id = coalesce(cpo.operator_id, cpo.assigned_operator_id)
              and oc.utilization_pct > 100
          ) then 'operator'
        when cpo.current_stage = 'qc' then 'qc'
        when cpo.current_stage = 'finishing' then 'finishing'
        when cpo.current_stage = 'packing' then 'packing'
        when cpo.current_stage = 'shipping'
          and (cpo.courier is null or cpo.tracking_number is null) then 'supplier'
        else null
      end as bottleneck_category,
      nullif(le.event_data -> 'eventInformation' ->> 'targetUsageDate', '')::date as target_usage_date,
      le.event_data -> 'estimationValidation' ->> 'verdict' as estimation_verdict
    from public.orders o
    left join public.customers c on c.id = o.customer_id
    left join current_per_order cpo on cpo.order_id = o.id
    left join latest_event le on le.order_id = o.id
  )
  select
    order_id, order_number, customer_name, service_level, hari_d, created_at, is_on_hold,
    current_stage, current_stage_status, queue_status, priority_rank,
    case when queue_status in ('waiting', 'ready', 'in_progress') then
      (row_number() over (
        partition by (queue_status in ('waiting', 'ready', 'in_progress'))
        order by priority_rank, hari_d nulls last, created_at
      ))::integer
    else null end as queue_position,
    bottleneck_category,
    target_usage_date,
    estimation_verdict
  from classified;
$$;

grant execute on function public.compute_queue_snapshot() to authenticated;

drop function if exists public.get_sla_risk_orders();

create or replace function public.get_sla_risk_orders()
returns table (
  order_id uuid,
  order_number text,
  customer_name text,
  service_level text,
  hari_d date,
  estimated_completion timestamptz,
  queue_status text,
  risk_level text,
  risk_label text,
  hours_remaining numeric,
  business_priority text,
  bottleneck_category text,
  target_usage_date date,
  estimation_verdict text,
  payment_status text,
  priority_rank integer,
  queue_position integer
)
language sql
security definer
set search_path to 'public'
as $$
  with base as (
    select
      q.order_id,
      q.order_number,
      q.customer_name,
      q.service_level,
      q.hari_d,
      q.created_at,
      q.is_on_hold,
      q.queue_status,
      q.priority_rank,
      q.queue_position,
      q.bottleneck_category,
      q.target_usage_date,
      q.estimation_verdict,
      s.working_days as sla_working_days,
      (public.get_order_invoice(q.order_id) ->> 'payment_status') as payment_status
    from public.compute_queue_snapshot() q
    left join public.service_sla_rules s on s.service_level = q.service_level
    where q.queue_status <> 'completed'
  ),
  computed as (
    select
      order_id, order_number, customer_name, service_level, hari_d, queue_status, is_on_hold,
      priority_rank, queue_position, bottleneck_category, target_usage_date,
      estimation_verdict, payment_status,
      case
        when hari_d is not null and sla_working_days is not null
          then (public.add_working_days(hari_d, sla_working_days))::timestamptz
        else created_at + interval '14 days'
      end as estimated_completion,
      case
        when hari_d is not null then hari_d::timestamptz
        else created_at
      end as window_start
    from base
  ),
  risk as (
    select
      *,
      case
        when estimated_completion <= now() then 'over_sla'
        when extract(epoch from (estimated_completion - now()))
          / nullif(extract(epoch from (estimated_completion - window_start)), 0) <= 0.2
          then 'risk'
        else 'on_track'
      end as risk_level
    from computed
  )
  select
    order_id,
    order_number,
    customer_name,
    service_level,
    hari_d,
    estimated_completion,
    queue_status,
    risk_level,
    case risk_level
      when 'over_sla' then '🔴 Over SLA'
      when 'risk' then '🟡 Risk'
      else '🟢 On Track'
    end as risk_label,
    round((extract(epoch from (estimated_completion - now())) / 3600)::numeric, 1) as hours_remaining,
    case
      when is_on_hold then null
      when estimation_verdict = 'IMPOSSIBLE' or risk_level = 'over_sla' then 'critical'
      when risk_level = 'risk' or estimation_verdict = 'RISK'
        or (priority_rank <= 2 and payment_status = 'belum_dibayar') then 'high'
      else 'normal'
    end as business_priority,
    bottleneck_category,
    target_usage_date,
    estimation_verdict,
    payment_status,
    priority_rank,
    queue_position
  from risk
  order by estimated_completion;
$$;

grant execute on function public.get_sla_risk_orders() to authenticated;
