'use client'

import { useState } from 'react'
import type { DesignSelections } from '@/components/workspace/design-studio/types'
import type { MeasurementFields } from '@/components/workspace/measurement/types'
import type { PublicDesignOptionsByCategory } from '@/lib/customerConsultation/publicDesignOptions'
import { saveCustomerDesign, saveCustomerMeasurement } from '@/app/customer-consultation/[token]/actions'
import { IntroStep } from './IntroStep'
import { DesignStep } from './DesignStep'
import { MeasurementStep } from './MeasurementStep'
import { SuccessStep } from './SuccessStep'

type Step = 'intro' | 'design' | 'measurement' | 'success'

interface CustomerConsultationWorkspaceProps {
  token: string
  customerFirstName: string
  consultationNumber: string
  linkCompleted: boolean
  initialUpdatedAt: string
  initialDesign: Partial<DesignSelections>
  initialCustomerNote: string
  initialMeasurement: MeasurementFields
  designOptions: PublicDesignOptionsByCategory
}

// Client-side state machine for the whole self-service flow: Step 1 (Intro)
// -> Step 2 (Design) -> Step 3 (Measurement) -> Step 4 (Success), with
// "Simpan Desain"/"Simpan Ukuran" persisting in place and "Lanjut"/
// "Selesaikan" persisting AND advancing. `updatedAt` is threaded through
// every save exactly like the internal Fitter workspaces' optimistic-lock
// pattern (src/lib/consultation/notesSave.ts) — always taken from the last
// successful save's return value, never re-derived from the initial
// server-rendered prop.
export function CustomerConsultationWorkspace({
  token,
  customerFirstName,
  consultationNumber,
  linkCompleted,
  initialUpdatedAt,
  initialDesign,
  initialCustomerNote,
  initialMeasurement,
  designOptions,
}: CustomerConsultationWorkspaceProps) {
  const [step, setStep] = useState<Step>(linkCompleted ? 'success' : 'intro')
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt)
  const [design, setDesign] = useState<Partial<DesignSelections>>(initialDesign)
  const [customerNote, setCustomerNote] = useState(initialCustomerNote)
  const [measurement, setMeasurement] = useState<MeasurementFields>(initialMeasurement)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState(false)

  const showSavedNotice = () => {
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2500)
  }

  async function handleSaveDesign(advance: boolean) {
    setSaving(true)
    setError(null)
    const result = await saveCustomerDesign(token, design, customerNote, updatedAt)
    setSaving(false)

    if (!result.success || !result.updatedAt) {
      setError(result.error)
      return
    }

    setUpdatedAt(result.updatedAt)
    if (advance) {
      setStep('measurement')
    } else {
      showSavedNotice()
    }
  }

  async function handleSaveMeasurement(markComplete: boolean) {
    setSaving(true)
    setError(null)
    const result = await saveCustomerMeasurement(token, measurement, updatedAt, markComplete)
    setSaving(false)

    if (!result.success || !result.updatedAt) {
      setError(result.error)
      return
    }

    setUpdatedAt(result.updatedAt)
    if (markComplete) {
      setStep('success')
    } else {
      showSavedNotice()
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFCF8] font-sans text-[#151c27]">
      <header className="border-b border-[#151c27]/10 px-6 py-4">
        <p className="font-serif text-lg">Local Tailor</p>
      </header>

      <div className="max-w-xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-[#fdecea] border border-[#c0392b]/30">
            <p className="text-sm text-[#c0392b]">{error}</p>
          </div>
        )}
        {savedNotice && (
          <div className="mb-6 p-3 rounded-lg bg-[#e8f5e9] border border-[#2e7d32]/30">
            <p className="text-sm text-[#2e7d32]">Tersimpan.</p>
          </div>
        )}

        {step === 'intro' && (
          <IntroStep
            customerFirstName={customerFirstName}
            hasStarted={Boolean(
              Object.values(design).some(Boolean) || Object.values(measurement).some((v) => v)
            )}
            onStart={() => setStep('design')}
          />
        )}

        {step === 'design' && (
          <DesignStep
            selections={design}
            onChange={setDesign}
            customerNote={customerNote}
            onCustomerNoteChange={setCustomerNote}
            options={designOptions}
            saving={saving}
            onSave={() => handleSaveDesign(false)}
            onContinue={() => handleSaveDesign(true)}
          />
        )}

        {step === 'measurement' && (
          <MeasurementStep
            fields={measurement}
            onChange={setMeasurement}
            saving={saving}
            onSave={() => handleSaveMeasurement(false)}
            onFinish={() => handleSaveMeasurement(true)}
            onBack={() => setStep('design')}
          />
        )}

        {step === 'success' && (
          <SuccessStep consultationNumber={consultationNumber} onBackToSummary={() => setStep('intro')} />
        )}
      </div>
    </main>
  )
}
