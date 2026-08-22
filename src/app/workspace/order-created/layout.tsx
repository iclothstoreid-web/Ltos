import type { Metadata } from 'next'
import { Fraunces } from 'next/font/google'
import { MaterialSymbolsLink } from '@/components/ui/MaterialSymbolsLink'

export const metadata: Metadata = {
  title: 'Fitter App | Tarda',
  applicationName: 'Fitter App',
  description: 'Professional measurement and customer fitting workspace.',
}

// Fonts scoped to this route only — independent from every other frozen
// feature's layout. Weight trimmed to 400 (AP-03 audit: no font-fraunces
// element in this route ever pairs with a font-weight utility class).
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-fraunces',
})

export default function OrderCreatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fraunces.variable} contents`}>
      <MaterialSymbolsLink />
      {children}
    </div>
  )
}
