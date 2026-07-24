'use client'

import {
  IMPOSSIBLE_RECOMMENDATIONS,
  type EstimationValidationResult,
} from '@/lib/order/estimationValidation'

interface EstimationValidationCardProps {
  result: EstimationValidationResult | null
  hasEstimasi: boolean
  hasTargetDate: boolean
}

const VERDICT_DISPLAY: Record<
  EstimationValidationResult['verdict'],
  { dot: string; border: string; bg: string; label: string }
> = {
  SAFE: { dot: 'bg-[#2e7d32]', border: 'border-[#2e7d32]', bg: 'bg-[#eaf5ea]', label: 'SAFE' },
  RISK: { dot: 'bg-[#b8860b]', border: 'border-[#b8860b]', bg: 'bg-[#fdf6e3]', label: 'RISK' },
  IMPOSSIBLE: { dot: 'bg-[#c0392b]', border: 'border-[#c0392b]', bg: 'bg-[#fdecea]', label: 'IMPOSSIBLE' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Milestone 3 Decision Support: no automation, no AI -- just a deterministic
// display of the SAFE/RISK/IMPOSSIBLE verdict already computed in
// estimationValidation.ts. The Owner/Fitter keeps the decision either way;
// this never blocks "Buat Pesanan".
export function EstimationValidationCard({ result, hasEstimasi, hasTargetDate }: EstimationValidationCardProps) {
  return (
    <section className="bg-white p-4 shadow-sm border-[0.5px] border-[#c4c7c7]">
      <h3 className="font-sans text-xs text-[#151c27] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">fact_check</span>
        Estimation Validation
      </h3>

      {!result && (
        <p className="text-xs text-[#7a7a7a]">
          {!hasEstimasi && !hasTargetDate
            ? 'Pilih Estimasi Pengerjaan dan isi Target Usage Date untuk melihat validasi.'
            : !hasEstimasi
              ? 'Pilih Estimasi Pengerjaan terlebih dahulu.'
              : 'Isi Target Usage Date terlebih dahulu.'}
        </p>
      )}

      {result && (
        <div className={`border-[0.5px] p-3 ${VERDICT_DISPLAY[result.verdict].border} ${VERDICT_DISPLAY[result.verdict].bg}`}>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${VERDICT_DISPLAY[result.verdict].dot}`} />
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#151c27]">
              {VERDICT_DISPLAY[result.verdict].label}
            </span>
          </div>

          <p className="mt-2 text-xs text-[#444748]">
            Estimasi selesai {formatDate(result.estimatedFinish)} — Target pemakaian{' '}
            {formatDate(result.targetUsageDate)}
            {result.bufferDays >= 0
              ? ` (${result.bufferDays} hari sebelum tanggal pemakaian).`
              : ` (terlambat ${Math.abs(result.bufferDays)} hari dari tanggal pemakaian).`}
          </p>

          {result.verdict === 'RISK' && (
            <p className="mt-2 text-xs text-[#775a19]">
              Margin waktu tipis. Order dapat dilanjutkan, tetapi pantau kapasitas dan progres produksi.
            </p>
          )}

          {result.verdict === 'IMPOSSIBLE' && (
            <div className="mt-2">
              <p className="text-xs text-[#c0392b] mb-1">
                Estimasi selesai tidak dapat memenuhi tanggal pemakaian. Rekomendasi:
              </p>
              <ul className="list-disc list-inside text-xs text-[#c0392b]">
                {IMPOSSIBLE_RECOMMENDATIONS.map(recommendation => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] italic text-[#7a7a7a]">
                LTOS hanya memberi rekomendasi — keputusan tetap di Owner/Fitter.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
