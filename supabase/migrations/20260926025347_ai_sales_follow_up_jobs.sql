-- Follow-up queue: service-role only, scoped to one unanswered inbound turn.
create table public.ai_sales_follow_up_jobs (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_sales_conversations(id) on delete cascade,
  inbound_at timestamptz not null,
  step smallint not null check (step in (1, 2)),
  due_at timestamptz not null,
  status text not null default 'queued'
    check (status in ('queued', 'claimed', 'sent', 'canceled', 'skipped', 'failed')),
  claimed_at timestamptz,
  provider_message_id text,
  outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (conversation_id, inbound_at, step)
);

create index ai_sales_follow_up_due_idx
  on public.ai_sales_follow_up_jobs(due_at, id) where status = 'queued';

alter table public.ai_sales_follow_up_jobs enable row level security;
revoke all on public.ai_sales_follow_up_jobs from public, anon, authenticated;
grant select, insert, update on public.ai_sales_follow_up_jobs to service_role;

-- Atomic claim across concurrent cron invocations. Never retry a claimed job
-- automatically: if Meta accepted it but persistence failed, manual review is
-- preferable to a duplicate customer message.
create function public.ai_sales_claim_due_follow_ups(p_limit integer default 20)
returns setof public.ai_sales_follow_up_jobs
language sql
security invoker
set search_path = public
as $$
  update public.ai_sales_follow_up_jobs as jobs
  set status = 'claimed', claimed_at = now(), updated_at = now()
  where jobs.id in (
    select id from public.ai_sales_follow_up_jobs
    where status = 'queued' and due_at <= now()
    order by due_at, id
    limit least(greatest(p_limit, 1), 20)
    for update skip locked
  )
  returning jobs.*;
$$;

revoke execute on function public.ai_sales_claim_due_follow_ups(integer) from public, anon, authenticated;
grant execute on function public.ai_sales_claim_due_follow_ups(integer) to service_role;

insert into public.ai_sales_runtime_settings(key, bool_value)
values ('whatsapp_follow_up_enabled', false)
on conflict (key) do nothing;
