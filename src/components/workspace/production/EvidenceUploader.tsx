'use client'

import { useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ProductionStage } from '@/lib/production/types'
import { uploadEvidencePhoto } from '@/lib/production/client'

interface EvidenceUploaderProps {
  supabase: SupabaseClient
  orderId: string
  stage: ProductionStage
  attempt: number
  value: string | null
  onChange: (url: string) => void
  // Mirrors this component's own `uploading`/`error` state up to the parent.
  // Needed because the pre-scan custom-panel-shell stages unmount this whole
  // component the instant "Scan QR Penyelesaian" succeeds (see
  // ProductionPacketWorkspace) — without this, an in-flight or failed upload
  // becomes invisible (and unrecoverable via canApprove) the moment the
  // operator scans, since nothing else ever surfaces that state again.
  onUploadingChange?: (uploading: boolean) => void
  onErrorChange?: (error: string | null) => void
}

// Single-photo evidence, max 1 per stage per the brief ("Maksimal 1 Foto per
// tahapan"). Same button/input/preview mechanic as measurement's
// PhotoUploader, but this one actually persists to Supabase Storage.
export function EvidenceUploader({
  supabase,
  orderId,
  stage,
  attempt,
  value,
  onChange,
  onUploadingChange,
  onErrorChange,
}: EvidenceUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    onErrorChange?.(null)
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    onUploadingChange?.(true)
    try {
      const url = await uploadEvidencePhoto(supabase, { orderId, stage, attempt, file })
      onChange(url)
    } catch (err) {
      console.error('[production] evidence upload failed', err)
      setPreview(value)
      const message = 'Gagal mengunggah foto. Coba lagi.'
      setError(message)
      onErrorChange?.(message)
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
    }
  }

  return (
    <div>
      <label className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] block mb-2">
        Bukti Foto
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full aspect-video bg-[#efedf0] border-[0.5px] border-dashed border-[#c6c6cc]
                   flex flex-col items-center justify-center gap-1 group cursor-pointer
                   hover:bg-[#efedf0] transition-colors relative overflow-hidden disabled:opacity-60"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL / local blob preview
          <img
            src={preview}
            alt="Pratinjau bukti foto"
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <>
            <span className="material-symbols-outlined text-[#c6c6cc] group-hover:text-[#755b00] transition-colors">
              add_a_photo
            </span>
            <p className="text-[10px] text-[#46464c] uppercase tracking-widest">
              {uploading ? 'Mengunggah...' : 'Ambil Foto'}
            </p>
          </>
        )}
      </button>
      {error && (
        <p className="font-hanken text-[10px] text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
