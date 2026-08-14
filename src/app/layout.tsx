import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LTOS — Local Tailor Operating System',
  description: 'Vertical Business Operating System for premium custom tailoring',
  manifest: '/manifest.json',
}

// LTOS Brand System Rollout — themeColor lives on `viewport`, not
// `metadata`, since Next.js 14 (matches the brand's luxury-navy-deep, the
// same token every dark surface across the marketing site already uses).
export const viewport: Viewport = {
  themeColor: '#151210',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-surface text-on-surface antialiased`}>
        {/* Sprint W9-1 §15 — root-level mount: GA4/Clarity loading,
            attribution capture, a baseline page_view on every route, and
            experiment context. Renders no visible UI itself — zero impact
            on any page's markup. Both loaders no-op until a real
            NEXT_PUBLIC_GA4_MEASUREMENT_ID / NEXT_PUBLIC_CLARITY_PROJECT_ID
            is set (see src/lib/analytics/constants.ts). */}
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  )
}
