-- Customer Self-Service Consultation Link.
--
-- Lets a Fitter send a customer (e.g. out of town) a unique link so they can
-- pick their own design and fill in their own measurements against the SAME
-- consultation the Fitter already created at check-in — no new
-- consultation/order, no login. Mirrors the existing Customer Journey
-- pattern (20260716000000_add_customer_token_and_journey_lookup.sql /
-- 20260717000000_add_customer_journey_snapshot_rpc.sql): a dedicated public
-- token column + SECURITY DEFINER RPCs, anon/authenticated grant only on the
-- RPCs, never on the raw tables.
--
-- customer_consultation_token is deliberately its OWN column, separate from
-- orders.customer_token (Customer Journey) — that token only exists once an
-- Order has been created, long after this link needs to work, and reusing
-- consultations.id as the public identifier would let a URL enumerate/guess
-- other consultations by id.

alter table public.consultations
  add column if not exists customer_consultation_token text,
  add column if not exists customer_link_enabled boolean not null default true,
  add column if not exists customer_link_last_opened_at timestamptz,
  add column if not exists customer_link_completed_at timestamptz;

-- Cryptographically-random, unguessable, DB-side generator — same
-- gen_random_uuid() primitive orders.customer_token already relies on
-- (20260716000000), doubled up (two v4 UUIDs concatenated, ~244 bits of
-- randomness) since this token grants read+write access to a live
-- consultation, not just read-only order status.
create or replace function public.generate_customer_consultation_token()
returns text
language sql
as $$
  select replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
$$;

-- DB default — so the token is minted automatically for every future
-- consultation insert regardless of caller (createConsultationSession in
-- src/app/workspace/check-in/actions.ts, or any future caller), the same
-- "automatic, not app-code-dependent" guarantee consultation_number already
-- has via generate_consultation_number().
alter table public.consultations
  alter column customer_consultation_token set default public.generate_customer_consultation_token();

-- Backfill only consultations whose workflow is still active — a
-- terminal consultation (order_created/cancelled) has nothing left for a
-- customer link to usefully do, and per the brief this backfill is
-- "jika diperlukan" (only where still needed), not blanket.
update public.consultations
set customer_consultation_token = public.generate_customer_consultation_token()
where customer_consultation_token is null
  and status not in ('order_created', 'cancelled');

-- Partial unique index (not a NOT NULL + UNIQUE column constraint) because
-- terminal old consultations are deliberately left with a null token above.
create unique index if not exists consultations_customer_consultation_token_key
  on public.consultations (customer_consultation_token)
  where customer_consultation_token is not null;

-- ---------------------------------------------------------------------
-- A. get_customer_consultation_snapshot(p_token) — the only way an
-- anonymous customer link reads consultation data. Returns exactly what
-- Step 1-3 of the customer flow need and nothing else: no consultation id
-- (never exposed to the browser — the token itself is the only identifier
-- the client ever holds), no full address, no created_by, no fitter
-- identity, no business_events, no payment/order/production data. `notes`
-- and the latest `measurements` row are returned RAW (not decoded) — the
-- Next.js Server Component at /customer-consultation/[token] decodes only
-- the Design Blueprint + measurement-extras marker blocks server-side and
-- discards the rest (Fitter Enhancements, Event Information, any human
-- measurement notes) before ever building client props, so this function
-- only needs to enforce access, not redact content.
--
-- A disabled link (customer_link_enabled = false) is treated identically to
-- an invalid token — both resolve to "no row" here, and the page renders
-- the same generic invalid state, per the brief.
create or replace function public.get_customer_consultation_snapshot(p_token text)
returns table(
  consultation_number text,
  customer_name text,
  status text,
  updated_at timestamptz,
  link_completed_at timestamptz,
  notes text,
  measurement_chest numeric,
  measurement_shoulder numeric,
  measurement_sleeve numeric,
  measurement_length numeric,
  measurement_height_cm integer,
  measurement_weight_kg numeric,
  measurement_age_years integer,
  measurement_notes text
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_consultation_id uuid;
begin
  select c.id into v_consultation_id
  from public.consultations c
  where c.customer_consultation_token = p_token
    and c.customer_link_enabled = true;

  if v_consultation_id is null then
    return;
  end if;

  -- "Link belum dibuka" -> "Sedang diisi" status signal for the Fitter side
  -- (Step 5 status list). A read-only GET is what "opened" means here; the
  -- write-side function below only ever advances customer_link_completed_at.
  update public.consultations
  set customer_link_last_opened_at = now()
  where id = v_consultation_id;

  return query
  select
    c.consultation_number,
    cu.name,
    c.status,
    c.updated_at,
    c.customer_link_completed_at,
    c.notes,
    m.chest,
    m.shoulder,
    m.sleeve,
    m.length,
    m.height_cm,
    m.weight_kg,
    m.age_years,
    m.notes
  from public.consultations c
  join public.customers cu on cu.id = c.customer_id
  left join lateral (
    select mm.chest, mm.shoulder, mm.sleeve, mm.length, mm.height_cm, mm.weight_kg, mm.age_years, mm.notes
    from public.measurements mm
    where mm.consultation_id = c.id
    order by mm.created_at desc
    limit 1
  ) m on true
  where c.id = v_consultation_id;
end;
$$;

revoke all on function public.get_customer_consultation_snapshot(text) from public;
grant execute on function public.get_customer_consultation_snapshot(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- B. save_customer_consultation(...) — the only way an anonymous customer
-- link writes consultation data. One function (per the brief's naming),
-- branching on p_section so it can enforce two different, narrow write
-- shapes instead of one loose one:
--
--   p_section = 'design'      -> consultations.notes only (a full,
--                                 pre-merged notes string built server-side
--                                 by encodeDesignNotes/customer-note codec —
--                                 see actions.ts; this function does not
--                                 know about marker-block format at all)
--   p_section = 'measurement' -> the latest `measurements` row only
--                                 (upsert: update the existing latest row
--                                 for this consultation if one exists, else
--                                 insert), optionally stamping
--                                 customer_link_completed_at
--
-- Neither branch ever touches fitter_id, customer_id, created_by,
-- consultations.status, price/payment/order/production columns, or
-- internal-notes marker blocks (Fitter Enhancements / Event Information) —
-- those simply aren't columns this function writes to. Optimistic lock via
-- consultations.updated_at, same "sudah diubah oleh proses lain" contract
-- as record_measurement_decision/save_design_selections
-- (src/lib/consultation/notesSave.ts) so the client's existing
-- StaleConsultationError handling pattern applies unchanged.
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

  -- Basic payload-size guards (defense in depth — the primary limit is
  -- enforced server-side in the Next.js action before this is ever called).
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
    update public.consultations
    set notes = coalesce(p_design_notes, notes),
        updated_at = now(),
        customer_link_last_opened_at = now()
    where id = v_consultation_id
      and updated_at = p_expected_updated_at
    returning updated_at into v_new_updated_at;

    if v_new_updated_at is null then
      raise exception 'Data konsultasi ini sudah diubah oleh proses lain sejak terakhir dimuat. Muat ulang halaman sebelum menyimpan lagi.';
    end if;

    insert into public.business_events (consultation_id, event_type, event_data)
    values (v_consultation_id, 'customer.design.saved', coalesce(p_design_event_data, '{}'::jsonb));
  else
    update public.consultations
    set updated_at = now(),
        customer_link_last_opened_at = now(),
        customer_link_completed_at = case when p_mark_complete then now() else customer_link_completed_at end
    where id = v_consultation_id
      and updated_at = p_expected_updated_at
    returning updated_at into v_new_updated_at;

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
