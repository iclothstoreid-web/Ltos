-- Phase 2 (Customer Experience Media Pipeline) REVISION: Packing Video is an
-- attribute of production_stage_records, not a new entity. No new table.
--
-- get_production_packet builds stage_records via row_to_json(r), so this new
-- column flows to the client automatically -- that RPC is NOT touched.
-- complete_stage is also NOT touched -- uploading a video is a separate
-- action from completing the stage, written via the new set_packing_video
-- RPC below instead.
alter table public.production_stage_records
  add column if not exists video_url text null;

-- Security Definer, mirrors complete_stage's open-kiosk model (no
-- auth.uid() -- the kiosk has no login session -- scoped instead by the
-- unguessable order_id/stage_record_id pair). Only writes video_url when
-- the target record's stage is 'packing'; anything else raises instead of
-- silently no-op'ing.
create or replace function public.set_packing_video(
  p_order_id uuid,
  p_stage_record_id uuid,
  p_video_url text
)
returns void
language plpgsql
security definer
set search_path = public
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

  if v_stage <> 'packing' then
    raise exception 'Packing video can only be set on the packing stage';
  end if;

  update public.production_stage_records
  set video_url = p_video_url,
      updated_at = now()
  where id = p_stage_record_id;
end;
$$;

revoke all on function public.set_packing_video(uuid, uuid, text) from public;
grant execute on function public.set_packing_video(uuid, uuid, text) to anon, authenticated;

-- Separate bucket from production-evidence, per the brief. Same open-kiosk
-- policy shape as production-evidence (see remote: public bucket, INSERT-only
-- policy -- public buckets serve GET without needing a SELECT policy).
-- Size/mime enforced at the bucket level too, matching the client-side
-- 50MB/mp4/mov cap in lib/production/packingVideo.ts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'production-packing-video',
  'production-packing-video',
  true,
  52428800,
  array['video/mp4', 'video/quicktime']
)
on conflict (id) do nothing;

create policy "Kiosk can upload packing video"
  on storage.objects for insert
  with check (bucket_id = 'production-packing-video');

-- Customer Journey Milestone 4 needs the real Packing Video, read-only, once
-- uploaded -- no second upload from Journey. Reads production_stage_records
-- directly (largest Packing attempt), no new table involved. Return type
-- changes again so drop + recreate, same as
-- 20260718000000_add_customer_journey_production_updates.sql did.
drop function if exists public.get_customer_journey_snapshot(text);

create or replace function public.get_customer_journey_snapshot(p_customer_token text)
returns table(
  order_number text,
  customer_name text,
  current_state text,
  latest_stage text,
  event_data jsonb,
  production_updates jsonb,
  packing_video_url text
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
    ) as packing_video_url
  from public.orders o
  join public.customers c on c.id = o.customer_id
  where o.id = v_order_id;
end;
$$;

revoke all on function public.get_customer_journey_snapshot(text) from public;
grant execute on function public.get_customer_journey_snapshot(text) to anon, authenticated;
