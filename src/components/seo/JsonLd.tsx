import type { JsonLdSchema } from '@/lib/seo/schema'

type JsonLdData = JsonLdSchema | null | undefined

interface JsonLdProps {
  data: JsonLdData | JsonLdData[]
}

// Sprint W7-1 — reusable JSON-LD renderer. Accepts one schema object, an
// array of them (rendered as one <script> tag each — Google accepts either
// one script per graph or multiple scripts per page), or null/undefined
// (renders nothing — lets callers pass a builder's result straight through
// without an extra guard, matching how the existing knowledge/article pages
// already conditionally render optional schema like FAQPage/HowTo).
export function JsonLd({ data }: JsonLdProps) {
  const rawItems = Array.isArray(data) ? data : [data]
  const items = rawItems.filter((item): item is JsonLdSchema => item != null)
  if (items.length === 0) return null

  return (
    <>
      {items.map((item, index) => (
        // eslint-disable-next-line react/no-danger
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
      ))}
    </>
  )
}
