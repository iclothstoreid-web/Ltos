import { createClient } from '@/lib/supabase/server'
import { STATE_LABELS } from '@/lib/ltos'
import { WorkflowState } from '@/types'

interface Props {
  params: { orderId: string }
}

const VISIBLE_STATES: WorkflowState[] = [
  'order', 'production', 'qc', 'delivery', 'follow_up'
]

const STATE_MESSAGES: Record<WorkflowState, { current: string; next: string }> = {
  lead: { current: 'Sedang diproses', next: 'Konsultasi awal' },
  consultation: { current: 'Diskusi kebutuhan sedang berlangsung', next: 'Penjadwalan fitting' },
  appointment: { current: 'Menunggu jadwal fitting', next: 'Pengambilan ukuran' },
  measurement: { current: 'Pengambilan ukuran sedang berlangsung', next: 'Pembuatan penawaran harga' },
  quotation: { current: 'Penawaran harga sedang disiapkan', next: 'Konfirmasi order' },
  order: { current: 'Order dikonfirmasi. Artisan akan segera ditugaskan.', next: 'Proses jahit dimulai' },
  assign: { current: 'Artisan sedang ditugaskan untuk garment Anda', next: 'Proses produksi dimulai' },
  production: { current: 'Garment Anda sedang dijahit dengan teliti oleh artisan kami.', next: 'Quality check' },
  qc: { current: 'Garment Anda sedang melalui pemeriksaan kualitas akhir.', next: 'Siap untuk diambil' },
  delivery: { current: 'Garment Anda sudah siap. Silakan hubungi kami untuk penjemputan.', next: 'Selesai' },
  follow_up: { current: 'Order selesai. Terima kasih telah mempercayakan kami.', next: '—' },
}

export default async function CustomerPortalPage({ params }: Props) {
  // No auth required — public read
  const supabase = createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`*, customers(name)`)
    .eq('id', params.orderId)
    .single()

  if (!order) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-title text-on-surface">Order tidak ditemukan.</p>
          <p className="text-body text-secondary mt-2">
            Pastikan QR code yang Anda scan sudah benar.
          </p>
        </div>
      </div>
    )
  }

  const currentState = order.current_state as WorkflowState
  const stateMessage = STATE_MESSAGES[currentState]
  const currentIndex = VISIBLE_STATES.indexOf(currentState)

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-sm mx-auto px-6 py-12 animate-fade-in">

        {/* Brand */}
        <div className="mb-10">
          <p className="text-label text-secondary uppercase tracking-widest">
            Local Tailor
          </p>
        </div>

        {/* Greeting */}
        <div className="mb-10">
          <p className="text-label text-secondary mb-1">Halo,</p>
          <h1 className="font-serif text-headline text-on-surface">
            {order.customers?.name}
          </h1>
          <p className="text-mono text-secondary mt-1">
            {order.order_number}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-outline-variant mb-8" />

        {/* Status timeline — minimal, calm */}
        <div className="mb-10">
          {VISIBLE_STATES.map((state, index) => {
            const isPast = index < currentIndex
            const isCurrent = state === currentState
            const isFuture = index > currentIndex

            return (
              <div key={state} className="flex items-start gap-4 mb-4">
                {/* Indicator */}
                <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
                  <div className={`w-3 h-3 rounded-full border-2 transition-all
                    ${isPast
                      ? 'bg-primary border-primary'
                      : isCurrent
                      ? 'bg-primary border-primary animate-pulse-dot'
                      : 'bg-transparent border-outline-variant'
                    }`}
                  />
                  {index < VISIBLE_STATES.length - 1 && (
                    <div className={`w-px flex-1 mt-1 h-4 ${
                      isPast ? 'bg-primary' : 'bg-outline-variant'
                    }`} />
                  )}
                </div>

                {/* Label */}
                <p className={`text-body pb-4 ${
                  isCurrent
                    ? 'text-on-surface font-medium'
                    : isPast
                    ? 'text-secondary'
                    : 'text-secondary/40'
                }`}>
                  {STATE_LABELS[state]}
                </p>
              </div>
            )
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-outline-variant mb-8" />

        {/* What's happening now */}
        <div className="mb-8">
          <p className="zone-label mb-3">Saat ini</p>
          <p className="text-body text-on-surface leading-relaxed">
            {stateMessage.current}
          </p>
        </div>

        {/* What's next */}
        {stateMessage.next !== '—' && (
          <div className="mb-10">
            <p className="zone-label mb-3">Selanjutnya</p>
            <p className="text-body text-secondary">
              {stateMessage.next}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-outline-variant mb-8" />

        {/* Contact */}
        <div>
          <p className="text-label text-secondary mb-3">Ada pertanyaan?</p>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="decision-secondary inline-flex items-center gap-2 w-full justify-center"
          >
            Hubungi Admin
          </a>
        </div>

        {/* Footer */}
        <p className="text-label text-secondary text-center mt-12">
          Local Tailor · Bandung
        </p>
      </div>
    </div>
  )
}
