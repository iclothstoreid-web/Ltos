import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InventoryShell } from '@/components/inventory/InventoryShell'
import { InventoryDashboard } from '@/components/inventory/dashboard/InventoryDashboard'
import { canManageInventory } from '@/lib/inventory/access'
import type { ActivityItem } from '@/components/inventory/dashboard/ActivityTimeline'

// Same auth-then-role-gate pattern as src/app/command-center/page.tsx and
// src/app/owner/master-data/page.tsx: getUser() -> profiles.role ->
// canManageInventory() -> redirect. Inventory is Owner/Admin only.
export default async function InventoryDashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/inventory/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!canManageInventory(profile?.role)) redirect('/inventory/login')

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [{ data: categories }, { data: materials }, { data: todayMovements }] = await Promise.all([
    supabase.from('material_categories').select('id'),
    supabase.from('materials').select('id, name, unit, reserved_stock, available_stock, min_stock'),
    supabase
      .from('material_stock_movements')
      .select('id, movement_type, quantity, order_id, created_at, materials(name, unit), profiles(name)')
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false }),
  ])

  const materialRows = materials ?? []
  const stokMenipisCount = materialRows.filter(m => m.available_stock <= m.min_stock).length
  const reservedTotal = materialRows.reduce((sum, m) => sum + (m.reserved_stock || 0), 0)

  const { data: reservationMovements } = await supabase
    .from('material_stock_movements')
    .select('order_id, movement_type, quantity')
    .not('order_id', 'is', null)
    .in('movement_type', ['reservation', 'release'])

  const netByOrder = new Map<string, number>()
  for (const m of reservationMovements ?? []) {
    const delta = m.movement_type === 'reservation' ? m.quantity : -m.quantity
    netByOrder.set(m.order_id as string, (netByOrder.get(m.order_id as string) ?? 0) + delta)
  }
  const reservedOrderCount = Array.from(netByOrder.values()).filter(qty => qty > 0).length

  const activityItems: ActivityItem[] = (todayMovements ?? []).map(m => {
    const material = Array.isArray(m.materials) ? m.materials[0] : m.materials
    const actor = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    return {
      id: m.id,
      movementType: m.movement_type,
      quantity: m.quantity,
      unit: material?.unit || '',
      materialName: material?.name || 'Material',
      notes: null,
      createdAt: m.created_at,
      actorName: actor?.name ?? null,
    }
  })

  return (
    <InventoryShell profileName={profile?.name || 'Admin'}>
      <InventoryDashboard
        totalMaterial={categories?.length || 0}
        totalItem={materialRows.length}
        stokMenipisCount={stokMenipisCount}
        reservedTotal={reservedTotal}
        reservedOrderCount={reservedOrderCount}
        activityItems={activityItems}
      />
    </InventoryShell>
  )
}
