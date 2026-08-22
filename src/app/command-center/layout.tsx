import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Owner OS | Tarda',
  description: 'Owner OS — Tarda Operating System',
  applicationName: 'Owner OS',
  openGraph: {
    title: 'Owner OS',
    description: 'Tarda Operating System',
  },
}

export default function CommandCenterLayout({ children }: { children: React.ReactNode }) {
  return children
}
