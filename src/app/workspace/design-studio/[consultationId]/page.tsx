import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DesignStudioWorkspace } from '@/components/workspace/design-studio/DesignStudioWorkspace'
import { OrderCreatedLockNotice } from '@/components/workspace/OrderCreatedLockNotice'
import { findOrderIdForConsultation } from '@/lib/order/lookup'
import { fetchActiveMasterOptions, canManageMasterData } from '@/lib/design/masterData'
import { fetchMaterialStockByName } from '@/lib/inventory/materials'
import { fetchMaterialColorsForMaterials } from '@/lib/design/materialColors'
import { fetchRenderFinal, createRenderFinalSignedUrl } from '@/lib/design/renderFinal'

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

  // Request Flow Optimization (STEP 3) — profile (needs only user.id),
  // masterOptions (flat catalog read, no inputs), and initialRenderFinal
  // (needs only params.consultationId) don't depend on each other's
  // results, so they're fetched together instead of one after another.
  const [{ data: profile }, masterOptions, initialRenderFinal] = await Promise.all([
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single(),
    fetchActiveMasterOptions(supabase),
    fetchRenderFinal(supabase, params.consultationId),
  ])

  const bahanMaterialIds = masterOptions.bahan
    .map(o => o.material_id)
    .filter((id): id is string => !!id)

  // materialStock and materialColorsMap both only need masterOptions.bahan
  // (fetched above), not each other — run in parallel instead of sequentially.
  const [materialStockMap, materialColorsMap] = await Promise.all([
    // Fitter's read-only live-stock view (Inventory -> Fitter App, READ only)
    // — matched by name against the 'bahan' catalog. A Map isn't RSC-prop
    // friendly the way this codebase's plain-object props are, so it's
    // flattened here before crossing the server/client boundary.
    fetchMaterialStockByName(supabase, masterOptions.bahan.map(o => o.name)),
    // Architecture Lock: DNA Color Repository + Material Color Mapping —
    // per-Material scoped Warna choices (a Fabric's real, supplier-backed
    // colors) instead of the flat DNA Color list. Flattened to
    // material_id -> dna_color_id[] before crossing the server/client
    // boundary, same reasoning as materialStock's Map->object flattening
    // above. Only 'bahan' items that are actually linked to a real Inventory
    // material contribute anything here — a not-yet-linked item's fabric
    // simply falls back to the full DNA Color list in GarmentBlueprintPanel.
    fetchMaterialColorsForMaterials(supabase, bahanMaterialIds),
  ])
  const materialStock = Object.fromEntries(materialStockMap)
  const materialColorDnaIds = Object.fromEntries(
    Array.from(materialColorsMap.entries()).map(([materialId, colors]) => [
      materialId,
      colors.map(c => c.dna_color_id),
    ])
  )

  // Color UI (Final UI & Prompt Adjustment, 2026-08-08) — Design Studio's
  // Warna Bahan dropdown shows each color's Supplier Color Code instead of
  // its catalog name; display-only (see ColorSelector.tsx). The code is
  // scoped to a (material, dna_color) PAIR — the same DNA Color can carry a
  // different supplier code for a different Material — so this is keyed by
  // `${material_id}:${dna_color_id}`, not by dna_color_id alone. Flattened
  // to a plain object for the same RSC-prop-friendliness reason
  // materialColorDnaIds already is.
  const supplierColorCodeByMaterialAndColor = Object.fromEntries(
    Array.from(materialColorsMap.entries()).flatMap(([materialId, colors]) =>
      colors.map(c => [`${materialId}:${c.dna_color_id}`, c.supplier_color_code])
    )
  )

  // Render Final Storage — loaded server-side (in the Promise.all above) so
  // Preview/Download/Replace/Approve persist across a page reload, not just
  // within one client session. null when this consultation has never had a
  // render saved yet.
  //
  // Store Private, Access by Signed URL (Final Security Refactor,
  // 2026-08-07) — render_finals only ever holds a Storage path now, never a
  // fetchable URL, so the initial Preview needs its own signed URL minted
  // right here, server-side, at page load (same staff-authenticated
  // session this whole page already runs under). Never persisted — this is
  // a fresh, short-TTL (1 hour) URL good for this page load only; a later
  // Generate/Replace/Download in the client gets its own fresh one from
  // /api/design/render-final/signed-url. True dependency on
  // initialRenderFinal, so this stays a separate await.
  const initialPreviewUrl = initialRenderFinal
    ? await createRenderFinalSignedUrl(supabase, initialRenderFinal.render_storage_path).catch(() => null)
    : null

  return (
    <DesignStudioWorkspace
      consultation={consultation}
      masterOptions={masterOptions}
      materialStock={materialStock}
      materialColorDnaIds={materialColorDnaIds}
      supplierColorCodeByMaterialAndColor={supplierColorCodeByMaterialAndColor}
      canManageMasterData={canManageMasterData(profile?.role)}
      userId={user.id}
      initialRenderFinal={initialRenderFinal}
      initialPreviewUrl={initialPreviewUrl}
    />
  )
}
