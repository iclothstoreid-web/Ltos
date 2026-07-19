'use client'

import { useLayoutEffect, useState } from 'react'
import type { MeasurementFields } from './types'
import { MeasurementAccordion } from './MeasurementAccordion'
import { MeasurementInput } from './MeasurementInput'

interface FieldSpec {
  key: keyof MeasurementFields
  label: string
  tooltip?: string
}

// The required 12 fields grouped into the reference's four categories
// (Upper Body / Arm / Lower Body / Garment Length) — the mockup only shows
// a handful of fields per group as examples, so this distribution is my own
// anatomically-sensible placement of all 12 into those same four headers.
const GROUPS: { title: string; fields: FieldSpec[] }[] = [
  {
    title: 'Tubuh Bagian Atas',
    fields: [
      { key: 'neck', label: 'Lingkar Leher' },
      { key: 'shoulder', label: 'Lebar Bahu' },
      { key: 'chest', label: 'Lingkar Dada', tooltip: 'Ukur sekeliling bagian dada yang paling lebar' },
      { key: 'waist', label: 'Lingkar Pinggang' },
      { key: 'armhole', label: 'Lingkar Kerung Lengan' },
    ],
  },
  {
    title: 'Lengan',
    fields: [
      { key: 'sleeve', label: 'Panjang Lengan' },
      { key: 'biceps', label: 'Lingkar Lengan Atas' },
      { key: 'elbow', label: 'Lingkar Siku' },
      { key: 'wrist', label: 'Lingkar Pergelangan Tangan' },
    ],
  },
  {
    title: 'Tubuh Bagian Bawah',
    fields: [
      { key: 'hip', label: 'Lingkar Pinggul' },
      { key: 'hemWidth', label: 'Lebar Bawah Thobe' },
    ],
  },
  {
    title: 'Panjang Thobe',
    fields: [{ key: 'length', label: 'Panjang Thobe' }],
  },
]

interface MeasurementSidebarProps {
  fields: MeasurementFields
  onFieldChange: (key: keyof MeasurementFields, value: string) => void
  onFocusField: (key: keyof MeasurementFields | null) => void
}

export function MeasurementSidebar({ fields, onFieldChange, onFocusField }: MeasurementSidebarProps) {
  // Reserve the fixed WorkflowFooter's *real* rendered height, not a
  // hardcoded guess — the footer's content row wraps onto two lines
  // whenever it doesn't fit one (long customer name, narrower viewport,
  // etc.), which a fixed "8rem" clearance can't account for. When the
  // guess fell short, the accordion list's own bottom edge extended a few
  // dozen px into the footer's fixed rectangle, and clicks on whichever
  // row scrolled into that overlap (in practice always Garment Length,
  // being last) were swallowed by the footer sitting on top of it instead
  // of reaching the accordion button — read as "kadang bisa, kadang
  // tidak". Measuring it directly removes the guess entirely.
  const [footerHeight, setFooterHeight] = useState(128)
  useLayoutEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    const update = () => setFooterHeight(footer.getBoundingClientRect().height)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="w-[30%] flex flex-col gap-8" style={{ height: `calc(100vh - 7rem - ${footerHeight}px)` }}>
      <div>
        <h1 className="font-caslon text-3xl text-[#151c27] tracking-tight mb-2">
          Pengukuran Badan
        </h1>
        <div className="h-1 w-12 bg-[#775a19] mb-8" />
      </div>
      {/* flex-1 + min-h-0 (not a fixed vh guess) so this box always stops
          exactly at the fixed WorkflowFooter's top edge — 7rem covers the
          fixed MeasurementTopBar (h-20) + <main>'s own py-8 top padding,
          footerHeight (measured above) matches the fixed WorkflowFooter's
          actual height. Without this, opening accordions top-down could
          push the bottom one (Garment Length) underneath the fixed
          footer, which — being position:fixed — paints over it and
          swallows its clicks. */}
      <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-2">
        {GROUPS.map((group, i) => {
          const filled = group.fields.filter(f => fields[f.key]).length
          return (
            <MeasurementAccordion
              key={group.title}
              title={group.title}
              filled={filled}
              total={group.fields.length}
              defaultOpen={i === 0}
            >
              {group.fields.map(field => (
                <MeasurementInput
                  key={field.key}
                  label={field.label}
                  value={fields[field.key]}
                  onChange={v => onFieldChange(field.key, v)}
                  fieldKey={field.key}
                  onFocusField={onFocusField}
                  tooltip={field.tooltip}
                />
              ))}
            </MeasurementAccordion>
          )
        })}
      </div>
    </section>
  )
}
