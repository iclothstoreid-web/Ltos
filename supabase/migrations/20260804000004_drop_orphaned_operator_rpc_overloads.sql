-- Sprint K final consistency audit finding: 20260804000000 changed
-- search_operators/upsert_operator/list_active_operators from
-- zero/one-arg to one/two-arg (added p_divisi). Postgres treats a
-- different argument list as a DIFFERENT function, so `create or replace`
-- created a second overload instead of replacing the pre-existing
-- (pre-migration-folder baseline) zero/one-arg versions — leaving two
-- ambiguous candidates for the old call shape, which risks a "function is
-- not unique" runtime error from PostgREST. Drop the now-orphaned
-- originals; the p_divisi-having versions (default null) are strict
-- supersets and already the only ones any wrapper in src/lib/production/
-- and src/lib/fitter/ calls.
drop function if exists public.search_operators(text);
drop function if exists public.upsert_operator(text);
drop function if exists public.list_active_operators();
