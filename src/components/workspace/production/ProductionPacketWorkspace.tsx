'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Operator, ProductionPacket } from '@/lib/production/types'
import {
  STAGES_WITH_EVIDENCE,
  STAGE_LABELS,
  STAGE_ORDER,
  checklistItemsForStage,
  getCurrentStageRecord,
} from '@/lib/production/stageConfig'
import { completeStage, getProductionPacket, setShippingInfo, startStage } from '@/lib/production/client'
import { releaseMaterialReservation } from '@/lib/inventory/stock'
import { buildProductionQrPayload } from '@/lib/order/qr'
import type { CommunicationMessage } from '@/lib/communication/types'
import type { ConsultationDocument } from '@/components/workspace/consultation-review/fitterEnhancementsCodec'
import { HeroCard } from './HeroCard'
import { ProductionCommunicationPanel } from './ProductionCommunicationPanel'
import { QrScanModal } from './QrScanModal'
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
import { ReferenceModelCard } from './ReferenceModelCard'
import { MaterialSpecCard } from './MaterialSpecCard'
import { MediaProduksiCard } from './MediaProduksiCard'
import { PackingVideoUploader } from './PackingVideoUploader'

interface ProductionPacketWorkspaceProps {
  initialPacket: ProductionPacket
  orderId: string
  initialMessages: CommunicationMessage[]
  customerPhotoUrl: string | null
  customerReferences: ConsultationDocument[]
}

export function ProductionPacketWorkspace({
  initialPacket,
  orderId,
  initialMessages,
  customerPhotoUrl,
  customerReferences,
}: ProductionPacketWorkspaceProps) {
  const [supabase] = useState(() => createClient())
  const [packet, setPacket] = useState(initialPacket)
  const [submitting, setSubmitting] = useState(false)

  const currentRecord = getCurrentStageRecord(packet.stage_records)
  // video_url rides on get_production_packet's stage_records payload
  // (row_to_json), so this is just a derived read — no separate fetch/state.
  // Largest Packing attempt, same rule Customer Journey's RPC applies.
  const packingVideoUrl =
    [...packet.stage_records]
      .filter(r => r.stage === 'packing')
      .sort((a, b) => b.attempt - a.attempt)[0]?.video_url ?? null
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
  const [completionScanned, setCompletionScanned] = useState(false)
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
    setCompletionScanned(false)
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

      // Cross Application Integration (LOCKED): "Persiapan Material" is
      // LTOS's actual first production stage (the brief's "Persiapan
      // Barang") — its completion is what releases the Material
      // Reservation made at order creation. Kiosk has no login session,
      // same reasoning as completeStage itself being callable without one.
      if (currentRecord.stage === 'material_prep') {
        try {
          await releaseMaterialReservation(supabase, orderId)
        } catch (err) {
          console.error('[inventory] release reservation failed', err)
        }
      }

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

  const requiresEvidence = currentRecord ? STAGES_WITH_EVIDENCE.includes(currentRecord.stage) : false
  const checklistComplete = Object.values(checklist).every(Boolean)
  const canApprove =
    checklistComplete &&
    (!requiresEvidence || !!evidenceUrl) &&
    (!isShipping || (!!courier && trackingNumber.trim().length > 0))
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
    <div className="min-h-screen bg-[#FDFCF7]">
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
          <div className="bg-white/70 border-[0.5px] border-[#c6c6cc]/40 shadow-sm p-6 text-center">
            <p className="font-caslon text-lg text-[#161b29]">Produksi Selesai</p>
            <p className="font-hanken text-xs text-[#46464c] mt-1">
              Semua 8 tahap produksi telah diselesaikan.
            </p>
          </div>
        )}

        {currentRecord && (
          <div className="bg-white/70 rounded-2xl border-[0.5px] border-[#c6c6cc]/40 shadow-sm p-6">
            <p className="font-caslon text-lg text-[#161b29] mb-1">
              {STAGE_LABELS[currentRecord.stage]}
            </p>
            <p className="font-hanken text-xs text-[#46464c] mb-6">
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
                />
                {isMaterialPrep ||
                isPatternFormulation ||
                isCutting ||
                isSewing ||
                isQc ||
                isFinishing ||
                isPacking ||
                isShipping ? (
                  <p className="font-hanken text-sm text-[#46464c]">
                    Divisi: <strong className="text-[#161b29]">{STAGE_LABELS[currentRecord.stage]}</strong>
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
                    className="w-full bg-[#161b29] text-white py-3 font-hanken text-sm font-semibold
                               uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-40"
                  >
                    Mulai Pekerjaan
                  </button>
                )}
              </div>
            )}

            {currentRecord.status === 'in_progress' && (
              <div className="space-y-5">
                <p className="font-hanken text-xs text-[#46464c] pb-4 border-b border-[#c6c6cc]">
                  Dikerjakan oleh <strong>{currentRecord.operator_name}</strong> &middot;{' '}
                  {currentRecord.division}
                </p>

                {/* Rendered outside the completionScanned ternary on purpose:
                    for custom-panel-shell stages the EvidenceUploader that
                    produced this error unmounts the instant the operator
                    scans, so this is the only place left that can still show
                    it afterwards. */}
                {evidenceUploadError && (
                  <p className="font-hanken text-xs text-red-600">{evidenceUploadError}</p>
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
                        <label className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] block mb-1">
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
                          className="w-full border-b border-[#c6c6cc] bg-transparent py-2 font-hanken
                                     text-sm text-[#161b29] outline-none resize-none focus:border-[#755b00]
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
                        className="w-full flex items-center justify-center gap-2 bg-[#161b29] text-white
                                   font-hanken font-semibold py-3.5 rounded-2xl hover:bg-[#755b00]
                                   transition-colors disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
                        {evidenceUploading ? 'Mengunggah Foto...' : 'Scan QR Penyelesaian'}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="font-hanken text-sm text-[#46464c] mb-4">
                        Operator selesai bekerja? Scan QR Penyelesaian untuk mencatat jam selesai
                        dan membuka Bukti Foto &amp; Checklist Akhir.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowCompletionScan(true)}
                        disabled={evidenceUploading}
                        className="w-full flex items-center justify-center gap-2 bg-[#161b29] text-white
                                   font-hanken font-semibold py-3.5 rounded-2xl hover:bg-[#755b00]
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
                      onToggle={item =>
                        setChecklist(prev => ({ ...prev, [item]: !prev[item] }))
                      }
                    />

                    {!usesCustomPanelShell && (
                      <div>
                        <label className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] block mb-1">
                          Catatan
                        </label>
                        <textarea
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          rows={3}
                          className="w-full border-b border-[#c6c6cc] bg-transparent py-2 font-hanken
                                     text-sm text-[#161b29] outline-none resize-none focus:border-[#755b00]
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
                        uncheckedItems={Object.entries(checklist)
                          .filter(([, done]) => !done)
                          .map(([item]) => item)}
                        alterCategory={alterCategory}
                        onAlterCategoryChange={setAlterCategory}
                      />
                    )}

                    {submitError && (
                      <p className="font-hanken text-xs text-red-600">{submitError}</p>
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
                        className="w-full bg-[#161b29] text-white py-3 font-hanken text-sm font-semibold
                                   uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-40"
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
          isShipping) && <ReferenceModelCard design={packet.design} />}
        {(isMaterialPrep ||
          isPatternFormulation ||
          isCutting ||
          isSewing ||
          isQc ||
          isFinishing ||
          isPacking ||
          isShipping) && (
          <MaterialSpecCard design={packet.design} consultationNotes={packet.consultation_notes} />
        )}
        {(isMaterialPrep ||
          isPatternFormulation ||
          isCutting ||
          isSewing ||
          isQc ||
          isFinishing ||
          isPacking ||
          isShipping) && (
          <MediaProduksiCard
            customerPhotoUrl={customerPhotoUrl}
            customerReferences={customerReferences}
            packingVideoUrl={packingVideoUrl}
          />
        )}

        {/* Cutting/Sewing/QC already surface Formulasi Pola inline in their
            own custom panel above, right where those operators are working —
            this fills the gap for the stages that don't. */}
        {(isMaterialPrep || isFinishing || isPacking || isShipping) && (
          <PatternFormulationCard
            patternFormulation={packet.pattern_formulation}
            stageRecords={packet.stage_records}
          />
        )}

        <ProductionCommunicationPanel supabase={supabase} orderId={orderId} initialMessages={initialMessages} />

        {completedRecords.length > 0 && (
          <div>
            <p className="font-hanken text-xs uppercase tracking-widest text-[#46464c] mb-3">
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
