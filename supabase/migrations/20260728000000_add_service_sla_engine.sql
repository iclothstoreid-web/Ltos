-- Sprint C (backend-only): Service Engine + SLA Engine + Estimated
-- Completion Engine + Service Validation, built directly on Sprint B's
-- foundation (get_operator_capacity, get_production_kpis,
-- production_capacity_calendar). No RPC signatures from Sprint B change.
--
-- Explicitly OUT of scope here (per the locked Sprint C brief): Queue
-- Optimization, Auto Reschedule, AI Prediction, Machine Learning,
-- automation, additional notifications. Working days = Senin-Sabtu
-- (Sunday is the only non-working day) per explicit business confirmation.

-- ============================================================
-- Working-day date math (shared by SLA + Estimated Completion)
-- ============================================================

-- Returns the date that is p_working_days working days AFTER p_start
-- (p_start itself is not counted -- it's "day 0", the day production
-- becomes available, not the first day of the count). Sunday (dow = 0)
-- is skipped; Senin-Sabtu all count, per locked business rule.
create or replace function public.add_working_days(p_start date, p_working_days integer)
returns date
language plpgsql
immutable
as $$
declare
  v_date date := p_start;
  v_remaining integer := p_working_days;
begin
  while v_remaining > 0 loop
    v_date := v_date + 1;
    if extract(dow from v_date) <> 0 then
      v_remaining := v_remaining - 1;
    end if;
  end loop;
  return v_date;
end;
$$;

-- ============================================================
-- SLA Engine: business rule table, not hardcoded in code or UI
-- ============================================================

create table if not exists public.service_sla_rules (
  service_level text primary key check (service_level in ('standard', 'fast', 'very_fast')),
  label text not null,
  working_days integer not null check (working_days > 0),
  updated_at timestamptz not null default now()
);

comment on table public.service_sla_rules is
  'SLA Engine business rule: working days (Senin-Sabtu) allowed per service level. Editable via set_service_sla_rule() -- never hardcode these numbers in application code.';

insert into public.service_sla_rules (service_level, label, working_days) values
  ('standard', 'Standard', 14),
  ('fast', 'Fast', 9),
  ('very_fast', 'Very Fast', 3)
on conflict (service_level) do nothing;

alter table public.service_sla_rules enable row level security;

create policy "All staff can read SLA rules"
  on public.service_sla_rules
  for select
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()));

create or replace function public.get_service_sla_rules()
returns setof public.service_sla_rules
language sql
security definer
set search_path to 'public'
as $$
  select * from public.service_sla_rules order by working_days desc;
$$;

create or replace function public.set_service_sla_rule(p_service_level text, p_working_days integer)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if p_working_days <= 0 then
    raise exception 'working_days must be > 0';
  end if;

  update public.service_sla_rules
  set working_days = p_working_days, updated_at = now()
  where service_level = p_service_level;

  if not found then
    raise exception 'Unknown service_level: %', p_service_level;
  end if;
end;
$$;

-- ============================================================
-- Service Engine: stores the customer's service choice on the order
-- ============================================================

alter table public.orders
  add column if not exists service_level text check (service_level in ('standard', 'fast', 'very_fast')),
  add column if not exists hari_d date,
  add column if not exists service_selected_at timestamptz;

comment on column public.orders.service_level is
  'Service Engine: customer''s chosen service tier. Set only by set_order_service() -- no AI, just the stored choice.';
comment on column public.orders.hari_d is
  'Hari D: the production-available date resolved by resolve_hari_d() at the moment the service was selected, using Sprint B''s production_capacity_calendar. Null until a service has been selected.';

create index if not exists orders_hari_d_idx on public.orders (hari_d) where hari_d is not null;

-- ============================================================
-- Hari D resolution: earliest date with capacity headroom, per Sprint B's
-- production_capacity_calendar foundation. A date with no calendar row is
-- treated as unconfigured/open (the calendar is opt-in, not a hard gate) --
-- consistent with Sprint B leaving the table empty by default. Sunday is
-- never returned (atelier closed). Bounded to a 90-day search window to
-- guarantee termination; returns null if truly no room is found in it.
create or replace function public.resolve_hari_d(p_search_start date default current_date)
returns date
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_date date := p_search_start;
  v_max_orders integer;
  v_committed integer;
  v_attempts integer := 0;
begin
  loop
    v_attempts := v_attempts + 1;
    exit when v_attempts > 90;

    if extract(dow from v_date) = 0 then
      v_date := v_date + 1;
      continue;
    end if;

    select max_orders into v_max_orders
    from public.production_capacity_calendar
    where calendar_date = v_date;

    if v_max_orders is null then
      return v_date;
    end if;

    select count(*) into v_committed
    from public.orders
    where hari_d = v_date;

    if v_committed < v_max_orders then
      return v_date;
    end if;

    v_date := v_date + 1;
  end loop;

  return null;
end;
$$;

-- ============================================================
-- Service Validation: 🟢/🟡/🔴 using Hari D + Capacity + KPI signals only.
-- No AI recommendation -- deterministic thresholds, documented inline.
-- Side-effect free (read-only preview); does not persist anything.
-- ============================================================

create or replace function public.validate_service_selection(p_order_id uuid, p_service_level text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_hari_d date;
  v_calendar_max integer;
  v_calendar_committed integer;
  v_hari_d_status text;
  v_active_operator_count integer;
  v_avg_utilization numeric;
  v_capacity_status text;
  v_total_backlog numeric;
  v_total_capacity numeric;
  v_kpi_ratio numeric;
  v_kpi_status text;
  v_overall text;
  v_reasons jsonb := '[]'::jsonb;
  v_sla_working_days integer;
begin
  if p_service_level not in ('standard', 'fast', 'very_fast') then
    raise exception 'Unknown service_level: %', p_service_level;
  end if;

  if not exists (select 1 from public.orders where id = p_order_id) then
    raise exception 'Order not found';
  end if;

  -- Signal 1: Hari D -- can we find an available production slot at all,
  -- and how full is that day already?
  v_hari_d := public.resolve_hari_d(current_date);
  if v_hari_d is null then
    v_hari_d_status := 'red';
    v_reasons := v_reasons || jsonb_build_array('Tidak ada slot kapasitas tersedia dalam 90 hari ke depan');
  else
    select max_orders into v_calendar_max
    from public.production_capacity_calendar
    where calendar_date = v_hari_d;

    if v_calendar_max is null then
      v_hari_d_status := 'yellow';
      v_reasons := v_reasons || jsonb_build_array('Kapasitas harian belum diatur untuk tanggal ini');
    else
      select count(*) into v_calendar_committed
      from public.orders where hari_d = v_hari_d;

      if v_calendar_committed::numeric / nullif(v_calendar_max, 0) >= 0.8 then
        v_hari_d_status := 'yellow';
        v_reasons := v_reasons || jsonb_build_array('Kapasitas hari tersebut hampir penuh');
      else
        v_hari_d_status := 'green';
      end if;
    end if;
  end if;

  -- Signal 2: Capacity -- operator load, from Sprint B's
  -- get_operator_capacity(). Red if no active operators or average
  -- utilization is already at/over 100%; yellow from 70% up.
  select count(*), avg(utilization_pct)
    into v_active_operator_count, v_avg_utilization
  from public.get_operator_capacity();

  if coalesce(v_active_operator_count, 0) = 0 or coalesce(v_avg_utilization, 0) >= 100 then
    v_capacity_status := 'red';
    v_reasons := v_reasons || jsonb_build_array('Rata-rata operator sudah di atas kapasitas maksimum');
  elsif v_avg_utilization >= 70 then
    v_capacity_status := 'yellow';
    v_reasons := v_reasons || jsonb_build_array('Rata-rata operator mendekati kapasitas maksimum');
  else
    v_capacity_status := 'green';
  end if;

  -- Signal 3: KPI -- total pending/in_progress stage backlog (from Sprint
  -- B's get_production_kpis()) against total active operator capacity.
  select coalesce(sum(value::numeric), 0) into v_total_backlog
  from jsonb_each_text((public.get_production_kpis() ->> 'stage_backlog')::jsonb);

  select coalesce(sum(max_concurrent_capacity), 0) into v_total_capacity
  from public.production_operators where is_active = true;

  if v_total_capacity = 0 then
    v_kpi_status := 'red';
    v_reasons := v_reasons || jsonb_build_array('Tidak ada kapasitas operator aktif untuk menampung antrean');
  else
    v_kpi_ratio := v_total_backlog / v_total_capacity;
    if v_kpi_ratio >= 1.5 then
      v_kpi_status := 'red';
      v_reasons := v_reasons || jsonb_build_array('Antrean produksi jauh melebihi total kapasitas operator');
    elsif v_kpi_ratio >= 1.0 then
      v_kpi_status := 'yellow';
      v_reasons := v_reasons || jsonb_build_array('Antrean produksi mendekati total kapasitas operator');
    else
      v_kpi_status := 'green';
    end if;
  end if;

  v_overall := case
    when 'red' in (v_hari_d_status, v_capacity_status, v_kpi_status) then 'red'
    when 'yellow' in (v_hari_d_status, v_capacity_status, v_kpi_status) then 'yellow'
    else 'green'
  end;

  select working_days into v_sla_working_days
  from public.service_sla_rules where service_level = p_service_level;

  return jsonb_build_object(
    'order_id', p_order_id,
    'service_level', p_service_level,
    'hari_d', v_hari_d,
    'estimated_completion', case when v_hari_d is not null
      then public.add_working_days(v_hari_d, v_sla_working_days)
      else null
    end,
    'overall_status', v_overall,
    'signals', jsonb_build_object(
      'hari_d', v_hari_d_status,
      'capacity', v_capacity_status,
      'kpi', v_kpi_status
    ),
    'reasons', v_reasons
  );
end;
$$;

-- ============================================================
-- Service Engine write path: commits the customer's choice + resolves
-- and locks in Hari D at the same time (a service level without a
-- production slot is meaningless). Logs an order.service_selected
-- business_event -- an audit-trail entry (already read by the existing
-- Riwayat Aktivitas timeline), not a new notification channel.
-- ============================================================

create or replace function public.set_order_service(p_order_id uuid, p_service_level text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_hari_d date;
begin
  if p_service_level not in ('standard', 'fast', 'very_fast') then
    raise exception 'Unknown service_level: %', p_service_level;
  end if;

  if not exists (select 1 from public.orders where id = p_order_id) then
    raise exception 'Order not found';
  end if;

  v_hari_d := public.resolve_hari_d(current_date);
  if v_hari_d is null then
    raise exception 'No production capacity slot available within the search window';
  end if;

  update public.orders
  set service_level = p_service_level,
      hari_d = v_hari_d,
      service_selected_at = now(),
      updated_at = now()
  where id = p_order_id;

  insert into public.business_events (order_id, event_type, event_data)
  values (
    p_order_id,
    'order.service_selected',
    jsonb_build_object('service_level', p_service_level, 'hari_d', v_hari_d)
  );

  return jsonb_build_object(
    'order_id', p_order_id,
    'service_level', p_service_level,
    'hari_d', v_hari_d
  );
end;
$$;

-- ============================================================
-- Estimated Completion Engine: replaces the hardcoded `created_at +
-- interval '14 days'` in get_production_packet with Hari D + SLA Service.
-- Orders that haven't gone through the Service Engine yet (service_level
-- or hari_d still null -- true for every pre-Sprint-C order) keep the old
-- +14 days behavior so the already-shipped Sprint A UI (HeroCard,
-- OrderDetailModal) doesn't regress. This is the only intended difference
-- from the previous get_production_packet body.
-- ============================================================

create or replace function public.get_production_packet(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_order record;
  v_snapshot jsonb;
  v_result jsonb;
  v_sla_working_days integer;
begin
  select id, order_number, created_at, service_level, hari_d into v_order
  from public.orders where id = p_order_id;

  if v_order.id is null then
    return null;
  end if;

  if not exists (select 1 from public.production_stage_records where order_id = p_order_id) then
    insert into public.production_stage_records (order_id, stage, attempt, status)
    values (p_order_id, 'material_prep', 1, 'pending');
  end if;

  select event_data into v_snapshot
  from public.business_events
  where order_id = p_order_id and event_type = 'order.created'
  order by created_at desc
  limit 1;

  if v_order.service_level is not null and v_order.hari_d is not null then
    select working_days into v_sla_working_days
    from public.service_sla_rules where service_level = v_order.service_level;
  end if;

  select jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'created_at', v_order.created_at,
    'service_level', v_order.service_level,
    'hari_d', v_order.hari_d,
    'estimated_completion', case
      when v_order.hari_d is not null and v_sla_working_days is not null
        then (public.add_working_days(v_order.hari_d, v_sla_working_days))::timestamptz
      else v_order.created_at + interval '14 days'
    end,
    'customer_name', v_snapshot -> 'customer' ->> 'name',
    'design', v_snapshot -> 'design',
    'locked_measurements', v_snapshot -> 'measurement',
    'consultation_notes', v_snapshot ->> 'consultationNotes',
    'stage_records', coalesce((
      select jsonb_agg(
        (row_to_json(r)::jsonb) || jsonb_build_object('operator_name', po.nama)
        order by r.created_at
      )
      from public.production_stage_records r
      left join public.production_operators po on po.id = r.operator_id
      where r.order_id = p_order_id
    ), '[]'::jsonb),
    'pattern_formulation', (
      select row_to_json(pf) from public.pattern_formulations pf where pf.order_id = p_order_id
    ),
    'progress', (
      select round(
        (count(*) filter (where status = 'completed'))::numeric
        / 8.0, 2
      )
      from (
        select distinct on (stage) stage, status
        from public.production_stage_records
        where order_id = p_order_id
        order by stage, attempt desc
      ) latest
    )
  ) into v_result;

  return v_result;
end;
$$;
