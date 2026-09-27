create table if not exists public.ai_sales_learning_observations (
  inbound_message_id uuid primary key references public.ai_sales_messages(id) on delete cascade,
  assistant_message_id uuid not null references public.ai_sales_messages(id) on delete cascade,
  conversation_id uuid not null references public.ai_sales_conversations(id) on delete cascade,
  signal text not null check (signal in ('continued', 'progressed', 'needs_review')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists ai_sales_learning_observations_review_idx
  on public.ai_sales_learning_observations (signal, created_at desc)
  where reviewed_at is null;
alter table public.ai_sales_learning_observations enable row level security;
revoke all on public.ai_sales_learning_observations from anon, authenticated;
grant all on public.ai_sales_learning_observations to service_role;
comment on table public.ai_sales_learning_observations is
  'Conversation outcome signals for owner review; never automatically promoted to sales facts or training examples.';
