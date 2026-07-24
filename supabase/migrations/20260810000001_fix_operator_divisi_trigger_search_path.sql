-- Final-baseline audit (Supabase security advisors): the two trigger
-- functions added in 20260810000000 were missing `set search_path`, flagged
-- by the "Function Search Path Mutable" linter -- every other function in
-- that migration already pins it, these two were just missed. Behavior is
-- unchanged; this only closes the two new advisor warnings this session
-- introduced.
create or replace function public.sync_operator_divisi_text()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.division_id is null then
    new.divisi := null;
  else
    select name into new.divisi from public.master_divisions where id = new.division_id;
  end if;
  return new;
end;
$$;

create or replace function public.sync_operator_divisi_on_division_rename()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.name is distinct from old.name then
    update public.production_operators
    set divisi = new.name
    where division_id = new.id;
  end if;
  return new;
end;
$$;
