'use client'

import type { MasterDataOption } from '@/lib/design/masterData'

interface SpecDetailModalProps {
  option: MasterDataOption | null
  onClose: () => void
}

// "Lihat Spesifikasi" — shows Foto / Tabel Spesifikasi / Selling Point for a
// pilihan option, for Fitter/Sales to explain choices to the customer.
// Catatan Internal is deliberately never rendered here (internal-only, per
// the brief). Same overlay shell as production's QrScanModal, just without
// any camera logic. Purely additive — doesn't touch selection state, so the
// Design Studio picking workflow itself is unchanged.
export function SpecDetailModal({ option, onClose }: SpecDetailModalProps) {
  if (!option) return null

  const specEntries = Object.entries(option.metadata).filter(([key]) => key.trim().length > 0)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#fbf9fc] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-[#775a19]">Spesifikasi</p>
            <h3 className="font-caslon text-xl text-[#151c27] mt-1">{option.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="material-symbols-outlined text-[#444748] hover:text-[#151c27] transition-colors"
          >
            close
          </button>
        </div>

        {option.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL
          <img
            src={option.photo_url}
            alt={option.name}
            className="w-full aspect-video object-cover rounded-lg border border-[#c4c7c7]/40"
          />
        )}

        {specEntries.length > 0 && (
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">Tabel Spesifikasi</p>
            <div className="border-[0.5px] border-[#c4c7c7]/40 divide-y divide-[#c4c7c7]/20">
              {specEntries.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between px-4 py-2 text-sm">
                  <span className="text-[#444748] capitalize">{key}</span>
                  <span className="text-[#151c27]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {option.selling_points.length > 0 && (
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">
              Poin Jual / Keunggulan
            </p>
            <ul className="space-y-1.5">
              {option.selling_points.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[#151c27]">
                  <span className="material-symbols-outlined text-[16px] text-[#775a19] mt-0.5">check</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!option.photo_url && specEntries.length === 0 && option.selling_points.length === 0 && (
          <p className="text-sm text-[#444748]">Belum ada detail spesifikasi untuk pilihan ini.</p>
        )}
      </div>
    </div>
  )
}
