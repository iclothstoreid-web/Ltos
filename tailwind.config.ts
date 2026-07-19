import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
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
      },
    },
  },
  plugins: [],
}
export default config
