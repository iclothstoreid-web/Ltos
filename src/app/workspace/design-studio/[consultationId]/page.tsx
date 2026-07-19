import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DesignStudioWorkspace } from '@/components/workspace/design-studio/DesignStudioWorkspace'
import { OrderCreatedLockNotice } from '@/components/workspace/OrderCreatedLockNotice'
import { findOrderIdForConsultation } from '@/lib/order/lookup'
import { fetchActiveMasterOptions, canManageMasterData } from '@/lib/design/masterData'
import { fetchMaterialStockByName } from '@/lib/inventory/materials'

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

  return (
    <DesignStudioWorkspace
      consultation={consultation}
      latestMeasurement={latestMeasurement}
      masterOptions={masterOptions}
      materialStock={materialStock}
      canManageMasterData={canManageMasterData(profile?.role)}
      userId={user.id}
    />
  )
}
