create or replace function public.ai_sales_follow_up_runtime_enabled()
returns boolean
language sql
stable
set search_path = public
as $$
  select count(*) = 2 and coalesce(bool_and(bool_value), false)
  from public.ai_sales_runtime_settings
  where key in ('whatsapp_auto_reply_enabled', 'whatsapp_follow_up_enabled');
$$;
revoke all on function public.ai_sales_follow_up_runtime_enabled() from public, anon, authenticated;
grant execute on function public.ai_sales_follow_up_runtime_enabled() to service_role;
