-- AI Sales Agent foundation.
-- Additive only: isolated CRM/message/action tables for machine-to-machine
-- WhatsApp ingestion. Existing customer/consultation/order flows stay intact.

create table if not exists public.ai_sales_conversations (
  id uuid primary key default gen_random_uuid(),
  channel text not null default 'whatsapp'
    check (channel = any (array['whatsapp'])),
  external_contact_id text not null,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text,
  customer_phone text,
  stage text not null default 'new'
    check (stage = any (array['new', 'qualified', 'offer', 'hot', 'dp', 'order', 'lost'])),
  mode text not null default 'ai'
    check (mode = any (array['ai', 'human'])),
  handoff_reason text,
  context jsonb not null default '{}'::jsonb,
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel, external_contact_id)
);

create table if not exists public.ai_sales_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_sales_conversations(id) on delete cascade,
  direction text not null
    check (direction = any (array['inbound', 'outbound'])),
  role text not null
    check (role = any (array['customer', 'assistant', 'human', 'system'])),
  provider_message_id text,
  message_type text not null default 'text',
  text_content text,
  raw_payload jsonb not null default '{}'::jsonb,
  delivery_status text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_sales_actions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_sales_conversations(id) on delete cascade,
  action_type text not null,
  status text not null default 'proposed'
    check (status = any (array['proposed', 'executed', 'rejected', 'failed'])),
  payload jsonb not null default '{}'::jsonb,
  error_text text,
  executed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists ai_sales_conversations_stage_idx
  on public.ai_sales_conversations(stage, updated_at desc);
create index if not exists ai_sales_conversations_customer_idx
  on public.ai_sales_conversations(customer_id);
create index if not exists ai_sales_messages_conversation_created_idx
  on public.ai_sales_messages(conversation_id, created_at desc);
create unique index if not exists ai_sales_messages_provider_message_uidx
  on public.ai_sales_messages(provider_message_id)
  where provider_message_id is not null;
create index if not exists ai_sales_actions_conversation_created_idx
  on public.ai_sales_actions(conversation_id, created_at desc);

alter table public.ai_sales_conversations enable row level security;
alter table public.ai_sales_messages enable row level security;
alter table public.ai_sales_actions enable row level security;

-- Explicit Data API privileges. Anonymous/public clients must never be able to
-- read or write sales chat payloads. Authenticated access is still constrained
-- by the Owner/Admin RLS policies below. service_role/secret server access is
-- reserved for the verified provider webhook.
revoke all on table public.ai_sales_conversations from anon;
revoke all on table public.ai_sales_messages from anon;
revoke all on table public.ai_sales_actions from anon;

grant select, insert, update, delete on table public.ai_sales_conversations to authenticated;
grant select, insert, update, delete on table public.ai_sales_messages to authenticated;
grant select, insert, update, delete on table public.ai_sales_actions to authenticated;
grant all on table public.ai_sales_conversations to service_role;
grant all on table public.ai_sales_messages to service_role;
grant all on table public.ai_sales_actions to service_role;

-- Owner/Admin can review and operate the CRM from LTOS. Provider webhook
-- writes use a separate server-only secret/service-role client and bypass RLS.
create policy "Owner can read AI sales conversations"
  on public.ai_sales_conversations for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Owner can manage AI sales conversations"
  on public.ai_sales_conversations for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = any (array['admin', 'owner'])
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Owner can read AI sales messages"
  on public.ai_sales_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Owner can manage AI sales messages"
  on public.ai_sales_messages for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = any (array['admin', 'owner'])
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Owner can read AI sales actions"
  on public.ai_sales_actions for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Owner can manage AI sales actions"
  on public.ai_sales_actions for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = any (array['admin', 'owner'])
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = any (array['admin', 'owner'])
    )
  );
