// Shape of one entry in get_customer_journey_snapshot's `production_updates`
// jsonb array (20260718000000_add_customer_journey_production_updates.sql) —
// the real cutting/sewing evidence for this order, one entry per stage.
export interface ProductionUpdate {
  stage: 'cutting' | 'sewing'
  status: 'in_progress' | 'completed'
  started_at: string | null
  completed_at: string | null
  evidence_url: string | null
  notes: string | null
}

// Storytelling copy per stage/status — brief: "Gunakan storytelling. Bukan
// laporan produksi." Never references operator names, checklists, or
// technical status, only what's happening to the garment itself.
const STORY: Record<ProductionUpdate['stage'], Record<ProductionUpdate['status'], string>> = {
  cutting: {
    in_progress:
      'Hari ini artisan kami mulai memotong kain pilihan Anda sesuai pola yang telah disiapkan.',
    completed:
      'Kain pilihan Anda telah selesai dipotong dengan presisi, dan kini bersiap memasuki tahap penjahitan.',
  },
  sewing: {
    in_progress:
      'Setiap potongan kain kini disatukan oleh tangan artisan kami, perlahan membentuk pakaian Anda.',
    completed:
      'Proses menjahit pakaian Anda telah selesai. Setiap jahitan dikerjakan dengan penuh perhatian.',
  },
}

export function storyFor(update: ProductionUpdate): string {
  return STORY[update.stage][update.status]
}

export function updateDateFor(update: ProductionUpdate): string | null {
  const value = update.completed_at ?? update.started_at
  if (!value) return null
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
