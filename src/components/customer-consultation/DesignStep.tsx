import { MASTER_DATA_CATEGORY_LABELS } from '@/lib/design/masterData'
import { CATEGORY_BY_FIELD, OPTIONAL_FIELDS, NONE_SELECTION, type DesignSelections } from '@/components/workspace/design-studio/types'
import type { PublicDesignOptionsByCategory } from '@/lib/customerConsultation/publicDesignOptions'

// Order the customer sees the pilihan in — same field set as the internal
// Fitter Design Studio's DesignSelections, deliberately excluding anything
// internal-only (AI render, master-data management, approval).
const FIELD_ORDER: (keyof DesignSelections)[] = [
  'model',
  'lookCutting',
  'fabric',
  'color',
  'collar',
  'cuff',
  'plaket',
  'pocket',
  'button',
  'embroidery',
  'handmadeZigzag',
]

interface DesignStepProps {
  selections: Partial<DesignSelections>
  onChange: (next: Partial<DesignSelections>) => void
  customerNote: string
  onCustomerNoteChange: (value: string) => void
  options: PublicDesignOptionsByCategory
  saving: boolean
  onSave: () => void
  onContinue: () => void
}

export function DesignStep({
  selections,
  onChange,
  customerNote,
  onCustomerNoteChange,
  options,
  saving,
  onSave,
  onContinue,
}: DesignStepProps) {
  const handleFieldChange = (field: keyof DesignSelections, value: string) => {
    onChange({ ...selections, [field]: value })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl">Pilih Model & Bahan</h2>
        <p className="text-sm text-[#444748] mt-1">
          Pilih kombinasi yang Anda inginkan. Semua pilihan bisa diubah kembali kapan saja sebelum tim kami memvalidasi.
        </p>
      </div>

      <div className="space-y-5">
        {FIELD_ORDER.map((field) => {
          const category = CATEGORY_BY_FIELD[field]
          const fieldOptions = options[category] ?? []
          return (
            <label key={field} className="block">
              <span className="block text-xs font-semibold uppercase tracking-widest text-[#775a19] mb-1">
                {MASTER_DATA_CATEGORY_LABELS[category]}
              </span>
              <select
                value={selections[field] ?? ''}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#151c27]/15 bg-white text-sm text-[#151c27]"
              >
                <option value="">Belum dipilih</option>
                {OPTIONAL_FIELDS.has(field) && <option value={NONE_SELECTION}>Tidak Pakai</option>}
                {fieldOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
          )
        })}

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-widest text-[#775a19] mb-1">
            Catatan Desain (opsional)
          </span>
          <textarea
            value={customerNote}
            onChange={(e) => onCustomerNoteChange(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Contoh: warna agak lebih gelap dari sample foto"
            className="w-full px-3 py-2.5 rounded-lg border border-[#151c27]/15 bg-white text-sm text-[#151c27]"
          />
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 px-6 py-3 rounded-lg border border-[#151c27]/20 text-[#151c27] text-sm font-semibold uppercase tracking-widest hover:bg-[#151c27]/5 transition-colors disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Desain'}
        </button>
        <button
          onClick={onContinue}
          disabled={saving}
          className="flex-1 px-6 py-3 rounded-lg bg-[#151c27] text-white text-sm font-semibold uppercase tracking-widest hover:bg-[#151c27]/90 transition-colors disabled:opacity-50"
        >
          Lanjut Isi Ukuran
        </button>
      </div>
    </div>
  )
}
