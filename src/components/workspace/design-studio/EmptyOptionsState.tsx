'use client'

interface EmptyOptionsStateProps {
  label?: string
}

// Shown whenever a master data category has zero active rows, so an empty
// Repository never silently renders a blank selector.
export function EmptyOptionsState({ label }: EmptyOptionsStateProps) {
  return (
    <div className="border border-dashed border-[#c4c7c7] p-4 text-center">
      <p className="font-sans text-xs text-[#444748]">
        Belum ada pilihan {label ? `${label} ` : ''}yang tersedia.
      </p>
      <p className="font-sans text-xs text-[#444748]">Silakan tambahkan melalui Master Data.</p>
    </div>
  )
}
