import type { SizeChartRow } from '@/lib/content/articles'

interface SizeChartTableProps {
  rows: SizeChartRow[]
}

export function SizeChartTable({ rows }: SizeChartTableProps) {
  return (
    <div className="mx-auto mt-6 max-w-3xl overflow-x-auto rounded-2xl border border-luxury-gold/[0.14]">
      <table className="w-full min-w-[480px] border-collapse text-left">
        <thead>
          <tr className="border-b border-luxury-gold/20">
            <th scope="col" className="px-4 py-3 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
              Size
            </th>
            <th scope="col" className="px-4 py-3 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
              Berat Badan
            </th>
            <th scope="col" className="px-4 py-3 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
              Lingkar Dada
            </th>
            <th scope="col" className="px-4 py-3 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
              Lebar Bahu
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.size} className="border-b border-luxury-gold/[0.08] last:border-b-0">
              <td className="px-4 py-3 font-fraunces text-lg text-luxury-ivory">{row.size}</td>
              <td className="px-4 py-3 font-luxury-sans text-sm text-luxury-taupe">{row.weight}</td>
              <td className="px-4 py-3 font-luxury-sans text-sm text-luxury-taupe">{row.chest}</td>
              <td className="px-4 py-3 font-luxury-sans text-sm text-luxury-taupe">{row.shoulder}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
