-- Correction to 20260913000000_customer_consultation_self_service.sql
-- (already applied to production — this is a NEW migration on top of it,
-- not an edit to that file, same convention as
-- 20260903000400_correct_measurement_handoff_to_design_studio.sql).
--
-- Live QA against the anon RPC surface caught this immediately:
-- save_customer_consultation's RETURNS TABLE declares an output column
-- named `updated_at`, which PL/pgSQL also binds as an implicit variable
-- throughout the function body. Both branches' UPDATE statements then
-- referenced the bare, unqualified column name `updated_at` in their SET/
-- WHERE/RETURNING clauses — Postgres can no longer tell whether that means
-- the OUT parameter or the `consultations.updated_at` column, and every
-- call failed with `42702 column reference "updated_at" is ambiguous`,
-- meaning NO save (design or measurement) could ever succeed.
--
-- Fix: alias `consultations` as `c` in both UPDATE statements and qualify
-- every `updated_at` reference as `c.updated_at`. No shape change — same
-- parameters, same return columns, same behavior otherwise.
create or replace function public.save_customer_consultation(
  p_token text,
  p_section text,
  p_expected_updated_at timestamptz,
  p_design_notes text default null,
  p_design_event_data jsonb default null,
  p_chest numeric default null,
  p_shoulder numeric default null,
  p_sleeve numeric default null,
  p_length numeric default null,
  p_height_cm integer default null,
  p_weight_kg numeric default null,
  p_age_years integer default null,
  p_measurement_notes text default null,
  p_measurement_event_data jsonb default null,
  p_mark_complete boolean default false
)
returns table(updated_at timestamptz, consultation_number text)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_consultation_id uuid;
  v_consultation_number text;
  v_new_updated_at timestamptz;
  v_measurement_id uuid;
begin
  if p_section not in ('design', 'measurement') then
    raise exception 'Unknown section: %', p_section;
  end if;

  if p_design_notes is not null and length(p_design_notes) > 20000 then
    raise exception 'Data desain terlalu besar.';
  end if;
  if p_measurement_notes is not null and length(p_measurement_notes) > 5000 then
    raise exception 'Data ukuran terlalu besar.';
  end if;

  select c.id, c.consultation_number into v_consultation_id, v_consultation_number
  from public.consultations c
  where c.customer_consultation_token = p_token
    and c.customer_link_enabled = true;

  if v_consultation_id is null then
    raise exception 'Link tidak valid atau sudah tidak aktif.';
  end if;

  if p_section = 'design' then
    update public.consultations c
    set notes = coalesce(p_design_notes, c.notes),
        updated_at = now(),
        customer_link_last_opened_at = now()
    where c.id = v_consultation_id
      and c.updated_at = p_expected_updated_at
    returning c.updated_at into v_new_updated_at;

    if v_new_updated_at is null then
      raise exception 'Data konsultasi ini sudah diubah oleh proses lain sejak terakhir dimuat. Muat ulang halaman sebelum menyimpan lagi.';
    end if;

    insert into public.business_events (consultation_id, event_type, event_data)
    values (v_consultation_id, 'customer.design.saved', coalesce(p_design_event_data, '{}'::jsonb));
  else
    update public.consultations c
    set updated_at = now(),
        customer_link_last_opened_at = now(),
        customer_link_completed_at = case when p_mark_complete then now() else c.customer_link_completed_at end
    where c.id = v_consultation_id
      and c.updated_at = p_expected_updated_at
    returning c.updated_at into v_new_updated_at;

    if v_new_updated_at is null then
      raise exception 'Data konsultasi ini sudah diubah oleh proses lain sejak terakhir dimuat. Muat ulang halaman sebelum menyimpan lagi.';
    end if;

    select mm.id into v_measurement_id
    from public.measurements mm
    where mm.consultation_id = v_consultation_id
    order by mm.created_at desc
    limit 1;

    if v_measurement_id is not null then
      update public.measurements
      set chest = p_chest,
          shoulder = p_shoulder,
          sleeve = p_sleeve,
          length = p_length,
          height_cm = p_height_cm,
          weight_kg = p_weight_kg,
          age_years = p_age_years,
          notes = p_measurement_notes
      where id = v_measurement_id;
    else
      insert into public.measurements (
        consultation_id, chest, shoulder, sleeve, length, height_cm, weight_kg, age_years, notes
      ) values (
        v_consultation_id, p_chest, p_shoulder, p_sleeve, p_length, p_height_cm, p_weight_kg, p_age_years, p_measurement_notes
      );
    end if;

    insert into public.business_events (consultation_id, event_type, event_data)
    values (
      v_consultation_id,
      case when p_mark_complete then 'customer.consultation.completed' else 'customer.measurement.saved' end,
      coalesce(p_measurement_event_data, '{}'::jsonb)
    );
  end if;

  return query select v_new_updated_at, v_consultation_number;
end;
$$;

revoke all on function public.save_customer_consultation(
  text, text, timestamptz, text, jsonb, numeric, numeric, numeric, numeric, integer, numeric, integer, text, jsonb, boolean
) from public;
grant execute on function public.save_customer_consultation(
  text, text, timestamptz, text, jsonb, numeric, numeric, numeric, numeric, integer, numeric, integer, text, jsonb, boolean
) to anon, authenticated;
