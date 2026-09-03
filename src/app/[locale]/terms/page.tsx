import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/shell/Nav'
import { Footer } from '@/components/marketing/shell/Footer'

export const metadata: Metadata = {
  title: 'Ketentuan Layanan | Local Tailor',
  description: 'Ketentuan penggunaan website, WhatsApp, konsultasi, dan layanan Local Tailor.',
  alternates: { canonical: 'https://localtailor.id/terms' },
}

const sections = [
  {
    title: '1. Ruang lingkup layanan',
    body: 'Local Tailor menyediakan informasi produk, konsultasi, fitting, pemesanan, produksi pakaian custom, dukungan pelanggan, serta layanan digital melalui website dan WhatsApp.',
  },
  {
    title: '2. Informasi pesanan',
    body: 'Pelanggan bertanggung jawab memberikan informasi yang benar dan cukup untuk proses konsultasi, pengukuran, pembayaran, dan produksi. Detail akhir pesanan mengikuti konfirmasi yang disepakati antara pelanggan dan Local Tailor.',
  },
  {
    title: '3. Produk custom',
    body: 'Produk bespoke atau custom dibuat berdasarkan spesifikasi pelanggan. Perubahan model, bahan, ukuran, atau detail setelah produksi berjalan dapat memengaruhi waktu pengerjaan dan biaya, serta akan dikonfirmasi terlebih dahulu apabila relevan.',
  },
  {
    title: '4. Harga dan pembayaran',
    body: 'Harga, uang muka, pelunasan, biaya tambahan, dan metode pembayaran mengikuti penawaran atau konfirmasi resmi Local Tailor untuk pesanan terkait. Informasi harga di website dapat berubah sebelum pesanan dikonfirmasi.',
  },
  {
    title: '5. Komunikasi WhatsApp dan bantuan AI',
    body: 'Sebagian komunikasi dapat dibantu oleh sistem otomatis atau AI untuk mempercepat pelayanan. Informasi penting terkait harga, pembayaran, spesifikasi akhir, atau keputusan produksi tetap mengacu pada data dan konfirmasi resmi Local Tailor.',
  },
  {
    title: '6. Penggunaan yang diperbolehkan',
    body: 'Pengguna tidak boleh menggunakan website, WhatsApp, atau sistem Local Tailor untuk aktivitas ilegal, penyalahgunaan layanan, percobaan akses tanpa izin, pengiriman konten berbahaya, atau tindakan yang mengganggu keamanan dan operasional sistem.',
  },
  {
    title: '7. Perubahan layanan dan ketentuan',
    body: 'Local Tailor dapat memperbarui fitur, proses, harga, atau ketentuan layanan dari waktu ke waktu. Versi ketentuan terbaru akan tersedia pada halaman ini.',
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-luxury-navy-deep text-luxury-ivory">
      <Nav />
      <main className="px-6 py-20 md:px-10 md:py-28">
        <article className="mx-auto max-w-3xl">
          <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">Legal</p>
          <h1 className="mt-4 font-fraunces text-4xl sm:text-5xl">Ketentuan Layanan</h1>
          <p className="mt-5 font-luxury-sans text-sm text-luxury-taupe">Terakhir diperbarui: 3 September 2026</p>
          <p className="mt-8 font-luxury-sans leading-7 text-luxury-taupe">
            Dengan menggunakan website localtailor.id, WhatsApp Local Tailor, atau layanan kami, Anda menyetujui ketentuan berikut sejauh berlaku pada layanan yang digunakan.
          </p>
          <div className="mt-10 space-y-9">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-fraunces text-2xl">{section.title}</h2>
                <p className="mt-3 font-luxury-sans leading-7 text-luxury-taupe">{section.body}</p>
              </section>
            ))}
            <section>
              <h2 className="font-fraunces text-2xl">8. Kontak</h2>
              <p className="mt-3 font-luxury-sans leading-7 text-luxury-taupe">
                Pertanyaan mengenai layanan atau ketentuan ini dapat disampaikan melalui kanal resmi Local Tailor di localtailor.id/contact.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
