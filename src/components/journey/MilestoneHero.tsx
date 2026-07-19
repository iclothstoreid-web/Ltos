import { JourneyPhoto } from './JourneyPhoto'

interface MilestoneHeroProps {
  imageSrc: string
  imageAlt: string
  title: string
  subtitle: string
  eyebrow?: string
  variant?: 'stacked' | 'overlay'
}

// Photo hero shared by every milestone's body content (Milestone 2 onward).
// 'stacked' (default) is the original photo-then-text-below composition,
// unchanged for Milestone 2 and 5. 'overlay' is a Final-Refinement addition
// used only by Milestone 3 and 4 (per the Google Stitch visual reference) —
// same photo/eyebrow/title/subtitle content, composed as a full-bleed image
// with the text overlaid at the bottom on a gradient instead of stacked
// below it. Purely a layout/typography alignment, not a new interaction.
export function MilestoneHero({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  eyebrow,
  variant = 'stacked',
}: MilestoneHeroProps) {
  if (variant === 'overlay') {
    return (
      <section className="relative w-full aspect-[4/5] sm:aspect-[16/10] overflow-hidden">
        <JourneyPhoto src={imageSrc} alt={imageAlt} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF8] via-transparent to-transparent" />
        <div className="absolute inset-x-6 bottom-8 sm:inset-x-10 sm:bottom-10">
          {eyebrow && (
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary mb-3">{eyebrow}</p>
          )}
          <h1 className="font-fraunces text-2xl text-on-surface mb-2 leading-tight">{title}</h1>
          <p className="font-sans text-body text-secondary max-w-sm">{subtitle}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-2xl mx-auto px-6 pt-8">
      <JourneyPhoto src={imageSrc} alt={imageAlt} className="w-full aspect-[4/5] sm:aspect-[16/10]" />
      <div className="text-center py-8">
        <h1 className="font-fraunces text-2xl text-on-surface mb-2">{title}</h1>
        <p className="font-sans text-body text-secondary">{subtitle}</p>
      </div>
    </section>
  )
}
