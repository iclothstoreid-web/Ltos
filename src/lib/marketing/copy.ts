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

export const navCopy = {
  brand: 'Bespoke Tailor',
  brandSuffix: 'by Local Tailor',
  links: [
    { label: 'Design Studio', href: '/#configurator' },
    { label: 'Fabrics', href: '/#fabric' },
    { label: 'Gallery', href: '/#gallery' },
    { label: 'Journal', href: '/#knowledge' },
  ],
  cta: 'Book Appointment',
}

export const footerCopy = {
  tagline: 'Bespoke thobe, handcrafted in Bandung.',
  columns: [
    {
      title: 'Explore',
      links: [
        { label: 'Design Studio', href: '/#configurator' },
        { label: 'Fabrics', href: '/#fabric' },
        { label: 'Gallery', href: '/#gallery' },
        { label: 'Knowledge', href: '/#knowledge' },
      ],
    },
    {
      title: 'Studio',
      links: [
        { label: 'Book a Private Appointment', href: '/#appointment' },
        { label: 'FAQ', href: '/#faq' },
      ],
    },
  ],
  legal: `© ${new Date().getFullYear()} Bespoke Tailor. All rights reserved.`,
}
