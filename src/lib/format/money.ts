// Single shared Rupiah formatter — was duplicated ad-hoc inside
// EstimasiHargaPanel.tsx before Sprint K; every new Commercial Engine view
// (PriceSummaryCard, PaymentSummaryCard, Owner OS Komersial section) reuses
// this instead of redefining it again.
export function formatRupiah(value: number): string {
  return `Rp${Math.round(value).toLocaleString('id-ID')}`
}
