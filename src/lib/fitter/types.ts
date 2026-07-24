export interface FitterKpiRow {
  fitter_id: string
  nama: string
  divisi: string | null
  status: string
  total_konsultasi: number
  konsultasi_selesai: number
  order_dibuat: number
  conversion_rate_pct: number | null
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
  riwayat_konsultasi: FitterKpiConsultationHistoryItem[]
}
