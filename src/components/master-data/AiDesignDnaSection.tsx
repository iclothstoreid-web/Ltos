'use client'

import { useRef } from 'react'
import type { AiDesignDna } from '@/lib/design/aiDna/types'
import type { MasterDataCategory } from '@/lib/design/masterData'
import { RuleListEditor } from './RuleListEditor'

interface AiDesignDnaSectionProps {
  dna: AiDesignDna
  category: MasterDataCategory
  uploadingHeroImage: boolean
  onActivateHeroImageReference: (file: File) => void
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

// AI Render Knowledge (Master Data UI Cleanup, Sprint R-06.1). `status`/
// `markDnaGenerated`/`markDnaApproved` themselves are UNCHANGED
// (aiDna/types.ts). aiAssetComposer's isAiAssetActive() still gates Hero
// Image reference-sending on `status === 'approved'` + a frozen
// `metadata.sourceImage` — collapsed here into ONE action
// (`onActivateHeroImageReference`, wired in MasterDataManager to call
// markDnaGenerated then markDnaApproved in sequence).
//
// Hero Image Internal Separation — this section now owns its own file
// picker instead of reusing whatever the catalog "Foto" field
// (MasterDataManager's `editingPhotoUrl`) currently holds. `photo_url` is
// the thumbnail a Customer/Fitter sees in Design Studio's catalog; the
// image uploaded here becomes `ai_dna.metadata.sourceImage`, the internal
// reference the Render Engine sends to OpenAI — a Customer never sees it.
// The two are independent uploads from here on, so "already active" no
// longer means "matches the current catalog photo" (there is nothing to
// compare against anymore) — it just means a Hero Image Internal has been
// activated at all. The picker stays available even when one is already
// active, since replacing it (e.g. swapping in a plain Base Garment photo)
// is the whole point of this control.
export function AiDesignDnaSection({
  dna,
  category,
  uploadingHeroImage,
  onActivateHeroImageReference,
  onReferenceInstructionChange,
  onRenderNotesChange,
  onLockRulesChange,
  onNegativeRulesChange,
}: AiDesignDnaSectionProps) {
  const heroImageInputRef = useRef<HTMLInputElement>(null)
  const isActiveReference = dna.status === 'approved' && !!dna.metadata?.sourceImage
  // Quality Foundation authoring guidance is Base Hero Model-only (see
  // aiDna/types.ts's MODEL_THOBE_QUALITY_LOCK_RULES) — every other category
  // stays Identity Knowledge only, so this caption must not show for them.
  const isBaseHeroModel = category === 'model_thobe'
  // Fit Knowledge authoring guidance is Look Cutting-only (see
  // aiDna/types.ts's LOOK_CUTTING_FIT_LOCK_RULES) — Look Cutting's
  // referenceInstruction must describe fit behaviour only (ease/drape per
  // Slim/Standard/Regular), never any other design component.
  const isLookCutting = category === 'look_cutting'

  return (
    <div className="border-t border-[#c4c7c7]/30 pt-5 mt-2">
      <p className="font-sans text-[10px] uppercase tracking-widest text-[#775a19] mb-3">AI Render Knowledge</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {isActiveReference && (
          <span className="flex items-center gap-1.5 font-sans text-xs text-[#2e7d32]">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Hero Image Internal aktif sebagai Reference
          </span>
        )}
        <button
          type="button"
          onClick={() => heroImageInputRef.current?.click()}
          disabled={uploadingHeroImage}
          className="flex items-center gap-2 px-4 py-2 border-[0.5px] border-[#775a19] text-[#775a19]
                     font-sans text-xs uppercase tracking-widest hover:bg-[#775a19]/5 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <input
            ref={heroImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) onActivateHeroImageReference(file)
              e.target.value = ''
            }}
          />
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          {uploadingHeroImage ? 'Mengunggah...' : isActiveReference ? 'Ganti Hero Image Internal' : 'Aktifkan Hero Image Internal'}
        </button>
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
        {isBaseHeroModel && (
          <p className="mt-1.5 text-[11px] leading-snug text-[#444748]/70">
            Deskripsikan perilaku kain, jangan menyebut nama teknik render — hindari &quot;subsurface scattering&quot;
            dan &quot;wet reflection&quot;. Specular highlight hanya boleh ditulis sebagai perilaku cahaya alami pada
            tekstil (mis. &quot;highlight lembut pada anyaman kain&quot;), bukan efek shader/lighting. Hindari bahasa
            marketing.
          </p>
        )}
        {isLookCutting && (
          <p className="mt-1.5 text-[11px] leading-snug text-[#444748]/70">
            Deskripsikan hanya perilaku fit terhadap tubuh customer yang sudah ada — ease, drape, dan
            transisi di bahu/dada/pinggang/lengan/hem (mis. Slim Fit: ease minimal, mengikuti siluet
            tubuh; Standard Fit: ease sedang, drape seimbang; Regular Fit: ease longgar, drape rileks).
            Jangan menyebut kerah, manset, plaket, saku, material, warna, bordir, atau kancing — itu
            bukan tanggung jawab Look Cutting. Jangan mengubah bentuk tubuh atau panjang garmen/lengan.
          </p>
        )}
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
