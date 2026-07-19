// MasterDataManager (shared by Owner OS & Fitter) uses material-symbols-outlined
// icons throughout, but unlike every /workspace/* route this route had no
// layout loading that font — icons rendered as raw ligature text
// (e.g. "radio_button_checked") instead of glyphs. Same fix, same pattern,
// as workspace/check-in/layout.tsx etc.
export default function MasterDataLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      {children}
    </>
  )
}
