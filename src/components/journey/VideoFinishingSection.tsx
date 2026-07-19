'use client'

import { useState } from 'react'
import { SectionShell } from './SectionShell'
import { SectionEyebrow } from './SectionEyebrow'

interface VideoFinishingSectionProps {
  title: string
  videoSrc?: string | null
  posterSrc?: string
  caption?: string
}

// Premium placeholder when the finishing video hasn't been supplied yet —
// same aspect ratio either way so the section never collapses or looks
// unfinished. Mirrors JourneyPhoto's own missing/failed-src fallback pattern.
export function VideoFinishingSection({ title, videoSrc, posterSrc, caption }: VideoFinishingSectionProps) {
  const [failed, setFailed] = useState(false)

  return (
    <SectionShell>
      <SectionEyebrow>{title}</SectionEyebrow>
      {videoSrc && !failed ? (
        <video
          src={videoSrc}
          poster={posterSrc}
          controls
          playsInline
          className="w-full aspect-[4/5] sm:aspect-[16/10] object-cover bg-black"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-full aspect-[4/5] sm:aspect-[16/10] bg-gradient-to-br from-primary/15 via-[#151c27]/5 to-primary/10 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-primary translate-x-[1px]">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
      {caption && <p className="font-sans text-xs text-secondary text-center mt-4">{caption}</p>}
    </SectionShell>
  )
}
