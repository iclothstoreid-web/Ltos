export interface Customer {
  id: string
  name: string
  phone: string | null
  address: string | null
  created_at: string
  is_preferred_client: boolean
}

export interface Consultation {
  id: string
  consultation_number: string
  status:
    | 'check_in'
    | 'waiting_measurement'
    | 'measurement'
    | 'design'
    | 'review'
    | 'order_created'
    | 'cancelled'
  notes: string | null
  completed_at: string | null
  created_at: string
}

export interface RecentConsultation {
  id: string
  consultation_number: string
  status: string
  created_at: string
  customers: {
    id: string
    name: string
    phone: string | null
  } | null
}

export interface CreateConsultationResult {
  success: boolean
  error: string | null
  consultationId: string | null
  consultationNumber: string | null
}

export interface CreateCustomerResult {
  success: boolean
  error: string | null
  customer: Customer | null
}

export interface SearchResult {
  customers: Customer[]
  error: string | null
}

export interface ConsultationHistoryResult {
  consultations: Consultation[]
  error: string | null
}

export interface RecentConsultationsResult {
  consultations: RecentConsultation[]
  error: string | null
}