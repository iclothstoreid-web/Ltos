import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageInventory } from '@/lib/inventory/access'
import { fetchCategories, fetchMaterials } from '@/lib/inventory/materials'
import { MaterialMasterManager } from '@/components/master-data/MaterialMasterManager'

// Material Master (Sprint K LOCK V1 §6-7) — identity-only admin surface
// over the same `materials` table Inventory's Material page manages. Gated
// with canManageInventory (admin/owner only), not canManageMasterData,
// since Inventory access is deliberately admin/owner-only (artisan excluded).
export default async function MaterialMasterPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!canManageInventory(profile?.role)) redirect('/command-center')

  const [categories, materials] = await Promise.all([
    fetchCategories(supabase),
    fetchMaterials(supabase),
  ])

  return <MaterialMasterManager initialMaterials={materials} categories={categories} />
}
