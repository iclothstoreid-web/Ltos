V-06


LTOS Design Language

Volume 06 — Component Language

---
Preface

No component in this volume exists on its own authority. Each one is a specific, load-bearing consequence of Volumes 01–05 — Experience Foundation, Visual Language, Composition Language, Structural Language, Behavior Language. A component that cannot answer which principle from those five volumes required it to exist does not belong in LTOS, no matter how familiar it looks in other software. This volume defines what each component is for — never how it looks, how it's built, or what it's made of.

---
1. Surface DNA

The Surface is the base unit every other component in this volume is built from — the physical answer to Volume 04's Boundary and Containment DNA. A Surface exists only when content needs to be protected from what sits beside it: it is a claim of belonging, not a decorative container.

A Surface is never created out of habit. Its existence is always an answer to a specific question: what does this need to be kept separate from? If nothing needs separating, there is no Surface — the content simply exists in the open field, trusted to be understood in context. A Surface inherits its temperature from its register (Lead, Periphery, or Record, per Volume 03) and its entire character — how much space surrounds it, how firmly it's bounded — follows from that temperature, never from a desire to make the page "feel complete."

---
2. Button DNA

A Button is not a clickable element — it is the mechanism by which the owner commits to something. Because LTOS permits exactly one Decision per Decision surface (Volume 01), a Button's presence is rare and deliberate by design, never a reflexive addition to "give the user an action."

There are only two legitimate registers: the decisive act — the one commitment a Decision surface exists to invite — and the alternate act — a lower-stakes path away from that commitment (defer, review further, dismiss). A third button on the same surface is not a convenience; it is evidence the surface is trying to hold more than one decision, and Volume 01's Single-Sentence Test has already failed. A Button's response to being pressed inherits Feedback DNA exactly: proportional to what was just committed, never premature, never theatrical.

---
3. Form DNA

A Form is the one moment LTOS is permitted to ask something of the owner rather than report something to them — and because Tempo DNA (Volume 05) strictly limits how often interruption is allowed, a Form must always justify itself as the genuine site of a real decision, never as a convenient way to collect data for the system's own bookkeeping.

A Form behaves the way a respectful question behaves: it asks one thing, waits for the answer, and only then reveals what comes next — never the entire eventual field set at once (Reveal DNA, Volume 05). A Form that presents everything it will ever need simultaneously has confused thoroughness with respect; LTOS chooses respect every time.

---
4. Ledger DNA

The Ledger is the quiet record of many small, true facts that don't individually rise to the level of a Decision but must remain honestly findable — the component form of the Periphery and the Record. A Ledger is read the way a bound ledger book is read: top to bottom, entry by entry, for recognition and trust, never for comparison or analysis.

A Ledger's entire purpose is to make good on Volume 01's promise that "nothing is ever truly gone" — its presence tells the owner that a fact still exists and is still accounted for, even while it recedes from immediate attention. A Ledger never invites sorting, filtering, or interrogation; the moment it does, it has become something else — a Table.

---
5. Table DNA

A Table exists only for the rare moment when comparison across many like things is genuinely the point — several people's performance, several transactions weighed against each other. It is a heavier, more analytical instrument than a Ledger, and its rarity is deliberate: LTOS generally avoids inviting the owner into open-ended analysis, because open-ended analysis is exactly what the Decision Room exists to have already done on their behalf.

Where a Ledger says "here is what is true, filed and safe," a Table says "you have chosen to examine this closely." Its presence on a surface should always be a signal that the owner has stepped, on purpose, into a moment of comparison — never something LTOS defaults to simply because a list has more than a few rows.

---
6. Timeline DNA

The Timeline is Sequence DNA (Volume 03) applied to a single tracked thing — one order, one process — moving through its own stages over time. It is strictly ordered and directional, and above all, it is honest: it must show, at any moment, exactly where the real current position is, and it must never imply progress that hasn't actually happened.

A Timeline is not a decorative "steps" indicator meant to make a process feel more advanced than it is. Its entire authority comes from State DNA's discipline (Volume 05): if a stage isn't truly complete, the Timeline says so plainly, even when that's an uncomfortable thing to show. A Timeline that flatters is a Timeline that has broken the one trust it exists to keep.

---
7. Dialog DNA

The Dialog is the most temporary structural interruption LTOS permits — a surface that exists only long enough to answer one bounded question, then vanishes completely, returning the owner to precisely where they were, with full continuity intact (Transition DNA, Volume 05). A Dialog is never a space for browsing or exploration; it exists for one confirmation or one decision that doesn't deserve a permanent home of its own.

Because interruption is costly (Tempo DNA), a Dialog must always feel like a brief, respectful pause — never a detour the owner has to find their way back from. If a Dialog starts accumulating tabs, steps, or multiple unrelated questions, it has stopped being a Dialog and become an unacknowledged Form.

---
8. Navigation DNA

Navigation in LTOS is not a menu inviting exploration — it is the quiet, background awareness of where the workshop's other rooms are, present only for the moment the owner deliberately chooses to leave the current one. Its correct behavior is closer to knowing where the door is than to being handed a map: the owner already understands their own business; navigation only confirms the door hasn't moved.

Navigation must never compete with the Decision for attention (Boundary and Density DNA, Volume 04) — it recedes to the edge of perception by default and asserts itself only when sought. A navigation system that announces itself loudly on every surface has mistaken availability for importance, the same error Reveal DNA already forbids elsewhere.

---
9. Badge & Status DNA

A Badge is the smallest unit of honest signal LTOS produces — one mark, reporting one real, specific condition, without elaboration. Its entire discipline is restraint, directly inherited from Volume 02's rule that only one color in the system is permitted to mean alarm, and from Volume 05's insistence that a state must never be dramatized or understated relative to its real stakes.

A Badge is never decorative and never used to make routine information look more urgent than it is, or urgent information look calmer than it is. Every Badge is, in effect, a small promise: that something specific and real — not merely plausible or approximate — is currently true.

---
10. Empty State DNA

The Empty State is the most misunderstood component in most software, and possibly the most important one in LTOS. In most systems, an empty state apologizes — it implies something is missing, unfinished, or waiting to be filled. In LTOS, an empty state is one of the most confident moments the system can produce, because "there is nothing that needs you right now" is genuinely good news, and it deserves to be said as plainly and calmly as any other true fact.

An empty state must never be styled as a lesser or unfinished version of a populated surface — it is a fully composed state in its own right, entitled to the same quiet dignity as everything else in the Design Language. When LTOS has nothing urgent to report, it should feel exactly as settled and complete as a well-run workshop at the end of a good day — not like a screen still waiting for content to arrive.

---
Backlog

(Out of scope for CD-06 — logged only so nothing is lost.)

- Concrete implementation of each component (framework, markup, styling) — explicitly deferred, this volume defines purpose only
- Design tokens, spacing/px/rem values, responsive behavior for any component above (candidate: CD-07 — Implementation Grammar, first sprint permitted to touch concrete values)
- Iconography as it applies to Navigation, Badge, and Empty State (candidate: CD-07 or later)
- Full application of Volumes 01–06 to the actual Owner Decision Room homepage screen (candidate: Sprint D.1 — Decision Room Screen — with all six DNA volumes now locked, this is the next unblocked sprint)

