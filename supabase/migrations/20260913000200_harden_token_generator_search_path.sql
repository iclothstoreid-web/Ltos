-- Supabase's security advisor flagged generate_customer_consultation_token()
-- (20260913000000) with function_search_path_mutable — it had no `set
-- search_path`, so its schema resolution could in principle be influenced
-- by the calling role's search_path setting. Low real-world risk here (the
-- function only calls gen_random_uuid(), a pg_catalog builtin, never a
-- schema-qualified table/function), but trivial to close, so closing it —
-- same defense-in-depth every other function in this migration already has.
--
-- The two SECURITY DEFINER anon-executable warnings on
-- get_customer_consultation_snapshot / save_customer_consultation are NOT
-- fixed here — they are the intended design (an anonymous customer link
-- must be able to call them) and match the already-accepted precedent of
-- get_customer_journey_snapshot (20260717000000), which trips the exact
-- same advisor rule.
create or replace function public.generate_customer_consultation_token()
returns text
language sql
set search_path to 'public'
as $$
  select replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
$$;
