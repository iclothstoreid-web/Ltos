-- Sprint M.2 — Runtime Consistency, Task 2.
--
-- complete_stage's normal shipping-completion path checks
-- production_rules.auto_close_after_delivered and, when on, sets
-- orders.current_state = 'follow_up' + logs a business_events
-- 'order.delivered' row (20260811000000_add_business_rules_runtime_config.sql,
-- Sprint M.1 left this untouched). emergency_override_stage's shipping
-- override never did this — an order Emergency-Overridden through the
-- shipping stage stayed in current_state='order' forever even with the
-- rule on, while the exact same terminal condition reached normally
-- correctly flipped to 'follow_up'. Same end state (shipping stage done),
-- different final state — the inconsistency this task targets.
--
-- This does NOT touch anything about the override itself: same role gate,
-- same mandatory reason, same audit log insert, same "decision='skipped'"
-- marking, same escape-hatch nature. It only adds the identical downstream
-- side effect complete_stage already applies for the same condition,
-- reading the same existing production_rules field — no new RPC, table,
-- column, or helper.

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
  v_auto_close boolean;
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

  -- Auto Close setelah Delivered — same condition and effect as
  -- complete_stage's normal shipping-completion branch, so the order's
  -- final state doesn't depend on which path finished the shipping stage.
  if v_stage = 'shipping' then
    select auto_close_after_delivered into v_auto_close
    from public.production_rules where id = true;

    if coalesce(v_auto_close, false) then
      update public.orders
      set current_state = 'follow_up'
      where id = p_order_id and current_state <> 'follow_up';

      if found then
        insert into public.business_events (order_id, event_type, event_data)
        values (p_order_id, 'order.delivered', jsonb_build_object('marked_at', now(), 'source', 'auto_close_after_delivered'));
      end if;
    end if;
  end if;

  insert into public.production_stage_override_audit_log (
    order_id, stage_record_id, stage, reason, overridden_by
  )
  values (p_order_id, p_stage_record_id, v_stage, p_reason, auth.uid());
end;
$$;
