'use client'

interface ReadinessGaugeProps {
  measurementComplete: boolean
  designComplete: boolean
}

// Stitch shows a fixed "95%" — replaced with a genuinely computed
// composite readiness score from real signals required by the LTOS
// workflow (measurement complete, design selections saved). "Catatan
// Fitter" is an optional field (see MeasurementWorkspace's textarea) and
// is deliberately excluded — it was previously counted as a third signal,
// which meant readiness could never reach 100% just because that optional
// note was left blank, even though nothing in the workflow requires it.
export function ReadinessGauge({ measurementComplete, designComplete }: ReadinessGaugeProps) {
  const signals = [measurementComplete, designComplete]
  const pct = Math.round((signals.filter(Boolean).length / signals.length) * 100)
  const circumference = 2 * Math.PI * 58
  const offset = circumference - (pct / 100) * circumference

  return (
    <section className="bg-white p-4 shadow-sm border-[0.5px] border-[#c4c7c7] flex flex-col items-center text-center">
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle className="text-[#dce2f3]" cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="2" />
          <circle
            className="text-[#151c27]"
            cx="64"
            cy="64"
            r="58"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 500ms ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-fraunces text-2xl text-[#151c27]">{pct}%</span>
        </div>
      </div>
      <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-[#151c27]">
        {pct === 100 ? 'Ready to Convert' : 'Belum Lengkap'}
      </h4>
      <p className="font-sans text-xs text-[#444748] mt-1">
        {pct === 100 ? 'Profile data and styles verified' : 'Beberapa data belum lengkap'}
      </p>
    </section>
  )
}
