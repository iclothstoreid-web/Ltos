-- Component Default Knowledge (Render Engine) — Collar construction_type.
-- Engine-only field: decides which category-level Component Default
-- Knowledge (COLLAR_DEFAULT_1 one_piece / COLLAR_DEFAULT_2 two_piece,
-- src/lib/design/componentDefaultKnowledge/collar.ts) the Render Assembly
-- injects for a 'kerah' item. Never shown to the customer, never read by
-- catalog/name matching — Prompt Assembly reads only this column.
--
-- Nullable: an existing/new Kerah row with no construction_type set simply
-- gets no Collar Component Default Knowledge injected (same "empty until
-- configured" convention as every other Component Default Knowledge slot —
-- see componentDefaultKnowledge/registry.ts), never a silently guessed
-- default.
alter table public.design_master_options
  add column construction_type text
  constraint design_master_options_construction_type_check
  check (construction_type is null or construction_type in ('one_piece', 'two_piece'));
