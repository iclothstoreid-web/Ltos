-- Sprint O.1 — AI Render Performance & Latency Optimization (Task 8).
--
-- Adds the Render Profiler's stage-group breakdown to Render History so
-- every past render's latency can be analyzed, not just the one currently
-- in flight. Purely additive: no existing column changes meaning, no
-- backfill needed (existing rows just have these as null, same as any other
-- historical row predating a new nullable column).
--
-- preprocessing_duration_ms + provider_duration_ms + postprocessing_duration_ms
-- should sum to approximately duration_ms (already on this table) for any
-- row written after this migration ships.

alter table public.render_history
  add column if not exists preprocessing_duration_ms integer,
  add column if not exists provider_duration_ms integer,
  add column if not exists postprocessing_duration_ms integer;
