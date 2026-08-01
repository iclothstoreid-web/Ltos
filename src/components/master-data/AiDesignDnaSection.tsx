'use client'

import { AI_DNA_LIFECYCLE_ORDER, AI_DNA_STATUS_LABELS } from '@/lib/design/aiDna/types'
import type { AiDesignDna } from '@/lib/design/aiDna/types'
import { RuleListEditor } from './RuleListEditor'

interface AiDesignDnaSectionProps {
  dna: AiDesignDna
  showQuickDnaPlaceholder: boolean
  onGenerateQuickDna: () => void
  onApprove: () => void
  onReferenceInstructionChange: (value: string) => void
  onRenderNotesChange: (value: string) => void
  onLockRulesChange: (items: string[]) => void
  onNegativeRulesChange: (items: string[]) => void
}

function formatTimestamp(value: string | null): string {
  return value ? new Date(value).toLocaleString('id-ID') : '—'
}

// `dna.metadata` is optionally-chained below (not a bare `dna.metadata.x`)
// because `AiDesignDna` only guarantees this shape for rows written through
// markDnaGenerated/markDnaApproved/the DB column default — a row whose
// ai_dna was overwritten wholesale by a raw SQL data fix (e.g. Saku's
// "regional masked overlay" DNA) can lack `metadata` entirely, which used
// to throw "Cannot read properties of undefined" the instant this dialog
// opened (Owner App Master Data > Pocket > Edit bugfix).

// Lifecycle recap + Reference-First editors for a Master Item's permanent AI
// Design DNA. Status is never directly editable here; it only ever moves via
// markDnaNeedsRegeneration (Hero Image replaced), markDnaGenerated
// (Generate Quick DNA, which also freezes the Official Reference Image —
// see MasterDataManager's handleGenerateQuickDna), or markDnaApproved
// (Approve below — AI Asset Lifecycle sprint: this is the ONLY action that
// turns this item's AI Asset ACTIVE; there is deliberately no separate
// "Add Reference"/"Create AI Asset" affordance anywhere in this app).
//
// Reference Instruction / Render Notes / Lock Rules / Negative Rules ARE
// directly editable here (unlike the old geometry/construction/appearance/
// materials/stitching fields they replaced, which never had field-level UI
// at all).
export function AiDesignDnaSection({
  dna,
  showQuickDnaPlaceholder,
  onGenerateQuickDna,
  onApprove,
  onReferenceInstructionChange,
  onRenderNotesChange,
  onLockRulesChange,
  onNegativeRulesChange,
}: AiDesignDnaSectionProps) {
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
          <p className="font-sans text-sm text-[#151c27]">{formatTimestamp(dna.metadata?.generatedAt ?? null)}</p>
        </div>
        <div>
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-1">Approved At</p>
          <p className="font-sans text-sm text-[#151c27]">{formatTimestamp(dna.metadata?.approvedAt ?? null)}</p>
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
        {dna.status === 'draft' ? (
          <button
            type="button"
            onClick={onApprove}
            className="flex items-center gap-2 px-4 py-2 border-[0.5px] border-[#2e7d32] text-[#2e7d32]
                       font-sans text-xs uppercase tracking-widest hover:bg-[#2e7d32]/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Approve
          </button>
        ) : (
          <span
            title={
              dna.status === 'approved'
                ? 'AI Design DNA sudah approved — AI Asset aktif.'
                : 'Approve hanya tersedia setelah Generate Quick DNA (status draft).'
            }
            className="px-3 py-2 border-[0.5px] border-dashed border-[#c4c7c7] text-[#c4c7c7] font-sans text-xs uppercase tracking-widest cursor-not-allowed"
          >
            {dna.status === 'approved' ? 'Approved' : 'Approve'}
          </span>
        )}
      </div>

      {showQuickDnaPlaceholder && (
        <p className="font-sans text-xs text-[#444748] italic">
          AI DNA Generation will be available in the next phase.
        </p>
      )}

      <div className="mt-4">
        <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">
          Reference Instruction
        </p>
        <textarea
          value={dna.referenceInstruction ?? ''}
          onChange={e => onReferenceInstructionChange(e.target.value)}
          rows={3}
          placeholder="Instruksi untuk GPT Image tentang cara memakai Hero Image ini — silhouette, proporsi, panjang, seam alignment, fold/drape, posisi komponen, bagian mana yang dipertahankan/diabaikan/diganti Color DNA."
          className="w-full border-[0.5px] border-[#c4c7c7] bg-transparent p-2 text-sm outline-none focus:border-[#775a19]"
        />
      </div>

      <div className="mt-4">
        <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">
          Render Notes <span className="normal-case text-[#444748]/70">(opsional, tidak dikirim ke GPT)</span>
        </p>
        <textarea
          value={dna.renderNotes ?? ''}
          onChange={e => onRenderNotesChange(e.target.value)}
          rows={2}
          placeholder="Catatan internal — misal alasan Lock Rule tertentu ditambahkan, atau kuirk render yang sudah diketahui."
          className="w-full border-[0.5px] border-[#c4c7c7] bg-transparent p-2 text-sm outline-none focus:border-[#775a19]"
        />
      </div>

      <div className="mt-4">
        <RuleListEditor label="Lock Rules" items={dna.lockRules} onChange={onLockRulesChange} />
      </div>

      <div className="mt-4">
        <RuleListEditor label="Negative Rules" items={dna.negativeRules} onChange={onNegativeRulesChange} />
      </div>
    </div>
  )
}
