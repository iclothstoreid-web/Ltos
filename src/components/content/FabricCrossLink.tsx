import Link from 'next/link'

// Sprint W0.5 §"Internal Linking" — the one deliberate content-cluster ->
// Fabric Explorer link, used only on articles where fabric choice is
// actually discussed in the copy (not bolted onto all 4 for the sake of a
// link count).
export function FabricCrossLink() {
  return (
    <p className="mx-auto mt-14 max-w-3xl text-center font-luxury-sans text-sm text-luxury-taupe">
      Ingin melihat pilihan kain untuk thobe Anda?{' '}
      <Link href="/fabric" className="text-luxury-gold underline-offset-4 hover:underline">
        Jelajahi Fabric Explorer kami
      </Link>
      .
    </p>
  )
}
