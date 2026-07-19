// Shared by both "Print" (window.print(), via the #material-estimate-print-area
// isolation rule in globals.css) and "Create PDF" (html2canvas captures this
// same off-screen node) — the brief requires the two to be pixel-identical,
// which is trivially true if there is only ever one DOM node to render.
export interface ResolvedEstimateMaterialRow {
  id: string
  categoryName: string
  materialName: string
  quantity: number
  unit: string
  price: number
  subtotal: number
}

export interface ResolvedEstimateCostRow {
  id: string
  name: string
  nominal: number
  notes: string
}

interface EstimatePrintViewProps {
  nomorEstimasi: string
  estimateName: string
  produk: string
  customer: string
  materialRows: ResolvedEstimateMaterialRow[]
  additionalCosts: ResolvedEstimateCostRow[]
  totalMaterial: number
  totalBiayaTambahan: number
  hargaJual: number
  marginRp: number
  marginPercent: number
  catatan: string
}

const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

export function EstimatePrintView({
  nomorEstimasi,
  estimateName,
  produk,
  customer,
  materialRows,
  additionalCosts,
  totalMaterial,
  totalBiayaTambahan,
  hargaJual,
  marginRp,
  marginPercent,
  catatan,
}: EstimatePrintViewProps) {
  const grandTotal = totalMaterial + totalBiayaTambahan
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div
      id="material-estimate-print-area"
      className="fixed top-0 -left-[9999px] w-[794px] bg-white text-[#1b1b1c] p-12 font-sans"
    >
      <div className="flex items-center justify-between pb-6 border-b-2 border-[#1b1b1c]">
        <div>
          <p className="font-serif text-2xl tracking-tight">LOCAL TAILOR</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#5a5a5a] mt-1">Estimasi Biaya Material — Dokumen Internal</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-[#5a5a5a]">Nomor Estimasi</p>
          <p className="text-sm font-medium">{nomorEstimasi}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#5a5a5a] mt-2">Tanggal</p>
          <p className="text-sm font-medium">{today}</p>
        </div>
      </div>

      <div className="mt-6 mb-8 grid grid-cols-3 gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#5a5a5a]">Nama Estimasi</p>
          <p className="text-xl font-serif mt-1">{estimateName || 'Tanpa nama'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#5a5a5a]">Produk</p>
          <p className="text-sm font-medium mt-1">{produk || '—'}</p>
        </div>
        {customer && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#5a5a5a]">Customer</p>
            <p className="text-sm font-medium mt-1">{customer}</p>
          </div>
        )}
      </div>

      <table className="w-full text-sm border-collapse mb-8">
        <thead>
          <tr className="border-b border-[#1b1b1c]">
            <th className="text-left font-bold uppercase text-[10px] tracking-widest py-2">Kategori</th>
            <th className="text-left font-bold uppercase text-[10px] tracking-widest py-2">Material</th>
            <th className="text-right font-bold uppercase text-[10px] tracking-widest py-2">Qty</th>
            <th className="text-left font-bold uppercase text-[10px] tracking-widest py-2 pl-2">Satuan</th>
            <th className="text-right font-bold uppercase text-[10px] tracking-widest py-2">Harga</th>
            <th className="text-right font-bold uppercase text-[10px] tracking-widest py-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {materialRows.map(row => (
            <tr key={row.id} className="border-b border-[#e5e5e5]">
              <td className="py-2 text-[#5a5a5a]">{row.categoryName}</td>
              <td className="py-2">{row.materialName}</td>
              <td className="py-2 text-right">{row.quantity.toLocaleString('id-ID')}</td>
              <td className="py-2 pl-2 text-[#5a5a5a]">{row.unit}</td>
              <td className="py-2 text-right">{rupiah(row.price)}</td>
              <td className="py-2 text-right font-medium">{rupiah(row.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} className="pt-3 text-right font-bold uppercase text-[10px] tracking-widest">Total Material</td>
            <td className="pt-3 text-right font-bold">{rupiah(totalMaterial)}</td>
          </tr>
        </tfoot>
      </table>

      {additionalCosts.length > 0 && (
        <table className="w-full text-sm border-collapse mb-8">
          <thead>
            <tr className="border-b border-[#1b1b1c]">
              <th className="text-left font-bold uppercase text-[10px] tracking-widest py-2">Nama Biaya</th>
              <th className="text-left font-bold uppercase text-[10px] tracking-widest py-2">Keterangan</th>
              <th className="text-right font-bold uppercase text-[10px] tracking-widest py-2">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {additionalCosts.map(cost => (
              <tr key={cost.id} className="border-b border-[#e5e5e5]">
                <td className="py-2">{cost.name}</td>
                <td className="py-2 text-[#5a5a5a]">{cost.notes}</td>
                <td className="py-2 text-right font-medium">{rupiah(cost.nominal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-3 text-right font-bold uppercase text-[10px] tracking-widest">Total Biaya Tambahan</td>
              <td className="pt-3 text-right font-bold">{rupiah(totalBiayaTambahan)}</td>
            </tr>
          </tfoot>
        </table>
      )}

      <div className="flex items-center justify-between py-5 px-6 bg-[#1b1b1c] text-white mb-8">
        <p className="text-xs uppercase tracking-[0.2em] font-bold">Grand Total</p>
        <p className="text-2xl font-serif">{rupiah(grandTotal)}</p>
      </div>

      <table className="w-full text-sm border-collapse mb-8">
        <tbody>
          <tr className="border-b border-[#e5e5e5]">
            <td className="py-2 font-bold uppercase text-[10px] tracking-widest text-[#5a5a5a]">Estimasi Harga Jual</td>
            <td className="py-2 text-right font-medium">{rupiah(hargaJual)}</td>
          </tr>
          <tr>
            <td className="py-2 font-bold uppercase text-[10px] tracking-widest text-[#5a5a5a]">Margin</td>
            <td className="py-2 text-right font-medium">{rupiah(marginRp)} ({marginPercent.toFixed(1)}%)</td>
          </tr>
        </tbody>
      </table>

      {catatan && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#5a5a5a] mb-1">Catatan</p>
          <p className="text-sm whitespace-pre-wrap">{catatan}</p>
        </div>
      )}
    </div>
  )
}
