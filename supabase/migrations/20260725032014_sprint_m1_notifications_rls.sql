-- Sprint M.1 — Security & Operational Integrity, Task 1.
--
-- notifications had RLS disabled since its creation
-- (20260726000000_add_operator_assignment_and_notifications.sql) — fully
-- exposed to anon/authenticated via PostgREST. Every real read/write in the
-- app already goes through SECURITY DEFINER RPCs (assign_stage_operator
-- inserts, list_pending_assignments reads, mark_notification_read updates —
-- all in that same migration), which run as the function owner and are
-- unaffected by RLS, same as commercial_rules/production_rules/
-- production_stage_override_audit_log already do. Confirmed via a full
-- repo grep: zero `.from('notifications')` call sites anywhere in src/.
--
-- Enabling RLS here only closes the direct-table-access hole; it changes
-- nothing about how Notification already works — same RPCs, same UI, same
-- flow.

alter table public.notifications enable row level security;

create policy "All staff can read notifications"
  on public.notifications for select
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()));

comment on table public.notifications is
  'Kiosk-wide "Pekerjaan Baru Ditugaskan" list. Written by assign_stage_operator(), read by list_pending_assignments()/mark_notification_read() — all SECURITY DEFINER, unaffected by RLS. Direct table access (PostgREST) is now restricted to authenticated staff only; no anon policy exists because nothing in the app reads/writes this table directly.';
