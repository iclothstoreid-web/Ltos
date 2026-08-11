'use client'

import { Drawer } from 'vaul'
import type { ConfiguratorCatalog } from '@/lib/configurator/mapping'
import { ConfiguratorPanel } from './ConfiguratorPanel'

interface MobileConfiguratorDrawerProps {
  catalog: ConfiguratorCatalog | null
  loading?: boolean
  error?: string | null
}

// Mobile-only bottom sheet (vaul — the same drag-to-close primitive shadcn's
// Drawer wraps). Reuses ConfiguratorPanel as-is; its own accordion behavior
// already applies below the md breakpoint, and this drawer's trigger/overlay/
// content are all md:hidden, so nothing renders twice on desktop.
export function MobileConfiguratorDrawer({ catalog, loading, error }: MobileConfiguratorDrawerProps) {
  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-30 cursor-pointer rounded-full bg-luxury-gold px-5 py-3 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-black shadow-lg md:hidden"
        >
          Ubah Pilihan
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50 md:hidden" />
        {/* z-40, below StickyCTA's z-50 (W2-5) — the CTA bar stays visibly
            on top of this sheet instead of getting covered by it (vaul
            portals to the end of <body>, so DOM order alone can't be relied
            on for stacking). The inner scroll area's extra bottom padding
            keeps the last field (embroidery text) reachable above that bar. */}
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-40 flex max-h-[80vh] flex-col rounded-t-2xl bg-luxury-navy-deep outline-none md:hidden">
          <Drawer.Handle className="mx-auto mt-3 h-1.5 w-10 shrink-0 bg-luxury-taupe/30" />
          <Drawer.Title className="px-6 pt-4 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-ivory">
            Konfigurasi
          </Drawer.Title>
          <div className="flex-1 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom))]">
            <ConfiguratorPanel catalog={catalog} loading={loading} error={error} />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
