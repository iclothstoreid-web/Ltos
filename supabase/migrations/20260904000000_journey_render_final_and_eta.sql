-- ============================================================
-- Journey P0 + P1 — Render Final hero image + Production ETA
--
-- P0: expose the current APPROVED Render Final (render_finals,
-- render-finals bucket) to the public Customer Journey RPC, and add a
-- narrowly-scoped storage.objects SELECT policy so an unauthenticated
-- customer request can obtain a signed URL for it. Draft renders remain
-- completely inaccessible to anon (existing staff-only policies untouched).
--
-- P1: expose estimated_completion, computed with the exact same formula
-- get_production_packet already uses (add_working_days over
-- service_sla_rules, falling back to created_at + 14 days) -- no new
-- engine, just surfacing Production's existing SLA calculation.
--
-- Everything else in get_customer_journey_snapshot (all pre-existing
-- subqueries) is preserved byte-for-byte.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Storage: allow signing an APPROVED render-finals object without a
--    staff session. Scope is exactly "this object path has an approved
--    render_finals row" -- drafts, and any path with no row at all, stay
--    refused. Existing staff INSERT/UPDATE/SELECT policies are untouched.
-- ------------------------------------------------------------
create policy "Public can read approved render finals"
on storage.objects for select
to public
using (
  bucket_id = 'render-finals'
  and exists (
    select 1 from public.render_finals rf
    where rf.render_storage_path = storage.objects.name
      and rf.render_status = 'approved'
  )
);

-- ------------------------------------------------------------
-- 2. RPC: add render_storage_path (approved-only, else null) and
--    estimated_completion. Return column list changes, so this requires
--    DROP + CREATE rather than a plain CREATE OR REPLACE.
-- ------------------------------------------------------------
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
   tracking_number text,
   render_storage_path text,
   estimated_completion timestamptz
 )
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
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
    ) as tracking_number,
    -- P0: only the current consultation's render, and only once approved
    -- (never a draft) -- matches "gunakan render final yang sudah
    -- disetujui (approved)".
    (
      select rf.render_storage_path
      from public.business_events be
      join public.render_finals rf on rf.consultation_id = be.consultation_id
      where be.order_id = o.id and be.event_type = 'order.created'
        and rf.render_status = 'approved'
      order by be.created_at desc
      limit 1
    ) as render_storage_path,
    -- P1: identical formula to get_production_packet's estimated_completion
    -- -- no new engine, just surfacing the same SLA calculation here too.
    case
      when o.hari_d is not null then
        coalesce(
          (
            select (public.add_working_days(o.hari_d, ssr.working_days))::timestamptz
            from public.service_sla_rules ssr
            where ssr.service_level = o.service_level
          ),
          o.created_at + interval '14 days'
        )
      else o.created_at + interval '14 days'
    end as estimated_completion
  from public.orders o
  join public.customers c on c.id = o.customer_id
  where o.id = v_order_id;
end;
$function$;

grant execute on function public.get_customer_journey_snapshot(text) to anon, authenticated;
