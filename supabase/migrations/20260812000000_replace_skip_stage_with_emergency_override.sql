-- Revision requested after review: Skip Stage as a global Business Rule
-- toggle changed workflow (any order could have any stage skipped, forever,
-- the moment an owner flipped one switch) — this contradicts the locked
-- production workflow principle every other Production Rule in this
-- migration set was written to respect. Business Rules should only ever
-- tune *operational parameters* (thresholds, requirements), never grant a
-- standing capability to alter the workflow itself.
--
-- Replaced with Emergency Override: a per-order, per-stage action with no
-- rule toggle gating it at all (Owner/Admin + mandatory reason are the only
-- gates, same as every other override in this app — see
-- set_capacity_calendar_day in 20260808000000_add_capacity_engine.sql for
-- the exact precedent this mirrors). Every call is logged to a new
-- append-only production_stage_override_audit_log, modeled on that
-- migration's own capacity_override_audit_log.

-- production_rules.allow_skip_stage no longer exists — Skip Stage is not a
-- configurable business rule anymore.
drop function if exists public.skip_stage(uuid, uuid, text);
drop function if exists public.set_production_rules(boolean, boolean, boolean, integer, text, boolean, boolean);

alter table public.production_rules
  drop column if exists allow_skip_stage;

create or replace function public.set_production_rules(
  p_qr_required boolean,
  p_qc_checklist_required boolean,
  p_max_alter_attempts integer,
  p_alter_return_stage text,
  p_delivery_confirmation_required boolean,
  p_auto_close_after_delivered boolean
)
returns public.production_rules
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.production_rules;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengubah Production Rules.';
  end if;

  if p_max_alter_attempts < 1 then
    raise exception 'Maksimum Alter harus minimal 1.';
  end if;
  if p_alter_return_stage not in ('material_prep', 'pattern_formulation', 'cutting', 'sewing') then
    raise exception 'Alter kembali ke Stage tidak valid: %', p_alter_return_stage;
  end if;

  update public.production_rules
  set qr_required = p_qr_required,
      qc_checklist_required = p_qc_checklist_required,
      max_alter_attempts = p_max_alter_attempts,
      alter_return_stage = p_alter_return_stage,
      delivery_confirmation_required = p_delivery_confirmation_required,
      auto_close_after_delivered = p_auto_close_after_delivered,
      updated_at = now(),
      updated_by = auth.uid()
  where id = true
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.set_production_rules(boolean, boolean, integer, text, boolean, boolean) to authenticated;

-- ============================================================
-- Emergency Override — per Order, per Stage, always audited
-- ============================================================

create table if not exists public.production_stage_override_audit_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  stage_record_id uuid not null references public.production_stage_records(id),
  stage text not null,
  reason text not null,
  overridden_by uuid references public.profiles(id),
  overridden_at timestamptz not null default now()
);

create index if not exists idx_production_stage_override_audit_log_order
  on public.production_stage_override_audit_log(order_id);

alter table public.production_stage_override_audit_log enable row level security;

create policy "All staff can read production stage override audit log"
  on public.production_stage_override_audit_log for select
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()));

comment on table public.production_stage_override_audit_log is
  'Append-only audit trail for emergency_override_stage() — one row per Emergency Override, scoped to a single order+stage. Never a Business Rule: there is no toggle anywhere that grants this capability, only the Owner/Admin role check inside emergency_override_stage() itself.';

-- Owner/Admin-only, mandatory reason, always logged, always scoped to
-- exactly the one order+stage passed in — never a workflow-wide change.
-- Reuses the same locked stage-advance step complete_stage's normal path
-- uses, so an overridden stage still hands off to exactly the next stage in
-- the locked order.
create or replace function public.emergency_override_stage(
  p_order_id uuid,
  p_stage_record_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_stage text;
  v_status text;
  v_stage_order text[] := array['material_prep','pattern_formulation','cutting','sewing','qc','finishing','packing','shipping'];
  v_idx int;
  v_next_stage text;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat melakukan Emergency Override.';
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'Alasan Emergency Override wajib diisi.';
  end if;

  select stage, status into v_stage, v_status
  from public.production_stage_records
  where id = p_stage_record_id and order_id = p_order_id;

  if v_stage is null then
    raise exception 'Stage record not found for this order';
  end if;

  if v_status = 'completed' then
    raise exception 'Tahap ini sudah selesai.';
  end if;

  update public.production_stage_records
  set status = 'completed',
      completed_at = now(),
      decision = 'skipped',
      notes = 'Emergency Override oleh Owner: ' || p_reason,
      updated_at = now()
  where id = p_stage_record_id;

  select i into v_idx from unnest(v_stage_order) with ordinality as t(s, i) where t.s = v_stage;
  if v_idx is not null and v_idx < array_length(v_stage_order, 1) then
    v_next_stage := v_stage_order[v_idx + 1];
    if not exists (
      select 1 from public.production_stage_records
      where order_id = p_order_id and stage = v_next_stage
    ) then
      insert into public.production_stage_records (order_id, stage, attempt, status)
      values (p_order_id, v_next_stage, 1, 'pending');
    end if;
  end if;

  insert into public.production_stage_override_audit_log (
    order_id, stage_record_id, stage, reason, overridden_by
  )
  values (p_order_id, p_stage_record_id, v_stage, p_reason, auth.uid());
end;
$$;

grant execute on function public.emergency_override_stage(uuid, uuid, text) to authenticated;
