'use client'

import { memo, useState } from 'react'
import type { DesignLook } from '@/lib/design/designLooks'
import { describeLookComponents } from '@/lib/design/designLooks'
import { ConfiguratorThumb } from './preview/ConfiguratorThumb'

interface DesignLookGalleryProps {
  looks: DesignLook[]
  // id of the Look just applied — clears as soon as the visitor changes any
  // pilihan, so the highlight never misrepresents the current config.
  activeLookId: string | null
  onPick: (look: DesignLook) => void
}

// Public /design-studio — "Pilih dari Inspirasi" entry, shown above the
// configurator tabs. Picking a Look pre-fills only what its reference photo
// proves; every pilihan stays freely changeable in the tabs below. Dark
// luxury theme to match the marketing shell (distinct from the Fitter App's
// light DesignLookSection, shared data/logic only).
export const DesignLookGallery = memo(function DesignLookGallery({
  looks,
  activeLookId,
  onPick,
}: DesignLookGalleryProps) {
  const [detail, setDetail] = useState<DesignLook | null>(null)

  if (looks.length === 0) return null

  return (
    <section aria-labelledby="design-look-heading" className="border-b border-luxury-gold/10 px-4 py-4">
      <h3
        id="design-look-heading"
        className="font-luxury-sans text-[11px] uppercase tracking-[0.16em] text-luxury-gold"
      >
        Pilih dari Inspirasi
      </h3>
      <p className="mt-1 font-luxury-sans text-[11px] leading-snug text-luxury-taupe">
        Mulai dari desain kurasi kami, lalu sesuaikan setiap detail di bawah.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {looks.map((look) => {
          const selected = look.id === activeLookId
          return (
            <div key={look.id} className="relative">
              <button
                type="button"
                onClick={() => onPick(look)}
                aria-pressed={selected}
                className={`group flex w-full flex-col overflow-hidden rounded-xl border text-left transition ${
                  selected
                    ? 'border-luxury-gold bg-luxury-gold/10 ring-1 ring-luxury-gold'
                    : 'border-luxury-gold/15 hover:border-luxury-gold/45'
                }`}
              >
                <span className="relative flex aspect-square items-center justify-center overflow-hidden bg-luxury-navy">
                  {look.photoUrl ? (
                    <ConfiguratorThumb photoUrl={look.photoUrl} alt="" size={260} quality={70} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-luxury-sans text-[11px] uppercase tracking-wide text-luxury-taupe">Tanpa Foto</span>
                  )}
                  {selected && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-luxury-gold px-1.5 py-0.5 font-luxury-sans text-[9px] font-semibold uppercase tracking-wide text-luxury-black">
                      Dipilih
                    </span>
                  )}
                </span>
                <span className="px-2 py-1.5">
                  <span className="block truncate font-luxury-sans text-xs text-luxury-ivory">{look.name}</span>
                  {look.tagline && (
                    <span className="mt-0.5 block font-luxury-sans text-[10px] leading-tight text-luxury-taupe line-clamp-2">
                      {look.tagline}
                    </span>
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setDetail(look)}
                aria-label={`Detail ${look.name}`}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-luxury-navy-deep/70 font-luxury-sans text-[11px] text-luxury-ivory transition hover:bg-luxury-navy-deep"
              >
                i
              </button>
            </div>
          )
        })}
      </div>

      {detail && <DesignLookDetail look={detail} onClose={() => setDetail(null)} onPick={onPick} />}
    </section>
  )
})

function DesignLookDetail({
  look,
  onClose,
  onPick,
}: {
  look: DesignLook
  onClose: () => void
  onPick: (look: DesignLook) => void
}) {
  const mapped = describeLookComponents(look)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-luxury-gold/20 bg-luxury-navy-deep p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-luxury-sans text-[10px] uppercase tracking-[0.16em] text-luxury-gold">Design Look</p>
            <h4 className="mt-1 font-fraunces text-xl text-luxury-ivory">{look.name}</h4>
            {look.tagline && <p className="mt-0.5 font-luxury-sans text-xs text-luxury-taupe">{look.tagline}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="font-luxury-sans text-lg text-luxury-taupe hover:text-luxury-ivory">
            ✕
          </button>
        </div>

        {look.photoUrl && (
          <div className="relative mt-4 aspect-[3/4] w-full overflow-hidden rounded-lg border border-luxury-gold/15">
            <ConfiguratorThumb photoUrl={look.photoUrl} alt={look.name} size={520} quality={72} className="h-full w-full object-cover" />
          </div>
        )}

        {look.description && (
          <p className="mt-4 font-luxury-sans text-sm leading-relaxed text-luxury-ivory/90">{look.description}</p>
        )}

        {look.sellingPoints.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {look.sellingPoints.map((p, i) => (
              <li key={i} className="flex gap-2 font-luxury-sans text-sm text-luxury-ivory/90">
                <span className="text-luxury-gold">·</span>
                {p}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">Desain ini akan mengatur</p>
        {mapped.length > 0 ? (
          <ul className="mt-2 divide-y divide-luxury-gold/10 rounded-lg border border-luxury-gold/15">
            {mapped.map((line) => (
              <li key={line} className="px-3 py-2 font-luxury-sans text-sm text-luxury-ivory/90">
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 font-luxury-sans text-xs text-luxury-taupe">Referensi visual saja — tidak mengubah pilihan otomatis.</p>
        )}
        <p className="mt-2 font-luxury-sans text-[11px] text-luxury-taupe">Semua pilihan tetap bisa Anda ubah setelahnya.</p>

        <button
          type="button"
          onClick={() => {
            onPick(look)
            onClose()
          }}
          className="mt-5 w-full rounded-full bg-luxury-gold px-4 py-3 font-luxury-sans text-xs font-semibold uppercase tracking-[0.14em] text-luxury-black transition hover:brightness-110"
        >
          Gunakan Desain Ini
        </button>
      </div>
    </div>
  )
}
