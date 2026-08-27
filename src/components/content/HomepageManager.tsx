'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HOMEPAGE_SLOTS, setHomepageSlot, type HomepageSlotRow, type HomepageSlotKey } from '@/lib/content/homepageMedia'
import type { WebsiteMedia } from '@/lib/content/websiteMedia'
import { ContentShell, GhostButton, MediaThumb } from './contentUi'
import { MediaPicker } from './MediaPicker'

export function HomepageManager({
  initialSlots,
  initialMedia,
}: {
  initialSlots: HomepageSlotRow[]
  initialMedia: WebsiteMedia[]
}) {
  const [supabase] = useState(() => createClient())
  const [slots, setSlots] = useState<Record<string, string | null>>(
    () => Object.fromEntries(HOMEPAGE_SLOTS.map((s) => [s.key, initialSlots.find((r) => r.slot_key === s.key)?.media_id ?? null]))
  )
  const [media, setMedia] = useState(initialMedia)
  const [picking, setPicking] = useState<HomepageSlotKey | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const mediaById = useMemo(() => new Map(media.map((m) => [m.id, m])), [media])

  async function assign(slot: HomepageSlotKey, mediaId: string | null) {
    setBusy(slot)
    try {
      await setHomepageSlot(supabase, slot, mediaId)
      setSlots((prev) => ({ ...prev, [slot]: mediaId }))
    } finally {
      setBusy(null)
      setPicking(null)
    }
  }

  return (
    <ContentShell title="Homepage Content">
      <p className="mb-5 max-w-2xl font-sans text-sm text-[#444748]">
        Ganti gambar per section homepage. Slot kosong = section pakai asset bawaan (tidak akan blank).
        Perubahan tampil di localtailor.id dalam beberapa menit.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {HOMEPAGE_SLOTS.map((slot) => {
          const m = slots[slot.key] ? mediaById.get(slots[slot.key]!) : null
          return (
            <div key={slot.key} className="rounded-2xl border border-[#c4c7c7] bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-sans text-sm font-medium text-[#151c27]">{slot.label}</p>
                  <p className="font-sans text-xs text-[#444748]">{slot.hint}</p>
                </div>
                {m && (
                  <button
                    onClick={() => assign(slot.key, null)}
                    disabled={busy === slot.key}
                    className="font-sans text-xs text-[#ba1a1a] hover:underline"
                  >
                    Kosongkan
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <MediaThumb path={m?.storage_path ?? null} alt={m?.alt_text} size={96} />
                <div className="min-w-0">
                  <p className="truncate font-sans text-xs text-[#151c27]">{m ? m.title : 'Belum diatur — pakai asset bawaan'}</p>
                  <GhostButton onClick={() => setPicking(slot.key)} disabled={busy === slot.key} className="mt-2 px-3 py-1 text-xs">
                    {m ? 'Ganti' : 'Pilih gambar'}
                  </GhostButton>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {picking && (
        <MediaPicker
          media={media}
          defaultCategory="homepage"
          title={`Pilih gambar — ${HOMEPAGE_SLOTS.find((s) => s.key === picking)?.label}`}
          onClose={() => setPicking(null)}
          onPicked={(m) => assign(picking, m.id)}
          onUploaded={(m) => setMedia((prev) => [m, ...prev])}
        />
      )}
    </ContentShell>
  )
}
