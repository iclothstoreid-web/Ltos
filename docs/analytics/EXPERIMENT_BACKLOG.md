# Experiment Backlog

Sprint W9-1 §11. Source of truth for the exact experiment definitions: `src/lib/experiments/registry.ts`. This document adds business rationale and priority — the registry is the executable spec, this is the human-readable "why."

All 8 experiments below are registered with `status: 'draft'`. Flipping any one to `'running'` is a real business decision (which hypothesis to test first, how long to run it, what % of traffic to expose) that belongs to the site owner — this sprint builds the framework and seeds the backlog, it doesn't start running experiments against real visitors on its own.

## 1. Hero CTA (`hero_cta_label`)

**Hypothesis**: A more specific primary CTA label ("Design My Thobe") converts to `hero_cta_click` at a higher rate than a generic one ("Get Started").
**Priority**: High — the hero CTA is the single highest-traffic decision point on the homepage.
**Primary metric**: `hero_cta_click`

## 2. Hero Image (`hero_image_style`)

**Hypothesis**: A lifestyle/editorial hero photo drives more `scroll_25` continuation than the current studio-mannequin photo.
**Priority**: Medium — needs real lifestyle photography to exist before this can run (none currently does, per `src/lib/marketing/assets.ts`'s own documented photo inventory).
**Primary metric**: `scroll_25`

## 3. Headline (`hero_headline`)

**Hypothesis**: On `/design-studio`, leading with the distance-removal promise ("Bespoke Tailoring Tanpa Batas Jarak") converts better than a feature-first headline ("Rancang Thobe Anda Sendiri, Online").
**Priority**: High — directly tests Sprint Y's core positioning bet.
**Primary metric**: `hero_cta_click`

## 4. Testimonial Position (`testimonial_position`)

**Hypothesis**: Moving `ReviewsSection` earlier on the homepage (before `ConfiguratorPreview`) increases `configurator_start` rate by building trust sooner in the scroll.
**Priority**: Medium
**Primary metric**: `configurator_start`

## 5. Fabric Layout (`fabric_layout`)

**Hypothesis**: A 2-column fabric grid with larger cards increases `fabric_detail_open` rate over the current 4-column grid.
**Priority**: Medium — trade-off against showing fewer materials above the fold; worth testing once `fabric_card_view`/`fabric_detail_open` volume exists to compare.
**Primary metric**: `fabric_detail_open`

## 6. Design Studio Stepper (`design_studio_stepper`)

**Hypothesis**: Adding a visible step-progress indicator to the configurator reduces `configurator_exit` rate.
**Priority**: High — `configurator_exit` (with `exit_step`) directly identifies where visitors abandon; this is the most actionable CRO lever once that data exists.
**Primary metric**: `configurator_exit`

## 7. Consultation Form (`consultation_form_fields`)

**Hypothesis**: A shorter consultation form (name + WhatsApp only) increases `consultation_form_submit` rate over the current fuller form.
**Priority**: Medium — classic form-length trade-off (more completions vs. less pre-qualification data).
**Primary metric**: `consultation_form_submit`

## 8. Sticky CTA (`sticky_cta_visibility`)

**Hypothesis**: An always-visible floating CTA (vs. the current scroll-triggered `StickyMobileCta`) increases overall `cta_click` rate on mobile.
**Priority**: Low — likely small effect size, cheap to test once meaningful mobile traffic exists.
**Primary metric**: `cta_click`

## Adding a New Experiment

1. Add an entry to `EXPERIMENTS` in `src/lib/experiments/registry.ts` (status `'draft'`).
2. Add a row to this document with hypothesis + priority.
3. Wire `useExperimentVariant(experimentId)` (or `isFeatureEnabled()` for a simple on/off case) into the relevant component, and call `trackExperimentExposure()` at the point the variant is actually rendered — not at assignment time (see `exposure.ts`'s own comment for why those are different moments).
4. When ready to launch, flip `status` to `'running'` — `assignment.ts` only buckets real traffic for running experiments.
