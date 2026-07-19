'use client'

import type { MaterialEstimateTemplate } from '@/lib/inventory/types'

interface TemplateListPanelProps {
  templates: MaterialEstimateTemplate[]
  onSelectTemplate: (template: MaterialEstimateTemplate) => void
}

// Same visual shape as CatalogSidebar.tsx's category list — a persistent
// left panel of saved templates that feeds the editor on the right.
export function TemplateListPanel({ templates, onSelectTemplate }: TemplateListPanelProps) {
  return (
    <div className="w-64 border-r border-outline-variant/40 pr-4 flex flex-col gap-4 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto shrink-0">
      <h3 className="font-serif text-label font-bold text-secondary uppercase tracking-[0.2em] px-1 mt-2">Daftar Template</h3>
      {templates.length === 0 ? (
        <p className="text-label text-secondary/70 px-1">Belum ada template tersimpan.</p>
      ) : (
        <ul className="space-y-1">
          {templates.map(template => (
            <li key={template.id}>
              <button
                onClick={() => onSelectTemplate(template)}
                className="w-full text-left px-4 py-2.5 rounded-xl text-body text-secondary hover:bg-surface/60 hover:text-on-surface transition-all"
              >
                <span className="block truncate font-medium">{template.name}</span>
                <span className="block text-label opacity-60">{template.materialRows.length} material</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
