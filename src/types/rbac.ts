// ============================================================
// LTOS — RBAC Foundation (Sprint 1)
// Role/Permission/UserProfile types shared by Owner OS, Fitter App,
// Inventory Hub, Production Flow, and Customer Journey (future).
//
// Foundation only — nothing here is wired into middleware, route
// protection, or redirects yet. See src/lib/rbac/roles.ts and
// src/lib/rbac/session.ts.
// ============================================================

import type { UserRole as DbRole } from './index'

export type { DbRole }

// Target role vocabulary for RBAC across all LTOS apps. The `profiles.role`
// column today only ever stores a DbRole ('owner' | 'admin' | 'artisan') —
// normalizeRole() in src/lib/rbac/roles.ts maps 'artisan' to 'fitter', which
// is already how the product refers to that role (see the comments in
// src/lib/inventory/access.ts and src/lib/design/masterData.ts).
// 'inventory' and 'production' have no dedicated DB role yet — Inventory Hub
// is currently owner/admin-only and Production Flow uses QR-token access
// rather than profile roles — they're reserved here for when those apps
// grow their own accounts.
export type Role = 'owner' | 'admin' | 'fitter' | 'inventory' | 'production' | 'customer'

// Mirrors the capability checks that already exist in the codebase
// (canManageInventory, canManageMasterData). Intentionally not extended
// beyond what those two functions already enforce today.
export type Permission = 'manage_inventory' | 'manage_master_data'

export interface UserProfile {
  id: string
  email: string | null
  name: string
  role: Role | null
  createdAt: string
}
