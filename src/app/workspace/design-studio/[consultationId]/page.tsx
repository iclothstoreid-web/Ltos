import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DesignStudioWorkspace } from '@/components/workspace/design-studio/DesignStudioWorkspace'
import { OrderCreatedLockNotice } from '@/components/workspace/OrderCreatedLockNotice'
import { findOrderIdForConsultation } from '@/lib/order/lookup'
import { fetchActiveMasterOptions, canManageMasterData } from '@/lib/design/masterData'
import { fetchMaterialStockByName } from '@/lib/inventory/materials'
import { fetchMaterialColorsForMaterials } from '@/lib/design/materialColors'

interface Props {
  params: { consultationId: string }
}

export default async function DesignStudioPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/fitter/login')

  // Same query pattern already used by Measurement's page.tsx
  const { data: consultation } = await supabase
    .from('consultations')
    .select(`*, customers(*)`)
    .eq('id', params.consultationId)
    .single()

  if (!consultation) redirect('/workspace/check-in')

  if (consultation.status === 'order_created') {
    const orderId = await findOrderIdForConsultation(supabase, consultation.id)
    return (
      <OrderCreatedLockNotice
        consultationNumber={consultation.consultation_number}
        orderId={orderId}
        stageLabel="Design Studio"
      />
    )
  }

  const { data: latestMeasurement } = await supabase
    .from('measurements')
    .select('*')
    .eq('consultation_id', params.consultationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const masterOptions = await fetchActiveMasterOptions(supabase)

  // Fitter's read-only live-stock view (Inventory -> Fitter App, READ only)
  // — matched by name against the 'bahan' catalog. A Map isn't RSC-prop
  // friendly the way this codebase's plain-object props are, so it's
  // flattened here before crossing the server/client boundary.
  const materialStockMap = await fetchMaterialStockByName(
    supabase,
    masterOptions.bahan.map(o => o.name)
  )
  const materialStock = Object.fromEntries(materialStockMap)

  // Architecture Lock: DNA Color Repository + Material Color Mapping —
  // per-Material scoped Warna choices (a Fabric's real, supplier-backed
  // colors) instead of the flat DNA Color list. Flattened to
  // material_id -> dna_color_id[] before crossing the server/client
  // boundary, same reasoning as materialStock's Map->object flattening
  // above. Only 'bahan' items that are actually linked to a real Inventory
  // material contribute anything here — a not-yet-linked item's fabric
  // simply falls back to the full DNA Color list in GarmentBlueprintPanel.
  const bahanMaterialIds = masterOptions.bahan
    .map(o => o.material_id)
    .filter((id): id is string => !!id)
  const materialColorsMap = await fetchMaterialColorsForMaterials(supabase, bahanMaterialIds)
  const materialColorDnaIds = Object.fromEntries(
    Array.from(materialColorsMap.entries()).map(([materialId, colors]) => [
      materialId,
      colors.map(c => c.dna_color_id),
    ])
  )

  return (
    <DesignStudioWorkspace
      consultation={consultation}
      latestMeasurement={latestMeasurement}
      masterOptions={masterOptions}
      materialStock={materialStock}
      materialColorDnaIds={materialColorDnaIds}
      canManageMasterData={canManageMasterData(profile?.role)}
      userId={user.id}
    />
  )
}
