'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  WEBSITE_MEDIA_CATEGORIES,
  updateWebsiteMedia,
  deleteWebsiteMedia,
  fetchWebsiteMediaUsage,
  type WebsiteMedia,
  type WebsiteMediaCategory,
} from '@/lib/content/websiteMedia'
import { websiteMediaRawUrl } from '@/lib/content/mediaUrl'
import { ContentShell, PrimaryButton, GhostButton, Field, inputClass, StatusPill, MediaThumb } from './contentUi'
import { MediaPicker } from './MediaPicker'

export function MediaLibrary({ initialMedia }: { initialMedia: WebsiteMedia[] }) {
  const [supabase] = useState(() => createClient())
  const [media, setMedia] = useState(initialMedia)
  const [filter, setFilter] = useState<WebsiteMediaCategory | 'all'>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [q, setQ] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editing, setEditing] = useState<WebsiteMedia | null>(null)

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase()
    return media
      .filter((m) => showArchived || m.status === 'active')
      .filter((m) => filter === 'all' || m.category === filter)
      .filter((m) => !term || m.title.toLowerCase().includes(term) || m.alt_text.toLowerCase().includes(term))
  }, [media, filter, showArchived, q])

  return (
    <ContentShell
      title="Media Library"
      actions={
        <PrimaryButton onClick={() => setUploadOpen(true)}>
          <span className="material-symbols-outlined text-[18px]">upload</span> Upload
        </PrimaryButton>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select value={filter} onChange={(e) => setFilter(e.target.value as WebsiteMediaCategory | 'all')} className={`${inputClass} w-auto`}>
          <option value="all">Semua kategori</option>
          {WEBSITE_MEDIA_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari…" className={`${inputClass} w-48`} />
        <label className="flex items-center gap-1.5 font-sans text-sm text-[#444748]">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Tampilkan arsip
        </label>
        <span className="ml-auto font-sans text-sm text-[#444748]">{shown.length} media</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((m) => (
          <button
            key={m.id}
            onClick={() => setEditing(m)}
            className={`group overflow-hidden rounded-xl border bg-white text-left transition hover:border-[#755b00]/60 ${m.status === 'archived' ? 'border-dashed border-[#c4c7c7] opacity-60' : 'border-[#c4c7c7]'}`}
          >
            <span className="block aspect-square w-full overflow-hidden bg-[#eceef4]">
              <MediaThumb path={m.storage_path} alt={m.alt_text} size={300} />
            </span>
            <span className="block px-2 py-1.5">
              <span className="block truncate font-sans text-xs font-medium text-[#151c27]">{m.title}</span>
              <span className="mt-0.5 flex items-center gap-1.5">
                <span className="font-sans text-[10px] uppercase tracking-[0.04em] text-[#444748]">{m.category}</span>
                {m.status === 'archived' && <StatusPill status="archived" />}
              </span>
            </span>
          </button>
        ))}
        {shown.length === 0 && <p className="col-span-full py-12 text-center font-sans text-sm text-[#444748]">Belum ada media.</p>}
      </div>

      {uploadOpen && (
        <MediaPicker
          media={media}
          title="Upload Media"
          onClose={() => setUploadOpen(false)}
          onPicked={() => setUploadOpen(false)}
          onUploaded={(m) => setMedia((prev) => [m, ...prev])}
        />
      )}

      {editing && (
        <EditMediaModal
          media={editing}
          onClose={() => setEditing(null)}
          onSaved={(m) => setMedia((prev) => prev.map((x) => (x.id === m.id ? m : x)))}
          onDeleted={(id) => setMedia((prev) => prev.filter((x) => x.id !== id))}
          save={(id, patch) => updateWebsiteMedia(supabase, id, patch)}
          checkUsage={(id) => fetchWebsiteMediaUsage(supabase, id)}
          del={(m) => deleteWebsiteMedia(supabase, m)}
        />
      )}
    </ContentShell>
  )
}

function EditMediaModal({
  media,
  onClose,
  onSaved,
  onDeleted,
  save,
  checkUsage,
  del,
}: {
  media: WebsiteMedia
  onClose: () => void
  onSaved: (m: WebsiteMedia) => void
  onDeleted: (id: string) => void
  save: (id: string, patch: Partial<Pick<WebsiteMedia, 'title' | 'alt_text' | 'caption' | 'category' | 'status'>>) => Promise<void>
  checkUsage: (id: string) => Promise<{ gallery: number; journalCover: number; journalOg: number; homepageSlots: string[] }>
  del: (m: WebsiteMedia) => Promise<void>
}) {
  const [title, setTitle] = useState(media.title)
  const [alt, setAlt] = useState(media.alt_text)
  const [caption, setCaption] = useState(media.caption ?? '')
  const [category, setCategory] = useState<WebsiteMediaCategory>(media.category)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [usage, setUsage] = useState<Awaited<ReturnType<typeof checkUsage>> | null>(null)

  async function persist(extra?: Partial<Pick<WebsiteMedia, 'status'>>) {
    if (!alt.trim()) return setErr('Alt text wajib.')
    setBusy(true)
    setErr(null)
    try {
      const patch = { title: title.trim(), alt_text: alt.trim(), caption: caption.trim() || null, category, ...extra }
      await save(media.id, patch)
      onSaved({ ...media, ...patch, caption: patch.caption, updated_at: new Date().toISOString() })
      onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal menyimpan.')
    } finally {
      setBusy(false)
    }
  }

  async function tryDelete() {
    setBusy(true)
    setErr(null)
    try {
      const u = usage ?? (await checkUsage(media.id))
      setUsage(u)
      const total = u.gallery + u.journalCover + u.journalOg + u.homepageSlots.length
      if (total > 0) {
        setErr(
          `Tidak bisa dihapus — masih dipakai: ${[
            u.gallery && `${u.gallery} gallery`,
            u.journalCover && `${u.journalCover} cover artikel`,
            u.journalOg && `${u.journalOg} OG artikel`,
            u.homepageSlots.length && `homepage: ${u.homepageSlots.join(', ')}`,
          ].filter(Boolean).join(', ')}. Lepaskan dulu atau arsipkan saja.`
        )
        setBusy(false)
        return
      }
      await del(media)
      onDeleted(media.id)
      onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal menghapus.')
      setBusy(false)
    }
  }

  const rawUrl = websiteMediaRawUrl(media.storage_path)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#f9f9ff] p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between">
          <h2 className="font-sans text-base font-medium text-[#151c27]">Edit Media</h2>
          <button onClick={onClose} aria-label="Tutup" className="flex h-8 w-8 items-center justify-center rounded-full text-[#444748] hover:bg-[#151c27]/5">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="mb-4 flex gap-3">
          <MediaThumb path={media.storage_path} alt={media.alt_text} size={120} />
          <div className="min-w-0 font-sans text-xs text-[#444748]">
            <p>{media.width && media.height ? `${media.width}×${media.height}px` : '—'}</p>
            <p>{media.byte_size ? `${(media.byte_size / 1024 / 1024).toFixed(2)} MB` : ''}</p>
            <p className="truncate">{media.mime_type}</p>
            {rawUrl && (
              <a href={rawUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[#755b00] underline">
                buka original
              </a>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <Field label="Judul"><input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} /></Field>
          <Field label="Alt text"><input value={alt} onChange={(e) => setAlt(e.target.value)} className={inputClass} /></Field>
          <Field label="Caption"><input value={caption} onChange={(e) => setCaption(e.target.value)} className={inputClass} /></Field>
          <Field label="Kategori">
            <select value={category} onChange={(e) => setCategory(e.target.value as WebsiteMediaCategory)} className={inputClass}>
              {WEBSITE_MEDIA_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          {err && <p className="font-sans text-sm text-[#ba1a1a]">{err}</p>}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <PrimaryButton onClick={() => persist()} disabled={busy}>Simpan</PrimaryButton>
            <GhostButton onClick={() => persist({ status: media.status === 'active' ? 'archived' : 'active' })} disabled={busy}>
              {media.status === 'active' ? 'Arsipkan' : 'Aktifkan'}
            </GhostButton>
            <button
              onClick={tryDelete}
              disabled={busy}
              className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-2 font-sans text-sm text-[#ba1a1a] transition hover:bg-[#ba1a1a]/10 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span> Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
