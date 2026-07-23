-- Sprint: Owner "Tugaskan" assignment flow + kiosk-wide job notifications.
-- Operators have no login (production_operators is a name picklist, no
-- auth) — the Production kiosk is entered by scanning an order's QR, not by
-- operator identity. So "notification to the operator" can't be a personal
-- push; it's a shared, kiosk-wide "Pekerjaan Baru Ditugaskan" list read via
-- list_pending_assignments() on the /production scan-entry landing page.
--
-- assigned_operator_* columns are deliberately separate from the existing
-- operator_id/operator_name/division (set by start_stage when work actually
-- begins) — "assigned" (owner picks someone) and "started" (operator begins)
-- are different moments and must not be conflated.

alter table public.production_stage_records
  add column if not exists assigned_operator_id uuid references public.production_operators(id),
  add column if not exists assigned_operator_name text,
  add column if not exists assigned_at timestamptz;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  stage_record_id uuid not null references public.production_stage_records(id),
  operator_id uuid references public.production_operators(id),
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_unread_idx
  on public.notifications (read_at)
  where read_at is null;

-- Full active operator list for the owner's "Pilih Operator" picker —
-- search_operators() caps at 10 rows and requires a query string, which
-- fits its autocomplete use case but not a fixed picklist.
create or replace function public.list_active_operators()
returns setof production_operators
language sql
security definer
set search_path to 'public'
as $$
  select * from public.production_operators
  where is_active = true
  order by nama;
$$;

-- Assigns an operator to a stage record (before work starts) and drops a
-- notification row for the kiosk-wide job list. Ensures the target stage
-- record actually belongs to the given order before writing anything.
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

  select order_number into v_order_number from public.orders where id = p_order_id;

  insert into public.notifications (order_id, stage_record_id, operator_id, title, body)
  values (
    p_order_id,
    p_stage_record_id,
    p_operator_id,
    'Pekerjaan Baru Ditugaskan',
    format('%s — Tahap: %s', coalesce(v_order_number, ''), v_stage)
  );
end;
$$;

-- Kiosk-wide unread job list for the /production landing page bell panel.
create or replace function public.list_pending_assignments()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'notification_id', n.id,
      'order_id', n.order_id,
      'order_number', o.order_number,
      'customer_name', (
        select be.event_data -> 'customer' ->> 'name'
        from public.business_events be
        where be.order_id = n.order_id and be.event_type = 'order.created'
        order by be.created_at desc
        limit 1
      ),
      'stage', r.stage,
      'stage_record_id', n.stage_record_id,
      'assigned_operator_name', r.assigned_operator_name,
      'created_at', n.created_at
    ) order by n.created_at desc)
    from public.notifications n
    join public.orders o on o.id = n.order_id
    join public.production_stage_records r on r.id = n.stage_record_id
    where n.read_at is null
  ), '[]'::jsonb);
end;
$$;

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language sql
security definer
set search_path to 'public'
as $$
  update public.notifications set read_at = now() where id = p_notification_id;
$$;
