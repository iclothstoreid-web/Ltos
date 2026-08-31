-- Piecework payroll foundation for Cutting + Sewing.
-- Applied to production as Supabase migration 20260831125119.

create table if not exists public.piecework_rates (
  id uuid primary key default gen_random_uuid(),
  stage text not null check (stage in ('cutting','sewing')),
  rate_type text not null check (rate_type in ('base','addon')),
  model_name text,
  design_field text,
  option_value text,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  is_active boolean not null default true,
  effective_from date not null default current_date,
  effective_to date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint piecework_rates_shape_check check (
    (rate_type = 'base' and model_name is not null and design_field is null and option_value is null)
    or
    (rate_type = 'addon' and design_field is not null and option_value is not null)
  ),
  constraint piecework_rates_effective_range_check check (
    effective_to is null or effective_to >= effective_from
  )
);

create unique index if not exists piecework_rates_one_active_key
on public.piecework_rates (
  stage,
  rate_type,
  coalesce(model_name, ''),
  coalesce(design_field, ''),
  coalesce(option_value, '')
)
where is_active = true;

create index if not exists piecework_rates_lookup_idx
on public.piecework_rates(stage, rate_type, is_active, effective_from desc);

create table if not exists public.piecework_entries (
  id uuid primary key default gen_random_uuid(),
  stage_record_id uuid not null unique references public.production_stage_records(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  order_number text not null,
  operator_id uuid not null references public.production_operators(id) on delete restrict,
  operator_name text not null,
  stage text not null check (stage in ('cutting','sewing')),
  model_name text,
  design_snapshot jsonb not null default '{}'::jsonb,
  base_amount numeric(12,2) not null default 0 check (base_amount >= 0),
  addon_amount numeric(12,2) not null default 0 check (addon_amount >= 0),
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  rate_breakdown jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null,
  payroll_week_start date not null,
  payroll_week_end date not null,
  created_at timestamptz not null default now()
);

create index if not exists piecework_entries_operator_week_idx
on public.piecework_entries(operator_id, payroll_week_start, completed_at);

create index if not exists piecework_entries_stage_completed_idx
on public.piecework_entries(stage, completed_at desc);

create table if not exists public.piecework_payroll_weeks (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.production_operators(id) on delete restrict,
  operator_name text not null,
  payroll_week_start date not null,
  payroll_week_end date not null,
  piece_count integer not null default 0 check (piece_count >= 0),
  total_amount numeric(14,2) not null default 0 check (total_amount >= 0),
  status text not null default 'running' check (status in ('running','ready','paid')),
  finalized_at timestamptz,
  paid_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(operator_id, payroll_week_start)
);

create index if not exists piecework_payroll_weeks_period_idx
on public.piecework_payroll_weeks(payroll_week_start desc, operator_name);

alter table public.piecework_rates enable row level security;
alter table public.piecework_entries enable row level security;
alter table public.piecework_payroll_weeks enable row level security;

drop policy if exists "owner_admin_manage_piecework_rates" on public.piecework_rates;
create policy "owner_admin_manage_piecework_rates"
on public.piecework_rates
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('owner','admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('owner','admin')
  )
);

drop policy if exists "owner_admin_read_piecework_entries" on public.piecework_entries;
create policy "owner_admin_read_piecework_entries"
on public.piecework_entries
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('owner','admin')
  )
);

drop policy if exists "owner_admin_manage_piecework_weeks" on public.piecework_payroll_weeks;
create policy "owner_admin_manage_piecework_weeks"
on public.piecework_payroll_weeks
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('owner','admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('owner','admin')
  )
);

revoke all on table public.piecework_rates from anon;
revoke all on table public.piecework_entries from anon;
revoke all on table public.piecework_payroll_weeks from anon;

grant select, insert, update, delete on table public.piecework_rates to authenticated;
grant select on table public.piecework_entries to authenticated;
grant select, update on table public.piecework_payroll_weeks to authenticated;

create or replace function public.capture_piecework_on_stage_complete()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_order_number text;
  v_operator_name text;
  v_snapshot jsonb := '{}'::jsonb;
  v_design jsonb := '{}'::jsonb;
  v_model text;
  v_completed_date date;
  v_week_start date;
  v_week_end date;
  v_base_amount numeric(12,2) := 0;
  v_base_rate_id uuid;
  v_addon_amount numeric(12,2) := 0;
  v_addons jsonb := '[]'::jsonb;
  v_total numeric(12,2) := 0;
  v_rows integer := 0;
begin
  if new.stage not in ('cutting','sewing') then
    return new;
  end if;

  if old.status = 'completed' or new.status <> 'completed' then
    return new;
  end if;

  if coalesce(new.decision, '') = 'skipped' then
    return new;
  end if;

  if new.operator_id is null then
    return new;
  end if;

  select o.order_number into v_order_number
  from public.orders o
  where o.id = new.order_id;

  select po.nama into v_operator_name
  from public.production_operators po
  where po.id = new.operator_id;

  if v_order_number is null or v_operator_name is null then
    return new;
  end if;

  select coalesce(be.event_data, '{}'::jsonb)
  into v_snapshot
  from public.business_events be
  where be.order_id = new.order_id
    and be.event_type = 'order.created'
  order by be.created_at desc
  limit 1;

  v_design := coalesce(v_snapshot -> 'design', '{}'::jsonb);
  v_model := nullif(v_design ->> 'model', '');
  v_completed_date := coalesce(new.completed_at, now())::date;

  if extract(dow from v_completed_date) = 0 then
    v_week_start := v_completed_date + 1;
  else
    v_week_start := date_trunc('week', v_completed_date::timestamp)::date;
  end if;
  v_week_end := v_week_start + 5;

  select pr.id, pr.amount
  into v_base_rate_id, v_base_amount
  from public.piecework_rates pr
  where pr.stage = new.stage
    and pr.rate_type = 'base'
    and pr.is_active = true
    and pr.model_name = v_model
    and pr.effective_from <= v_completed_date
    and (pr.effective_to is null or pr.effective_to >= v_completed_date)
  order by pr.effective_from desc, pr.created_at desc
  limit 1;

  v_base_amount := coalesce(v_base_amount, 0);

  select
    coalesce(sum(x.amount), 0),
    coalesce(jsonb_agg(
      jsonb_build_object(
        'rate_id', x.id,
        'field', x.design_field,
        'option', x.option_value,
        'amount', x.amount
      )
      order by x.design_field
    ), '[]'::jsonb)
  into v_addon_amount, v_addons
  from (
    select distinct on (pr.design_field)
      pr.id, pr.design_field, pr.option_value, pr.amount
    from public.piecework_rates pr
    where pr.stage = new.stage
      and pr.rate_type = 'addon'
      and pr.is_active = true
      and pr.design_field is not null
      and pr.option_value is not null
      and (pr.model_name is null or pr.model_name = v_model)
      and v_design ->> pr.design_field = pr.option_value
      and pr.effective_from <= v_completed_date
      and (pr.effective_to is null or pr.effective_to >= v_completed_date)
    order by
      pr.design_field,
      (pr.model_name is not null) desc,
      pr.effective_from desc,
      pr.created_at desc
  ) x;

  v_addon_amount := coalesce(v_addon_amount, 0);
  v_total := v_base_amount + v_addon_amount;

  insert into public.piecework_entries (
    stage_record_id, order_id, order_number, operator_id, operator_name,
    stage, model_name, design_snapshot, base_amount, addon_amount,
    total_amount, rate_breakdown, completed_at, payroll_week_start, payroll_week_end
  )
  values (
    new.id, new.order_id, v_order_number, new.operator_id, v_operator_name,
    new.stage, v_model, v_design, v_base_amount, v_addon_amount, v_total,
    jsonb_build_object(
      'base', jsonb_build_object(
        'rate_id', v_base_rate_id,
        'model', v_model,
        'amount', v_base_amount,
        'configured', v_base_rate_id is not null
      ),
      'addons', v_addons
    ),
    coalesce(new.completed_at, now()), v_week_start, v_week_end
  )
  on conflict (stage_record_id) do nothing;

  get diagnostics v_rows = row_count;

  if v_rows > 0 then
    insert into public.piecework_payroll_weeks (
      operator_id, operator_name, payroll_week_start, payroll_week_end,
      piece_count, total_amount, status
    )
    values (
      new.operator_id, v_operator_name, v_week_start, v_week_end, 1, v_total, 'running'
    )
    on conflict (operator_id, payroll_week_start)
    do update set
      operator_name = excluded.operator_name,
      piece_count = public.piecework_payroll_weeks.piece_count + 1,
      total_amount = public.piecework_payroll_weeks.total_amount + excluded.total_amount,
      updated_at = now()
    where public.piecework_payroll_weeks.status = 'running';
  end if;

  return new;
end;
$function$;

revoke all on function public.capture_piecework_on_stage_complete() from public, anon, authenticated;

drop trigger if exists trg_capture_piecework_on_stage_complete on public.production_stage_records;
create trigger trg_capture_piecework_on_stage_complete
after update of status on public.production_stage_records
for each row
when (new.status = 'completed' and old.status is distinct from new.status)
execute function public.capture_piecework_on_stage_complete();

comment on table public.piecework_rates is
'Configurable borongan master rates for Cutting and Sewing. Base model rates plus design add-ons. Amount snapshots are copied into piecework_entries at completion time.';

comment on table public.piecework_entries is
'Immutable piecework earnings ledger captured automatically when a Cutting/Sewing production stage completes.';

comment on table public.piecework_payroll_weeks is
'Per-operator Monday-Saturday payroll rollup. Sunday completions start the next payroll week.';
