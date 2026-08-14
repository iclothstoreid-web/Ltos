# SEO Keyword Map — Local Tailor Bandung

Sprint W10 — Organic Acquisition Engine. Commercial keyword research for Local Tailor's one real workshop (Buah Batu, Bandung), grouped by purchase intent per the classic **Ready to Buy / Compare / Research** funnel model. Every "Target page" below either already exists (Sprint W6 Knowledge Engine, Sprint Y Design Studio, Sprint W8 Locations) or is a Sprint W10 deliverable (the 5 new Revenue Landing Pages) — no keyword here targets a page that doesn't exist.

## How to read this table

- **Search intent** — what the searcher actually wants when they type this query.
- **Target page** — the single best-fit page this query should land on or be internally linked toward.
- **CTA** — the primary conversion action that page should push toward for this specific intent.
- **Priority** — `High` = Ready to Buy (bottom-of-funnel, gets a dedicated landing page), `Medium` = Compare (mid-funnel, gets a Knowledge article + internal links into the High-priority pages), `Low` = Research (top-of-funnel, already served by existing Knowledge Engine content, linked upward toward Compare/Ready-to-Buy).

---

## A. Ready to Buy (High priority — dedicated Revenue Landing Pages)

These are bottom-of-funnel, high purchase-intent queries. Every one of these gets its own Sprint W10 landing page — the searcher is close to booking, so the target page must lead directly to a WhatsApp consultation, not a generic article.

| Keyword | Search intent | Target page | CTA | Priority |
|---|---|---|---|---|
| bespoke tailor bandung | Find a bespoke (not made-to-measure, not ready-made) tailor physically based in Bandung | `/bespoke-tailor-bandung` | WhatsApp: "Booking Konsultasi Bespoke" | High |
| tailor premium bandung | Find a premium-tier tailoring service in Bandung, price-insensitive, quality-first | `/tailor-premium-bandung` | WhatsApp: "Konsultasi Premium Tailoring" | High |
| jahit thobe bandung | Find somewhere in Bandung that sews/makes custom thobe (functional, service-based query) | `/jahit-thobe-bandung` | WhatsApp: "Booking Jahit Thobe Custom" | High |
| custom baju koko bandung | Find a Bandung tailor for custom baju koko specifically (distinct garment from thobe in searcher's mind) | `/custom-baju-koko-bandung` | WhatsApp: "Konsultasi Baju Koko Custom" | High |
| tailor baju umroh bandung | Find a Bandung tailor for umrah-specific garments (travel/climate/quantity considerations) | `/tailor-baju-umroh-bandung` | WhatsApp: "Booking Thobe Umroh" | High |
| tailor wedding muslim bandung | Find a Bandung tailor for Muslim wedding attire (akad/resepsi) | `/knowledge/wedding` → `/bespoke-tailor-bandung` | WhatsApp: "Konsultasi Wedding Attire" (routed via the wedding Knowledge cluster, which already links into Design Studio/consultation — see W6-5) | High (served by existing content + internal links, not a 6th new landing page — see note below) |

**Note on "tailor wedding muslim bandung":** this keyword is already served by the existing Sprint W6-5 wedding Knowledge cluster (`/knowledge/wedding/*`, 8 articles including `bandung/wedding-tailor`) plus the general `/bespoke-tailor-bandung` landing page. Per the brief's own Task 2 list (5 named pages, wedding not among them), this sprint does **not** duplicate that with a 6th landing page — instead, `/bespoke-tailor-bandung` and the wedding Knowledge articles are internally cross-linked (Task 4) so this query's intent is still fully captured without new duplicate content.

---

## B. Compare (Medium priority — served by Knowledge Engine + internal links)

Mid-funnel: the searcher already knows they want *something* custom, but is still deciding between options. These queries are best served by educational/comparison content that then funnels toward the Ready-to-Buy pages — not a hard sales page.

| Keyword | Search intent | Target page | CTA | Priority |
|---|---|---|---|---|
| bespoke vs mtm | Understand the real difference between bespoke and made-to-measure before committing | `/knowledge/tailoring/bespoke-vs-made-to-measure` (existing) → internal link to `/bespoke-tailor-bandung` | "Baca Selengkapnya" → WhatsApp on the landing page | Medium |
| tailor premium vs tailor biasa | Justify the price gap between a premium tailor and a standard/mass tailor | `/tailor-premium-bandung` (new landing page's own FAQ/value-prop sections directly answer this) | WhatsApp: "Konsultasi Premium Tailoring" | Medium |
| bahan thobe terbaik | Compare fabric options before choosing | `/fabric` (existing Fabric Explorer) → internal link to relevant landing pages | "Explore All Fabrics" → Design Studio | Medium |

---

## C. Research (Low priority — already served by existing Knowledge Engine)

Top-of-funnel, no purchase intent yet. Fully covered by existing Sprint W6 content; this sprint adds no new pages for these, only makes sure the existing articles link *forward* toward the new Ready-to-Buy pages where relevant (Task 4).

| Keyword | Search intent | Target page | CTA | Priority |
|---|---|---|---|---|
| apa itu bespoke | Learn what "bespoke" means as a concept | `/knowledge/tailoring/what-is-bespoke` (existing) | "Baca Panduan Lengkap" → forward link to `/bespoke-tailor-bandung` | Low |
| cara memilih tailor | Learn how to evaluate/choose a tailor | `/knowledge/tailoring/*` cluster (existing) | Forward link to `/tailor-premium-bandung` | Low |
| model thobe premium | Browse premium thobe model/style ideas | `/knowledge/styling/*` cluster (existing) + `/gallery` | Forward link to `/design-studio` | Low |

---

## Funnel Summary

```
Research (Low)        Compare (Medium)              Ready to Buy (High)
──────────────         ────────────────               ──────────────────
apa itu bespoke   ──►  bespoke vs mtm            ──►  bespoke-tailor-bandung
cara memilih      ──►  tailor premium vs biasa   ──►  tailor-premium-bandung
tailor                                            ──►  jahit-thobe-bandung
model thobe       ──►  bahan thobe terbaik        ──►  custom-baju-koko-bandung
premium                                           ──►  tailor-baju-umroh-bandung
                                                        │
                                                        ▼
                                            WhatsApp Consultation → LTOS Workflow
```

Every Ready-to-Buy landing page also links *back* into the Compare/Research content that supports its own claims (see `SEO_OPERATING_SYSTEM.md` for the full workflow loop and `docs/seo/GA4_EVENT_TAXONOMY` equivalent tracking in `src/lib/analytics/`).

## Source of truth notes

- No keyword volume/competition data source (e.g. Google Keyword Planner, Ahrefs, SEMrush API) is connected to this project — these groupings and priorities are qualitative, based on funnel-stage classification and this business's own real service lines (bespoke thobe/baju koko/umrah garments, Bandung-only physical workshop). If a keyword-data tool is connected later, re-validate priorities against real volume/difficulty numbers rather than trusting this qualitative pass indefinitely.
- All target pages listed either already exist in this codebase (verified before writing this table) or are the exact 5 pages this same sprint builds — no speculative/future page is referenced.
