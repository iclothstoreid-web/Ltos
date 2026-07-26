-- Sprint Maintenance: Full Operational Data Reset
-- Executed 2026-07-26 against production project ltos-v1 (vdgkbzpdgmlzyxaiznka)
-- Purpose: clear all development/testing transactional data so the database
-- reflects a fresh production install. Master data, business rules, operators,
-- auth/profiles, and all schema/RPC/RLS objects are untouched.
--
-- Row counts deleted (matched pre-reset live counts exactly, verified post-run):
--   business_events 131, communication_messages 11, consultations 60, customers 51,
--   material_stock_movements 5, measurements 34, orders 28, pattern_formulation_revisions 14,
--   pattern_formulations 8, production_stage_records 70, quotations 3
--   (order_payments, workflow_transitions, production_stage_override_audit_log, notifications,
--    queue_assignments, production_steps, capacity_override_audit_log,
--    production_capacity_calendar were already empty)
--
-- Deletion order follows FK dependency graph (children before parents) so no
-- constraint is ever disabled and no orphan can be produced.
-- A full JSON snapshot of every deleted row was taken beforehand and kept
-- locally (not in git, contains customer PII).

BEGIN;

DELETE FROM order_payments;
DELETE FROM workflow_transitions;
DELETE FROM production_stage_override_audit_log;
DELETE FROM notifications;
DELETE FROM pattern_formulation_revisions;
DELETE FROM communication_messages;
DELETE FROM material_stock_movements;
DELETE FROM measurements;
DELETE FROM queue_assignments;
DELETE FROM production_steps;
DELETE FROM capacity_override_audit_log;
DELETE FROM production_stage_records;
DELETE FROM pattern_formulations;
DELETE FROM business_events;
DELETE FROM quotations;
DELETE FROM orders;
DELETE FROM consultations;
DELETE FROM customers;
DELETE FROM production_capacity_calendar;

COMMIT;

-- Storage objects in buckets tied to the wiped rows (consultation-documents,
-- consultation-photos, production-evidence, production-packing-video) were also
-- purged (70 objects total), via the Storage API escape hatch below — direct
-- DELETE on storage.objects is blocked by storage.protect_objects_delete unless
-- this session flag is set:
--
-- BEGIN;
-- SET LOCAL storage.allow_delete_query = 'true';
-- DELETE FROM storage.objects
-- WHERE bucket_id IN ('consultation-documents','consultation-photos','production-evidence','production-packing-video');
-- COMMIT;
