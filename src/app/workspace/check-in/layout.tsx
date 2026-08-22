import type { Metadata } from 'next'
import { Fraunces, Libre_Caslon_Text } from 'next/font/google'
import { MaterialSymbolsLink } from '@/components/ui/MaterialSymbolsLink'

export const metadata: Metadata = {
  title: 'Fitter App | Tarda',
  applicationName: 'Fitter App',
  description: 'Professional measurement and customer fitting workspace.',
}

// Fonts scoped to the Check-In workspace only — the root layout and its
// `font-sans`/`font-serif` tokens used by every other page are untouched.
// Fraunces weight trimmed to 400 (AP-03 audit: no font-fraunces element in
// this route pairs with a font-weight utility class).
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-fraunces',
})
const caslon = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-caslon',
})

export default function CheckInLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fraunces.variable} ${caslon.variable} contents`}>
      <MaterialSymbolsLink />
      {children}
    </div>
  )
}
