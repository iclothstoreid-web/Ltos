import type { Metadata } from 'next'
import { APP_BRANDING } from '@/lib/auth/branding'

const app = APP_BRANDING.inventory

export const metadata: Metadata = {
  title: app.browserTitle,
  description: app.description,
  applicationName: app.name,
  openGraph: {
    title: app.name,
    description: app.description,
  },
}

export default function InventoryLoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
