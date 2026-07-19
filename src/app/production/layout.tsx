import type { Metadata } from 'next'
import { Fraunces, Hanken_Grotesk, JetBrains_Mono, Libre_Caslon_Text } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Production Flow | Local Tailor',
  description: 'Manage and monitor bespoke garment production workflow.',
  applicationName: 'Production Flow',
  openGraph: {
    title: 'Production Flow',
    description: 'Manage and monitor bespoke garment production workflow.',
    siteName: 'Local Tailor Operating System',
    type: 'website',
  },
}

// Same font-scoping convention as every other workspace slice's layout
// (Measurement, Design Studio, etc.) — independent, nothing here imports
// from or modifies them. Hanken Grotesk + JetBrains Mono match the
// Persiapan Material Stitch export; Fraunces/Caslon stay loaded too since
// this one route serves all 8 internal stages and the other 7 still use
// the earlier hex-literal/Fraunces look pending their own Stitch exports.
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
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hanken',
})
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-jetbrains',
})

export default function ProductionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fraunces.variable} ${caslon.variable} ${hanken.variable} ${jetbrains.variable} contents`}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      {children}
    </div>
  )
}
