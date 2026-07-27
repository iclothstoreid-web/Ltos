import type { SpecSheetPaperSize } from './specSheetPaper'

const PRINT_AREA_ID = 'production-spec-sheet-print-area'
const PAGE_STYLE_ID = 'production-spec-sheet-page-style'

// Browser print needs an explicit `@page { size }` for A5/A6 — without it
// Chrome/Edge always print the OS default (usually A4), regardless of the
// on-screen node's width. Injected/updated right before window.print() so it
// never affects any other page's printing (e.g. Estimasi Biaya's own A4
// print area, which doesn't set @page and should keep behaving as before).
function setPrintPageSize(size: SpecSheetPaperSize) {
  let style = document.getElementById(PAGE_STYLE_ID) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement('style')
    style.id = PAGE_STYLE_ID
    document.head.appendChild(style)
  }
  style.textContent = `@page { size: ${size}; margin: 0; }`
}

// Two rAFs so the freshly re-rendered print DOM has painted before the print
// dialog snapshots it — same reasoning as Estimasi Biaya's handlePrint.
// `onDone` fires after window.print() returns, so callers can reset an
// "exporting" flag at the same point Estimasi Biaya's handlePrint does,
// instead of immediately after calling this (which would re-enable the
// button before the print dialog even opens).
export function triggerSpecSheetPrint(size: SpecSheetPaperSize, onDone?: () => void) {
  setPrintPageSize(size)
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      window.print()
      onDone?.()
    })
  )
}

// Shared by "Unduh PDF" and "Bagikan WhatsApp" — captures the same off-screen
// node used for Print, so all three outputs stay pixel-identical (mirrors
// EstimatePrintView/handleCreatePdf's approach for Estimasi Biaya).
export async function generateSpecSheetPdfBlob(size: SpecSheetPaperSize): Promise<Blob> {
  const node = document.getElementById(PRINT_AREA_ID)
  if (!node) throw new Error('Area cetak tidak ditemukan.')

  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const canvas = await html2canvas(node, { scale: 2 })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: size })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const imgHeight = (canvas.height * pageWidth) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight)
  return pdf.output('blob')
}

export function downloadPdfBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
