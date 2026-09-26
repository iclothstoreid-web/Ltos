-- WhatsApp customer directory + identity resolution for AI Sales.
-- Keeps one normalized contact row per WhatsApp number and links returning LTOS customers.

create or replace function public.normalize_whatsapp_phone(p_phone text)
returns text
language sql
immutable
strict
set search_path = public
as $$
  with d as (
    select regexp_replace(p_phone, '\D', '', 'g') as digits
  )
  select case
    when digits like '0%' then '62' || substr(digits, 2)
    when digits like '62%' then digits
    when digits like '8%' then '62' || digits
    else digits
  end
  from d;
$$;

revoke execute on function public.normalize_whatsapp_phone(text) from public, anon;
grant execute on function public.normalize_whatsapp_phone(text) to authenticated, service_role;

create table if not exists public.ai_sales_customer_contacts (
  phone_e164 text primary key,
  display_name text,
  whatsapp_profile_name text,
  customer_id uuid references public.customers(id) on delete set null,
  is_existing_customer boolean not null default false,
  order_count integer not null default 0 check (order_count >= 0),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_inbound_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_sales_customer_contacts_customer_idx
  on public.ai_sales_customer_contacts(customer_id);
create index if not exists ai_sales_customer_contacts_name_idx
  on public.ai_sales_customer_contacts(lower(display_name));

alter table public.ai_sales_customer_contacts enable row level security;
revoke all on table public.ai_sales_customer_contacts from anon;
grant select on table public.ai_sales_customer_contacts to authenticated;
grant all on table public.ai_sales_customer_contacts to service_role;

drop policy if exists "Owner can read AI sales customer contacts"
  on public.ai_sales_customer_contacts;
create policy "Owner can read AI sales customer contacts"
  on public.ai_sales_customer_contacts for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = any (array['admin','owner'])
    )
  );

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
  on conflict (phone_e164) do update
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

-- Seed the directory from known LTOS customers first.
insert into public.ai_sales_customer_contacts (
  phone_e164, display_name, customer_id, is_existing_customer, order_count,
  first_seen_at, last_seen_at, updated_at
)
select
  public.normalize_whatsapp_phone(c.phone) as phone_e164,
  nullif(trim(c.name), '') as display_name,
  c.id,
  count(o.id) > 0 as is_existing_customer,
  count(o.id)::integer as order_count,
  c.created_at,
  now(),
  now()
from public.customers c
left join public.orders o
  on o.customer_id = c.id
 and o.removed_from_transaction_at is null
where c.phone is not null
  and public.normalize_whatsapp_phone(c.phone) <> ''
group by c.id, c.phone, c.name, c.created_at
on conflict (phone_e164) do update
set display_name = coalesce(excluded.display_name, public.ai_sales_customer_contacts.display_name),
    customer_id = excluded.customer_id,
    is_existing_customer = excluded.is_existing_customer,
    order_count = excluded.order_count,
    updated_at = now();

-- Backfill any WhatsApp contacts already seen by AI Sales.
insert into public.ai_sales_customer_contacts (
  phone_e164, display_name, customer_id, first_seen_at, last_seen_at, last_inbound_at, updated_at
)
select
  public.normalize_whatsapp_phone(c.external_contact_id),
  nullif(trim(c.customer_name), ''),
  c.customer_id,
  c.created_at,
  c.updated_at,
  c.last_inbound_at,
  now()
from public.ai_sales_conversations c
where c.external_contact_id is not null
on conflict (phone_e164) do update
set display_name = coalesce(public.ai_sales_customer_contacts.display_name, excluded.display_name),
    customer_id = coalesce(public.ai_sales_customer_contacts.customer_id, excluded.customer_id),
    last_seen_at = greatest(public.ai_sales_customer_contacts.last_seen_at, excluded.last_seen_at),
    last_inbound_at = greatest(public.ai_sales_customer_contacts.last_inbound_at, excluded.last_inbound_at),
    updated_at = now();
