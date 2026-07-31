-- Sprint O — AI Render Reliability & Cost Observability.
--
-- Render History Engine: one row per attempted render (Design Studio,
-- Debug Viewer, test script, or future CLI/provider), so every OpenAI
-- request can be traced back to a specific render session, and a render
-- still in flight for a consultation can be detected and rejected instead
-- of letting a second parallel OpenAI request through.
--
-- Purely additive observability infrastructure — does not touch
-- design_master_options / ai_dna / render_recipe or any other DNA/business
-- table, and does not change what a render actually does.

-- Render Session ID (Task 6) — RND-YYYYMMDD-NNNNNN. The date segment is
-- cosmetic (when the ID was minted); the 6-digit suffix is a single global
-- monotonic sequence that never resets at midnight, so uniqueness is
-- guaranteed with zero collision risk under concurrent requests (a
-- per-day-reset counter would need a race-prone "count today's rows"
-- query instead). Padding simply prints more digits past 999999 rather
-- than truncating — not a realistic volume for this app.
create sequence if not exists public.render_id_seq;

create or replace function public.generate_render_id()
returns text
language sql
as $$
  select 'RND-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('public.render_id_seq')::text, 6, '0');
$$;

create table if not exists public.render_history (
  id uuid primary key default gen_random_uuid(),
  render_id text not null unique default public.generate_render_id(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer,
  user_id uuid references auth.users(id),
  consultation_id uuid references public.consultations(id),
  order_id uuid references public.orders(id),
  provider text not null default 'openai',
  model text,
  status text not null default 'pending'
    check (status = any (array['pending', 'success', 'failed', 'timeout', 'cancelled'])),
  request_count integer not null default 0,
  retry_count integer not null default 0,
  -- Cost Tracking Foundation (Task 9) — nullable, never computed this
  -- sprint. Ready for a future sprint once a provider exposes real
  -- per-request cost/usage data.
  estimated_cost_usd numeric,
  actual_cost_usd numeric,
  provider_response_id text,
  -- Trigger Source (Task 5) — every render is required to declare where it
  -- came from, so developer/debug/test spend never mixes with real
  -- operational (Design Studio) spend when filtering this table.
  source text not null
    check (source = any (array['design_studio', 'debug_viewer', 'test_script', 'cli', 'future_provider'])),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists render_history_consultation_id_idx on public.render_history(consultation_id);
create index if not exists render_history_started_at_idx on public.render_history(started_at desc);
create index if not exists render_history_source_idx on public.render_history(source);
create index if not exists render_history_status_idx on public.render_history(status);

-- Render Request Lock (Task 1) — at most one 'pending' render per
-- consultation at any moment. A second INSERT attempted while one is
-- already in flight raises unique_violation (Postgres error 23505), which
-- the application layer (src/lib/ai/renderSession/service.ts) catches and
-- turns into "render already in progress" instead of ever reaching
-- OpenAI a second time. This is a real database constraint, not an
-- app-level check-then-act — it holds even under two truly concurrent
-- requests (no TOCTOU race). Scoped to consultation_id IS NOT NULL only:
-- Debug Viewer / test-script / CLI renders (no consultation) never lock
-- against each other or against Design Studio.
create unique index if not exists render_history_active_lock_idx
  on public.render_history (consultation_id)
  where status = 'pending' and consultation_id is not null;

alter table public.render_history enable row level security;

-- Same staff-wide shape as dna_colors/material_colors (20260821000000),
-- except write access also includes 'artisan' here — unlike Master Data
-- content, triggering (and thus writing) a render is a routine action any
-- Fitter takes from Design Studio, not an admin/owner-gated one.
create policy "Staff can read render history"
  on public.render_history for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );

create policy "Staff can create render history"
  on public.render_history for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );

create policy "Staff can update render history"
  on public.render_history for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner', 'artisan'])
    )
  );
