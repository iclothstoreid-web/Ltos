'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadConsultationPhoto } from '@/lib/consultation/media'

const UPLOAD_ERROR_MESSAGE = 'Gagal mengunggah foto. Silakan coba lagi.'

interface PhotoUploaderProps {
  consultationId: string
  initialPhotoUrl?: string | null
  // May return a Promise (MeasurementWorkspace's handler awaits its own DB
  // commit) — uploadPhoto below awaits it too, so `uploading` (and
  // onUploadStateChange) only clears once the photo is actually committed
  // to consultations.notes, not just once Storage accepted the file.
  onUploaded: (url: string) => void | Promise<void>
  // Lets the parent gate "Lanjut ke Design Studio" on the actual in-flight
  // upload, not just its own post-commit state — closes the window where a
  // fitter could click Lanjut while a photo is still uploading.
  onUploadStateChange?: (uploading: boolean) => void
}

// Foto Pelanggan is captured/selected here, then uploaded straight to the
// same `consultation-photos` Supabase Storage bucket Consultation Review
// used to write to — Measurement is now the single source of truth for this
// photo (see CustomerDigitalProfile), so it always uploads under the
// 'front' slot regardless of camera vs. gallery origin.
export function PhotoUploader({ consultationId, initialPhotoUrl, onUploaded, onUploadStateChange }: PhotoUploaderProps) {
  const [supabase] = useState(() => createClient())
  const [preview, setPreview] = useState<string | null>(initialPhotoUrl ?? null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)

  async function uploadPhoto(file: File) {
    setUploading(true)
    onUploadStateChange?.(true)
    setUploadError(null)
    try {
      // Root-cause audit (2026-07-28) proved the upload code path itself
      // correct end-to-end (real device/network could not be reproduced) —
      // this diagnostic snapshot is what would have made that provable from
      // a single production occurrence instead of a multi-hour repro effort.
      const { data: { session } } = await supabase.auth.getSession()
      const expiresAt = session?.expires_at ?? null
      console.info('[PhotoUploader] pre-upload diagnostics', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasSession: Boolean(session),
        hasAccessToken: Boolean(session?.access_token),
        jwtExpiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : null,
        jwtSecondsUntilExpiry: expiresAt ? expiresAt - Math.floor(Date.now() / 1000) : null,
      })

      const url = await uploadConsultationPhoto(supabase, { consultationId, slot: 'front', file })
      setPreview(url)
      await onUploaded(url)
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err)
      console.error('uploadConsultationPhoto failed:', err)
      setUploadError(`${UPLOAD_ERROR_MESSAGE} (${detail})`)
    } finally {
      setUploading(false)
      onUploadStateChange?.(false)
    }
  }

  function handleUploadFile(file: File | undefined) {
    if (!file) return
    uploadPhoto(file)
  }

  return (
    <div>
      <p className="font-sans text-xs uppercase tracking-widest text-[#444748] mb-4">
        Foto Pelanggan
      </p>

      <input
        ref={el => {
          galleryInputRef.current = el
        }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleUploadFile(e.target.files?.[0])}
      />
      {/* Native device camera capture — accept + capture="environment" opens
          the OS camera app full screen (back camera preferred) instead of a
          getUserMedia() live preview. The browser returns the captured shot
          as a regular File through this same input's onChange once the user
          confirms it in the native camera UI, so it reuses the exact upload
          path as gallery selection below. */}
      <input
        ref={el => {
          cameraInputRef.current = el
        }}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => handleUploadFile(e.target.files?.[0])}
      />

      {uploadError && <p className="text-xs text-[#c0392b] mb-2">{uploadError}</p>}

      {preview ? (
        <div className="space-y-2">
          {/* Sprint UX-03.1 (Photo Display Consistency) — matches the
              uploading state below in aspect ratio (aspect-[9/16]), so the
              photo doesn't visibly resize the moment it finishes uploading. */}
          <div className="relative mx-auto w-auto h-[70vh] max-h-[640px] min-h-[360px] aspect-[9/16] bg-[#f0f3ff] border-[0.5px] border-dashed border-[#c4c7c7] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote/optimizable asset */}
            <img
              src={preview}
              alt="Pratinjau foto pelanggan"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 text-[10px] uppercase tracking-widest text-[#775a19] border-[0.5px] border-[#c4c7c7] py-2 hover:bg-[#f0f3ff] transition-colors"
            >
              Ambil Ulang
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex-1 text-[10px] uppercase tracking-widest text-[#444748] border-[0.5px] border-[#c4c7c7] py-2 hover:bg-[#f0f3ff] transition-colors"
            >
              Ganti Foto
            </button>
          </div>
        </div>
      ) : uploading ? (
        <div className="relative mx-auto w-auto h-[70vh] max-h-[640px] min-h-[360px] aspect-[9/16] bg-[#f0f3ff] border-[0.5px] border-dashed border-[#c4c7c7] flex items-center justify-center">
          <p className="text-[10px] text-[#444748] uppercase tracking-widest">Mengunggah...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="aspect-square bg-[#f0f3ff] border-[0.5px] border-dashed border-[#c4c7c7]
                       flex flex-col items-center justify-center gap-1 group cursor-pointer
                       hover:bg-[#e2e8f8] transition-colors"
          >
            <span className="material-symbols-outlined text-[#c4c7c7] group-hover:text-[#775a19] transition-colors">
              photo_camera
            </span>
            <p className="text-[9px] text-[#444748] uppercase tracking-widest">Ambil Foto</p>
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="aspect-square bg-[#f0f3ff] border-[0.5px] border-dashed border-[#c4c7c7]
                       flex flex-col items-center justify-center gap-1 group cursor-pointer
                       hover:bg-[#e2e8f8] transition-colors"
          >
            <span className="material-symbols-outlined text-[#c4c7c7] group-hover:text-[#775a19] transition-colors">
              add_a_photo
            </span>
            <p className="text-[9px] text-[#444748] uppercase tracking-widest">Upload Foto</p>
          </button>
        </div>
      )}
    </div>
  )
}
