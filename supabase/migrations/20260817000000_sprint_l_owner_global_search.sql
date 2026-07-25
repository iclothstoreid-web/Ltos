-- Sprint L Phase 5: Owner OS global search. OwnerTopBar's search input
-- (rendered on every Owner OS page) has had `onChange={() => {}}` since it
-- was built -- a fully inert, uncontrolled input with no query, no state,
-- no backing data. This adds the one RPC it needs: order_number OR
-- customer name, case-insensitive substring match, mirroring the existing
-- search_operators(p_query) pattern (20260810000000) rather than inventing
-- a new search convention.
create or replace function public.search_orders_global(p_query text)
returns table (
  order_id uuid,
  order_number text,
  customer_name text
)
language sql
security definer
set search_path to 'public'
as $$
  select o.id, o.order_number, c.name
  from public.orders o
  join public.customers c on c.id = o.customer_id
  where o.order_number ilike '%' || p_query || '%'
     or c.name ilike '%' || p_query || '%'
  order by o.created_at desc
  limit 8;
$$;

grant execute on function public.search_orders_global(text) to authenticated;
