create table if not exists public.ai_sales_conversation_evidence (
  source_key text primary key,
  source_ref text not null,
  conversation_date_range text not null,
  product_evidence jsonb not null default '[]'::jsonb,
  transaction_evidence jsonb not null default '[]'::jsonb,
  style_lessons jsonb not null default '[]'::jsonb,
  caveats text,
  imported_at timestamptz not null default now()
);
alter table public.ai_sales_conversation_evidence enable row level security;
revoke all on public.ai_sales_conversation_evidence from anon, authenticated;
grant all on public.ai_sales_conversation_evidence to service_role;
comment on table public.ai_sales_conversation_evidence is
  'Private owner WhatsApp evidence; historical transaction amounts are not live price authority.';
