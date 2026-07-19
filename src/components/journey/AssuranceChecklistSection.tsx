import { SectionShell } from './SectionShell'
import { SectionEyebrow } from './SectionEyebrow'

interface AssuranceChecklistSectionProps {
  title: string
  items: string[]
}

// Elegant quality-assurance list — brief: "Tampilan elegan. Bukan checklist
// teknis." Plain checkmarks + labels only, no checkbox inputs, no
// pass/fail state, no operator/technical detail. Generic enough to reuse
// for any future milestone's own "things we guarantee" list.
export function AssuranceChecklistSection({ title, items }: AssuranceChecklistSectionProps) {
  return (
    <SectionShell>
      <SectionEyebrow>{title}</SectionEyebrow>
      <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4">
        {items.map(item => (
          <li key={item} className="flex items-center gap-2 font-fraunces text-lg text-on-surface">
            <span className="text-primary">✓</span>
            {item}
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}
