import type { KnowledgeArticle } from '../types'

// Sprint W6-3 — Measurement Engine. 8 evergreen measurement guides.
// `thobe-size-guide` and `slim-vs-regular-fit` deliberately don't republish
// the exact size-chart table already live at /size-chart-thobe and
// /ukuran-thobe-pria (src/lib/content/articles.ts) — duplicating that table
// verbatim on a second URL would be self-cannibalizing, competing SEO
// content. Instead both cross-link out to the existing pages as the
// authoritative table, and focus on what those pages don't already cover.
export const MEASUREMENT_ARTICLES: KnowledgeArticle[] = [
  {
    slug: 'how-to-measure-body',
    category: 'measurements',
    eyebrow: 'Panduan Pengukuran',
    title: 'Cara Mengukur Badan untuk Thobe — Panduan Lengkap 5 Titik Ukur',
    navLabel: 'Cara Mengukur Badan',
    metaDescription:
      'Panduan lengkap 5 titik ukur utama untuk thobe — lingkar leher, lebar bahu, lingkar dada, panjang lengan, dan panjang badan. Langkah, kesalahan umum, dan tips profesional.',
    dek: 'Lima titik ukur yang menentukan seluruh proporsi thobe Anda — ringkasan lengkap sebelum masuk ke panduan detail masing-masing.',
    definition:
      'Mengukur badan untuk thobe adalah proses mencatat lima titik ukur utama — lingkar leher, lebar bahu, lingkar dada, panjang lengan, dan panjang badan — yang bersama-sama menentukan proporsi potongan thobe dari bahu hingga mata kaki.',
    sections: [
      {
        heading: 'Kenapa Lima Titik Ukur Ini yang Utama',
        block: {
          kind: 'paragraphs',
          items: [
            'Thobe dikenakan sebagai satu potongan menyeluruh tanpa sekat di pinggang, berbeda dari kemeja yang bisa "menutupi" ketidakproporsian dengan celana. Kelima titik ukur ini saling terkait — kesalahan kecil di satu titik akan terlihat pada keseluruhan siluet.',
          ],
        },
      },
      {
        heading: 'Langkah Pengukuran',
        block: {
          kind: 'steps',
          items: [
            { name: 'Lingkar Leher', text: 'Lingkarkan meteran di pangkal leher, tepat di atas tulang selangka, dengan jari telunjuk terselip di antara meteran dan leher agar masih ada ruang bernapas.' },
            { name: 'Lebar Bahu', text: 'Ukur jarak lurus dari ujung tulang bahu kiri ke ujung tulang bahu kanan, melewati bagian belakang leher, idealnya dengan bantuan orang lain.' },
            { name: 'Lingkar Dada', text: 'Lingkarkan meteran mengelilingi bagian dada terlebar, pastikan meteran sejajar dan tidak melorot di bagian punggung, tarik napas normal.' },
            { name: 'Panjang Lengan', text: 'Dari ujung bahu hingga pergelangan tangan, dengan lengan sedikit ditekuk secara natural.' },
            { name: 'Panjang Badan', text: 'Dari titik bahu tertinggi turun lurus hingga panjang akhir thobe yang diinginkan — umumnya semata kaki.' },
          ],
        },
      },
      {
        heading: 'Ilustrasi Titik Ukur',
        block: {
          kind: 'paragraphs',
          items: [
            'Diagram lima titik ukur ini — leher, bahu, dada, lengan, dan panjang badan — akan menyusul dalam pembaruan konten mendatang. Untuk saat ini, gunakan cermin besar dan bantuan orang lain untuk memastikan posisi meteran tetap horizontal di setiap titik.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Mengukur menggunakan baju tebal atau longgar, menambah beberapa sentimeter yang tidak akurat',
            'Menahan napas atau menegangkan otot saat diukur',
            'Mengukur lebar bahu sendirian tanpa bantuan, membuat posisi meteran sering miring',
            'Mengukur di pagi hari saat badan masih sedikit bengkak dari tidur',
          ],
        },
      },
      {
        heading: 'Tips Profesional',
        block: {
          kind: 'list',
          items: [
            'Ukur setiap titik dua kali dan bandingkan hasilnya — jika selisih lebih dari 1cm, ulangi pengukuran ketiga',
            'Gunakan meteran jahit kain yang lentur, bukan meteran logam',
            'Kenakan pakaian tipis dan pas badan, bukan baju longgar, saat mengukur',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apakah saya perlu mengukur kelima titik ini setiap kali memesan thobe?',
        answer:
          'Jika Anda sudah memiliki Digital Body Profile tersimpan dari pesanan sebelumnya, fitter kami akan mengonfirmasi ulang titik ukur utama, bukan mengukur dari nol, kecuali ada perubahan berat badan signifikan.',
      },
      {
        question: 'Titik ukur mana yang paling sering salah diukur sendiri?',
        answer:
          'Lebar bahu paling sering meleset karena sulit dijangkau sendiri tanpa bantuan — posisi meteran cenderung miring tanpa disadari saat mengukur sendirian di depan cermin.',
      },
      {
        question: 'Apakah pengukuran mandiri ini bisa langsung dipakai untuk produksi?',
        answer:
          'Pengukuran mandiri adalah referensi awal yang baik sebelum konsultasi. Untuk thobe yang benar-benar dijahit, Local Tailor tetap melakukan pengukuran ulang langsung oleh fitter.',
      },
    ],
    relatedArticles: [
      { category: 'measurements', slug: 'chest' },
      { category: 'measurements', slug: 'shoulder' },
      { category: 'measurements', slug: 'thobe-size-guide' },
    ],
    relatedCategories: ['tailoring'],
  },
  {
    slug: 'chest',
    category: 'measurements',
    eyebrow: 'Panduan Pengukuran',
    title: 'Cara Mengukur Lingkar Dada untuk Thobe',
    navLabel: 'Lingkar Dada',
    metaDescription:
      'Cara mengukur lingkar dada yang akurat untuk thobe — langkah pengukuran, kesalahan umum, dan tips profesional dari fitter.',
    dek: 'Titik ukur yang paling menentukan kelonggaran thobe di badan bagian atas.',
    definition:
      'Lingkar dada adalah ukuran keliling badan pada bagian dada terlebar, biasanya setinggi puting, dan menjadi salah satu titik ukur paling menentukan kelonggaran thobe secara keseluruhan.',
    sections: [
      {
        heading: 'Langkah Pengukuran',
        block: {
          kind: 'steps',
          items: [
            { name: 'Cari Titik Terlebar', text: 'Berdiri tegak dan identifikasi bagian dada yang paling lebar, biasanya setinggi puting.' },
            { name: 'Lingkarkan Meteran', text: 'Lingkarkan meteran mengelilingi dada pada titik tersebut, pastikan sejajar di depan maupun belakang, tidak melorot ke bawah di punggung.' },
            { name: 'Tarik Napas Normal', text: 'Jangan menahan napas atau menegangkan otot dada — bernapas seperti biasa saat meteran dibaca.' },
            { name: 'Catat Angka', text: 'Baca angka pada meteran dalam sentimeter, lalu tambahkan kelonggaran sesuai fit yang diinginkan (lihat panduan slim vs regular fit).' },
          ],
        },
      },
      {
        heading: 'Ilustrasi Titik Ukur',
        block: {
          kind: 'paragraphs',
          items: [
            'Diagram posisi meteran pada lingkar dada akan menyusul dalam pembaruan konten mendatang. Sebagai panduan sementara, pastikan meteran membentuk garis horizontal sempurna mengelilingi badan.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Meteran melorot ke bawah di bagian punggung, menghasilkan angka lebih kecil dari sebenarnya',
            'Menahan napas saat diukur, membuat lingkar dada terasa lebih kecil dari kondisi natural',
            'Mengukur dengan pakaian tebal yang menambah beberapa sentimeter tidak akurat',
          ],
        },
      },
      {
        heading: 'Tips Profesional',
        block: {
          kind: 'list',
          items: [
            'Minta bantuan orang lain untuk memastikan meteran sejajar di bagian punggung yang tidak terlihat',
            'Ukur dua kali dan bandingkan — selisih lebih dari 1cm berarti perlu diulang',
            'Ingat bahwa kelonggaran tambahan (4–8cm) akan ditambahkan sesuai fit, jadi catat angka badan asli terlebih dahulu',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Berapa kelonggaran ideal untuk lingkar dada thobe?',
        answer:
          'Bergantung pada fit yang dipilih: sekitar 4–5cm untuk slim fit, 6–7cm untuk regular fit, dan 8cm ke atas untuk relaxed fit, dihitung dari lingkar dada asli tubuh.',
      },
      {
        question: 'Apakah lingkar dada berubah signifikan seiring waktu?',
        answer:
          'Bisa, terutama akibat perubahan berat badan lebih dari 3–5kg atau program olahraga intensif yang mengubah massa otot dada. Disarankan mengukur ulang jika ada perubahan tersebut.',
      },
      {
        question: 'Apakah saya perlu mengukur dada dengan atau tanpa baju?',
        answer:
          'Ukur dengan pakaian tipis dan pas badan, bukan telanjang dada maupun berbaju tebal, agar hasilnya mendekati ukuran tubuh sebenarnya tanpa tambahan ketebalan kain.',
      },
    ],
    relatedArticles: [
      { category: 'measurements', slug: 'shoulder' },
      { category: 'measurements', slug: 'slim-vs-regular-fit' },
    ],
    relatedCategories: ['tailoring'],
  },
  {
    slug: 'shoulder',
    category: 'measurements',
    eyebrow: 'Panduan Pengukuran',
    title: 'Cara Mengukur Lebar Bahu untuk Thobe',
    navLabel: 'Lebar Bahu',
    metaDescription:
      'Cara mengukur lebar bahu yang akurat untuk thobe — titik ukur paling menentukan kenyamanan gerak lengan. Langkah, kesalahan umum, dan tips.',
    dek: 'Titik ukur yang paling menentukan kenyamanan gerak lengan dan kerapian garis bahu thobe.',
    definition:
      'Lebar bahu adalah jarak lurus dari ujung tulang bahu kiri ke ujung tulang bahu kanan, melewati bagian belakang leher, dan menjadi titik ukur yang paling menentukan kenyamanan gerak lengan pada thobe.',
    sections: [
      {
        heading: 'Langkah Pengukuran',
        block: {
          kind: 'steps',
          items: [
            { name: 'Berdiri Rileks', text: 'Berdiri tegak dengan bahu dalam posisi rileks alami, jangan diangkat atau ditarik ke belakang.' },
            { name: 'Temukan Ujung Tulang Bahu', text: 'Raba ujung tulang bahu kiri dan kanan sebagai titik awal dan akhir pengukuran.' },
            { name: 'Ukur Melewati Punggung', text: 'Minta bantuan orang lain mengukur jarak lurus dari ujung bahu kiri ke ujung bahu kanan, melewati bagian belakang leher.' },
            { name: 'Hindari Mengukur Sendiri', text: 'Jangan mengukur lebar bahu sendirian di depan cermin — posisi bahu cenderung berubah saat menjangkau meteran sendiri.' },
          ],
        },
      },
      {
        heading: 'Ilustrasi Titik Ukur',
        block: {
          kind: 'paragraphs',
          items: [
            'Diagram posisi ujung bahu dan jalur meteran akan menyusul dalam pembaruan konten mendatang. Titik acuan paling mudah adalah tulang yang menonjol di ujung bahu, tempat lengan mulai menekuk ke bawah.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Mengukur sendirian tanpa bantuan, menghasilkan posisi meteran yang miring',
            'Mengangkat atau menegangkan bahu saat diukur',
            'Salah menentukan titik ujung bahu, terlalu ke dalam atau terlalu ke luar',
          ],
        },
      },
      {
        heading: 'Tips Profesional',
        block: {
          kind: 'list',
          items: [
            'Gunakan bantuan orang lain — ini adalah satu-satunya titik ukur yang benar-benar sulit dilakukan sendiri dengan akurat',
            'Pastikan postur natural, bukan menegakkan badan berlebihan',
            'Untuk bahu yang lebih lebar dari proporsi tubuh (broad-shoulder), catat sebagai informasi tambahan untuk fitter',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Kenapa lebar bahu sulit diukur sendiri?',
        answer:
          'Karena titik ukurnya berada di bagian tubuh yang sulit dijangkau dan dilihat sendiri (belakang leher dan kedua ujung bahu sekaligus), sehingga posisi meteran mudah miring tanpa disadari.',
      },
      {
        question: 'Apa yang terjadi jika lebar bahu salah ukur?',
        answer:
          'Lebar bahu yang salah akan membuat garis bahu thobe terlihat turun (terlalu lebar) atau lengan terasa sempit dan menarik (terlalu sempit), memengaruhi kenyamanan gerak secara keseluruhan.',
      },
      {
        question: 'Apakah bahu lebar memerlukan penyesuaian khusus?',
        answer:
          'Ya. Bahu yang jauh lebih lebar dari proporsi tubuh lainnya (broad-shoulder) sering membutuhkan penyesuaian khusus di bagian bahu meski lingkar dada masih pas di ukuran semula — sebutkan hal ini saat konsultasi dengan fitter.',
      },
    ],
    relatedArticles: [
      { category: 'measurements', slug: 'chest' },
      { category: 'measurements', slug: 'sleeve' },
    ],
    relatedCategories: ['tailoring'],
  },
  {
    slug: 'sleeve',
    category: 'measurements',
    eyebrow: 'Panduan Pengukuran',
    title: 'Cara Mengukur Panjang Lengan untuk Thobe',
    navLabel: 'Panjang Lengan',
    metaDescription:
      'Cara mengukur panjang lengan yang akurat untuk thobe — dari ujung bahu hingga pergelangan tangan. Langkah, kesalahan umum, dan tips.',
    dek: 'Menentukan apakah manset thobe pas di pergelangan atau menutupi telapak tangan.',
    definition:
      'Panjang lengan adalah ukuran dari ujung bahu hingga pergelangan tangan, dan menentukan apakah manset thobe berhenti tepat di pergelangan atau menutupi sebagian telapak tangan.',
    sections: [
      {
        heading: 'Langkah Pengukuran',
        block: {
          kind: 'steps',
          items: [
            { name: 'Tentukan Titik Awal', text: 'Gunakan titik ujung bahu yang sama dengan pengukuran lebar bahu sebagai titik awal.' },
            { name: 'Tekuk Lengan Natural', text: 'Tekuk lengan sedikit secara natural, bukan lurus kaku ke bawah, agar hasil ukur mendekati posisi lengan saat bergerak.' },
            { name: 'Ukur hingga Pergelangan', text: 'Ukur lurus dari ujung bahu hingga tulang pergelangan tangan.' },
            { name: 'Catat Preferensi Panjang', text: 'Jika Anda lebih suka manset sedikit lebih pendek atau panjang dari standar, sampaikan preferensi ini saat konsultasi.' },
          ],
        },
      },
      {
        heading: 'Ilustrasi Titik Ukur',
        block: {
          kind: 'paragraphs',
          items: [
            'Diagram jalur pengukuran dari bahu ke pergelangan tangan akan menyusul dalam pembaruan konten mendatang. Posisi lengan sedikit ditekuk adalah kunci akurasi pengukuran ini.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Mengukur dengan lengan lurus kaku, menghasilkan angka lebih pendek dari kondisi gerak natural',
            'Menggunakan titik awal bahu yang berbeda dari pengukuran lebar bahu',
            'Tidak mempertimbangkan preferensi pribadi soal panjang manset',
          ],
        },
      },
      {
        heading: 'Tips Profesional',
        block: {
          kind: 'list',
          items: [
            'Ukur dengan lengan dalam posisi sedikit ditekuk, mendekati posisi natural saat berjalan atau beraktivitas',
            'Konsisten menggunakan titik ujung bahu yang sama dengan pengukuran lebar bahu',
            'Sampaikan preferensi panjang manset ke fitter — beberapa orang lebih suka manset sedikit di atas pergelangan',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Kenapa lengan harus sedikit ditekuk saat diukur?',
        answer:
          'Karena lengan jarang benar-benar lurus kaku saat beraktivitas sehari-hari. Mengukur dengan sedikit tekukan natural menghasilkan panjang lengan yang lebih nyaman saat thobe dipakai bergerak.',
      },
      {
        question: 'Apa yang terjadi jika panjang lengan salah ukur?',
        answer:
          'Lengan yang terlalu pendek akan membuat pergelangan tangan terekspos berlebihan, sementara lengan yang terlalu panjang akan menutupi telapak tangan dan mengganggu aktivitas seperti berwudhu.',
      },
      {
        question: 'Apakah panjang lengan memengaruhi kenyamanan berwudhu?',
        answer:
          'Ya, cukup signifikan. Banyak pemesan thobe secara khusus meminta manset yang mudah dilipat atau sedikit lebih pendek untuk memudahkan wudhu — sampaikan kebutuhan ini saat konsultasi.',
      },
    ],
    relatedArticles: [
      { category: 'measurements', slug: 'shoulder' },
      { category: 'measurements', slug: 'length' },
    ],
    relatedCategories: ['tailoring'],
  },
  {
    slug: 'length',
    category: 'measurements',
    eyebrow: 'Panduan Pengukuran',
    title: 'Cara Mengukur Panjang Badan untuk Thobe',
    navLabel: 'Panjang Badan',
    metaDescription:
      'Cara mengukur panjang badan yang akurat untuk thobe — dari titik bahu hingga panjang akhir yang diinginkan. Langkah, kesalahan umum, dan tips.',
    dek: 'Titik ukur paling personal karena dipengaruhi tinggi badan dan preferensi berpakaian.',
    definition:
      'Panjang badan adalah ukuran dari titik bahu tertinggi (dekat leher) turun lurus hingga panjang akhir thobe yang diinginkan, umumnya semata kaki atau sedikit di atasnya.',
    sections: [
      {
        heading: 'Langkah Pengukuran',
        block: {
          kind: 'steps',
          items: [
            { name: 'Berdiri Tegak Natural', text: 'Berdiri di lantai rata dengan postur natural, bukan menegakkan badan berlebihan.' },
            { name: 'Tentukan Titik Bahu Tertinggi', text: 'Cari titik bahu tertinggi dekat leher sebagai titik awal pengukuran.' },
            { name: 'Ukur Lurus ke Bawah', text: 'Ukur lurus turun hingga titik yang diinginkan sebagai panjang akhir thobe — umumnya semata kaki atau sedikit di atasnya.' },
            { name: 'Pertimbangkan Alas Kaki', text: 'Ukur dengan alas kaki yang biasa Anda kenakan bersama thobe untuk hasil panjang yang konsisten.' },
          ],
        },
      },
      {
        heading: 'Ilustrasi Titik Ukur',
        block: {
          kind: 'paragraphs',
          items: [
            'Diagram jalur pengukuran dari bahu hingga panjang akhir akan menyusul dalam pembaruan konten mendatang. Postur berdiri natural adalah kunci utama akurasi pengukuran ini.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Menegakkan badan berlebihan, membuat panjang badan terukur lebih panjang dari postur natural sehari-hari',
            'Tidak konsisten dengan alas kaki yang dikenakan saat mengukur',
            'Mengukur dengan postur membungkuk atau tidak tegak',
          ],
        },
      },
      {
        heading: 'Tips Profesional',
        block: {
          kind: 'list',
          items: [
            'Berdiri di lantai rata dengan postur yang biasa Anda gunakan sehari-hari, bukan postur yang dipaksakan',
            'Tentukan dulu preferensi panjang akhir (semata kaki, sedikit di atas, atau sedikit di bawah) sebelum mengukur',
            'Jika ragu, panjang semata kaki adalah standar paling umum dan aman sebagai titik awal',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Berapa panjang standar thobe yang umum dipilih?',
        answer:
          'Panjang semata kaki adalah standar paling umum, meski preferensi pribadi bervariasi — beberapa memilih sedikit di atas mata kaki untuk kepraktisan sehari-hari.',
      },
      {
        question: 'Apakah panjang badan berubah seiring waktu?',
        answer:
          'Panjang badan relatif stabil dibanding titik ukur lain, namun perubahan postur atau preferensi panjang tetap bisa membuat Anda ingin menyesuaikan ukuran pada pesanan berikutnya.',
      },
      {
        question: 'Apakah saya perlu mengukur dengan sandal atau sepatu?',
        answer:
          'Idealnya ukur dengan alas kaki yang biasa Anda kenakan bersama thobe, agar panjang akhir konsisten dengan bagaimana thobe akan benar-benar dipakai sehari-hari.',
      },
    ],
    relatedArticles: [
      { category: 'measurements', slug: 'sleeve' },
      { category: 'measurements', slug: 'how-to-measure-body' },
    ],
    relatedCategories: ['tailoring'],
  },
  {
    slug: 'neck',
    category: 'measurements',
    eyebrow: 'Panduan Pengukuran',
    title: 'Cara Mengukur Lingkar Leher untuk Thobe',
    navLabel: 'Lingkar Leher',
    metaDescription:
      'Cara mengukur lingkar leher yang akurat untuk thobe — menentukan ukuran kerah agar tidak terlalu ketat atau longgar. Langkah, kesalahan umum, dan tips.',
    dek: 'Titik ukur terkecil namun paling terasa jika salah — menentukan kenyamanan kerah saat dikancingkan.',
    definition:
      'Lingkar leher adalah ukuran keliling pangkal leher, diukur tepat di atas tulang selangka, dan menentukan ukuran kerah thobe agar tidak terlalu ketat maupun terlalu longgar saat dikancingkan.',
    sections: [
      {
        heading: 'Langkah Pengukuran',
        block: {
          kind: 'steps',
          items: [
            { name: 'Temukan Pangkal Leher', text: 'Identifikasi pangkal leher, tepat di atas tulang selangka, sebagai lokasi pengukuran.' },
            { name: 'Lingkarkan Meteran', text: 'Lingkarkan meteran mengelilingi pangkal leher pada titik tersebut.' },
            { name: 'Sisakan Ruang Bernapas', text: 'Selipkan jari telunjuk di antara meteran dan leher untuk memastikan masih ada ruang bernapas dan menelan dengan nyaman.' },
            { name: 'Catat Angka', text: 'Baca angka pada meteran dalam sentimeter setelah memastikan kelonggaran satu jari tersebut.' },
          ],
        },
      },
      {
        heading: 'Ilustrasi Titik Ukur',
        block: {
          kind: 'paragraphs',
          items: [
            'Diagram posisi meteran di pangkal leher akan menyusul dalam pembaruan konten mendatang. Trik satu jari terselip di antara meteran dan leher adalah cara paling praktis memastikan kelonggaran yang tepat.',
          ],
        },
      },
      {
        heading: 'Kesalahan Umum',
        block: {
          kind: 'list',
          items: [
            'Mengukur terlalu ketat tanpa menyisakan ruang bernapas',
            'Mengukur terlalu longgar sehingga kerah nantinya terasa kedodoran saat dikancingkan',
            'Salah menentukan titik pangkal leher, terlalu tinggi atau terlalu rendah',
          ],
        },
      },
      {
        heading: 'Tips Profesional',
        block: {
          kind: 'list',
          items: [
            'Gunakan trik satu jari telunjuk terselip di antara meteran dan leher sebagai standar kelonggaran',
            'Ukur dalam posisi berdiri tegak natural, bukan menunduk atau mendongak',
            'Jika Anda sering merasa kerah kemeja terasa ketat, sampaikan hal ini ke fitter untuk penyesuaian ekstra',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Kenapa perlu menyisakan ruang satu jari saat mengukur leher?',
        answer:
          'Agar kerah thobe nyaman dikancingkan penuh tanpa terasa mencekik, sekaligus tidak terlalu longgar hingga terlihat kedodoran saat dikancingkan.',
      },
      {
        question: 'Apakah lingkar leher berubah seiring waktu?',
        answer:
          'Relatif stabil dibanding titik ukur lain seperti lingkar dada, namun perubahan berat badan signifikan tetap bisa memengaruhi ukuran ini sedikit.',
      },
      {
        question: 'Apa yang terjadi jika lingkar leher salah ukur?',
        answer:
          'Kerah yang terlalu ketat akan terasa mencekik dan tidak nyaman dikancingkan penuh, sementara kerah yang terlalu longgar akan terlihat kedodoran dan kurang rapi.',
      },
    ],
    relatedArticles: [
      { category: 'measurements', slug: 'chest' },
      { category: 'measurements', slug: 'how-to-measure-body' },
    ],
    relatedCategories: ['tailoring'],
  },
  {
    slug: 'thobe-size-guide',
    category: 'measurements',
    eyebrow: 'Panduan Pengukuran',
    title: 'Panduan Ukuran Thobe — Memahami Size Guide Sebelum Memesan',
    navLabel: 'Panduan Ukuran',
    metaDescription:
      'Panduan memahami size guide thobe — cara membaca tabel ukuran, kapan perlu ukuran custom, dan hubungannya dengan Digital Body Profile.',
    dek: 'Cara membaca dan menggunakan size guide dengan benar sebelum memutuskan ukuran thobe Anda.',
    definition:
      'Size guide thobe adalah tabel referensi yang memetakan berat dan tinggi badan ke perkiraan ukuran (XS hingga XXL), digunakan sebagai titik awal sebelum pengukuran presisi oleh fitter.',
    sections: [
      {
        heading: 'Fungsi Size Guide',
        block: {
          kind: 'paragraphs',
          items: [
            'Size guide berfungsi sebagai alat bantu keputusan awal, bukan rumus matematis mutlak — dua orang dengan berat badan sama bisa punya distribusi otot dan lemak berbeda, sehingga ukuran akhir yang nyaman bisa berbeda satu tingkat.',
          ],
        },
      },
      {
        heading: 'Tabel Size Guide Lengkap',
        block: {
          kind: 'paragraphs',
          items: [
            'Tabel size chart lengkap dari XS hingga XXL — termasuk rentang berat badan, lingkar dada, dan lebar bahu per ukuran — tersedia selengkapnya di halaman Size Chart Thobe kami. Halaman tersebut juga menjelaskan penyesuaian untuk tinggi badan di luar rentang rata-rata.',
          ],
        },
      },
      {
        heading: 'Kapan Perlu Ukuran Custom',
        block: {
          kind: 'list',
          items: [
            'Tubuh Anda berada tepat di antara dua ukuran pada tabel',
            'Proporsi tubuh tidak umum, misalnya bahu lebar dengan pinggang ramping',
            'Tinggi badan berada jauh di luar rentang rata-rata tabel (di bawah 158cm atau di atas 185cm)',
            'Anda memiliki riwayat kesulitan menemukan ukuran pas di brand ready-to-wear manapun',
          ],
        },
      },
      {
        heading: 'Hubungan dengan Digital Body Profile',
        block: {
          kind: 'paragraphs',
          items: [
            'Size guide adalah titik awal sebelum konsultasi, sementara Digital Body Profile adalah data ukuran Anda yang sudah diverifikasi langsung oleh fitter dan menjadi acuan produksi sesungguhnya. Keduanya saling melengkapi, bukan saling menggantikan.',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Apakah size guide berlaku sama untuk semua bahan?',
        answer:
          'Size guide adalah acuan umum berdasarkan lingkar dada dan lebar bahu. Bahan yang lebih tebal atau kaku bisa terasa sedikit lebih ketat dibanding bahan ringan pada ukuran yang sama.',
      },
      {
        question: 'Di mana saya bisa melihat tabel size chart lengkap?',
        answer:
          'Tabel size chart lengkap dari XS hingga XXL tersedia di halaman Size Chart Thobe kami, lengkap dengan cara membacanya dan penyesuaian berdasarkan tinggi badan.',
      },
      {
        question: 'Apakah size guide menggantikan kebutuhan pengukuran oleh fitter?',
        answer:
          'Tidak. Size guide membantu Anda mendapat gambaran awal sebelum konsultasi, namun untuk thobe yang benar-benar dijahit, pengukuran langsung oleh fitter tetap menjadi satu-satunya sumber ukuran yang dipakai untuk produksi.',
      },
    ],
    relatedArticles: [
      { category: 'measurements', slug: 'slim-vs-regular-fit' },
      { category: 'measurements', slug: 'how-to-measure-body' },
    ],
    relatedCategories: ['tailoring'],
  },
  {
    slug: 'slim-vs-regular-fit',
    category: 'measurements',
    eyebrow: 'Panduan Pengukuran',
    title: 'Slim Fit vs Regular Fit vs Relaxed Fit — Panduan Memilih',
    navLabel: 'Slim vs Regular Fit',
    metaDescription:
      'Perbandingan slim fit, regular fit, dan relaxed fit untuk thobe — kelonggaran, kecocokan bentuk tubuh, dan cara memilih yang tepat.',
    dek: 'Tiga tingkat kelonggaran yang menentukan bagaimana thobe Anda terasa dan terlihat di badan.',
    definition:
      'Slim fit, regular fit, dan relaxed fit adalah tiga tingkat kelonggaran thobe yang menentukan seberapa dekat kain mengikuti garis tubuh, mulai dari yang paling terstruktur (slim) hingga paling longgar (relaxed).',
    sections: [
      {
        heading: 'Slim Fit',
        block: {
          kind: 'paragraphs',
          items: [
            'Mengikuti garis tubuh lebih dekat, terutama di bagian dada dan lengan, dengan kelonggaran hanya 4–5cm dari ukuran badan asli. Cocok untuk postur athletic atau slim yang menginginkan tampilan lebih terstruktur.',
          ],
        },
      },
      {
        heading: 'Regular Fit',
        block: {
          kind: 'paragraphs',
          items: [
            'Pilihan paling umum — cukup longgar untuk nyaman dipakai seharian termasuk saat sholat, dengan kelonggaran 6–7cm, tapi tetap terlihat rapi. Cocok untuk sebagian besar bentuk tubuh.',
          ],
        },
      },
      {
        heading: 'Relaxed Fit',
        block: {
          kind: 'paragraphs',
          items: [
            'Memberi ruang gerak paling besar dengan kelonggaran 8cm ke atas, ideal untuk cuaca panas atau postur tubuh full-body yang membutuhkan kelonggaran ekstra tanpa mengorbankan proporsi panjang badan.',
          ],
        },
      },
      {
        heading: 'Tabel Perbandingan Cepat',
        block: {
          kind: 'table',
          headers: ['Fit', 'Kelonggaran Dada', 'Paling Cocok Untuk'],
          rows: [
            ['Slim Fit', '4–5cm', 'Postur athletic/slim, kesan terstruktur'],
            ['Regular Fit', '6–7cm', 'Sebagian besar bentuk tubuh, harian'],
            ['Relaxed Fit', '8cm ke atas', 'Cuaca panas, postur full-body'],
          ],
        },
      },
      {
        heading: 'Cara Memilih',
        block: {
          kind: 'list',
          items: [
            'Pertimbangkan aktivitas utama — thobe untuk sholat rutin umumnya lebih nyaman dengan regular atau relaxed fit',
            'Pertimbangkan iklim — relaxed fit memberi sirkulasi udara lebih baik di cuaca panas',
            'Konsultasikan bentuk tubuh Anda dengan fitter — bahu lebar atau postur full-body punya rekomendasi fit yang berbeda',
          ],
        },
      },
    ],
    faq: [
      {
        question: 'Fit mana yang paling nyaman untuk sholat?',
        answer:
          'Regular fit atau relaxed fit umumnya lebih nyaman untuk gerakan sholat karena kelonggarannya yang lebih besar dibanding slim fit, meski ini tetap bergantung pada preferensi pribadi.',
      },
      {
        question: 'Apakah bentuk tubuh menentukan fit yang cocok?',
        answer:
          'Ya. Postur athletic atau slim umumnya paling nyaman dengan slim fit, sementara postur broad-shoulder atau full-body lebih nyaman dengan regular hingga relaxed fit untuk mengakomodasi proporsi tersebut.',
      },
      {
        question: 'Bisakah saya mengganti fit di pesanan berikutnya?',
        answer:
          'Tentu. Fit bukan bagian permanen dari Digital Body Profile Anda — Anda bisa memilih fit berbeda di setiap pesanan sesuai kebutuhan acara atau preferensi yang berubah.',
      },
    ],
    relatedArticles: [
      { category: 'measurements', slug: 'thobe-size-guide' },
      { category: 'measurements', slug: 'chest' },
    ],
    relatedCategories: ['tailoring', 'styling'],
  },
]
