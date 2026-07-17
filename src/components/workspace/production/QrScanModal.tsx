'use client'

import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

interface QrScanModalProps {
  title: string
  description: string
  // Exact-match mode (existing behavior, e.g. "Scan QR Penyelesaian" — the
  // order is already known, so the scan must match that specific payload).
  expectedPayload?: string
  // Pattern mode (Production app's entry scanner — the order isn't known
  // yet, any QR matching Fitter's production payload format is accepted).
  validate?: (value: string) => boolean
  onSuccess: (value: string) => void
  onClose: () => void
  // Entry-scanner usage has nothing behind the modal to fall back to, so it
  // hides the close (X) button instead of leaving a dead-end blank screen.
  dismissible?: boolean
}

// Real camera-based QR scanning (jsQR decodes frames drawn to an offscreen
// canvas from the camera stream) — validates the scanned code against the
// specific order's QR payload before letting the caller proceed. "Input
// Nomor" is the Stitch export's own manual-entry fallback (for when a
// camera isn't available/permitted), reusing the exact same validation path.
export function QrScanModal({
  title,
  description,
  expectedPayload,
  validate,
  onSuccess,
  onClose,
  dismissible = true,
}: QrScanModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const [cameraError, setCameraError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [manualValue, setManualValue] = useState('')

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        runScanLoop()
      } catch {
        if (!cancelled) setCameraError(true)
      }
    }

    startCamera()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function runScanLoop() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const tick = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code) {
          const isMatch = handleScanned(code.data)
          if (isMatch) return
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  // Returns true when the value matched and scanning should stop.
  function handleScanned(value: string): boolean {
    const trimmed = value.trim()
    const isValid = expectedPayload ? trimmed === expectedPayload : validate ? validate(trimmed) : false
    if (isValid) {
      stopCamera()
      setError(null)
      onSuccess(trimmed)
      return true
    }
    setError(
      expectedPayload
        ? 'QR tidak sesuai dengan Order Production yang dipilih.'
        : 'QR tidak dikenali sebagai QR Production yang valid.'
    )
    return false
  }

  function handleManualSubmit() {
    handleScanned(manualValue)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#fbf9fc] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-caslon text-lg text-[#161b29]">{title}</h3>
            <p className="font-hanken text-xs text-[#46464c] mt-1">{description}</p>
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={() => {
                stopCamera()
                onClose()
              }}
              className="material-symbols-outlined text-[#76777d] hover:text-[#161b29] transition-colors"
            >
              close
            </button>
          )}
        </div>

        {!manualMode && !cameraError && (
          <div className="relative bg-black rounded-xl aspect-square overflow-hidden">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live camera preview, no captionable track */}
            <video ref={videoRef} className="w-full h-full object-cover opacity-90" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-2/3 aspect-square border-2 border-white/60 rounded-xl relative">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-[#fed977] -mt-1 -ml-1" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-[#fed977] -mt-1 -mr-1" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-[#fed977] -mb-1 -ml-1" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-[#fed977] -mb-1 -mr-1" />
              </div>
            </div>
          </div>
        )}

        {(manualMode || cameraError) && (
          <div className="space-y-2">
            {cameraError && !manualMode && (
              <p className="font-hanken text-xs text-[#ba1a1a]">
                Kamera tidak tersedia — gunakan input manual.
              </p>
            )}
            <label className="font-jetbrains text-[10px] uppercase tracking-widest text-[#76777d] block">
              Nomor / Kode QR
            </label>
            <input
              type="text"
              value={manualValue}
              onChange={e => setManualValue(e.target.value)}
              placeholder="Tempel atau ketik kode QR..."
              className="w-full py-2 px-3 bg-white border border-[#c6c6cc] rounded-lg outline-none
                         font-hanken text-sm text-[#161b29] focus:border-[#755b00] transition-colors"
            />
            <button
              type="button"
              onClick={handleManualSubmit}
              className="w-full bg-[#161b29] text-white font-hanken font-semibold py-3 rounded-xl
                         hover:bg-[#755b00] transition-colors"
            >
              Verifikasi
            </button>
          </div>
        )}

        {error && <p className="font-hanken text-xs text-[#ba1a1a] text-center">{error}</p>}

        {!cameraError && (
          <button
            type="button"
            onClick={() => {
              setError(null)
              setManualMode(m => !m)
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#161b29]
                       text-[#161b29] font-hanken font-semibold hover:bg-[#161b29]/5 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">keyboard</span>
            {manualMode ? 'Gunakan Kamera' : 'Input Nomor'}
          </button>
        )}
      </div>
    </div>
  )
}
