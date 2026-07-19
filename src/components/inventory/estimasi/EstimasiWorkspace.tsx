'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { fetchCostTemplates } from '@/lib/inventory/materialCalculator'
import type { Material, MaterialCategory, MaterialEstimateTemplate } from '@/lib/inventory/types'
import { TemplateListPanel } from './TemplateListPanel'
import { EstimasiEditor } from './EstimasiEditor'

interface EstimasiWorkspaceProps {
  initialCategories: MaterialCategory[]
  initialMaterials: Material[]
}

interface PendingTemplate {
  template: MaterialEstimateTemplate
  nonce: number
}

export function EstimasiWorkspace({ initialCategories, initialMaterials }: EstimasiWorkspaceProps) {
  const supabase = createClient()

  const [templates, setTemplates] = useState<MaterialEstimateTemplate[]>([])
  const [sessionKey, setSessionKey] = useState(0)
  const [pendingTemplate, setPendingTemplate] = useState<PendingTemplate | null>(null)

  useEffect(() => {
    refreshTemplates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function refreshTemplates() {
    setTemplates(await fetchCostTemplates(supabase).catch(() => []))
  }

  function handleNewEstimate() {
    setPendingTemplate(null)
    setSessionKey(k => k + 1)
  }

  function handleSelectTemplate(template: MaterialEstimateTemplate) {
    setPendingTemplate({ template, nonce: Date.now() })
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-serif text-headline text-on-surface tracking-tight">Estimasi Biaya Material</h1>
          <p className="text-secondary text-body mt-1">Hitung kebutuhan material dan estimasi biaya produksi.</p>
        </div>
        <button
          onClick={handleNewEstimate}
          className="decision-primary flex items-center gap-2 !py-2.5 !px-5 normal-case tracking-normal"
        >
          <Plus size={18} />
          Estimasi Baru
        </button>
      </div>

      <div className="flex gap-8">
        <TemplateListPanel templates={templates} onSelectTemplate={handleSelectTemplate} />

        <div className="flex-1 min-w-0 bg-surface rounded-2xl border border-outline-variant/40">
          <EstimasiEditor
            key={sessionKey}
            categories={initialCategories}
            allMaterials={initialMaterials}
            templates={templates}
            pendingTemplate={pendingTemplate}
            onTemplateSaved={refreshTemplates}
          />
        </div>
      </div>
    </div>
  )
}
