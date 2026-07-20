'use client'

import { useState } from 'react'

interface FullscreenMediaModalProps {
  kind: 'image' | 'pdf' | 'video'
  src: string
  alt?: string
  onClose: () => void
}

// Shared fullscreen viewer for Media Produksi (Customer Photo, Customer
// Reference, Packing Video) — reuses QrScanModal's overlay shell (z-50,
// black/60 backdrop, close icon) for visual consistency instead of a new
// lightbox pattern. Image gets click-to-zoom (toggles a wider render width
// inside a scrollable frame so both desktop click and mobile pinch/pan work
// natively, no zoom library needed); PDF uses the browser's native inline
// viewer via <iframe>, with a "Buka File" fallback link since some mobile
// browsers don't render PDFs inline; video is a plain native <video controls>.
export function FullscreenMediaModal({ kind, src, alt, onClose }: FullscreenMediaModalProps) {
  const [zoomed, setZoomed] = useState(false)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#fbf9fc] rounded-2xl w-full max-w-3xl h-[85vh] sm:h-[80vh] flex flex-col shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#c6c6cc]/50 flex-shrink-0">
          <p className="font-hanken text-sm text-[#161b29] truncate pr-2">{alt || 'Pratinjau'}</p>
          <div className="flex items-center gap-3 flex-shrink-0">
            {kind === 'image' && (
              <button
                type="button"
                onClick={() => setZoomed(z => !z)}
                className="material-symbols-outlined text-[#76777d] hover:text-[#161b29] transition-colors"
                aria-label={zoomed ? 'Perkecil' : 'Perbesar'}
              >
                {zoomed ? 'zoom_out' : 'zoom_in'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="material-symbols-outlined text-[#76777d] hover:text-[#161b29] transition-colors"
              aria-label="Tutup"
            >
              close
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-black/5 overflow-auto flex items-center justify-center">
          {kind === 'image' && (
            // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL
            <img
              src={src}
              alt={alt || 'Pratinjau media'}
              onClick={() => setZoomed(z => !z)}
              className={`cursor-zoom-in transition-[width] duration-200 ${
                zoomed ? 'w-[200%] max-w-none cursor-zoom-out' : 'w-full max-w-full'
              }`}
            />
          )}

          {kind === 'pdf' && (
            <div className="w-full h-full flex flex-col">
              <iframe src={src} title={alt || 'Dokumen PDF'} className="flex-1 w-full bg-white" />
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="font-hanken text-xs text-[#755b00] hover:underline text-center py-2 bg-white border-t border-[#c6c6cc]/50"
              >
                Buka File di Tab Baru
              </a>
            </div>
          )}

          {kind === 'video' && (
            // eslint-disable-next-line jsx-a11y/media-has-caption -- user-uploaded packing video, no caption track
            <video
              src={src}
              controls
              autoPlay
              playsInline
              className="max-w-full max-h-full bg-black"
            />
          )}
        </div>
      </div>
    </div>
  )
}
