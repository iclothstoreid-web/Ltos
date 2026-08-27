import type { Metadata } from 'next'
import { Libre_Caslon_Text } from 'next/font/google'
import { MaterialSymbolsLink } from '@/components/ui/MaterialSymbolsLink'

export const metadata: Metadata = {
  title: 'Fitter App | Local Tailor',
  applicationName: 'Fitter App',
  description: 'Professional measurement and customer fitting workspace.',
}

// The Stitch reference for Design Studio only loads Libre Caslon Text +
// Inter + Material Symbols (no Fraunces this time) — Inter is already the
// global font-sans. Independent from Check-In/Measurement's own layouts.
const caslon = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-caslon',
})

export default function DesignStudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${caslon.variable} contents`}>
      <MaterialSymbolsLink />
      {children}
    </div>
  )
}
