import type { Metadata } from 'next'
import { Fraunces } from 'next/font/google'

// Fonts scoped to the Customer Journey route only, same pattern as every
// other workspace layout (Fraunces variable name matches tailwind.config's
// `fraunces` alias so `font-fraunces` works here too). Weight trimmed to
// 400 (AP-03 audit: no font-fraunces element in this route pairs with a
// font-weight utility class).
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-fraunces',
})

// Overrides the root layout's internal-facing metadata for this
// customer-facing route only — customers should never see "LTOS" in their
// browser tab or when this link is shared.
export const metadata: Metadata = {
  title: 'Customer Journey | Tarda',
  description: 'Track your bespoke journey from consultation to delivery.',
  applicationName: 'Customer Journey',
  openGraph: {
    title: 'Customer Journey',
    description: 'Track your bespoke journey from consultation to delivery.',
    siteName: 'Tarda Operating System',
    type: 'website',
  },
}

export default function JourneyRouteLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${fraunces.variable} contents`}>{children}</div>
}
