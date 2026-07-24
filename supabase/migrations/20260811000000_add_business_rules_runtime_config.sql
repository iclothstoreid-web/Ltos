-- Sprint: Business Rules Simplification (UX Cleanup)
--
-- Commercial Rules and Production Rules move from "Coming Soon" placeholder
-- pages to real Runtime Configuration: a singleton settings row per engine,
-- read live (no deploy) by the RPCs that already implement the Commercial
-- Engine (supabase/migrations/20260804000002_add_commercial_engine.sql) and
-- the Production Engine (complete_stage/start_stage, which live only in the
-- database — see 20260801000000_add_stage_waiting_time.sql's own note on
-- this — never previously tracked in a migration file until now).
--
-- Every new default below reproduces *exactly* the app's current behavior
-- (no cap, no minimum, always required, manual confirmation only). This is
-- deliberate: these RPCs run against a live production database with real
-- orders/payments in flight, so shipping a migration that suddenly starts
-- rejecting DP amounts or capping discounts staff are already used to would
-- be a silent breaking change. Owner opts into stricter behavior by editing
-- the new Commercial Rules / Production Rules panels after this ships.

-- ============================================================
-- Commercial Rules — singleton config table
-- ============================================================

create table if not exists public.commercial_rules (
  id boolean primary key default true,
  min_dp_percent numeric not null default 0
    check (min_dp_percent >= 0 and min_dp_percent <= 100),
  max_discount_percent numeric not null default 100
    check (max_discount_percent >= 0 and max_discount_percent <= 100),
  full_payment_only boolean not null default false,
  kol_max_discount_percent numeric not null default 100
    check (kol_max_discount_percent >= 0 and kol_max_discount_percent <= 100),
  owner_override_enabled boolean not null default true,
  invoice_notes text not null default '',
  price_rounding_nearest numeric not null default 0
    check (price_rounding_nearest >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

insert into public.commercial_rules (id) values (true) on conflict (id) do nothing;

alter table public.commercial_rules enable row level security;

create policy "All staff can read commercial rules"
  on public.commercial_rules for select
  using (true);

comment on table public.commercial_rules is
  'Runtime Configuration for the Commercial Engine — one row (id=true). Owner-editable via /owner/business-rules/commercial; read live by apply_order_discount/apply_order_kol/set_order_price_override/record_order_payment/recompute_quotation_total/get_order_invoice. No deploy required to change.';

-- ============================================================
-- Production Rules — singleton config table
-- ============================================================

create table if not exists public.production_rules (
  id boolean primary key default true,
  qr_required boolean not null default true,
  qc_checklist_required boolean not null default true,
  allow_skip_stage boolean not null default false,
  -- Max attempts allowed per stage, including the first — 99 is
  -- "effectively unlimited", matching today's uncapped behavior.
  max_alter_attempts integer not null default 99
    check (max_alter_attempts >= 1),
  alter_return_stage text not null default 'sewing'
    check (alter_return_stage in ('material_prep', 'pattern_formulation', 'cutting', 'sewing')),
  delivery_confirmation_required boolean not null default true,
  auto_close_after_delivered boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

insert into public.production_rules (id) values (true) on conflict (id) do nothing;

alter table public.production_rules enable row level security;

create policy "All staff can read production rules"
  on public.production_rules for select
  using (true);

comment on table public.production_rules is
  'Runtime Configuration for the Production Engine — one row (id=true). Owner-editable via /owner/business-rules/production; read live by complete_stage/skip_stage and the kiosk workspace (ProductionPacketWorkspace). No deploy required to change.';

-- ============================================================
-- Read/write RPCs
-- ============================================================

create or replace function public.get_commercial_rules()
returns public.commercial_rules
language sql
security definer
set search_path to 'public'
as $$
  select * from public.commercial_rules where id = true;
$$;

create or replace function public.set_commercial_rules(
  p_min_dp_percent numeric,
  p_max_discount_percent numeric,
  p_full_payment_only boolean,
  p_kol_max_discount_percent numeric,
  p_owner_override_enabled boolean,
  p_invoice_notes text,
  p_price_rounding_nearest numeric
)
returns public.commercial_rules
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.commercial_rules;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengubah Commercial Rules.';
  end if;

  if p_min_dp_percent < 0 or p_min_dp_percent > 100 then
    raise exception 'Minimal DP harus antara 0-100%%.';
  end if;
  if p_max_discount_percent < 0 or p_max_discount_percent > 100 then
    raise exception 'Maksimal Diskon harus antara 0-100%%.';
  end if;
  if p_kol_max_discount_percent < 0 or p_kol_max_discount_percent > 100 then
    raise exception 'Maksimal Diskon KOL harus antara 0-100%%.';
  end if;
  if p_price_rounding_nearest < 0 then
    raise exception 'Pembulatan Harga tidak boleh negatif.';
  end if;

  update public.commercial_rules
  set min_dp_percent = p_min_dp_percent,
      max_discount_percent = p_max_discount_percent,
      full_payment_only = p_full_payment_only,
      kol_max_discount_percent = p_kol_max_discount_percent,
      owner_override_enabled = p_owner_override_enabled,
      invoice_notes = p_invoice_notes,
      price_rounding_nearest = p_price_rounding_nearest,
      updated_at = now(),
      updated_by = auth.uid()
  where id = true
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.get_production_rules()
returns public.production_rules
language sql
security definer
set search_path to 'public'
as $$
  select * from public.production_rules where id = true;
$$;

create or replace function public.set_production_rules(
  p_qr_required boolean,
  p_qc_checklist_required boolean,
  p_allow_skip_stage boolean,
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
      allow_skip_stage = p_allow_skip_stage,
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

-- ============================================================
-- Commercial Engine — wire the RPCs to actually read the rules
-- ============================================================

-- Maksimal Diskon: caps both percentage and fixed discounts (fixed is
-- checked as its subtotal-equivalent percentage) against
-- commercial_rules.max_discount_percent.
create or replace function public.apply_order_discount(
  p_order_id uuid,
  p_discount_type text,
  p_discount_value numeric,
  p_reason text default null
)
returns quotations
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.quotations;
  v_amount numeric;
  v_max_percent numeric;
  v_effective_percent numeric;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat memberikan diskon.';
  end if;

  if p_discount_type not in ('percentage', 'fixed') then
    raise exception 'Tipe diskon tidak valid: %', p_discount_type;
  end if;

  select * into v_row from public.quotations where order_id = p_order_id;
  if v_row.id is null then
    raise exception 'Belum ada data harga (quotation) untuk order ini.';
  end if;

  v_amount := case
    when p_discount_type = 'percentage' then round(v_row.subtotal * p_discount_value / 100, 0)
    else p_discount_value
  end;

  select max_discount_percent into v_max_percent from public.commercial_rules where id = true;
  if v_row.subtotal > 0 and v_max_percent is not null then
    v_effective_percent := v_amount / v_row.subtotal * 100;
    if v_effective_percent > v_max_percent then
      raise exception 'Diskon (% %%) melebihi batas Maksimal Diskon (% %%) dari Commercial Rules.', round(v_effective_percent, 2), v_max_percent;
    end if;
  end if;

  update public.quotations
  set discount_type = p_discount_type,
      discount_value = p_discount_value,
      discount_amount = v_amount,
      discount_reason = p_reason
  where id = v_row.id
  returning * into v_row;

  perform public.recompute_quotation_total(v_row.id);
  select * into v_row from public.quotations where id = v_row.id;
  return v_row;
end;
$$;

-- KOL: same cap mechanism, its own commercial_rules.kol_max_discount_percent.
create or replace function public.apply_order_kol(
  p_order_id uuid,
  p_kol_code text,
  p_kol_discount_amount numeric,
  p_notes text default null
)
returns quotations
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.quotations;
  v_max_percent numeric;
  v_effective_percent numeric;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat mengatur diskon KOL.';
  end if;

  select * into v_row from public.quotations where order_id = p_order_id;
  if v_row.id is null then
    raise exception 'Belum ada data harga (quotation) untuk order ini.';
  end if;

  select kol_max_discount_percent into v_max_percent from public.commercial_rules where id = true;
  if v_row.subtotal > 0 and v_max_percent is not null then
    v_effective_percent := p_kol_discount_amount / v_row.subtotal * 100;
    if v_effective_percent > v_max_percent then
      raise exception 'Diskon KOL (% %%) melebihi batas Maksimal Diskon KOL (% %%) dari Commercial Rules.', round(v_effective_percent, 2), v_max_percent;
    end if;
  end if;

  update public.quotations
  set kol_code = p_kol_code,
      kol_discount_amount = p_kol_discount_amount,
      kol_notes = p_notes
  where id = v_row.id
  returning * into v_row;

  perform public.recompute_quotation_total(v_row.id);
  select * into v_row from public.quotations where id = v_row.id;
  return v_row;
end;
$$;

-- Owner Override Harga: kill switch. Existing admin/owner role gate stays;
-- this adds the ability to turn the capability off entirely regardless of
-- role.
create or replace function public.set_order_price_override(
  p_order_id uuid,
  p_override_amount numeric,
  p_reason text
)
returns quotations
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.quotations;
  v_enabled boolean;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat melakukan override harga.';
  end if;

  select owner_override_enabled into v_enabled from public.commercial_rules where id = true;
  if not coalesce(v_enabled, true) then
    raise exception 'Owner Override Harga sedang dinonaktifkan (Commercial Rules).';
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'Alasan override wajib diisi.';
  end if;

  select * into v_row from public.quotations where order_id = p_order_id;
  if v_row.id is null then
    raise exception 'Belum ada data harga (quotation) untuk order ini.';
  end if;

  update public.quotations
  set override_amount = p_override_amount,
      override_reason = p_reason,
      override_by = auth.uid(),
      override_at = now()
  where id = v_row.id
  returning * into v_row;

  perform public.recompute_quotation_total(v_row.id);
  select * into v_row from public.quotations where id = v_row.id;
  return v_row;
end;
$$;

-- Minimal DP / Full Payment: DP payments below commercial_rules.min_dp_percent
-- of the quotation total are rejected; when full_payment_only is on, DP and
-- Installment payment types are rejected outright (Lunas/Full only).
create or replace function public.record_order_payment(
  p_order_id uuid,
  p_amount numeric,
  p_payment_type text,
  p_payment_method text default null,
  p_notes text default null
)
returns order_payments
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_quotation public.quotations;
  v_payment public.order_payments;
  v_rules public.commercial_rules;
  v_min_dp_amount numeric;
begin
  select * into v_quotation from public.quotations where order_id = p_order_id;
  if v_quotation.id is null then
    raise exception 'Belum ada data harga (quotation) untuk order ini.';
  end if;

  select * into v_rules from public.commercial_rules where id = true;

  if coalesce(v_rules.full_payment_only, false) and p_payment_type in ('dp', 'installment') then
    raise exception 'Aturan bisnis saat ini mewajibkan Full Payment — DP/Cicilan tidak diterima (Commercial Rules).';
  end if;

  if p_payment_type = 'dp' and v_quotation.total > 0 and v_rules.min_dp_percent > 0 then
    v_min_dp_amount := v_quotation.total * v_rules.min_dp_percent / 100;
    if p_amount < v_min_dp_amount then
      raise exception 'DP minimal % %% dari total (minimal Rp%) sesuai Commercial Rules.', v_rules.min_dp_percent, round(v_min_dp_amount);
    end if;
  end if;

  insert into public.order_payments (order_id, quotation_id, amount, payment_type, payment_method, notes, recorded_by)
  values (p_order_id, v_quotation.id, p_amount, p_payment_type, p_payment_method, p_notes, auth.uid())
  returning * into v_payment;

  if v_quotation.status = 'draft' then
    update public.quotations set status = 'approved', approved_at = now() where id = v_quotation.id;
  end if;

  return v_payment;
end;
$$;

-- Pembulatan Harga: rounds the computed (non-override) total to the nearest
-- commercial_rules.price_rounding_nearest (0 = no rounding, today's exact
-- behavior). Manual Owner Override amounts are never re-rounded — the owner
-- typed an exact figure on purpose.
create or replace function public.recompute_quotation_total(p_quotation_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.quotations;
  v_rounding numeric;
  v_total numeric;
begin
  select * into v_row from public.quotations where id = p_quotation_id;
  select price_rounding_nearest into v_rounding from public.commercial_rules where id = true;
  v_rounding := coalesce(v_rounding, 0);

  if v_row.override_amount is not null then
    v_total := v_row.override_amount;
  else
    v_total := greatest(v_row.subtotal - v_row.discount_amount - v_row.kol_discount_amount, 0);
    if v_rounding > 0 then
      v_total := round(v_total / v_rounding) * v_rounding;
    end if;
  end if;

  update public.quotations
  set total = v_total,
      amount = v_total
  where id = p_quotation_id;
end;
$$;

-- Invoice Rules: commercial_rules.invoice_notes rides along in the already
-- assembled invoice packet as an additive key — no document/PDF generation
-- here (still out of scope), just the data an invoice view/print renders.
create or replace function public.get_order_invoice(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_quotation public.quotations;
  v_order public.orders;
  v_customer_name text;
  v_total_paid numeric;
  v_invoice_notes text;
  v_result jsonb;
begin
  select * into v_order from public.orders where id = p_order_id;
  if v_order.id is null then
    raise exception 'Order tidak ditemukan.';
  end if;

  select name into v_customer_name from public.customers where id = v_order.customer_id;
  select * into v_quotation from public.quotations where order_id = p_order_id;
  select invoice_notes into v_invoice_notes from public.commercial_rules where id = true;

  v_total_paid := coalesce((select sum(amount) from public.order_payments where order_id = p_order_id), 0);

  select jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'customer_name', v_customer_name,
    'has_quotation', v_quotation.id is not null,
    'line_items', coalesce(v_quotation.line_items, '[]'::jsonb),
    'subtotal', coalesce(v_quotation.subtotal, 0),
    'discount_type', v_quotation.discount_type,
    'discount_value', coalesce(v_quotation.discount_value, 0),
    'discount_amount', coalesce(v_quotation.discount_amount, 0),
    'discount_reason', v_quotation.discount_reason,
    'kol_code', v_quotation.kol_code,
    'kol_discount_amount', coalesce(v_quotation.kol_discount_amount, 0),
    'kol_notes', v_quotation.kol_notes,
    'override_amount', v_quotation.override_amount,
    'override_reason', v_quotation.override_reason,
    'override_at', v_quotation.override_at,
    'total', coalesce(v_quotation.total, 0),
    'status', coalesce(v_quotation.status, 'draft'),
    'total_paid', v_total_paid,
    'balance_due', greatest(coalesce(v_quotation.total, 0) - v_total_paid, 0),
    'payment_status', case
      when v_quotation.id is null then 'belum_ada_harga'
      when v_total_paid <= 0 then 'belum_dibayar'
      when v_total_paid < v_quotation.total then 'dp_diterima'
      else 'lunas'
    end,
    'payments', coalesce((
      select jsonb_agg(row_to_json(pay) order by pay.paid_at desc)
      from public.order_payments pay
      where pay.order_id = p_order_id
    ), '[]'::jsonb),
    'invoice_notes', coalesce(v_invoice_notes, '')
  ) into v_result;

  return v_result;
end;
$$;

-- ============================================================
-- Production Engine — wire complete_stage to the rules, add skip_stage
-- ============================================================

alter table public.production_stage_records
  drop constraint production_stage_records_decision_check;
alter table public.production_stage_records
  add constraint production_stage_records_decision_check
  check (decision = any (array['approved', 'alter', 'skipped']));

-- Maksimum Alter / Alter kembali ke Stage mana / Auto Close setelah
-- Delivered, layered onto the existing locked 8-stage advance logic — the
-- stage order itself is unchanged (still locked per the master prompt),
-- only the rework cap, rework target, and post-shipping auto-close are now
-- parameter-driven instead of hardcoded.
create or replace function public.complete_stage(
  p_order_id uuid,
  p_stage_record_id uuid,
  p_checklist jsonb,
  p_evidence_url text,
  p_notes text,
  p_decision text default null,
  p_alter_category text default null,
  p_completed_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_stage text;
  v_stage_order text[] := array['material_prep','pattern_formulation','cutting','sewing','qc','finishing','packing','shipping'];
  v_idx int;
  v_next_stage text;
  v_next_attempt int;
  v_current_attempt int;
  v_rules public.production_rules;
  v_return_stage text;
begin
  select stage, attempt into v_stage, v_current_attempt
  from public.production_stage_records
  where id = p_stage_record_id and order_id = p_order_id;

  if v_stage is null then
    raise exception 'Stage record not found for this order';
  end if;

  select * into v_rules from public.production_rules where id = true;

  update public.production_stage_records
  set status = 'completed',
      completed_at = coalesce(p_completed_at, now()),
      checklist = p_checklist,
      evidence_url = p_evidence_url,
      notes = p_notes,
      decision = p_decision,
      alter_category = p_alter_category,
      updated_at = now()
  where id = p_stage_record_id;

  if p_decision = 'alter' and v_stage = 'qc' then
    v_return_stage := coalesce(v_rules.alter_return_stage, 'sewing');

    select coalesce(max(attempt), 0) + 1 into v_next_attempt
    from public.production_stage_records
    where order_id = p_order_id and stage = v_return_stage;

    if v_next_attempt > coalesce(v_rules.max_alter_attempts, 99) then
      raise exception 'Batas Maksimum Alter (%) untuk tahap % sudah tercapai (Production Rules).', v_rules.max_alter_attempts, v_return_stage;
    end if;

    insert into public.production_stage_records (order_id, stage, attempt, status)
    values (p_order_id, v_return_stage, v_next_attempt, 'pending');
  elsif p_decision = 'alter' then
    if v_current_attempt + 1 > coalesce(v_rules.max_alter_attempts, 99) then
      raise exception 'Batas Maksimum Alter (%) untuk tahap % sudah tercapai (Production Rules).', v_rules.max_alter_attempts, v_stage;
    end if;

    insert into public.production_stage_records (order_id, stage, attempt, status)
    values (p_order_id, v_stage, v_current_attempt + 1, 'pending');
  else
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

    -- Auto Close setelah Delivered: same effect as the existing manual
    -- mark_order_delivered() Owner OS action (20260805000000), just fired
    -- automatically the moment Pengiriman's normal (non-alter) completion
    -- lands, when the rule is on. Off by default — manual confirmation in
    -- Owner OS stays the only path, exactly like today.
    if v_stage = 'shipping' and coalesce(v_rules.auto_close_after_delivered, false) then
      update public.orders
      set current_state = 'follow_up'
      where id = p_order_id and current_state <> 'follow_up';

      if found then
        insert into public.business_events (order_id, event_type, event_data)
        values (p_order_id, 'order.delivered', jsonb_build_object('marked_at', now(), 'source', 'auto_close_after_delivered'));
      end if;
    end if;
  end if;
end;
$$;

-- Skip Stage: an explicit, Owner/Admin-only, audited escape hatch — off by
-- default (allow_skip_stage). Reuses the same locked stage-advance step as
-- complete_stage's normal path, so a skipped stage still hands off to
-- exactly the next stage in the locked order, never a reordering.
create or replace function public.skip_stage(
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
  v_rules public.production_rules;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
  ) then
    raise exception 'Hanya Admin/Owner yang dapat melewati tahap produksi.';
  end if;

  select * into v_rules from public.production_rules where id = true;
  if not coalesce(v_rules.allow_skip_stage, false) then
    raise exception 'Skip Stage sedang dinonaktifkan (Production Rules).';
  end if;

  if p_reason is null or trim(p_reason) = '' then
    raise exception 'Alasan Skip Stage wajib diisi.';
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
      notes = 'Dilewati oleh Owner: ' || p_reason,
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
end;
$$;

-- ============================================================
-- Grants
-- ============================================================

-- Reads: kiosk (anon) and Owner OS (authenticated) both need these —
-- ProductionPacketWorkspace reads qr_required/qc_checklist_required/
-- delivery_confirmation_required with no login, same as every other
-- production kiosk RPC.
grant execute on function public.get_commercial_rules() to authenticated, anon;
grant execute on function public.get_production_rules() to authenticated, anon;

-- Writes: Owner OS only, same as every other business-rules setter
-- (set_capacity_calendar_day / set_service_sla_rule).
grant execute on function public.set_commercial_rules(numeric, numeric, boolean, numeric, boolean, text, numeric) to authenticated;
grant execute on function public.set_production_rules(boolean, boolean, boolean, integer, text, boolean, boolean) to authenticated;

-- skip_stage is staff-only (Owner OS), same grant shape as
-- mark_order_delivered.
grant execute on function public.skip_stage(uuid, uuid, text) to authenticated;
