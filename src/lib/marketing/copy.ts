// Sprint W1 — single source of truth for homepage copy. The FAQ array here
// also feeds the FAQPage JSON-LD in seo.ts, so UI and structured data can
// never drift apart.

import { fabricPhotos, garmentPhotos } from './assets'

export const heroCopy = {
  eyebrow: 'Bespoke Thobe, Bandung',
  headline: 'Custom Thobe, Crafted Exclusively for You',
  subheadline: 'Designed around your body, your lifestyle, and your identity.',
  primaryCta: 'Design My Thobe',
  secondaryCta: 'Book a Private Appointment',
  trustStrip: ['Premium Imported Fabrics', 'Personal Measurement', 'Crafted in Bandung', 'Custom Pattern'],
}

// Sprint W1 revision — Savile Row-style appointment section, positioned
// right after the Hero so the appointment CTA is the most prominent thing
// on the page after the headline itself.
export const appointmentCopy = {
  eyebrow: 'By Appointment',
  heading: 'Book a Private Appointment',
  body: 'Personal consultation, fabric selection, body measurement, and design guidance in a private tailoring session.',
  location: 'Private Appointment — Bandung',
  address: 'Workshop & Showroom, Bandung, West Java',
  cta: 'Book a Private Appointment',
  photoAlt: 'Bespoke black pinstripe thobe presented on a mannequin, editorial studio photography',
}

export const trustBarCopy = {
  heading: 'Trusted by discerning clients across Indonesia',
  counters: [
    // TODO_REAL_DATA — placeholder figures, replace before ship.
    { value: 500, suffix: '+', label: 'Bespoke Garments Delivered' },
    { value: 98, suffix: '%', label: 'Fit-Right-First-Time' },
    { value: 12, suffix: '', label: 'Years of Tailoring Craft' },
  ],
}

export const configuratorCopy = {
  eyebrow: 'Design Studio',
  heading: 'See Your Design Come to Life',
  body: 'Switch fabric, adjust color, and watch your price and production timeline update in real time — the same engine our fitters use in-studio.',
  fabricLabel: 'Fabric',
  colorLabel: 'Color',
  priceLabel: 'Estimated Investment',
  timeLabel: 'Production Time',
  cta: 'Continue Designing',
  mannequinAlt: 'Digital fitting mannequin from the Bespoke Tailor Design Studio, used for measurement and design preview',
}

// Sprint W5-1 — Process Storytelling. Distinct from craftsmanshipCopy below:
// this is the homepage's trust/conversion backbone (fuller step copy, its
// own primary/secondary CTAs, positioned right after the configurator
// teaser), not a replacement for the existing Craftsmanship section further
// down the page. The two intentionally overlap on 3 of 6 step names —
// craftsmanshipCopy stays untouched per the "don't redesign what wasn't
// asked" brief.
export const bespokeProcessCopy = {
  eyebrow: 'Process Storytelling',
  heading: 'From Consultation to Delivery — Every Garment Is Built Specifically for You',
  subheadline:
    'A bespoke garment is not selected from stock. It is designed, measured, patterned, crafted, inspected, and finished for one individual.',
  steps: [
    { title: 'Consultation', description: 'Discuss purpose, style, fabric, and fit preferences.' },
    { title: 'Measurement', description: 'Detailed body measurements and posture assessment.' },
    { title: 'Pattern Formulation', description: 'A personal pattern is drafted specifically for your body profile.' },
    { title: 'Production', description: 'Cutting, construction, and hand-finished tailoring.' },
    { title: 'Quality Control', description: 'Every garment is inspected before it leaves the workshop.' },
    { title: 'Delivery', description: 'Final fitting and delivery with long-term customer profile retention.' },
  ],
  primaryCta: 'Book Consultation',
  secondaryCta: 'View Full Bespoke Process',
}

export const fabricCopy = {
  eyebrow: 'Material',
  heading: 'Fabric Is Where Craft Begins',
  body: 'Every roll is sourced, inspected, and matched to how the garment will move, breathe, and hold its shape.',
  cta: 'Explore All Fabrics',
  cards: [
    { name: 'Wool Blend Twill', origin: 'Imported — Italy', trait: 'Structured drape, cool-season weight', photo: fabricPhotos.woolBlendTwill },
    { name: 'Egyptian Cotton', origin: 'Imported — Egypt', trait: 'Breathable, crisp finish', photo: fabricPhotos.egyptianCotton },
    { name: 'Linen Weave', origin: 'Imported — Belgium', trait: 'Lightweight, warm-climate ready', photo: fabricPhotos.linenWeave },
    { name: 'Silk-Cotton Blend', origin: 'Imported — Japan', trait: 'Subtle sheen, occasion-ready', photo: fabricPhotos.silkCottonBlend },
  ],
}

export const whyCopy = {
  eyebrow: 'The Difference',
  heading: 'Why Bespoke Tailor',
  columns: [
    {
      title: 'Ready-Made',
      description: 'Fixed sizing built for an average body. Fit is approximate; adjustments are cosmetic at best.',
      elevated: false,
    },
    {
      title: 'Mass Tailoring',
      description: 'Your measurements against a templated pattern block. Closer, but the pattern was never drawn for you.',
      elevated: false,
    },
    {
      title: 'Bespoke Tailor',
      description: 'A pattern formulated from your measurements alone, then handcrafted by an artisan who built it for no one else.',
      elevated: true,
    },
  ],
}

export const craftsmanshipCopy = {
  eyebrow: 'Process',
  heading: 'Craftsmanship, Step by Step',
  steps: [
    { title: 'Consultation', description: 'A private session to understand your occasion, silhouette preference, and lifestyle.' },
    { title: 'Measurement', description: 'Full-body measurement captured by a trained fitter, recorded to the millimeter.' },
    { title: 'Pattern Formulation', description: 'Your measurements become a pattern block that exists nowhere else.' },
    { title: 'Handcrafted Production', description: 'Cut, sewn, and finished by hand in our Bandung workshop.' },
  ],
}

export const galleryCopy = {
  eyebrow: 'Portfolio',
  heading: 'A Record of Craft',
  filters: ['All', 'Wedding', 'Umrah', 'Formal', 'Daily', 'Premium'] as const,
  items: [
    { category: 'Formal', tall: true, variant: 'a', photo: garmentPhotos.blackPinstripe },
    { category: 'Umrah', tall: false, variant: 'b' },
    { category: 'Wedding', tall: true, variant: 'c', photo: garmentPhotos.maroonPiping },
    { category: 'Daily', tall: false, variant: 'a', photo: garmentPhotos.navy },
    { category: 'Premium', tall: true, variant: 'b' },
    { category: 'Wedding', tall: false, variant: 'c' },
    { category: 'Formal', tall: false, variant: 'a' },
    { category: 'Premium', tall: true, variant: 'b' },
  ] as { category: string; tall: boolean; variant: 'a' | 'b' | 'c'; photo?: string }[],
}

export const storiesCopy = {
  eyebrow: 'Customer Stories',
  heading: 'Worn, Not Just Made',
  stories: [
    { name: 'Ahmad R.', city: 'Bandung', fabric: 'Wool Blend Twill', purpose: 'Wedding', quote: 'The fit was exact — nothing I have worn compares.' },
    { name: 'Faisal H.', city: 'Jakarta', fabric: 'Linen Weave', purpose: 'Umrah', quote: 'Lightweight, breathable, and it still looked formal for the occasion.' },
    { name: 'Yusuf M.', city: 'Surabaya', fabric: 'Egyptian Cotton', purpose: 'Daily', quote: 'I ordered one and came back for three more.' },
  ],
}

export const knowledgeCopy = {
  eyebrow: 'Knowledge',
  heading: 'Learn Before You Design',
  cards: [
    { title: 'Best Fabric for Umrah', description: 'Breathability and drape for long hours of worship in warm climates.' },
    { title: 'Slim Fit vs Relaxed Fit', description: 'How each silhouette changes movement, formality, and comfort.' },
    { title: 'How We Measure', description: 'Inside the 20-point measurement process behind every pattern.' },
    { title: 'Wedding Thobe Guide', description: 'Fabric, color, and fit considerations for the day itself.' },
  ],
}

export const faqCopy = {
  eyebrow: 'FAQ',
  heading: 'Common Questions',
  items: [
    {
      question: 'How is a bespoke thobe different from a made-to-measure one?',
      answer: 'Made-to-measure adjusts an existing pattern template to your measurements. Bespoke means a pattern is formulated from your measurements alone, with no template underneath — that is how Bespoke Tailor builds every garment.',
    },
    {
      question: 'How long does production take?',
      answer: 'Production time depends on fabric and current workshop capacity, and is shown as a live estimate during the design process based on your specific order.',
    },
    {
      question: 'Can I start the design process without visiting the studio?',
      answer: 'Yes — Design My Thobe lets you explore fabric and fit options online first; a private appointment and measurement session follows before production begins.',
    },
    {
      question: 'Where is my thobe made?',
      answer: 'Every garment is cut, sewn, and finished by hand in our workshop in Bandung, Indonesia.',
    },
  ],
}

export const finalCtaCopy = {
  heading: 'Begin Your First Custom Thobe',
  body: 'Every bespoke garment starts with a single conversation.',
  primaryCta: 'Design My Thobe',
  secondaryCta: 'Book a Private Appointment',
  tertiaryCta: 'Chat with Tailor',
  // TODO_REAL_DATA — replace with a live slots/capacity source when one exists.
  urgency: 'Currently booking private appointments for this month.',
}

// Sprint W4.5 — Public Navigation Integration. hrefs now point at the real
// W2/W3 pages (`/design-studio`, `/fabric`) and the new elegant
// placeholders (`/gallery`, `/journal`) instead of homepage anchors — see
// PLAN/audit note: every one of these routes already existed and worked
// when opened directly, nothing here was reachable from the nav before.
export const navCopy = {
  brand: 'Local Tailor',
  brandSuffix: 'by Local Project',
  links: [
    { label: 'Design Studio', href: '/design-studio' },
    { label: 'Fabrics', href: '/fabric' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Journal', href: '/journal' },
  ],
  cta: 'Book Appointment',
}

export const footerCopy = {
  tagline: 'Bespoke thobe, handcrafted in Bandung.',
  columns: [
    {
      title: 'Explore',
      links: [
        { label: 'Design Studio', href: '/design-studio' },
        { label: 'Fabrics', href: '/fabric' },
        { label: 'Gallery', href: '/gallery' },
        { label: 'Journal', href: '/journal' },
      ],
    },
    {
      title: 'Studio',
      links: [
        { label: 'Book a Private Appointment', href: '/book-appointment' },
        { label: 'FAQ', href: '/#faq' },
      ],
    },
    // Sprint W0.5 — SEO Content Cluster. Real routes (not homepage anchors
    // like the two columns above) so the site's highest-authority page
    // links directly to the estimator and every guide article.
    {
      title: 'Panduan Ukuran',
      links: [
        { label: 'Cek Ukuran Gratis', href: '/free-body-profile-estimator' },
        { label: 'Cek Ukuran Thobe', href: '/cek-ukuran-thobe' },
        { label: 'Ukuran Thobe Pria', href: '/ukuran-thobe-pria' },
        { label: 'Cara Mengukur Thobe', href: '/cara-mengukur-thobe' },
        { label: 'Size Chart Thobe', href: '/size-chart-thobe' },
      ],
    },
  ],
  legal: `© ${new Date().getFullYear()} Bespoke Tailor. All rights reserved.`,
}
