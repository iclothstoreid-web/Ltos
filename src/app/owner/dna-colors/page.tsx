import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canManageInventory } from '@/lib/inventory/access'
import { fetchDnaColors } from '@/lib/design/dnaColors'
import { DnaColorManager } from '@/components/master-data/DnaColorManager'

// DNA Color Repository (Architecture Lock: DNA Color Repository + Material
// Color Mapping) — the single AI Knowledge source of truth for color,
// deliberately separate from /owner/master-data's Product Knowledge Base
// and from /owner/material-master's operational Material identity. Gated
// with canManageInventory (admin/owner only) since the DB RLS write
// policies on `dna_colors` mirror that exact role list (see migration
// 20260821000000_add_dna_color_repository.sql).
export default async function DnaColorsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!canManageInventory(profile?.role)) redirect('/command-center')

  const colors = await fetchDnaColors(supabase)

  return <DnaColorManager initialColors={colors} />
}
