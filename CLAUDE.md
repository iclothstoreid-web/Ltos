# LTOS (Local Tailor Operating System)

## Project Identity

This repository is LTOS (Local Tailor Operating System).

LTOS is a production system for premium bespoke tailoring operations.

Preserve architectural consistency.

Never redesign the system unless explicitly requested.

---

# Core Principles

- Respect existing architecture.
- Prefer incremental implementation.
- Never rewrite stable modules.
- Keep changes localized.
- Preserve existing business logic.
- Production stability is more important than code elegance.

---

# Source of Truth Priority

Always use information in this order:

1. Source Code
2. LTOS Brain (Obsidian)
3. Architecture Documentation
4. ADR
5. Business Rules
6. Sprint Documentation

Never invent business rules or architecture.

If evidence is missing, say it is unknown.

---

# LTOS Brain

LTOS Brain is the project's permanent knowledge base.

Use LTOS Brain whenever implementation depends on:

- Architecture
- Business Rules
- Workflow
- Database Design
- ADR
- Sprint Decisions

Never contradict LTOS Brain without explicit instruction.

---

# Graphify

Graphify is the project's code intelligence system.

Use Graphify whenever tasks involve:

- Existing modules
- Shared components
- Refactoring
- Architecture understanding
- Dependency analysis
- RPC
- Database functions
- Migrations
- Cross-module implementation

Do not use Graphify for simple UI changes, styling, wording, icons, or isolated component edits.

Never guess dependencies if Graphify can verify them.

---

# Database Rules

Never modify database schema directly.

Always create migrations.

Prefer existing RPCs.

Do not duplicate business logic between frontend and backend.

Preserve data integrity.

---

# Development Rules

Before implementing:

- Understand the affected module.
- Verify dependencies when necessary.
- Preserve existing behavior.

After implementing:

- Check for architectural impact.
- Keep backward compatibility.
- Minimize side effects.

---

# Documentation Rules

Whenever a completed Sprint changes:

- Architecture
- Business Rules
- Database
- Workflow
- Modules
- AI Pipeline
- ADR

Update LTOS Brain using the Sprint Update Protocol.

Documentation is mandatory for completed architectural changes.

---

# Coding Style

Prefer:

- Existing project patterns
- Small commits
- Small PRs
- Incremental improvements

Avoid:

- Unnecessary abstraction
- Large rewrites
- Architecture redesign
- Duplicate logic

---

# Communication Style

Be concise.

Focus on implementation.

Do not propose redesigns unless requested.

When unsure, ask instead of assuming.

Always explain architectural impact before major changes.
