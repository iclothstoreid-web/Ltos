import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Owner OS | Local Tailor',
  description: 'Owner OS — Local Tailor Operating System',
  applicationName: 'Owner OS',
  openGraph: {
    title: 'Owner OS',
    description: 'Local Tailor Operating System',
  },
}

export default function CommandCenterLayout({ children }: { children: React.ReactNode }) {
  return children
}
