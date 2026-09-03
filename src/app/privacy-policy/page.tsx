import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Local Tailor',
  description: 'Kebijakan Privasi Local Tailor dan layanan digital LTOS.',
  robots: { index: true, follow: true },
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] px-5 py-12 text-[#2f2925] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white p-7 shadow-sm sm:p-10">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-[#8a684e]">Local Tailor</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Kebijakan Privasi</h1>
        <p className="mt-3 text-sm text-black/60">Terakhir diperbarui: 3 September 2026</p>

        <div className="mt-8 space-y-7 text-[15px] leading-7 text-black/75">
          <section>
            <h2 className="text-lg font-semibold text-black/90">1. Informasi yang kami proses</h2>
            <p className="mt-2">Kami dapat memproses informasi yang Anda berikan saat menghubungi Local Tailor, melakukan konsultasi, pemesanan, fitting, pembayaran, atau menggunakan layanan digital kami. Informasi tersebut dapat mencakup nama, nomor telepon, isi percakapan, detail pesanan, ukuran, preferensi desain, alamat atau lokasi layanan, serta informasi lain yang Anda berikan secara sukarela.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">2. WhatsApp dan AI Sales</h2>
            <p className="mt-2">Untuk membantu layanan pelanggan dan penjualan, pesan WhatsApp yang dikirim ke akun resmi Local Tailor dapat diproses oleh sistem LTOS dan fitur AI Sales. Sistem ini digunakan untuk memahami kebutuhan, memberikan informasi produk atau layanan, mencatat prospek dan pesanan, serta mengalihkan percakapan kepada tim manusia bila diperlukan.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">3. Tujuan penggunaan data</h2>
            <p className="mt-2">Data digunakan untuk memberikan dan meningkatkan layanan, mengelola konsultasi dan pesanan, melakukan fitting dan produksi, memberikan dukungan, menjaga keamanan sistem, melakukan analisis operasional, serta memenuhi kewajiban hukum yang berlaku.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">4. Penyimpanan dan keamanan</h2>
            <p className="mt-2">Kami menerapkan langkah teknis dan organisasi yang wajar untuk melindungi data dari akses, perubahan, pengungkapan, atau kehilangan yang tidak sah. Data disimpan selama masih diperlukan untuk tujuan layanan, operasional, akuntansi, keamanan, atau kewajiban hukum.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">5. Penyedia layanan</h2>
            <p className="mt-2">Dalam menjalankan layanan, kami dapat menggunakan penyedia teknologi seperti layanan hosting, database, analitik, pembayaran, Meta/WhatsApp Business Platform, dan penyedia AI. Akses mereka dibatasi sesuai fungsi yang diperlukan untuk menyediakan layanan kepada Local Tailor.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">6. Hak dan permintaan pengguna</h2>
            <p className="mt-2">Anda dapat meminta informasi, koreksi, atau penghapusan data pribadi yang berada dalam kendali kami, sepanjang tidak bertentangan dengan kewajiban hukum atau kebutuhan pencatatan yang sah. Prosedur penghapusan tersedia di halaman Penghapusan Data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black/90">7. Kontak</h2>
            <p className="mt-2">Untuk pertanyaan mengenai privasi atau data pribadi, hubungi Local Tailor melalui WhatsApp resmi +62 821-3000-325 atau melalui kanal kontak yang tersedia di localtailor.id.</p>
          </section>
        </div>
      </article>
    </main>
  )
}
