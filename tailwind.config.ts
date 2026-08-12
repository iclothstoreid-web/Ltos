import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // LTOS Design System
        primary: '#005645',
        'primary-light': '#1E6F5C',
        'primary-fixed': '#A5F2D9',
        surface: '#FCFAF8',
        'surface-low': '#F6F3F2',
        'surface-container': '#F0EDEC',
        'on-surface': '#1B1B1C',
        secondary: '#5E5E5E',
        'outline-variant': '#BEC9C4',
        'border-subtle': '#BEC9C4',
        error: '#BA1A1A',
        'warm-gold': '#C89B3C',
        'amber-mid': '#B98900',
        // Aliases used by the Owner OS shell (Command Center + Komunikasi) —
        // same values as surface/on-surface above, kept as separate tokens
        // since the shell markup references them by these names.
        'surface-01': '#FCFAF8',
        'text-primary': '#1B1B1C',
        // Sprint W1 — public homepage. W1 ART DIRECTION LOCK revision:
        // Midnight Navy + Deep Espresso + Brass system (Savile Row / Brunello
        // Cucinelli / leather-atelier direction), replacing the earlier
        // navy+charcoal pairing. Namespaced under `luxury-*` so this palette
        // can never collide with the internal app's Material-style tokens
        // above.
        //
        // W1R — GLOBAL COLOR REBRAND: DEEP ESPRESSO ATELIER. Inverts the
        // REBALANCE revision's dominance: luxury-navy / luxury-navy-deep
        // (previously the ~70% dominant section-background workhorses) are
        // repointed onto luxury-black's existing Deep Espresso value — every
        // section that referenced them keeps its className untouched but now
        // renders the same warm espresso "one material" as the rest of the
        // site, with zero alternating navy/charcoal striping. luxury-black
        // (Deep Espresso) and luxury-charcoal (Smoked Walnut) keep their own
        // values unchanged — they were already exactly the brief's Primary/
        // Secondary Background hex, just previously scoped to cards/panels
        // only. Genuine Midnight Navy (#0B1628 / #0A1322) is deliberately
        // NOT a token anymore: it now only appears as literal hex inside the
        // Hero/FinalCta atmospheric glow gradients and the HeroDepthField
        // shader uniforms, at deliberately low opacity — "ambient glow /
        // depth layer," never a solid fill.
        'luxury-navy': '#151210',
        'luxury-navy-deep': '#151210',
        'luxury-black': '#151210',
        'luxury-charcoal': '#1B1714',
        'luxury-ivory': '#F3EDE6',
        'luxury-gold': '#C8A24A',
        'luxury-bronze': '#B9923F',
        'luxury-linen': '#E8E1D3',
        // New this revision — Soft Taupe for secondary/body text, replacing
        // the old translucent-ivory-opacity pattern (which read as flat
        // "digital UI" white-with-opacity rather than a warm material tone).
        'luxury-taupe': '#B7ACA0',
        // W1R — Dark Walnut, one tier lighter than luxury-charcoal. Elevated
        // surface only: hover/modal/dropdown/floating elements — never a
        // base card or section fill.
        'luxury-espresso-elevated': '#221C18',
        // W1R — third typography tier (Primary=ivory, Secondary=taupe,
        // Muted=this) for fully de-emphasized captions/labels.
        'luxury-muted': '#8E847A',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        // Check-In workspace visual rebuild (LTOS Sprint 02) — additive only,
        // does not replace the tokens above used by other pages. Values are
        // CSS vars set by next/font/google in that route's layout.
        fraunces: ['var(--font-fraunces)', 'serif'],
        caslon: ['var(--font-caslon)', 'serif'],
        // Production workspace visual rebuild (Persiapan Material Stitch
        // export) — additive only, same reasoning as fraunces/caslon above.
        hanken: ['var(--font-hanken)', 'sans-serif'],
        jetbrains: ['var(--font-jetbrains)', 'monospace'],
        // Sprint W1 — public homepage sans. Fraunces (above) already covers
        // the editorial serif role, reused as-is for the homepage's H1/H2.
        'luxury-sans': ['var(--font-luxury-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'headline': ['28px', { lineHeight: '1.3' }],
        'title': ['20px', { lineHeight: '1.4' }],
        'body': ['15px', { lineHeight: '1.6' }],
        'label': ['12px', { lineHeight: '1', letterSpacing: '0.06em' }],
        'mono': ['13px', { lineHeight: '1.5' }],
        // Owner OS shell greeting header — sits between headline (28px) and
        // display (48px), and body-md is its supporting paragraph size.
        'heading-md': ['34px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'body-md': ['16px', { lineHeight: '1.6' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '40px',
        'xxl': '64px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        // Measurement Workspace's highlight glow — a slow, continuous
        // "breathing" loop (subtle scale + opacity fade) rather than a
        // blink, so the active body-part reads as a premium body-scanner
        // glow. Kept separate from pulse-dot since that one is shared with
        // Owner Workspace's critical-alert dots and must not change shape.
        'highlight-breathe': 'highlightBreathe 2.75s ease-in-out infinite',
        // Sprint W1 — homepage fabric/CTA light-sweep (hover-triggered, not
        // looping) and slow ambient drift used by luxury placeholder art.
        'light-sweep': 'lightSweep 900ms ease-out',
        'luxury-drift': 'luxuryDrift 12s ease-in-out infinite',
        // Sprint W0.3 — InteractiveBodySilhouette idle motion (breathing +
        // gentle float). Applied via `motion-safe:` so it's skipped
        // entirely under prefers-reduced-motion, not just paused.
        'silhouette-idle': 'silhouetteIdle 4.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        highlightBreathe: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.55' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.04)', opacity: '0.85' },
        },
        lightSweep: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)', opacity: '0' },
          '30%': { opacity: '0.5' },
          '100%': { transform: 'translateX(120%) skewX(-12deg)', opacity: '0' },
        },
        luxuryDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-1.5%, 1.5%) scale(1.03)' },
        },
        silhouetteIdle: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-6px) scale(1.015)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
