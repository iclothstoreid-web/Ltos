import type { Metadata } from 'next'
import { Fraunces } from 'next/font/google'

// Fonts scoped to the Customer Journey route only, same pattern as every
// other workspace layout (Fraunces variable name matches tailwind.config's
// `fraunces` alias so `font-fraunces` works here too).
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-fraunces',
})

// Overrides the root layout's internal-facing metadata for this
// customer-facing route only — customers should never see "LTOS" in their
// browser tab or when this link is shared.
export const metadata: Metadata = {
  title: 'Customer Journey | Local Tailor',
  description: 'Track your bespoke journey from consultation to delivery.',
  applicationName: 'Customer Journey',
  openGraph: {
    title: 'Customer Journey',
    description: 'Track your bespoke journey from consultation to delivery.',
    siteName: 'Local Tailor Operating System',
    type: 'website',
  },
}

export default function JourneyRouteLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${fraunces.variable} contents`}>{children}</div>
}
