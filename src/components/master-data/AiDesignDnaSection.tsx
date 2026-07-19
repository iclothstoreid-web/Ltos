'use client'

import { AI_DNA_LIFECYCLE_ORDER, AI_DNA_STATUS_LABELS } from '@/lib/design/aiDna/types'
import type { AiDesignDna } from '@/lib/design/aiDna/types'

interface AiDesignDnaSectionProps {
  dna: AiDesignDna
  showQuickDnaPlaceholder: boolean
  onGenerateQuickDna: () => void
}

function formatTimestamp(value: string | null): string {
  return value ? new Date(value).toLocaleString('id-ID') : '—'
}

// Read-only recap of a Master Item's permanent AI Design DNA lifecycle —
// this sprint builds structure only, no AI/OpenAI/Prompt/Vision. Status
// itself is never user-editable here; it only ever moves via
// markDnaNeedsRegeneration (Hero Image replaced) or, in a later sprint,
// actual generation/approval.
export function AiDesignDnaSection({ dna, showQuickDnaPlaceholder, onGenerateQuickDna }: AiDesignDnaSectionProps) {
  return (
    <div className="border-t border-[#c4c7c7]/30 pt-5 mt-2">
      <p className="font-sans text-[10px] uppercase tracking-widest text-[#775a19] mb-3">AI Design DNA</p>

      <div className="mb-4">
        <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">Status</p>
        <div className="flex flex-wrap gap-4">
          {AI_DNA_LIFECYCLE_ORDER.map(status => (
            <span
              key={status}
              className={`flex items-center gap-1.5 font-sans text-xs ${
                status === dna.status ? 'text-[#151c27] font-bold' : 'text-[#444748]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {status === dna.status ? 'radio_button_checked' : 'radio_button_unchecked'}
              </span>
              {AI_DNA_STATUS_LABELS[status]}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-1">Version</p>
          <p className="font-sans text-sm text-[#151c27]">{dna.version}</p>
        </div>
        <div>
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-1">Generated At</p>
          <p className="font-sans text-sm text-[#151c27]">{formatTimestamp(dna.metadata.generatedAt)}</p>
        </div>
        <div>
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-1">Approved At</p>
          <p className="font-sans text-sm text-[#151c27]">{formatTimestamp(dna.metadata.approvedAt)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <button
          type="button"
          onClick={onGenerateQuickDna}
          className="flex items-center gap-2 px-4 py-2 border-[0.5px] border-[#775a19] text-[#775a19]
                     font-sans text-xs uppercase tracking-widest hover:bg-[#775a19]/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          Generate Quick DNA
        </button>
        <span
          title="Belum aktif — bagian dari fase AI Vision Integration berikutnya"
          className="px-3 py-2 border-[0.5px] border-dashed border-[#c4c7c7] text-[#c4c7c7] font-sans text-xs uppercase tracking-widest cursor-not-allowed"
        >
          Advanced DNA
        </span>
        <span
          title="Belum aktif — bagian dari fase AI Vision Integration berikutnya"
          className="px-3 py-2 border-[0.5px] border-dashed border-[#c4c7c7] text-[#c4c7c7] font-sans text-xs uppercase tracking-widest cursor-not-allowed"
        >
          Expert DNA
        </span>
      </div>

      {showQuickDnaPlaceholder && (
        <p className="font-sans text-xs text-[#444748] italic">
          AI DNA Generation will be available in the next phase.
        </p>
      )}
    </div>
  )
}
