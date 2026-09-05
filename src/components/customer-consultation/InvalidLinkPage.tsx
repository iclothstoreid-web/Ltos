// Shown for an unknown token, a token belonging to a disabled link, or any
// other case get_customer_consultation_snapshot returns no row for — those
// three cases are deliberately indistinguishable from here (see the RPC's
// own doc comment), so this never reveals which one it was.
export function InvalidLinkPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FDFCF8] px-6 font-sans">
      <div className="max-w-sm text-center space-y-3">
        <h1 className="font-serif text-2xl text-[#151c27]">Link tidak ditemukan</h1>
        <p className="text-sm text-[#444748] leading-relaxed">
          Link ini tidak valid atau sudah tidak berlaku. Silakan hubungi kembali tim Local Tailor untuk mendapatkan
          link terbaru.
        </p>
      </div>
    </main>
  )
}
