'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadConsultationDocument } from '@/lib/consultation/media'
import type { ConsultationDocument } from './fitterEnhancementsCodec'

const CATEGORIES = [
  'Referensi Customer',
  'Referensi Model',
  'Referensi Bordir',
  'Referensi Motif',
  'File Pendukung Lainnya',
]

interface DocumentUploaderProps {
  consultationId: string
  documents: ConsultationDocument[]
  onChange: (documents: ConsultationDocument[]) => void
}

export function DocumentUploader({ consultationId, documents, onChange }: DocumentUploaderProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { id, url } = await uploadConsultationDocument(supabase, { consultationId, file })
      const doc: ConsultationDocument = {
        id,
        category,
        name: file.name,
        url,
        uploadedAt: new Date().toISOString(),
      }
      onChange([...documents, doc])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah dokumen.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleRemove(id: string) {
    onChange(documents.filter(doc => doc.id !== id))
  }

  return (
    <section className="bg-white p-4 shadow-sm border-[0.5px] border-[#c4c7c7]">
      <h3 className="font-sans text-xs text-[#151c27] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">upload_file</span>
        Unggah Dokumen
      </h3>

      {error && <p className="text-xs text-[#c0392b] mb-4">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border-[0.5px] border-[#c4c7c7] bg-transparent p-2 text-sm outline-none focus:border-[#775a19]"
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-[#151c27] text-white text-xs uppercase tracking-widest hover:bg-[#775a19] transition-colors disabled:opacity-40"
        >
          {uploading ? 'Mengunggah...' : 'Unggah File (JPG/PNG/PDF)'}
        </button>
      </div>

      {documents.length === 0 ? (
        <p className="text-xs text-[#444748]">Belum ada file yang diunggah.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map(doc => (
            <li
              key={doc.id}
              className="flex items-center gap-3 border-[0.5px] border-[#c4c7c7]/40 px-3 py-2 text-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-[#775a19]">description</span>
              <span className="flex-1 truncate">{doc.name}</span>
              <span className="text-[10px] uppercase tracking-widest text-[#444748] px-2 py-1 bg-[#444748]/10">
                {doc.category}
              </span>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-[#775a19] hover:underline"
              >
                Lihat
              </a>
              <button
                type="button"
                onClick={() => handleRemove(doc.id)}
                className="material-symbols-outlined text-[16px] text-[#c0392b]"
              >
                close
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
