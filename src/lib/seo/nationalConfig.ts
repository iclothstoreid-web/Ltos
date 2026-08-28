import {
  LOCATION_FAQ_ITEM,
  LOCATION_FAQ_ITEM_AR,
  LOCATION_FAQ_ITEM_EN,
  REVIEW_FAQ_ITEM,
  REVIEW_FAQ_ITEM_AR,
  REVIEW_FAQ_ITEM_EN,
  type ServiceConfig,
} from '@/lib/seo/serviceConfig'

// National SEO — Sprint (P0). The two Indonesia-wide commercial pillars.
//
// These are NOT re-skins of the 5 Bandung Revenue Landing Pages
// (serviceConfig.ts). Intent split:
//   /custom-thobe-indonesia  = transactional, national, remote buyer
//                              ("I'm not in Bandung — can I still order?")
//   /bespoke-tailor-indonesia = commercial/consideration, national
//                              ("who is a bespoke tailor that serves all
//                               of Indonesia?")
//   /jahit-thobe-bandung / /bespoke-tailor-bandung = LOCAL Bandung intent,
//                              unchanged, and cross-linked from here.
//
// They render through the SAME RevenueLandingPage.tsx component + the SAME
// schema/metadata builders as the local pages, keyed by `scope: 'national'`
// (serviceConfig.ts's ServiceConfig). No new rendering engine, no
// duplicated locale handling.
//
// Every factual claim below is drawn from already-published Local Tailor
// content — chiefly /knowledge/design-studio/bespoke-tanpa-harus-datang-ke-
// bandung: video-call fitting, Design Studio (Model/Kerah/Manset/Material/
// Warna), home visit, one Bandung workshop for production + QC, nationwide
// shipping. No branches, addresses, prices, turnaround guarantees, review
// counts, years, or coverage claims are invented here.

export const NATIONAL_CONFIGS: ServiceConfig[] = [
  // =====================================================================
  // custom-thobe-indonesia — national transactional pillar
  // =====================================================================
  {
    slug: 'custom-thobe-indonesia',
    garmentLabel: 'custom thobe',
    keywordPrimary: 'custom thobe indonesia',
    keywordSecondary: [
      'jahit thobe online',
      'pesan thobe custom online',
      'jasa jahit thobe indonesia',
      'thobe custom online',
      'custom thobe pria',
      'jahit thobe custom',
    ],
    scope: 'national',
    hero: {
      eyebrow: 'Custom Thobe Indonesia',
      headline: 'Custom Thobe Indonesia',
      subheadline:
        'Pesan thobe yang dijahit khusus untuk ukuran tubuh Anda dari kota mana pun di Indonesia. Konsultasi, pemilihan desain, dan panduan pengukuran dilakukan jarak jauh; produksi dan quality control tetap di satu workshop Local Tailor di Bandung, lalu garmen dikirim ke alamat Anda.',
      keywordPhrases: ['custom thobe indonesia', 'jahit thobe online', 'pesan thobe custom online', 'jasa jahit thobe indonesia'],
    },
    valueProps: [
      {
        title: 'Pola Dibentuk dari Ukuran Anda, Bukan Ukuran Standar',
        description:
          'Thobe custom di Local Tailor dibuat dari pola yang diformulasikan dari pengukuran tubuh Anda sendiri — bukan ukuran S/M/L/XL yang dipaksakan mendekati. Perbedaannya terasa pada cara garmen jatuh di bahu, dada, dan panjang.',
      },
      {
        title: 'Seluruh Proses Awal Bisa Dilakukan dari Rumah',
        description:
          'Video call fitting untuk konsultasi kebutuhan, Design Studio online untuk memilih Model, Kerah, Manset, Material, dan Warna, lalu panduan pengukuran terarah — semua bisa dijalankan tanpa datang ke Bandung terlebih dahulu.',
      },
      {
        title: 'Digital Body Profile Tersimpan untuk Pesanan Berikutnya',
        description:
          'Setelah pola dan ukuran Anda dikonfirmasi, keduanya tersimpan permanen. Pesanan thobe berikutnya tidak dimulai dari nol — Anda cukup memilih desain baru.',
      },
      {
        title: 'Satu Workshop, Bukan Marketplace Jahit',
        description:
          'Konsultasi, pola, produksi, hingga quality control berlangsung di satu workshop Local Tailor di Bandung — bukan dilempar ke penjahit lepas yang berbeda-beda tiap pesanan.',
      },
    ],
    nationalCoverage: {
      heading: 'Cara Memesan dari Luar Bandung',
      intro:
        'Local Tailor punya satu workshop fisik, di Bandung. Yang membuat pemesanan dari luar kota tetap memungkinkan adalah proses yang dipindahkan ke jarak jauh — bukan cabang di kota lain.',
      points: [
        {
          title: '1. Konsultasi via Video Call',
          description: 'Diskusi kebutuhan, acara, dan preferensi gaya bersama tim Local Tailor — gratis, terjadwal sesuai waktu Anda.',
        },
        {
          title: '2. Pilih Desain di Design Studio',
          description: 'Susun kombinasi Model, Kerah, Manset, Material, dan Warna secara online, lengkap dengan estimasi harga real-time.',
        },
        {
          title: '3. Panduan Pengukuran Terarah',
          description:
            'Anda diukur mengikuti panduan bertahap saat video call, atau melalui home visit untuk keluarga, pasangan, kebutuhan wedding, dan corporate.',
        },
        {
          title: '4. Produksi & Quality Control di Bandung',
          description: 'Pola dibuat, garmen dijahit, dan diperiksa di workshop yang sama seperti pesanan langsung.',
        },
        {
          title: '5. Pengiriman ke Alamat Anda',
          description: 'Setelah lolos quality control, thobe dikirim ke alamat Anda di seluruh Indonesia.',
        },
      ],
      bandungAnchorNote:
        'Jika Anda berada di Bandung atau sekitarnya dan lebih memilih datang langsung, halaman Jahit Thobe Bandung dan lokasi workshop Bandung menjelaskan opsi tatap muka.',
    },
    faq: [
      {
        question: 'Apakah bisa memesan custom thobe tanpa datang ke Bandung?',
        answer:
          'Bisa. Konsultasi, pemilihan desain, dan panduan pengukuran dilakukan melalui video call fitting dan Design Studio online. Pengukuran final dikonfirmasi saat video call terpandu atau melalui home visit, dan garmen dikirim setelah selesai.',
      },
      {
        question: 'Kota mana saja yang dilayani?',
        answer:
          'Pemesanan jarak jauh terbuka untuk pelanggan di seluruh Indonesia. Halaman lokasi menampilkan kota-kota yang sudah memiliki halaman layanan tersendiri; kota lain tetap bisa memesan dengan proses yang sama.',
      },
      {
        question: 'Bagaimana memastikan ukuran akurat kalau tidak diukur langsung di workshop?',
        answer:
          'Pengukuran dipandu langkah demi langkah oleh tim saat video call, atau diambil oleh tim saat home visit. Setelah pola dikonfirmasi, ukuran Anda tersimpan sebagai Digital Body Profile untuk pesanan berikutnya.',
      },
      {
        question: 'Berapa harga custom thobe?',
        answer:
          'Tidak ada daftar harga tetap karena setiap garmen dibuat sesuai pesanan (made-to-order). Harga tergantung material dan detail desain, dan dikonfirmasi saat konsultasi — Design Studio menampilkan estimasi saat Anda menyusun kombinasi.',
      },
      {
        question: 'Apa beda halaman ini dengan halaman Jahit Thobe Bandung?',
        answer:
          'Halaman ini untuk pemesanan dari kota mana pun di Indonesia lewat proses jarak jauh. Halaman Jahit Thobe Bandung ditujukan untuk pelanggan yang mencari tailor thobe di Bandung dan ingin datang langsung ke workshop.',
      },
      LOCATION_FAQ_ITEM,
      REVIEW_FAQ_ITEM,
    ],
    // Real out-of-Bandung customer (Jakarta) — a genuine remote-process
    // experience, not fabricated for this page.
    reviewHighlightIds: ['ahmad-jakarta-wedding'],
    relatedGuides: [
      { category: 'design-studio', slug: 'cara-pesan-custom-thobe-luar-kota' },
      { category: 'design-studio', slug: 'custom-thobe-online-panduan-lengkap' },
      { category: 'measurements', slug: 'how-to-measure-body' },
    ],
    whatsappMessage: 'Halo Local Tailor, saya ingin memesan custom thobe dari luar Bandung dan ingin tahu langkah-langkahnya.',
    ctaLabel: 'Konsultasi Pemesanan',
    translations: {
      en: {
        garmentLabel: 'custom thobe',
        keywordPrimary: 'custom thobe indonesia',
        keywordSecondary: ['order custom thobe online', 'custom thobe indonesia', 'made to order thobe indonesia', 'custom thobe tailor online'],
        hero: {
          eyebrow: 'Custom Thobe Indonesia',
          headline: 'Custom Thobe Indonesia',
          subheadline:
            'Order a thobe cut to your own measurements from any city in Indonesia. Consultation, design selection, and measurement guidance happen remotely; production and quality control stay at one Local Tailor workshop in Bandung, then the garment ships to your address.',
          keywordPhrases: ['custom thobe indonesia', 'order custom thobe online', 'made to order thobe indonesia'],
        },
        valueProps: [
          {
            title: 'A Pattern from Your Measurements, Not a Standard Size',
            description:
              "A custom thobe at Local Tailor is built from a pattern formulated from your own body measurements — not an S/M/L/XL forced to fit. You feel the difference in how it falls at the shoulder, chest, and length.",
          },
          {
            title: 'The Whole First Stage Can Be Done From Home',
            description:
              'A video-call fitting for the consultation, the online Design Studio for Model, Collar, Cuff, Fabric, and Colour, then guided measurement — all without visiting Bandung first.',
          },
          {
            title: 'Your Digital Body Profile Is Saved',
            description:
              'Once your pattern and measurements are confirmed, both are stored permanently. Your next thobe order never starts from zero — you just choose a new design.',
          },
          {
            title: 'One Workshop, Not a Sewing Marketplace',
            description:
              'Consultation, pattern, production, and quality control all happen at one Local Tailor workshop in Bandung — never handed to a different freelance tailor each order.',
          },
        ],
        nationalCoverage: {
          heading: 'How Ordering from Outside Bandung Works',
          intro:
            'Local Tailor has one physical workshop, in Bandung. What makes ordering from another city possible is a process moved to a distance — not a branch elsewhere.',
          points: [
            { title: '1. Video-Call Consultation', description: 'Discuss your needs, occasion, and style preferences with the Local Tailor team — free, scheduled to suit you.' },
            { title: '2. Choose a Design in the Design Studio', description: 'Build your combination of Model, Collar, Cuff, Fabric, and Colour online, with a live price estimate.' },
            { title: '3. Guided Measurement', description: 'You are measured step by step during the video call, or in person via a home visit for families, couples, weddings, and corporate needs.' },
            { title: '4. Production & Quality Control in Bandung', description: 'The pattern is drafted, the garment sewn, and it is inspected at the same workshop as an in-person order.' },
            { title: '5. Delivery to Your Address', description: 'Once it passes quality control, the thobe ships to your address anywhere in Indonesia.' },
          ],
          bandungAnchorNote:
            'If you are in or near Bandung and would rather come in person, the Jahit Thobe Bandung page and the Bandung location page cover the in-person options.',
        },
        faq: [
          {
            question: 'Can I order a custom thobe without coming to Bandung?',
            answer:
              'Yes. Consultation, design selection, and measurement guidance are done through a video-call fitting and the online Design Studio. The final measurement is confirmed during a guided video call or via a home visit, and the garment ships once finished.',
          },
          {
            question: 'Which cities do you serve?',
            answer:
              'Remote ordering is open to customers across Indonesia. The locations page lists the cities that already have their own service page; other cities can still order through the same process.',
          },
          {
            question: 'How is the measurement accurate if I am not measured at the workshop?',
            answer:
              'The measurement is guided step by step by the team during the video call, or taken by the team during a home visit. Once your pattern is confirmed, your measurements are saved as a Digital Body Profile for future orders.',
          },
          {
            question: 'How much does a custom thobe cost?',
            answer:
              'There is no fixed price list, since every garment is made to order. Price depends on the material and design detail and is confirmed at consultation — the Design Studio shows an estimate as you build your combination.',
          },
          {
            question: 'How is this page different from the Jahit Thobe Bandung page?',
            answer:
              'This page is for ordering from any city in Indonesia through the remote process. The Jahit Thobe Bandung page is for customers looking for a thobe tailor in Bandung who want to visit the workshop in person.',
          },
          LOCATION_FAQ_ITEM_EN,
          REVIEW_FAQ_ITEM_EN,
        ],
        whatsappMessage: 'Hello Local Tailor, I would like to order a custom thobe from outside Bandung and want to know the steps.',
        ctaLabel: 'Discuss Your Order',
      },
      ar: {
        garmentLabel: 'الثوب المخصص',
        keywordPrimary: 'ثوب مخصص إندونيسيا',
        keywordSecondary: ['طلب ثوب مخصص أونلاين', 'خياطة ثوب مخصص إندونيسيا', 'ثوب حسب الطلب إندونيسيا'],
        hero: {
          eyebrow: 'ثوب مخصص في إندونيسيا',
          headline: 'ثوب مخصص في إندونيسيا',
          subheadline:
            'اطلب ثوبًا مُفصَّلًا على قياساتك من أي مدينة في إندونيسيا. تتم الاستشارة واختيار التصميم وإرشاد القياس عن بُعد؛ بينما يبقى الإنتاج ومراقبة الجودة في ورشة Local Tailor الوحيدة في باندونغ، ثم تُشحن القطعة إلى عنوانك.',
          keywordPhrases: ['ثوب مخصص إندونيسيا', 'طلب ثوب مخصص أونلاين', 'ثوب حسب الطلب إندونيسيا'],
        },
        valueProps: [
          {
            title: 'نمط من قياساتك، وليس مقاسًا قياسيًا',
            description:
              'الثوب المخصص لدى Local Tailor يُبنى من نمط مُصاغ من قياسات جسمك — وليس مقاس S/M/L/XL يُفرض ليقترب من مقاسك. تشعر بالفرق في سقوط القطعة عند الكتف والصدر والطول.',
          },
          {
            title: 'يمكن إنجاز المرحلة الأولى بالكامل من المنزل',
            description:
              'مكالمة فيديو للاستشارة، واستوديو التصميم أونلاين لاختيار الموديل والياقة والكم والقماش واللون، ثم إرشاد للقياس — كل ذلك دون زيارة باندونغ أولًا.',
          },
          {
            title: 'ملفك الشخصي الرقمي محفوظ',
            description: 'بمجرد تأكيد نمطك وقياساتك، يُحفظان بشكل دائم. طلبك القادم لا يبدأ من الصفر — تختار تصميمًا جديدًا فقط.',
          },
          {
            title: 'ورشة واحدة، وليست سوق خياطة',
            description:
              'تجري الاستشارة والنمط والإنتاج ومراقبة الجودة كلها في ورشة Local Tailor واحدة في باندونغ — ولا تُسلَّم لخياط مستقل مختلف في كل طلب.',
          },
        ],
        nationalCoverage: {
          heading: 'كيف يعمل الطلب من خارج باندونغ',
          intro:
            'لدى Local Tailor ورشة فعلية واحدة، في باندونغ. ما يجعل الطلب من مدينة أخرى ممكنًا هو عملية نُقلت إلى البُعد — وليس فرعًا في مكان آخر.',
          points: [
            { title: '1. استشارة عبر مكالمة فيديو', description: 'ناقش احتياجاتك والمناسبة وتفضيلاتك في الأسلوب مع فريق Local Tailor — مجانًا وفي وقت يناسبك.' },
            { title: '2. اختر تصميمًا في استوديو التصميم', description: 'كوّن تركيبتك من الموديل والياقة والكم والقماش واللون أونلاين، مع تقدير سعر مباشر.' },
            { title: '3. إرشاد للقياس', description: 'يتم قياسك خطوة بخطوة أثناء مكالمة الفيديو، أو حضوريًا عبر زيارة منزلية للعائلات والأزواج ومناسبات الزفاف واحتياجات الشركات.' },
            { title: '4. الإنتاج ومراقبة الجودة في باندونغ', description: 'يُصمَّم النمط وتُخاط القطعة وتُفحص في الورشة نفسها كأي طلب حضوري.' },
            { title: '5. التوصيل إلى عنوانك', description: 'بعد اجتياز مراقبة الجودة، يُشحن الثوب إلى عنوانك في أي مكان في إندونيسيا.' },
          ],
          bandungAnchorNote: 'إذا كنت في باندونغ أو قربها وتفضل الحضور شخصيًا، تشرح صفحة خياطة ثوب باندونغ وصفحة موقع باندونغ الخيارات الحضورية.',
        },
        faq: [
          {
            question: 'هل يمكنني طلب ثوب مخصص دون القدوم إلى باندونغ؟',
            answer:
              'نعم. تتم الاستشارة واختيار التصميم وإرشاد القياس عبر مكالمة فيديو واستوديو التصميم أونلاين. يُؤكَّد القياس النهائي أثناء مكالمة فيديو موجَّهة أو عبر زيارة منزلية، وتُشحن القطعة بعد اكتمالها.',
          },
          {
            question: 'ما المدن التي تخدمونها؟',
            answer:
              'الطلب عن بُعد متاح للعملاء في جميع أنحاء إندونيسيا. تعرض صفحة المواقع المدن التي لها صفحة خدمة خاصة؛ ويمكن للمدن الأخرى الطلب عبر العملية نفسها.',
          },
          {
            question: 'كيف يكون القياس دقيقًا إن لم يتم في الورشة؟',
            answer:
              'يُوجَّه القياس خطوة بخطوة من الفريق أثناء مكالمة الفيديو، أو يأخذه الفريق أثناء الزيارة المنزلية. بعد تأكيد النمط، تُحفظ قياساتك كملف شخصي رقمي للطلبات المستقبلية.',
          },
          {
            question: 'كم يكلف الثوب المخصص؟',
            answer:
              'لا توجد قائمة أسعار ثابتة لأن كل قطعة تُصنع حسب الطلب. يعتمد السعر على القماش وتفاصيل التصميم ويُؤكَّد أثناء الاستشارة — ويعرض استوديو التصميم تقديرًا أثناء تكوين تركيبتك.',
          },
          {
            question: 'ما الفرق بين هذه الصفحة وصفحة خياطة ثوب باندونغ؟',
            answer:
              'هذه الصفحة للطلب من أي مدينة في إندونيسيا عبر العملية عن بُعد. صفحة خياطة ثوب باندونغ للعملاء الباحثين عن خياط ثوب في باندونغ ويريدون زيارة الورشة شخصيًا.',
          },
          LOCATION_FAQ_ITEM_AR,
          REVIEW_FAQ_ITEM_AR,
        ],
        whatsappMessage: 'مرحبًا Local Tailor، أرغب في طلب ثوب مخصص من خارج باندونغ وأريد معرفة الخطوات.',
        ctaLabel: 'ناقش طلبك',
      },
    },
  },

  // =====================================================================
  // bespoke-tailor-indonesia — national commercial/consideration pillar
  // =====================================================================
  {
    slug: 'bespoke-tailor-indonesia',
    garmentLabel: 'bespoke tailoring',
    keywordPrimary: 'bespoke tailor indonesia',
    keywordSecondary: [
      'tailor pria indonesia',
      'tailor pria muslim indonesia',
      'penjahit premium indonesia',
      'bespoke thobe indonesia',
      'premium tailor indonesia',
      'bespoke tailoring indonesia',
    ],
    scope: 'national',
    hero: {
      eyebrow: 'Bespoke Tailor Indonesia',
      headline: 'Bespoke Tailor Indonesia',
      subheadline:
        'Bespoke tailor untuk busana pria muslim — thobe dan baju koko — dengan pola yang dibentuk dari nol untuk tubuh Anda. Satu atelier di Bandung, melayani pelanggan di seluruh Indonesia melalui proses konsultasi dan desain jarak jauh.',
      keywordPhrases: ['bespoke tailor indonesia', 'tailor pria muslim indonesia', 'penjahit premium indonesia', 'bespoke thobe indonesia'],
    },
    valueProps: [
      {
        title: 'Bespoke, Bukan Made-to-Measure',
        description:
          'Tailor made-to-measure menyesuaikan (grading) pola template ke ukuran Anda. Local Tailor memformulasikan pola personal dari nol berdasarkan proporsi tubuh Anda — tanpa template dasar sama sekali.',
      },
      {
        title: 'Fitter, Bukan Sekadar Form Ukuran',
        description:
          'Pengukuran dipandu langsung oleh fitter — via video call terarah atau home visit — bukan formulir isian mandiri. Pola dibuat setelah ukuran dikonfirmasi.',
      },
      {
        title: 'Material Impor dan Finishing Tangan',
        description:
          'Pilihan material mencakup katun premium, linen, dan wool-silk blend impor. Detail finishing dikerjakan tangan dan melewati quality control sebelum dikirim.',
      },
      {
        title: 'Satu Atelier, Cakupan Nasional',
        description:
          'Konsultasi, pola, produksi, dan quality control terpusat di satu workshop Bandung. Pelanggan dari kota lain mengakses proses yang sama lewat Design Studio dan video call — bukan penjahit berbeda per kota.',
      },
    ],
    nationalCoverage: {
      heading: 'Atelier Bandung, Layanan Seluruh Indonesia',
      intro:
        'Bespoke tailoring secara tradisional mengharuskan pelanggan datang berkali-kali. Local Tailor memindahkan tahap konsultasi dan desain ke jarak jauh sehingga pelanggan di luar Bandung tetap mendapat proses bespoke yang sama.',
      points: [
        {
          title: 'Konsultasi & Desain Jarak Jauh',
          description: 'Video call fitting gratis untuk konsultasi dan panduan, Design Studio online untuk menyusun Model, Kerah, Manset, Material, dan Warna.',
        },
        {
          title: 'Pengukuran oleh Fitter',
          description: 'Pengukuran final dipandu fitter saat video call atau diambil saat home visit untuk keluarga, pasangan, wedding, dan corporate.',
        },
        {
          title: 'Produksi Terpusat',
          description: 'Pola dibuat dan garmen dijahit di workshop Bandung yang sama seperti pesanan tatap muka, dengan quality control penuh.',
        },
        {
          title: 'Pengiriman Nasional',
          description: 'Garmen yang selesai dikirim ke alamat pelanggan di seluruh Indonesia.',
        },
      ],
      bandungAnchorNote:
        'Pencarian lokal seperti "bespoke tailor bandung" atau "tailor premium bandung" diarahkan ke halaman Bandung masing-masing, yang menjelaskan opsi datang langsung ke workshop.',
    },
    faq: [
      {
        question: 'Apa arti "bespoke" di Local Tailor?',
        answer:
          'Bespoke berarti pola dibuat dari nol khusus untuk proporsi tubuh Anda, tanpa template dasar. Ini berbeda dari made-to-measure yang menyesuaikan pola template yang sudah ada ke ukuran Anda.',
      },
      {
        question: 'Apakah Local Tailor punya cabang di luar Bandung?',
        answer:
          'Tidak. Ada satu workshop fisik, di Bandung. Pelanggan di kota lain dilayani melalui konsultasi video call, Design Studio online, dan home visit — bukan melalui cabang.',
      },
      {
        question: 'Bagaimana bespoke bisa dilakukan jarak jauh?',
        answer:
          'Konsultasi, pemilihan desain, dan panduan pengukuran dipindahkan ke video call dan Design Studio. Pengukuran final dikonfirmasi oleh fitter saat video call terpandu atau home visit, lalu pola dibuat dan garmen diproduksi di Bandung.',
      },
      {
        question: 'Apa beda halaman ini dengan Bespoke Tailor Bandung dan Tailor Premium Bandung?',
        answer:
          'Halaman ini untuk pencarian nasional — bespoke tailor yang melayani seluruh Indonesia. Bespoke Tailor Bandung ditujukan untuk pencarian "bespoke tailor bandung", dan Tailor Premium Bandung untuk pencarian premium/material yang berbasis di Bandung.',
      },
      {
        question: 'Apakah harga bespoke lebih mahal dari penjahit biasa?',
        answer:
          'Tidak ada daftar harga tetap karena setiap garmen dibuat sesuai pesanan. Harga tergantung material dan detail desain, dikonfirmasi saat konsultasi, bukan dipatok di muka.',
      },
      LOCATION_FAQ_ITEM,
      REVIEW_FAQ_ITEM,
    ],
    // Real out-of-Bandung customer (Surabaya) — a genuine remote bespoke
    // experience.
    reviewHighlightIds: ['rizky-surabaya-daily-wear'],
    relatedGuides: [
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'tailoring', slug: 'bespoke-vs-made-to-measure' },
      { category: 'design-studio', slug: 'bespoke-tanpa-harus-datang-ke-bandung' },
    ],
    whatsappMessage: 'Halo Local Tailor, saya ingin konsultasi bespoke tailoring dan memesan dari luar Bandung.',
    ctaLabel: 'Konsultasi Bespoke',
    translations: {
      en: {
        garmentLabel: 'bespoke tailoring',
        keywordPrimary: 'bespoke tailor indonesia',
        keywordSecondary: ['bespoke tailor indonesia', 'bespoke tailoring indonesia', 'muslim menswear tailor indonesia', 'bespoke thobe indonesia'],
        hero: {
          eyebrow: 'Bespoke Tailor Indonesia',
          headline: 'Bespoke Tailor Indonesia',
          subheadline:
            "A bespoke tailor for Muslim menswear — thobe and baju koko — with a pattern built from scratch for your body. One atelier in Bandung, serving customers across Indonesia through a remote consultation and design process.",
          keywordPhrases: ['bespoke tailor indonesia', 'bespoke tailoring indonesia', 'bespoke thobe indonesia'],
        },
        valueProps: [
          {
            title: 'Bespoke, Not Made-to-Measure',
            description:
              'A made-to-measure tailor grades a template pattern to your size. Local Tailor formulates a personal pattern from scratch based on your body proportions — with no template underneath at all.',
          },
          {
            title: 'A Fitter, Not Just a Measurement Form',
            description:
              'Measurement is guided directly by a fitter — via a guided video call or a home visit — not a self-entry form. The pattern is drafted after your measurements are confirmed.',
          },
          {
            title: 'Imported Fabric and Hand Finishing',
            description:
              'Fabric options include premium cotton, linen, and imported wool-silk blends. Finishing detail is done by hand and passes quality control before dispatch.',
          },
          {
            title: 'One Atelier, National Reach',
            description:
              'Consultation, pattern, production, and quality control are centralised at one Bandung workshop. Customers in other cities use the same process through the Design Studio and video calls — not a different tailor per city.',
          },
        ],
        nationalCoverage: {
          heading: 'A Bandung Atelier, Serving All of Indonesia',
          intro:
            'Bespoke tailoring traditionally requires several visits. Local Tailor moves the consultation and design stages to a distance so customers outside Bandung still get the same bespoke process.',
          points: [
            { title: 'Remote Consultation & Design', description: 'A free video-call fitting for consultation and guidance, the online Design Studio to build Model, Collar, Cuff, Fabric, and Colour.' },
            { title: 'Measurement by a Fitter', description: 'The final measurement is guided by a fitter on the video call or taken during a home visit for families, couples, weddings, and corporate needs.' },
            { title: 'Centralised Production', description: 'The pattern is drafted and the garment sewn at the same Bandung workshop as an in-person order, with full quality control.' },
            { title: 'Nationwide Delivery', description: 'The finished garment ships to the customer’s address anywhere in Indonesia.' },
          ],
          bandungAnchorNote:
            'Local searches like "bespoke tailor bandung" or "premium tailor bandung" are directed to their own Bandung pages, which cover coming to the workshop in person.',
        },
        faq: [
          {
            question: 'What does "bespoke" mean at Local Tailor?',
            answer:
              'Bespoke means the pattern is built from scratch specifically for your body proportions, with no template underneath. That is different from made-to-measure, which adjusts an existing template pattern to your size.',
          },
          {
            question: 'Does Local Tailor have branches outside Bandung?',
            answer:
              'No. There is one physical workshop, in Bandung. Customers in other cities are served through video-call consultations, the online Design Studio, and home visits — not through branches.',
          },
          {
            question: 'How can bespoke be done remotely?',
            answer:
              'Consultation, design selection, and measurement guidance move to video calls and the Design Studio. The final measurement is confirmed by a fitter during a guided video call or home visit, then the pattern is drafted and the garment produced in Bandung.',
          },
          {
            question: 'How is this different from the Bespoke Tailor Bandung and Premium Tailor Bandung pages?',
            answer:
              'This page is for national searches — a bespoke tailor serving all of Indonesia. Bespoke Tailor Bandung targets the "bespoke tailor bandung" search, and Premium Tailor Bandung targets premium/material searches based in Bandung.',
          },
          {
            question: 'Is bespoke more expensive than a regular tailor?',
            answer:
              'There is no fixed price list, since every garment is made to order. Price depends on material and design detail, confirmed at consultation rather than set upfront.',
          },
          LOCATION_FAQ_ITEM_EN,
          REVIEW_FAQ_ITEM_EN,
        ],
        whatsappMessage: 'Hello Local Tailor, I would like a bespoke tailoring consultation and to order from outside Bandung.',
        ctaLabel: 'Bespoke Consultation',
      },
      ar: {
        garmentLabel: 'الخياطة حسب الطلب',
        keywordPrimary: 'خياط بيسبوك إندونيسيا',
        keywordSecondary: ['خياط بيسبوك إندونيسيا', 'خياطة بيسبوك إندونيسيا', 'خياط ملابس رجالية إسلامية إندونيسيا'],
        hero: {
          eyebrow: 'خياط بيسبوك في إندونيسيا',
          headline: 'خياط بيسبوك في إندونيسيا',
          subheadline:
            'خياط بيسبوك للملابس الرجالية الإسلامية — الثوب والقميص الإسلامي — بنمط يُبنى من الصفر لجسمك. أتيليه واحد في باندونغ، يخدم العملاء في جميع أنحاء إندونيسيا عبر عملية استشارة وتصميم عن بُعد.',
          keywordPhrases: ['خياط بيسبوك إندونيسيا', 'خياطة بيسبوك إندونيسيا'],
        },
        valueProps: [
          {
            title: 'بيسبوك، وليس تفصيلًا على قالب جاهز',
            description:
              'الخياط حسب الطلب العادي يُدرّج نمطًا جاهزًا على مقاسك. أما Local Tailor فيصوغ نمطًا شخصيًا من الصفر بناءً على نسب جسمك — دون أي قالب أساسي على الإطلاق.',
          },
          {
            title: 'خبير قياس، وليس مجرد نموذج قياسات',
            description:
              'يُوجَّه القياس مباشرة من قبل خبير قياس — عبر مكالمة فيديو موجَّهة أو زيارة منزلية — وليس نموذجًا تملؤه بنفسك. يُصمَّم النمط بعد تأكيد قياساتك.',
          },
          {
            title: 'أقمشة مستوردة وتشطيب يدوي',
            description: 'تشمل خيارات القماش القطن الفاخر والكتان ومزيج الصوف والحرير المستورد. تفاصيل التشطيب تُنفَّذ يدويًا وتمر بمراقبة الجودة قبل الشحن.',
          },
          {
            title: 'أتيليه واحد، تغطية وطنية',
            description:
              'تتمركز الاستشارة والنمط والإنتاج ومراقبة الجودة في ورشة باندونغ واحدة. يستخدم العملاء في المدن الأخرى العملية نفسها عبر استوديو التصميم ومكالمات الفيديو — وليس خياطًا مختلفًا لكل مدينة.',
          },
        ],
        nationalCoverage: {
          heading: 'أتيليه في باندونغ، يخدم إندونيسيا كلها',
          intro:
            'تتطلب الخياطة حسب الطلب تقليديًا عدة زيارات. ينقل Local Tailor مرحلتي الاستشارة والتصميم إلى البُعد بحيث يحصل العملاء خارج باندونغ على عملية البيسبوك نفسها.',
          points: [
            { title: 'استشارة وتصميم عن بُعد', description: 'مكالمة فيديو مجانية للاستشارة والإرشاد، واستوديو التصميم أونلاين لتكوين الموديل والياقة والكم والقماش واللون.' },
            { title: 'قياس بواسطة خبير قياس', description: 'يُوجَّه القياس النهائي من خبير قياس أثناء مكالمة الفيديو أو يُؤخذ خلال زيارة منزلية للعائلات والأزواج ومناسبات الزفاف واحتياجات الشركات.' },
            { title: 'إنتاج مركزي', description: 'يُصمَّم النمط وتُخاط القطعة في ورشة باندونغ نفسها كأي طلب حضوري، مع مراقبة جودة كاملة.' },
            { title: 'توصيل وطني', description: 'تُشحن القطعة المكتملة إلى عنوان العميل في أي مكان في إندونيسيا.' },
          ],
          bandungAnchorNote:
            'عمليات البحث المحلية مثل "خياط بيسبوك باندونغ" أو "خياط فاخر باندونغ" تُوجَّه إلى صفحات باندونغ الخاصة بها، والتي تشرح الحضور إلى الورشة شخصيًا.',
        },
        faq: [
          {
            question: 'ماذا تعني "بيسبوك" لدى Local Tailor؟',
            answer:
              'تعني أن النمط يُبنى من الصفر خصيصًا لنسب جسمك، دون قالب أساسي. وهذا يختلف عن التفصيل حسب الطلب الذي يُعدّل نمطًا جاهزًا على مقاسك.',
          },
          {
            question: 'هل لدى Local Tailor فروع خارج باندونغ؟',
            answer:
              'لا. توجد ورشة فعلية واحدة، في باندونغ. يُخدَم العملاء في المدن الأخرى عبر استشارات مكالمات الفيديو واستوديو التصميم أونلاين والزيارات المنزلية — وليس عبر فروع.',
          },
          {
            question: 'كيف يمكن إجراء البيسبوك عن بُعد؟',
            answer:
              'تنتقل الاستشارة واختيار التصميم وإرشاد القياس إلى مكالمات الفيديو واستوديو التصميم. يُؤكِّد خبير القياس القياس النهائي أثناء مكالمة فيديو موجَّهة أو زيارة منزلية، ثم يُصمَّم النمط وتُنتَج القطعة في باندونغ.',
          },
          {
            question: 'ما الفرق بين هذه الصفحة وصفحتَي خياط بيسبوك باندونغ وخياط فاخر باندونغ؟',
            answer:
              'هذه الصفحة لعمليات البحث الوطنية — خياط بيسبوك يخدم إندونيسيا كلها. تستهدف صفحة خياط بيسبوك باندونغ بحث "خياط بيسبوك باندونغ"، وتستهدف صفحة خياط فاخر باندونغ عمليات البحث الفاخرة/المتعلقة بالأقمشة في باندونغ.',
          },
          {
            question: 'هل البيسبوك أغلى من الخياط العادي؟',
            answer: 'لا توجد قائمة أسعار ثابتة لأن كل قطعة تُصنع حسب الطلب. يعتمد السعر على القماش وتفاصيل التصميم، ويُؤكَّد أثناء الاستشارة وليس مسبقًا.',
          },
          LOCATION_FAQ_ITEM_AR,
          REVIEW_FAQ_ITEM_AR,
        ],
        whatsappMessage: 'مرحبًا Local Tailor، أرغب في استشارة خياطة بيسبوك والطلب من خارج باندونغ.',
        ctaLabel: 'استشارة بيسبوك',
      },
    },
  },
]

export function getNationalBySlug(slug: string): ServiceConfig | undefined {
  return NATIONAL_CONFIGS.find((entry) => entry.slug === slug)
}

export function getAllNationalSlugs(): string[] {
  return NATIONAL_CONFIGS.map((entry) => entry.slug)
}
