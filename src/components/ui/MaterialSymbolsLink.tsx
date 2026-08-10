// Material Symbols Outlined has no next/font/google entry (icon fonts
// aren't in that catalog), so a manual stylesheet <link> is unavoidable.
// Single source for that href — every layout that renders
// material-symbols-outlined icons (Production, Order Created, Consultation
// Review, Design Studio, Measurement, Check-In, Master Data) imports this
// instead of duplicating the same <link> inline. Deliberately NOT hoisted
// to the root layout: several routes (Command Center, Inventory, Business
// Rules, Login, etc.) never render this icon font, and loading it there
// would add a render-blocking request with nothing to show for it.
export function MaterialSymbolsLink() {
  return (
    // eslint-disable-next-line @next/next/no-page-custom-font
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
    />
  )
}
