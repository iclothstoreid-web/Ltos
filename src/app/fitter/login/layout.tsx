import type { Metadata } from 'next'
import { APP_BRANDING } from '@/lib/auth/branding'

const app = APP_BRANDING.fitter

export const metadata: Metadata = {
  title: app.browserTitle,
  applicationName: app.name,
  description: app.description,
}

export default function FitterLoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
