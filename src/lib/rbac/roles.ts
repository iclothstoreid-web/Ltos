import type { DbRole, Permission, Role } from '@/types/rbac'

export const ALL_ROLES: Role[] = ['owner', 'admin', 'fitter', 'inventory', 'production', 'customer']

// Maps the raw profiles.role DB value to the RBAC Role vocabulary. Returns
// null for anything unrecognized rather than throwing — this module must
// never affect existing auth/access behavior, only describe it.
export function normalizeRole(dbRole: DbRole | string | null | undefined): Role | null {
  switch (dbRole) {
    case 'owner':
      return 'owner'
    case 'admin':
      return 'admin'
    case 'artisan':
      return 'fitter'
    default:
      return null
  }
}

// Same grants as INVENTORY_MANAGER_ROLES (src/lib/inventory/access.ts) and
// MASTER_DATA_MANAGER_ROLES (src/lib/design/masterData.ts), expressed in the
// Role vocabulary. Those two functions remain the enforced source of truth
// this sprint — this map is a read-only mirror for future middleware to
// consume, not a replacement.
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ['manage_inventory', 'manage_master_data'],
  admin: ['manage_inventory', 'manage_master_data'],
  fitter: ['manage_master_data'],
  inventory: [],
  production: [],
  customer: [],
}

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function isOwner(role: Role | null | undefined): boolean {
  return role === 'owner'
}

export function isAdmin(role: Role | null | undefined): boolean {
  return role === 'admin'
}

export function isFitter(role: Role | null | undefined): boolean {
  return role === 'fitter'
}

export function isInventory(role: Role | null | undefined): boolean {
  return role === 'inventory'
}

export function isProduction(role: Role | null | undefined): boolean {
  return role === 'production'
}

export function isCustomer(role: Role | null | undefined): boolean {
  return role === 'customer'
}

// Per-app role gates (Sprint 3 login enforcement) — same allowed-role sets
// as ROUTE_RULES in src/middleware.ts, kept here as the single source of
// truth so /owner/login, /fitter/login, and /inventory/login don't each
// hardcode their own role list.
const OWNER_OS_ROLES: Role[] = ['owner', 'admin']
const FITTER_APP_ROLES: Role[] = ['fitter', 'owner', 'admin']
const INVENTORY_HUB_ROLES: Role[] = ['inventory', 'owner', 'admin']

export function canAccessOwnerOS(role: Role | null | undefined): boolean {
  return !!role && OWNER_OS_ROLES.includes(role)
}

export function canAccessFitterApp(role: Role | null | undefined): boolean {
  return !!role && FITTER_APP_ROLES.includes(role)
}

export function canAccessInventoryHub(role: Role | null | undefined): boolean {
  return !!role && INVENTORY_HUB_ROLES.includes(role)
}
