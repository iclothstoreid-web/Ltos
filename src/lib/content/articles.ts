// Sprint W0.5 — SEO Content Cluster copy. Hand-authored, not generated from
// a template loop — each article has its own real structure and specific
// claims (measurement technique, actual size-chart numbers reused from
// src/lib/body-estimator/sizeRecommendation.ts, not invented separately),
// same reasoning as src/lib/materials/categoryContent.ts: this belongs in
// code as static content, not a database column.

export interface ArticleFaqItem {
  question: string
  answer: string
}

export interface ArticleSection {
  heading: string
  paragraphs: string[]
}

export interface ArticleNavEntry {
  slug: string
  navLabel: string
  title: string
}

export interface SizeChartRow {
  size: string
  weight: string
  chest: string
  shoulder: string
}

export interface HowToStepEntry {
  name: string
  text: string
}

export interface ArticleContent {
  slug: string
  eyebrow: string
  title: string
  metaDescription: string
  dek: string
  sections: ArticleSection[]
  faq: ArticleFaqItem[]
  relatedSlugs: string[]
  sizeChart?: SizeChartRow[]
  howToSteps?: HowToStepEntry[]
}

// Shared size-chart data — identical numbers to getSizeRangeLabels() in
// src/lib/body-estimator/sizeRecommendation.ts, and the same weight bands
// as recommendSize()'s baseSizeFromWeight(), so the content cluster never
// contradicts what the estimator itself outputs.
export const SIZE_CHART_ROWS: SizeChartRow[] = [
  { size: 'XS', weight: '< 50 kg', chest: '86–91 cm', shoulder: '41–42 cm' },
  { size: 'S', weight: '50–59 kg', chest: '91–96 cm', shoulder: '42–43.5 cm' },
  { size: 'M', weight: '60–74 kg', chest: '96–102 cm', shoulder: '43.5–45 cm' },
  { size: 'L', weight: '75–89 kg', chest: '102–109 cm', shoulder: '45–46.5 cm' },
  { size: 'XL', weight: '90–104 kg', chest: '109–117 cm', shoulder: '46.5–48 cm' },
  { size: 'XXL', weight: '≥ 105 kg', chest: '117–127 cm', shoulder: '48–50 cm' },
]

export const ARTICLE_NAV: ArticleNavEntry[] = [
  { slug: 'cek-ukuran-thobe', navLabel: 'Cek Ukuran Thobe', title: 'Cek Ukuran Thobe Anda dalam Kurang dari 30 Detik' },
  { slug: 'ukuran-thobe-pria', navLabel: 'Ukuran Thobe Pria', title: 'Ukuran Thobe Pria: Panduan Lengkap Memilih Fit yang Tepat' },
  { slug: 'cara-mengukur-thobe', navLabel: 'Cara Mengukur Thobe', title: 'Cara Mengukur Badan untuk Thobe Sendiri di Rumah' },
  { slug: 'size-chart-thobe', navLabel: 'Size Chart Thobe', title: 'Size Chart Thobe — Tabel Ukuran Lengkap Pria' },
]

export const cekUkuranThobeContent: ArticleContent = {
  slug: 'cek-ukuran-thobe',
  eyebrow: 'Panduan Ukuran Thobe',
  title: 'Cek Ukuran Thobe Anda dalam Kurang dari 30 Detik',
  metaDescription:
    'Cara cek ukuran thobe yang benar sebelum memesan custom — kenapa size chart generik sering meleset, dan bagaimana estimasi online membantu langkah awal Anda.',
  dek: 'Sebelum memesan thobe custom, ketahui dulu perkiraan ukuran Anda — gratis, tanpa perlu ke toko, dan jadi titik awal yang akurat sebelum pengukuran langsung oleh fitter.',
  sections: [
    {
      heading: 'Kenapa Ukuran Thobe Sering Meleset',
      paragraphs: [
        'Thobe bukan kemeja atau kaos yang ukurannya bisa ditebak dari label S/M/L generik. Potongannya menyeluruh dari bahu ke mata kaki, sehingga satu kesalahan kecil di lingkar dada atau panjang lengan langsung terlihat jelas — beda dengan baju pendek yang masih bisa "dimaafkan" longgar sedikit. Banyak pembeli pertama kali memesan thobe berdasarkan ukuran kemeja formal yang biasa mereka pakai, padahal proporsi thobe menuntut perhitungan berbeda: lingkar dada, lebar bahu, panjang lengan, dan panjang badan total harus proporsional satu sama lain, bukan sekadar meniru ukuran baju lain.',
        'Masalah kedua adalah size chart generik yang beredar online sering dibuat untuk potongan Saudi, Emirati, atau Kuwaiti yang masing-masing punya standar panjang dan kelonggaran berbeda. Thobe potongan Saudi misalnya cenderung lebih lurus dan longgar di badan, sementara potongan Emirati punya kerah dan manset yang lebih fitted. Tanpa mengetahui potongan mana yang dituju, angka di size chart bisa menyesatkan meski Anda sudah mengukur badan dengan benar.',
      ],
    },
    {
      heading: 'Dua Cara Mengecek Ukuran: Estimasi Online vs Pengukuran Fitter',
      paragraphs: [
        'Ada dua pendekatan yang saling melengkapi, bukan saling menggantikan. Estimasi online — seperti Body Profile Estimator dari Local Tailor — memberi gambaran awal ukuran, rekomendasi fit, dan body profile Anda hanya dari tiga angka: tinggi badan, berat badan, dan usia. Prosesnya kurang dari 30 detik dan bisa dilakukan kapan saja, tanpa perlu janji temu.',
        'Pengukuran langsung oleh fitter tetap menjadi satu-satunya sumber ukuran yang dipakai untuk produksi. Fitter mengukur belasan titik tubuh secara fisik — termasuk lingkar leher, lebar bahu presisi, panjang lengan dari bahu ke pergelangan, dan panjang badan dari bahu ke mata kaki — sesuatu yang tidak bisa digantikan oleh estimasi berbasis tinggi dan berat badan saja. Estimasi online adalah langkah awal yang mempercepat konsultasi; pengukuran fitter adalah langkah yang menentukan hasil akhir jahitan.',
      ],
    },
    {
      heading: 'Apa yang Anda Dapatkan dari Estimasi Online',
      paragraphs: [
        'Body Profile Estimator kami menghasilkan lima informasi sekaligus: body profile (misalnya athletic, slim, atau broad-shoulder), rekomendasi fit (slim, regular, atau relaxed), estimasi ukuran thobe (XS hingga XXL), skor confidence dari perhitungan, dan penjelasan singkat kenapa hasil tersebut relevan untuk Anda. Semua dihitung dari rule sederhana berbasis tinggi badan, berat badan, dan usia — tanpa AI, tanpa unggah foto, tanpa kamera.',
      ],
    },
    {
      heading: 'Estimasi Online vs Pengukuran Fitter: Mana yang Anda Butuhkan?',
      paragraphs: [
        'Dari sisi waktu, estimasi online selesai dalam kurang dari 30 detik dan hanya butuh tiga angka, sementara pengukuran fitter berlangsung sekitar 15-20 menit dengan belasan titik ukur fisik — perbedaan ini bukan soal mana yang "lebih baik", tapi soal tahap mana yang sedang Anda lalui. Estimasi online cocok saat Anda masih membandingkan pilihan atau ingin tahu perkiraan sebelum memutuskan booking; pengukuran fitter adalah tahap saat Anda sudah siap memesan dan butuh angka yang benar-benar dipakai untuk memotong kain.',
        'Dari sisi hasil, estimasi online memberi body profile, rekomendasi fit, estimasi ukuran, dan skor confidence — semuanya perkiraan. Pengukuran fitter menghasilkan Digital Body Profile yang terverifikasi dan menjadi acuan produksi. Keduanya gratis dan tidak saling menggantikan: estimasi mempercepat keputusan Anda, pengukuran fitter memastikan thobe yang jadi benar-benar pas di badan.',
      ],
    },
    {
      heading: 'Kapan Anda Tetap Perlu Pengukuran Langsung',
      paragraphs: [
        'Estimasi online sangat membantu untuk perencanaan awal — misalnya menentukan ukuran mana yang paling mendekati sebelum konsultasi, atau sekadar mengetahui apakah Anda cenderung slim fit atau relaxed fit. Namun untuk thobe yang benar-benar dipesan dan dijahit, Local Tailor selalu menggunakan Digital Body Profile yang dibuat dari pengukuran langsung oleh fitter. Ini bukan langkah tambahan yang merepotkan — justru inilah yang membedakan thobe custom dari thobe ready-to-wear: setiap jahitan dipotong sesuai tubuh Anda yang sebenarnya, bukan estimasi.',
      ],
    },
  ],
  faq: [
    {
      question: 'Apakah cek ukuran thobe online ini gratis?',
      answer:
        'Ya, sepenuhnya gratis. Anda hanya perlu memasukkan tinggi badan, berat badan, dan usia — hasilnya langsung muncul tanpa biaya maupun kewajiban memesan.',
    },
    {
      question: 'Apakah hasil cek ukuran online bisa langsung dipakai untuk memesan thobe?',
      answer:
        'Hasil estimasi online adalah perkiraan awal, bukan ukuran produksi. Untuk thobe yang dijahit, Local Tailor tetap menggunakan pengukuran langsung oleh fitter untuk membuat Digital Body Profile yang terverifikasi.',
    },
    {
      question: 'Berapa lama waktu yang dibutuhkan untuk mengecek ukuran thobe secara online?',
      answer: 'Kurang dari 30 detik. Anda hanya perlu mengisi tiga data: tinggi badan, berat badan, dan usia.',
    },
    {
      question: 'Apa bedanya body profile dengan ukuran thobe?',
      answer:
        'Body profile menggambarkan proporsi tubuh Anda secara umum (misalnya athletic atau slim), sementara ukuran thobe (XS-XXL) adalah rekomendasi ukuran spesifik berdasarkan proporsi tersebut, dikombinasikan dengan rekomendasi fit seperti slim, regular, atau relaxed.',
    },
    {
      question: 'Apakah saya tetap perlu ke fitter jika sudah cek ukuran online?',
      answer:
        'Untuk thobe yang benar-benar dipesan dan dijahit, ya. Estimasi online membantu Anda mendapat gambaran awal, tapi pengukuran langsung oleh fitter tetap menjadi satu-satunya sumber ukuran yang dipakai untuk produksi.',
    },
    {
      question: 'Apakah estimasi ukuran berbeda-beda tergantung usia?',
      answer:
        'Usia memengaruhi skor confidence dan sedikit menyesuaikan proporsi body profile, meski pengaruhnya lebih kecil dibanding tinggi dan berat badan. Body Profile Estimator tetap memasukkan usia sebagai salah satu dari tiga input utama agar hasilnya lebih relevan untuk Anda.',
    },
  ],
  relatedSlugs: ['ukuran-thobe-pria', 'cara-mengukur-thobe'],
}

export const ukuranThobePriaContent: ArticleContent = {
  slug: 'ukuran-thobe-pria',
  eyebrow: 'Panduan Ukuran',
  title: 'Ukuran Thobe Pria: Panduan Lengkap Memilih Fit yang Tepat',
  metaDescription:
    'Panduan lengkap ukuran thobe pria — titik ukur utama, tabel perkiraan size XS-XXL, perbandingan slim/regular/relaxed fit, dan faktor yang memengaruhi pilihan ukuran.',
  dek: 'Dari titik ukur utama hingga tabel perkiraan size, ini yang perlu Anda pahami sebelum memesan thobe custom.',
  sections: [
    {
      heading: 'Apa Itu Ukuran Thobe?',
      paragraphs: [
        'Ukuran thobe adalah kombinasi beberapa titik ukur yang bekerja sama membentuk potongan pakaian menyeluruh dari bahu hingga mata kaki — berbeda dari ukuran kemeja yang umumnya hanya mempertimbangkan lingkar dada dan panjang lengan. Karena thobe dikenakan sebagai satu potongan penuh tanpa sekat di pinggang, proporsi antar titik ukur harus selaras: lingkar dada yang pas tapi panjang badan yang salah akan membuat thobe terlihat tidak proporsional meski "ukurannya benar" di atas kertas.',
      ],
    },
    {
      heading: 'Titik Ukur Utama pada Thobe',
      paragraphs: [
        'Lingkar Leher/Kerah — diukur mengelilingi pangkal leher, menentukan ukuran kerah agar tidak terlalu ketat atau longgar saat dikancingkan.',
        'Lebar Bahu — jarak dari ujung bahu kiri ke ujung bahu kanan, titik ukur yang paling menentukan kenyamanan gerak lengan.',
        'Lingkar Dada — diukur pada bagian dada terlebar, biasanya ditambah kelonggaran 4–8 cm dari ukuran badan asli tergantung fit yang dipilih.',
        'Panjang Lengan — dari ujung bahu hingga pergelangan tangan, memengaruhi apakah manset thobe pas di pergelangan atau menutupi telapak tangan.',
        'Panjang Badan — dari titik bahu hingga mata kaki, titik ukur paling personal karena sangat dipengaruhi tinggi badan dan preferensi berpakaian.',
      ],
    },
    {
      heading: 'Tabel Perkiraan Ukuran Thobe Pria',
      paragraphs: [
        'Tabel berikut adalah perkiraan awal berdasarkan berat badan sebagai indikator utama, dengan catatan bahwa tinggi badan di atas 185cm atau di bawah 158cm biasanya menggeser satu ukuran ke atas atau ke bawah. Gunakan tabel ini sebagai referensi kasar — untuk hasil presisi, gunakan Body Profile Estimator kami atau pengukuran langsung oleh fitter.',
      ],
    },
    {
      heading: 'Slim Fit vs Regular Fit vs Relaxed Fit',
      paragraphs: [
        'Slim Fit mengikuti garis tubuh lebih dekat, terutama di bagian dada dan lengan, cocok untuk postur athletic atau slim yang ingin tampilan lebih terstruktur. Kelonggaran di lingkar dada biasanya hanya 4–5cm dari ukuran badan asli.',
        'Regular Fit adalah pilihan paling umum — cukup longgar untuk nyaman dipakai seharian termasuk saat sholat, tapi tidak berlebihan sehingga tetap terlihat rapi. Cocok untuk sebagian besar bentuk tubuh, termasuk straight, athletic, dan broad-shoulder.',
        'Relaxed Fit memberi ruang gerak paling besar, ideal untuk cuaca panas atau postur tubuh full-body yang membutuhkan kelonggaran ekstra di lingkar dada dan pinggang tanpa mengorbankan proporsi panjang badan.',
      ],
    },
    {
      heading: 'Faktor yang Memengaruhi Pilihan Ukuran',
      paragraphs: [
        'Selain proporsi tubuh, tiga faktor lain ikut menentukan ukuran akhir yang nyaman dipakai: jenis kain (katun tebal membutuhkan kelonggaran sedikit lebih besar dibanding kain yang lebih ringan dan jatuh), gaya potongan (potongan Saudi vs Emirati punya standar kelonggaran berbeda di bagian dada dan kerah), dan kebiasaan berpakaian (mereka yang terbiasa memakai baju longgar sering merasa ukuran "pas secara teknis" terasa terlalu ketat). Inilah kenapa dua orang dengan tinggi dan berat badan sama bisa memilih ukuran akhir yang berbeda.',
      ],
    },
    {
      heading: 'Ukuran Thobe Berdasarkan Bentuk Tubuh (Body Profile)',
      paragraphs: [
        'Slim — proporsi ramping di seluruh badan tanpa perbedaan besar antara lingkar dada dan pinggang, umumnya paling nyaman dengan slim fit di ukuran S atau M dan kelonggaran minimal di seluruh titik ukur.',
        'Athletic — bahu lebih lebar dibanding pinggang akibat massa otot dada dan bahu, butuh kelonggaran ekstra khusus di bagian bahu dan dada tanpa membuat badan bagian bawah terlihat kebesaran. Regular fit paling sering direkomendasikan.',
        'Broad-Shoulder — bahu jauh lebih lebar dari proporsi tubuh lainnya, sering membutuhkan ukuran dinaikkan satu tingkat khusus di bagian bahu meski lingkar dada dan pinggang masih pas di ukuran semula.',
        'Full-Body — proporsi tubuh lebih penuh secara merata di dada dan pinggang, relaxed fit memberi kenyamanan gerak tanpa mengorbankan proporsi panjang badan yang tetap harus disesuaikan dengan tinggi badan.',
        'Tall-Lean — tinggi badan di atas rata-rata dengan badan yang tetap ramping, penyesuaian paling penting ada di panjang badan dan panjang lengan, bukan di lingkar dada atau bahu.',
      ],
    },
  ],
  sizeChart: SIZE_CHART_ROWS,
  faq: [
    {
      question: 'Apa ukuran thobe standar untuk pria dengan tinggi 170–175cm?',
      answer:
        'Untuk tinggi di rentang ini dengan berat badan proporsional, ukuran M biasanya paling sesuai, dengan penyesuaian ke L jika berat badan di atas 75kg. Tinggi badan di bawah 158cm atau di atas 185cm biasanya menggeser ukuran satu tingkat.',
    },
    {
      question: 'Bagaimana cara tahu saya butuh slim fit atau regular fit?',
      answer:
        'Slim fit cocok untuk postur athletic atau slim yang menginginkan tampilan terstruktur. Regular fit lebih fleksibel untuk sebagian besar bentuk tubuh dan aktivitas sehari-hari. Body Profile Estimator kami memberi rekomendasi fit berdasarkan tinggi, berat, dan usia Anda dalam hitungan detik.',
    },
    {
      question: 'Apakah ukuran thobe sama dengan ukuran kemeja?',
      answer:
        'Tidak. Thobe memiliki titik ukur tambahan seperti panjang badan total yang tidak ada pada kemeja, sehingga ukuran kemeja tidak bisa langsung dipakai sebagai acuan ukuran thobe.',
    },
    {
      question: 'Berapa kelonggaran ideal di lingkar dada thobe?',
      answer:
        'Bergantung pada fit yang dipilih: sekitar 4–5cm untuk slim fit, 6–7cm untuk regular fit, dan 8cm ke atas untuk relaxed fit, dihitung dari lingkar dada asli tubuh.',
    },
    {
      question: 'Apakah tabel ukuran ini berlaku untuk semua potongan thobe?',
      answer:
        'Tabel ini adalah perkiraan umum. Potongan Saudi, Emirati, dan Kuwaiti punya standar kelonggaran yang sedikit berbeda, sehingga hasil akhir tetap disesuaikan saat konsultasi dengan fitter.',
    },
  ],
  relatedSlugs: ['cek-ukuran-thobe', 'size-chart-thobe', 'cara-mengukur-thobe'],
}

export const caraMengukurThobeContent: ArticleContent = {
  slug: 'cara-mengukur-thobe',
  eyebrow: 'Panduan Langkah demi Langkah',
  title: 'Cara Mengukur Badan untuk Thobe Sendiri di Rumah',
  metaDescription:
    'Cara mengukur badan untuk thobe sendiri di rumah — 6 langkah lengkap: lingkar leher, lebar bahu, lingkar dada, panjang lengan, dan panjang badan.',
  dek: 'Enam titik ukur yang perlu Anda catat sebelum konsultasi — bisa dilakukan sendiri di rumah dengan meteran jahit dan bantuan satu orang.',
  sections: [
    {
      heading: 'Yang Anda Butuhkan',
      paragraphs: [
        'Mengukur badan sendiri untuk thobe tidak butuh alat khusus — cukup meteran jahit (bukan meteran kayu/logam), cermin, dan idealnya satu orang untuk membantu memegang ujung meteran di bagian punggung yang sulit dijangkau sendiri. Kenakan pakaian yang tipis dan pas badan saat mengukur, bukan baju longgar, agar hasilnya mendekati ukuran tubuh sebenarnya.',
        'Sebaiknya ukur badan di waktu yang sama seperti biasa Anda beraktivitas — hindari mengukur pagi hari saat badan masih sedikit bengkak dari tidur, atau langsung setelah makan besar. Berdiri di lantai yang rata dengan postur natural, bukan menegakkan badan berlebihan, karena postur yang dipaksakan akan membuat panjang badan dan lebar bahu terukur tidak akurat.',
      ],
    },
    {
      heading: 'Kesalahan Umum Saat Mengukur Sendiri',
      paragraphs: [
        'Tiga kesalahan yang paling sering terjadi: mengukur menggunakan baju tebal atau longgar (menambah beberapa sentimeter yang tidak akurat), menahan napas atau menegangkan otot saat diukur (membuat lingkar dada terasa lebih kecil dari kondisi natural), dan mengukur lebar bahu sendirian tanpa bantuan (posisi meteran sering miring tanpa disadari). Jika ragu dengan hasil pengukuran mandiri, angka ini tetap berguna sebagai referensi awal — pengukuran final akan dikonfirmasi ulang oleh fitter sebelum thobe mulai dijahit, jadi kesalahan kecil di tahap ini tidak akan berakibat fatal pada hasil akhir.',
      ],
    },
    {
      heading: 'Tips agar Hasil Lebih Presisi',
      paragraphs: [
        'Ukur setiap titik dua kali dan bandingkan hasilnya — jika selisih lebih dari 1cm, ulangi pengukuran ketiga untuk memastikan angka mana yang lebih akurat. Meteran yang melintir atau tidak sejajar adalah penyebab paling umum selisih semacam ini.',
        'Gunakan penerangan yang cukup dan berdiri menghadap cermin besar saat memungkinkan, sehingga Anda atau orang yang membantu bisa memastikan posisi meteran tetap horizontal, terutama saat mengukur lingkar dada dan lingkar leher yang paling sensitif terhadap kemiringan meteran.',
      ],
    },
    {
      heading: 'Kapan Perlu Mengukur Ulang Badan',
      paragraphs: [
        'Ukuran badan bukan angka yang tetap selamanya. Perubahan berat badan lebih dari 3–5kg, program olahraga intensif yang mengubah massa otot terutama di bahu dan dada, atau jeda lebih dari satu tahun sejak pengukuran terakhir adalah tiga alasan paling umum untuk mengukur ulang sebelum memesan thobe baru. Bahkan jika Anda sudah punya Digital Body Profile tersimpan dari pesanan sebelumnya, fitter kami akan selalu mengonfirmasi ulang titik ukur utama untuk pesanan baru guna memastikan hasil tetap presisi.',
      ],
    },
  ],
  howToSteps: [
    {
      name: 'Ukur Lingkar Leher',
      text: 'Lingkarkan meteran di pangkal leher, tepat di atas tulang selangka, dengan jari telunjuk terselip di antara meteran dan leher untuk memastikan masih ada ruang bernapas. Catat angka dalam sentimeter.',
    },
    {
      name: 'Ukur Lebar Bahu',
      text: 'Berdiri tegak dengan bahu rileks, minta bantuan orang lain mengukur jarak lurus dari ujung tulang bahu kiri ke ujung tulang bahu kanan, melewati bagian belakang leher. Hindari mengukur sendiri di depan cermin karena posisi bahu cenderung berubah.',
    },
    {
      name: 'Ukur Lingkar Dada',
      text: 'Lingkarkan meteran mengelilingi bagian dada terlebar (biasanya setinggi puting), pastikan meteran sejajar dan tidak melorot ke bawah di bagian punggung. Tarik napas normal, jangan menahan napas saat mengukur.',
    },
    {
      name: 'Ukur Panjang Lengan',
      text: 'Dari ujung bahu (titik yang sama dengan pengukuran lebar bahu) hingga pergelangan tangan, dengan lengan sedikit ditekuk secara natural, bukan lurus kaku ke bawah.',
    },
    {
      name: 'Ukur Panjang Badan',
      text: 'Dari titik bahu tertinggi (dekat leher) turun lurus hingga titik yang Anda inginkan sebagai panjang akhir thobe — umumnya semata kaki atau sedikit di atasnya. Ukur saat berdiri tegak dengan postur normal.',
    },
    {
      name: 'Catat dan Bandingkan dengan Size Chart',
      text: 'Tuliskan keenam angka tersebut, lalu bandingkan dengan size chart thobe kami untuk mendapat gambaran ukuran awal sebelum konsultasi dengan fitter.',
    },
  ],
  faq: [
    {
      question: 'Apakah pengukuran sendiri di rumah cukup akurat untuk memesan thobe?',
      answer:
        'Pengukuran mandiri adalah referensi awal yang baik, terutama untuk mengetahui perkiraan ukuran sebelum konsultasi. Namun untuk thobe yang benar-benar dijahit, Local Tailor tetap melakukan pengukuran ulang langsung oleh fitter untuk memastikan akurasi penuh.',
    },
    {
      question: 'Meteran apa yang sebaiknya digunakan untuk mengukur badan?',
      answer:
        'Gunakan meteran jahit kain yang lentur (biasanya berwarna kuning atau putih dengan skala cm), bukan meteran logam untuk konstruksi, karena meteran logam tidak bisa mengikuti lekuk tubuh.',
    },
    {
      question: 'Apakah saya perlu bantuan orang lain untuk mengukur badan sendiri?',
      answer:
        'Sangat disarankan, terutama untuk mengukur lebar bahu dan panjang badan bagian belakang. Mengukur sendirian di depan cermin sering menghasilkan angka yang kurang akurat karena posisi tubuh berubah saat menjangkau meteran.',
    },
    {
      question: 'Kapan waktu terbaik untuk mengukur badan?',
      answer:
        'Kapan saja dalam kondisi tubuh normal, idealnya tidak langsung setelah berolahraga berat karena otot yang masih tegang bisa membuat lingkar dada terukur lebih besar dari biasanya.',
    },
    {
      question: 'Setelah mengukur sendiri, apa langkah selanjutnya?',
      answer:
        'Bandingkan hasil ukur Anda dengan size chart thobe kami atau gunakan Body Profile Estimator untuk mendapat rekomendasi fit dan ukuran, lalu lanjutkan ke booking Free Measurement agar fitter dapat mengonfirmasi ukuran final.',
    },
    {
      question: 'Apakah saya perlu melepas jaket atau outer sebelum mengukur?',
      answer:
        'Ya. Ukur badan hanya dengan pakaian dalam yang tipis atau kaos ketat, tanpa jaket, outer, atau pakaian berlapis, agar hasil pengukuran mencerminkan bentuk badan asli, bukan tambahan ketebalan dari pakaian.',
    },
  ],
  relatedSlugs: ['size-chart-thobe', 'ukuran-thobe-pria'],
}

export const sizeChartThobeContent: ArticleContent = {
  slug: 'size-chart-thobe',
  eyebrow: 'Referensi Ukuran',
  title: 'Size Chart Thobe — Tabel Ukuran Lengkap Pria',
  metaDescription:
    'Size chart thobe lengkap dari XS hingga XXL — lingkar dada, lebar bahu, dan berat badan per ukuran, plus cara membacanya dan kapan perlu ukuran custom.',
  dek: 'Tabel size chart thobe dari XS hingga XXL, lengkap dengan cara membacanya dan kapan Anda sebaiknya memilih ukuran custom.',
  sections: [
    {
      heading: 'Cara Membaca Size Chart Thobe',
      paragraphs: [
        'Size chart thobe berbeda dari size chart pakaian pada umumnya karena mempertimbangkan dua ukuran tubuh sekaligus — berat badan sebagai indikator utama lingkar dada dan bahu, serta tinggi badan sebagai penentu apakah ukuran perlu digeser naik atau turun. Angka lingkar dada dan lebar bahu pada tabel di bawah adalah rentang, bukan angka tunggal, karena kelonggaran fit (slim, regular, atau relaxed) juga memengaruhi hasil akhir dalam rentang tersebut.',
        'Perlakukan berat badan sebagai titik awal, bukan penentu tunggal. Dua pria dengan berat badan sama bisa punya distribusi otot dan lemak yang sangat berbeda — satu lebih besar di dada dan bahu, satu lebih merata di seluruh badan — sehingga ukuran akhir yang nyaman bisa berbeda satu tingkat meski angka di timbangan identik. Size chart adalah alat bantu keputusan, bukan rumus matematis yang mutlak.',
      ],
    },
    {
      heading: 'Tabel Size Chart Thobe Pria',
      paragraphs: [
        'Tinggi badan ≥185cm: naik satu ukuran dari tabel di bawah. Tinggi badan ≤158cm: turun satu ukuran dari tabel di bawah.',
      ],
    },
    {
      heading: 'Contoh Penerapan Penyesuaian Tinggi Badan',
      paragraphs: [
        'Sebagai ilustrasi, pria dengan berat 68kg akan masuk kategori M berdasarkan tabel di atas. Namun jika tinggi badannya 188cm, ukuran yang direkomendasikan naik menjadi L karena proporsi panjang badan membutuhkan ruang tambahan agar thobe tidak terlihat terlalu pendek di bagian bawah.',
        'Sebaliknya, pria dengan berat yang sama (68kg) namun tinggi 155cm akan mendapat rekomendasi S, karena proporsi panjang badan yang lebih pendek membuat ukuran M terasa kebesaran di bagian dada dan bahu meski lingkar dadanya sebenarnya pas.',
      ],
    },
    {
      heading: 'Size Chart vs Ukuran Custom/Bespoke',
      paragraphs: [
        'Size chart adalah titik awal yang baik untuk memperkirakan ukuran, tapi thobe bespoke pada dasarnya dibuat untuk keluar dari batasan size chart standar. Jika tubuh Anda berada tepat di antara dua ukuran, atau punya proporsi yang tidak umum (misalnya bahu lebar dengan pinggang ramping, atau tinggi badan di luar rentang tabel), pengukuran custom langsung oleh fitter akan selalu memberi hasil yang lebih pas dibanding memilih ukuran terdekat dari tabel.',
      ],
    },
    {
      heading: 'Perbedaan Size Chart Antar Potongan Thobe',
      paragraphs: [
        'Potongan Saudi umumnya memiliki kelonggaran paling besar di seluruh badan dengan kerah tinggi tegak, cocok untuk kenyamanan maksimal sehari-hari. Potongan Emirati/Khaleeji punya siluet sedikit lebih fitted di bahu dan dada dengan manset serta kerah yang lebih presisi, sering menjadi pilihan untuk acara formal. Potongan Kuwaiti berada di antara keduanya, dengan penekanan pada garis bahu yang bersih tanpa terlalu longgar.',
        'Size chart di atas menggunakan standar potongan regular yang bisa dijadikan acuan untuk ketiga gaya potongan tersebut, dengan penyesuaian kelonggaran spesifik saat konsultasi dengan fitter — sebutkan potongan yang Anda inginkan saat booking agar penyesuaian ini langsung diperhitungkan.',
      ],
    },
    {
      heading: 'Toleransi Ukuran dan Kapan Perlu Konsultasi Langsung',
      paragraphs: [
        'Setiap ukuran pada tabel di atas punya toleransi sekitar 2–3cm di setiap titik ukur untuk mengakomodasi variasi bentuk tubuh dalam rentang berat badan yang sama. Namun jika hasil pengukuran mandiri Anda berada di batas dua ukuran, atau Anda memiliki riwayat kesulitan menemukan ukuran pas di brand ready-to-wear manapun, konsultasi langsung dengan fitter Local Tailor akan menghasilkan Digital Body Profile yang jauh lebih akurat dibanding mengandalkan tabel saja.',
        'Toleransi ini bukan berarti hasil akhirnya "kira-kira" — justru sebaliknya, toleransi 2–3cm inilah yang memberi ruang bagi fitter untuk menyesuaikan kelonggaran sesuai preferensi Anda tanpa perlu mengganti ukuran dasar. Seseorang yang lebih menyukai thobe yang sedikit lebih longgar di dada tetap bisa memakai ukuran yang sama dengan seseorang yang menyukai potongan lebih rapi, selama perbedaan preferensi itu masih berada dalam rentang toleransi tersebut.',
      ],
    },
  ],
  sizeChart: SIZE_CHART_ROWS,
  faq: [
    {
      question: 'Ukuran thobe apa yang paling umum dipakai pria Indonesia?',
      answer:
        'Ukuran M dan L adalah yang paling umum, sesuai dengan rentang tinggi 165–178cm dan berat 60–89kg yang mewakili sebagian besar populasi pria dewasa di Indonesia.',
    },
    {
      question: 'Apakah size chart ini berlaku untuk semua jenis kain?',
      answer:
        'Size chart ini adalah acuan umum berdasarkan lingkar dada dan lebar bahu. Kain yang lebih tebal atau kaku bisa terasa sedikit lebih ketat dibanding kain yang ringan dan jatuh pada ukuran yang sama, jadi tetap konsultasikan jenis kain pilihan Anda saat booking pengukuran.',
    },
    {
      question: 'Bagaimana jika ukuran saya berada di antara dua size?',
      answer:
        'Pilih ukuran yang lebih besar sebagai estimasi awal, lalu konfirmasikan dengan fitter saat pengukuran langsung — lebih mudah menyesuaikan sedikit kelonggaran dibanding memperbaiki thobe yang terlalu sempit.',
    },
    {
      question: 'Apakah size chart thobe sama dengan size chart internasional S/M/L/XL?',
      answer:
        'Mirip secara label, tapi rentang ukurannya spesifik untuk potongan thobe yang lebih panjang dan menyeluruh, sehingga tidak bisa disamakan langsung dengan size chart kemeja atau kaos.',
    },
    {
      question: 'Apa langkah setelah menemukan ukuran saya di size chart?',
      answer:
        'Gunakan Body Profile Estimator untuk mendapat rekomendasi fit yang lebih personal, atau langsung booking Free Measurement agar fitter Local Tailor mengonfirmasi ukuran final sebelum thobe dijahit.',
    },
    {
      question: 'Apakah ada ukuran di bawah XS atau di atas XXL?',
      answer:
        'Untuk kebutuhan di luar rentang XS–XXL, Local Tailor tetap bisa mengakomodasi melalui pengukuran custom penuh oleh fitter — size chart standar adalah acuan untuk rentang ukuran paling umum, bukan batasan layanan kami.',
    },
  ],
  relatedSlugs: ['ukuran-thobe-pria', 'cara-mengukur-thobe', 'cek-ukuran-thobe'],
}

export const ALL_ARTICLES: ArticleContent[] = [
  cekUkuranThobeContent,
  ukuranThobePriaContent,
  caraMengukurThobeContent,
  sizeChartThobeContent,
]

export function getArticleBySlug(slug: string): ArticleContent | undefined {
  return ALL_ARTICLES.find((article) => article.slug === slug)
}
