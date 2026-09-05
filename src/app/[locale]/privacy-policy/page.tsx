import type { Metadata } from 'next'
import { Nav } from '@/components/marketing/shell/Nav'
import { Footer } from '@/components/marketing/shell/Footer'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Local Tailor',
  description: 'Kebijakan Privasi Local Tailor untuk website, WhatsApp, konsultasi, dan layanan digital.',
  alternates: { canonical: 'https://localtailor.id/privacy-policy' },
}

const sections = [
  {
    title: '1. Informasi yang kami proses',
    body: 'Saat Anda menghubungi Local Tailor melalui website, WhatsApp, atau layanan konsultasi, kami dapat memproses informasi yang Anda berikan seperti nama, nomor telepon, isi percakapan, pilihan produk, model, bahan, warna, ukuran atau informasi pesanan, serta informasi teknis dasar yang diperlukan untuk menjalankan layanan.',
  },
  {
    title: '2. Tujuan penggunaan informasi',
    body: 'Informasi digunakan untuk menjawab pertanyaan, memberikan konsultasi dan rekomendasi, menyiapkan penawaran atau pesanan, menjalankan proses fitting dan produksi, memberikan pembaruan layanan, menjaga keamanan sistem, serta meningkatkan kualitas pelayanan Local Tailor.',
  },
  {
    title: '3. WhatsApp dan bantuan AI',
    body: 'Local Tailor dapat menggunakan WhatsApp Business Platform dan sistem bantuan AI untuk membantu memproses pesan masuk dan menyiapkan respons layanan pelanggan. Sistem ini digunakan sebagai bagian dari operasional Local Tailor dan tidak mengubah kepemilikan Anda atas informasi yang Anda kirimkan.',
  },
  {
    title: '4. Penyedia layanan',
    body: 'Kami dapat menggunakan penyedia teknologi yang diperlukan untuk menjalankan layanan, seperti Meta/WhatsApp, penyedia hosting, database, analitik, dan infrastruktur aplikasi. Informasi hanya diproses sejauh diperlukan untuk menyediakan fungsi tersebut dan tunduk pada ketentuan masing-masing penyedia.',
  },
  {
    title: '5. Penyimpanan dan keamanan',
    body: 'Kami menyimpan informasi selama diperlukan untuk pelayanan, transaksi, pencatatan operasional, penyelesaian sengketa, keamanan, dan kewajiban hukum yang berlaku. Kami menerapkan langkah teknis dan operasional yang wajar untuk melindungi informasi dari akses atau penggunaan yang tidak sah.',
  },
  {
    title: '6. Hak dan penghapusan data',
    body: 'Anda dapat meminta akses, koreksi, atau penghapusan informasi pribadi yang berada dalam kendali Local Tailor. Petunjuk penghapusan tersedia pada halaman Penghapusan Data Pengguna.',
  },
  {
    title: '7. Perubahan kebijakan',
    body: 'Kebijakan ini dapat diperbarui ketika layanan atau ketentuan hukum berubah. Versi terbaru akan selalu tersedia pada halaman ini.',
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-luxury-navy-deep text-luxury-ivory">
      <Nav />
      <main className="px-6 py-20 md:px-10 md:py-28">
        <article className="mx-auto max-w-3xl">
          <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">Legal</p>
          <h1 className="mt-4 font-fraunces text-4xl sm:text-5xl">Kebijakan Privasi</h1>
          <p className="mt-5 font-luxury-sans text-sm text-luxury-taupe">Terakhir diperbarui: 3 September 2026</p>
          <p className="mt-8 font-luxury-sans leading-7 text-luxury-taupe">
            Kebijakan ini menjelaskan bagaimana Local Tailor mengelola informasi ketika Anda menggunakan website localtailor.id, WhatsApp Local Tailor, dan layanan konsultasi atau pemesanan kami.
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
                Untuk pertanyaan mengenai privasi atau data Anda, hubungi Local Tailor melalui kanal kontak resmi yang tercantum di localtailor.id/contact.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
