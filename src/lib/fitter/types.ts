export interface FitterKpiRow {
  fitter_id: string
  nama: string
  divisi: string | null
  status: string
  total_konsultasi: number
  konsultasi_selesai: number
  order_dibuat: number
  // consultation -> order created (was called conversion_rate_pct before
  // a second, distinct conversion metric was added below).
  closing_rate_pct: number | null
  // order created -> payment_status 'lunas'.
  conversion_rate_pct: number | null
  total_revenue: number
  average_order_value: number | null
  repeat_customer_pct: number | null
  avg_consultation_minutes: number | null
  ranking: number
}

export interface FitterKpiConsultationHistoryItem {
  id: string
  consultation_number: string
  status: string
  created_at: string
  customer_name: string | null
}

export interface FitterKpiDetail {
  fitter_id: string
  nama: string
  divisi: string | null
  status: string
  total_konsultasi: number
  konsultasi_selesai: number
  order_dibuat: number
  closing_rate_pct: number | null
  conversion_rate_pct: number | null
  total_revenue: number
  average_order_value: number | null
  repeat_customer_pct: number | null
  avg_consultation_minutes: number | null
  ranking: number | null
  riwayat_konsultasi: FitterKpiConsultationHistoryItem[]
}
