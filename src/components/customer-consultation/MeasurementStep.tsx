import {
  EMPTY_FIELDS,
  FIELD_LABELS,
  BASIC_BODY_DATA_KEYS,
  BASIC_BODY_DATA_LABELS,
  BASIC_BODY_DATA_UNITS,
  type MeasurementFields,
  type MeasurementKey,
} from '@/components/workspace/measurement/types'

const MEASUREMENT_KEYS = Object.keys(EMPTY_FIELDS) as MeasurementKey[]

interface MeasurementStepProps {
  fields: MeasurementFields
  onChange: (next: MeasurementFields) => void
  saving: boolean
  onSave: () => void
  onFinish: () => void
  onBack: () => void
}

export function MeasurementStep({ fields, onChange, saving, onSave, onFinish, onBack }: MeasurementStepProps) {
  const filledCount = MEASUREMENT_KEYS.filter((k) => fields[k]).length

  const handleFieldChange = (key: MeasurementKey, value: string) => {
    onChange({ ...fields, [key]: value })
  }

  return (
    <div className="space-y-8">
      <div>
        <button onClick={onBack} className="text-xs text-[#775a19] uppercase tracking-widest mb-4">
          ← Kembali ke Desain
        </button>
        <h2 className="font-serif text-2xl">Isi Ukuran</h2>
        <p className="text-sm text-[#444748] mt-1">
          Isi ukuran yang sudah Anda miliki — tidak perlu semua terisi. Tim kami akan tetap memeriksa ulang.
        </p>
        <p className="text-xs font-semibold text-[#775a19] mt-2">
          {filledCount} dari {MEASUREMENT_KEYS.length} ukuran terisi
        </p>
      </div>

      <div className="p-4 rounded-lg bg-[#fff8e1] border border-[#775a19]/20">
        <p className="text-xs text-[#775a19] leading-relaxed">
          Ukuran yang Anda masukkan akan diperiksa dan divalidasi kembali oleh tim Local Tailor.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MEASUREMENT_KEYS.map((key) => (
          <label key={key} className="block">
            <span className="block text-xs font-semibold uppercase tracking-widest text-[#775a19] mb-1">
              {FIELD_LABELS[key]}
            </span>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={fields[key]}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#151c27]/15 bg-white text-sm text-[#151c27]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#444748]">cm</span>
            </div>
          </label>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#775a19] mb-3">Data Tambahan (opsional)</p>
        <div className="grid grid-cols-3 gap-4">
          {BASIC_BODY_DATA_KEYS.map((key) => (
            <label key={key} className="block">
              <span className="block text-xs font-semibold uppercase tracking-widest text-[#775a19] mb-1">
                {BASIC_BODY_DATA_LABELS[key]}
              </span>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={fields[key] ?? ''}
                  onChange={(e) => onChange({ ...fields, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#151c27]/15 bg-white text-sm text-[#151c27]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#444748]">
                  {BASIC_BODY_DATA_UNITS[key]}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 px-6 py-3 rounded-lg border border-[#151c27]/20 text-[#151c27] text-sm font-semibold uppercase tracking-widest hover:bg-[#151c27]/5 transition-colors disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Ukuran'}
        </button>
        <button
          onClick={onFinish}
          disabled={saving}
          className="flex-1 px-6 py-3 rounded-lg bg-[#151c27] text-white text-sm font-semibold uppercase tracking-widest hover:bg-[#151c27]/90 transition-colors disabled:opacity-50"
        >
          Selesaikan Pengisian
        </button>
      </div>
    </div>
  )
}
