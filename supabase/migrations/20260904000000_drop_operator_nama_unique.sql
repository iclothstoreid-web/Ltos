-- Sprint: Operator Management fix — allow duplicate operator names.
--
-- Root cause of "Gagal menambah operator" when adding a second operator with
-- an existing name: production_operators carried a table-level
-- UNIQUE (nama) constraint (production_operators_nama_key) from the original
-- table definition, which predates the tracked migration history. Operator
-- identity is production_operators.id (uuid) everywhere in the codebase —
-- name was never meant to be a key. Two operators legitimately share a name
-- when they work different divisions
-- (e.g. "Deka — Persiapan Material" and "Deka — Cutting").
--
-- This drops that constraint only. No column, data, trigger, policy, or
-- other index change. The two RPCs that touch this table on insert keep
-- their current, deliberately different behaviors:
--
--   * create_operator()  — Owner's manual "Tambah Operator" path. Already a
--     plain INSERT, so it starts allowing duplicate names the moment the
--     constraint is gone. This is the intended "always insert a new record"
--     path (identity = new uuid).
--   * upsert_operator()  — kiosk "+ Tambah operator baru" inline path, used
--     only by OperatorAutocomplete. DELIBERATELY LEFT UNCHANGED: it still
--     resolves an existing operator by lower(nama) and returns that row's
--     id when one matches, which is the correct behavior for the
--     scan-as-you-type flow (reuse the operator already on file, don't
--     silently fork a duplicate). Manual creation and kiosk name-reuse stay
--     separate behaviors keyed off separate RPCs.

alter table public.production_operators
  drop constraint if exists production_operators_nama_key;
