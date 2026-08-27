import type { Metadata } from 'next'
import { Fraunces } from 'next/font/google'
import { MaterialSymbolsLink } from '@/components/ui/MaterialSymbolsLink'

export const metadata: Metadata = {
  title: 'Fitter App | Local Tailor',
  applicationName: 'Fitter App',
  description: 'Professional measurement and customer fitting workspace.',
}

// Fonts scoped to Consultation Review only — independent from Check-In/
// Measurement/Design Studio's own layouts (all frozen this sprint). Inter is
// already the global font-sans; Fraunces reuses the same CSS var name the
// existing additive tailwind.config `fraunces` key expects. Weight set to
// 400+700 (AP-03 audit: TopNavBar.tsx/PriceSummaryCard.tsx are the only
// font-fraunces call sites anywhere that pair it with font-bold; 300/600
// are never used).
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-fraunces',
})

export default function ConsultationReviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fraunces.variable} contents`}>
      <MaterialSymbolsLink />
      {children}
    </div>
  )
}
