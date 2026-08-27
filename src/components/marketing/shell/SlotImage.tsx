import Image from 'next/image'

export interface SlotOverride {
  url: string
  alt: string
}

interface SlotImageProps {
  /** Owner-managed override from homepage_media_slots, or null. */
  override: SlotOverride | null
  /** The section's built-in asset used when no override is set. */
  fallbackSrc: string
  fallbackAlt: string
  sizes: string
  className?: string
}

// Homepage section image that an Owner can swap via Owner OS -> Content ->
// Homepage Content. When a slot is set we render the override as a plain
// <img> (the URL is already a Supabase transform URL — routing it back
// through next/image would double-optimize); otherwise the section keeps
// its existing next/image behaviour exactly. A slot is never required, so a
// section can never end up blank.
export function SlotImage({ override, fallbackSrc, fallbackAlt, sizes, className }: SlotImageProps) {
  if (override) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={override.url}
        alt={override.alt || fallbackAlt}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full ${className ?? 'object-cover'}`}
      />
    )
  }
  return <Image src={fallbackSrc} alt={fallbackAlt} fill sizes={sizes} className={className ?? 'object-cover'} />
}
