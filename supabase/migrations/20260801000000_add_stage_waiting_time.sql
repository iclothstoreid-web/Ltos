-- Sprint F (backend-only): Stage Waiting Time. Audited before writing this --
-- no new table, no new column. Confirmed directly against the live
-- complete_stage()/start_stage()/assign_stage_operator() source in Supabase:
--
-- 1. Next-stage row creation timing: complete_stage() inserts the next
--    stage's attempt row (status='pending') in the same transaction as
--    marking the current stage 'completed' -- both for the normal linear
--    path (stage N+1) and the QC 'alter' rework path (a new attempt of
--    'sewing' or the same stage). So from pattern_formulation onward,
--    created_at is set at the exact moment that stage entered the queue.
--
-- 2. material_prep (the first stage) is the one exception: its row can be
--    created either by get_production_packet()'s auto-insert-if-none-exists
--    (on first fetch, which may lag behind order creation) or by
--    start_stage()'s own insert-if-not-exists fallback (if a kiosk starts
--    the stage before the packet was ever fetched) -- the latter sets
--    created_at = started_at in the same INSERT, reading as a 0-hour wait
--    even if the order had actually been sitting since creation. Accepted
--    approximation, affects only the material_prep bucket's low end.
--
-- 3. started_at is always populated by start_stage() the moment work
--    actually begins -- reliable for every record that has ever been
--    started (in_progress or completed). Still-'pending' records have no
--    started_at and are correctly excluded (their wait hasn't concluded).
--
-- 4. assigned_at is NOT always populated -- only set via the owner's
--    Tugaskan flow (assign_stage_operator) before the operator starts. An
--    operator can scan and start directly with no prior assignment, leaving
--    assigned_at null forever for that record. Reported as a separate,
--    narrower figure below, not folded into the primary queue-wait number.

create or replace function public.get_stage_waiting_time()
returns jsonb
language sql
security definer
set search_path to 'public'
as $$
  select jsonb_build_object(
    -- created_at -> started_at, averaged per stage, over every record
    -- started at least once. Primary Stage Waiting Time figure.
    'avg_queue_wait_hours', (
      select coalesce(jsonb_object_agg(stage, avg_hours), '{}'::jsonb)
      from (
        select stage,
          round(avg(extract(epoch from (started_at - created_at)) / 3600)::numeric, 1) as avg_hours
        from public.production_stage_records
        where started_at is not null
        group by stage
      ) t
    ),
    -- assigned_at -> started_at, only over records that went through the
    -- Tugaskan flow. Secondary figure -- not comparable 1:1 with
    -- avg_queue_wait_hours since it covers a different, smaller population.
    'avg_assignment_wait_hours', (
      select coalesce(jsonb_object_agg(stage, avg_hours), '{}'::jsonb)
      from (
        select stage,
          round(avg(extract(epoch from (started_at - assigned_at)) / 3600)::numeric, 1) as avg_hours
        from public.production_stage_records
        where assigned_at is not null and started_at is not null
        group by stage
      ) t
    ),
    -- Sample size behind each avg_queue_wait_hours bucket, so a stage with
    -- e.g. 1 record isn't read with the same confidence as one with 200.
    'sample_size', (
      select coalesce(jsonb_object_agg(stage, cnt), '{}'::jsonb)
      from (
        select stage, count(*) as cnt
        from public.production_stage_records
        where started_at is not null
        group by stage
      ) t
    )
  );
$$;
