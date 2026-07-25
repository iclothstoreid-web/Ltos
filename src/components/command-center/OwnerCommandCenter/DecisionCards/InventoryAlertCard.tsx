'use client'

import type { InventoryAlertCardData } from '@/lib/decision/types'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface InventoryAlertCardProps {
  data: InventoryAlertCardData
}

// Decision Card 3 — Inventory Alert
// Reuses Inventory. All data composed client-side from fetchMaterials() —
// no new RPC, no new engine.
export function InventoryAlertCard({ data }: InventoryAlertCardProps) {
  return (
    <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 overflow-hidden elev-1 relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[repeating-linear-gradient(135deg,rgba(27,27,28,0.10)_0px,rgba(27,27,28,0.10)_1px,transparent_1px,transparent_9px)]" />

      <div className="relative px-6 py-5 border-b border-outline-variant/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1f6b2c]" />
          <p className="text-label text-secondary uppercase tracking-[0.24em]">Inventory Alert</p>
        </div>
        <p className="text-body text-secondary mt-1">
          Reusing Inventory
        </p>
      </div>

      <div className="relative divide-y divide-outline-variant/60">
        {/* Material di bawah minimum */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-body font-medium text-on-surface">Material di Bawah Minimum</p>
            <p className="text-label text-secondary">Stok di bawah ambang batas</p>
          </div>
          <span className="font-serif text-title text-[28px] leading-none text-[#b8860b] tabular-nums">
            {data.lowStockCount}
          </span>
        </div>

        {/* Material hampir habis */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-body font-medium text-on-surface">Material Hampir Habis</p>
            <p className="text-label text-secondary">Stok tersisa 0</p>
          </div>
          <span className="font-serif text-title text-[28px] leading-none text-[#c0392b] tabular-nums">
            {data.outOfStockCount}
          </span>
        </div>

        {/* Material Paling Kritis */}
        {data.mostCriticalItem && (
          <div className="px-6 py-4">
            <p className="text-body font-medium text-on-surface">Material Paling Kritis</p>
            <Link
              href={`/inventory/material?material=${data.mostCriticalItem.materialId}`}
              className="mt-2 flex items-center justify-between rounded-[10px] border border-[#1f6b2c]/30 bg-[#1f6b2c]/5 px-4 py-3 hover:bg-[#1f6b2c]/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
            >
              <div className="min-w-0">
                <p className="text-body font-medium text-on-surface truncate">{data.mostCriticalItem.name}</p>
                <p className="text-label text-secondary">
                  Stok: {data.mostCriticalItem.available.toLocaleString('id-ID')} {data.mostCriticalItem.unit} · Min:{' '}
                  {data.mostCriticalItem.minStock} {data.mostCriticalItem.unit}
                </p>
              </div>
              <ArrowUpRight size={16} className="text-secondary shrink-0 ml-3" aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* Rekomendasi Reorder */}
        <div className="px-6 py-4">
          <p className="text-body font-medium text-on-surface">Rekomendasi Reorder</p>
          {data.topReorderItems.length === 0 ? (
            <p className="text-body text-secondary mt-1">Semua material dalam kondisi stok aman</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {data.topReorderItems.map(item => (
                <li key={item.materialId}>
                  <Link
                    href={`/inventory/material?material=${item.materialId}`}
                    className="flex items-center justify-between rounded-[8px] px-2 py-1.5 -mx-2 hover:bg-on-surface/5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-body text-secondary truncate">{item.name}</p>
                      <p className="text-label text-secondary">
                        Stok: {item.available.toLocaleString('id-ID')} {item.unit} · Min: {item.minStock} {item.unit}
                      </p>
                    </div>
                    <span className="text-label text-primary shrink-0 ml-3 tabular-nums">
                      +{item.reorderQty.toLocaleString('id-ID')} {item.unit}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {data.lowStockCount > 0 && (
            <Link
              href="/inventory"
              className="mt-3 inline-flex items-center gap-1 text-body text-primary hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
            >
              Tinjau Inventory <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

