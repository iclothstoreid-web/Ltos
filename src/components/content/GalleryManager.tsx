'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  addGalleryItem,
  updateGalleryItem,
  removeGalleryItem,
  reorderGalleryItems,
  type GalleryItemRow,
} from '@/lib/content/galleryItems'
import type { WebsiteMedia } from '@/lib/content/websiteMedia'
import { ContentShell, PrimaryButton, MediaThumb, inputClass } from './contentUi'
import { MediaPicker } from './MediaPicker'

export function GalleryManager({
  initialItems,
  initialMedia,
}: {
  initialItems: GalleryItemRow[]
  initialMedia: WebsiteMedia[]
}) {
  const [supabase] = useState(() => createClient())
  const [items, setItems] = useState(initialItems)
  const [media, setMedia] = useState(initialMedia)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const mediaById = useMemo(() => new Map(media.map((m) => [m.id, m])), [media])
  const active = items.filter((i) => i.status === 'active')

  async function add(m: WebsiteMedia) {
    setBusy(true)
    try {
      const row = await addGalleryItem(supabase, { media_id: m.id, category: m.category })
      setItems((prev) => [...prev, row])
    } finally {
      setBusy(false)
      setPickerOpen(false)
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const ordered = [...active].sort((a, b) => a.sort_order - b.sort_order)
    const idx = ordered.findIndex((i) => i.id === id)
    const swap = idx + dir
    if (swap < 0 || swap >= ordered.length) return
    ;[ordered[idx], ordered[swap]] = [ordered[swap], ordered[idx]]
    const newOrder = ordered.map((i, n) => ({ ...i, sort_order: n }))
    setItems((prev) => prev.map((p) => newOrder.find((n) => n.id === p.id) ?? p))
    await reorderGalleryItems(supabase, ordered.map((i) => i.id))
  }

  async function patch(id: string, p: Partial<Pick<GalleryItemRow, 'caption' | 'featured' | 'status'>>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...p } : i)))
    await updateGalleryItem(supabase, id, p)
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await removeGalleryItem(supabase, id)
  }

  const ordered = [...active].sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order)

  return (
    <ContentShell
      title="Gallery"
      actions={
        <PrimaryButton onClick={() => setPickerOpen(true)} disabled={busy}>
          <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span> Tambah
        </PrimaryButton>
      }
    >
      <p className="mb-4 font-sans text-sm text-[#444748]">
        {active.length} item aktif. Item featured tampil paling depan di /gallery. Urutan diatur dengan panah.
      </p>

      <ul className="space-y-2">
        {ordered.map((item, n) => {
          const m = mediaById.get(item.media_id)
          return (
            <li key={item.id} className="flex items-center gap-3 rounded-xl border border-[#c4c7c7] bg-white p-2">
              <div className="flex flex-col">
                <button onClick={() => move(item.id, -1)} disabled={n === 0 || item.featured} aria-label="Naik" className="text-[#444748] disabled:opacity-30">
                  <span className="material-symbols-outlined text-[18px]">arrow_drop_up</span>
                </button>
                <button onClick={() => move(item.id, 1)} disabled={n === ordered.length - 1 || item.featured} aria-label="Turun" className="text-[#444748] disabled:opacity-30">
                  <span className="material-symbols-outlined text-[18px]">arrow_drop_down</span>
                </button>
              </div>
              <MediaThumb path={m?.storage_path ?? null} alt={m?.alt_text} size={64} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm font-medium text-[#151c27]">{m?.title ?? '(media terhapus)'}</p>
                <input
                  defaultValue={item.caption ?? ''}
                  onBlur={(e) => e.target.value !== (item.caption ?? '') && patch(item.id, { caption: e.target.value || null })}
                  placeholder="Caption (opsional)"
                  className={`${inputClass} mt-1 py-1 text-xs`}
                />
              </div>
              <label className="flex items-center gap-1 font-sans text-xs text-[#444748]">
                <input type="checkbox" checked={item.featured} onChange={(e) => patch(item.id, { featured: e.target.checked })} />
                Featured
              </label>
              <button onClick={() => remove(item.id)} aria-label="Hapus" className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 rounded-full p-1.5">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </li>
          )
        })}
        {ordered.length === 0 && <p className="py-10 text-center font-sans text-sm text-[#444748]">Galeri kosong.</p>}
      </ul>

      {pickerOpen && (
        <MediaPicker
          media={media}
          defaultCategory="gallery"
          title="Tambah ke Gallery"
          onClose={() => setPickerOpen(false)}
          onPicked={add}
          onUploaded={(m) => setMedia((prev) => [m, ...prev])}
        />
      )}
    </ContentShell>
  )
}
