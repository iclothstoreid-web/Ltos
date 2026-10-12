# Local Tailor AI Sales V2 — Conversation Engine

## Goal

Make WhatsApp feel like a capable Local Tailor salesperson: human, concise, contextual, visual when requested, and always moving one natural decision forward.

The LLM writes language. LTOS owns state, truth, actions, media delivery, and handoff.

## Core contract

```
WhatsApp burst
→ persist inbound messages
→ build one customer turn
→ deterministic safety/handoff checks
→ deterministic visual selection
→ LLM decision with customer state + verified media plan
→ persist next state
→ execute real media/action
→ send concise reply
→ observe customer outcome
```

The model is never allowed to be the sole source of truth for:
- whether an image exists
- whether an image was actually delivered
- price / DP / stock / bank / production facts
- whether a human has taken over

## Conversation state

State lives in `ai_sales_conversations.context.lead`.

Important working-memory keys:
- name / city
- occasion
- model
- fabric
- color
- collar
- placket
- pocket
- cuff
- cutting
- fittingPreference
- referenceGarment
- fitConcern
- preferredAddress
- next step through stage + conversationSense

Rule: a locked customer choice is not reopened unless the customer changes it.

## Address memory

`preferredAddress` supports:
- Pak
- Bapak
- Kang
- Kak
- Mas
- Bang
- Ustadz

Explicit customer corrections win immediately. Example: "saya akhwat" → Kak.

Never infer gender, age, religion, ethnicity, or identity from a name/photo/city.

## Visual action contract

Visuals are an execution concern, not an LLM promise.

When a customer asks to see an example:
1. `selectAiSalesMediaAssets()` runs before the LLM reply.
2. The LLM receives only metadata for the selected verified assets.
3. For explicit visual requests, LTOS sends the actual media before the text reply.
4. If no verified media matches, LTOS tells the customer honestly and hands off.
5. If delivery fails, LTOS hands off instead of continuing to promise an image.

A customer asking for multiple options may receive up to three relevant visuals. Generic model requests prefer full-model assets, not close-up starter images.

## Media activation

Ingestion remains conservative: uploads default to inactive.

Verified design-part categories may be activated after review:
- collar
- cufflink
- placket
- pocket
- zigzag

Ambiguous fabrics and model-detail images stay inactive until their metadata is trustworthy.

## Women's garment requests

The current verified AI media/product library is thobe-focused. If a customer asks for abaya/gamis wanita and no verified library exists, the AI must not invent model names or visuals. It hands off to a human while preserving any thobe/couple context.

## Human handoff

Immediate deterministic handoff if the customer:
- asks for admin / human / salesperson
- says the bot is looping, confusing, repeating, or not connecting
- asks for an unsupported women's garment visual
- requests an explicit visual that cannot be found/delivered

After handoff, AI stays silent until human mode is released.

## Learning loop

Two layers:

### Curated training examples
`ai_sales_training_examples`
- owner-approved patterns
- high priority
- safe for sales-flow learning

### Dynamic owner examples
`ai_sales_owner_learning_examples`
- pairs real customer message → owner/admin reply → next customer reaction
- progression gets higher priority
- sanitized before prompt use
- used for tone, cadence, and next-step behavior only

Historical owner examples are never a source of:
- current prices
- current stock
- account numbers
- payment rules
- product claims

Those remain sourced from live LTOS commercial/business data.

## Learning signal rule

Correction/complaint signals have priority over generic progress keywords.

For example:
- "ukurannya salah, pusing" → needs_review
- "oke lanjut fitting" → progressed

Human outbound replies are now observed too, not only assistant replies.

## Prompt budget

The runtime deliberately limits retrieved knowledge per turn:
- only relevant brain entries
- only a small number of training examples
- bounded catalog/fabric/fact lists

This reduces empty model replies and prevents irrelevant history from overwhelming the current customer intent.

## Regression checks

Run:

```bash
npm run ai-sales:test
```

Coverage includes:
- starter visuals
- model visual selection
- model + fabric reference selection
- multiple model options
- component visuals
- unverified women's visual rejection
- WhatsApp echo parsing
- contextual follow-up timing

## Sales principle

One customer turn → one useful answer → one natural next decision.

Never:
- reset the conversation
- ask again what is already known
- flood the customer with a catalog
- promise an image before the action layer has selected it
- keep selling after the customer asks for space/human help
