-- emit_event() and create_queue_task() are leftovers from the pre-refactor
-- queue_assignments/production_steps workflow model. Confirmed (pre-UAT
-- audit + grep of app source and every public.* function body) that their
-- only caller anywhere in the repo is src/components/workspace/QCWorkspace.tsx,
-- which backs the dead src/app/workspace/qc/[orderId] route — unreachable
-- from any real navigation path (ProductionAccessGate always routes to
-- /workspace/production/[orderId] instead). Both were still GRANTed
-- EXECUTE to anon/authenticated as SECURITY DEFINER functions, letting
-- anyone write arbitrary rows into business_events (which Master Data's
-- RULE HAPUS delete-guard and order timelines trust) or queue_assignments
-- without any real caller needing that access. Revoking (not dropping) so
-- the functions/definitions stay intact and reversible if ever needed.
revoke execute on function public.emit_event(uuid, text, jsonb, uuid) from public, anon, authenticated;
revoke execute on function public.create_queue_task(uuid, text, uuid) from public, anon, authenticated;
