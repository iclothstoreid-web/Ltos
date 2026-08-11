'use client'

import { formatRupiah } from '@/lib/format/money'
import { useConfiguratorStore } from '@/stores/configurator-store'
import { SaveDesignModal } from '@/components/design-share/SaveDesignModal'

const SAVE_TRIGGER_CLASSNAME =
  'cursor-pointer rounded-full bg-luxury-gold px-6 py-3 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-black transition disabled:cursor-not-allowed disabled:opacity-40'

// Mobile-only sticky bar — mirrors the marketing StickyMobileCta pattern
// (src/components/marketing/shell/StickyMobileCta.tsx) but shows the live
// running estimate instead of a static label.
//
// z-50 (W2-5, was z-40): MobileConfiguratorDrawer's overlay/content are
// also z-40, and vaul portals them to the end of <body> — same z-index
// plus later DOM position meant the open drawer silently rendered on top
// of this bar, hiding it. Verified against vaul's source (Portal defaults
// to document.body, no `container` override). Giving this bar the higher
// index guarantees it stays visible per the original W2-2 intent ("sticky
// CTA tetap terlihat") no matter what's open beneath it.
export function StickyCTA() {
  const estimate = useConfiguratorStore((s) => s.estimate)
  const ready = estimate.status === 'ready'

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-4 border-t border-luxury-gold/20 bg-luxury-navy-deep/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <div className="font-luxury-sans" aria-live="polite">
        <p className="text-[10px] uppercase tracking-[0.1em] text-luxury-taupe">Estimasi</p>
        <p className="text-sm text-luxury-ivory">{ready ? formatRupiah(estimate.total) : '—'}</p>
      </div>
      <SaveDesignModal triggerLabel="Simpan" triggerClassName={SAVE_TRIGGER_CLASSNAME} disabled={!ready} />
    </div>
  )
}
