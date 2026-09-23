create table if not exists public.ai_sales_runtime_settings (
  key text primary key,
  bool_value boolean,
  text_value text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.ai_sales_runtime_settings enable row level security;
revoke all on table public.ai_sales_runtime_settings from anon;
grant select, insert, update, delete on table public.ai_sales_runtime_settings to authenticated;
grant all on table public.ai_sales_runtime_settings to service_role;

create policy "Owner can manage AI sales runtime settings"
  on public.ai_sales_runtime_settings for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = any (array['admin','owner'])
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = any (array['admin','owner'])
    )
  );

create index if not exists ai_sales_runtime_settings_updated_by_idx
  on public.ai_sales_runtime_settings(updated_by);

insert into public.ai_sales_runtime_settings(key, bool_value)
values ('whatsapp_auto_reply_enabled', false)
on conflict (key) do nothing;
