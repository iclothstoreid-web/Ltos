'use client'

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
    title: 'Upper Body',
    fields: [
      { key: 'neck', label: 'Neck' },
      { key: 'shoulder', label: 'Shoulder Width' },
      { key: 'chest', label: 'Chest', tooltip: 'Measure around the fullest part of the chest' },
      { key: 'waist', label: 'Natural Waist' },
      { key: 'armhole', label: 'Armhole / Underarm' },
    ],
  },
  {
    title: 'Arm',
    fields: [
      { key: 'sleeve', label: 'Sleeve Length' },
      { key: 'biceps', label: 'Biceps' },
      { key: 'elbow', label: 'Elbow' },
      { key: 'wrist', label: 'Wrist' },
    ],
  },
  {
    title: 'Lower Body',
    fields: [
      { key: 'hip', label: 'Hip' },
      { key: 'hemWidth', label: 'Hem Width' },
    ],
  },
  {
    title: 'Garment Length',
    fields: [{ key: 'length', label: 'Thobe Length' }],
  },
]

interface MeasurementSidebarProps {
  fields: MeasurementFields
  onFieldChange: (key: keyof MeasurementFields, value: string) => void
  onFocusField: (key: keyof MeasurementFields | null) => void
}

export function MeasurementSidebar({ fields, onFieldChange, onFocusField }: MeasurementSidebarProps) {
  return (
    <section className="w-[30%] flex flex-col gap-8 h-[calc(100vh-7rem-8rem)]">
      <div>
        <h1 className="font-caslon text-3xl text-[#151c27] tracking-tight mb-2">
          Body Measurements
        </h1>
        <div className="h-1 w-12 bg-[#775a19] mb-8" />
      </div>
      {/* flex-1 + min-h-0 (not a fixed vh guess) so this box always stops
          exactly at the fixed WorkflowFooter's top edge — 7rem covers the
          fixed MeasurementTopBar (h-20) + <main>'s own py-8 top padding,
          8rem matches the pb-32 footer clearance already used on <main>.
          Without this, opening accordions top-down could push the bottom
          one (Garment Length) underneath the fixed footer, which — being
          position:fixed — paints over it and swallows its clicks. */}
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
