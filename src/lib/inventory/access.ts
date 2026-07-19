// Roles allowed to log into and manage the Inventory workspace itself
// (Stock Masuk/Keluar/Adjustment, Tambah Material, Tambah Katalog).
// Same shape as canManageMasterData() in src/lib/design/masterData.ts —
// single source of truth, read by both the page gate and any UI that
// conditionally shows a management affordance. Artisan (Fitter) is
// deliberately excluded: it only ever gets read access via the Fitter
// integration points (FabricSelector stock badge, Order Detail deep-link),
// never the Inventory workspace, per the brief's locked "Fitter hanya READ"
// rule.
const INVENTORY_MANAGER_ROLES = ['admin', 'owner']

export function canManageInventory(role: string | null | undefined): boolean {
  return !!role && INVENTORY_MANAGER_ROLES.includes(role)
}
