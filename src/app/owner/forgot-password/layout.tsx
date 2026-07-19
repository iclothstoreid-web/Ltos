import type { Metadata } from 'next'
import { APP_BRANDING } from '@/lib/auth/branding'

const app = APP_BRANDING.owner

export const metadata: Metadata = {
  title: `Lupa Password | ${app.name}`,
  description: app.subtitle,
  applicationName: app.name,
  openGraph: {
    title: app.name,
    description: app.subtitle,
  },
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
