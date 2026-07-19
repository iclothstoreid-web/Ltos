-- Customer Journey Milestone 2 (Cutting & Sewing) needs to show the
-- customer their own order's real cutting/sewing progress — an actual
-- evidence photo + real date, not a fabricated status. That evidence
-- already exists on production_stage_records (captured by
-- ProductionPacketWorkspace's EvidenceUploader), so this just adds it to
-- the same read-only, security-definer snapshot RPC from
-- 20260717000000_add_customer_journey_snapshot_rpc.sql rather than
-- inventing a new customer-facing photo pipeline.
--
-- Return type is changing (new column), which Postgres does not allow via
-- CREATE OR REPLACE on a RETURNS TABLE function, so it's dropped and
-- recreated here.
drop function if exists public.get_customer_journey_snapshot(text);

create or replace function public.get_customer_journey_snapshot(p_customer_token text)
returns table(
  order_number text,
  customer_name text,
  current_state text,
  latest_stage text,
  event_data jsonb,
  production_updates jsonb
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
    ) as event_data,
    (
      -- One entry per Milestone-2 stage (cutting, sewing), most recent
      -- attempt only (an 'alter' reopens a stage as a fresh attempt row,
      -- so `distinct on` + `attempt desc` picks the current one, same
      -- rule the Production Packet itself uses via getCurrentStageRecord).
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
    ) as production_updates
  from public.orders o
  join public.customers c on c.id = o.customer_id
  where o.id = v_order_id;
end;
$$;

revoke all on function public.get_customer_journey_snapshot(text) from public;
grant execute on function public.get_customer_journey_snapshot(text) to anon, authenticated;
