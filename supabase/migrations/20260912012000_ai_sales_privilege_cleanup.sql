-- Supabase/Postgres may carry default grants for authenticated roles.
-- RLS protects rows, but privileges such as TRUNCATE are table-wide and are
-- not needed by the Owner inbox. Restrict authenticated access explicitly.

revoke all on table public.ai_sales_conversations from authenticated;
revoke all on table public.ai_sales_messages from authenticated;
revoke all on table public.ai_sales_actions from authenticated;

grant select, insert, update, delete on table public.ai_sales_conversations to authenticated;
grant select, insert, update, delete on table public.ai_sales_messages to authenticated;
grant select, insert, update, delete on table public.ai_sales_actions to authenticated;
