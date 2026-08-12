interface BodySnapshotCardProps {
  height: number
  weight: number
  bmi: number
  bodyProfile: string
}

// Sprint W0.3 — Height/Weight/BMI/Body Profile, read straight off the
// W0.2 engine's input+result (no new computation here).
export function BodySnapshotCard({ height, weight, bmi, bodyProfile }: BodySnapshotCardProps) {
  const stats = [
    { label: 'Height', value: `${height} cm` },
    { label: 'Weight', value: `${weight} kg` },
    { label: 'BMI', value: `${bmi}` },
    { label: 'Body Profile', value: bodyProfile },
  ]

  return (
    <div className="animate-fade-in rounded-2xl border border-luxury-gold/[0.14] bg-luxury-charcoal/20 p-6 transition-transform duration-300 ease-out hover:-translate-y-0.5">
      <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">Body Snapshot</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-taupe/80">{stat.label}</p>
            <p className="mt-1 font-fraunces text-lg capitalize text-luxury-ivory">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
