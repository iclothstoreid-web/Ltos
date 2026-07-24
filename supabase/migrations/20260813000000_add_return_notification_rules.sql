-- Sprint K Milestone 1: Business Configuration Layer — Return Rules +
-- Notification Rules, completing the 6-panel Business Rules submenu
-- (Commercial/Production/Capacity/Return/Service/Notification).
--
-- Same singleton + get_*_rules/set_*_rules pattern as
-- 20260811000000_add_business_rules_runtime_config.sql — no new pattern.
--
-- Return Rules: the QC "Kategori Temuan" picklist (shown before
-- "Kembalikan ke Penjahitan") was hardcoded to QC_CHECKLIST_ITEMS in
-- src/lib/production/stageConfig.ts. It becomes owner-editable here; the
-- default seeds the exact same 5 items so behavior is unchanged until the
-- owner edits it.
--
-- Notification Rules: assign_stage_operator() (20260726000000) always
-- inserts a kiosk-wide "Pekerjaan Baru Ditugaskan" notification — that
-- insert becomes gated on notification_rules.assignment_notification_enabled
-- (default true = today's exact behavior), making this panel's parameter
-- genuinely engine-read, not decorative.

-- ============================================================
-- Return Rules — singleton config table
-- ============================================================

create table if not exists public.return_rules (
  id boolean primary key default true,
  -- Jsonb array of strings — the QC "Kategori Temuan" options.
  reasons jsonb not null default '["Ukuran sesuai formulasi","Jahitan sesuai standar","Tidak ada cacat kain","Aksesori lengkap","Siap masuk Finishing"]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

insert into public.return_rules (id) values (true) on conflict (id) do nothing;

alter table public.return_rules enable row level security;

create policy "All staff can read return rules"
  on public.return_rules for select
  using (true);

comment on table public.return_rules is
  'Runtime Configuration — QC return ("Kembalikan") Kategori Temuan options, one row (id=true). Owner-editable via /owner/business-rules/return; read live by the production kiosk QC decision panel. Replaces the QC_CHECKLIST_ITEMS hardcode.';

create or replace function public.get_return_rules()
returns public.return_rules
language sql
security definer
set search_path to 'public'
as $$
  select * from public.return_rules where id = true;
$$;

create or replace function public.set_return_rules(p_reasons jsonb)
returns public.return_rules
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.return_rules;
  v_reason text;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengubah Return Rules.';
  end if;

  if jsonb_typeof(p_reasons) is distinct from 'array' or jsonb_array_length(p_reasons) = 0 then
    raise exception 'Minimal satu Kategori Temuan wajib ada.';
  end if;

  for v_reason in select jsonb_array_elements_text(p_reasons) loop
    if v_reason is null or trim(v_reason) = '' then
      raise exception 'Kategori Temuan tidak boleh kosong.';
    end if;
  end loop;

  update public.return_rules
  set reasons = p_reasons,
      updated_at = now(),
      updated_by = auth.uid()
  where id = true
  returning * into v_row;

  return v_row;
end;
$$;

-- ============================================================
-- Notification Rules — singleton config table
-- ============================================================

create table if not exists public.notification_rules (
  id boolean primary key default true,
  assignment_notification_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

insert into public.notification_rules (id) values (true) on conflict (id) do nothing;

alter table public.notification_rules enable row level security;

create policy "All staff can read notification rules"
  on public.notification_rules for select
  using (true);

comment on table public.notification_rules is
  'Runtime Configuration — one row (id=true). Owner-editable via /owner/business-rules/notification; read live by assign_stage_operator() to decide whether the kiosk-wide "Pekerjaan Baru Ditugaskan" notification is created.';

create or replace function public.get_notification_rules()
returns public.notification_rules
language sql
security definer
set search_path to 'public'
as $$
  select * from public.notification_rules where id = true;
$$;

create or replace function public.set_notification_rules(p_assignment_notification_enabled boolean)
returns public.notification_rules
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.notification_rules;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengubah Notification Rules.';
  end if;

  update public.notification_rules
  set assignment_notification_enabled = p_assignment_notification_enabled,
      updated_at = now(),
      updated_by = auth.uid()
  where id = true
  returning * into v_row;

  return v_row;
end;
$$;

-- ============================================================
-- Wire the Notification Engine — assign_stage_operator reads the rule
-- ============================================================

-- Identical to 20260726000000's version except the notification insert is
-- now gated on notification_rules.assignment_notification_enabled. The
-- assignment write itself is untouched — the rule only governs whether the
-- kiosk bell entry is created.
create or replace function public.assign_stage_operator(
  p_order_id uuid,
  p_stage_record_id uuid,
  p_operator_id uuid
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_operator_name text;
  v_stage text;
  v_order_number text;
  v_notify boolean;
begin
  select nama into v_operator_name
  from public.production_operators
  where id = p_operator_id;

  if v_operator_name is null then
    raise exception 'Operator not found';
  end if;

  update public.production_stage_records
  set assigned_operator_id = p_operator_id,
      assigned_operator_name = v_operator_name,
      assigned_at = now(),
      updated_at = now()
  where id = p_stage_record_id and order_id = p_order_id
  returning stage into v_stage;

  if v_stage is null then
    raise exception 'Stage record not found for this order';
  end if;

  select assignment_notification_enabled into v_notify
  from public.notification_rules where id = true;

  if coalesce(v_notify, true) then
    select order_number into v_order_number from public.orders where id = p_order_id;

    insert into public.notifications (order_id, stage_record_id, operator_id, title, body)
    values (
      p_order_id,
      p_stage_record_id,
      p_operator_id,
      'Pekerjaan Baru Ditugaskan',
      format('%s — Tahap: %s', coalesce(v_order_number, ''), v_stage)
    );
  end if;
end;
$$;

-- ============================================================
-- Grants
-- ============================================================

-- get_return_rules must be anon-callable — the production kiosk (no login)
-- renders the QC Kategori Temuan picklist from it. get_notification_rules
-- only feeds the owner panel but follows the same read-grant shape as its
-- siblings for consistency.
grant execute on function public.get_return_rules() to authenticated, anon;
grant execute on function public.get_notification_rules() to authenticated, anon;

-- Writes: Owner OS only, gated admin/owner inside the RPC — same as every
-- other set_*_rules.
grant execute on function public.set_return_rules(jsonb) to authenticated;
grant execute on function public.set_notification_rules(boolean) to authenticated;
