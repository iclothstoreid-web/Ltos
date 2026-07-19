import type { Metadata } from 'next'
import { Fraunces, Libre_Caslon_Text } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Fitter App | Local Tailor',
  applicationName: 'Fitter App',
  description: 'Professional measurement and customer fitting workspace.',
}

// Fonts scoped to the Measurement workspace only — independent of Check-In's
// own layout (Check-In is frozen this sprint; nothing here imports from or
// modifies it). Same CSS variable names as Check-In's layout so the
// already-additive tailwind.config `fraunces`/`caslon` keys work here too.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
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
      {/* Material Symbols has no next/font/google entry — same justified
          manual <link> exception as Check-In's layout. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      {children}
    </div>
  )
}
