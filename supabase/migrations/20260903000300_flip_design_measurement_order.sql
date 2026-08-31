-- Sprint: SELL FIRST -> MEASURE AFTER (flow-order reversal)
--
-- The main Consultation flow moves from
--   check_in -> measurement -> design -> review -> order_created
-- to
--   check_in -> design -> measurement -> review -> order_created
--
-- Routing/status-write changes for this live entirely in TypeScript
-- (resumeRouteForConsultation, DesignStudioWorkspace.persist,
-- MeasurementWorkspace.handleDecision) because save_design_selections()
-- already takes its target status as a free `p_next_status` parameter --
-- no DB change needed there.
--
-- record_measurement_decision() is the one exception: its 'valid' branch
-- hard-codes the next status as 'design' (correct under the OLD order,
-- where a validated measurement used to hand off to Design Studio). Under
-- the new order Measurement now comes AFTER Design Studio, so a validated
-- measurement must hand off to Consultation Review instead. Everything
-- else in the function (params, the 'remeasure' branch, the optimistic
-- lock, the business_events insert) is unchanged.
--
-- No table/column/constraint change -- the 7-value consultations_status_
-- check enum is untouched, and every existing status value keeps meaning
-- exactly what it already means for consultations already sitting in that
-- status (see resumeRouteForConsultation's updated comment for the
-- backward-compat mapping): this migration only changes what a *new*
-- valid-measurement decision writes going forward.

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

    -- Flow-order reversal: a validated measurement now hands off to
    -- Consultation Review (design selections were already made earlier),
    -- not to Design Studio.
    update public.consultations
    set status = 'review', notes = p_next_consultation_notes, updated_at = now()
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
