'use client'

import type { AiDesignDna } from '@/lib/design/aiDna/types'
import type { MasterDataCategory } from '@/lib/design/masterData'
import { resolveComponentRules } from '@/lib/design/dnaResolver/resolveComponentRules'
import { RuleListEditor } from './RuleListEditor'

interface AiDesignDnaSectionProps {
  dna: AiDesignDna
  category: MasterDataCategory
  // Component Hero Image = Catalog Photo (Architecture Lock, 2026-08-04) —
  // the same photo_url MasterDataManager already tracks as `editingPhotoUrl`
  // for the Foto field above this section. No separate upload exists
  // anymore, so this section only needs the URL to read/activate, never a
  // File.
  photoUrl: string | null
  onActivateHeroImageReference: () => void
  onReferenceInstructionChange: (value: string) => void
  onRenderNotesChange: (value: string) => void
  onComponentRulesChange: (items: string[]) => void
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
// Component Hero Image = Catalog Photo (Architecture Lock, 2026-08-04) —
// replaces the old "Hero Image Internal Separation" design (a dedicated
// second upload, independent of the catalog `photo_url`, so the internal AI
// reference could differ from what a Customer/Fitter sees). That second
// upload path is gone: there is no file picker here anymore. Activating
// simply freezes whatever `photoUrl` (the same catalog photo shown in the
// Foto field above) currently is into `ai_dna.metadata.sourceImage` — no
// network call, no Storage write from this component. Clicking again after
// the catalog photo changes re-freezes the new one, same snapshot semantics
// as before (`sourceImage` only moves the next time this action runs).
//
// Architecture Lock (2026-08-04) — Model Thobe is EXCLUDED from this
// control. Base Hero (the render-quality-anchoring reference that
// accompanies every render) moved to Render Engine ownership
// (renderEngine/baseHero.ts, GLOBAL_BASE_HERO_IMAGE_URL) — Model Thobe no
// longer has a Hero Image Internal concept at all, catalog-only like the
// rest of its own fields. Every other category (Kerah, Manset, Plaket,
// Saku, ...) keeps this control — their Hero Image is genuinely per-item
// Identity Knowledge, now sourced from the catalog photo instead of a
// second upload.
export function AiDesignDnaSection({
  dna,
  category,
  photoUrl,
  onActivateHeroImageReference,
  onReferenceInstructionChange,
  onRenderNotesChange,
  onComponentRulesChange,
}: AiDesignDnaSectionProps) {
  const isActiveReference = dna.status === 'approved' && !!dna.metadata?.sourceImage
  // Architecture Lock (2026-08-04) — Hero Image Internal is no longer a
  // Model Thobe concern; Base Hero is Render Engine ownership now (see
  // header comment).
  // Look Cutting Architecture Lock (2026-08-05) — Look Cutting is NOT a
  // Visual Component either: no Hero Image, no AI Asset, no Reference
  // Image, no Component Default Knowledge, ever. It carries only Variant
  // Delta Knowledge (silhouette/fit/ease/shaping text below) — there is
  // nothing for this control to activate. Every other category keeps it.
  const showHeroImageInternal = category !== 'model_thobe' && category !== 'look_cutting'
  // Fit Knowledge authoring guidance is Look Cutting-only (see
  // aiDna/types.ts's LOOK_CUTTING_FIT_LOCK_RULES) — Look Cutting's
  // referenceInstruction must describe fit behaviour only (ease/drape per
  // Slim/Standard/Regular), never any other design component.
  const isLookCutting = category === 'look_cutting'

  return (
    <div className="border-t border-[#c4c7c7]/30 pt-5 mt-2">
      <p className="font-sans text-[10px] uppercase tracking-widest text-[#775a19] mb-3">AI Render Knowledge</p>

      {showHeroImageInternal && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {isActiveReference && (
            <span className="flex items-center gap-1.5 font-sans text-xs text-[#2e7d32]">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Hero Image aktif sebagai Reference
            </span>
          )}
          <button
            type="button"
            onClick={onActivateHeroImageReference}
            disabled={!photoUrl}
            className="flex items-center gap-2 px-4 py-2 border-[0.5px] border-[#775a19] text-[#775a19]
                       font-sans text-xs uppercase tracking-widest hover:bg-[#775a19]/5 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            {isActiveReference ? 'Perbarui dari Foto Katalog' : 'Aktifkan Hero Image dari Foto Katalog'}
          </button>
          {!photoUrl && (
            <span className="font-sans text-xs text-[#444748]/70">Unggah Foto Katalog terlebih dahulu.</span>
          )}
        </div>
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
        {/* Reads through resolveComponentRules (normalizes a missing array to
            []) rather than `dna.componentRules` bare. Editing and saving
            always writes back to componentRules (onComponentRulesChange). */}
        <RuleListEditor label="Component Rules" items={resolveComponentRules(dna)} onChange={onComponentRulesChange} />
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
