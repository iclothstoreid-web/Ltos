'use client'

interface DesignNotesFieldProps {
  value: string
  onChange: (value: string) => void
}

// Fitter's freeform catatan for this design — part of the Design
// Specification, but kept out of notesCodec's `key=value|key=value` blueprint
// block since a note can contain '=' or '|' characters that would corrupt it.
export function DesignNotesField({ value, onChange }: DesignNotesFieldProps) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Catatan desain untuk konsultasi ini..."
      rows={4}
      className="w-full p-3 font-sans text-sm text-[#151c27] border border-[#c4c7c7]/60 focus:border-[#775a19]/60 outline-none resize-none bg-white"
    />
  )
}
