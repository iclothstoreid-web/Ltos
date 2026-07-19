import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InventoryShell } from '@/components/inventory/InventoryShell'
import { MaterialWorkspace } from '@/components/inventory/material/MaterialWorkspace'
import { canManageInventory } from '@/lib/inventory/access'
import { fetchCategories, fetchMaterials } from '@/lib/inventory/materials'

export default async function InventoryMaterialPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/inventory/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!canManageInventory(profile?.role)) redirect('/inventory/login')

  const [categories, materials] = await Promise.all([
    fetchCategories(supabase),
    fetchMaterials(supabase),
  ])

  return (
    <InventoryShell profileName={profile?.name || 'Admin'}>
      <MaterialWorkspace initialCategories={categories} initialMaterials={materials} />
    </InventoryShell>
  )
}
