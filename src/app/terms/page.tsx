import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ketentuan Layanan | Local Tailor',
  description: 'Ketentuan penggunaan layanan Local Tailor dan LTOS.',
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] px-5 py-12 text-[#2f2925] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white p-7 shadow-sm sm:p-10">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-[#8a684e]">Local Tailor</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ketentuan Layanan</h1>
        <p className="mt-3 text-sm text-black/60">Terakhir diperbarui: 3 September 2026</p>

        <div className="mt-8 space-y-7 text-[15px] leading-7 text-black/75">
          <section>
            <h2 className="text-lg font-semibold text-black/90">1. Ruang lingkup</h2>
            <p className="mt-2">Ketentuan ini berlaku untuk penggunaan situs localtailor.id, layanan konsultasi dan pemesanan Local Tailor, komunikasi melalui WhatsApp, serta fitur digital yang terhubung dengan LTOS.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">2. Informasi produk dan pemesanan</h2>
            <p className="mt-2">Harga, bahan, model, estimasi waktu, opsi fitting, dan detail pesanan mengikuti informasi yang dikonfirmasi kepada pelanggan pada saat transaksi. Pesanan custom diproses berdasarkan spesifikasi yang telah disepakati bersama.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">3. AI Sales dan komunikasi otomatis</h2>
            <p className="mt-2">Local Tailor dapat menggunakan AI Sales untuk membantu menjawab pertanyaan, memahami kebutuhan, memberikan rekomendasi berdasarkan data resmi Local Tailor, mencatat prospek, serta membantu menyiapkan pesanan. Untuk keputusan yang memerlukan verifikasi manusia, percakapan dapat dialihkan ke tim Local Tailor.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">4. Kewajiban pengguna</h2>
            <p className="mt-2">Pengguna wajib memberikan informasi yang akurat dan tidak menggunakan layanan untuk tujuan yang melanggar hukum, mengganggu sistem, menyalahgunakan akun, atau merugikan Local Tailor maupun pihak lain.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">5. Pembayaran dan pelaksanaan layanan</h2>
            <p className="mt-2">Pembayaran, uang muka, pelunasan, dan jadwal pengerjaan mengikuti kesepakatan pada pesanan masing-masing. Produksi dapat dimulai setelah persyaratan pembayaran dan data pesanan yang diperlukan telah terpenuhi.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">6. Ketersediaan layanan</h2>
            <p className="mt-2">Kami berupaya menjaga layanan digital tetap tersedia, namun akses dapat dihentikan sementara untuk pemeliharaan, keamanan, gangguan pihak ketiga, atau keadaan lain di luar kendali yang wajar.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">7. Privasi</h2>
            <p className="mt-2">Pemrosesan data pribadi mengikuti Kebijakan Privasi Local Tailor yang tersedia di localtailor.id/privacy-policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">8. Perubahan ketentuan</h2>
            <p className="mt-2">Ketentuan ini dapat diperbarui bila diperlukan untuk menyesuaikan layanan, teknologi, atau ketentuan hukum. Versi terbaru akan ditampilkan pada halaman ini.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">9. Kontak</h2>
            <p className="mt-2">Pertanyaan mengenai ketentuan layanan dapat disampaikan melalui WhatsApp resmi Local Tailor +62 821-3000-325 atau kanal kontak di localtailor.id.</p>
          </section>
        </div>
      </article>
    </main>
  )
}
