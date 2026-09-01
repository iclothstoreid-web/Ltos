'use client'

import { useState } from 'react'
import Image from 'next/image'
import { supabaseImageLoader } from '@/lib/supabase/imageLoader'
import type { DesignLook } from '@/lib/design/designLooks'
import { describeLookComponents } from '@/lib/design/designLooks'

interface DesignLookSectionProps {
  looks: DesignLook[]
  // The Look whose components currently match what's selected — drives the
  // "dipilih" highlight. null when the fitter has since changed things.
  activeLookId: string | null
  onApplyLook: (look: DesignLook) => void
}

// Fitter App — "PILIH DESAIN" inspiration zone, shown ABOVE the detail
// selectors in GarmentBlueprintPanel. Picking a Look pre-fills only the
// pilihan it can prove from its reference photo; the fitter can still change
// every one of them below. A Look never locks the design.
export function DesignLookSection({ looks, activeLookId, onApplyLook }: DesignLookSectionProps) {
  const [detail, setDetail] = useState<DesignLook | null>(null)

  if (looks.length === 0) return null

  return (
    <div className="p-4 sm:p-6 lg:p-8 border-b-[0.5px] border-[#c4c7c7] bg-[#f4f4fb]">
      <p className="font-sans text-sm text-[#151c27] uppercase tracking-widest">Pilih Desain</p>
      <p className="font-sans text-xs text-[#444748] mt-1 leading-relaxed">
        Mulai dari desain yang sudah kami kurasi, lalu sesuaikan setiap detailnya di bawah.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 mt-4">
        {looks.map((look) => {
          const selected = look.id === activeLookId
          return (
            <div key={look.id} className="relative group">
              <button
                type="button"
                onClick={() => onApplyLook(look)}
                aria-pressed={selected}
                className={`w-full text-left border-[0.5px] bg-white transition-all overflow-hidden ${
                  selected
                    ? 'border-[#775a19] ring-1 ring-[#775a19] bg-[#775a19]/5'
                    : 'border-[#c4c7c7] hover:border-[#775a19]/40'
                }`}
              >
                <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-[#dce2f3]">
                  {look.photoUrl ? (
                    <DesignLookImage src={look.photoUrl} alt={look.name} />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-[#775a19]/40">checkroom</span>
                  )}
                  {selected && (
                    <span className="absolute top-1.5 left-1.5 font-sans text-[10px] uppercase tracking-wider bg-[#775a19] text-white px-1.5 py-0.5">
                      Dipilih
                    </span>
                  )}
                </div>
                <div className="p-2 space-y-0.5">
                  <span className="font-sans text-sm text-[#151c27] block truncate">{look.name}</span>
                  {look.tagline && (
                    <p className="font-sans text-xs text-[#444748] leading-tight line-clamp-2">{look.tagline}</p>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDetail(look)}
                aria-label={`Detail ${look.name}`}
                className="material-symbols-outlined absolute top-1.5 right-1.5 text-[15px] leading-none text-white bg-[#151c27]/50 hover:bg-[#151c27]/75 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
              >
                info
              </button>
            </div>
          )
        })}
      </div>

      {detail && <DesignLookDetailModal look={detail} onClose={() => setDetail(null)} onApply={onApplyLook} />}
    </div>
  )
}

function DesignLookImage({ src, alt }: { src: string; alt: string }) {
  const [raw, setRaw] = useState(false)
  return (
    <Image
      key={raw ? 'raw' : 'transformed'}
      src={src}
      alt={alt}
      loader={raw ? undefined : supabaseImageLoader}
      unoptimized={raw}
      fill
      sizes="(min-width: 1024px) 15vw, (min-width: 640px) 30vw, 45vw"
      className="object-cover"
      onError={() => setRaw(true)}
    />
  )
}

function DesignLookDetailModal({
  look,
  onClose,
  onApply,
}: {
  look: DesignLook
  onClose: () => void
  onApply: (look: DesignLook) => void
}) {
  const mapped = describeLookComponents(look)
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#fbf9fc] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-[#775a19]">Design Look</p>
            <h3 className="font-caslon text-xl text-[#151c27] mt-1">{look.name}</h3>
            {look.tagline && <p className="font-sans text-xs text-[#444748] mt-0.5">{look.tagline}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="material-symbols-outlined text-[#444748] hover:text-[#151c27] transition-colors"
          >
            close
          </button>
        </div>

        {look.photoUrl && (
          <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-[#c4c7c7]/40">
            <DesignLookImage src={look.photoUrl} alt={look.name} />
          </div>
        )}

        {look.description && <p className="font-sans text-sm text-[#151c27] leading-relaxed">{look.description}</p>}

        {look.sellingPoints.length > 0 && (
          <ul className="space-y-1.5">
            {look.sellingPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#151c27]">
                <span className="material-symbols-outlined text-[16px] text-[#775a19] mt-0.5">check</span>
                {point}
              </li>
            ))}
          </ul>
        )}

        <div>
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">Desain ini akan mengatur</p>
          {mapped.length > 0 ? (
            <ul className="border-[0.5px] border-[#c4c7c7]/40 divide-y divide-[#c4c7c7]/20">
              {mapped.map((line) => (
                <li key={line} className="px-4 py-2 text-sm text-[#151c27]">
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-xs text-[#444748]">
              Hanya sebagai referensi visual — tidak mengubah pilihan apa pun secara otomatis.
            </p>
          )}
          <p className="font-sans text-[11px] text-[#444748] mt-2">Semua pilihan tetap bisa Anda ubah setelahnya.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            onApply(look)
            onClose()
          }}
          className="w-full bg-[#151c27] text-white font-sans text-sm uppercase tracking-widest py-3 hover:bg-[#775a19] transition-colors"
        >
          Gunakan Desain Ini
        </button>
      </div>
    </div>
  )
}
