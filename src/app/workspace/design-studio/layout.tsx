import type { Metadata } from 'next'
import { Libre_Caslon_Text } from 'next/font/google'

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
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      {children}
    </div>
  )
}
