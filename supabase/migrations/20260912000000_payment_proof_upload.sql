-- Fase 2 (Fitter Payment Flow) — bukti pembayaran untuk Transfer / QRIS.
--
-- The payment RPC (record_order_payment) is left completely untouched — it
-- already handles amount / type / method / idempotency / Commercial Rules /
-- recorded_by audit. The proof is a separate, optional attachment written
-- AFTER the payment row exists, so a proof-upload failure can never lose or
-- block a recorded payment.

-- 1 ── proof path column (a private-bucket object path, never a URL).
alter table public.order_payments
  add column if not exists payment_proof_path text;

-- 2 ── private bucket for the proof images/PDFs. Private (unlike the public
--      master-data / consultation buckets): a payment proof is financial
--      evidence, viewed only via a short-TTL signed URL minted server-side
--      (mirrors the render-finals bucket pattern).
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- 3 ── staff-only storage policies for that bucket.
drop policy if exists "Staff can upload payment proofs" on storage.objects;
create policy "Staff can upload payment proofs"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and exists (select 1 from public.profiles where profiles.id = auth.uid())
  );

drop policy if exists "Staff can read payment proofs" on storage.objects;
create policy "Staff can read payment proofs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and exists (select 1 from public.profiles where profiles.id = auth.uid())
  );

-- 4 ── attach a proof path to an already-recorded payment. SECURITY DEFINER
--      because order_payments has no staff UPDATE policy (all writes go
--      through Commercial Engine RPCs). Staff-gated inside, same as every
--      other RPC in this app.
create or replace function public.attach_payment_proof(
  p_payment_id uuid,
  p_proof_path text
)
returns public.order_payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.order_payments;
begin
  if not exists (select 1 from public.profiles where profiles.id = auth.uid()) then
    raise exception 'Hanya staff yang dapat melampirkan bukti pembayaran.';
  end if;

  update public.order_payments
     set payment_proof_path = p_proof_path
   where id = p_payment_id
  returning * into v_payment;

  if v_payment.id is null then
    raise exception 'Pembayaran tidak ditemukan.';
  end if;

  return v_payment;
end;
$$;

revoke all on function public.attach_payment_proof(uuid, text) from public;
grant execute on function public.attach_payment_proof(uuid, text) to authenticated;
