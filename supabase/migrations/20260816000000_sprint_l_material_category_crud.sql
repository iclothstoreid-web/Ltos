-- Sprint L Phase 4: Material Master category CRUD. material_categories has
-- had SELECT + INSERT RLS policies since the Inventory sprint
-- (20260720000000/add_inventory.sql) but never UPDATE/DELETE -- category
-- rename/delete has never been possible from any page, including
-- Inventory's own Material page which only ever creates categories. Same
-- admin/owner gate as the existing policies on this table.
create policy "Admin or owner can update material categories"
  on public.material_categories for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );

create policy "Admin or owner can delete material categories"
  on public.material_categories for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = any (array['admin', 'owner'])
    )
  );
