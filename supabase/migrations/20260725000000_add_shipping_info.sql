-- Phase 2 "Fitter Order Monitoring & Shipping Experience" sprint.
-- Adds courier/tracking capture to the existing Pengiriman (shipping) stage
-- record, following the same pattern as 20260723000000_add_packing_video.sql:
-- extend production_stage_records with plain columns (no new table) and add
-- a narrow, stage-scoped SECURITY DEFINER RPC rather than touching
-- complete_stage()/get_production_packet() (both already pass any new
-- column straight through via row_to_json).

alter table public.production_stage_records
  add column if not exists courier text null,
  add column if not exists tracking_number text null;

create or replace function public.set_shipping_info(
  p_order_id uuid,
  p_stage_record_id uuid,
  p_courier text,
  p_tracking_number text
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_stage text;
begin
  select stage into v_stage
  from public.production_stage_records
  where id = p_stage_record_id and order_id = p_order_id;

  if v_stage is null then
    raise exception 'Stage record not found for this order';
  end if;

  if v_stage <> 'shipping' then
    raise exception 'Shipping info can only be set on the shipping stage';
  end if;

  update public.production_stage_records
  set courier = p_courier,
      tracking_number = p_tracking_number,
      updated_at = now()
  where id = p_stage_record_id;
end;
$$;

-- get_customer_journey_snapshot gains courier/tracking_number (drop+recreate
-- required for a RETURNS TABLE signature change, same as the
-- 20260718000000/20260723000000 migrations before it), sourced from the
-- latest shipping stage record regardless of its status — the Customer
-- Journey page should show these the moment Approve Shipping saves them.
drop function if exists public.get_customer_journey_snapshot(text);

create or replace function public.get_customer_journey_snapshot(p_customer_token text)
returns table(
  order_number text,
  customer_name text,
  current_state text,
  latest_stage text,
  event_data jsonb,
  production_updates jsonb,
  packing_video_url text,
  courier text,
  tracking_number text
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_order_id uuid;
begin
  select o.id into v_order_id from public.orders o where o.customer_token = p_customer_token;

  if v_order_id is null then
    return;
  end if;

  return query
  select
    o.order_number,
    c.name as customer_name,
    o.current_state,
    (
      select psr.stage
      from public.production_stage_records psr
      where psr.order_id = o.id
        and psr.status in ('in_progress', 'completed')
      order by case psr.stage
        when 'shipping' then 8
        when 'packing' then 7
        when 'finishing' then 6
        when 'qc' then 5
        when 'sewing' then 4
        when 'cutting' then 3
        when 'pattern_formulation' then 2
        when 'material_prep' then 1
        else 0
      end desc
      limit 1
    ) as latest_stage,
    (
      select be.event_data
      from public.business_events be
      where be.order_id = o.id and be.event_type = 'order.created'
      order by be.created_at desc
      limit 1
    ) as event_data,
    (
      select coalesce(jsonb_agg(u.entry order by u.stage_order), '[]'::jsonb)
      from (
        select distinct on (psr.stage)
          case psr.stage when 'cutting' then 1 when 'sewing' then 2 end as stage_order,
          jsonb_build_object(
            'stage', psr.stage,
            'status', psr.status,
            'started_at', psr.started_at,
            'completed_at', psr.completed_at,
            'evidence_url', psr.evidence_url,
            'notes', psr.notes
          ) as entry
        from public.production_stage_records psr
        where psr.order_id = o.id
          and psr.stage in ('cutting', 'sewing')
          and psr.status in ('in_progress', 'completed')
        order by psr.stage, psr.attempt desc
      ) u
    ) as production_updates,
    (
      select psr.video_url
      from public.production_stage_records psr
      where psr.order_id = o.id and psr.stage = 'packing'
      order by psr.attempt desc
      limit 1
    ) as packing_video_url,
    (
      select psr.courier
      from public.production_stage_records psr
      where psr.order_id = o.id and psr.stage = 'shipping'
      order by psr.attempt desc
      limit 1
    ) as courier,
    (
      select psr.tracking_number
      from public.production_stage_records psr
      where psr.order_id = o.id and psr.stage = 'shipping'
      order by psr.attempt desc
      limit 1
    ) as tracking_number
  from public.orders o
  join public.customers c on c.id = o.customer_id
  where o.id = v_order_id;
end;
$$;
