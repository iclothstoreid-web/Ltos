// Operator Management is a CRUD/HR-style surface (status, divisi, soft
// delete) — kept at Admin/Owner only, one notch tighter than
// canManageMasterData (which also allows the artisan/Fitter role), since
// this touches who is allowed to work and their capacity, not a product
// catalog. Mirrors the canManageMasterData single-source-of-truth pattern
// in src/lib/design/masterData.ts.
const OPERATOR_MANAGER_ROLES = ['admin', 'owner']

export function canManageOperators(role: string | null | undefined): boolean {
  return !!role && OPERATOR_MANAGER_ROLES.includes(role)
}
