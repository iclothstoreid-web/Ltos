-- Material Workspace redesign: Kalkulator Material's "Simpan Template" /
-- "Gunakan Template" needs templates reusable across orders and devices,
-- not just localStorage. Small standalone table, same admin/owner-only
-- RLS shape as material_categories — components is a flat jsonb array of
-- { label, quantity, unitPrice } rows, computed client-side (subtotal/total
-- are never persisted, always derived from the array so edits never drift).
create table if not exists public.material_cost_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  components jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.material_cost_templates enable row level security;

create policy "Admin or owner can read cost templates"
  on public.material_cost_templates for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Admin or owner can create cost templates"
  on public.material_cost_templates for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Admin or owner can delete cost templates"
  on public.material_cost_templates for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );
