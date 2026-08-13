import type { KnowledgeArticle } from '../types'

// Sprint W6-10 — Local Authority Layer. 4 articles under the 'bandung'
// category (the hub itself, /knowledge/bandung, is auto-rendered by the
// existing [category]/page.tsx). Every claim here is either already
// established elsewhere in this codebase (Bandung location, the real
// consultation -> measurement -> pattern -> production -> fitting ->
// delivery process documented across the other 8 clusters) or phrased as
// a general service description — no fabricated address, founding year,
// customer count, review quote, or award. "JANGAN membuat klaim palsu"
// taken literally: if it can't be traced to something real in this
// codebase, it isn't in here.
export const BANDUNG_ARTICLES: KnowledgeArticle[] = [
  {
    slug: 'custom-thobe',
    category: 'bandung',
    eyebrow: 'Local Tailor Bandung',
    title: 'Custom Thobe di Bandung — Layanan Bespoke Local Tailor',
    navLabel: 'Custom Thobe Bandung',
    metaDescription: 'Layanan custom thobe bespoke di Bandung — konsultasi, pengukuran presisi, dan produksi thobe yang dijahit khusus sesuai kebutuhan Anda.',
    dek: 'Thobe custom yang dijahit khusus untuk Anda, dari konsultasi hingga produksi, berbasis di Bandung.',
    definition:
      'Custom thobe di Bandung dari Local Tailor adalah layanan bespoke — thobe dijahit berdasarkan pola yang dibentuk khusus dari pengukuran badan Anda sendiri, bukan pola standar generik.',
    quickAnswer:
      'Local Tailor menyediakan layanan custom thobe di Bandung melalui proses bespoke penuh: konsultasi, pengukuran langsung oleh fitter, pembentukan pola personal, hingga produksi dan fitting akhir.',
    keyTakeaways: [
      'Layanan berbasis proses bespoke — pola dibentuk khusus dari pengukuran Anda',
      'Konsultasi awal membahas kebutuhan, gaya, dan pilihan bahan',
      'Pengukuran dilakukan langsung oleh fitter untuk Digital Body Profile yang akurat',
      'Thobe yang selesai dapat dikirimkan sesuai kesepakatan saat konsultasi',
    ],
    sections: [
      {
        heading: 'Proses Custom Thobe di Local Tailor',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Konsultasi dan Pemilihan Bahan',
            block: {
              kind: 'paragraphs',
              items: [
                'Setiap pesanan dimulai dengan sesi konsultasi untuk memahami kebutuhan Anda — acara yang dituju, preferensi gaya, dan pilihan bahan dari koleksi kami. Lihat Fabric Explorer untuk menjelajahi bahan yang tersedia.',
              ],
            },
          },
          {
            heading: 'Pengukuran dan Produksi',
            block: {
              kind: 'paragraphs',
              items: [
                'Fitter kami mengukur langsung untuk membentuk Digital Body Profile, yang kemudian menjadi acuan pembentukan pola dan produksi thobe Anda.',
              ],
            },
          },
        ],
      },
      {
        heading: 'Kapan Memilih Custom Thobe',
        block: {
          kind: 'list',
          items: [
            'Anda ingin thobe yang benar-benar pas dengan proporsi tubuh Anda sendiri',
            'Anda memiliki kebutuhan khusus (acara formal, pernikahan, umrah) yang menuntut detail spesifik',
            'Anda mencari kualitas bahan dan jahitan yang konsisten dari pesanan ke pesanan',
          ],
        },
      },
    ],
    whenToChoose: 'Pilih custom thobe bespoke jika Anda memprioritaskan kesesuaian ukuran dan detail personal dibanding kepraktisan membeli thobe ready-to-wear.',
    faq: [
      { question: 'Apakah saya perlu datang langsung untuk konsultasi?', answer: 'Pengukuran langsung oleh fitter adalah bagian penting dari proses bespoke — jadwalkan sesi konsultasi untuk detail lebih lanjut.' },
      { question: 'Berapa lama proses custom thobe selesai?', answer: 'Umumnya 2-3 minggu dari konsultasi hingga thobe selesai, tergantung kompleksitas desain dan bahan yang dipilih — lihat panduan lengkap kami untuk detail timeline.' },
    ],
    relatedArticles: [
      { category: 'bandung', slug: 'bespoke-tailor' },
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'questions', slug: 'how-much-does-bespoke-thobe-cost' },
    ],
    relatedCategories: ['tailoring', 'fabrics'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'bespoke-tailor',
    category: 'bandung',
    eyebrow: 'Local Tailor Bandung',
    title: 'Bespoke Tailor di Bandung — Proses Local Tailor',
    navLabel: 'Bespoke Tailor Bandung',
    metaDescription: 'Local Tailor adalah bespoke tailor di Bandung — pola dibentuk baru dari pengukuran individu, bukan disesuaikan dari pola standar.',
    dek: 'Memahami apa yang membedakan bespoke tailor sesungguhnya dari layanan jahit pada umumnya.',
    definition:
      'Local Tailor adalah bespoke tailor yang berbasis di Bandung — setiap thobe dijahit dari pola yang dibentuk baru dari nol berdasarkan pengukuran individu klien, bukan pola standar yang disesuaikan.',
    quickAnswer:
      'Sebagai bespoke tailor, Local Tailor membentuk pola baru dari pengukuran setiap klien, melibatkan sesi fitting untuk penyempurnaan, dan memproduksi thobe yang secara prinsip unik untuk satu individu.',
    keyTakeaways: [
      'Pola dibentuk baru dari nol untuk setiap klien, bukan disesuaikan dari template',
      'Proses melibatkan sesi fitting untuk penyempurnaan sebelum produksi akhir',
      'Quality control dilakukan bertahap sepanjang proses produksi',
      'Berbeda dari made-to-measure yang menyesuaikan pola dasar standar',
    ],
    sections: [
      {
        heading: 'Apa yang Membuat Local Tailor Bespoke Tailor Sesungguhnya',
        block: { kind: 'paragraphs', items: [] },
        subsections: [
          {
            heading: 'Pembentukan Pola',
            block: {
              kind: 'paragraphs',
              items: [
                'Setiap pengukuran yang diambil fitter diterjemahkan menjadi pola baru — bukan menyesuaikan pola siap pakai — mengikuti proses yang dijelaskan lebih detail di panduan Pattern Drafting kami.',
              ],
            },
          },
          {
            heading: 'Fitting dan Quality Control',
            block: {
              kind: 'paragraphs',
              items: [
                'Sesi fitting memastikan hasil akhir benar-benar sesuai sebelum thobe diserahkan, dengan pemeriksaan kualitas dilakukan bertahap sepanjang produksi.',
              ],
            },
          },
        ],
      },
    ],
    decisionFramework: [
      'Apakah Anda membutuhkan pola yang benar-benar dibentuk dari ukuran tubuh Anda sendiri?',
      'Apakah proporsi tubuh Anda tidak umum sehingga pola standar kurang cocok?',
      'Apakah Anda memiliki waktu untuk proses konsultasi dan fitting yang lebih menyeluruh?',
    ],
    faq: [
      { question: 'Apa bedanya Local Tailor dengan penjahit konveksi biasa?', answer: 'Konveksi umumnya memproduksi pakaian dalam ukuran standar massal, sementara Local Tailor membentuk pola baru khusus untuk setiap klien secara individual.' },
      { question: 'Berapa kali sesi fitting yang disertakan?', answer: 'Jumlah sesi fitting disesuaikan dengan kompleksitas pesanan — diskusikan detail ini saat konsultasi.' },
    ],
    relatedArticles: [
      { category: 'bandung', slug: 'custom-thobe' },
      { category: 'tailoring', slug: 'pattern-drafting' },
      { category: 'tailoring', slug: 'quality-control' },
    ],
    relatedCategories: ['tailoring'],
    tags: { service: ['bespoke'] },
  },
  {
    slug: 'wedding-tailor',
    category: 'bandung',
    eyebrow: 'Local Tailor Bandung',
    title: 'Wedding Tailor di Bandung — Thobe Pernikahan Local Tailor',
    navLabel: 'Wedding Tailor Bandung',
    metaDescription: 'Layanan wedding tailor di Bandung dari Local Tailor — thobe akad, resepsi, dan family outfit untuk kebutuhan pernikahan Anda.',
    dek: 'Kebutuhan thobe pernikahan Anda, dari akad hingga resepsi, ditangani sebagai satu proses bespoke.',
    definition:
      'Local Tailor menyediakan layanan wedding tailor di Bandung, mencakup thobe akad, resepsi, dan family outfit yang dikonsultasikan dan diproduksi melalui proses bespoke yang sama dengan pesanan thobe lainnya.',
    quickAnswer:
      'Sebagai wedding tailor di Bandung, Local Tailor melayani konsultasi warna dan bahan pernikahan, pengukuran, hingga produksi thobe akad, resepsi, dan family outfit dalam satu alur bespoke.',
    keyTakeaways: [
      'Melayani thobe akad, resepsi, dan family outfit sebagai kebutuhan terkoordinasi',
      'Konsultasi mencakup diskusi tema dan warna pernikahan',
      'Timeline pemesanan disarankan 6-8 minggu sebelum hari-H',
      'Proses yang sama dengan pesanan bespoke lainnya — konsultasi, ukur, produksi, fitting',
    ],
    sections: [
      {
        heading: 'Layanan Wedding Tailor Kami',
        block: {
          kind: 'list',
          items: [
            'Konsultasi warna dan bahan yang selaras dengan tema pernikahan Anda',
            'Thobe akad dengan penekanan kesan khidmat dan tenang',
            'Thobe resepsi dengan bahan premium untuk tampilan maksimal',
            'Koordinasi family outfit untuk keluarga inti pengantin',
          ],
        },
      },
      {
        heading: 'Timeline yang Disarankan',
        block: {
          kind: 'paragraphs',
          items: [
            'Untuk kebutuhan pernikahan, kami menyarankan memulai konsultasi 6-8 minggu sebelum hari-H — lihat panduan Timeline Custom Wedding kami untuk rincian tahap demi tahap.',
          ],
        },
      },
    ],
    faq: [
      { question: 'Apakah thobe akad dan resepsi dikonsultasikan bersamaan?', answer: 'Bisa, kami menyarankan mendiskusikan keduanya dalam satu sesi konsultasi awal untuk perencanaan yang lebih menyeluruh.' },
      { question: 'Apakah Local Tailor melayani family outfit untuk pernikahan?', answer: 'Ya, kami melayani koordinasi outfit untuk keluarga inti pengantin — lihat panduan Family Outfit kami untuk detail.' },
    ],
    relatedArticles: [
      { category: 'wedding', slug: 'bespoke-wedding-guide' },
      { category: 'wedding', slug: 'timeline-custom-wedding' },
      { category: 'bandung', slug: 'custom-thobe' },
    ],
    relatedCategories: ['wedding'],
    tags: { occasion: ['pernikahan'], service: ['bespoke'] },
  },
  {
    slug: 'umrah-thobe',
    category: 'bandung',
    eyebrow: 'Local Tailor Bandung',
    title: 'Thobe Umrah di Bandung — Layanan Local Tailor',
    navLabel: 'Thobe Umrah Bandung',
    metaDescription: 'Layanan thobe umrah custom di Bandung dari Local Tailor — bahan breathable, penyesuaian fungsional, untuk kenyamanan ibadah Anda.',
    dek: 'Thobe umrah yang disesuaikan dengan kebutuhan ibadah Anda, dijahit di Bandung.',
    definition:
      'Local Tailor menyediakan layanan thobe umrah custom di Bandung, mencakup konsultasi pemilihan bahan breathable dan penyesuaian fungsional seperti manset mudah wudhu, untuk kenyamanan selama ibadah.',
    quickAnswer:
      'Sebagai layanan thobe umrah di Bandung, Local Tailor membantu Anda memilih bahan breathable yang tepat dan menyesuaikan detail fungsional seperti manset dan kantong dalam untuk kebutuhan ibadah.',
    keyTakeaways: [
      'Konsultasi pemilihan bahan breathable sesuai musim keberangkatan',
      'Penyesuaian fungsional seperti manset mudah dilipat untuk wudhu',
      'Opsi kantong dalam untuk kebutuhan praktis seperti mushaf saku',
      'Proses bespoke yang sama — konsultasi, ukur, produksi, fitting',
    ],
    sections: [
      {
        heading: 'Layanan Thobe Umrah Kami',
        block: {
          kind: 'list',
          items: [
            'Konsultasi pemilihan bahan breathable — linen, katun Jepang, atau katun Mesir',
            'Penyesuaian potongan untuk kenyamanan gerak saat sujud dan wudhu berulang',
            'Opsi kantong tambahan untuk kebutuhan perjalanan ibadah',
            'Panduan jumlah thobe yang ideal berdasarkan durasi perjalanan Anda',
          ],
        },
      },
    ],
    whenToChoose: 'Pilih layanan custom umrah kami jika Anda menginginkan thobe yang disesuaikan khusus untuk kenyamanan ibadah, bukan sekadar thobe formal biasa yang dipakai untuk perjalanan.',
    faq: [
      { question: 'Bahan apa yang direkomendasikan untuk thobe umrah?', answer: 'Katun Jepang, linen, dan katun Mesir adalah pilihan yang paling umum direkomendasikan — lihat panduan Bahan Terbaik untuk Umrah kami untuk detail lengkap.' },
      { question: 'Apakah bisa meminta penyesuaian khusus seperti kantong dalam?', answer: 'Ya, sampaikan kebutuhan fungsional spesifik Anda saat konsultasi agar bisa diintegrasikan ke dalam desain thobe.' },
    ],
    relatedArticles: [
      { category: 'umrah', slug: 'custom-umrah-thobe' },
      { category: 'umrah', slug: 'best-fabric' },
      { category: 'bandung', slug: 'custom-thobe' },
    ],
    relatedCategories: ['umrah'],
    tags: { occasion: ['umrah'], service: ['bespoke'] },
  },
]
