'use client'

import { useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  WEBSITE_MEDIA_CATEGORIES,
  uploadWebsiteMedia,
  type WebsiteMedia,
  type WebsiteMediaCategory,
} from '@/lib/content/websiteMedia'
import { GhostButton, PrimaryButton, Field, inputClass, MediaThumb } from './contentUi'

interface MediaPickerProps {
  media: WebsiteMedia[]
  onPicked: (m: WebsiteMedia) => void
  onClose: () => void
  onUploaded: (m: WebsiteMedia) => void
  defaultCategory?: WebsiteMediaCategory
  title?: string
}

// Modal used by Articles / Gallery / Homepage to choose an existing asset
// or upload a new one into the Media Library in place.
export function MediaPicker({ media, onPicked, onClose, onUploaded, defaultCategory = 'general', title = 'Pilih Media' }: MediaPickerProps) {
  const [supabase] = useState(() => createClient())
  const [tab, setTab] = useState<'library' | 'upload'>('library')
  const [filter, setFilter] = useState<WebsiteMediaCategory | 'all'>('all')
  const [q, setQ] = useState('')

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase()
    return media
      .filter((m) => m.status === 'active')
      .filter((m) => filter === 'all' || m.category === filter)
      .filter((m) => !term || m.title.toLowerCase().includes(term) || m.alt_text.toLowerCase().includes(term))
  }, [media, filter, q])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-[#f9f9ff]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#c4c7c7] px-5 py-3">
          <h2 className="font-sans text-base font-medium text-[#151c27]">{title}</h2>
          <button onClick={onClose} aria-label="Tutup" className="flex h-8 w-8 items-center justify-center rounded-full text-[#444748] hover:bg-[#151c27]/5">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex gap-2 border-b border-[#c4c7c7] px-5 py-2">
          {(['library', 'upload'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 font-sans text-sm transition ${tab === t ? 'bg-[#755b00] text-white' : 'text-[#444748] hover:bg-[#151c27]/5'}`}
            >
              {t === 'library' ? 'Dari Library' : 'Upload Baru'}
            </button>
          ))}
        </div>

        {tab === 'library' ? (
          <>
            <div className="flex flex-wrap items-center gap-2 px-5 py-3">
              <select value={filter} onChange={(e) => setFilter(e.target.value as WebsiteMediaCategory | 'all')} className={`${inputClass} w-auto`}>
                <option value="all">Semua kategori</option>
                {WEBSITE_MEDIA_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari judul / alt…" className={`${inputClass} w-48`} />
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto px-5 pb-5 sm:grid-cols-3">
              {shown.length === 0 && <p className="col-span-full py-8 text-center font-sans text-sm text-[#444748]">Belum ada media.</p>}
              {shown.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onPicked(m)}
                  className="group overflow-hidden rounded-lg border border-[#c4c7c7] bg-white text-left transition hover:border-[#755b00]"
                >
                  <span className="block aspect-square w-full overflow-hidden bg-[#eceef4]">
                    <MediaThumb path={m.storage_path} alt={m.alt_text} size={220} />
                  </span>
                  <span className="block truncate px-2 py-1.5 font-sans text-xs text-[#151c27]">{m.title}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <UploadForm
            defaultCategory={defaultCategory}
            onDone={(m) => {
              onUploaded(m)
              onPicked(m)
            }}
            upload={(params) => uploadWebsiteMedia(supabase, params)}
          />
        )}
      </div>
    </div>
  )
}

function UploadForm({
  defaultCategory,
  onDone,
  upload,
}: {
  defaultCategory: WebsiteMediaCategory
  onDone: (m: WebsiteMedia) => void
  upload: (p: {
    file: File
    title: string
    altText: string
    caption?: string
    category: WebsiteMediaCategory
    width?: number
    height?: number
  }) => Promise<WebsiteMedia>
}) {
  const [file, setFile] = useState<File | null>(null)
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)
  const [title, setTitle] = useState('')
  const [alt, setAlt] = useState('')
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState<WebsiteMediaCategory>(defaultCategory)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const previewRef = useRef<string | null>(null)

  function onFile(f: File | null) {
    setFile(f)
    setErr(null)
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    if (!f) return setDims(null)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''))
    const url = URL.createObjectURL(f)
    previewRef.current = url
    const img = new Image()
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = url
  }

  async function submit() {
    if (!file) return setErr('Pilih file dulu.')
    if (!alt.trim()) return setErr('Alt text wajib diisi (aksesibilitas & SEO).')
    setBusy(true)
    setErr(null)
    try {
      const m = await upload({
        file,
        title: title.trim() || file.name,
        altText: alt.trim(),
        caption: caption.trim() || undefined,
        category,
        width: dims?.w,
        height: dims?.h,
      })
      onDone(m)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload gagal.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        className="block w-full font-sans text-sm text-[#444748] file:mr-3 file:rounded-full file:border-0 file:bg-[#755b00] file:px-3 file:py-1.5 file:text-white"
      />
      {file && (
        <p className="font-sans text-xs text-[#444748]">
          {(file.size / 1024 / 1024).toFixed(2)} MB{dims ? ` · ${dims.w}×${dims.h}px` : ''}
        </p>
      )}
      <Field label="Judul">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Alt text" hint="Deskripsi singkat gambar — wajib.">
        <input value={alt} onChange={(e) => setAlt(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Caption (opsional)">
        <input value={caption} onChange={(e) => setCaption(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Kategori">
        <select value={category} onChange={(e) => setCategory(e.target.value as WebsiteMediaCategory)} className={inputClass}>
          {WEBSITE_MEDIA_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Field>
      {err && <p className="font-sans text-sm text-[#ba1a1a]">{err}</p>}
      <div className="flex justify-end pt-1">
        <PrimaryButton onClick={submit} disabled={busy}>
          {busy ? 'Mengunggah…' : 'Upload & Pilih'}
        </PrimaryButton>
      </div>
    </div>
  )
}
