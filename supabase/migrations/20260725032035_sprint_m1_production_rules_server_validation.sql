-- Sprint M.1 — Security & Operational Integrity, Task 3.
--
-- production_rules.qr_required / qc_checklist_required /
-- delivery_confirmation_required were selected into v_rules inside
-- complete_stage() but never actually checked there — enforcement lived
-- entirely client-side in ProductionPacketWorkspace.tsx (completionScanned,
-- checklistComplete, canApprove). An already-open kiosk tab, or a direct
-- RPC call, could complete any stage without a QR scan, a finished QC
-- checklist, or shipping info, even when the Owner had turned those
-- requirements on.
--
-- This adds three validations to complete_stage's existing v_rules lookup,
-- placed before the stage-record UPDATE so a rejected call writes nothing.
-- No new RPC, table, column, or helper — same function, same signature,
-- same locked 8-stage order, same everything else. Each condition mirrors
-- the client-side gate it replaces exactly, so no legitimate call from the
-- current UI is affected:
--
--   qr_required: the client only ever supplies a non-null p_completed_at
--   after a successful "Scan QR Penyelesaian" (ProductionPacketWorkspace.tsx
--   completedAtCaptured); when the rule is off, the client's own initial
--   state already skips the scan and still sends a value derived from
--   "now" via the RPC wrapper's default. A null p_completed_at now means
--   there truly was no scan when one was required.
--
--   qc_checklist_required: mirrors the same QC-only exemption already
--   applied client-side (checklistComplete) — every other stage's checklist
--   stays exactly as unvalidated server-side as it is today, unchanged.
--   "p_decision <> 'alter'" matches the same branch condition the function
--   already uses below to decide the QC pass path, so a QC completion that
--   isn't a Kembalikan is the only one gated.
--
--   delivery_confirmation_required: re-reads the stage record's own
--   courier/tracking_number — set by set_shipping_info(), which the client
--   already calls immediately before completeStage() for the shipping
--   stage — instead of trusting a client-side form-filled flag.

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

  -- QR Wajib (Production Rules).
  if coalesce(v_rules.qr_required, true) and p_completed_at is null then
    raise exception 'Scan QR Penyelesaian wajib dilakukan sebelum menyelesaikan tahap ini (Production Rules).';
  end if;

  -- QC Wajib (Production Rules) — QC-only, non-alter path.
  if v_stage = 'qc' and coalesce(p_decision, '') <> 'alter' and coalesce(v_rules.qc_checklist_required, true) then
    if p_checklist is null
       or (select count(*) from jsonb_each(p_checklist)) = 0
       or exists (select 1 from jsonb_each(p_checklist) where value = 'false'::jsonb)
    then
      raise exception 'Checklist QC wajib diselesaikan semua sebelum menyatakan Lulus QC (Production Rules).';
    end if;
  end if;

  -- Delivery wajib konfirmasi (Production Rules) — shipping stage only.
  if v_stage = 'shipping' and coalesce(v_rules.delivery_confirmation_required, true) then
    if not exists (
      select 1 from public.production_stage_records
      where id = p_stage_record_id
        and courier is not null and trim(courier) <> ''
        and tracking_number is not null and trim(tracking_number) <> ''
    ) then
      raise exception 'Data Pengiriman (Kurir & Nomor Resi) wajib diisi sebelum menyelesaikan tahap ini (Production Rules).';
    end if;
  end if;

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
