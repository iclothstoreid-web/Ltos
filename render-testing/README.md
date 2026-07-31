# AI Render Test Framework (Sprint AI-R2.5)

Permanent regression-testing dataset + runner for the AI Render Engine.
Everything under this folder is data/output, not application code — the
actual framework code lives in `src/lib/design/promptArchitectureV2/` and
`scripts/render-test-runner.ts`.

## Folders

- `customers/manifest.json` — Golden Dataset customer roster (photo + label).
- `dna/manifest.json` — Golden Dataset DNA scenario roster (component
  selections per scenario).
- `results/<run-timestamp>/` — one JSON file per (customer × DNA × prompt
  version) scenario for that run. Never overwritten — every `npm run
  render:test` invocation gets its own timestamp folder.
- `reports/<run-timestamp>.md` — one Regression Report per run (see Part 8
  of the sprint brief: Tanggal, Model AI, Prompt Version, Serializer
  Version, Compression Version, Input Fidelity, Reference Images, Prompt,
  Revised Prompt, Validation, Output).

## Current status — BLOCKED on real data

Both manifests ship with every `photoUrl`/`componentId` set to `null` and a
`"BELUM DIISI"` note. This is intentional, not a bug: as of this sprint
there is no real Golden Dataset to test against —

- **Customer photos**: the production database was reset to a fresh-install
  state on 2026-07-26; no customer photos exist to reuse, and none were
  supplied for this sprint.
- **Master data IDs**: `design_master_options` likewise has no confirmed
  "Saudi Modern" model_thobe variants (Slim/Regular) or warna_bahan rows
  (Black/Maroon/White) with real, approved AI Design DNA to point at.

Running `npm run render:test` today will report every scenario as
**SKIPPED** — it will not crash, fabricate data, or silently pass. This
matches Sprint AI-R2's own Part 7 finding (see project memory
`project_ltos_ai_r2_render_quality.md`): the golden test was blocked on the
same two things then, and still is now.

## Filling in the dataset

1. **Customers** — upload a real full-body customer photo (Storage or any
   public HTTPS URL) for each of the 5 slots (Slim/Athletic/Large/Short/
   Beard) and set `photoUrl` in `customers/manifest.json`.
2. **DNA scenarios** — pick real `design_master_options.id` rows (Owner OS →
   Master Data, or query the table directly) with `ai_dna.status` at least
   `draft` for `model_thobe` / `look_cutting` / `warna_bahan`, and set
   `componentId` in `dna/manifest.json`.
3. Re-run `npm run render:test` — any scenario with all fields filled in
   will actually execute (dry run by default; add `--live` to spend real
   OpenAI credits).

## Running

```
npm run render:test                        # dry run, V1 prompt, all scenarios
npm run render:test -- --live               # actually call OpenAI (spends money)
npm run render:test -- --promptVersion=v2   # use Prompt Architecture V2 instead of V1
npm run render:test -- --promptVersion=both # run both V1 and V2 per scenario
npm run render:test -- --runVisionJudge     # also run the AI quality judge (spends more money, only with --live)
```

`RENDER_DEBUG_MODE=false npm run render:test` switches to Production mode
(Part 9) — saved result files become terse PASS/FAIL summaries instead of
full payload/prompt/revised-prompt dumps. Debug mode (full detail) is the
default.

Requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
(for `--live`) `OPENAI_API_KEY` in `.env.local` — the same variables the
Next.js app itself uses.
