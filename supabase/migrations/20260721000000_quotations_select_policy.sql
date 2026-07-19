-- Command Center's revenue KPI (src/app/command-center/page.tsx) already
-- reads public.quotations directly via the standard (non-service-role)
-- client. RLS was enabled on this table with zero policies, so that read
-- silently returned 0 rows regardless of actual data — not because
-- quotations was empty, but because no role could read it at all. Adds a
-- read policy matching the same "any staff row in profiles" convention
-- already used for orders/customers/measurements. No INSERT/UPDATE policy
-- added: no write path exists in the app for this table yet, so adding one
-- would be speculative, not something the current workflow needs.
create policy "All staff can read quotations"
  on public.quotations for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
    )
  );
