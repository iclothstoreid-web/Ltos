import type { SupabaseClient } from '@supabase/supabase-js'
import type { Material, MovementType } from './types'

// Thin wrappers around the SECURITY DEFINER RPC surface that actually
// moves stock — same shape as src/lib/production/client.ts's wrappers
// around get_production_packet/complete_stage. Every function takes an
// explicit `supabase` client rather than constructing its own.

export async function adjustStock(
  supabase: SupabaseClient,
  params: { materialId: string; movementType: Extract<MovementType, 'stock_in' | 'stock_out' | 'adjustment'>; quantity: number; notes?: string }
): Promise<Material> {
  const { data, error } = await supabase.rpc('inventory_adjust_stock', {
    p_material_id: params.materialId,
    p_movement_type: params.movementType,
    p_quantity: params.quantity,
    p_notes: params.notes ?? null,
  })
  if (error) throw error
  return data as Material
}

