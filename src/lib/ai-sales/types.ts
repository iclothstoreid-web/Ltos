export const AI_SALES_STAGES = ['new', 'qualified', 'offer', 'hot', 'dp', 'order', 'lost'] as const
export type AiSalesStage = (typeof AI_SALES_STAGES)[number]

export type AiSalesMode = 'ai' | 'human'
export type AiSalesNextAction = 'continue' | 'handoff' | 'collect_order_intent'

export interface AiSalesConversation {
  id: string
  channel: 'whatsapp'
  external_contact_id: string
  customer_id: string | null
  customer_name: string | null
  customer_phone: string | null
  stage: AiSalesStage
  mode: AiSalesMode
  handoff_reason: string | null
  context: Record<string, unknown>
  last_inbound_at: string | null
  last_outbound_at: string | null
  created_at: string
  updated_at: string
}

export interface AiSalesMessage {
  id?: string
  conversation_id: string
  direction: 'inbound' | 'outbound'
  role: 'customer' | 'assistant' | 'human' | 'system'
  provider_message_id: string | null
  message_type: string
  text_content: string | null
  raw_payload?: Record<string, unknown>
  delivery_status?: string | null
  created_at?: string
}

export interface WhatsAppInboundMessage {
  providerMessageId: string
  from: string
  timestamp: string | null
  type: string
  text: string
  profileName: string | null
  rawPayload: Record<string, unknown>
}

export interface WhatsAppStatusUpdate {
  providerMessageId: string
  recipientId: string | null
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'deleted' | string
  timestamp: string | null
  errors: Array<Record<string, unknown>>
  rawPayload: Record<string, unknown>
}

export interface WhatsAppMessageEcho {
  providerMessageId: string
  to: string
  type: string
  text: string
  rawPayload: Record<string, unknown>
}

export interface AiSalesCustomerPatch {
  name?: string
  phone?: string
  city?: string
  eventDate?: string
  budget?: string
  occasion?: string
  fitConcern?: string
  cutting?: string
  referenceGarment?: string
  fittingPreference?: string
  model?: string
  fabric?: string
  color?: string
  collar?: string
  cuff?: string
  placket?: string
  pocket?: string
  notes?: string
}

export interface AiSalesOrderIntent {
  model?: string
  fabric?: string
  color?: string
  collar?: string
  cuff?: string
  placket?: string
  pocket?: string
  quantity?: number
  fittingPreference?: 'online' | 'showroom' | 'home_visit' | 'unknown'
  customerCommitment?: string
}

export interface AiSalesDecision {
  reply: string
  stage: AiSalesStage
  shouldHandoff: boolean
  handoffReason: string | null
  customerPatch: AiSalesCustomerPatch
  nextAction: AiSalesNextAction
  orderIntent: AiSalesOrderIntent | null
}

export interface AiSalesKnowledgeOption {
  category: string
  name: string
  price: number
  sellingPoints: string[]
}

export interface AiSalesBusinessFact {
  key: string
  category: 'commercial' | 'service' | 'payment' | 'location' | 'policy' | 'other'
  label: string
  value: string
  notes: string | null
}

export interface AiSalesBrainEntry {
  category:
    | 'identity'
    | 'style'
    | 'playbook'
    | 'closing'
    | 'follow_up'
    | 'objection'
    | 'invoice'
    | 'after_sales'
    | 'guardrail'
  title: string
  content: string
  stage: AiSalesStage | null
  tags: string[]
  priority: number
}

export interface AiSalesTrainingExample {
  stageBefore: AiSalesStage | null
  stageAfter: AiSalesStage | null
  situation: string
  customerMessage: string | null
  idealReply: string
  rationale: string | null
  outcome: string
  priority: number
}

export interface AiSalesKnowledge {
  options: AiSalesKnowledgeOption[]
  fabrics: Array<{
    name: string
    category: string | null
    color: string | null
    composition: string | null
    gsm: number | null
    highlight: string | null
  }>
  commercialRules: {
    minDpPercent: number | null
    fullPaymentOnly: boolean | null
  }
  businessFacts: AiSalesBusinessFact[]
  brainEntries: AiSalesBrainEntry[]
  trainingExamples: AiSalesTrainingExample[]
}
