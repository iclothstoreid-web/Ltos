import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'

export interface ProblemSolutionRow {
  problem: string
  solution: string
}

interface ProblemSolutionTableProps {
  heading: string
  subheadline?: string
  rows: ProblemSolutionRow[]
}

// Sprint Y §Y-9 — reusable "Masalah -> Solusi Local Tailor" comparison
// table for the pillar page's "Keunggulan" section.
export function ProblemSolutionTable({ heading, subheadline, rows }: ProblemSolutionTableProps) {
  return (
    <section aria-labelledby="problem-solution-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <h2 id="problem-solution-heading" className="font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {heading}
          </h2>
          {subheadline && <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{subheadline}</p>}
        </Reveal>

        <Reveal delay={0.1} className="mt-12 overflow-x-auto rounded-2xl border border-luxury-gold/[0.14]">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b border-luxury-gold/20">
                <th scope="col" className="px-5 py-4 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
                  Masalah
                </th>
                <th scope="col" className="px-5 py-4 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
                  Solusi Local Tailor
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.problem} className={i < rows.length - 1 ? 'border-b border-luxury-gold/[0.08]' : ''}>
                  <td className="px-5 py-4 font-luxury-sans text-sm text-luxury-taupe">{row.problem}</td>
                  <td className="px-5 py-4 font-fraunces text-base text-luxury-ivory">{row.solution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  )
}
