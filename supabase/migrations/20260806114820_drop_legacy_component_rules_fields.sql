-- Final Master Data Cleanup, Part 2 (2026-08-09) — the deferred Sprint
-- Cleanup from the Safe Migration sprint ("Sprint Cleanup penghapusan
-- legacy dilakukan setelah UAT selesai"). This sprint's brief explicitly
-- locks Master Data's final shape to referenceInstruction + componentRules
-- only (Color/Look Cutting: referenceInstruction only) — lockRules/
-- negativeRules are not in that list, and the brief is explicit: no data
-- kept only for backward compatibility.
--
-- Safe to drop now: verified immediately before this migration that
-- `componentRules` exactly equals `lockRules || negativeRules` (order
-- preserved) for all 34/34 rows on both ai_dna and render_recipe — zero
-- mismatches, zero data loss. Every pipeline read already goes through
-- `componentRules` first (dnaResolver/resolveComponentRules.ts) and this
-- migration's data has never differed from that path's output.
update design_master_options
set ai_dna = ai_dna - 'lockRules' - 'negativeRules'
where ai_dna ?| array['lockRules', 'negativeRules'];

update design_master_options
set render_recipe = render_recipe - 'lockRules' - 'negativeRules'
where render_recipe ?| array['lockRules', 'negativeRules'];
