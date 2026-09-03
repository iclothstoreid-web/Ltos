import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/shell/Nav'
import { Footer } from '@/components/marketing/shell/Footer'

export const metadata: Metadata = {
  title: 'Penghapusan Data Pengguna | Local Tailor',
  description: 'Petunjuk untuk meminta penghapusan data pribadi yang berada dalam kendali Local Tailor.',
  alternates: { canonical: 'https://localtailor.id/data-deletion' },
}

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-luxury-navy-deep text-luxury-ivory">
      <Nav />
      <main className="px-6 py-20 md:px-10 md:py-28">
        <article className="mx-auto max-w-3xl">
          <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">Legal</p>
          <h1 className="mt-4 font-fraunces text-4xl sm:text-5xl">Penghapusan Data Pengguna</h1>
          <p className="mt-5 font-luxury-sans text-sm text-luxury-taupe">Terakhir diperbarui: 3 September 2026</p>

          <div className="mt-10 space-y-9 font-luxury-sans leading-7 text-luxury-taupe">
            <section>
              <h2 className="font-fraunces text-2xl text-luxury-ivory">Cara mengajukan permintaan</h2>
              <p className="mt-3">
                Untuk meminta penghapusan data pribadi yang berada dalam kendali Local Tailor, hubungi kami melalui kanal kontak resmi di localtailor.id/contact atau melalui WhatsApp resmi Local Tailor. Sampaikan bahwa Anda meminta penghapusan data dan cantumkan nomor WhatsApp atau identitas kontak yang digunakan saat berinteraksi dengan kami.
              </p>
            </section>

            <section>
              <h2 className="font-fraunces text-2xl text-luxury-ivory">Verifikasi</h2>
              <p className="mt-3">
                Kami dapat meminta verifikasi yang wajar untuk memastikan permintaan berasal dari pemilik data yang benar. Jangan mengirim kata sandi, PIN, OTP, atau informasi rahasia lain untuk proses verifikasi.
              </p>
            </section>

            <section>
              <h2 className="font-fraunces text-2xl text-luxury-ivory">Data yang dapat dihapus</h2>
              <p className="mt-3">
                Setelah permintaan terverifikasi, kami akan menghapus atau menganonimkan data pribadi yang tidak lagi diperlukan untuk menyediakan layanan, menjaga keamanan, menyelesaikan transaksi, memenuhi kewajiban hukum, atau menangani sengketa yang masih berjalan.
              </p>
            </section>

            <section>
              <h2 className="font-fraunces text-2xl text-luxury-ivory">Data pada penyedia pihak ketiga</h2>
              <p className="mt-3">
                Sebagian informasi dapat diproses oleh penyedia teknologi seperti Meta/WhatsApp sesuai fungsi layanan mereka. Permintaan kepada Local Tailor berlaku untuk data yang berada dalam kendali Local Tailor; untuk data yang dikendalikan langsung oleh penyedia lain, ketentuan dan mekanisme penyedia tersebut dapat berlaku.
              </p>
            </section>

            <section>
              <h2 className="font-fraunces text-2xl text-luxury-ivory">Konfirmasi</h2>
              <p className="mt-3">
                Kami akan memberikan konfirmasi melalui kanal komunikasi yang tersedia setelah permintaan selesai diproses atau apabila diperlukan informasi tambahan.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
