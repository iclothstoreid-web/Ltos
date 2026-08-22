import type { Metadata } from 'next'
import { MaterialSymbolsLink } from '@/components/ui/MaterialSymbolsLink'

// MasterDataManager (shared by Owner OS & Fitter) uses material-symbols-outlined
// icons throughout, but unlike every /workspace/* route this route had no
// layout loading that font — icons rendered as raw ligature text
// (e.g. "radio_button_checked") instead of glyphs. Same fix, same pattern,
// as workspace/check-in/layout.tsx etc.
export const metadata: Metadata = {
  title: 'Master Data | Owner OS',
  description: 'Owner OS — Tarda Operating System',
  applicationName: 'Owner OS',
  openGraph: {
    title: 'Owner OS',
    description: 'Tarda Operating System',
  },
}

export default function MasterDataLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MaterialSymbolsLink />
      {children}
    </>
  )
}
