-- Customer Journey Milestone 1 needs order_number/customer_name (already
-- exposed by get_customer_journey_order), plus the order.created snapshot
-- (design/measurement/bodyTags/notes) and enough workflow signal to derive
-- which of the 5 fixed Customer Journey milestones is currently active.
--
-- Read-only, additive, security-definer — same pattern as
-- get_customer_journey_order (20260716000000...): `orders`/`customers`/
-- `business_events`/`production_stage_records` all restrict SELECT to
-- authenticated staff via RLS, so this function runs as its owner to
-- resolve a valid customer_token to the minimum public data needed. No
-- token match means no row; there is no way to enumerate orders through it.
-- Does not modify Business Event or Production data in any way.
create or replace function public.get_customer_journey_snapshot(p_customer_token text)
returns table(
  order_number text,
  customer_name text,
  current_state text,
  latest_stage text,
  event_data jsonb
)
language plpgsql
security definer
set search_path = public
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
    ) as event_data
  from public.orders o
  join public.customers c on c.id = o.customer_id
  where o.id = v_order_id;
end;
$$;

revoke all on function public.get_customer_journey_snapshot(text) from public;
grant execute on function public.get_customer_journey_snapshot(text) to anon, authenticated;
