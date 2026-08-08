'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import type { Operator, ProductionPacket, ProductionRules } from '@/lib/production/types'
import {
  STAGES_WITH_EVIDENCE,
  STAGE_LABELS,
  STAGE_ORDER,
  checklistItemsForStage,
  getCurrentStageRecord,
} from '@/lib/production/stageConfig'
import { completeStage, getProductionPacket, setShippingInfo, startStage } from '@/lib/production/client'
import { buildProductionQrPayload } from '@/lib/order/qr'
import { HeroCard } from './HeroCard'
import { StageProgressRail } from './StageProgressRail'
import { OperatorAutocomplete } from './OperatorAutocomplete'
import { DivisionSelect } from './DivisionSelect'
import { EvidenceUploader } from './EvidenceUploader'
import { ChecklistPanel } from './ChecklistPanel'
import { QcDecisionPanel } from './QcDecisionPanel'
import { ApproveReturnPanel } from './ApproveReturnPanel'
import { PatternFormulationPanel } from './PatternFormulationPanel'
import { PatternReferenceCard } from './PatternReferenceCard'
import { PatternFormulationCard } from './PatternFormulationCard'
import { SewingReferencePanel } from './SewingReferencePanel'
import { QcReferencePanel } from './QcReferencePanel'
import { FinishingReferencePanel } from './FinishingReferencePanel'
import { PackingReferencePanel } from './PackingReferencePanel'
import { ShippingReferencePanel } from './ShippingReferencePanel'
import { DigitalHandoverCard } from './DigitalHandoverCard'
import { MaterialPreparationCard } from './MaterialPreparationCard'
import { PackingVideoUploader } from './PackingVideoUploader'
import { useProductionBackGuard } from './useProductionBackGuard'
import { ExitConfirmModal } from './ExitConfirmModal'

// PR-02 (Rendering Performance, Lazy Hydration) — this instance is only
// opened via local state (showCompletionScan) for the completion re-scan
// step, not part of first paint. Same component, same props; just excluded
// from the initial JS bundle until actually rendered.
const QrScanModal = dynamic(() => import('./QrScanModal').then(mod => mod.QrScanModal))

interface ProductionPacketWorkspaceProps {
  initialPacket: ProductionPacket
  orderId: string
  // HeroCard/PatternFormulationCard both read this directly, so it stays a
  // resolved value fetched on the critical path (page.tsx) — deferring it
  // too would delay the one card this sprint's brief calls out as most
  // critical. See CustomerReferenceBoundary's doc comment for why Media
  // Produksi reads customer notes a second time instead of sharing this.
  customerPhotoUrl: string | null
  // Streaming boundaries (Sprint N4) — both pre-rendered server-side
  // (page.tsx) behind their own <Suspense>, passed down as already-resolved
  // React trees instead of raw data. Rendered at the exact same position the
  // inline <ProductionCommunicationPanel>/<MediaProduksiCard> calls used to
  // occupy; nothing about placement or conditional visibility changed.
  communicationSlot: React.ReactNode
  referenceSlot: React.ReactNode
  // Server Component slots (Sprint N6) — ReferenceModelCard/MaterialSpecCard
  // read only `design`/`consultationNotes`, which never change after this
  // page loads (see ReferenceModelCard's doc comment), so page.tsx renders
  // them once server-side instead of this Client Component importing them.
  // Visibility is still decided here (same `isMaterialPrep || ...` gate as
  // before) — only the two components' own hydration cost moved out.
  referenceModelSlot: React.ReactNode
  materialSpecSlot: React.ReactNode
  // Production Rules (Runtime Configuration) — see
  // supabase/migrations/20260811000000_add_business_rules_runtime_config.sql.
  // Fetched once server-side (page.tsx); this kiosk workspace has no login
  // session to refetch against mid-shift, same as every other packet field.
  productionRules: ProductionRules
  // Return Rules (Business Rules) — QC's Kategori Temuan options, fetched
  // the same way. See 20260813000000_add_return_notification_rules.sql.
  returnReasons: string[]
}

export function ProductionPacketWorkspace({
  initialPacket,
  orderId,
  customerPhotoUrl,
  communicationSlot,
  referenceSlot,
  referenceModelSlot,
  materialSpecSlot,
  productionRules,
  returnReasons,
}: ProductionPacketWorkspaceProps) {
  const [supabase] = useState(() => createClient())
  const [packet, setPacket] = useState(initialPacket)
  const [submitting, setSubmitting] = useState(false)
  const { showExitConfirm, dismiss: dismissExitConfirm } = useProductionBackGuard()

  const currentRecord = getCurrentStageRecord(packet.stage_records)
  const isMaterialPrep = currentRecord?.stage === 'material_prep'
  const isPatternFormulation = currentRecord?.stage === 'pattern_formulation'
  const isCutting = currentRecord?.stage === 'cutting'
  const isSewing = currentRecord?.stage === 'sewing'
  const isQc = currentRecord?.stage === 'qc'
  const isFinishing = currentRecord?.stage === 'finishing'
  const isPacking = currentRecord?.stage === 'packing'
  const isShipping = currentRecord?.stage === 'shipping'
  // Cutting, Sewing, QC, Finishing, Packing, and Pengiriman all reuse
  // Formulasi Pola's "custom panel + pre-scan Catatan/Evidence" shape (see
  // STAGES_WITH_CUSTOM_PANEL) — only the panel content differs (read-only
  // reference(s) vs. editable formulation). Pengiriman still gets its own
  // plain "Selesaikan Order" button below instead of ApproveReturnPanel,
  // since it's the last stage with no next stage to hand off to.
  const usesCustomPanelShell =
    isPatternFormulation ||
    isCutting ||
    isSewing ||
    isQc ||
    isFinishing ||
    isPacking ||
    isShipping

  const [operator, setOperator] = useState<Operator | null>(null)
  const [division, setDivision] = useState('')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [alterCategory, setAlterCategory] = useState('')
  const [courier, setCourier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  // Mirrors EvidenceUploader's own uploading/error state up here so it
  // survives the pre-scan uploader unmounting the instant "Scan QR
  // Penyelesaian" succeeds — see root cause note in EvidenceUploader.tsx.
  const [evidenceUploading, setEvidenceUploading] = useState(false)
  const [evidenceUploadError, setEvidenceUploadError] = useState<string | null>(null)

  // Gates Evidence/Checklist/Setujui/Kembalikan behind a successful "Scan QR
  // Penyelesaian" — completedAtCaptured is the scan moment, used as Jam
  // Selesai instead of whenever Setujui/Kembalikan is eventually clicked.
  // QR Wajib (Production Rules): when off, every stage starts as if already
  // scanned, so the "Scan QR Penyelesaian" gate below never renders.
  const [completionScanned, setCompletionScanned] = useState(!productionRules.qr_required)
  const [completedAtCaptured, setCompletedAtCaptured] = useState<string | null>(null)
  const [showCompletionScan, setShowCompletionScan] = useState(false)

  // Reset the working form whenever the active stage/attempt changes.
  useEffect(() => {
    if (!currentRecord) return
    setDivision(STAGE_LABELS[currentRecord.stage])
    setChecklist(
      Object.fromEntries(checklistItemsForStage(currentRecord.stage).map(item => [item, false]))
    )
    setEvidenceUrl(null)
    setNotes('')
    setAlterCategory('')
    setCourier('')
    setTrackingNumber('')
    setCompletionScanned(!productionRules.qr_required)
    setCompletedAtCaptured(null)
    setEvidenceUploading(false)
    setEvidenceUploadError(null)
    // Only the stage/attempt identity should retrigger this reset — the
    // record object itself is recreated every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRecord?.id])

  async function refetch() {
    const next = await getProductionPacket(supabase, orderId)
    if (next) setPacket(next)
  }

  async function handleStart() {
    if (!currentRecord || !operator) return
    setSubmitting(true)
    try {
      await startStage(supabase, {
        orderId,
        stage: currentRecord.stage,
        operatorId: operator.id,
        division,
      })
      await refetch()
      setOperator(null)
    } finally {
      setSubmitting(false)
    }
  }

  // `explicitDecision` is passed directly by every stage's Setujui/Kembalikan
  // buttons (ApproveReturnPanel) so they can act immediately on click without
  // waiting on a round of state — only Pengiriman's plain "Selesai" button
  // omits it, since it has no approve/return distinction.
  async function handleComplete(explicitDecision?: 'approved' | 'alter') {
    if (!currentRecord) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const requiresEvidence = STAGES_WITH_EVIDENCE.includes(currentRecord.stage)
      const finalDecision = explicitDecision ?? null

      // Data Pengiriman is saved just before the order is finalized — same
      // "Approve Shipping" click, so courier/resi are never left stale from
      // a previous attempt if this stage is ever reopened.
      if (currentRecord.stage === 'shipping') {
        await setShippingInfo(supabase, {
          orderId,
          stageRecordId: currentRecord.id,
          courier,
          trackingNumber: trackingNumber.trim(),
        })
      }

      await completeStage(supabase, {
        orderId,
        stageRecordId: currentRecord.id,
        checklist,
        evidenceUrl: requiresEvidence ? evidenceUrl : null,
        notes,
        decision: finalDecision,
        alterCategory:
          currentRecord.stage === 'qc' && finalDecision === 'alter' ? alterCategory : null,
        completedAt: completedAtCaptured,
      })

      await refetch()
    } catch (err) {
      console.error('[production] complete stage failed', err)
      setSubmitError('Gagal menyimpan. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  // Saving the pattern formulation only persists the measurements — it no
  // longer completes the stage. Completion goes through the same
  // scan/evidence/checklist/Setujui-Kembalikan shell as every other stage.
  async function handlePatternFormulationSaved() {
    setSubmitting(true)
    try {
      await refetch()
    } finally {
      setSubmitting(false)
    }
  }

  const completedRecords = [...packet.stage_records]
    .filter(r => r.status === 'completed')
    .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())

  // PR-03 (Rendering Performance) — stabilized so ChecklistPanel/
  // QcDecisionPanel (now React.memo'd) actually skip re-render on unrelated
  // keystrokes (notes/courier/etc). Same logic, same output.
  const handleToggleChecklistItem = useCallback(
    (item: string) => setChecklist(prev => ({ ...prev, [item]: !prev[item] })),
    []
  )
  const uncheckedChecklistItems = useMemo(
    () => Object.entries(checklist).filter(([, done]) => !done).map(([item]) => item),
    [checklist]
  )

  const requiresEvidence = currentRecord ? STAGES_WITH_EVIDENCE.includes(currentRecord.stage) : false
  // QC Wajib (Production Rules): when off, QC's own checklist no longer
  // blocks Approve — every other stage's checklist stays mandatory.
  const checklistComplete =
    isQc && !productionRules.qc_checklist_required
      ? true
      : Object.values(checklist).every(Boolean)
  // Persiapan Bahan gate: Setujui is unreachable until the operator has
  // saved the Material Preparation card at least once for this attempt
  // (even an all-None save counts — see MaterialPreparationCard) — this is
  // what makes "Reserve Material" the thing that actually unlocks moving on
  // to the next production stage, per Task 4 of the "Pindahkan Konsumsi
  // Inventory ke Production" brief.
  const materialPrepSaved = currentRecord
    ? packet.material_preparation.some(i => i.stage_record_id === currentRecord.id)
    : false
  // Delivery wajib konfirmasi (Production Rules): when off, Pengiriman can
  // be approved without courier/resi filled in.
  const canApprove =
    checklistComplete &&
    (!requiresEvidence || !!evidenceUrl) &&
    (!isMaterialPrep || materialPrepSaved) &&
    (!isShipping ||
      !productionRules.delivery_confirmation_required ||
      (!!courier && trackingNumber.trim().length > 0))
  // QC's "Kembalikan ke Penjahitan" additionally requires a Kategori Temuan
  // so the alter reason is never left blank.
  const canReturn = isQc
    ? notes.trim().length > 0 && alterCategory.trim().length > 0
    : notes.trim().length > 0

  const nextStage = currentRecord
    ? STAGE_ORDER[STAGE_ORDER.indexOf(currentRecord.stage) + 1]
    : undefined
  const nextStageLabel = nextStage ? STAGE_LABELS[nextStage] : null

  return (
    <div className="min-h-screen bg-surface-01">
      <ExitConfirmModal open={showExitConfirm} onCancel={dismissExitConfirm} />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <HeroCard packet={packet} currentStatus={currentRecord?.status} customerPhotoUrl={customerPhotoUrl} />

        {!isMaterialPrep &&
          !isPatternFormulation &&
          !isCutting &&
          !isSewing &&
          !isQc &&
          !isFinishing &&
          !isPacking &&
          !isShipping && (
            <StageProgressRail
              stageRecords={packet.stage_records}
              currentStage={currentRecord?.stage ?? 'shipping'}
            />
          )}

        {(isMaterialPrep ||
          isPatternFormulation ||
          isCutting ||
          isSewing ||
          isQc ||
          isFinishing ||
          isPacking ||
          isShipping) && (
          <StageProgressRail
            stageRecords={packet.stage_records}
            currentStage={currentRecord?.stage ?? 'material_prep'}
            variant="vertical"
          />
        )}

        {!currentRecord && (
          <div className="bg-white/70 border-[0.5px] border-outline-variant/40 shadow-sm p-6 text-center">
            <p className="font-caslon text-lg text-on-surface">Produksi Selesai</p>
            <p className="font-hanken text-xs text-secondary mt-1">
              Semua 8 tahap produksi telah diselesaikan.
            </p>
          </div>
        )}

        {currentRecord && (
          <div className="bg-white/70 rounded-2xl border-[0.5px] border-outline-variant/40 shadow-sm p-6">
            <p className="font-caslon text-lg text-on-surface mb-1">
              {STAGE_LABELS[currentRecord.stage]}
            </p>
            <p className="font-hanken text-xs text-secondary mb-6">
              {currentRecord.status === 'pending'
                ? 'Scan QR Produksi — mulai pekerjaan'
                : 'Scan QR Penyelesaian — selesaikan pekerjaan'}
            </p>

            {currentRecord.status === 'pending' && (
              <div className="space-y-4">
                <OperatorAutocomplete
                  supabase={supabase}
                  value={operator}
                  onChange={setOperator}
                  onReset={() => setOperator(null)}
                  divisiHint={STAGE_LABELS[currentRecord.stage]}
                />
                {isMaterialPrep ||
                isPatternFormulation ||
                isCutting ||
                isSewing ||
                isQc ||
                isFinishing ||
                isPacking ||
                isShipping ? (
                  <p className="font-hanken text-sm text-secondary">
                    Divisi: <strong className="text-on-surface">{STAGE_LABELS[currentRecord.stage]}</strong>
                  </p>
                ) : (
                  <DivisionSelect value={division} onChange={setDivision} />
                )}
                {/* Only appears once an operator is actually picked — the
                    operator must never be treated as working before this
                    button exists to be pressed. */}
                {operator && (
                  <button
                    type="button"
                    onClick={handleStart}
                    disabled={submitting}
                    className="w-full bg-on-surface text-white py-3 font-hanken text-sm font-semibold
                               uppercase tracking-widest hover:bg-amber-mid transition-colors disabled:opacity-40"
                  >
                    Mulai Pekerjaan
                  </button>
                )}
              </div>
            )}

            {currentRecord.status === 'in_progress' && (
              <div className="space-y-5">
                <p className="font-hanken text-xs text-secondary pb-4 border-b border-outline-variant">
                  Dikerjakan oleh <strong>{currentRecord.operator_name}</strong> &middot;{' '}
                  {currentRecord.division}
                </p>

                {/* Rendered outside the completionScanned ternary on purpose:
                    for custom-panel-shell stages the EvidenceUploader that
                    produced this error unmounts the instant the operator
                    scans, so this is the only place left that can still show
                    it afterwards. */}
                {evidenceUploadError && (
                  <p className="font-hanken text-xs text-error">{evidenceUploadError}</p>
                )}

                {isMaterialPrep && (
                  <MaterialPreparationCard
                    supabase={supabase}
                    orderId={orderId}
                    stageRecordId={currentRecord.id}
                    fabricName={packet.design?.fabric ?? null}
                    fabricQuantityMeters={packet.fabric_quantity_meters}
                    existingItems={packet.material_preparation.filter(
                      i => i.stage_record_id === currentRecord.id
                    )}
                    onSaved={refetch}
                  />
                )}

                {isPatternFormulation && (
                  <PatternFormulationPanel
                    supabase={supabase}
                    orderId={orderId}
                    lockedMeasurements={packet.locked_measurements}
                    existing={packet.pattern_formulation}
                    operator={{
                      id: currentRecord.operator_id || '',
                      nama: currentRecord.operator_name || '',
                      is_active: true,
                      divisi: null,
                      division_id: null,
                      status: 'aktif',
                      deleted_at: null,
                      max_concurrent_capacity: 3,
                      created_at: '',
                      updated_at: '',
                    }}
                    onSaved={handlePatternFormulationSaved}
                  />
                )}

                {isCutting && (
                  <PatternReferenceCard
                    patternFormulation={packet.pattern_formulation}
                    stageRecords={packet.stage_records}
                  />
                )}

                {isSewing && (
                  <SewingReferencePanel
                    patternFormulation={packet.pattern_formulation}
                    stageRecords={packet.stage_records}
                  />
                )}

                {isQc && (
                  <QcReferencePanel
                    patternFormulation={packet.pattern_formulation}
                    stageRecords={packet.stage_records}
                  />
                )}

                {isFinishing && (
                  <FinishingReferencePanel stageRecords={packet.stage_records} />
                )}

                {isPacking && (
                  <PackingReferencePanel stageRecords={packet.stage_records} />
                )}

                {isShipping && (
                  <ShippingReferencePanel
                    stageRecords={packet.stage_records}
                    courier={courier}
                    trackingNumber={trackingNumber}
                    onCourierChange={setCourier}
                    onTrackingNumberChange={setTrackingNumber}
                  />
                )}

                {!completionScanned ? (
                  usesCustomPanelShell ? (
                    <>
                      <div>
                        <label className="font-hanken text-[10px] uppercase tracking-widest text-secondary block mb-1">
                          {isCutting
                            ? 'Catatan Pemotongan'
                            : isSewing
                              ? 'Catatan Penjahitan'
                              : isQc
                                ? 'Catatan Pemeriksaan Kualitas'
                                : isFinishing
                                  ? 'Catatan Finishing'
                                  : isPacking
                                    ? 'Catatan Packing'
                                    : isShipping
                                      ? 'Catatan Pengiriman'
                                      : 'Catatan Formulator'}
                        </label>
                        <textarea
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          rows={3}
                          className="w-full border-b border-outline-variant bg-transparent py-2 font-hanken
                                     text-sm text-on-surface outline-none resize-none focus:border-amber-mid
                                     transition-colors"
                          placeholder={
                            isShipping
                              ? 'Catatan tambahan (opsional)...'
                              : 'Opsional — wajib diisi jika mengembalikan tahap ini...'
                          }
                        />
                      </div>

                      <EvidenceUploader
                        supabase={supabase}
                        orderId={orderId}
                        stage={currentRecord.stage}
                        attempt={currentRecord.attempt}
                        value={evidenceUrl}
                        onChange={setEvidenceUrl}
                        onUploadingChange={setEvidenceUploading}
                        onErrorChange={setEvidenceUploadError}
                      />

                      {isPacking && (
                        <PackingVideoUploader
                          supabase={supabase}
                          orderId={orderId}
                          stageRecordId={currentRecord.id}
                          value={currentRecord.video_url}
                          onUploaded={refetch}
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => setShowCompletionScan(true)}
                        disabled={evidenceUploading}
                        className="w-full flex items-center justify-center gap-2 bg-on-surface text-white
                                   font-hanken font-semibold py-3.5 rounded-2xl hover:bg-amber-mid
                                   transition-colors disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
                        {evidenceUploading ? 'Mengunggah Foto...' : 'Scan QR Penyelesaian'}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="font-hanken text-sm text-secondary mb-4">
                        Operator selesai bekerja? Scan QR Penyelesaian untuk mencatat jam selesai
                        dan membuka Bukti Foto &amp; Checklist Akhir.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowCompletionScan(true)}
                        disabled={evidenceUploading}
                        className="w-full flex items-center justify-center gap-2 bg-on-surface text-white
                                   font-hanken font-semibold py-3.5 rounded-2xl hover:bg-amber-mid
                                   transition-colors disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
                        {evidenceUploading ? 'Mengunggah Foto...' : 'Scan QR Penyelesaian'}
                      </button>
                    </div>
                  )
                ) : (
                  <>
                    {requiresEvidence && !usesCustomPanelShell && (
                      <EvidenceUploader
                        supabase={supabase}
                        orderId={orderId}
                        stage={currentRecord.stage}
                        attempt={currentRecord.attempt}
                        value={evidenceUrl}
                        onChange={setEvidenceUrl}
                        onUploadingChange={setEvidenceUploading}
                        onErrorChange={setEvidenceUploadError}
                      />
                    )}

                    <ChecklistPanel
                      items={checklistItemsForStage(currentRecord.stage)}
                      checked={checklist}
                      onToggle={handleToggleChecklistItem}
                    />

                    {!usesCustomPanelShell && (
                      <div>
                        <label className="font-hanken text-[10px] uppercase tracking-widest text-secondary block mb-1">
                          Catatan
                        </label>
                        <textarea
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          rows={3}
                          className="w-full border-b border-outline-variant bg-transparent py-2 font-hanken
                                     text-sm text-on-surface outline-none resize-none focus:border-amber-mid
                                     transition-colors"
                          placeholder={
                            isMaterialPrep
                              ? 'Wajib diisi jika mengembalikan tahap ini...'
                              : 'Catatan tambahan (opsional)...'
                          }
                        />
                      </div>
                    )}

                    {isQc && (
                      <QcDecisionPanel
                        returnReasons={returnReasons}
                        uncheckedItems={uncheckedChecklistItems}
                        alterCategory={alterCategory}
                        onAlterCategoryChange={setAlterCategory}
                      />
                    )}

                    {submitError && (
                      <p className="font-hanken text-xs text-error">{submitError}</p>
                    )}

                    {isMaterialPrep ||
                    isPatternFormulation ||
                    isCutting ||
                    isSewing ||
                    isQc ||
                    isFinishing ||
                    isPacking ? (
                      <ApproveReturnPanel
                        nextStageLabel={nextStageLabel}
                        canApprove={canApprove}
                        canReturn={canReturn}
                        onApprove={() => handleComplete('approved')}
                        onReturn={() => handleComplete('alter')}
                        submitting={submitting}
                        returnLabel={isQc ? 'Kembalikan ke Penjahitan' : undefined}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleComplete()}
                        disabled={!canApprove || submitting}
                        className="w-full bg-on-surface text-white py-3 font-hanken text-sm font-semibold
                                   uppercase tracking-widest hover:bg-amber-mid transition-colors disabled:opacity-40"
                      >
                        {isShipping ? 'Approve Shipping' : 'Selesai'}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {showCompletionScan && (
          <QrScanModal
            title="Scan QR Penyelesaian"
            description="Scan QR Order yang sama untuk menyelesaikan pekerjaan tahap ini."
            expectedPayload={buildProductionQrPayload(orderId)}
            onSuccess={() => {
              setCompletionScanned(true)
              setCompletedAtCaptured(new Date().toISOString())
              setShowCompletionScan(false)
            }}
            onClose={() => setShowCompletionScan(false)}
          />
        )}

        {(isMaterialPrep ||
          isPatternFormulation ||
          isCutting ||
          isSewing ||
          isQc ||
          isFinishing ||
          isPacking ||
          isShipping) && referenceModelSlot}
        {(isMaterialPrep ||
          isPatternFormulation ||
          isCutting ||
          isSewing ||
          isQc ||
          isFinishing ||
          isPacking ||
          isShipping) && materialSpecSlot}
        {(isMaterialPrep ||
          isPatternFormulation ||
          isCutting ||
          isSewing ||
          isQc ||
          isFinishing ||
          isPacking ||
          isShipping) && referenceSlot}

        {/* Cutting/Sewing/QC already surface Formulasi Pola inline in their
            own custom panel above, right where those operators are working —
            this fills the gap for the stages that don't. */}
        {(isMaterialPrep || isFinishing || isPacking || isShipping) && (
          <PatternFormulationCard
            patternFormulation={packet.pattern_formulation}
            stageRecords={packet.stage_records}
            orderNumber={packet.order_number}
            customerName={packet.customer_name}
            design={packet.design}
            customerPhotoUrl={customerPhotoUrl}
          />
        )}

        {communicationSlot}

        {completedRecords.length > 0 && (
          <div>
            <p className="font-hanken text-xs uppercase tracking-widest text-secondary mb-3">
              Riwayat &middot; {completedRecords.length} tahap
            </p>
            <div className="space-y-3">
              {completedRecords.map(record => (
                <DigitalHandoverCard key={record.id} record={record} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
