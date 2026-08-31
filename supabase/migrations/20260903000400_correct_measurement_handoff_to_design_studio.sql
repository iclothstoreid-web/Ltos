-- Correction to 20260903000300_flip_design_measurement_order.sql
-- (already applied to production — this is a NEW migration on top of it,
-- not an edit to that file).
--
-- That migration flipped record_measurement_decision()'s 'valid' branch to
-- write status = 'review' directly, on the assumption that a validated
-- measurement should hand off straight to Consultation Review. That was
-- wrong: Design Studio has an AI Final Preview step (AIPreviewPanel /
-- "Generate Final Preview") that needs the customer photo Measurement
-- captures, and that step must run (or be explicitly skipped) BEFORE
-- Consultation Review, not be bypassed entirely.
--
-- The corrected flow is:
--   check_in -> Design Studio Fase 1 (Configuration)
--            -> Measurement (+ customer photo)
--            -> Design Studio Fase 2 (Final Preview: Generate or Lewatkan)
--            -> Consultation Review -> order_created
--
-- record_measurement_decision's 'valid' branch now writes status = 'design'
-- again (the exact value it wrote before 20260903000300, and the value
-- resumeRouteForConsultation has always mapped to Design Studio). Design
-- Studio itself (DesignStudioWorkspace, client-side) is what now decides
-- Fase 1 vs Fase 2 from persisted data — see notesCodec.ts's
-- hasDesignBlueprint() and the consultation's `measurements` row — so
-- reusing 'design' here is safe for both new-flow consultations (opens
-- Fase 2, since they have both a saved blueprint and a measurement) and the
-- handful of legacy consultations already sitting at 'design' from before
-- the flow reversal (opens Fase 1, since they have no saved blueprint yet).
--
-- Design Studio Fase 2 exiting (Generate success or Lewatkan) is what now
-- writes status = 'review' — via the existing, already-generic
-- save_design_selections() RPC (p_next_status is a free parameter, no
-- Postgres change needed there).
--
-- No table/column/constraint change, same as 20260903000300.

create or replace function public.record_measurement_decision(
  p_consultation_id uuid,
  p_decision text,
  p_chest numeric,
  p_shoulder numeric,
  p_sleeve numeric,
  p_length numeric,
  p_height_cm integer,
  p_weight_kg numeric,
  p_age_years integer,
  p_measurement_notes text,
  p_event_data jsonb,
  p_next_consultation_notes text,
  p_expected_updated_at timestamptz,
  p_created_by uuid
)
returns timestamptz
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_new_updated_at timestamptz;
begin
  if p_decision not in ('valid', 'remeasure') then
    raise exception 'Unknown decision: %', p_decision;
  end if;

  insert into public.measurements (
    consultation_id, chest, shoulder, sleeve, length, notes, height_cm, weight_kg, age_years
  ) values (
    p_consultation_id, p_chest, p_shoulder, p_sleeve, p_length, p_measurement_notes,
    p_height_cm, p_weight_kg, p_age_years
  );

  if p_decision = 'valid' then
    insert into public.business_events (consultation_id, event_type, event_data, created_by)
    values (p_consultation_id, 'measurement.completed', p_event_data, p_created_by);

    -- Correction: hands off to Design Studio (status = 'design'), which
    -- opens straight into Fase 2 (Final Preview) once it sees both this
    -- measurement and an already-saved blueprint. NOT 'review' directly --
    -- that skipped the Final Preview step entirely.
    update public.consultations
    set status = 'design', notes = p_next_consultation_notes, updated_at = now()
    where id = p_consultation_id and updated_at = p_expected_updated_at
    returning updated_at into v_new_updated_at;
  else
    insert into public.business_events (consultation_id, event_type, event_data, created_by)
    values (p_consultation_id, 'measurement.rejected', p_event_data, p_created_by);

    update public.consultations
    set status = 'measurement', updated_at = now()
    where id = p_consultation_id and updated_at = p_expected_updated_at
    returning updated_at into v_new_updated_at;
  end if;

  if v_new_updated_at is null then
    raise exception 'Data konsultasi ini sudah diubah oleh proses lain sejak terakhir dimuat. Muat ulang halaman sebelum menyimpan lagi.';
  end if;

  return v_new_updated_at;
end;
$function$;
