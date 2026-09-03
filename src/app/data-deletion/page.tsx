import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Penghapusan Data | Local Tailor',
  description: 'Petunjuk permintaan penghapusan data pada Local Tailor dan LTOS.',
  robots: { index: true, follow: true },
}

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] px-5 py-12 text-[#2f2925] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white p-7 shadow-sm sm:p-10">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-[#8a684e]">Local Tailor</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Penghapusan Data</h1>
        <p className="mt-3 text-sm text-black/60">Terakhir diperbarui: 3 September 2026</p>

        <div className="mt-8 space-y-7 text-[15px] leading-7 text-black/75">
          <section>
            <h2 className="text-lg font-semibold text-black/90">Cara mengajukan permintaan</h2>
            <p className="mt-2">Anda dapat meminta penghapusan data pribadi yang berada dalam kendali Local Tailor dengan menghubungi WhatsApp resmi +62 821-3000-325. Cantumkan bahwa Anda mengajukan “Permintaan Penghapusan Data”, nama yang digunakan saat berinteraksi dengan Local Tailor, dan nomor telepon yang terkait dengan data tersebut.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">Verifikasi identitas</h2>
            <p className="mt-2">Untuk mencegah penghapusan data oleh pihak yang tidak berwenang, kami dapat meminta informasi tambahan yang wajar untuk memverifikasi bahwa pemohon berhak atas data tersebut. Jangan mengirimkan kata sandi, PIN, OTP, atau informasi autentikasi rahasia lainnya.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">Data yang dapat dihapus</h2>
            <p className="mt-2">Setelah permintaan terverifikasi, kami akan menghapus atau menganonimkan data pribadi yang tidak lagi diperlukan, termasuk data prospek atau percakapan yang berada dalam cakupan permintaan, sepanjang penghapusan tersebut tidak bertentangan dengan kewajiban hukum, akuntansi, keamanan, penyelesaian transaksi, atau pencatatan bisnis yang sah.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">Data dari Meta atau WhatsApp</h2>
            <p className="mt-2">Jika data Anda diproses melalui WhatsApp Business Platform dalam hubungan dengan Local Tailor, permintaan penghapusan terhadap data yang disimpan oleh sistem Local Tailor dapat diajukan melalui prosedur di atas. Data yang dikendalikan secara mandiri oleh Meta atau WhatsApp tunduk pada kebijakan dan mekanisme mereka sendiri.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">Konfirmasi</h2>
            <p className="mt-2">Kami akan memberikan konfirmasi melalui kanal kontak yang digunakan setelah permintaan diterima dan diproses, atau menjelaskan apabila sebagian data harus tetap disimpan karena kewajiban yang berlaku.</p>
          </section>
        </div>
      </article>
    </main>
  )
}
