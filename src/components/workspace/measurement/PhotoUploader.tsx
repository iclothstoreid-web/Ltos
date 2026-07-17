'use client'

import { useState, useRef } from 'react'

const SLOTS = [
  { key: 'front', label: 'Front' },
  { key: 'side', label: 'Side' },
  { key: 'back', label: 'Back' },
] as const

type SlotKey = (typeof SLOTS)[number]['key']

// Local-preview only this sprint — no Supabase Storage bucket exists yet in
// this repo, and provisioning one is backend infra, not a UI upgrade.
// Previews are held in memory (URL.createObjectURL) and are lost on refresh;
// nothing is uploaded anywhere.
export function PhotoUploader() {
  const [previews, setPreviews] = useState<Partial<Record<SlotKey, string>>>({})
  const inputRefs = useRef<Partial<Record<SlotKey, HTMLInputElement | null>>>({})

  const handleFile = (slot: SlotKey, file: File | undefined) => {
    if (!file) return
    setPreviews(prev => ({ ...prev, [slot]: URL.createObjectURL(file) }))
  }

  return (
    <div>
      <p className="font-sans text-xs uppercase tracking-widest text-[#444748] mb-4">
        Body Documentation
      </p>
      <div className="grid grid-cols-3 gap-2">
        {SLOTS.map(slot => (
          <button
            key={slot.key}
            type="button"
            onClick={() => inputRefs.current[slot.key]?.click()}
            className="aspect-square bg-[#f0f3ff] border-[0.5px] border-dashed border-[#c4c7c7]
                       flex flex-col items-center justify-center gap-1 group cursor-pointer
                       hover:bg-[#e2e8f8] transition-colors relative overflow-hidden"
          >
            <input
              ref={el => {
                inputRefs.current[slot.key] = el
              }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFile(slot.key, e.target.files?.[0])}
            />
            {previews[slot.key] ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote/optimizable asset */}
                <img
                  src={previews[slot.key]}
                  alt={`${slot.label} preview`}
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 py-1 px-1">
                  <p className="text-[9px] text-[#444748] text-center uppercase tracking-widest">
                    {slot.label}
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[#c4c7c7] group-hover:text-[#775a19] transition-colors">
                  add_a_photo
                </span>
                <p className="text-[9px] text-[#444748] uppercase tracking-widest">{slot.label}</p>
              </>
            )}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-[#444748]/60 mt-2 italic">
        Preview lokal saja — belum tersimpan ke cloud.
      </p>
    </div>
  )
}
