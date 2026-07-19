'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Barcode, Layers, Pencil, QrCode, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { fetchMaterialMovements, fetchMaterialUsage } from '@/lib/inventory/materials'
import type { Material, MaterialUsage, StockMovement } from '@/lib/inventory/types'
import { materialStockStatus, MOVEMENT_TYPE_LABEL, STOCK_STATUS_LABEL } from '@/lib/inventory/types'

interface MaterialDetailDrawerProps {
  material: Material
  onClose: () => void
  onEdit: () => void
  onStockIn: () => void
  onStockOut: () => void
}

type Tab = 'overview' | 'riwayat'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'riwayat', label: 'Riwayat' },
]

export function MaterialDetailDrawer({ material, onClose, onEdit, onStockIn, onStockOut }: MaterialDetailDrawerProps) {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('overview')
  const [usage, setUsage] = useState<MaterialUsage[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])

  useEffect(() => {
    let cancelled = false
    fetchMaterialUsage(supabase, material.id).then(rows => {
      if (!cancelled) setUsage(rows)
    })
    fetchMaterialMovements(supabase, material.id).then(rows => {
      if (!cancelled) setMovements(rows)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material.id])

  const status = materialStockStatus(material)

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-surface shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.15)] z-50 border-l border-outline-variant/50 flex flex-col animate-slide-up">
        <div className="px-6 py-6 flex items-center justify-between border-b border-outline-variant/30 bg-surface/95 backdrop-blur-sm sticky top-0 z-10">
          <h3 className="font-serif text-title font-bold text-on-surface">Detail Material</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-secondary" aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-outline-variant/30 bg-surface/95 backdrop-blur-sm sticky top-[73px] z-10">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-label uppercase tracking-widest font-bold transition-colors border-b-2 ${
                tab === t.id ? 'text-primary border-primary' : 'text-secondary/70 border-transparent hover:text-on-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'overview' && (
            <div className="p-6 pb-0">
              <div className="rounded-2xl overflow-hidden mb-6 aspect-video bg-surface-container border border-outline-variant/30 flex items-center justify-center">
                {material.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL
                  <img src={material.photo_url} alt={material.name} className="w-full h-full object-cover" />
                ) : (
                  <Layers size={32} className="text-secondary/40" />
                )}
              </div>

              <div className="flex items-start justify-between mb-8 gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {material.material_categories?.name ?? '—'}
                    </span>
                    {material.sku && <span className="text-label text-secondary/60 font-mono">SKU: {material.sku}</span>}
                  </div>
                  <h2 className="font-serif text-headline text-on-surface leading-tight truncate">{material.name}</h2>
                  <p className="text-body font-medium text-secondary mt-1">
                    Rp {material.price.toLocaleString('id-ID')} <span className="text-label font-normal">/ {material.unit}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="bg-surface border border-outline-variant/40 p-2 rounded-xl flex flex-col items-center gap-1 shadow-sm">
                    <QrCode size={22} className="text-primary" />
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-tighter">Scan QR</span>
                  </div>
                  <div className="bg-surface border border-outline-variant/40 p-2 rounded-xl flex flex-col items-center gap-1 shadow-sm">
                    <Barcode size={22} className="text-primary" />
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-tighter">Barcode</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-6 mb-8 border border-outline-variant/30">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-on-surface text-[11px] uppercase tracking-widest">Inventaris Real-time</h4>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    status === 'aman'
                      ? 'bg-primary/5 text-primary border-primary/15'
                      : status === 'menipis'
                        ? 'bg-warm-gold/10 text-warm-gold border-warm-gold/20'
                        : 'bg-error/10 text-error border-error/15'
                  }`}>
                    {STOCK_STATUS_LABEL[status]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface p-4 rounded-xl border border-outline-variant/30 shadow-sm">
                    <p className="text-[10px] text-secondary/70 font-bold uppercase tracking-widest mb-1">Physical Stock</p>
                    <p className="text-title font-bold text-on-surface">
                      {material.physical_stock.toLocaleString('id-ID')} <span className="text-[13px] font-medium text-secondary/50">{material.unit}</span>
                    </p>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-outline-variant/30 shadow-sm">
                    <p className="text-[10px] text-secondary/70 font-bold uppercase tracking-widest mb-1">Reserved</p>
                    <p className="text-title font-bold text-warm-gold">
                      {material.reserved_stock.toLocaleString('id-ID')} <span className="text-[13px] font-medium text-secondary/50">{material.unit}</span>
                    </p>
                  </div>
                </div>
                <div className="bg-primary text-white p-5 rounded-2xl flex items-center justify-between shadow-xl shadow-primary/20">
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-[0.2em] font-bold mb-1">Available Stock</p>
                    <p className="text-headline font-bold">
                      {material.available_stock.toLocaleString('id-ID')} <span className="text-body font-normal text-white/70">{material.unit}</span>
                    </p>
                  </div>
                  <Layers size={36} className="opacity-20" />
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 py-2 bg-surface/50 rounded-lg border border-dashed border-outline-variant/50">
                  <p className="text-[10px] text-secondary font-medium italic">Formula: Available = Physical - Reserved</p>
                </div>
                <p className="text-label text-secondary/70 mt-3">
                  Minimum Stock: {material.min_stock.toLocaleString('id-ID')} {material.unit}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div>
                  <p className="text-[10px] text-secondary/60 font-bold uppercase tracking-widest">Lokasi</p>
                  <p className="text-body font-bold text-on-surface leading-tight mt-1">{material.location || 'Belum diatur'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-secondary/60 font-bold uppercase tracking-widest">Update Terakhir</p>
                  <p className="text-body font-bold text-on-surface leading-tight mt-1">
                    {new Date(material.updated_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-on-surface text-[11px] uppercase tracking-widest mb-4">Sedang Digunakan Oleh Order</h4>
                {usage.length === 0 ? (
                  <p className="text-label text-secondary/70">Tidak ada order aktif yang menggunakan material ini.</p>
                ) : (
                  <div className="space-y-3">
                    {usage.map(u => (
                      <div key={u.orderId} className="bg-surface border border-outline-variant/30 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-body font-bold text-on-surface">{u.orderNumber}</p>
                          <p className="text-label text-secondary">{u.customerName} · {u.currentState}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[10px] text-secondary/60 uppercase font-bold">Qty</p>
                            <p className="text-body font-bold text-on-surface">{u.quantity} <span className="text-label font-normal">{material.unit}</span></p>
                          </div>
                          <Link
                            href={`/workspace/order-created/${u.orderId}`}
                            className="text-label text-primary font-bold uppercase tracking-widest hover:underline whitespace-nowrap"
                          >
                            Lihat Order
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'riwayat' && (
            <div className="p-6">
              <h4 className="font-bold text-on-surface text-[11px] uppercase tracking-widest mb-4">Riwayat Stok</h4>
              {movements.length === 0 ? (
                <p className="text-label text-secondary/70">Belum ada riwayat.</p>
              ) : (
                <div className="space-y-3">
                  {movements.map(m => (
                    <div key={m.id} className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-body font-bold text-on-surface">{MOVEMENT_TYPE_LABEL[m.movement_type]}</span>
                        <span className="text-body font-bold text-on-surface">
                          {m.movement_type === 'stock_out' || m.movement_type === 'reservation' ? '-' : '+'}
                          {m.quantity.toLocaleString('id-ID')} {material.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-label text-secondary">
                        <span>
                          {new Date(m.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          {m.profiles?.name ? ` · ${m.profiles.name}` : ''}
                        </span>
                      </div>
                      {m.notes && <p className="text-label text-secondary/80 mt-2 italic">{m.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-outline-variant/30 grid grid-cols-4 gap-3">
          <button onClick={onStockIn} className="col-span-2 decision-primary !py-3.5 normal-case tracking-normal">
            Stock Masuk
          </button>
          <button onClick={onStockOut} className="col-span-2 decision-secondary !py-3.5 normal-case tracking-normal">
            Stock Keluar
          </button>
          <button
            onClick={onEdit}
            className="col-span-4 py-3 border border-outline-variant/60 rounded-xl hover:bg-surface-container-low text-secondary transition-all flex items-center justify-center gap-2"
          >
            <Pencil size={16} />
            <span className="text-label uppercase tracking-widest">Edit Material</span>
          </button>
        </div>
      </div>
    </>
  )
}
