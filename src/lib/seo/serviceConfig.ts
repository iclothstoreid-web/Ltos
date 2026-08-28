import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'

// Sprint W10 — Organic Acquisition Engine. Revenue Landing Pages, one per
// Ready-to-Buy commercial keyword (see docs/seo/SEO_KEYWORD_MAP.md §A).
// Deliberately modeled on src/lib/seo/cityConfig.ts's proven config-driven
// pattern (one config array, thin per-page components, zero copy-paste
// between entries) rather than inventing a new architecture.
//
// Keyword-cannibalization note: /locations/bandung already targets "tailor
// bandung" as its own primary keyword, with "bespoke tailor bandung" /
// "jahit thobe bandung" / "custom baju koko bandung" appearing among its
// *secondary* keywordPhrases (see cityConfig.ts's BANDUNG entry). Each
// config below is deliberately NOT a re-skin of that page: /locations/
// bandung is the geographic/location-hub page (address, parking,
// neighborhoods, opening hours); these pages are commercial-intent pages
// (why bespoke vs MTM, why premium, why this specific garment type),
// cross-linking to /locations/bandung for location detail rather than
// duplicating it. Each page's `keywordPrimary` below is unique sitewide —
// no other page (existing or new) targets the exact same primary phrase.
export const SERVICE_SITE_ORIGIN = FABRIC_SITE_ORIGIN

export interface ServiceFaqItem {
  question: string
  answer: string
}

export interface ServiceHeroConfig {
  eyebrow: string
  headline: string
  subheadline: string
  keywordPhrases: string[]
}

export interface ServiceValueProp {
  title: string
  description: string
}

// National-pillar-only section ("Layanan di Seluruh Indonesia") — how the
// one Bandung workshop serves customers nationwide, using only the
// already-verified remote model (see
// /knowledge/design-studio/bespoke-tanpa-harus-datang-ke-bandung).
export interface ServiceNationalCoverage {
  heading: string
  intro: string
  points: ServiceValueProp[]
  /** Honest "the workshop is physically in Bandung" anchor — never a branch claim. */
  bandungAnchorNote: string
}

// Sprint W11.5 Task 8 — English + Arabic localization for the 5 Revenue
// Landing Pages, per the brief's explicit "English and Arabic first" scope
// (fr/ja/de are out of scope for these commercial-intent pages this
// sprint). Everything translation-shaped a page renders lives here, keyed
// by locale — garmentLabel/keywordPrimary/keywordSecondary/hero/valueProps/
// faq/whatsappMessage/ctaLabel — same fields as ServiceConfig itself, so
// localizeService() below can shallow-merge a translation straight over
// the Indonesian base without RevenueLandingPage.tsx or any of its child
// components needing to know locale exists.
export interface ServiceTranslation {
  garmentLabel: string
  keywordPrimary: string
  keywordSecondary: string[]
  hero: ServiceHeroConfig
  valueProps: ServiceValueProp[]
  faq: ServiceFaqItem[]
  whatsappMessage: string
  ctaLabel: string
  /** National pillars only — localized coverage section. */
  nationalCoverage?: ServiceNationalCoverage
}

export interface ServiceConfig {
  slug: string
  /** Human-readable garment/positioning focus, used in copy ("thobe", "baju koko", "garmen umroh"). */
  garmentLabel: string
  keywordPrimary: string
  keywordSecondary: string[]
  hero: ServiceHeroConfig
  /** "Why this, specifically" — 3-4 differentiated reasons, never copy-pasted between pages. */
  valueProps: ServiceValueProp[]
  faq: ServiceFaqItem[]
  /** ids into reviewsCopy.reviews — only real matches, never fabricated per-page testimonials. */
  reviewHighlightIds: string[]
  relatedGuides: { category: string; slug: string }[]
  whatsappMessage: string
  ctaLabel: string
  /**
   * 'local' (default) — the 5 Bandung Revenue Landing Pages: `-bandung`
   *   slug + H1, Bandung geo meta, city-scoped areaServed + related links.
   * 'national' — the Indonesia-wide commercial pillars
   *   (/custom-thobe-indonesia, /bespoke-tailor-indonesia): country-level
   *   areaServed, no city geo meta, an extra ServiceNationalCoverage
   *   section, and related links that point down to the local pages +
   *   /locations rather than sideways to Bandung siblings.
   * There is exactly one physical workshop (Bandung) either way — `scope`
   * only changes how the *search intent* is framed, never the business
   * identity.
   */
  scope?: 'local' | 'national'
  /** Required when scope === 'national'. */
  nationalCoverage?: ServiceNationalCoverage
  /** en/ar full-page translations (Task 8 scope). Indonesian (the base fields above) is always the fallback. */
  translations?: Partial<Record<'en' | 'ar', ServiceTranslation>>
}

// Locale-aware accessor — returns `service` unchanged for 'id' or any
// locale without a translation entry (fr/ja/de today), or the base fields
// shallow-merged with that locale's translation otherwise. Callers
// (RevenueLandingPage.tsx) read this instead of the raw SERVICE_CONFIGS
// entry, so every child component keeps working off one ServiceConfig
// shape regardless of locale.
export function localizeService(service: ServiceConfig, locale: string): ServiceConfig {
  const translation = locale === 'en' || locale === 'ar' ? service.translations?.[locale] : undefined
  if (!translation) return service
  return { ...service, ...translation }
}

// Exported so the national pillars (nationalConfig.ts) reuse the exact
// same verified location/review FAQ answers rather than re-authoring them.
export const REVIEW_FAQ_ITEM: ServiceFaqItem = {
  question: 'Bagaimana cara memberi ulasan setelah pesanan selesai?',
  answer:
    'Setelah garmen Anda selesai, kami akan mengirimkan tautan Google Review via WhatsApp — ulasan Anda membantu klien lain menemukan Local Tailor dan hanya membutuhkan waktu singkat untuk ditulis.',
}

export const LOCATION_FAQ_ITEM: ServiceFaqItem = {
  question: 'Di mana lokasi workshop untuk konsultasi tatap muka?',
  answer:
    'Workshop dan showroom kami berada di Bandung, Jawa Barat — satu-satunya lokasi fisik Local Tailor, tempat konsultasi, pengukuran, dan produksi berlangsung. Detail lengkap lokasi dan area yang kami layani ada di halaman lokasi Bandung.',
}

export const REVIEW_FAQ_ITEM_EN: ServiceFaqItem = {
  question: 'How can I leave a review after my order is finished?',
  answer:
    "Once your garment is complete, we'll send you a Google Review link via WhatsApp — your review helps other clients find Local Tailor and only takes a moment to write.",
}

export const LOCATION_FAQ_ITEM_EN: ServiceFaqItem = {
  question: 'Where is the workshop for an in-person consultation?',
  answer:
    "Our workshop and showroom are in Bandung, West Java — Local Tailor's only physical location, where consultation, measurement, and production all take place. Full location details and the areas we serve are on the Bandung location page.",
}

export const REVIEW_FAQ_ITEM_AR: ServiceFaqItem = {
  question: 'كيف يمكنني كتابة تقييم بعد اكتمال طلبي؟',
  answer: 'بمجرد اكتمال قطعتك، سنرسل لك رابط تقييم Google عبر واتساب — تقييمك يساعد عملاء آخرين على إيجاد Local Tailor ولا يستغرق سوى لحظات لكتابته.',
}

export const LOCATION_FAQ_ITEM_AR: ServiceFaqItem = {
  question: 'أين تقع الورشة لإجراء استشارة حضورية؟',
  answer:
    'تقع ورشتنا وصالة العرض في باندونغ، جاوة الغربية — وهي الموقع الفعلي الوحيد لـ Local Tailor، حيث تجري الاستشارة والقياس والإنتاج. التفاصيل الكاملة للموقع والمناطق التي نخدمها متوفرة في صفحة موقع باندونغ.',
}

export const SERVICE_CONFIGS: ServiceConfig[] = [
  // -----------------------------------------------------------------------
  // bespoke-tailor-bandung — the category-definition page: what makes a
  // tailor genuinely "bespoke" (pattern from zero, not template-adjusted),
  // as distinct from the location-hub page's broader "here's our workshop"
  // framing.
  // -----------------------------------------------------------------------
  {
    slug: 'bespoke-tailor-bandung',
    garmentLabel: 'thobe dan baju koko',
    keywordPrimary: 'bespoke tailor bandung',
    keywordSecondary: ['bespoke tailoring bandung', 'tailor bespoke bandung', 'jasa bespoke tailor bandung'],
    hero: {
      eyebrow: 'Bespoke Tailor Bandung',
      headline: 'Bespoke Tailor Bandung — Pola Personal dari Nol, Bukan Ukuran Template',
      subheadline:
        'Sebagai bespoke tailor Bandung, kami tidak menyesuaikan pola template ke ukuran Anda — setiap pola diformulasikan dari nol berdasarkan pengukuran tubuh Anda sendiri, sebelum kain dipotong.',
      keywordPhrases: ['bespoke tailor bandung', 'bespoke tailoring bandung', 'tailor bespoke bandung', 'penjahit bespoke bandung'],
    },
    valueProps: [
      {
        title: 'Pola Dari Nol, Bukan Grading Template',
        description:
          'Tailor made-to-measure biasa menyesuaikan (grading) pola template ke ukuran Anda. Bespoke tailor memformulasikan pola personal dari nol — perbedaan konstruksi yang terasa langsung di cara garmen jatuh di tubuh.',
      },
      {
        title: 'Konsultasi dan Pengukuran Langsung oleh Fitter',
        description: 'Bukan pengukuran mandiri atau estimasi — fitter kami mengukur langsung di workshop sebelum pola dibuat.',
      },
      {
        title: 'Digital Body Profile Tersimpan',
        description: 'Pola dan ukuran Anda tersimpan permanen — pemesanan berikutnya tidak dimulai dari nol lagi.',
      },
      {
        title: 'Satu Workshop, Bukan Rantai Produksi Massal',
        description: 'Konsultasi, pengukuran, pola, produksi, hingga quality control berlangsung di satu tempat yang sama.',
      },
    ],
    faq: [
      {
        question: 'Apa bedanya bespoke tailor dengan tailor made-to-measure biasa?',
        answer:
          'Made-to-measure menyesuaikan pola template yang sudah ada ke ukuran Anda. Bespoke berarti pola dibuat dari nol, khusus untuk proporsi tubuh Anda — tanpa template dasar sama sekali.',
      },
      {
        question: 'Berapa lama proses bespoke tailoring di Bandung ini?',
        answer:
          'Tergantung material dan kompleksitas desain yang dipilih — estimasi waktu produksi ditampilkan langsung saat Anda menjelajahi kombinasi desain di Design Studio.',
      },
      {
        question: 'Apakah saya wajib datang langsung untuk pengukuran bespoke?',
        answer:
          'Pengukuran final tetap dilakukan langsung oleh fitter di workshop Bandung untuk memastikan Digital Body Profile Anda akurat. Konsultasi awal dan pemilihan desain bisa dimulai online lebih dulu.',
      },
      {
        question: 'Apakah harga bespoke tailor lebih mahal dari penjahit biasa?',
        answer:
          'Tidak ada daftar harga tetap karena setiap garmen dibuat sesuai pesanan (made-to-order) — harga tergantung material dan detail desain, dikonfirmasi saat konsultasi, bukan dipatok di muka.',
      },
      LOCATION_FAQ_ITEM,
      REVIEW_FAQ_ITEM,
    ],
    reviewHighlightIds: ['yusuf-bandung-umrah'],
    relatedGuides: [
      { category: 'bandung', slug: 'bespoke-tailor' },
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'tailoring', slug: 'quality-control' },
    ],
    whatsappMessage: 'Halo Local Tailor, saya ingin booking konsultasi bespoke tailoring di workshop Bandung.',
    ctaLabel: 'Booking Konsultasi Bespoke',
    translations: {
      en: {
        garmentLabel: 'thobe and baju koko',
        keywordPrimary: 'bespoke tailor bandung',
        keywordSecondary: ['bespoke tailoring bandung', 'bespoke tailor near me bandung', 'custom thobe tailor bandung'],
        hero: {
          eyebrow: 'Bespoke Tailor Bandung',
          headline: 'Bespoke Tailor Bandung — A Personal Pattern from Scratch, Not a Template Size',
          subheadline:
            'As a bespoke tailor in Bandung, we never adjust a template pattern to your size — every pattern is formulated from scratch based on your own body measurements, before a single piece of fabric is cut.',
          keywordPhrases: ['bespoke tailor bandung', 'bespoke tailoring bandung', 'custom thobe tailor bandung', 'bespoke tailor near me'],
        },
        valueProps: [
          {
            title: 'A Pattern from Scratch, Not a Graded Template',
            description:
              'A regular made-to-measure tailor grades an existing template pattern to your size. A bespoke tailor formulates a personal pattern from scratch — a construction difference you feel immediately in how the garment falls.',
          },
          {
            title: 'Consultation and Measurement Done in Person by a Fitter',
            description: 'No self-measurement or estimates — our fitter measures you directly at the workshop before any pattern is drafted.',
          },
          {
            title: 'Your Digital Body Profile Is Saved',
            description: 'Your pattern and measurements are stored permanently — your next order never starts from zero again.',
          },
          {
            title: 'One Workshop, Not a Mass-Production Chain',
            description: 'Consultation, measurement, pattern drafting, production, and quality control all happen in the same place.',
          },
        ],
        faq: [
          {
            question: "What's the difference between a bespoke tailor and a regular made-to-measure tailor?",
            answer:
              'Made-to-measure adjusts an existing template pattern to your size. Bespoke means the pattern is built from scratch, specifically for your body proportions — with no template underneath at all.',
          },
          {
            question: 'How long does bespoke tailoring take in Bandung?',
            answer:
              'It depends on the material and design complexity you choose — a production time estimate is shown live as you explore design combinations in the Design Studio.',
          },
          {
            question: 'Do I have to visit in person for a bespoke measurement?',
            answer:
              'The final measurement is still done in person by our fitter at the Bandung workshop to make sure your Digital Body Profile is accurate. Initial consultation and design selection can start online first.',
          },
          {
            question: 'Is bespoke tailoring more expensive than a regular tailor?',
            answer:
              'There is no fixed price list, since every garment is made-to-order — price depends on material and design detail, confirmed at consultation rather than set upfront.',
          },
          LOCATION_FAQ_ITEM_EN,
          REVIEW_FAQ_ITEM_EN,
        ],
        whatsappMessage: 'Hello Local Tailor, I would like to book a bespoke tailoring consultation at your Bandung workshop.',
        ctaLabel: 'Book a Bespoke Consultation',
      },
      ar: {
        garmentLabel: 'الثوب والقميص الإسلامي',
        keywordPrimary: 'خياط بيسبوك في باندونغ',
        keywordSecondary: ['خياطة بيسبوك باندونغ', 'خياط ثوب مخصص باندونغ', 'خياط بيسبوك بالقرب مني'],
        hero: {
          eyebrow: 'خياط بيسبوك باندونغ',
          headline: 'خياط بيسبوك في باندونغ — نمط شخصي من الصفر، وليس مقاسًا جاهزًا',
          subheadline:
            'بصفتنا خياطًا متخصصًا في التفصيل حسب الطلب (بيسبوك) في باندونغ، لا نقوم بتعديل نمط جاهز حسب مقاسك — بل يُصاغ كل نمط من الصفر بناءً على قياسات جسمك الخاصة، قبل قص أي قطعة قماش.',
          keywordPhrases: ['خياط بيسبوك باندونغ', 'خياطة بيسبوك باندونغ', 'خياط ثوب مخصص باندونغ'],
        },
        valueProps: [
          {
            title: 'نمط من الصفر، لا تدريج على قالب جاهز',
            description:
              'يقوم الخياط العادي بتعديل نمط جاهز حسب مقاسك. أما خياط البيسبوك فيصمم نمطًا شخصيًا من الصفر — فرق في البنية تشعر به فورًا في طريقة سقوط الثوب على جسمك.',
          },
          {
            title: 'استشارة وقياس مباشر من قبل خبير القياس',
            description: 'ليس قياسًا ذاتيًا أو تقديريًا — يقوم خبير القياس لدينا بأخذ قياساتك مباشرة في الورشة قبل تصميم النمط.',
          },
          {
            title: 'ملفك الشخصي الرقمي محفوظ',
            description: 'يتم حفظ نمطك وقياساتك بشكل دائم — طلبك القادم لن يبدأ من الصفر مجددًا.',
          },
          {
            title: 'ورشة واحدة، وليست سلسلة إنتاج جماعي',
            description: 'تجري الاستشارة والقياس وتصميم النمط والإنتاج ومراقبة الجودة كلها في نفس المكان.',
          },
        ],
        faq: [
          {
            question: 'ما الفرق بين خياط البيسبوك والخياط العادي حسب الطلب؟',
            answer:
              'التفصيل حسب الطلب العادي يُعدّل نمطًا جاهزًا حسب مقاسك. أما البيسبوك فيعني تصميم النمط من الصفر خصيصًا لنسب جسمك — دون أي قالب أساسي على الإطلاق.',
          },
          {
            question: 'كم تستغرق عملية خياطة البيسبوك في باندونغ؟',
            answer:
              'يعتمد ذلك على القماش وتعقيد التصميم الذي تختاره — يظهر تقدير مدة الإنتاج مباشرة أثناء استكشافك لتركيبات التصميم في استوديو التصميم.',
          },
          {
            question: 'هل يجب أن أحضر شخصيًا لأخذ القياسات؟',
            answer:
              'يتم القياس النهائي دائمًا حضوريًا من قبل خبير القياس لدينا في ورشة باندونغ لضمان دقة ملفك الشخصي الرقمي. يمكن بدء الاستشارة الأولية واختيار التصميم عبر الإنترنت أولاً.',
          },
          {
            question: 'هل خياطة البيسبوك أغلى من الخياطة العادية؟',
            answer: 'لا توجد قائمة أسعار ثابتة لأن كل قطعة تُصنع حسب الطلب — يعتمد السعر على القماش وتفاصيل التصميم، ويتم تأكيده أثناء الاستشارة وليس مسبقًا.',
          },
          LOCATION_FAQ_ITEM_AR,
          REVIEW_FAQ_ITEM_AR,
        ],
        whatsappMessage: 'مرحبًا Local Tailor، أرغب في حجز استشارة خياطة بيسبوك في ورشتكم في باندونغ.',
        ctaLabel: 'احجز استشارة بيسبوك',
      },
    },
  },

  // -----------------------------------------------------------------------
  // tailor-premium-bandung — premium-tier positioning: material sourcing,
  // hand-finishing, quality control depth. Price-insensitive audience.
  // -----------------------------------------------------------------------
  {
    slug: 'tailor-premium-bandung',
    garmentLabel: 'thobe premium',
    keywordPrimary: 'tailor premium bandung',
    keywordSecondary: ['penjahit premium bandung', 'tailor high end bandung', 'jasa jahit premium bandung'],
    hero: {
      eyebrow: 'Tailor Premium Bandung',
      headline: 'Tailor Premium Bandung — Material Impor, Finishing Tangan, Quality Control Penuh',
      subheadline:
        'Sebagai tailor premium Bandung, kami memilih material impor, menyelesaikan detail penting dengan tangan, dan memeriksa setiap garmen sebelum dikirim — bukan sekadar label "premium" tanpa proses di baliknya.',
      keywordPhrases: ['tailor premium bandung', 'penjahit premium bandung', 'tailor high end bandung'],
    },
    valueProps: [
      {
        title: 'Material Impor Terkurasi',
        description: 'Katun Mesir, linen, dan wool blend impor dipilih berdasarkan drape, daya tahan, dan kenyamanan iklim tropis.',
      },
      {
        title: 'Hand Finishing pada Detail Krusial',
        description: 'Sebagian finishing diselesaikan dengan tangan untuk presisi dan ketahanan yang tidak bisa dicapai mesin sepenuhnya.',
      },
      {
        title: '7-Point Quality Inspection',
        description: 'Setiap garmen diperiksa jahitan, ukuran, kerah, manset, dan finishing sebelum meninggalkan workshop.',
      },
      {
        title: 'Bukan Produksi Massal Berlabel Premium',
        description: 'Setiap garmen dibuat sesuai pesanan (made-to-order) dengan pola personal — bukan stok premium yang diproduksi lebih dulu.',
      },
    ],
    faq: [
      {
        question: 'Apa yang membuat tailor ini "premium", bukan sekadar klaim?',
        answer:
          'Kombinasi material impor terkurasi, sebagian finishing dikerjakan tangan, dan inspeksi kualitas 7 titik sebelum garmen dikirim — bukan hanya harga yang lebih tinggi tanpa proses tambahan.',
      },
      {
        question: 'Apakah tailor premium ini lebih mahal dari tailor standar di Bandung?',
        answer:
          'Harga mengikuti material dan kompleksitas desain yang dipilih, dikonfirmasi saat konsultasi — tidak ada daftar harga tetap karena setiap garmen dibuat sesuai pesanan.',
      },
      {
        question: 'Material apa saja yang tersedia untuk garmen premium?',
        answer: 'Wool blend twill impor Italia, katun Mesir, linen impor Belgia, dan silk-cotton blend impor Jepang — lihat detail lengkap di Fabric Explorer.',
      },
      {
        question: 'Apakah quality control benar-benar dilakukan pada setiap garmen?',
        answer: 'Ya — setiap garmen melewati inspeksi kualitas sebelum dikirim, mencakup konsistensi jahitan, akurasi ukuran, dan kualitas finishing.',
      },
      LOCATION_FAQ_ITEM,
      REVIEW_FAQ_ITEM,
    ],
    reviewHighlightIds: ['rizky-surabaya-daily-wear'],
    relatedGuides: [
      { category: 'bandung', slug: 'bespoke-tailor' },
      { category: 'tailoring', slug: 'bespoke-vs-made-to-measure' },
      { category: 'questions', slug: 'how-much-does-bespoke-thobe-cost' },
    ],
    whatsappMessage: 'Halo Local Tailor, saya ingin konsultasi untuk tailoring premium di workshop Bandung.',
    ctaLabel: 'Konsultasi Premium Tailoring',
    translations: {
      en: {
        garmentLabel: 'premium thobe',
        keywordPrimary: 'premium tailor bandung',
        keywordSecondary: ['premium tailoring bandung', 'high end tailor bandung', 'luxury tailor bandung'],
        hero: {
          eyebrow: 'Premium Tailor Bandung',
          headline: 'Premium Tailor in Bandung — Imported Fabric, Hand Finishing, Full Quality Control',
          subheadline:
            'As a premium tailor in Bandung, we choose imported fabrics, hand-finish the details that matter, and inspect every garment before it ships — not just a "premium" label with no real process behind it.',
          keywordPhrases: ['premium tailor bandung', 'premium tailoring bandung', 'high end tailor bandung'],
        },
        valueProps: [
          {
            title: 'Curated Imported Fabrics',
            description: 'Egyptian cotton, linen, and imported wool blends, selected for drape, durability, and comfort in a tropical climate.',
          },
          {
            title: 'Hand Finishing on Every Critical Detail',
            description: "Selected finishing work is completed by hand for a precision and durability machines can't fully match.",
          },
          {
            title: '7-Point Quality Inspection',
            description: 'Every garment is checked for stitching, sizing, collar, cuffs, and finishing before it leaves the workshop.',
          },
          {
            title: 'Not Mass Production with a Premium Label',
            description: 'Every garment is made-to-order with a personal pattern — never premium-labeled stock produced ahead of time.',
          },
        ],
        faq: [
          {
            question: 'What actually makes this tailor "premium", not just a claim?',
            answer:
              'The combination of curated imported fabric, hand-finished detailing, and a 7-point quality inspection before shipping — not just a higher price with no added process.',
          },
          {
            question: 'Is this premium tailor more expensive than a standard tailor in Bandung?',
            answer:
              "Price follows the material and design complexity you choose, confirmed at consultation — there's no fixed price list since every garment is made-to-order.",
          },
          {
            question: 'What materials are available for premium garments?',
            answer:
              'Italian-imported wool blend twill, Egyptian cotton, Belgian-imported linen, and Japanese-imported silk-cotton blend — see full detail in the Fabric Explorer.',
          },
          {
            question: 'Is quality control really done on every garment?',
            answer: 'Yes — every garment passes a quality inspection before shipping, covering stitch consistency, sizing accuracy, and finishing quality.',
          },
          LOCATION_FAQ_ITEM_EN,
          REVIEW_FAQ_ITEM_EN,
        ],
        whatsappMessage: 'Hello Local Tailor, I would like a consultation for premium tailoring at your Bandung workshop.',
        ctaLabel: 'Book a Premium Tailoring Consultation',
      },
      ar: {
        garmentLabel: 'الثوب الفاخر',
        keywordPrimary: 'خياط فاخر في باندونغ',
        keywordSecondary: ['تفصيل فاخر باندونغ', 'خياط راقٍ باندونغ', 'خياط ملابس فاخرة باندونغ'],
        hero: {
          eyebrow: 'خياط فاخر باندونغ',
          headline: 'خياط فاخر في باندونغ — قماش مستورد، تشطيب يدوي، ومراقبة جودة كاملة',
          subheadline:
            'بصفتنا خياطًا فاخرًا في باندونغ، نختار الأقمشة المستوردة، وننجز التفاصيل المهمة يدويًا، ونفحص كل قطعة قبل شحنها — وليس مجرد وصف "فاخر" بلا عملية حقيقية خلفه.',
          keywordPhrases: ['خياط فاخر باندونغ', 'تفصيل فاخر باندونغ', 'خياط راقٍ باندونغ'],
        },
        valueProps: [
          {
            title: 'أقمشة مستوردة منتقاة بعناية',
            description: 'قطن مصري، كتان، وخلطات صوف مستوردة، مختارة لانسدالها ومتانتها وراحتها في المناخ الاستوائي.',
          },
          {
            title: 'تشطيب يدوي لكل تفصيل مهم',
            description: 'يتم إنجاز بعض أعمال التشطيب يدويًا لتحقيق دقة ومتانة لا تستطيع الآلة تحقيقها بالكامل.',
          },
          {
            title: 'فحص جودة من 7 نقاط',
            description: 'يتم فحص كل قطعة من حيث الخياطة والمقاس والياقة والأكمام والتشطيب قبل مغادرتها الورشة.',
          },
          {
            title: 'ليس إنتاجًا جماعيًا بملصق فاخر',
            description: 'كل قطعة تُصنع حسب الطلب بنمط شخصي — وليست مخزونًا "فاخرًا" مُصنّعًا مسبقًا.',
          },
        ],
        faq: [
          {
            question: 'ما الذي يجعل هذا الخياط "فاخرًا" فعلاً، لا مجرد ادعاء؟',
            answer:
              'مزيج من الأقمشة المستوردة المنتقاة، والتشطيب اليدوي الجزئي، وفحص الجودة من 7 نقاط قبل الشحن — وليس مجرد سعر أعلى بلا عملية إضافية.',
          },
          {
            question: 'هل هذا الخياط الفاخر أغلى من خياط عادي في باندونغ؟',
            answer: 'يعتمد السعر على القماش وتعقيد التصميم الذي تختاره، ويتم تأكيده أثناء الاستشارة — لا توجد قائمة أسعار ثابتة لأن كل قطعة تُصنع حسب الطلب.',
          },
          {
            question: 'ما الأقمشة المتوفرة للقطع الفاخرة؟',
            answer:
              'صوف مستورد من إيطاليا، قطن مصري، كتان مستورد من بلجيكا، وخلطة حرير وقطن مستوردة من اليابان — التفاصيل الكاملة في مستكشف الأقمشة.',
          },
          {
            question: 'هل تُجرى مراقبة الجودة فعليًا على كل قطعة؟',
            answer: 'نعم — تخضع كل قطعة لفحص جودة قبل الشحن، يشمل اتساق الخياطة ودقة المقاس وجودة التشطيب.',
          },
          LOCATION_FAQ_ITEM_AR,
          REVIEW_FAQ_ITEM_AR,
        ],
        whatsappMessage: 'مرحبًا Local Tailor، أرغب في استشارة للتفصيل الفاخر في ورشتكم في باندونغ.',
        ctaLabel: 'احجز استشارة تفصيل فاخر',
      },
    },
  },

  // -----------------------------------------------------------------------
  // jahit-thobe-bandung — functional/service-based query: "where can I get
  // a thobe made in Bandung". Practical, process-focused angle.
  // -----------------------------------------------------------------------
  {
    slug: 'jahit-thobe-bandung',
    garmentLabel: 'thobe',
    keywordPrimary: 'jahit thobe bandung',
    keywordSecondary: ['tempat jahit thobe bandung', 'jasa jahit thobe bandung', 'penjahit thobe bandung'],
    hero: {
      eyebrow: 'Jahit Thobe Bandung',
      headline: 'Jahit Thobe Bandung — Dari Konsultasi Sampai Thobe Selesai di Satu Workshop',
      subheadline:
        'Butuh tempat jahit thobe di Bandung yang mengerjakan dari pola personal, bukan ukuran standar? Local Tailor menangani konsultasi, pengukuran, pola, dan produksi thobe Anda dalam satu proses.',
      keywordPhrases: ['jahit thobe bandung', 'tempat jahit thobe bandung', 'jasa jahit thobe bandung', 'penjahit thobe bandung'],
    },
    valueProps: [
      {
        title: 'Konsultasi Model, Kerah, Manset, dan Material',
        description: 'Tentukan kombinasi desain thobe Anda langsung di Design Studio, lengkap dengan estimasi harga real-time.',
      },
      {
        title: 'Pengukuran oleh Fitter Berpengalaman',
        description: 'Bukan estimasi ukuran S/M/L — pengukuran tubuh Anda langsung oleh fitter untuk hasil yang presisi.',
      },
      {
        title: 'Produksi Terstruktur, Bukan Diburu-buru',
        description: 'Cutting, assembly, konstruksi kerah, pemasangan lengan, hand finishing, hingga pressing akhir — setiap tahap oleh tailor berpengalaman.',
      },
      {
        title: 'Estimasi Waktu Jelas Sejak Awal',
        description: 'Waktu produksi ditampilkan langsung saat Anda mendesain, bukan janji tanpa kepastian.',
      },
    ],
    faq: [
      {
        question: 'Berapa lama proses jahit thobe custom di Bandung ini?',
        answer:
          'Tergantung material dan kompleksitas desain — estimasi waktu produksi ditampilkan langsung saat Anda menjelajahi kombinasi desain di Design Studio, sebelum Anda memesan.',
      },
      {
        question: 'Apakah saya bisa memilih model, kerah, dan manset sendiri?',
        answer: 'Ya — Design Studio kami memungkinkan Anda memilih kombinasi Model, Kerah, Manset, Material, dan Warna secara online.',
      },
      {
        question: 'Apakah pengukuran dilakukan sendiri atau oleh fitter?',
        answer: 'Pengukuran final dilakukan langsung oleh fitter kami di workshop Bandung untuk memastikan hasil jahit thobe akurat.',
      },
      {
        question: 'Apakah bisa jahit baju koko juga, bukan hanya thobe?',
        answer: 'Bisa. Proses pola personal yang sama juga berlaku untuk custom baju koko — lihat halaman custom baju koko Bandung untuk detailnya.',
      },
      LOCATION_FAQ_ITEM,
      REVIEW_FAQ_ITEM,
    ],
    reviewHighlightIds: ['yusuf-bandung-umrah'],
    relatedGuides: [
      { category: 'bandung', slug: 'custom-thobe' },
      { category: 'tailoring', slug: 'pattern-drafting' },
      { category: 'measurements', slug: 'how-to-measure-body' },
    ],
    whatsappMessage: 'Halo Local Tailor, saya ingin booking jahit thobe custom di workshop Bandung.',
    ctaLabel: 'Booking Jahit Thobe Custom',
    translations: {
      en: {
        garmentLabel: 'thobe',
        keywordPrimary: 'thobe tailoring bandung',
        keywordSecondary: ['thobe tailor bandung', 'custom thobe bandung', 'thobe maker bandung'],
        hero: {
          eyebrow: 'Thobe Tailoring Bandung',
          headline: 'Thobe Tailoring in Bandung — From Consultation to a Finished Thobe, One Workshop',
          subheadline:
            'Looking for a thobe tailor in Bandung who works from a personal pattern, not a standard size? Local Tailor handles your consultation, measurement, pattern, and production in one process.',
          keywordPhrases: ['thobe tailoring bandung', 'thobe tailor bandung', 'custom thobe bandung', 'thobe maker bandung'],
        },
        valueProps: [
          {
            title: 'Consultation on Style, Collar, Cuff, and Material',
            description: "Decide your thobe's design combination directly in the Design Studio, complete with a real-time price estimate.",
          },
          {
            title: 'Measurement by an Experienced Fitter',
            description: 'Not an S/M/L size guess — your body is measured directly by a fitter for a precise result.',
          },
          {
            title: 'Structured Production, Never Rushed',
            description:
              'Cutting, assembly, collar construction, sleeve attachment, hand finishing, and final pressing — each stage handled by an experienced tailor.',
          },
          {
            title: 'Clear Timeline from the Start',
            description: 'Production time is shown as soon as you design, not a vague promise.',
          },
        ],
        faq: [
          {
            question: 'How long does custom thobe tailoring take in Bandung?',
            answer:
              'It depends on the material and design complexity — a production time estimate is shown live as you explore design combinations in the Design Studio, before you order.',
          },
          {
            question: 'Can I choose the style, collar, and cuff myself?',
            answer: 'Yes — our Design Studio lets you choose the Model, Collar, Cuff, Material, and Color combination online.',
          },
          {
            question: 'Is the measurement done by myself or by a fitter?',
            answer: 'The final measurement is always done in person by our fitter at the Bandung workshop, to make sure the thobe fits accurately.',
          },
          {
            question: 'Can you tailor baju koko too, not just thobe?',
            answer: 'Yes. The same personal pattern process also applies to custom baju koko — see the custom baju koko Bandung page for details.',
          },
          LOCATION_FAQ_ITEM_EN,
          REVIEW_FAQ_ITEM_EN,
        ],
        whatsappMessage: 'Hello Local Tailor, I would like to book custom thobe tailoring at your Bandung workshop.',
        ctaLabel: 'Book Custom Thobe Tailoring',
      },
      ar: {
        garmentLabel: 'الثوب',
        keywordPrimary: 'خياطة ثوب في باندونغ',
        keywordSecondary: ['خياط ثوب باندونغ', 'ثوب مخصص باندونغ', 'صانع ثوب باندونغ'],
        hero: {
          eyebrow: 'خياطة ثوب باندونغ',
          headline: 'خياطة ثوب في باندونغ — من الاستشارة إلى الثوب الجاهز في ورشة واحدة',
          subheadline:
            'تبحث عن خياط ثوب في باندونغ يعمل بنمط شخصي، لا بمقاس جاهز؟ يتولى Local Tailor استشارتك وقياسك ونمطك وإنتاج ثوبك في عملية واحدة متكاملة.',
          keywordPhrases: ['خياطة ثوب باندونغ', 'خياط ثوب باندونغ', 'ثوب مخصص باندونغ'],
        },
        valueProps: [
          {
            title: 'استشارة حول الطراز والياقة والأكمام والقماش',
            description: 'حدد تركيبة تصميم ثوبك مباشرة في استوديو التصميم، مع تقدير سعر فوري.',
          },
          {
            title: 'قياس من قبل خبير قياس ذي خبرة',
            description: 'ليس تخمين مقاس S/M/L — يتم قياس جسمك مباشرة من قبل خبير قياس للحصول على نتيجة دقيقة.',
          },
          {
            title: 'إنتاج منظم، دون تسرع',
            description: 'القص، والتجميع، وبناء الياقة، وتركيب الأكمام، والتشطيب اليدوي، والكي النهائي — كل مرحلة ينفذها خياط ذو خبرة.',
          },
          {
            title: 'جدول زمني واضح منذ البداية',
            description: 'يظهر وقت الإنتاج فور بدء التصميم، وليس وعدًا غامضًا.',
          },
        ],
        faq: [
          {
            question: 'كم تستغرق خياطة ثوب مخصص في باندونغ؟',
            answer:
              'يعتمد ذلك على القماش وتعقيد التصميم — يظهر تقدير مدة الإنتاج مباشرة أثناء استكشاف تركيبات التصميم في استوديو التصميم، قبل الطلب.',
          },
          {
            question: 'هل يمكنني اختيار الطراز والياقة والأكمام بنفسي؟',
            answer: 'نعم — يتيح لك استوديو التصميم اختيار تركيبة الطراز والياقة والأكمام والقماش واللون عبر الإنترنت.',
          },
          {
            question: 'هل يتم القياس ذاتيًا أم من قبل خبير قياس؟',
            answer: 'يتم القياس النهائي دائمًا حضوريًا من قبل خبير القياس لدينا في ورشة باندونغ لضمان دقة مقاس الثوب.',
          },
          {
            question: 'هل يمكنكم خياطة القميص الإسلامي أيضًا وليس الثوب فقط؟',
            answer: 'نعم. تُطبَّق نفس عملية النمط الشخصي على القميص الإسلامي المخصص أيضًا — راجع صفحة القميص الإسلامي المخصص في باندونغ للتفاصيل.',
          },
          LOCATION_FAQ_ITEM_AR,
          REVIEW_FAQ_ITEM_AR,
        ],
        whatsappMessage: 'مرحبًا Local Tailor، أرغب في حجز خياطة ثوب مخصص في ورشتكم في باندونغ.',
        ctaLabel: 'احجز خياطة ثوب مخصص',
      },
    },
  },

  // -----------------------------------------------------------------------
  // custom-baju-koko-bandung — distinct garment identity from "thobe" in
  // Indonesian search behavior, even though the underlying construction
  // process is the same bespoke pipeline.
  // -----------------------------------------------------------------------
  {
    slug: 'custom-baju-koko-bandung',
    garmentLabel: 'baju koko',
    keywordPrimary: 'custom baju koko bandung',
    keywordSecondary: ['jahit baju koko bandung', 'tailor baju koko bandung', 'jasa jahit koko custom bandung'],
    hero: {
      eyebrow: 'Custom Baju Koko Bandung',
      headline: 'Custom Baju Koko Bandung — Pola Personal untuk Setiap Detail Kerah dan Kancing',
      subheadline:
        'Local Tailor mengerjakan custom baju koko di Bandung dengan proses pola personal yang sama seperti bespoke thobe — bukan konveksi ukuran standar yang diproduksi massal.',
      keywordPhrases: ['custom baju koko bandung', 'jahit baju koko bandung', 'tailor baju koko bandung'],
    },
    valueProps: [
      {
        title: 'Detail Kerah dan Kancing Sesuai Preferensi',
        description: 'Pilihan konstruksi kerah dan detail kancing disesuaikan dengan preferensi Anda, bukan satu desain baku untuk semua.',
      },
      {
        title: 'Material yang Nyaman untuk Pemakaian Formal Maupun Harian',
        description: 'Katun dan linen impor dipilih untuk sirkulasi udara dan kenyamanan sepanjang hari.',
      },
      {
        title: 'Pola dari Pengukuran Tubuh Anda Sendiri',
        description: 'Bukan grading dari ukuran S/M/L — pola baju koko Anda diformulasikan dari pengukuran langsung oleh fitter.',
      },
      {
        title: 'Cocok untuk Kebutuhan Formal, Harian, hingga Acara Keluarga',
        description: 'Satu proses bespoke yang sama, disesuaikan untuk konteks pemakaian yang berbeda-beda.',
      },
    ],
    faq: [
      {
        question: 'Apa bedanya custom baju koko dengan baju koko konveksi?',
        answer:
          'Baju koko konveksi diproduksi massal dalam ukuran standar S/M/L. Custom baju koko kami dibuat dari pola personal berdasarkan pengukuran tubuh Anda sendiri.',
      },
      {
        question: 'Apakah saya bisa memilih model kerah baju koko sendiri?',
        answer: 'Ya, pilihan kerah dan detail konstruksi bisa ditentukan saat konsultasi atau dijelajahi langsung di Design Studio.',
      },
      {
        question: 'Berapa lama proses custom baju koko selesai?',
        answer: 'Waktu produksi tergantung material dan kompleksitas desain — estimasi ditampilkan langsung saat mendesain di Design Studio.',
      },
      {
        question: 'Apakah baju koko custom ini cocok untuk acara formal dan harian?',
        answer: 'Bisa keduanya — pilihan material dan detail desain disesuaikan dengan konteks pemakaian saat konsultasi.',
      },
      LOCATION_FAQ_ITEM,
      REVIEW_FAQ_ITEM,
    ],
    reviewHighlightIds: ['ahmad-jakarta-wedding'],
    relatedGuides: [
      { category: 'bandung', slug: 'custom-thobe' },
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'styling', slug: 'formal-thobe' },
    ],
    whatsappMessage: 'Halo Local Tailor, saya ingin konsultasi untuk custom baju koko di workshop Bandung.',
    ctaLabel: 'Konsultasi Baju Koko Custom',
    translations: {
      en: {
        garmentLabel: 'baju koko',
        keywordPrimary: 'custom baju koko bandung',
        keywordSecondary: ['baju koko tailor bandung', 'tailored baju koko bandung', 'custom koko shirt bandung'],
        hero: {
          eyebrow: 'Custom Baju Koko Bandung',
          headline: 'Custom Baju Koko in Bandung — A Personal Pattern for Every Collar and Button Detail',
          subheadline:
            'Local Tailor makes custom baju koko in Bandung with the same personal-pattern process as bespoke thobe — not mass-produced standard sizing.',
          keywordPhrases: ['custom baju koko bandung', 'baju koko tailor bandung', 'tailored baju koko bandung'],
        },
        valueProps: [
          {
            title: 'Collar and Button Detail to Your Preference',
            description: 'Collar construction and button detail are matched to your preference, not one fixed design for everyone.',
          },
          {
            title: 'Comfortable Fabric for Formal or Daily Wear',
            description: 'Imported cotton and linen chosen for airflow and all-day comfort.',
          },
          {
            title: 'A Pattern from Your Own Measurements',
            description: 'Not graded from S/M/L — your baju koko pattern is formulated from a measurement taken directly by a fitter.',
          },
          {
            title: 'Suited for Formal Occasions, Daily Wear, or Family Events',
            description: "The same bespoke process, adapted to whatever context you'll wear it in.",
          },
        ],
        faq: [
          {
            question: "What's the difference between custom baju koko and a mass-produced one?",
            answer:
              'A mass-produced baju koko is made in standard S/M/L sizes. Our custom baju koko is built from a personal pattern based on your own body measurements.',
          },
          {
            question: 'Can I choose my own collar style?',
            answer: 'Yes, collar and construction detail can be decided at consultation or explored directly in the Design Studio.',
          },
          {
            question: 'How long does a custom baju koko take to complete?',
            answer: 'Production time depends on material and design complexity — an estimate is shown as soon as you start designing in the Design Studio.',
          },
          {
            question: 'Is this custom baju koko suitable for formal and daily wear?',
            answer: 'Both — material and design details are matched to the occasion during your consultation.',
          },
          LOCATION_FAQ_ITEM_EN,
          REVIEW_FAQ_ITEM_EN,
        ],
        whatsappMessage: 'Hello Local Tailor, I would like a consultation for custom baju koko at your Bandung workshop.',
        ctaLabel: 'Book a Custom Baju Koko Consultation',
      },
      ar: {
        garmentLabel: 'القميص الإسلامي (باجو كوكو)',
        keywordPrimary: 'باجو كوكو مخصص في باندونغ',
        keywordSecondary: ['خياط باجو كوكو باندونغ', 'باجو كوكو حسب الطلب باندونغ', 'قميص كوكو مخصص باندونغ'],
        hero: {
          eyebrow: 'باجو كوكو مخصص باندونغ',
          headline: 'باجو كوكو مخصص في باندونغ — نمط شخصي لكل تفصيلة ياقة وزر',
          subheadline:
            'يصنع Local Tailor باجو كوكو مخصصًا في باندونغ بنفس عملية النمط الشخصي المستخدمة للثوب البيسبوك — وليس إنتاجًا جماعيًا بمقاسات موحدة.',
          keywordPhrases: ['باجو كوكو مخصص باندونغ', 'خياط باجو كوكو باندونغ', 'باجو كوكو حسب الطلب باندونغ'],
        },
        valueProps: [
          {
            title: 'تفاصيل ياقة وأزرار حسب تفضيلك',
            description: 'يتم تحديد بنية الياقة وتفاصيل الأزرار وفق تفضيلك، وليس تصميمًا واحدًا موحدًا للجميع.',
          },
          {
            title: 'قماش مريح للارتداء الرسمي واليومي',
            description: 'قطن وكتان مستوردان مختاران لتهوية جيدة وراحة طوال اليوم.',
          },
          {
            title: 'نمط من قياسات جسمك الخاصة',
            description: 'ليس تدريجًا من مقاسات S/M/L — يُصاغ نمط باجو كوكو الخاص بك من قياس مباشر يجريه خبير قياس.',
          },
          {
            title: 'مناسب للمناسبات الرسمية واليومية والعائلية',
            description: 'نفس عملية البيسبوك، مُكيّفة حسب سياق الارتداء الخاص بك.',
          },
        ],
        faq: [
          {
            question: 'ما الفرق بين باجو كوكو المخصص والجاهز من المصنع؟',
            answer: 'باجو كوكو الجاهز يُصنع بمقاسات موحدة S/M/L. أما باجو كوكو المخصص لدينا فيُصنع من نمط شخصي بناءً على قياسات جسمك الخاصة.',
          },
          {
            question: 'هل يمكنني اختيار طراز الياقة بنفسي؟',
            answer: 'نعم، يمكن تحديد الياقة وتفاصيل البنية أثناء الاستشارة أو استكشافها مباشرة في استوديو التصميم.',
          },
          {
            question: 'كم يستغرق إنجاز باجو كوكو مخصص؟',
            answer: 'يعتمد وقت الإنتاج على القماش وتعقيد التصميم — يظهر التقدير فور بدء التصميم في استوديو التصميم.',
          },
          {
            question: 'هل هذا الباجو كوكو المخصص مناسب للمناسبات الرسمية واليومية؟',
            answer: 'كلاهما ممكن — يتم تحديد القماش وتفاصيل التصميم وفق المناسبة أثناء الاستشارة.',
          },
          LOCATION_FAQ_ITEM_AR,
          REVIEW_FAQ_ITEM_AR,
        ],
        whatsappMessage: 'مرحبًا Local Tailor، أرغب في استشارة لباجو كوكو مخصص في ورشتكم في باندونغ.',
        ctaLabel: 'احجز استشارة باجو كوكو مخصص',
      },
    },
  },

  // -----------------------------------------------------------------------
  // tailor-baju-umroh-bandung — travel/climate/quantity-specific angle,
  // reusing the real, already-shipped W6-5 umrah Knowledge cluster.
  // -----------------------------------------------------------------------
  {
    slug: 'tailor-baju-umroh-bandung',
    garmentLabel: 'thobe umroh',
    keywordPrimary: 'tailor baju umroh bandung',
    keywordSecondary: ['jahit baju umroh bandung', 'custom thobe umroh bandung', 'tailor umroh bandung'],
    hero: {
      eyebrow: 'Tailor Baju Umroh Bandung',
      headline: 'Tailor Baju Umroh Bandung — Material dan Jumlah Disesuaikan untuk Perjalanan Ibadah',
      subheadline:
        'Local Tailor membantu Anda memilih material yang tepat untuk iklim Mekkah dan Madinah, serta menentukan jumlah thobe umroh yang ideal — bukan sekadar menjahit tanpa mempertimbangkan kebutuhan perjalanan.',
      keywordPhrases: ['tailor baju umroh bandung', 'jahit baju umroh bandung', 'custom thobe umroh bandung'],
    },
    valueProps: [
      {
        title: 'Material Dipilih untuk Iklim Perjalanan',
        description: 'Rekomendasi material mempertimbangkan suhu dan kelembapan Mekkah-Madinah, bukan hanya preferensi estetika.',
      },
      {
        title: 'Panduan Jumlah Thobe yang Realistis',
        description: 'Konsultasi mencakup berapa thobe yang idealnya dibawa berdasarkan durasi perjalanan Anda.',
      },
      {
        title: 'Perawatan Selama Perjalanan Dijelaskan di Awal',
        description: 'Panduan perawatan kain selama perjalanan disampaikan saat konsultasi, agar garmen tetap rapi sepanjang ibadah.',
      },
      {
        title: 'Pola Personal yang Sama dengan Bespoke Reguler',
        description: 'Thobe umroh Anda tetap melalui proses pengukuran dan pola personal yang sama — bukan versi "cepat" yang dikurangi kualitasnya.',
      },
    ],
    faq: [
      {
        question: 'Material apa yang direkomendasikan untuk thobe umroh?',
        answer:
          'Material yang ringan dan menyerap keringat seperti katun Jepang atau linen umumnya direkomendasikan untuk iklim Mekkah-Madinah — detail lengkap dibahas saat konsultasi.',
      },
      {
        question: 'Berapa banyak thobe yang sebaiknya dibawa untuk umroh?',
        answer: 'Jumlah ideal tergantung durasi perjalanan Anda — panduan lengkap tersedia di artikel Knowledge kami dan dibahas saat konsultasi.',
      },
      {
        question: 'Apakah proses jahit thobe umroh berbeda dari thobe reguler?',
        answer: 'Prosesnya sama — pengukuran oleh fitter dan pola personal — hanya rekomendasi material dan jumlah yang disesuaikan untuk kebutuhan perjalanan.',
      },
      {
        question: 'Kapan sebaiknya mulai konsultasi sebelum keberangkatan umroh?',
        answer: 'Semakin awal semakin baik agar waktu produksi tidak terburu-buru — estimasi waktu ditampilkan langsung saat mendesain di Design Studio.',
      },
      LOCATION_FAQ_ITEM,
      REVIEW_FAQ_ITEM,
    ],
    reviewHighlightIds: ['yusuf-bandung-umrah'],
    relatedGuides: [
      { category: 'umrah', slug: 'best-fabric' },
      { category: 'umrah', slug: 'how-many-thobes' },
      { category: 'bandung', slug: 'custom-thobe' },
    ],
    whatsappMessage: 'Halo Local Tailor, saya ingin booking konsultasi thobe umroh di workshop Bandung.',
    ctaLabel: 'Booking Thobe Umroh',
    translations: {
      en: {
        garmentLabel: 'umrah thobe',
        keywordPrimary: 'umrah tailor bandung',
        keywordSecondary: ['umrah thobe tailor bandung', 'custom umrah thobe bandung', 'umrah clothing tailor bandung'],
        hero: {
          eyebrow: 'Umrah Tailor Bandung',
          headline: 'Umrah Tailor in Bandung — Material and Quantity Matched to Your Journey',
          subheadline:
            "Local Tailor helps you choose the right material for the Mecca and Madinah climate, and decide the ideal number of umrah thobes to bring — not just sewing without considering your journey's needs.",
          keywordPhrases: ['umrah tailor bandung', 'umrah thobe tailor bandung', 'custom umrah thobe bandung'],
        },
        valueProps: [
          {
            title: 'Material Chosen for Travel Climate',
            description: 'Material recommendations consider Mecca-Madinah temperature and humidity, not just aesthetic preference.',
          },
          {
            title: 'A Realistic Guide to How Many Thobes to Bring',
            description: "Consultation covers how many thobes are ideally needed based on your trip's duration.",
          },
          {
            title: 'Fabric Care During Travel Explained Upfront',
            description: 'Care guidance for the fabric during your journey is shared at consultation, so your garment stays presentable throughout.',
          },
          {
            title: 'The Same Personal Pattern as Regular Bespoke',
            description: 'Your umrah thobe still goes through the same measurement and personal pattern process — never a "quick" version with reduced quality.',
          },
        ],
        faq: [
          {
            question: 'What material is recommended for an umrah thobe?',
            answer:
              'Lightweight, sweat-absorbent materials like Japanese cotton or linen are generally recommended for the Mecca-Madinah climate — full detail is discussed at consultation.',
          },
          {
            question: 'How many thobes should I bring for umrah?',
            answer: "The ideal number depends on your trip's duration — a full guide is available in our Knowledge articles and discussed at consultation.",
          },
          {
            question: 'Is the umrah thobe tailoring process different from a regular thobe?',
            answer:
              'The process is the same — fitter measurement and a personal pattern — only the material and quantity recommendations are adjusted for travel needs.',
          },
          {
            question: 'When should I start my consultation before departing for umrah?',
            answer:
              "The earlier the better, so production time isn't rushed — a time estimate is shown as soon as you start designing in the Design Studio.",
          },
          LOCATION_FAQ_ITEM_EN,
          REVIEW_FAQ_ITEM_EN,
        ],
        whatsappMessage: 'Hello Local Tailor, I would like to book an umrah thobe consultation at your Bandung workshop.',
        ctaLabel: 'Book Umrah Thobe Tailoring',
      },
      ar: {
        garmentLabel: 'ثوب العمرة',
        keywordPrimary: 'خياط ملابس عمرة في باندونغ',
        keywordSecondary: ['خياط ثوب عمرة باندونغ', 'ثوب عمرة مخصص باندونغ', 'تفصيل ملابس عمرة باندونغ'],
        hero: {
          eyebrow: 'خياط ملابس عمرة باندونغ',
          headline: 'خياط ملابس عمرة في باندونغ — القماش والكمية بما يناسب رحلتك',
          subheadline:
            'يساعدك Local Tailor في اختيار القماش المناسب لمناخ مكة والمدينة، وتحديد العدد المثالي من أثواب العمرة التي تحتاجها — وليس مجرد الخياطة دون مراعاة احتياجات رحلتك.',
          keywordPhrases: ['خياط ملابس عمرة باندونغ', 'خياط ثوب عمرة باندونغ', 'ثوب عمرة مخصص باندونغ'],
        },
        valueProps: [
          {
            title: 'قماش مختار وفق مناخ الرحلة',
            description: 'تراعي توصيات القماش درجة الحرارة والرطوبة في مكة والمدينة، وليس التفضيل الجمالي فقط.',
          },
          {
            title: 'إرشاد واقعي لعدد الأثواب المطلوبة',
            description: 'تشمل الاستشارة تحديد العدد المثالي من الأثواب بناءً على مدة رحلتك.',
          },
          {
            title: 'شرح للعناية بالقماش أثناء السفر منذ البداية',
            description: 'تُقدَّم إرشادات العناية بالقماش أثناء الرحلة عند الاستشارة، لتبقى ملابسك بحالة أنيقة طوال العبادة.',
          },
          {
            title: 'نفس النمط الشخصي المستخدم في البيسبوك العادي',
            description: 'يمر ثوب العمرة بنفس عملية القياس والنمط الشخصي — وليس نسخة "سريعة" بجودة أقل.',
          },
        ],
        faq: [
          {
            question: 'ما القماش الموصى به لثوب العمرة؟',
            answer: 'يُنصح عادة بالأقمشة الخفيفة والماصة للعرق مثل القطن الياباني أو الكتان لمناخ مكة والمدينة — تُناقش التفاصيل الكاملة أثناء الاستشارة.',
          },
          {
            question: 'كم ثوبًا يجب أن أحضر للعمرة؟',
            answer: 'يعتمد العدد المثالي على مدة رحلتك — يتوفر دليل كامل في مقالات المعرفة لدينا ويُناقش أثناء الاستشارة.',
          },
          {
            question: 'هل تختلف عملية خياطة ثوب العمرة عن الثوب العادي؟',
            answer: 'العملية نفسها — قياس من قبل خبير قياس ونمط شخصي — فقط توصيات القماش والكمية تُكيَّف وفق احتياجات السفر.',
          },
          {
            question: 'متى يجب أن أبدأ الاستشارة قبل السفر للعمرة؟',
            answer: 'كلما بدأت أبكر كان أفضل حتى لا يكون وقت الإنتاج متسرعًا — يظهر تقدير الوقت فور بدء التصميم في استوديو التصميم.',
          },
          LOCATION_FAQ_ITEM_AR,
          REVIEW_FAQ_ITEM_AR,
        ],
        whatsappMessage: 'مرحبًا Local Tailor، أرغب في حجز استشارة لثوب العمرة في ورشتكم في باندونغ.',
        ctaLabel: 'احجز خياطة ثوب عمرة',
      },
    },
  },
]

export function getServiceBySlug(slug: string): ServiceConfig | undefined {
  return SERVICE_CONFIGS.find((service) => service.slug === slug)
}

export function getAllServiceSlugs(): string[] {
  return SERVICE_CONFIGS.map((service) => service.slug)
}
