// Sprint W5-4 — Quality Control. A small stroked check-in-circle, same
// hand-authored SVG-atom family as GoldAccentLine — used only where content
// is literally a verification/inspection item (QC checklist), so it stays
// a meaningful signal rather than replacing the plain gold-dash bullet used
// everywhere else on the homepage.
export function GoldCheckMark({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-5 w-5 flex-shrink-0 ${className}`} fill="none">
      <circle cx="10" cy="10" r="9" stroke="#C8A24A" strokeWidth="1" opacity="0.5" />
      <path d="M6 10.2l2.5 2.5L14 7" stroke="#C8A24A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
