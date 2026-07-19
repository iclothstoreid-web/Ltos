import { JourneyPhoto } from './JourneyPhoto'
import { SectionShell } from './SectionShell'

interface ProfileCardStat {
  label: string
  value: string
}

interface ProfileCardProps {
  photoSrc?: string | null
  photoAlt: string
  name: string
  role: string
  bio: string
  stats: ProfileCardStat[]
}

// Generic photo + name + role + stat-row + bio profile card — deliberately
// free of any artisan-specific naming so it can be reused as-is (e.g. a
// future Customer Passport module) for any other person the Journey needs
// to introduce, not just Milestone 4's finishing artisan.
export function ProfileCard({ photoSrc, photoAlt, name, role, bio, stats }: ProfileCardProps) {
  return (
    <SectionShell>
      <div className="flex flex-col items-center text-center">
        <JourneyPhoto src={photoSrc} alt={photoAlt} className="w-24 h-24 rounded-full" />
        <h3 className="font-fraunces text-xl text-on-surface mt-4">{name}</h3>
        <p className="font-sans text-xs uppercase tracking-widest text-secondary mt-1">{role}</p>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-6">
          {stats.map(stat => (
            <div key={stat.label}>
              <p className="font-fraunces text-lg text-on-surface">{stat.value}</p>
              <p className="font-sans text-[10px] uppercase tracking-widest text-secondary/70">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="font-sans text-body text-secondary leading-relaxed mt-6 max-w-md">{bio}</p>
      </div>
    </SectionShell>
  )
}
