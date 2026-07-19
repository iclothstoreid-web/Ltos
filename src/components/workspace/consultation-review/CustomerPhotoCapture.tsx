'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadConsultationPhoto } from '@/lib/consultation/media'
import type { FitterEnhancements } from './fitterEnhancementsCodec'

type Slot = 'front' | 'side' | 'back'

const SLOTS: { key: Slot; label: string }[] = [
  { key: 'front', label: 'Depan' },
  { key: 'side', label: 'Samping' },
  { key: 'back', label: 'Belakang' },
]

interface CustomerPhotoCaptureProps {
  consultationId: string
  photos: FitterEnhancements['customerPhotos']
  onChange: (photos: FitterEnhancements['customerPhotos']) => void
}

export function CustomerPhotoCapture({ consultationId, photos, onChange }: CustomerPhotoCaptureProps) {
  const supabase = createClient()
  const cameraInputRefs = useRef<Record<Slot, HTMLInputElement | null>>({ front: null, side: null, back: null })
  const galleryInputRefs = useRef<Record<Slot, HTMLInputElement | null>>({ front: null, side: null, back: null })
  const [uploadingSlot, setUploadingSlot] = useState<Slot | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(slot: Slot, file: File | undefined) {
    if (!file) return
    setUploadingSlot(slot)
    setError(null)
    try {
      const url = await uploadConsultationPhoto(supabase, { consultationId, slot, file })
      onChange({ ...photos, [slot]: url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah foto.')
    } finally {
      setUploadingSlot(null)
    }
  }

  return (
    <section className="bg-white p-4 shadow-sm border-[0.5px] border-[#c4c7c7]">
      <h3 className="font-sans text-xs text-[#151c27] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
        Foto Pelanggan
      </h3>

      {error && <p className="text-xs text-[#c0392b] mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SLOTS.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <div className="w-full aspect-square bg-[#f0f0f5] border-[0.5px] border-dashed border-[#c4c7c7] flex items-center justify-center overflow-hidden relative">
              {photos[key] ? (
                // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL
                <img src={photos[key] ?? undefined} alt={label} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[#c4c7c7] text-3xl">person</span>
              )}
              {uploadingSlot === key && (
                <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-[10px] uppercase tracking-widest">
                  Mengunggah...
                </span>
              )}
            </div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] text-center">{label}</p>

            <input
              ref={el => {
                cameraInputRefs.current[key] = el
              }}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => handleFile(key, e.target.files?.[0])}
            />
            <input
              ref={el => {
                galleryInputRefs.current[key] = el
              }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFile(key, e.target.files?.[0])}
            />

            <div className="flex flex-col gap-1">
              <button
                type="button"
                disabled={uploadingSlot === key}
                onClick={() => cameraInputRefs.current[key]?.click()}
                className="text-xs uppercase tracking-widest text-[#775a19] hover:underline disabled:opacity-50"
              >
                📷 Ambil Foto
              </button>
              <button
                type="button"
                disabled={uploadingSlot === key}
                onClick={() => galleryInputRefs.current[key]?.click()}
                className="text-xs uppercase tracking-widest text-[#444748] hover:underline disabled:opacity-50"
              >
                🖼 Unggah Foto
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
