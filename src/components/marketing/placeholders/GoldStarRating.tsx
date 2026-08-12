// Sprint W5-8 — Reviews & Testimonial System. Same hand-authored SVG-atom
// family as GoldCheckMark/GoldAccentLine. The rating is exposed as a single
// aria-label on the group (role="img"), not per-star, since individual
// stars carry no independent meaning — a screen reader announcing "star,
// star, star, star, star, empty star" five times over would be noise, not
// signal.
export function GoldStarRating({ rating, className = '' }: { rating: number; className?: string }) {
  return (
    <div role="img" aria-label={`Rated ${rating} out of 5 stars`} className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill={i < rating ? '#C8A24A' : 'none'}
          stroke="#C8A24A"
          strokeWidth="1"
        >
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  )
}
