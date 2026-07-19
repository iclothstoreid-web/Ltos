import type { Metadata } from 'next'
import { Fraunces } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Fitter App | Local Tailor',
  applicationName: 'Fitter App',
  description: 'Professional measurement and customer fitting workspace.',
}

// Fonts scoped to this route only — independent from every other frozen
// feature's layout.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-fraunces',
})

export default function OrderCreatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fraunces.variable} contents`}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      {children}
    </div>
  )
}
