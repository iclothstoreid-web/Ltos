-- Fix PL/pgSQL output-column ambiguity in customer contact upsert.

create or replace function public.ai_sales_resolve_customer_contact(
  p_phone text,
  p_whatsapp_profile_name text default null
)
returns table (
  phone_e164 text,
  display_name text,
  whatsapp_profile_name text,
  customer_id uuid,
  is_existing_customer boolean,
  order_count integer
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_phone text;
  v_profile_name text;
  v_customer_id uuid;
  v_customer_name text;
  v_order_count integer := 0;
  v_display_name text;
begin
  v_phone := public.normalize_whatsapp_phone(p_phone);
  v_profile_name := nullif(trim(regexp_replace(coalesce(p_whatsapp_profile_name, ''), '^~+', '')), '');

  select c.id, nullif(trim(c.name), ''),
         count(o.id)::integer
  into v_customer_id, v_customer_name, v_order_count
  from public.customers c
  left join public.orders o
    on o.customer_id = c.id
   and o.removed_from_transaction_at is null
  where public.normalize_whatsapp_phone(c.phone) = v_phone
  group by c.id, c.name, c.created_at
  order by count(o.id) desc, c.created_at desc
  limit 1;

  v_order_count := coalesce(v_order_count, 0);
  v_display_name := coalesce(v_customer_name, v_profile_name);

  insert into public.ai_sales_customer_contacts (
    phone_e164,
    display_name,
    whatsapp_profile_name,
    customer_id,
    is_existing_customer,
    order_count,
    first_seen_at,
    last_seen_at,
    last_inbound_at,
    updated_at
  )
  values (
    v_phone,
    v_display_name,
    v_profile_name,
    v_customer_id,
    v_order_count > 0,
    v_order_count,
    now(),
    now(),
    now(),
    now()
  )
  on conflict on constraint ai_sales_customer_contacts_pkey do update
  set display_name = coalesce(v_customer_name, v_profile_name, public.ai_sales_customer_contacts.display_name),
      whatsapp_profile_name = coalesce(v_profile_name, public.ai_sales_customer_contacts.whatsapp_profile_name),
      customer_id = coalesce(v_customer_id, public.ai_sales_customer_contacts.customer_id),
      is_existing_customer = case
        when v_customer_id is not null then v_order_count > 0
        else public.ai_sales_customer_contacts.is_existing_customer
      end,
      order_count = case
        when v_customer_id is not null then v_order_count
        else public.ai_sales_customer_contacts.order_count
      end,
      last_seen_at = now(),
      last_inbound_at = now(),
      updated_at = now();

  return query
  select c.phone_e164, c.display_name, c.whatsapp_profile_name, c.customer_id,
         c.is_existing_customer, c.order_count
  from public.ai_sales_customer_contacts c
  where c.phone_e164 = v_phone;
end;
$$;

revoke execute on function public.ai_sales_resolve_customer_contact(text, text)
  from public, anon, authenticated;
grant execute on function public.ai_sales_resolve_customer_contact(text, text)
  to service_role;
