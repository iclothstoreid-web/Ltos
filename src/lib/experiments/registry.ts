import type { ExperimentDefinition } from './types'

// Sprint W9-1 §10/§11 — Experiment Registry. Every entry mirrors a real
// backlog item from docs/analytics/EXPERIMENT_BACKLOG.md. All start as
// 'draft' — flipping one to 'running' is a real business decision (which
// hypothesis to test first, for how long, against how much traffic) that
// belongs to the site owner, not something this sprint decides on its
// own. assignment.ts only ever buckets a visitor into a variant for
// experiments whose status is 'running'.
export const EXPERIMENTS: ExperimentDefinition[] = [
  {
    id: 'hero_cta_label',
    name: 'Hero CTA Label',
    hypothesis: 'A more specific primary CTA label ("Design My Thobe") converts to hero_cta_click at a higher rate than a generic one ("Get Started").',
    status: 'draft',
    variants: [
      { id: 'control', weight: 50, description: 'Current label: "Design My Thobe"' },
      { id: 'treatment', weight: 50, description: 'Generic label: "Get Started"' },
    ],
    primaryMetric: 'hero_cta_click',
  },
  {
    id: 'hero_image_style',
    name: 'Hero Image Style',
    hypothesis: 'A lifestyle/editorial hero photo drives more scroll_25 continuation than the current studio-mannequin photo.',
    status: 'draft',
    variants: [
      { id: 'control', weight: 50, description: 'Current studio mannequin photo' },
      { id: 'treatment', weight: 50, description: 'Lifestyle/editorial photo' },
    ],
    primaryMetric: 'scroll_25',
  },
  {
    id: 'hero_headline',
    name: 'Hero Headline',
    hypothesis: 'Leading with the distance-removal promise ("Bespoke Tailoring Tanpa Batas Jarak") converts better on /design-studio than a feature-first headline.',
    status: 'draft',
    variants: [
      { id: 'control', weight: 50, description: 'Current: "Bespoke Tailoring Tanpa Batas Jarak"' },
      { id: 'treatment', weight: 50, description: 'Feature-first: "Rancang Thobe Anda Sendiri, Online"' },
    ],
    primaryMetric: 'hero_cta_click',
  },
  {
    id: 'testimonial_position',
    name: 'Testimonial Position',
    hypothesis: 'Moving ReviewsSection earlier on the homepage (before ConfiguratorPreview) increases configurator_start rate by building trust sooner.',
    status: 'draft',
    variants: [
      { id: 'control', weight: 50, description: 'Current position: after Gallery' },
      { id: 'treatment', weight: 50, description: 'Moved before ConfiguratorPreview' },
    ],
    primaryMetric: 'configurator_start',
  },
  {
    id: 'fabric_layout',
    name: 'Fabric Grid Layout',
    hypothesis: 'A 2-column fabric grid with larger cards increases fabric_detail_open rate over the current 4-column grid.',
    status: 'draft',
    variants: [
      { id: 'control', weight: 50, description: 'Current 4-column grid' },
      { id: 'treatment', weight: 50, description: '2-column grid, larger cards' },
    ],
    primaryMetric: 'fabric_detail_open',
  },
  {
    id: 'design_studio_stepper',
    name: 'Design Studio Stepper',
    hypothesis: 'Adding a visible step-progress indicator to the configurator reduces configurator_exit rate.',
    status: 'draft',
    variants: [
      { id: 'control', weight: 50, description: 'No step indicator (current)' },
      { id: 'treatment', weight: 50, description: 'Visible step-progress indicator' },
    ],
    primaryMetric: 'configurator_exit',
  },
  {
    id: 'consultation_form_fields',
    name: 'Consultation Form Fields',
    hypothesis: 'A shorter consultation form (name + WhatsApp only) increases consultation_form_submit rate over the current fuller form.',
    status: 'draft',
    variants: [
      { id: 'control', weight: 50, description: 'Current full form' },
      { id: 'treatment', weight: 50, description: 'Shortened form (name + WhatsApp only)' },
    ],
    primaryMetric: 'consultation_form_submit',
  },
  {
    id: 'sticky_cta_visibility',
    name: 'Sticky CTA Visibility',
    hypothesis: 'An always-visible floating CTA (vs. the current scroll-triggered one) increases overall cta_click rate on mobile.',
    status: 'draft',
    variants: [
      { id: 'control', weight: 50, description: 'Current: appears after Hero scrolls out of view' },
      { id: 'treatment', weight: 50, description: 'Always visible from page load' },
    ],
    primaryMetric: 'cta_click',
  },
]

export function getExperiment(id: string): ExperimentDefinition | undefined {
  return EXPERIMENTS.find((experiment) => experiment.id === id)
}

export function getRunningExperiments(): ExperimentDefinition[] {
  return EXPERIMENTS.filter((experiment) => experiment.status === 'running')
}
