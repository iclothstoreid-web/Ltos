'use client'

import { useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  PACKING_VIDEO_ACCEPTED_TYPES,
  PACKING_VIDEO_MAX_BYTES,
  uploadPackingVideo,
} from '@/lib/production/packingVideo'

interface PackingVideoUploaderProps {
  supabase: SupabaseClient
  orderId: string
  stageRecordId: string
  value: string | null
  onUploaded: () => void
}

// Packing-only video upload — per the sprint brief, appears nowhere else in
// the 8-stage shell. video_url lives on the current packing stage record
// (lib/production/packingVideo.ts), written via set_packing_video. Does not
// gate canApprove/checklist — Media Produksi is presentation only, not
// workflow. `value` is the source of truth from the parent's packet state;
// `onUploaded` tells the parent to refetch so it (and Media Produksi) sees
// the committed URL.
export function PackingVideoUploader({
  supabase,
  orderId,
  stageRecordId,
  value,
  onUploaded,
}: PackingVideoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setPreview(value)
  }, [value])

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)

    if (!PACKING_VIDEO_ACCEPTED_TYPES.includes(file.type)) {
      setError('Format video harus mp4 atau mov.')
      return
    }
    if (file.size > PACKING_VIDEO_MAX_BYTES) {
      setError('Ukuran video maksimal 50 MB.')
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)
    setUploading(true)
    try {
      await uploadPackingVideo(supabase, { orderId, stageRecordId, file })
      onUploaded()
    } catch (err) {
      console.error('[production] packing video upload failed', err)
      setPreview(value)
      setError('Gagal mengunggah video. Coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] block mb-2">
        Video Packing
      </label>

      {preview ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- packing video preview, no captionable track */}
          <video src={preview} controls playsInline className="w-full aspect-video bg-black" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="font-hanken text-xs text-[#755b00] hover:underline disabled:opacity-60"
          >
            {uploading ? 'Mengunggah...' : 'Ganti Video'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-video bg-[#efedf0] border-[0.5px] border-dashed border-[#c6c6cc]
                     flex flex-col items-center justify-center gap-1 group cursor-pointer
                     hover:bg-[#efedf0] transition-colors disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[#c6c6cc] group-hover:text-[#755b00] transition-colors">
            videocam
          </span>
          <p className="text-[10px] text-[#46464c] uppercase tracking-widest">
            {uploading ? 'Mengunggah...' : 'Unggah Video Packing'}
          </p>
          <p className="text-[9px] text-[#76777d]">mp4 / mov, maks 50MB</p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />

      {error && <p className="font-hanken text-[10px] text-red-600 mt-1">{error}</p>}
    </div>
  )
}
