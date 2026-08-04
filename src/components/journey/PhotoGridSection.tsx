import { JourneyPhoto } from './JourneyPhoto'
import { SectionShell } from './SectionShell'
import { SectionEyebrow } from './SectionEyebrow'

interface PhotoGridSectionProps {
  title: string
  photos: { src: string; alt: string }[]
}

// 2-column close-up photo gallery shared by every milestone that needs one
// (Craftsmanship in Milestone 2, Galeri Detail in Milestone 3) — only the
// heading and photo set differ.
//
// Sprint UX-03.1 (Photo Display Consistency) — portrait aspect-[3/4] instead
// of aspect-square (was cropping full-body/reference photos down to their
// center square), plus tap-to-fullscreen so a customer can see the whole
// photo uncropped. Presentation only — photos/src/data unchanged.
export function PhotoGridSection({ title, photos }: PhotoGridSectionProps) {
  return (
    <SectionShell>
      <SectionEyebrow>{title}</SectionEyebrow>
      <div className="grid grid-cols-2 gap-3">
        {photos.map(photo => (
          <JourneyPhoto
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            className="w-full aspect-[3/4]"
            expandable
          />
        ))}
      </div>
    </SectionShell>
  )
}
