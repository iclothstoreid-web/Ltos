import { CheckCircle2, Link2, RefreshCw, Sparkles } from 'lucide-react'

export function BottomStatusBar() {
  return (
    <footer className="border-t border-outline-variant bg-surface/80">
      <div className="max-w-[1440px] mx-auto px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-6">
          <span className="inline-flex items-center gap-2 text-body text-secondary">
            <Sparkles size={16} /> AI Siap
          </span>
          <span className="inline-flex items-center gap-2 text-body text-secondary">
            <CheckCircle2 size={16} /> Pelacakan QR Aktif
          </span>
          <span className="inline-flex items-center gap-2 text-body text-secondary">
            <Link2 size={16} /> Supabase Terhubung
          </span>
        </div>

        <span className="text-body text-secondary">Sinkronisasi Terakhir: —</span>
      </div>
    </footer>
  )
}

