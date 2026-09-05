import type { Metadata } from 'next'

// Customer-facing route, outside auth and outside next-intl locale routing
// (see middleware.ts NO_LOCALE_PREFIXES) — same treatment as /journey.
// Overrides the root layout's internal-facing metadata so a customer never
// sees "LTOS" in their browser tab or in a shared link preview.
export const metadata: Metadata = {
  title: 'Isi Desain & Ukuran | Local Tailor',
  description: 'Pilih model dan isi ukuran Anda sendiri untuk konsultasi Local Tailor.',
  applicationName: 'Local Tailor',
  robots: { index: false, follow: false },
}

export default function CustomerConsultationRouteLayout({ children }: { children: React.ReactNode }) {
  return <div className="contents">{children}</div>
}
