---
title: Progress
status: living
audience: all
updated: 2026-05-23
read-first: true
---

# Progress — "You Are Here"

> **Every session starts here.** Read this file first, then the current phase in [ROADMAP.md](./ROADMAP.md), then any ADRs referenced by the current milestone. See [WORKING_AGREEMENTS.md](./WORKING_AGREEMENTS.md) for the full session ritual.

## You are here

- **Current phase:** A — Stop the bleeding
- **Current milestone:** A.0 — Planning foundation *(in flight as the PR containing this file)*
- **Next milestone after A.0 lands:** A.1 — Project hygiene

## Recently completed

| Milestone | PR | Landed |
|---|---|---|
| *(none yet — A.0 is the first)* | | |

## Next action

Open and merge the PR for **A.0 — Planning foundation** (this branch: `docs/planning-foundation` → `master`). After merge, the next session opens A.1 by reading [ROADMAP.md § Phase A.1](./ROADMAP.md#a1--project-hygiene) and beginning with the first commit in that milestone (`chore: delete src/types/test.ts`).

## Open questions

These are decisions the project owner needs to make. They are **not blocking A.1** but each must be resolved before its referenced milestone.

| # | Question | Blocks | Notes |
|---|---|---|---|
| Q1 | LLM provider — Anthropic / OpenAI / Ollama / pluggable-with-default? | ADR-0005 finalization → Phase C.1 | Affects cost ceiling and whether keys live in browser only. |
| Q2 | Deploy target — local-only for v1, or public deploy from day 1? | ADR-0003 emphasis → Phase G.4 | Affects whether `localStorage` PAT is primary or secondary mode. |
| Q3 | LLM cost ceiling per repo — hard cap value? | ADR-0005 finalization → Phase C.2 | Drives whether C.2 ships a tiered summarization strategy. |
| Q4 | Do `.canvas` files persist edge labels in their JSON? Does Obsidian's Graph view ingest `.canvas` content? | ADR-0006 promotion to Accepted → Phase F.1 | Verifiable in a 30-min hand-built test vault (see [research/obsidian-feasibility.md § Open verifications](./research/obsidian-feasibility.md)). Scheduled for F.0. |
| Q5 | Public deploy target (Vercel / Cloudflare Pages / GitHub Pages / Netlify / self-host)? | Phase G.4 | Tied to Q2. |

## Known broken / deferred

| Item | Status | Resolved by |
|---|---|---|
| Bug 6 — `endsWith` import matcher misses relative paths, aliases, dynamic imports | Interim fix in A.5 | **B.1** — full AST resolution per [ADR-0002](./adr/0002-ast-parser-for-imports.md) |
| Obsidian round-trip (vault → app) | Deferred to post-v1 | TBD; flagged in [research/obsidian-feasibility.md](./research/obsidian-feasibility.md) |
| Non-JS/TS language parsers (Python, Go, etc.) | Deferred to v2 | Out of scope per [ROADMAP § v1 out-of-scope](./ROADMAP.md#explicit-v1-out-of-scope) |
| Multi-repo cross-graphs | Deferred to v2 | Out of scope |
| Real-time collaboration | Deferred to v2 | Out of scope |
| Backend proxy | Deferred to post-v1 | Re-evaluate when public deploy decision (Q2) is made |

## How this file gets updated

- When a milestone PR lands, the PR's final commit updates this file: move the milestone into "Recently completed," update "You are here," update "Next action."
- When a session encounters a blocker, add it to "Open questions" rather than guessing.
- When a decision is made that resolves an open question, remove the row from this file and capture the decision in an ADR.
- Keep this file ≤80 lines. If it grows, move historical items into a `docs/CHANGELOG.md` (not yet needed).
