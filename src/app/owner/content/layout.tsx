import type { Metadata } from 'next'
import { MaterialSymbolsLink } from '@/components/ui/MaterialSymbolsLink'

export const metadata: Metadata = {
  title: 'Content | Owner OS',
  description: 'Owner OS — Website Content & Media',
  applicationName: 'Owner OS',
}

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MaterialSymbolsLink />
      {children}
    </>
  )
}
