// Roles allowed to manage website content (Media Library, Journal,
// Gallery, Homepage slots) via Owner OS -> Content. Deliberately narrower
// than canManageMasterData() (which also grants Fitter/artisan): editorial
// content is an Owner/Admin concern only. The DB RLS policies + the
// public.is_content_manager() helper mirror this exact list — see
// supabase/migrations/20260827000000_sprint_dsux_b_content_cms.sql.
const CONTENT_MANAGER_ROLES = ['admin', 'owner']

export function canManageContent(role: string | null | undefined): boolean {
  return !!role && CONTENT_MANAGER_ROLES.includes(role)
}
