import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageInventory } from '@/lib/inventory/access'
import { fetchDnaColors } from '@/lib/design/dnaColors'
import { DnaColorManager } from '@/components/master-data/DnaColorManager'
import { getCurrentRole } from '@/lib/rbac/session'

// DNA Color Repository (Architecture Lock: DNA Color Repository + Material
// Color Mapping) — the single AI Knowledge source of truth for color,
// deliberately separate from /owner/master-data's Product Knowledge Base
// and from /owner/material-master's operational Material identity. Gated
// with canManageInventory (admin/owner only) since the DB RLS write
// policies on `dna_colors` mirror that exact role list (see migration
// 20260821000000_add_dna_color_repository.sql).
export default async function DnaColorsPage() {
  const supabase = createClient()

  // Sprint O.6 (Wave 1) — identity already verified by middleware for this
  // route; reads the forwarded x-user-role header instead of repeating
  // auth.getUser() + a profiles lookup.
  const role = await getCurrentRole()
  if (!role) redirect('/owner/login')
  if (!canManageInventory(role)) redirect('/command-center')

  const colors = await fetchDnaColors(supabase)

  return <DnaColorManager initialColors={colors} />
}
