# LTOS Design Language

## Purpose

This is the official LTOS Design Language v1.0 — the governing design DNA for LTOS (Local Tailor Operating System). It defines the experience, visual, composition, structural, behavior, component, AI-interpretation, and validation principles that every future screen, feature, and flow must be traceable back to. It is law, not inspiration.

## Source of Truth Hierarchy

Per project CLAUDE.md, LTOS resolves conflicting guidance in this order:

1. Source Code
2. LTOS Brain (Obsidian)
3. Architecture Documentation
4. ADR
5. Business Rules
6. Sprint Documentation

This Design Language sits within Architecture Documentation. It never overrides Source Code or LTOS Brain, and it must never be contradicted without explicit instruction.

## Volume Index

| Volume | Title | File |
|---|---|---|
| 01 | Experience Foundation | [volume-01-experience-foundation.md](volume-01-experience-foundation.md) |
| 02 | Visual Language | [volume-02-visual-language.md](volume-02-visual-language.md) |
| 03 | Composition Language | [volume-03-composition-language.md](volume-03-composition-language.md) |
| 04 | Structural Language | [volume-04-structural-language.md](volume-04-structural-language.md) |
| 05 | Behavior Language | [volume-05-behavior-language.md](volume-05-behavior-language.md) |
| 06 | Component Language | [volume-06-component-language.md](volume-06-component-language.md) |
| 07 | AI Design Language | [volume-07-ai-design-language.md](volume-07-ai-design-language.md) |
| 08 | Validation Language | [volume-08-validation-language.md](volume-08-validation-language.md) |

Note: Volume 08's file is named per this index, but its content heading in the source master document is "Pre-Implementation Disclosure" (a pre-implementation audit of how Volumes 01–07 had been applied so far). The heading was preserved exactly as written; only the file name follows the requested volume index.

The original master document, [LTOS_Design_Language_v1.md](LTOS_Design_Language_v1.md), remains the untouched source of these eight volumes.

## Governance

- Every design decision — color, layout, motion, copy, AI-generated output — must be traceable to a specific sentence in one of these volumes.
- No downstream instruction (a feature request, a prompt, a tool's default) may loosen a rule in these volumes, regardless of phrasing.
- Volumes 01–07 are law. Volume 08 is a disclosure record, not a rule set.
- Any conflict between this Design Language and the Source of Truth hierarchy above is resolved by that hierarchy, not by this document.

## Revision Policy

- This is Design Language v1.0 — initial publication. See [CHANGELOG.md](CHANGELOG.md).
- The master document is never rewritten, summarized, or reinterpreted in place; it is preserved as the historical source.
- Future revisions are published as new dated entries in CHANGELOG.md and, where a volume's content changes, as edits to that specific volume file — never as silent edits to the master document.
- No volume may be redefined by a downstream sprint without an explicit, logged decision, per the Decision Principle in Volume 01.
