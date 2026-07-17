// Single Communication Thread — one table (`communication_messages`)
// backs both Owner OS views (Per Order, Per Stage). Per Stage is a read-side
// filter over this same data (join to production_stage_records), never a
// separate store — see src/lib/communication/messages.ts.
export const SENDER_ROLES = ['owner', 'fitter', 'production', 'inventory', 'qc', 'delivery'] as const

export type SenderRole = (typeof SENDER_ROLES)[number]

export const SENDER_ROLE_LABELS: Record<SenderRole, string> = {
  owner: 'Owner',
  fitter: 'Fitter',
  production: 'Production',
  inventory: 'Inventory',
  qc: 'QC',
  delivery: 'Delivery',
}

export interface CommunicationMessage {
  id: string
  order_id: string
  sender_role: SenderRole
  sender_name: string | null
  created_by: string | null
  body: string
  created_at: string
}
