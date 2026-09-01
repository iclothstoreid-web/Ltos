'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface WorkspaceHeaderIdentifier {
  label: string
  value: string
}

interface WorkspaceCustomerHeaderProps {
  customerName: string
  isPreferred?: boolean
  fitterName: string
  identifiers: WorkspaceHeaderIdentifier[]
  // Measurement block — only on the pre-order Review screen. Absent on
  // Order Created (measurement is locked by then).
  measurement?: {
    consultationId: string
    filledCount: number
    totalCount: number
    bodyTags: string[]
    photoAvailable?: boolean
  }
}

// Compact customer/session bar that replaces the old full-height left
// column on the Fitter Review / Order Created workspaces. Key facts inline;
// body-shape tags + measurement/photo shortcuts fold into "Detail Customer"
// so the design/preview area gets the width instead.
export function WorkspaceCustomerHeader({
  customerName,
  isPreferred,
  fitterName,
  identifiers,
  measurement,
}: WorkspaceCustomerHeaderProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const measurementLabel = measurement
    ? `${measurement.filledCount}/${measurement.totalCount} ukur`
    : null

  return (
    <section className="bg-white border-[0.5px] border-[#c4c7c7] shadow-sm">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="font-fraunces text-lg text-[#151c27] truncate">{customerName}</h2>
          {isPreferred && (
            <span className="bg-[#fed488]/30 text-[#785a1a] px-2 py-0.5 font-sans text-[9px] uppercase tracking-tight shrink-0">
              Prioritas
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-[11px] text-[#444748]">
          {identifiers.map((id) => (
            <span key={id.label}>
              <span className="uppercase tracking-wide text-[#8a8d8d]">{id.label}:</span>{' '}
              <span className="text-[#151c27]">{id.value}</span>
            </span>
          ))}
          <span>
            <span className="uppercase tracking-wide text-[#8a8d8d]">Fitter:</span>{' '}
            <span className="text-[#151c27]">{fitterName}</span>
          </span>
          {measurementLabel && (
            <span>
              <span className="uppercase tracking-wide text-[#8a8d8d]">Ukur:</span>{' '}
              <span
                className={
                  measurement && measurement.filledCount === measurement.totalCount
                    ? 'text-[#006c49]'
                    : 'text-[#8a5a00]'
                }
              >
                {measurement!.filledCount}/{measurement!.totalCount}
              </span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto flex items-center gap-1 font-sans text-[10px] uppercase tracking-widest text-[#775a19] hover:text-[#151c27] transition-colors"
        >
          Detail Customer
          <span
            className="material-symbols-outlined text-[16px] transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          >
            expand_more
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-[#c4c7c7]/40 px-4 py-3 space-y-3">
          {measurement && measurement.bodyTags.length > 0 && (
            <div>
              <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-1.5">
                Karakter Bentuk Tubuh
              </p>
              <div className="flex flex-wrap gap-1.5">
                {measurement.bodyTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-[#775a19]/5 border border-[#775a19]/20 text-[#775a19] text-[10px] font-sans"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {measurement && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push(`/workspace/measurement/${measurement.consultationId}`)}
                className="px-4 py-2 border-[0.5px] border-[#747878] hover:bg-[#f0f3ff] transition-colors font-sans text-xs text-[#151c27]"
              >
                Lihat / Edit Pengukuran
              </button>
              <button
                type="button"
                disabled={!measurement.photoAvailable}
                title={
                  measurement.photoAvailable
                    ? undefined
                    : 'Dokumentasi foto belum tersimpan permanen (hanya pratinjau lokal di tahap Pengukuran)'
                }
                className="px-4 py-2 border-[0.5px] border-[#c4c7c7] font-sans text-xs text-[#444748] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lihat Foto
              </button>
            </div>
          )}

          {identifiers.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-sans text-[11px]">
              {identifiers.map((id) => (
                <div key={id.label} className="flex justify-between gap-2">
                  <dt className="text-[#8a8d8d] uppercase tracking-wide">{id.label}</dt>
                  <dd className="text-[#151c27] truncate">{id.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </section>
  )
}
