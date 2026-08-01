'use client'

import type { AiDesignDna } from '@/lib/design/aiDna/types'
import { RuleListEditor } from './RuleListEditor'

interface AiDesignDnaSectionProps {
  dna: AiDesignDna
  heroImageUrl: string | null
  onActivateHeroImageReference: () => void
  onReferenceInstructionChange: (value: string) => void
  onRenderNotesChange: (value: string) => void
  onLockRulesChange: (items: string[]) => void
  onNegativeRulesChange: (items: string[]) => void
}

// `dna.metadata` is optionally-chained below (not a bare `dna.metadata.x`)
// because `AiDesignDna` only guarantees this shape for rows written through
// markDnaGenerated/markDnaApproved/the DB column default — a row whose
// ai_dna was overwritten wholesale by a raw SQL data fix (e.g. Saku's
// "regional masked overlay" DNA) can lack `metadata` entirely, which used
// to throw "Cannot read properties of undefined" the instant this dialog
// opened (Owner App Master Data > Pocket > Edit bugfix).

// AI Render Knowledge (Master Data UI Cleanup, Sprint R-06.1) — replaces the
// old AI Design DNA lifecycle recap (Status radio row/Version/Generated At/
// Approved At/separate Generate+Approve buttons/Advanced+Expert DNA stubs)
// entirely. `status`/`markDnaGenerated`/`markDnaApproved` themselves are
// UNCHANGED (aiDna/types.ts) — this sprint is UI-only, per its own brief.
// aiAssetComposer's isAiAssetActive() still gates Hero Image reference-
// sending on `status === 'approved'` + a frozen `metadata.sourceImage`, so
// that mechanism still needs a way to be triggered — collapsed here into
// ONE action (`onActivateHeroImageReference`, wired in MasterDataManager to
// call markDnaGenerated then markDnaApproved in sequence) instead of the
// old two-step Generate-then-Approve flow, so the render pipeline's
// existing behaviour keeps working for future Hero Image changes without
// resurrecting the old multi-field lifecycle UI.
export function AiDesignDnaSection({
  dna,
  heroImageUrl,
  onActivateHeroImageReference,
  onReferenceInstructionChange,
  onRenderNotesChange,
  onLockRulesChange,
  onNegativeRulesChange,
}: AiDesignDnaSectionProps) {
  const isActiveReference = dna.status === 'approved' && !!dna.metadata?.sourceImage && dna.metadata.sourceImage === heroImageUrl

  return (
    <div className="border-t border-[#c4c7c7]/30 pt-5 mt-2">
      <p className="font-sans text-[10px] uppercase tracking-widest text-[#775a19] mb-3">AI Render Knowledge</p>

      <div className="mb-4">
        {isActiveReference ? (
          <span className="flex items-center gap-1.5 font-sans text-xs text-[#2e7d32]">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Hero Image aktif sebagai Reference
          </span>
        ) : (
          <button
            type="button"
            onClick={onActivateHeroImageReference}
            disabled={!heroImageUrl}
            className="flex items-center gap-2 px-4 py-2 border-[0.5px] border-[#775a19] text-[#775a19]
                       font-sans text-xs uppercase tracking-widest hover:bg-[#775a19]/5 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            Aktifkan Hero Image sebagai Reference
          </button>
        )}
      </div>

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
        <RuleListEditor label="Lock Rules" items={dna.lockRules} onChange={onLockRulesChange} />
      </div>

      <div className="mt-4">
        <RuleListEditor label="Negative Rules" items={dna.negativeRules} onChange={onNegativeRulesChange} />
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
    </div>
  )
}
