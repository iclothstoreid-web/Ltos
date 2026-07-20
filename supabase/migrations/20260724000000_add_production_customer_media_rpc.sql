-- Final Stabilization Sprint — P0-2: Customer Photo / Customer Reference were
-- always empty in the Production kiosk despite data existing. Root cause
-- (confirmed by reading live RLS, not assumed): getCustomerPhotoForOrder /
-- getCustomerReferencesForOrder (src/lib/production/customerPhoto.ts,
-- customerReferences.ts) query business_events and consultations *directly*
-- via the anon kiosk client. Both tables' SELECT policies correctly require a
-- staff auth.uid() (business_events: any signed-in staff; consultations:
-- admin/owner/artisan) — the kiosk has neither, so RLS silently returns zero
-- rows every time. That's the same open-kiosk problem every other kiosk read
-- already solves via a SECURITY DEFINER RPC (get_production_packet,
-- get_order_communications, etc.) — these two functions were just never
-- routed through one. Fix: one narrow RPC, no RLS loosened, no new access
-- beyond exactly what these two functions already needed.
--
-- Returns the raw consultations.notes text for the order's consultation (or
-- null) — the existing decodeCustomerDigitalProfile /
-- decodeFitterEnhancements codecs on the client are untouched, still do all
-- the actual parsing. This keeps the RPC dumb and the decode logic in
-- exactly one place (TypeScript), instead of duplicating marker-parsing in
-- SQL.
create or replace function public.get_production_customer_notes(p_order_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_consultation_id uuid;
  v_notes text;
begin
  select consultation_id into v_consultation_id
  from public.business_events
  where order_id = p_order_id and event_type = 'order.created'
  order by created_at desc
  limit 1;

  if v_consultation_id is null then
    return null;
  end if;

  select notes into v_notes
  from public.consultations
  where id = v_consultation_id;

  return v_notes;
end;
$$;

revoke all on function public.get_production_customer_notes(uuid) from public;
grant execute on function public.get_production_customer_notes(uuid) to anon, authenticated;
