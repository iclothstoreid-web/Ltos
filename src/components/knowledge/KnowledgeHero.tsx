interface KnowledgeHeroProps {
  eyebrow: string
  title: string
  dek: string
  variant?: 'landing' | 'hub' | 'article'
}

// One hero for all 3 page depths — landing gets the largest treatment,
// hub/article scale down. Matches ArticleHero's token vocabulary
// (font-fraunces headline, font-luxury-sans dek, luxury-gold eyebrow) so a
// /knowledge page reads as the same site as the homepage and W0.5 guides.
export function KnowledgeHero({ eyebrow, title, dek, variant = 'article' }: KnowledgeHeroProps) {
  const isLanding = variant === 'landing'
  return (
    <header className={`mx-auto max-w-3xl text-center ${isLanding ? 'max-w-4xl' : ''}`}>
      <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">{eyebrow}</p>
      <h1
        className={
          isLanding
            ? 'mt-4 font-fraunces text-4xl leading-[1.1] text-luxury-ivory sm:text-5xl md:text-6xl'
            : 'mt-4 font-fraunces text-4xl leading-[1.1] text-luxury-ivory sm:text-5xl'
        }
      >
        {title}
      </h1>
      <p className="mx-auto mt-6 max-w-xl font-luxury-sans text-base text-luxury-taupe md:text-lg">{dek}</p>
    </header>
  )
}
