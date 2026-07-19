'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadConsultationPhoto } from '@/lib/consultation/media'

const CAMERA_UNAVAILABLE_MESSAGE =
  'Kamera tidak tersedia pada perangkat ini. Silakan gunakan Upload Foto.'
const UPLOAD_ERROR_MESSAGE = 'Gagal mengunggah foto. Silakan coba lagi.'

interface PhotoUploaderProps {
  consultationId: string
  initialPhotoUrl?: string | null
  onUploaded: (url: string) => void
}

// Foto Pelanggan is captured/selected here, then uploaded straight to the
// same `consultation-photos` Supabase Storage bucket Consultation Review
// used to write to — Measurement is now the single source of truth for this
// photo (see CustomerDigitalProfile), so it always uploads under the
// 'front' slot regardless of camera vs. gallery origin.
export function PhotoUploader({ consultationId, initialPhotoUrl, onUploaded }: PhotoUploaderProps) {
  const [supabase] = useState(() => createClient())
  const [preview, setPreview] = useState<string | null>(initialPhotoUrl ?? null)
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Live preview needs the stream attached to the <video> element, and the
  // camera released the moment we stop needing it (frame captured, cancelled,
  // or the component unmounts) — a dangling getUserMedia stream keeps the
  // device's camera-in-use indicator on.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
    return () => {
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [stream])

  async function startCamera() {
    setCameraError(null)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(CAMERA_UNAVAILABLE_MESSAGE)
      return
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      setPreview(null)
      setCapturedFrame(null)
      setStream(mediaStream)
    } catch {
      setCameraError(CAMERA_UNAVAILABLE_MESSAGE)
    }
  }

  function cancelCamera() {
    setStream(null)
  }

  function captureFrame() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(blob => {
      if (blob) {
        setCapturedFrame(URL.createObjectURL(blob))
        setCapturedBlob(blob)
      }
    }, 'image/jpeg', 0.92)

    setStream(null)
  }

  async function uploadPhoto(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const url = await uploadConsultationPhoto(supabase, { consultationId, slot: 'front', file })
      setPreview(url)
      onUploaded(url)
    } catch {
      setUploadError(UPLOAD_ERROR_MESSAGE)
    } finally {
      setUploading(false)
    }
  }

  async function useCapturedFrame() {
    if (capturedBlob) {
      await uploadPhoto(new File([capturedBlob], `foto-pelanggan-${Date.now()}.jpg`, { type: 'image/jpeg' }))
    }
    setCapturedFrame(null)
    setCapturedBlob(null)
  }

  function retakeCapture() {
    setCapturedFrame(null)
    setCapturedBlob(null)
    startCamera()
  }

  function handleUploadFile(file: File | undefined) {
    if (!file) return
    setCameraError(null)
    setCapturedFrame(null)
    setCapturedBlob(null)
    uploadPhoto(file)
  }

  return (
    <div>
      <p className="font-sans text-xs uppercase tracking-widest text-[#444748] mb-4">
        Foto Pelanggan
      </p>

      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={el => {
          galleryInputRef.current = el
        }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleUploadFile(e.target.files?.[0])}
      />

      {cameraError && <p className="text-xs text-[#c0392b] mb-2">{cameraError}</p>}
      {uploadError && <p className="text-xs text-[#c0392b] mb-2">{uploadError}</p>}

      {stream ? (
        <div className="space-y-2">
          <div className="aspect-square bg-black border-[0.5px] border-[#c4c7c7] overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={captureFrame}
              className="flex-1 text-[10px] uppercase tracking-widest text-[#775a19] border-[0.5px] border-[#c4c7c7] py-2 hover:bg-[#f0f3ff] transition-colors"
            >
              Ambil Foto
            </button>
            <button
              type="button"
              onClick={cancelCamera}
              className="flex-1 text-[10px] uppercase tracking-widest text-[#444748] border-[0.5px] border-[#c4c7c7] py-2 hover:bg-[#f0f3ff] transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      ) : capturedFrame ? (
        <div className="space-y-2">
          <div className="aspect-square bg-[#f0f3ff] border-[0.5px] border-dashed border-[#c4c7c7] overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote/optimizable asset */}
            <img
              src={capturedFrame}
              alt="Pratinjau hasil kamera"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={useCapturedFrame}
              className="flex-1 text-[10px] uppercase tracking-widest text-[#775a19] border-[0.5px] border-[#c4c7c7] py-2 hover:bg-[#f0f3ff] transition-colors disabled:opacity-40"
            >
              {uploading ? 'Mengunggah...' : 'Gunakan Foto'}
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={retakeCapture}
              className="flex-1 text-[10px] uppercase tracking-widest text-[#444748] border-[0.5px] border-[#c4c7c7] py-2 hover:bg-[#f0f3ff] transition-colors disabled:opacity-40"
            >
              Ambil Ulang
            </button>
          </div>
        </div>
      ) : preview ? (
        <div className="space-y-2">
          <div className="aspect-square bg-[#f0f3ff] border-[0.5px] border-dashed border-[#c4c7c7] overflow-hidden relative">
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
              onClick={startCamera}
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
        <div className="aspect-square bg-[#f0f3ff] border-[0.5px] border-dashed border-[#c4c7c7] flex items-center justify-center">
          <p className="text-[10px] text-[#444748] uppercase tracking-widest">Mengunggah...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={startCamera}
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
