import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageInventory } from '@/lib/inventory/access'
import { fetchCategories, fetchMaterials } from '@/lib/inventory/materials'
import { MaterialMasterManager } from '@/components/master-data/MaterialMasterManager'
import { getCurrentRole } from '@/lib/rbac/session'

// Material Master (Sprint K LOCK V1 §6-7) — identity-only admin surface
// over the same `materials` table Inventory's Material page manages. Gated
// with canManageInventory (admin/owner only), not canManageMasterData,
// since Inventory access is deliberately admin/owner-only (artisan excluded).
export default async function MaterialMasterPage() {
  const supabase = createClient()

  // Sprint O.6 (Wave 1) — identity already verified by middleware for this
  // route; reads the forwarded x-user-role header instead of repeating
  // auth.getUser() + a profiles lookup.
  const role = await getCurrentRole()
  if (!role) redirect('/owner/login')
  if (!canManageInventory(role)) redirect('/command-center')

  const [categories, materials] = await Promise.all([
    fetchCategories(supabase),
    fetchMaterials(supabase),
  ])

  return <MaterialMasterManager initialMaterials={materials} categories={categories} />
}
