-- Add customer_token as orders' public Customer Journey identity, separate
-- from order_number (internal). Generated once at Create Order time and
-- never changed afterward.
alter table public.orders
  add column if not exists customer_token text;

-- Backfill existing orders so the column can become NOT NULL + UNIQUE.
update public.orders
set customer_token = replace(gen_random_uuid()::text, '-', '')
where customer_token is null;

alter table public.orders
  alter column customer_token set not null;

alter table public.orders
  add constraint orders_customer_token_key unique (customer_token);

-- Public, narrowly-scoped lookup for the Customer Journey placeholder page.
-- `orders`/`customers` RLS restricts SELECT to authenticated staff only
-- (see "All staff can read orders/customers" policies) -- this function
-- runs as its owner (security definer) so an anonymous customer holding a
-- valid customer_token can resolve it to a name + order number without
-- granting anon any broader table access. No customer_token match means no
-- row -- there is no way to enumerate orders through this function.
create or replace function public.get_customer_journey_order(p_customer_token text)
returns table(order_number text, customer_name text)
language sql
security definer
set search_path = public
as $$
  select o.order_number, c.name
  from public.orders o
  join public.customers c on c.id = o.customer_id
  where o.customer_token = p_customer_token
$$;

revoke all on function public.get_customer_journey_order(text) from public;
grant execute on function public.get_customer_journey_order(text) to anon, authenticated;
