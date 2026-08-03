# Sprint D.1 — Final Design Revision Specification

## Owner Decision Room — Locked Implementation Specification

Status: FROZEN. This document is the single implementation specification for the LTOS Owner Decision Room. It supersedes all prior Sprint D.1 exploration artifacts. Sprint D.1 Phase 4 review is APPROVED. The Owner Decision Room design is READY FOR IMPLEMENTATION. No further design revision is authorized before implementation review.

---

## Source of Truth

- LTOS Design Language, Volumes 01–08 (`docs/design-language/`) — governing law for every rule in this document.
- Sprint D.1 Phase 1 Audit — satisfied by Volume 08 ("Pre-Implementation Disclosure"), the only existing pre-implementation audit of the Owner Decision Room.
- Sprint D.1 Phase 2 Creative Direction — satisfied by Volumes 01–07, which contain the complete, locked creative direction (including the Owner Decision Room brief embedded in `LTOS_Design_Language_v1.md`).
- Stitch exploration findings — one verified desktop concept generated against Volume 02's Material/Color/Typography/Light DNA, evaluated section by section against Volumes 01–08.
- Figma inspection findings — Figma MCP connectivity verified live (account `deka`, ICLOTH STORE's team, View-seat, starter tier); no Owner Decision Room file exists to inspect. Per Volume 08, the prior Figma build was interrupted mid-section and never completed.

No rule below originates outside these sources.

---

## 1. Material DNA (Final)

- Base material metaphor: raw canvas as the field, aged brass as the rare structural fitting. Never glass, plastic, or gloss.
- Surfaces are matte and light-absorbing. No reflective sheen, no wet or lacquered finish, no glossy card elevation.
- Brass/gold is a structural accent only. It appears at the point something structural happens — a rule, a seal, a single status mark — never repeated decoratively across the same surface.
- Weight classes govern every surface: Canvas (base plane — quiet, matte, permanent) for the general field; Muslin (provisional) for draft or in-progress states; Finished Wool (denser, calmer, more settled) for completed/consequential states such as a confirmed order or a recorded payment; Brass reserved exclusively for the rare structural accent.
- Locked color values:
  - Field: `#FCFAF8`, recessed surfaces `#F6F3F2` / `#F0EDEC`
  - Grounding: `#005645`, working tint `#1E6F5C`
  - Ink: `#1B1B1C`
  - Secondary text: `#5E5E5E`
  - Seal (gold): `#C89B3C`, deeper amber `#B98900`
  - Hairline: `#BEC9C4`, always 1px
  - Alarm (single-use only): `#BA1A1A`
- Forbidden: blue, purple, teal-as-brand, neon, saturated multi-color badge/status systems, decorative gradients not explained by a directional light source.
- Verified buildable exactly as specified.

---

## 2. Light DNA (Final)

- Single-direction light only, the way a north-facing window lights a fitting room. Never even, ambient, or shadowless lighting.
- One soft directional gold-tinted gradient, sourced from the upper-left of the canvas, fading to nothing across the background.
- Shadows are soft, diffused, and paper-like — the shadow of something resting just above the surface beneath it. Never a hard graphic drop-shadow.
- Brightness is earned: the single most important fact on the surface is the brightest point; everything else recedes into warm shade.
- Texture is what light reveals, not what color applies: a barely-visible fine grain may appear on the primary hero surface only, felt more than seen. This grain is produced as an abstract surface treatment — never as a representational photograph, stock image, or illustration. No photographic or illustrative imagery is permitted anywhere on this surface.
- No glow, no neon rim-light, no ambient mood gradient without a light-source justification.
- Verified buildable exactly as specified.

---

## 3. Typography DNA (Final)

- Exactly two voices. No third voice or third typeface is introduced anywhere on this surface.
- First voice (serif, warm/humanist, Georgia/Cambria/Lora character): appears exactly once per surface, reserved exclusively for the primary greeting and the one primary recommendation headline inside the hero.
- Second voice (Inter): every label, number, body line, navigation element, and footer element. Labels are 12px, uppercase, ~0.2em letter-spacing, muted gray, treated as museum wall-text — never as a UI chip or pill.
- Numbers and data points are always set in the second voice, sized to their actual consequence — never enlarged into a dashboard-style KPI counter.
- Verified buildable exactly as specified.

---

## 4. Atmosphere DNA (Final)

- One Surface, One Decision: the page presents exactly one Lead moment. The hero occupies the dominant share of visual weight (~60%); everything else is deliberately quieter.
- Fixed sequence, never reordered and never revealed simultaneously: Threshold (quiet arrival — date label, serif greeting, one supporting line, a single thin gold hairline) → Decision (the hero) → Periphery (Quiet Ledger) → Record (Procession and agenda) → Close (footer signature).
- Negative space is allocated proportionally to consequence: the most generous space surrounds the hero; the Periphery and Record may sit more densely.
- No dashboard grid of equal-weight KPI tiles anywhere on this surface.
- Quiet Ledger entries render as unbordered typographic lines only — a status dot, a muted label, one number, a "lihat →" link. Never a card, chip, or icon.
- Status-dot color is restricted to exactly two states: neutral (hairline gray `#BEC9C4`, the default) and alarm (`#BA1A1A`, reserved for the one genuinely at-risk signal on the surface, used at most once). Gold is never used as a recurring status-dot color — gold's one permitted use per surface is already spent in the hero and Threshold zones.
- The Procession (production stages) renders as a single flowing, hairline-connected sequence — never boxed kanban cards.
- Verified buildable exactly as specified.

---

## 5. Behavior DNA (Final)

- **State.** Only four states are ever shown on this surface: waiting, in progress, at risk, resolved. Each must reflect the genuine current condition of real data — never a decorative or invented technical state (no "syncing," no manufactured "almost there"). The Quiet Ledger's alarm-red status dot may render only when the underlying signal genuinely qualifies as a promise at real risk of being broken; a routine or low-stakes signal is never dramatized to look at-risk, and a genuinely at-risk signal is never softened to look routine. The Procession's stage counts must reflect real production-stage data at all times; no stage may visually imply progress that has not actually happened.
- **Transition.** Moving between Threshold, Decision, Periphery, and Record must never feel abrupt or ground-shifting, and never so slow that the transition itself becomes a performance. When the primary action is pressed, any resulting change on the surface is felt only after the action registers — cause before effect, never the reverse, and never simultaneous with the click.
- **Reveal.** On arrival, the Threshold and the hero render as the surface's first content; the Quiet Ledger, Procession, and agenda are present but do not animate, highlight, or otherwise compete for attention at the same instant as the hero. Detail beyond what the hero's supporting paragraph states (e.g., the full order-level breakdown behind the headline recommendation) is reached only through the primary action or a "lihat →" link — never shown pre-emptively. Nothing on this surface re-notifies, blinks, or nudges after its initial reveal.
- **Feedback.** Pressing the primary action produces feedback proportional to what was actually just committed — a plain, definite confirmation once the commitment is genuinely secured, never shown a beat early, and never theatrical. The "lihat →" links, being low-stakes, require no more than a quiet, immediate acknowledgment of navigation; silence beyond that is correct and sufficient.
- **Tempo.** If committing the primary action requires real processing time, that time is shown honestly — never faked as instant, never artificially slowed for effect. This surface asks the owner for exactly one decision; it never introduces a second request for attention elsewhere on the same surface, and never re-asks the same decision twice in one visit.

---

## 6. Navigation Refinements

- Any persistent navigation rail on this surface renders as a narrow, mostly-empty icon rail: icons only, no text labels, no section names, no active-state text.
- No owner-profile or account widget is included on this surface. Identity is already established by the Threshold greeting and is not repeated as a separate chrome element.
- The serif voice never appears inside the navigation rail or any wordmark within it. Any wordmark present is set in the second voice at label scale.
- Navigation never competes with the hero for visual weight — the rail's width and contrast stay minimal, present only for the moment the owner deliberately chooses to leave the surface.

---

## 7. Hero Refinements

- The hero is a single dominant card with soft rounded corners and a paper-like, diffused shadow only.
- The hero surface carries only the abstract treatment specified in Light DNA above. No photography, stock imagery, or illustration is placed on the hero surface, or anywhere else on this screen.
- The hero contains, in order: a small uppercase executive-recommendation label, one serif headline stating the single most urgent recommendation, one supporting paragraph in muted gray, and exactly one primary action — grounding-color fill, cream text, uppercase label. No secondary button competes with it on the same surface.
- A thin hairline divider and a single small decision note sit beneath the primary action, exactly as specified.

---

## 8. Empty State — Decision Surface (Final)

Applies when there is no recommendation today (no order genuinely needs artisan assignment, and no other candidate decision qualifies as the surface's one Lead moment).

- The hero renders as a fully composed, deliberate state — not a grayed-out, disabled, or partially-populated version of the populated hero. Card surface, corner treatment, shadow, and abstract light treatment remain exactly as specified in Light DNA and Section 7; nothing about the container signals "waiting for content."
- The small uppercase label above the headline is retained, restating its role honestly (naming the surface's state, not the absence of one).
- The serif headline is retained at the same size and weight as the populated recommendation headline — carrying the plain, true statement that nothing requires the owner's decision today. It is not shrunk, muted, or demoted, since Volume 06 requires the empty state to carry "the same quiet dignity" as a populated surface.
- No primary action button is rendered. A button exists only to invite a commitment (Volume 06, Button DNA); with no decision to commit to, no button belongs on the surface.
- The hairline divider and decision note beneath are either omitted together or retained to state a plain confirming fact; the surface is never left with a broken or half-empty gap where the action and note would otherwise sit.
- The Quiet Ledger, Procession, and footer are unaffected by the hero's empty state and continue to render under Sections 4–5 exactly as specified — an empty hero reflects only the absence of one dominant decision, not the absence of other true, unrelated facts.

---

## 9. Known Limitations & Validation Disclosure

**Tool limitations:**
- Figma: no complete Owner Decision Room file exists. The prior build was interrupted mid-section and never completed. Figma MCP connectivity is live and authenticated, so this is a content-availability gap, not an access or quota failure. The connected Figma seat is View-tier (starter plan), which would in any case restrict direct file creation/editing through this connection.
- Stitch: the generation run introduced two artifacts outside the source of truth — a fully labeled navigation sidebar with an owner-profile widget, and a malformed text render (a broken icon-label string) inside that sidebar. Both are tool-generated defects, resolved by Section 6 above, and are excluded from this specification.
- Stitch: the generation run substituted a photographic image for the specified abstract hero texture. This is a tool interpretation gap, resolved by Section 7 above.

**Validation disclosure — principles specified but not yet exercised in a built artifact:**

This document is a text specification. No code implementation of the Owner Decision Room exists. Consistent with Volume 08's own disclosure standard, the following is the honest accounting of what remains unexercised:

- Material DNA, Light DNA, Typography DNA, Atmosphere DNA (Sections 1–4): verified buildable through one Stitch visual exploration only — not yet exercised in a shipped or production artifact.
- Behavior DNA — State, Transition, Reveal, Feedback, Tempo (Section 5): specified in this document for the first time; no interaction has been built anywhere, so none of these five rules has been exercised in any artifact. This is the same status Volume 08 originally recorded for Volume 05 ("Informed but not yet exercised — no interaction was built"), and it remains true today; only the specification, not an implementation, now exists.
- Navigation Refinements (Section 6) and Hero Refinements (Section 7): the sidebar defect and photographic substitution found during Stitch exploration are corrected here in specification form only. No corrected artifact has been built or verified.
- Empty State — Decision Surface (Section 8): specified for the first time in this document; has never been exercised in any built artifact.
- No claim of completion is made for anything beyond this written specification. Readiness assessed here is specification-readiness, not shipped-artifact verification.

---

**Sprint D.1 Phase 4: APPROVED. Owner Decision Room design READY FOR IMPLEMENTATION. Specification frozen.**
