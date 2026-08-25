import type { FabricCategory } from '@/types/material'

// Sprint W3-5 §4 — Category SEO Content. Static, hand-authored editorial
// copy (400-800 words per category), not derived from Material Master —
// there is no field for long-form prose, and 6 blocks of real writing
// belongs in code the same way src/lib/marketing/copy.ts's homepage copy
// does, not as a database column. Every factual claim here is a general,
// well-established property of the fiber itself (breathability, drape,
// warmth, care), never a claim about a specific SKU — that stays in
// getMaterialAuthorityContent() (materialRepository.ts), which only ever
// speaks from a material's own real fields.

export interface CategoryContentSection {
  heading: string
  paragraphs: string[]
}

export interface CategoryEditorialContent {
  definition: CategoryContentSection
  whyIdeal: CategoryContentSection
  bestFor: CategoryContentSection
}

export const CATEGORY_EDITORIAL_CONTENT: Record<FabricCategory, CategoryEditorialContent> = {
  cotton: {
    definition: {
      heading: 'What is Cotton Fabric?',
      paragraphs: [
        'Cotton is a natural fiber spun from the seed pod of the cotton plant, woven into cloth that has clothed people for thousands of years. In bespoke tailoring, cotton is prized for a combination few other fibers match: it breathes, it takes color evenly, it softens with wear rather than wearing out, and it can be woven into finishes ranging from a crisp, structured oxford weave to a soft, brushed poplin.',
        'The weave determines most of what a cotton fabric feels and behaves like. A tight oxford or twill weave gives a thobe a crisp, tailored silhouette that holds a pressed line through a full day of wear. A looser, finer weave trades some of that structure for extra softness and drape. Weight matters too — a lightweight cotton around 120-160 GSM suits warm, humid climates, while a heavier 180-220 GSM cloth gives a more substantial, formal hand.',
        'Cotton also takes dye exceptionally well, which is why it remains the fabric of choice whenever color consistency matters — from a deep, saturated navy to a crisp, bright white that stays true through repeated washing rather than fading unevenly the way some synthetic-blend dyes do.',
      ],
    },
    whyIdeal: {
      heading: 'Why Cotton is Ideal for Tropical Thobe',
      paragraphs: [
        'Cotton fiber is naturally absorbent and quick to release moisture into the air, which is exactly what a thobe worn through a hot, humid day needs. The fiber itself doesn\'t trap heat the way many synthetics do, so airflow through a cotton weave keeps the wearer noticeably cooler over the course of a long day — at prayer, at work, or at a family gathering.',
        'Cotton also tolerates frequent washing far better than more delicate natural fibers, which matters for a garment worn regularly in a hot climate. A well-made cotton thobe can be washed, pressed, and worn again without the fiber breaking down, making it the practical daily-wear choice as much as the comfortable one.',
        'Because cotton absorbs moisture rather than repelling it, it also feels drier against the skin during physical activity or simply a long, hot commute — the fiber pulls perspiration away from the body and lets it evaporate, rather than holding it against the skin the way many non-absorbent synthetics do.',
      ],
    },
    bestFor: {
      heading: 'Best Cotton Fabrics for Daily Wear',
      paragraphs: [
        'For everyday thobe, a mid-weight cotton oxford or poplin — smooth or crisp in texture, around 150-180 GSM — offers the best balance of structure and comfort: enough body to hold a tailored line, light enough to wear all day without feeling heavy.',
        'For a more formal occasion in the same fiber, a finer, tighter-woven cotton with a subtle luster reads dressier while keeping the breathability that makes cotton the right choice for a climate where comfort is never optional.',
        'Care is straightforward across nearly every cotton weight: machine wash on a gentle-to-normal cycle, press while still slightly damp for the crispest finish, and expect the fabric to soften — not wear thin — over its first several washes, which is part of why a well-chosen cotton thobe often becomes a customer\'s most-worn piece.',
      ],
    },
  },
  linen: {
    definition: {
      heading: 'What is Linen Fabric?',
      paragraphs: [
        'Linen is woven from the fibers of the flax plant, one of the oldest textiles known and still one of the most breathable. Its defining trait is texture: linen has a natural, slightly irregular slub in the yarn that gives the finished cloth a distinctive, relaxed surface no synthetic fiber fully replicates. That texture is not a flaw to hide — it is linen\'s signature.',
        'Flax fiber is longer and less elastic than cotton, which is why linen wrinkles more readily and why it drapes the way it does: with a soft, slightly stiff hand that relaxes beautifully into a garment over the course of a day rather than clinging to the body.',
        'Linen also has a subtle natural sheen that cotton lacks, a product of the flax fiber\'s smooth, waxy surface. That sheen, combined with the fabric\'s characteristic texture, is why linen reads as effortlessly refined even in its most relaxed, unpressed state.',
      ],
    },
    whyIdeal: {
      heading: 'Why Linen is Ideal for Warm-Climate Tailoring',
      paragraphs: [
        'Linen is even more breathable than cotton — the flax fiber is naturally porous and conducts heat away from the body efficiently, which is why linen has been the traditional warm-climate fabric across the Mediterranean, the Levant, and South Asia for centuries. A linen thobe feels noticeably cooler against the skin than most other natural fibers of comparable weight.',
        'The trade-off customers should understand going in: linen wrinkles easily, and that is simply how the fiber behaves, not a manufacturing defect. Many wearers embrace the relaxed, lived-in crease as part of linen\'s character rather than fighting it with heavy starching.',
        'Linen fiber is also naturally moisture-wicking and dries faster than cotton after washing, a practical advantage in humid climates where garments need to be laundered often and dry quickly between wears.',
      ],
    },
    bestFor: {
      heading: 'Best Linen Fabrics for Relaxed, Breathable Style',
      paragraphs: [
        'A soft, lightweight linen (under 150 GSM) suits the most relaxed, casual thobe styles — errand-running, travel, or simply the hottest days of the year, when breathability outweighs a fully pressed silhouette.',
        'A slightly heavier linen or a linen-cotton blend holds a cleaner line for those who want linen\'s coolness with a touch more structure, without fully sacrificing the breathability that makes linen worth choosing in the first place.',
        'When caring for linen, a gentle wash and light steam rather than a hot iron preserves the fiber\'s natural texture best — over-pressing linen flat works against the fabric\'s character rather than with it, and most customers find a lightly relaxed finish is the more flattering, more authentically linen result.',
      ],
    },
  },
  wool: {
    definition: {
      heading: 'What is Wool Fabric?',
      paragraphs: [
        'Wool is a protein fiber sheared from sheep, prized in tailoring for centuries for one reason above all: it holds a shape. Wool fiber has a natural crimp and elasticity that lets a garment spring back after wear, resist wrinkling, and keep a sharp, structured silhouette through a full day far better than most other natural fibers.',
        'Fine worsted wools — the kind used in bespoke tailoring — are spun from long, combed fibers into a smooth, tightly woven cloth with a refined surface and real weight in the hand, distinct from the coarser, bulkier wool used in knitwear.',
        'Wool quality is often described by its "Super" number (Super 100s, Super 120s, and so on), a measure of how fine the individual fibers are. Finer fibers make a smoother, softer, more luxurious cloth, though very fine wools also require more careful handling than a coarser, more hard-wearing weave.',
      ],
    },
    whyIdeal: {
      heading: 'Why Wool is Ideal for Formal, Cool-Weather Occasions',
      paragraphs: [
        'Wool fiber traps air within its crimped structure, giving it genuine insulating warmth — the reason wool is the classic choice for cooler evenings, air-conditioned indoor events, and formal occasions where a heavier, more structured garment is appropriate rather than a liability.',
        'That same structure is what gives a wool thobe its formal bearing: the fabric holds a crisp line at the shoulder and a clean drape through the body, the tailored look most associated with business wear and formal occasions.',
        'Wool is also naturally wrinkle- and odor-resistant, properties few other fibers offer without synthetic treatment — the fiber\'s structure resists creasing under normal wear and its surface is naturally less hospitable to the bacteria that cause odor, so a wool garment stays presentable through a long formal event.',
      ],
    },
    bestFor: {
      heading: 'Best Wool Fabrics for Business and Formal Wear',
      paragraphs: [
        'A fine worsted wool in the Super 100s-150s range offers the classic balance bespoke tailoring is built on: enough structure to hold a formal silhouette, fine enough to remain comfortable for a full day of wear.',
        'Heavier wools suit the coolest settings and the most formal occasions, where a substantial hand and pronounced structure are exactly what the occasion calls for.',
        'Wool asks for gentler care than cotton or linen — dry cleaning or a careful hand wash, storage away from direct sunlight, and an occasional airing rather than frequent machine washing — a small extra step in exchange for a garment that holds its tailored shape for years.',
      ],
    },
  },
  rayon: {
    definition: {
      heading: 'What is Rayon Fabric?',
      paragraphs: [
        'Rayon (also known as viscose) is a semi-synthetic fiber made from regenerated cellulose — wood pulp processed into a fiber that behaves like a natural material while offering a smoothness and sheen distinctly its own. It sits between cotton\'s natural breathability and silk\'s fluid drape, without the cost of either.',
        'What sets rayon apart on the hand is its lustrous surface and exceptionally soft, fluid drape — the fiber has very little internal stiffness, so a rayon garment falls and moves with the body rather than holding its own shape the way wool or cotton does.',
        'Because rayon is derived from plant cellulose rather than petroleum, it shares some of cotton\'s natural comfort while offering a smoother, more refined surface finish — a distinct middle ground between fully natural and fully synthetic fibers that tailors have used for nearly a century. Its production process also allows for a consistent, fine yarn that weaves into a notably even, unblemished surface, part of why rayon photographs and drapes so cleanly on the body.',
      ],
    },
    whyIdeal: {
      heading: 'Why Rayon is Ideal for a Fluid, Elegant Silhouette',
      paragraphs: [
        'Rayon\'s fluid drape gives a thobe a distinctive, elegant movement that structured fibers can\'t replicate — the cloth skims the body rather than standing away from it, a look many customers specifically seek out for formal or celebratory occasions.',
        'The fiber is also reasonably breathable thanks to its cellulose origin, though it lacks cotton\'s durability under frequent hard washing, so a rayon garment rewards a gentler care routine in exchange for its distinctive hand and sheen.',
        'Rayon takes dye with an especially deep, rich saturation compared to many other fibers, which is part of why rayon garments are so often chosen for occasions where a striking, saturated color is part of the appeal.',
      ],
    },
    bestFor: {
      heading: 'Best Rayon Fabrics for Special Occasions',
      paragraphs: [
        'A lustrous, mid-weight rayon suits celebratory occasions — Eid, weddings, formal gatherings — where the fabric\'s sheen and fluid movement are meant to stand out.',
        'For a subtler take on the same fiber, a matte-finished rayon offers the same soft drape with a more understated surface, suited to occasions that call for elegance without shine.',
        'Rayon performs best with a gentle hand wash or dry clean rather than a hot machine cycle — the fiber can lose some strength when wet, so a careful care routine preserves both the drape and the surface sheen that make rayon worth choosing.',
      ],
    },
  },
  polyester: {
    definition: {
      heading: 'What is Polyester Fabric?',
      paragraphs: [
        'Polyester is a fully synthetic fiber engineered from petroleum-derived polymers, valued in tailoring for its consistency and durability. Unlike natural fibers, polyester is manufactured to a precise, repeatable specification, which is why polyester fabrics hold their exact weight, weave, and finish reliably from batch to batch.',
        'The defining practical trait of polyester is resilience: the fiber resists wrinkling, holds its shape through repeated wear and washing, and doesn\'t break down the way natural fibers eventually do under the same conditions.',
        'Modern polyester weaves have also improved considerably on the fiber\'s early reputation — a well-woven polyester can achieve a matte or subtly textured finish that reads far closer to a natural fabric than the shinier, stiffer polyester of decades past, closing much of the gap that once made synthetic fabrics easy to spot at a glance.',
      ],
    },
    whyIdeal: {
      heading: 'Why Polyester is Ideal for Everyday Durability',
      paragraphs: [
        'For a thobe worn frequently and washed often, polyester\'s wrinkle resistance and durability translate directly into less ironing and a longer working life for the garment — practical advantages that matter as much as appearance for daily wear.',
        'Polyester is less breathable than cotton or linen on its own, since the fiber doesn\'t absorb moisture the way natural fibers do — a real trade-off worth understanding, which is why polyester is often blended with a natural fiber rather than used alone where breathability matters most.',
        'Polyester also resists shrinking and fading far more reliably than natural fibers across repeated washes, which is why it remains a dependable choice for a garment expected to look the same after its fiftieth wash as it did after its first.',
      ],
    },
    bestFor: {
      heading: 'Best Polyester Fabrics for Low-Maintenance Wear',
      paragraphs: [
        'A smooth or matte polyester in a mid-weight suits customers who prioritize a crisp, consistently neat appearance with minimal ironing — a practical everyday choice, particularly for warmer, less humid conditions where breathability is less critical.',
        'Polyester also holds up well as a lining or structural layer within a garment, where its stability and resistance to distortion support the outer fabric\'s shape without adding bulk.',
        'Care is about as simple as fabric care gets: machine wash, minimal ironing needed, and no special handling — the practical upside that leads many customers to choose polyester specifically for garments meant for frequent, everyday rotation. For travel especially, a polyester thobe that shrugs off a suitcase full of creases is often the most convenient option available.',
      ],
    },
  },
  blend: {
    definition: {
      heading: 'What is a Blended Fabric?',
      paragraphs: [
        'A blend combines two or more fibers — most commonly cotton with polyester, or linen with cotton — spun together into a single yarn to capture the strengths of each while offsetting their individual weaknesses. A well-designed blend is a deliberate engineering choice, not a compromise.',
        'The exact ratio determines the character of the cloth: a cotton-dominant blend leans toward natural breathability with added durability, while a polyester-dominant blend leans toward wrinkle resistance and shape retention with some natural softness folded in.',
        'Blends are also where tailoring innovation often happens fastest — new fiber ratios and weave techniques regularly aim to close the gap between a blend and its pure-fiber inspiration, giving customers more genuine choice between performance and traditional character than either fiber offers alone. Local Tailor\'s blend fabrics are chosen specifically for that balance, not simply as a lower-cost substitute for a single-fiber cloth.',
      ],
    },
    whyIdeal: {
      heading: 'Why Blends are Ideal for Balanced, Practical Tailoring',
      paragraphs: [
        'Blends exist specifically to solve the trade-offs each pure fiber carries on its own: cotton\'s tendency to wrinkle, linen\'s fragility under frequent washing, polyester\'s lack of breathability. A cotton-poly blend, for example, keeps much of cotton\'s comfort while wrinkling noticeably less and lasting longer under regular wear.',
        'That balance makes blends a practical default for customers who want a fabric that performs well across a range of occasions and climates rather than excelling narrowly at one — a genuine advantage for anyone ordering a single thobe meant to cover more than one kind of day.',
        'A blend also tends to be more forgiving of imperfect care than either of its parent fibers alone — a cotton-poly cloth tolerates a slightly hotter wash or a missed ironing session better than pure cotton or pure linen would, without losing its finished appearance.',
      ],
    },
    bestFor: {
      heading: 'Best Blended Fabrics for Versatile, Year-Round Wear',
      paragraphs: [
        'A cotton-poly blend in a smooth or crisp finish suits customers who want one reliable, easy-care fabric for regular rotation — business wear, daily thobe, and most occasions in between.',
        'A linen-cotton blend is the better choice for warmer climates specifically, trading a little of linen\'s pure breathability for meaningfully less wrinkling and a cloth that holds its press for longer.',
        'Because a blend\'s exact character depends on its fiber ratio, it\'s worth checking a specific blend\'s composition and texture against the occasion in mind — a cotton-heavy blend for comfort-first daily wear, a wool-blend for a more formal, structured result, or a linen-heavy blend when breathability matters most.',
      ],
    },
  },
}

export function getCategoryEditorialContent(category: FabricCategory): CategoryEditorialContent {
  return CATEGORY_EDITORIAL_CONTENT[category]
}
