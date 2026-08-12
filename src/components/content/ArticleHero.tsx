interface ArticleHeroProps {
  eyebrow: string
  title: string
  dek: string
}

export function ArticleHero({ eyebrow, title, dek }: ArticleHeroProps) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">{eyebrow}</p>
      <h1 className="mt-4 font-fraunces text-4xl leading-[1.1] text-luxury-ivory sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-6 max-w-xl font-luxury-sans text-base text-luxury-taupe md:text-lg">{dek}</p>
    </header>
  )
}
