'use client'

import type { ConsultationDocument } from '@/components/workspace/consultation-review/fitterEnhancementsCodec'

interface CustomerReferenceCardProps {
  documents: ConsultationDocument[]
}

// Referensi Customer uploaded in Consultation Review (DocumentUploader) —
// read-only here, same list surfaced to Artisan via
// lib/production/customerReferences.ts. Hidden entirely when empty, same
// honesty rule as the rest of the Production Packet's reference cards.
export function CustomerReferenceCard({ documents }: CustomerReferenceCardProps) {
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
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-hanken text-xs text-[#755b00] hover:underline"
            >
              Lihat
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
