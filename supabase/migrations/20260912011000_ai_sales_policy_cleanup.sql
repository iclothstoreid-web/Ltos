-- Keep one permissive Owner/Admin policy per operation. The ALL policies
-- already cover SELECT, so the separate read policies only make PostgreSQL
-- evaluate duplicate predicates for the same authenticated SELECT.

drop policy if exists "Owner can read AI sales conversations" on public.ai_sales_conversations;
drop policy if exists "Owner can read AI sales messages" on public.ai_sales_messages;
drop policy if exists "Owner can read AI sales actions" on public.ai_sales_actions;
