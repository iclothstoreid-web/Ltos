import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export function LowStockNotice({ count }: { count: number }) {
  return (
    <div className="bg-error/[0.06] backdrop-blur-sm text-on-surface p-6 rounded-2xl flex items-center justify-between flex-wrap gap-4 border border-error/15 elev-1">
      <div className="flex items-center gap-5">
        <div className="bg-error text-white p-3 rounded-xl shadow-lg shadow-error/20">
          <AlertTriangle size={20} />
        </div>
        <div className="min-w-0">
          <h4 className="font-serif text-title text-on-surface">Stok Kritis Terdeteksi</h4>
          <p className="text-body text-secondary">
            {count > 0
              ? `${count} item berada di bawah batas stok aman.`
              : 'Tidak ada item di bawah batas stok aman.'}
          </p>
        </div>
      </div>
      <Link
        href="/inventory/material?filter=menipis"
        className="bg-error text-white px-5 py-2.5 rounded-xl text-label uppercase tracking-widest hover:bg-error/90 transition-all shadow-md shadow-error/10 whitespace-nowrap"
      >
        Tinjau Stok
      </Link>
    </div>
  )
}
