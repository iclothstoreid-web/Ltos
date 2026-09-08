'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
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
import { StageProgressRail } from './StageProgressRail'
import { OperatorAutocomplete } from './OperatorAutocomplete'
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

const QrScanModal = dynamic(() => import('./QrScanModal').then(mod => mod.QrScanModal))

type PanelKey = 'model' | 'measurement' | 'task' | 'reference' | 'status' | 'notes'

interface ProductionMobileWorkspaceProps {
  initialPacket: ProductionPacket
  orderId: string
  customerPhotoUrl: string | null
  communicationSlot: ReactNode
  referenceSlot: ReactNode
  referenceModelSlot: ReactNode
  materialSpecSlot: ReactNode
  productionRules: ProductionRules
  returnReasons: string[]
}

interface MenuButtonProps {
  icon: string
  title: string
  subtitle: string
  onClick: () => void
  emphasis?: boolean
}

function MenuButton({ icon, title, subtitle, onClick, emphasis = false }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[104px] rounded-3xl border p-4 text-left transition active:scale-[0.98] ${
        emphasis
          ? 'border-on-surface bg-on-surface text-white shadow-lg'
          : 'border-outline-variant/40 bg-white/80 text-on-surface shadow-sm'
      }`}
    >
      <span className={`material-symbols-outlined text-[24px] ${emphasis ? 'text-white' : 'text-amber-mid'}`}>
        {icon}
      </span>
      <p className="mt-3 font-hanken text-sm font-semibold leading-tight">{title}</p>
      <p className={`mt-1 font-hanken text-[11px] leading-tight ${emphasis ? 'text-white/65' : 'text-secondary'}`}>
        {subtitle}
      </p>
    </button>
  )
}

function MobileSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 bg-surface-01">
      <div className="mx-auto flex h-[100dvh] w-full max-w-2xl flex-col bg-surface-01">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-outline-variant/40 bg-surface-01/95 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm"
            aria-label="Kembali"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="min-w-0">
            <p className="font-hanken text-[10px] uppercase tracking-[0.18em] text-secondary">Production</p>
            <p className="truncate font-caslon text-xl text-on-surface">{title}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-10">
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function ProductionMobileWorkspace({
  initialPacket,
  orderId,
  customerPhotoUrl,
  communicationSlot,
  referenceSlot,
  referenceModelSlot,
  materialSpecSlot,
  productionRules,
  returnReasons,
}: ProductionMobileWorkspaceProps) {
  const [supabase] = useState(() => createClient())
  const [packet, setPacket] = useState(initialPacket)
  const [operator, setOperator] = useState<Operator | null>(null)
  const [division, setDivision] = useState('')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [alterCategory, setAlterCategory] = useState('')
  const [courier, setCourier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [evidenceUploading, setEvidenceUploading] = useState(false)
  const [evidenceUploadError, setEvidenceUploadError] = useState<string | null>(null)
  const [completionScanned, setCompletionScanned] = useState(!productionRules.qr_required)
  const [completedAtCaptured, setCompletedAtCaptured] = useState<string | null>(null)
  const [showCompletionScan, setShowCompletionScan] = useState(false)
  const [activePanel, setActivePanel] = useState<PanelKey | null>(null)
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
  const usesCustomPanelShell =
    isPatternFormulation || isCutting || isSewing || isQc || isFinishing || isPacking || isShipping

  useEffect(() => {
    if (!currentRecord) return
    setDivision(STAGE_LABELS[currentRecord.stage])
    setChecklist(Object.fromEntries(checklistItemsForStage(currentRecord.stage).map(item => [item, false])))
    setEvidenceUrl(null)
    setNotes('')
    setAlterCategory('')
    setCourier('')
    setTrackingNumber('')
    setCompletionScanned(!productionRules.qr_required)
    setCompletedAtCaptured(null)
    setEvidenceUploading(false)
    setEvidenceUploadError(null)
    setSubmitError(null)
    setActivePanel(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRecord?.id])

  async function refetch() {
    const next = await getProductionPacket(supabase, orderId)
    if (next) setPacket(next)
  }

  async function handleStart() {
    if (!currentRecord || !operator) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await startStage(supabase, {
        orderId,
        stage: currentRecord.stage,
        operatorId: operator.id,
        division: division || STAGE_LABELS[currentRecord.stage],
      })
      await refetch()
      setOperator(null)
    } catch (err) {
      console.error('[production] start stage failed', err)
      setSubmitError('Gagal memulai pekerjaan. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePatternFormulationSaved() {
    setSubmitting(true)
    try {
      await refetch()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleComplete(explicitDecision?: 'approved' | 'alter') {
    if (!currentRecord) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const needsEvidence = STAGES_WITH_EVIDENCE.includes(currentRecord.stage)
      const finalDecision = explicitDecision ?? null

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
        evidenceUrl: needsEvidence ? evidenceUrl : null,
        notes,
        decision: finalDecision,
        alterCategory: currentRecord.stage === 'qc' && finalDecision === 'alter' ? alterCategory : null,
        completedAt: completedAtCaptured,
      })

      await refetch()
      setActivePanel(null)
    } catch (err) {
      console.error('[production] complete stage failed', err)
      setSubmitError('Gagal menyimpan. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const completedRecords = useMemo(
    () =>
      [...packet.stage_records]
        .filter(record => record.status === 'completed')
        .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()),
    [packet.stage_records]
  )

  const handleToggleChecklistItem = useCallback(
    (item: string) => setChecklist(previous => ({ ...previous, [item]: !previous[item] })),
    []
  )

  const uncheckedChecklistItems = useMemo(
    () => Object.entries(checklist).filter(([, done]) => !done).map(([item]) => item),
    [checklist]
  )

  const requiresEvidence = currentRecord ? STAGES_WITH_EVIDENCE.includes(currentRecord.stage) : false
  const checklistComplete =
    isQc && !productionRules.qc_checklist_required ? true : Object.values(checklist).every(Boolean)
  const materialPrepSaved = currentRecord
    ? packet.material_preparation.some(item => item.stage_record_id === currentRecord.id)
    : false
  const canApprove =
    checklistComplete &&
    (!requiresEvidence || !!evidenceUrl) &&
    (!isMaterialPrep || materialPrepSaved) &&
    (!isShipping ||
      !productionRules.delivery_confirmation_required ||
      (!!courier && trackingNumber.trim().length > 0))
  const canReturn = isQc
    ? notes.trim().length > 0 && alterCategory.trim().length > 0
    : notes.trim().length > 0
  const nextStage = currentRecord ? STAGE_ORDER[STAGE_ORDER.indexOf(currentRecord.stage) + 1] : undefined
  const nextStageLabel = nextStage ? STAGE_LABELS[nextStage] : null

  const panelTitle: Record<PanelKey, string> = {
    model: 'Model & Bahan',
    measurement: 'Ukuran & Pola',
    task: 'Tugas Tahap',
    reference: 'Referensi',
    status: 'Status Produksi',
    notes: 'Catatan & Komunikasi',
  }

  function openCompletionScan() {
    if (usesCustomPanelShell && requiresEvidence && !evidenceUrl) {
      setActivePanel('task')
      return
    }
    setShowCompletionScan(true)
  }

  function renderTaskPanel() {
    if (!currentRecord) {
      return (
        <div className="rounded-3xl border border-outline-variant/40 bg-white p-5 text-center shadow-sm">
          <p className="font-caslon text-xl">Produksi selesai</p>
          <p className="mt-1 font-hanken text-xs text-secondary">Tidak ada tahap aktif.</p>
        </div>
      )
    }

    if (currentRecord.status === 'pending') {
      return (
        <div className="rounded-3xl border border-outline-variant/40 bg-white p-5 shadow-sm">
          <p className="font-hanken text-sm text-secondary">Mulai pekerjaan dari layar utama terlebih dahulu.</p>
        </div>
      )
    }

    return (
      <>
        <div className="rounded-3xl border border-outline-variant/40 bg-white p-4 shadow-sm">
          <p className="font-hanken text-[10px] uppercase tracking-[0.18em] text-secondary">Tahap aktif</p>
          <p className="mt-1 font-caslon text-xl text-on-surface">{STAGE_LABELS[currentRecord.stage]}</p>
          <p className="mt-1 font-hanken text-xs text-secondary">
            {currentRecord.operator_name || 'Operator'} · {currentRecord.division || STAGE_LABELS[currentRecord.stage]}
          </p>
        </div>

        {evidenceUploadError && <p className="font-hanken text-xs text-error">{evidenceUploadError}</p>}

        {isMaterialPrep && (
          <MaterialPreparationCard
            supabase={supabase}
            orderId={orderId}
            stageRecordId={currentRecord.id}
            fabricName={packet.design?.fabric ?? null}
            fabricQuantityMeters={packet.fabric_quantity_meters}
            existingItems={packet.material_preparation.filter(item => item.stage_record_id === currentRecord.id)}
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
          <PatternReferenceCard patternFormulation={packet.pattern_formulation} stageRecords={packet.stage_records} />
        )}
        {isSewing && (
          <SewingReferencePanel patternFormulation={packet.pattern_formulation} stageRecords={packet.stage_records} />
        )}
        {isQc && (
          <QcReferencePanel patternFormulation={packet.pattern_formulation} stageRecords={packet.stage_records} />
        )}
        {isFinishing && <FinishingReferencePanel stageRecords={packet.stage_records} />}
        {isPacking && <PackingReferencePanel stageRecords={packet.stage_records} />}
        {isShipping && (
          <ShippingReferencePanel
            stageRecords={packet.stage_records}
            courier={courier}
            trackingNumber={trackingNumber}
            onCourierChange={setCourier}
            onTrackingNumberChange={setTrackingNumber}
          />
        )}

        {!completionScanned && usesCustomPanelShell && (
          <>
            <div className="rounded-3xl border border-outline-variant/40 bg-white p-4 shadow-sm">
              <label className="block font-hanken text-[10px] uppercase tracking-widest text-secondary">
                Catatan tahap
              </label>
              <textarea
                value={notes}
                onChange={event => setNotes(event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-outline-variant/50 bg-surface-01 px-3 py-3 font-hanken text-sm outline-none focus:border-amber-mid"
                placeholder={isShipping ? 'Catatan tambahan (opsional)...' : 'Opsional — wajib jika pekerjaan dikembalikan...'}
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
          </>
        )}

        {!completionScanned ? (
          <button
            type="button"
            onClick={openCompletionScan}
            disabled={evidenceUploading || (requiresEvidence && !evidenceUrl)}
            className="flex w-full items-center justify-center gap-2 rounded-3xl bg-on-surface px-4 py-4 font-hanken text-sm font-semibold text-white shadow-lg disabled:opacity-40"
          >
            <span className="material-symbols-outlined">qr_code_scanner</span>
            {evidenceUploading
              ? 'Mengunggah Foto...'
              : requiresEvidence && !evidenceUrl
                ? 'Unggah Bukti Foto Dulu'
                : 'Scan Selesai Kerja'}
          </button>
        ) : (
          <>
            {requiresEvidence && (!usesCustomPanelShell || !evidenceUrl) && (
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
              <div className="rounded-3xl border border-outline-variant/40 bg-white p-4 shadow-sm">
                <label className="block font-hanken text-[10px] uppercase tracking-widest text-secondary">Catatan</label>
                <textarea
                  value={notes}
                  onChange={event => setNotes(event.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-2xl border border-outline-variant/50 bg-surface-01 px-3 py-3 font-hanken text-sm outline-none focus:border-amber-mid"
                  placeholder={isMaterialPrep ? 'Wajib jika tahap dikembalikan...' : 'Catatan tambahan (opsional)...'}
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

            {submitError && <p className="font-hanken text-xs text-error">{submitError}</p>}

            {isMaterialPrep || isPatternFormulation || isCutting || isSewing || isQc || isFinishing || isPacking ? (
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
                className="w-full rounded-3xl bg-on-surface px-4 py-4 font-hanken text-sm font-semibold text-white shadow-lg disabled:opacity-40"
              >
                {submitting ? 'Menyimpan...' : 'Selesaikan Pengiriman'}
              </button>
            )}
          </>
        )}
      </>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-surface-01">
      <ExitConfirmModal open={showExitConfirm} onCancel={dismissExitConfirm} />

      <main className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-4 pb-5 pt-4 sm:px-6">
        <header className="flex items-center justify-between gap-3 py-1">
          <div>
            <p className="font-hanken text-[10px] uppercase tracking-[0.2em] text-secondary">Local Tailor</p>
            <h1 className="font-caslon text-2xl text-on-surface">Production</h1>
          </div>
          {currentRecord && (
            <div className="max-w-[55%] rounded-full bg-white px-3 py-2 text-right shadow-sm">
              <p className="truncate font-hanken text-[10px] font-semibold uppercase tracking-wider text-on-surface">
                {STAGE_LABELS[currentRecord.stage]}
              </p>
            </div>
          )}
        </header>

        <section className="mt-3 rounded-[28px] border border-outline-variant/40 bg-white/85 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-hanken text-[10px] uppercase tracking-widest text-secondary">Order</p>
              <p className="truncate font-caslon text-xl text-on-surface">{packet.order_number}</p>
              <p className="mt-0.5 truncate font-hanken text-xs text-secondary">
                {packet.customer_name || 'Customer'}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface-01">
              <span className="material-symbols-outlined text-amber-mid">qr_code_2</span>
            </div>
          </div>
        </section>

        {!currentRecord ? (
          <section className="mt-4 flex flex-1 flex-col justify-center">
            <div className="rounded-[32px] border border-outline-variant/40 bg-white p-6 text-center shadow-sm">
              <span className="material-symbols-outlined text-4xl text-amber-mid">task_alt</span>
              <p className="mt-3 font-caslon text-2xl text-on-surface">Produksi Selesai</p>
              <p className="mt-1 font-hanken text-xs text-secondary">Semua tahap produksi order ini sudah selesai.</p>
              <button
                type="button"
                onClick={() => setActivePanel('status')}
                className="mt-5 w-full rounded-3xl bg-on-surface px-4 py-4 font-hanken text-sm font-semibold text-white"
              >
                Lihat Status & Riwayat
              </button>
            </div>
          </section>
        ) : currentRecord.status === 'pending' ? (
          <section className="mt-4 flex flex-1 flex-col justify-center pb-4">
            <div className="rounded-[32px] border border-outline-variant/40 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-surface-01 px-3 py-3">
                <span className="material-symbols-outlined text-amber-mid">qr_code_scanner</span>
                <div>
                  <p className="font-hanken text-xs font-semibold text-on-surface">QR berhasil dibuka</p>
                  <p className="font-hanken text-[11px] text-secondary">Pilih pekerja untuk mulai tahap ini.</p>
                </div>
              </div>

              <p className="font-hanken text-[10px] uppercase tracking-widest text-secondary">Mulai pekerjaan</p>
              <p className="mt-1 font-caslon text-2xl text-on-surface">{STAGE_LABELS[currentRecord.stage]}</p>

              <div className="mt-5">
                <OperatorAutocomplete
                  supabase={supabase}
                  value={operator}
                  onChange={setOperator}
                  onReset={() => setOperator(null)}
                  divisiHint={STAGE_LABELS[currentRecord.stage]}
                />
              </div>

              {operator && (
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={submitting}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-3xl bg-on-surface px-4 py-4 font-hanken text-sm font-semibold text-white shadow-lg disabled:opacity-40"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  {submitting ? 'Memulai...' : 'Mulai Pekerjaan'}
                </button>
              )}

              {submitError && <p className="mt-3 font-hanken text-xs text-error">{submitError}</p>}
            </div>
          </section>
        ) : (
          <>
            <section className="mt-4 rounded-[32px] bg-on-surface p-5 text-white shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-hanken text-[10px] uppercase tracking-[0.18em] text-white/60">Sedang dikerjakan</p>
                  <p className="mt-1 truncate font-caslon text-2xl">{currentRecord.operator_name || 'Operator'}</p>
                  <p className="mt-1 font-hanken text-xs text-white/65">{STAGE_LABELS[currentRecord.stage]}</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-amber-mid">construction</span>
              </div>

              <button
                type="button"
                onClick={completionScanned ? () => setActivePanel('task') : openCompletionScan}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-3xl bg-white px-4 py-4 font-hanken text-sm font-bold text-on-surface active:scale-[0.99]"
              >
                <span className="material-symbols-outlined">
                  {completionScanned ? 'checklist' : usesCustomPanelShell && requiresEvidence && !evidenceUrl ? 'assignment' : 'qr_code_scanner'}
                </span>
                {completionScanned
                  ? 'Finalisasi Pekerjaan'
                  : usesCustomPanelShell && requiresEvidence && !evidenceUrl
                    ? 'Lengkapi Tugas Tahap'
                    : 'Scan Selesai Kerja'}
              </button>
            </section>

            <section className="mt-4 grid grid-cols-2 gap-3 pb-2">
              <MenuButton
                icon="apparel"
                title="Model & Bahan"
                subtitle="Desain dan material"
                onClick={() => setActivePanel('model')}
              />
              <MenuButton
                icon="straighten"
                title="Ukuran & Pola"
                subtitle="Measurement dan pola"
                onClick={() => setActivePanel('measurement')}
              />
              <MenuButton
                icon="assignment"
                title="Tugas Tahap"
                subtitle="Data kerja tahap aktif"
                onClick={() => setActivePanel('task')}
                emphasis
              />
              <MenuButton
                icon="photo_library"
                title="Referensi"
                subtitle="Foto dan media kerja"
                onClick={() => setActivePanel('reference')}
              />
              <MenuButton
                icon="timeline"
                title="Status"
                subtitle="Progress dan riwayat"
                onClick={() => setActivePanel('status')}
              />
              <MenuButton
                icon="forum"
                title="Catatan"
                subtitle="Komunikasi produksi"
                onClick={() => setActivePanel('notes')}
              />
            </section>
          </>
        )}
      </main>

      {showCompletionScan && currentRecord && (
        <QrScanModal
          title="Scan Selesai Kerja"
          description="Scan QR order yang sama untuk mencatat waktu selesai pekerjaan."
          expectedPayload={buildProductionQrPayload(orderId)}
          onSuccess={() => {
            setCompletionScanned(true)
            setCompletedAtCaptured(new Date().toISOString())
            setShowCompletionScan(false)
            setActivePanel('task')
          }}
          onClose={() => setShowCompletionScan(false)}
        />
      )}

      {activePanel && (
        <MobileSheet title={panelTitle[activePanel]} onClose={() => setActivePanel(null)}>
          {activePanel === 'model' && (
            <>
              {referenceModelSlot}
              {materialSpecSlot}
            </>
          )}

          {activePanel === 'measurement' && (
            <PatternFormulationCard
              patternFormulation={packet.pattern_formulation}
              stageRecords={packet.stage_records}
              orderNumber={packet.order_number}
              customerName={packet.customer_name}
              design={packet.design}
              customerPhotoUrl={customerPhotoUrl}
            />
          )}

          {activePanel === 'task' && renderTaskPanel()}

          {activePanel === 'reference' && referenceSlot}

          {activePanel === 'status' && (
            <>
              {currentRecord && (
                <StageProgressRail
                  stageRecords={packet.stage_records}
                  currentStage={currentRecord.stage}
                  variant="vertical"
                />
              )}
              {completedRecords.length > 0 && (
                <div>
                  <p className="mb-3 font-hanken text-[10px] uppercase tracking-widest text-secondary">
                    Riwayat · {completedRecords.length} tahap
                  </p>
                  <div className="space-y-3">
                    {completedRecords.map(record => (
                      <DigitalHandoverCard key={record.id} record={record} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activePanel === 'notes' && communicationSlot}
        </MobileSheet>
      )}
    </div>
  )
}
