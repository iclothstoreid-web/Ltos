V-05


LTOS Design Language

Volume 05 — Behavior Language

---
1. State DNA

A state in LTOS is not an interface condition — it is the honest, current truth of something real: an order that is settled, a payment that is pending, a promise that is at risk. LTOS is never permitted to invent a state for the interface's own convenience. There is no decorative "syncing," no manufactured "almost there" — if a state is shown, something in the actual business is genuinely in that condition.

Every state inherits a temperature, exactly as every surface does in Volume 04 — and a state's presentation must match that temperature honestly, in both directions. An order that has passed its promised date is not allowed to look as calm as one on schedule; a routine, low-stakes update is not allowed to look as urgent as a broken promise. Dramatizing a minor state and dramatizing a major one identically is the same failure as showing no difference between them at all — both erase the very hierarchy Volumes 01–04 exist to protect.

States in LTOS are few, not many. A system that invents a new visible state for every possible technical condition (loading, syncing, refreshing, checking, verifying) has confused its own internal machinery with what the owner actually needs to know. LTOS only surfaces the states that correspond to something the owner would recognize from the workshop floor itself: waiting, in progress, at risk, resolved. Anything more granular belongs to the system's plumbing, not to the owner's experience.

---
2. Transition DNA

A transition is not decoration between two moments — it is the preservation of continuity, the guarantee that the owner never loses their place in the procession because something changed beneath them. LTOS never allows a change to happen so abruptly that it feels like the ground shifted, and never so slowly that the change becomes a performance demanding its own attention.

Transitions in LTOS honor sequence, as established in Volume 03. Moving from the Decision to the Periphery should feel like a deliberate step forward, not a jump cut to an unrelated place — the same way a tailor doesn't snap a client's attention from the mirror to the ledger without a beat in between. Where one thing causes another — an action producing a result — cause must always be felt to precede effect. LTOS never reveals a consequence before the owner has had a chance to register the action that produced it; doing so would break the one thing a transition exists to protect: the owner's confidence that they understand what just happened, and why.

A transition's duration is never arbitrary — it is set by how much the owner's understanding needs to catch up to the change, never by what looks impressive. The correct transition is the shortest one that does not sacrifice comprehension, and the moment it starts to feel showcased rather than felt, it has already gone on too long.

---
3. Reveal DNA

Reveal governs what is allowed to appear, in what order, and how much at once — and it inherits its discipline directly from Sequence DNA's rule that some things are not permitted to be seen at the same instant as the Decision, even if they will eventually sit on the same surface.

LTOS reveals the way a finished garment is shown to a client: first the whole silhouette, and only afterward — only if asked — the stitching detail underneath. Nothing in LTOS is permitted to expose its full depth immediately and indiscriminately; depth is something the owner reaches toward, not something thrown at them on arrival. A surface that reveals everything it knows the instant it loads has confused availability with disclosure — LTOS must always choose disclosure.

Reveal is earned through attention, not triggered by load time. Something should appear because the owner has arrived at the moment where it belongs in the procession — never simply because a process finished running in the background. And once something is revealed, it must never turn around and demand the owner's attention back a second time uninvited — a reveal that resurfaces itself, blinks, or nudges after the fact has broken its own contract with the owner's focus.

---
4. Feedback DNA

Feedback in LTOS answers one question, honestly and immediately, every time the owner acts: did what I just did actually register, and how much did it matter? Feedback is never permitted to be more triumphant than the action deserves, and never permitted to be quieter than the action's real consequence warrants.

A small, low-stakes action receives a small, quiet acknowledgment — nothing more. A genuinely consequential action — confirming an order, recording a payment, releasing cloth to be cut — receives feedback with real weight, proportional to what it represents in the actual business, so the owner is never left wondering whether something serious truly landed. This is the same discipline as Volume 02's Color DNA reserving red for one true alarm: feedback that celebrates everything equally has celebrated nothing.

Feedback must never be theatrical, and it must never reassure before it is true. A false "success," shown a beat before the underlying commitment is actually secured, is a lie LTOS is never permitted to tell — even for a fraction of a second, even to make the experience feel faster. And as Volume 01 already established: silence is valid feedback. When nothing needs to be said — when an action was routine and completed exactly as expected — LTOS is allowed to say nothing at all, and that silence is not an omission, it is the correct response.

---
5. Tempo DNA

Tempo is the temporal personality of the whole system — distinct from the spatial rhythm of Volume 03, this is about time itself, not space. LTOS is unhurried by design, and it must never treat speed as proof of quality. An operation that represents something consequential in the real world — a render, a commitment, a calculation with real stakes — is allowed, even expected, to visibly take the time it actually takes. Faking instantness on something consequential is a small dishonesty, and LTOS cannot afford small dishonesties any more than large ones.

At the same time, tempo must never be artificially slowed for effect — manufactured suspense is exactly as false as manufactured speed. The correct tempo is always the honest one: as fast as the underlying truth allows, and no faster.

Tempo also governs how often LTOS is allowed to ask anything of the owner. A system that interrupts frequently, or introduces new demands without warning, has violated the same trust that Density DNA protects in space — except here the violation happens across time instead of across a surface. LTOS asks for attention the way a well-run workshop asks for a client's time: rarely, at the right moment, and never twice for the same thing. Protecting the owner from interruption is not a courtesy in LTOS — it is the same discipline as protecting the Decision from bleed, applied to the clock instead of the page.

---
Backlog

(Out of scope for CD-05 — logged only so nothing is lost.)

- Concrete motion specs: easing curves, durations, animation timing values (candidate: CD-06 — Motion & Interaction)
- Loading indicators, spinners, skeleton states as concrete patterns (candidate: CD-06)
- Notification/toast mechanics as concrete components (candidate: CD-06)
- Iconography (candidate: CD-06 or later)
- Layout, spacing, typography, color — already defined in Volumes 02–04, referenced here only behaviorally, not redefined
- Responsive/adaptive behavior of state, transition, and tempo across breakpoints and devices (candidate: later sprint)
- Application of State/Transition/Reveal/Feedback/Tempo DNA to the actual Owner Decision Room homepage screen (candidate: Sprint D.1 — Decision Room Screen, still pending CD-06)

