-- Sprint PS-01.2: Optimistic Conflict Protection
--
-- Scope: prevent lost updates when two users edit the same record
-- concurrently, using `updated_at` (already present on every table touched
-- here) as the freshness check. No new columns, no transactions, no
-- locking — a plain "does the row still look like what I loaded?" guard on
-- each write, same technique already established by
-- updateMasterDataOption() (design_master_options, Sprint PR-05).
--
-- save_pattern_formulation is the one write in the PS-01.2 audit that goes
-- through a SECURITY DEFINER RPC rather than a direct client `.update()`
-- (the kiosk has no login, same reasoning as every RPC in
-- src/lib/production/client.ts) — so its guard has to live here rather than
-- purely in application code. Every other fix in this sprint
-- (consultations.notes, dna_colors) is a direct table update from
-- already-authenticated staff sessions and is guarded client-side instead
-- (see src/lib/consultation/notesSave.ts and src/lib/design/dnaColors.ts) —
-- no SQL change needed for those.

-- Race found: `insert into pattern_formulations (...) on conflict (order_id)
-- do update set ...` blindly overwrites template/pattern_measurements/
-- operator_id with no check that the row hasn't changed since the caller
-- last loaded it. Two pattern operators opening the same order's Formulasi
-- Pola panel around the same time, or a kiosk retry racing a second
-- session's edit, would let the second save silently discard the first's
-- numbers — the append-only pattern_formulation_revisions table means nothing
-- is unrecoverable, but the *current* row (the one every other screen reads)
-- would still show the wrong formulation with no signal to either operator.
--
-- Fix: optional `p_expected_updated_at` (nullable, defaults to null — a
-- null caller, e.g. a future direct DB script, skips the check and behaves
-- exactly as before, so the RPC contract is unchanged for any existing
-- caller that doesn't pass it). When provided, the ON CONFLICT's DO UPDATE
-- only fires if the existing row's updated_at still matches; otherwise the
-- conflicting row is left untouched and RETURNING yields no row, which is
-- how the conflict is detected and reported.
create or replace function public.save_pattern_formulation(
  p_order_id uuid,
  p_template text,
  p_pattern_measurements jsonb,
  p_operator_id uuid,
  p_expected_updated_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_pf_id uuid;
  v_existed boolean;
begin
  select exists (select 1 from public.pattern_formulations where order_id = p_order_id) into v_existed;

  insert into public.pattern_formulations (order_id, template, pattern_measurements, operator_id)
  values (p_order_id, p_template, p_pattern_measurements, p_operator_id)
  on conflict (order_id) do update
    set template = excluded.template,
        pattern_measurements = excluded.pattern_measurements,
        operator_id = excluded.operator_id,
        updated_at = now()
    where p_expected_updated_at is null
       or public.pattern_formulations.updated_at = p_expected_updated_at
  returning id into v_pf_id;

  if v_pf_id is null then
    if v_existed then
      raise exception 'Formulasi Pola ini sudah diubah oleh proses lain sejak terakhir dimuat. Muat ulang sebelum menyimpan lagi.';
    else
      -- Existed briefly between the exists-check and the insert (another
      -- concurrent first-save) but its own attempt already committed a row
      -- for this order — not the caller's conflict to explain generically.
      raise exception 'Formulasi Pola untuk order ini baru saja dibuat oleh proses lain. Muat ulang halaman.';
    end if;
  end if;

  insert into public.pattern_formulation_revisions (pattern_formulation_id, template, pattern_measurements, operator_id)
  values (v_pf_id, p_template, p_pattern_measurements, p_operator_id);
end;
$function$;
