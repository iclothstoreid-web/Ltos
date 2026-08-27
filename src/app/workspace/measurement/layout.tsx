import type { Metadata } from 'next'
import { Fraunces, Libre_Caslon_Text } from 'next/font/google'
import { MaterialSymbolsLink } from '@/components/ui/MaterialSymbolsLink'

export const metadata: Metadata = {
  title: 'Fitter App | Local Tailor',
  applicationName: 'Fitter App',
  description: 'Professional measurement and customer fitting workspace.',
}

// Fonts scoped to the Measurement workspace only — independent of Check-In's
// own layout (Check-In is frozen this sprint; nothing here imports from or
// modifies it). Same CSS variable names as Check-In's layout so the
// already-additive tailwind.config `fraunces`/`caslon` keys work here too.
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

export default function MeasurementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fraunces.variable} ${caslon.variable} contents`}>
      <MaterialSymbolsLink />
      {children}
    </div>
  )
}
