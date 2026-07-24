-- Hotfix: Delivery workflow. Confirmed bug (see memory
-- project_ltos_delivered_state_gap) -- orders.current_state='follow_up' is
-- a valid, already-handled value (resolveDeliveryState() in
-- src/lib/journey/milestone.ts treats it as the only signal meaning
-- "Delivered"), but nothing in the app has ever written it. Every order
-- that finishes shipping is stuck showing "Sedang Dikirim" to the customer
-- forever. This migration adds the missing write path only -- no change to
-- the locked 8-stage production workflow, no new milestone, no change to
-- how Customer Journey reads current_state (that logic was already
-- correct).

-- get_production_packet gains current_state (additive jsonb key) so
-- Owner OS can know whether an order is already marked Delivered without a
-- second query.
create or replace function public.get_production_packet(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_order record;
  v_snapshot jsonb;
  v_result jsonb;
  v_sla_working_days integer;
  v_queue_status text;
  v_priority_rank integer;
  v_queue_position integer;
begin
  select id, order_number, created_at, service_level, hari_d, current_state into v_order
  from public.orders where id = p_order_id;

  if v_order.id is null then
    return null;
  end if;

  if not exists (select 1 from public.production_stage_records where order_id = p_order_id) then
    insert into public.production_stage_records (order_id, stage, attempt, status)
    values (p_order_id, 'material_prep', 1, 'pending');
  end if;

  select event_data into v_snapshot
  from public.business_events
  where order_id = p_order_id and event_type = 'order.created'
  order by created_at desc
  limit 1;

  if v_order.service_level is not null and v_order.hari_d is not null then
    select working_days into v_sla_working_days
    from public.service_sla_rules where service_level = v_order.service_level;
  end if;

  select queue_status, priority_rank, queue_position
    into v_queue_status, v_priority_rank, v_queue_position
  from public.compute_queue_snapshot()
  where order_id = p_order_id;

  select jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'created_at', v_order.created_at,
    'current_state', v_order.current_state,
    'service_level', v_order.service_level,
    'hari_d', v_order.hari_d,
    'estimated_completion', case
      when v_order.hari_d is not null and v_sla_working_days is not null
        then (public.add_working_days(v_order.hari_d, v_sla_working_days))::timestamptz
      else v_order.created_at + interval '14 days'
    end,
    'queue_status', v_queue_status,
    'priority_level', v_priority_rank,
    'queue_position', v_queue_position,
    'customer_name', v_snapshot -> 'customer' ->> 'name',
    'design', v_snapshot -> 'design',
    'locked_measurements', v_snapshot -> 'measurement',
    'consultation_notes', v_snapshot ->> 'consultationNotes',
    'stage_records', coalesce((
      select jsonb_agg(
        (row_to_json(r)::jsonb) || jsonb_build_object('operator_name', po.nama)
        order by r.created_at
      )
      from public.production_stage_records r
      left join public.production_operators po on po.id = r.operator_id
      where r.order_id = p_order_id
    ), '[]'::jsonb),
    'pattern_formulation', (
      select row_to_json(pf) from public.pattern_formulations pf where pf.order_id = p_order_id
    ),
    'progress', (
      select round(
        (count(*) filter (where status = 'completed'))::numeric
        / 8.0, 2
      )
      from (
        select distinct on (stage) stage, status
        from public.production_stage_records
        where order_id = p_order_id
        order by stage, attempt desc
      ) latest
    )
  ) into v_result;

  return v_result;
end;
$$;

-- The missing write path. Staff-facing (Owner OS), gated on the shipping
-- stage actually being completed -- can't mark an order Delivered before
-- it was ever shipped. Idempotent: re-calling on an already-'follow_up'
-- order is a harmless no-op, not an error, since staff may double-click.
create or replace function public.mark_order_delivered(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_order public.orders;
  v_shipped boolean;
begin
  select exists (
    select 1 from public.production_stage_records
    where order_id = p_order_id and stage = 'shipping' and status = 'completed'
  ) into v_shipped;

  if not v_shipped then
    raise exception 'Tahap Pengiriman belum selesai — tidak dapat menandai Delivered.';
  end if;

  select * into v_order from public.orders where id = p_order_id;
  if v_order.id is null then
    raise exception 'Order tidak ditemukan.';
  end if;

  if v_order.current_state <> 'follow_up' then
    update public.orders set current_state = 'follow_up' where id = p_order_id;

    insert into public.business_events (order_id, event_type, event_data, created_by)
    values (p_order_id, 'order.delivered', jsonb_build_object('marked_at', now()), auth.uid());
  end if;

  return jsonb_build_object('order_id', p_order_id, 'current_state', 'follow_up');
end;
$$;

-- authenticated only -- unlike the kiosk's read/stage RPCs, this mutates
-- order state and is only ever called from Owner OS (login-gated by
-- middleware), no anon/no-login caller needs it.
grant execute on function public.mark_order_delivered(uuid) to authenticated;
