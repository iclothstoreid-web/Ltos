'use client'

import { useState } from 'react'
import type { ConsultationDocument } from '@/components/workspace/consultation-review/fitterEnhancementsCodec'
import { FullscreenMediaModal } from './FullscreenMediaModal'

interface CustomerReferenceCardProps {
  documents: ConsultationDocument[]
}

function isPdf(doc: ConsultationDocument) {
  return /\.pdf($|\?)/i.test(doc.url) || /\.pdf$/i.test(doc.name)
}

// Referensi Customer uploaded in Consultation Review (DocumentUploader) —
// read-only here, same list surfaced to Artisan via
// lib/production/customerReferences.ts. Hidden entirely when empty, same
// honesty rule as the rest of the Production Packet's reference cards.
// "Lihat" used to open a raw new browser tab; now opens the same in-app
// fullscreen viewer as Customer Photo/Packing Video, branching image vs PDF
// per doc (source data/pipeline unchanged, purely a viewer upgrade).
export function CustomerReferenceCard({ documents }: CustomerReferenceCardProps) {
  const [preview, setPreview] = useState<ConsultationDocument | null>(null)

  if (documents.length === 0) return null

  return (
    <div className="bg-[#fbf9fc] rounded-2xl p-6 shadow-sm border border-[#c6c6cc]/30 space-y-4">
      <h3 className="font-caslon text-xl text-[#161b29]">Referensi Customer</h3>
      <ul className="space-y-2">
        {documents.map(doc => (
          <li
            key={doc.id}
            className="flex items-center gap-3 p-3 bg-[#FDFCF7] rounded-xl"
          >
            <span className="material-symbols-outlined text-[18px] text-[#755b00]">description</span>
            <span className="flex-1 font-hanken text-sm text-[#161b29] truncate">{doc.name}</span>
            <span className="font-jetbrains text-[9px] tracking-widest uppercase text-[#76777d] bg-[#efedf0] px-2 py-1 rounded">
              {doc.category}
            </span>
            <button
              type="button"
              onClick={() => setPreview(doc)}
              className="font-hanken text-xs text-[#755b00] hover:underline flex-shrink-0"
            >
              Lihat
            </button>
          </li>
        ))}
      </ul>

      {preview && (
        <FullscreenMediaModal
          kind={isPdf(preview) ? 'pdf' : 'image'}
          src={preview.url}
          alt={preview.name}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}
