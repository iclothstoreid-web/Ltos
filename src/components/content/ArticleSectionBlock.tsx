interface ArticleSectionBlockProps {
  headingId: string
  heading: string
  paragraphs: string[]
}

export function ArticleSectionBlock({ headingId, heading, paragraphs }: ArticleSectionBlockProps) {
  return (
    <section aria-labelledby={headingId} className="mx-auto mt-12 max-w-3xl">
      <h2 id={headingId} className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
        {heading}
      </h2>
      <div className="mt-4 space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="font-luxury-sans text-base leading-relaxed text-luxury-taupe">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}
