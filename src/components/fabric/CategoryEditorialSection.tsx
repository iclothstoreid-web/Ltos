import { getCategoryEditorialContent } from '@/lib/materials/categoryContent'
import type { FabricCategory } from '@/types/material'

interface CategoryEditorialSectionProps {
  category: FabricCategory
}

// §4 — 400-800 word hand-authored editorial content per category (see
// src/lib/materials/categoryContent.ts). `<article>` since this is genuine
// long-form content, not just a filter/grid shell; each subsection is its
// own h3 under the page's single h2, keeping heading hierarchy correct.
export function CategoryEditorialSection({ category }: CategoryEditorialSectionProps) {
  const content = getCategoryEditorialContent(category)
  const sections = [content.definition, content.whyIdeal, content.bestFor]

  return (
    <article aria-labelledby="category-editorial-heading">
      <h2 id="category-editorial-heading" className="sr-only">
        About This Category
      </h2>
      <div className="grid gap-8 md:grid-cols-3">
        {sections.map((section) => (
          <section key={section.heading}>
            <h3 className="font-luxury-sans text-sm text-luxury-ivory">{section.heading}</h3>
            <div className="mt-2 space-y-3">
              {section.paragraphs.map((paragraph, i) => (
                <p key={i} className="font-luxury-sans text-sm leading-relaxed text-luxury-taupe">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
