V-08


Pre-Implementation Disclosure

Status: nothing has been implemented yet. The Figma build was interrupted mid-section and never completed; the Stitch prompt was drafted but never executed; no code has been touched. Volumes 01–07 are the only artifacts that exist. Here is the honest accounting.

---
LTOS Design Language principles applied so far

Volume: 01 — Experience Foundation
Where it was actually applied: Reframed the homepage brief from "dashboard" to "one Decision surface" before any layout work
began
Evidence: Rejected the existing page's 9-section stack
(Summary→CRM→DecisionCards→CommercialType→TransactionKPI→Bottleneck→Briefing→Kanban→ArtisanGrid) as violating One Surface/One
 Decision
────────────────────────────────────────
Volume: 02 — Visual Language
Where it was actually applied: Sourced every color/font value from the real codebase, not invented
Evidence: tailwind.config.ts + globals.css verified directly: #005645 primary, #FCFAF8 surface, #1B1B1C ink, #C89B3C gold,
Georgia/Cambria + Inter
────────────────────────────────────────
Volume: 03 — Composition Language
Where it was actually applied: Structured the abandoned Figma frame and the Stitch prompt around Threshold → Decision →
Periphery → Record
Evidence: Sections built: Threshold header → Cutting Table hero → Quiet Ledger → Procession
────────────────────────────────────────
Volume: 04 — Structural
Where it was actually applied: Informed but not yet exercised in a shipped artifact
Evidence: —
────────────────────────────────────────
Volume: 05 — Behavior
Where it was actually applied: Informed but not yet exercised — no interaction was built
Evidence: —
────────────────────────────────────────
Volume: 06 — Component Language
Where it was actually applied: Validated against real existing components, not proposed fresh
Evidence: ExecutiveBriefing card ≈ Surface DNA; .decision-primary/.decision-secondary CSS ≈ Button DNA; CrmSnapshot/AgendaPanel
≈ Ledger DNA; ProductionLiveKanban ≈ Timeline DNA; the existing fallback copy "Semua order berjalan sesuai jadwal" ≈  Empty
State DNA, already live in production
────────────────────────────────────────
Volume: 07 — AI Design Language
Where it was actually applied: Applied as a check on myself just now, and in rejecting the ui-ux-pro-max defaults below
Evidence: Constraint DNA: a tool's suggestion doesn't override the locked language

UI/UX Pro Max references used

One call, early in this conversation, before any DNA volume existed:

search.py "luxury bespoke tailoring atelier heritage craftsmanship" --design-system

Returned: pattern Feature-Rich Showcase, style "Liquid Glass" (glassmorphism/iridescent/blur), typography Cormorant/Montserrat, palette #1C1917/#44403C/#CA8A04/#FAFAF9.

What was kept: only the mood metadata — the tool tagged that typography pairing "luxury, elegant, refined, premium," which directionally confirmed a serif-display + sans-body split was reasonable, and the ink+gold color direction was a useful sanity check.

What was discarded, and why:
- "Liquid Glass" style — rejected outright. It's morphing blur, iridescent, chromatic aberration — the opposite of Volume 02's Material DNA ("absorptive, not reflective… no ambient glow, no neon rim-light"). The tool's own performance/accessibility flags on this style (⚠ Moderate-Poor, ⚠ Text contrast) are a second, independent reason to reject it.
- Cormorant/Montserrat — not used. The actual fonts are Georgia + Inter, because those are what's already live in tailwind.config.ts. Per CLAUDE.md's Source of Truth order, source code outranks any style tool's suggestion.
- The dark #1C1917 palette — not used. Volume 02's canonical palette is the codebase's real cream/deep-green/gold, verified directly, not generated.

