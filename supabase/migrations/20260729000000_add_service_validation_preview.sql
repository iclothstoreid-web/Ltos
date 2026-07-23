-- Sprint C (frontend wiring): adds the one thing the Sprint C backend
-- (20260728000000_add_service_sla_engine.sql) couldn't support yet -- a
-- live 🟢/🟡/🔴 preview *before* an order exists. validate_service_selection
-- requires an existing order_id, but the Fitter picks a service level during
-- Consultation Review, before Create Order has run. Rather than relax that
-- function's contract (it's correctly order-scoped for its real caller),
-- this migration extracts its signal computation into a shared helper and
-- adds a new, additive preview RPC on top of it.
--
-- No existing RPC signature or return shape changes. validate_service_selection
-- keeps the exact same inputs/outputs; its body is refactored to delegate to
-- the new helper instead of duplicating the signal logic.
--
-- Still explicitly OUT of scope: Queue Optimization, Auto Reschedule, AI
-- Prediction, Machine Learning, automation, additional notifications.

-- ============================================================
-- Shared signal computation (Hari D + Capacity + KPI -> traffic light),
-- extracted verbatim from validate_service_selection so both the
-- order-scoped RPC and the order-less preview RPC stay in lockstep.
-- ============================================================
create or replace function public.compute_service_validation_signals(p_service_level text)
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

-- validate_service_selection: unchanged contract (p_order_id uuid,
-- p_service_level text) -> jsonb with the same keys as before. Body now
-- delegates to the shared helper instead of duplicating it.
create or replace function public.validate_service_selection(p_order_id uuid, p_service_level text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_signals jsonb;
begin
  if not exists (select 1 from public.orders where id = p_order_id) then
    raise exception 'Order not found';
  end if;

  v_signals := public.compute_service_validation_signals(p_service_level);

  return jsonb_build_object('order_id', p_order_id) || v_signals;
end;
$$;

-- ============================================================
-- Service Validation preview: same 🟢/🟡/🔴 signals, callable during
-- Consultation Review before an order_id exists yet. Side-effect free, no
-- AI recommendation -- identical deterministic thresholds as
-- validate_service_selection, just without the order-existence requirement.
-- ============================================================
create or replace function public.preview_service_validation(p_service_level text)
returns jsonb
language sql
security definer
set search_path to 'public'
as $$
  select public.compute_service_validation_signals(p_service_level);
$$;
