import { Fraunces } from 'next/font/google'

// Fonts scoped to the Customer Journey route only, same pattern as every
// other workspace layout (Fraunces variable name matches tailwind.config's
// `fraunces` alias so `font-fraunces` works here too).
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-fraunces',
})

export default function JourneyRouteLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${fraunces.variable} contents`}>{children}</div>
}
