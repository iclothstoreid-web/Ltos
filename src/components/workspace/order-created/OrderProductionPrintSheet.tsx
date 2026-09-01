'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { QRCodeSVG } from 'qrcode.react'
import type { DesignSelections } from '@/components/workspace/design-studio/types'
import { buildProductionQrPayload } from '@/lib/order/qr'
import { selectionLabel, isEmptySelection } from '@/lib/design/selectionDisplay'

interface OrderProductionPrintSheetProps {
  orderId: string
  orderNumber: string
  customerName: string
  // The FINAL technical detail — same object every other order surface reads
  // (order.created snapshot today; a Fase-4 amendment overlay later). The
  // print sheet must never carry its own stale copy.
  design: DesignSelections
}

// A4-portrait, single-page production sheet. Rendered through a portal as a
// direct child of <body> (class `ltos-print-portal`) so the `@media print`
// rule in globals.css can hide every OTHER body child with `display:none` —
// which actually collapses their boxes, unlike the old `visibility:hidden`
// approach that left ~5 pages of blank workspace behind the QR.
export function OrderProductionPrintSheet({
  orderId,
  orderNumber,
  customerName,
  design,
}: OrderProductionPrintSheetProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const qrPayload = buildProductionQrPayload(orderId)

  // Core rows: always shown, "——" when unselected.
  const coreRows: { label: string; value: string }[] = [
    { label: 'Model', value: selectionLabel(design.model, '——') },
    { label: 'Fit / Cutting', value: selectionLabel(design.lookCutting, '——') },
    { label: 'Material', value: selectionLabel(design.fabric, '——') },
    { label: 'Warna', value: selectionLabel(design.color, '——') },
    { label: 'Kerah', value: selectionLabel(design.collar, '——') },
    { label: 'Manset', value: selectionLabel(design.cuff, '——') },
    { label: 'Plaket', value: selectionLabel(design.plaket, '——') },
    { label: 'Saku', value: selectionLabel(design.pocket, '——') },
  ]

  // Optional rows: hidden entirely when not chosen.
  const optionalRows = [
    { label: 'Handmade Zig-Zag', value: design.handmadeZigzag },
    { label: 'Bordir', value: design.embroidery },
    { label: 'Aksesori', value: design.button },
  ].filter((r) => !isEmptySelection(r.value))

  return createPortal(
    <div className="ltos-print-portal">
      <div className="ltos-print-sheet">
        <div className="ps-brand">LOCAL TAILOR</div>

        <div className="ps-head">
          <div>
            <div className="ps-k">Nama Customer</div>
            <div className="ps-v ps-v-lg">{customerName || '——'}</div>
          </div>
          <div>
            <div className="ps-k">Order ID</div>
            <div className="ps-v ps-v-lg">{orderNumber}</div>
          </div>
        </div>

        <table className="ps-table">
          <tbody>
            {coreRows.map((row) => (
              <tr key={row.label}>
                <td className="ps-td-k">{row.label}</td>
                <td className="ps-td-v">{row.value}</td>
              </tr>
            ))}
            {optionalRows.map((row) => (
              <tr key={row.label}>
                <td className="ps-td-k">{row.label}</td>
                <td className="ps-td-v">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ps-qr">
          <QRCodeSVG value={qrPayload} size={240} level="M" />
          <div className="ps-qr-label">{orderNumber}</div>
        </div>
      </div>
    </div>,
    document.body
  )
}
