'use client'

import { useState } from 'react'
import type { ConsultationDocument } from '@/components/workspace/consultation-review/fitterEnhancementsCodec'
import { FullscreenMediaModal } from './FullscreenMediaModal'
import { CustomerReferenceCard } from './CustomerReferenceCard'

interface MediaProduksiCardProps {
  customerPhotoUrl: string | null
  customerReferences: ConsultationDocument[]
  packingVideoUrl: string | null
}

// Phase 2 Sprint 01 — single consolidated "Media Produksi" section grouping
// every media artifact of an order: Customer Photo, AI Render (placeholder
// until Phase 2's render engine ships), Customer Reference, and Packing
// Video. Replaces the standalone CustomerReferenceCard render in
// ProductionPacketWorkspace (same component, reused here) rather than
// duplicating its list/viewer logic. All sources/pipelines are unchanged —
// Measurement remains the only Customer Photo source, Packing the only
// Packing Video source; this only changes where/how they're displayed.
export function MediaProduksiCard({
  customerPhotoUrl,
  customerReferences,
  packingVideoUrl,
}: MediaProduksiCardProps) {
  const [showPhoto, setShowPhoto] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  return (
    <div className="space-y-4">
      <h3 className="font-caslon text-xl text-[#161b29]">Media Produksi</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#fbf9fc] rounded-2xl border border-[#c6c6cc]/30 p-3 space-y-2">
          <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">
            Customer Photo
          </p>
          <button
            type="button"
            onClick={() => customerPhotoUrl && setShowPhoto(true)}
            disabled={!customerPhotoUrl}
            className="w-full aspect-square rounded-xl overflow-hidden bg-[#efedf0] flex items-center justify-center disabled:cursor-default"
          >
            {customerPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL
              <img src={customerPhotoUrl} alt="Foto Pelanggan" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[#c6c6cc]">person</span>
            )}
          </button>
        </div>

        <div className="bg-[#fbf9fc] rounded-2xl border border-[#c6c6cc]/30 p-3 space-y-2">
          <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">AI Render</p>
          <div className="w-full aspect-square rounded-xl bg-[#efedf0] flex flex-col items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[#c6c6cc]">auto_awesome</span>
            <p className="font-hanken text-[9px] text-[#76777d] text-center px-2">Coming in Phase 2</p>
          </div>
        </div>
      </div>

      <CustomerReferenceCard documents={customerReferences} />

      <div className="bg-[#fbf9fc] rounded-2xl border border-[#c6c6cc]/30 p-4 space-y-2">
        <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">
          Packing Video
        </p>
        {packingVideoUrl ? (
          <button
            type="button"
            onClick={() => setShowVideo(true)}
            className="w-full aspect-video rounded-xl overflow-hidden bg-black relative group"
          >
            {/* eslint-disable-next-line jsx-a11y/media-has-caption -- thumbnail preview, fullscreen viewer has controls */}
            <video src={packingVideoUrl} className="w-full h-full object-cover opacity-90" muted />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-3xl drop-shadow">play_circle</span>
            </span>
          </button>
        ) : (
          <p className="font-hanken text-xs text-[#46464c]">Belum ada video packing.</p>
        )}
      </div>

      {showPhoto && customerPhotoUrl && (
        <FullscreenMediaModal
          kind="image"
          src={customerPhotoUrl}
          alt="Foto Pelanggan"
          onClose={() => setShowPhoto(false)}
        />
      )}

      {showVideo && packingVideoUrl && (
        <FullscreenMediaModal
          kind="video"
          src={packingVideoUrl}
          alt="Video Packing"
          onClose={() => setShowVideo(false)}
        />
      )}
    </div>
  )
}
