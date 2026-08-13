interface ComparisonTableProps {
  caption: string
  headers: string[]
  rows: string[][]
  headingId: string
}

// Sprint W6-8 — dedicated "Perbandingan" section, visually distinct from a
// plain table block inside an article's regular sections (wrapped in its
// own bordered card with a caption), so a comparison reads as a citable
// unit — the exact table shape AI Overview / featured-snippet extraction
// favors.
export function ComparisonTable({ caption, headers, rows, headingId }: ComparisonTableProps) {
  return (
    <section aria-labelledby={headingId} className="mx-auto mt-12 max-w-3xl">
      <h2 id={headingId} className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
        Perbandingan
      </h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-luxury-gold/[0.14]">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <caption className="px-4 pt-4 text-left font-luxury-sans text-xs text-luxury-taupe">{caption}</caption>
          <thead>
            <tr className="border-b border-luxury-gold/20">
              {headers.map((header) => (
                <th key={header} scope="col" className="px-4 py-3 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-luxury-gold/[0.08] last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={
                      cellIndex === 0 ? 'px-4 py-3 font-fraunces text-base text-luxury-ivory' : 'px-4 py-3 font-luxury-sans text-sm text-luxury-taupe'
                    }
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
