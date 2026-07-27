// Production Specification Sheet paper sizes — shared by the print-layout
// component (pixel width at 96dpi, so the on-screen/PDF-captured node matches
// real paper proportions), the browser print `@page` rule, and jsPDF's page
// format. Kept in one place so Print/PDF/WhatsApp always agree on the same
// three choices (A4/A5/A6) per the master prompt.
export type SpecSheetPaperSize = 'a4' | 'a5' | 'a6'

export const SPEC_SHEET_PAPER_LABELS: Record<SpecSheetPaperSize, string> = {
  a4: 'A4',
  a5: 'A5',
  a6: 'A6',
}

// Width in px at 96dpi (height is left to content — same convention as
// EstimatePrintView, which also only fixes width).
export const SPEC_SHEET_PAPER_WIDTH_PX: Record<SpecSheetPaperSize, number> = {
  a4: 794,
  a5: 559,
  a6: 397,
}
