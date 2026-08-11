interface FabricVideoSectionProps {
  videoUrl: string | null
  materialName: string
}

function toEmbedUrl(url: string): { type: 'iframe' | 'video'; src: string } | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtube.com' || host === 'youtu.be') {
      const videoId = host === 'youtu.be' ? parsed.pathname.slice(1) : parsed.searchParams.get('v')
      if (!videoId) return null
      return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${videoId}` }
    }
    if (host === 'vimeo.com') {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0]
      if (!videoId) return null
      return { type: 'iframe', src: `https://player.vimeo.com/video/${videoId}` }
    }
    return { type: 'video', src: url }
  } catch {
    return null
  }
}

// §8 — no client JS needed for lazy loading: native <iframe loading="lazy">
// and <video preload="none"> both defer their network request until the
// element is near the viewport / the user presses play, without an
// IntersectionObserver. Renders nothing at all when video_url is absent or
// unparseable — the brief's "fallback jika video tidak tersedia" is simply
// not showing a broken/empty player.
export function FabricVideoSection({ videoUrl, materialName }: FabricVideoSectionProps) {
  if (!videoUrl) return null
  const embed = toEmbedUrl(videoUrl)
  if (!embed) return null

  return (
    <section aria-labelledby="fabric-video-heading">
      <h2 id="fabric-video-heading" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
        Fabric in Motion
      </h2>
      <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-luxury-gold/10 bg-luxury-navy-deep">
        {embed.type === 'iframe' ? (
          <iframe
            src={embed.src}
            title={`${materialName} fabric video`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <video src={embed.src} controls preload="none" className="h-full w-full" aria-label={`${materialName} fabric video`}>
            <track kind="captions" />
          </video>
        )}
      </div>
    </section>
  )
}
