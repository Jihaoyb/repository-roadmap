---
title: Progress
status: living
audience: all
updated: 2026-05-28
read-first: true
---

# Progress — "You Are Here"

> **Every session starts here.** Read this file first, then the current phase in [ROADMAP.md](./ROADMAP.md), then any ADRs referenced by the current milestone. See [WORKING_AGREEMENTS.md](./WORKING_AGREEMENTS.md) for the full session ritual.

## You are here

- **Current phase:** A — Stop the bleeding
- **Current milestone:** A.2 — RepositoryGraph wiring
- **Next milestone after A.2 lands:** A.3 — URL and content correctness

## Recently completed

| Milestone | PR | Landed |
|---|---|---|
| A.1 — Project hygiene | [#3](https://github.com/Jihaoyb/repository-roadmap/pull/3) | 2026-05-28 |
| A.0 — Planning foundation | [#2](https://github.com/Jihaoyb/repository-roadmap/pull/2) | 2026-05-25 |

## Next action

**A.2 — RepositoryGraph wiring** is next — see [ROADMAP.md § Phase A.2](./ROADMAP.md#a2--repositorygraph-wiring). Note: A.1's build green-up already removed the dead props plumbing and the stale `RepositoryGraphProps` interface (resolving bug 2 and making `RepositoryGraph` store-driven), so A.2 should be re-scoped to the remaining wiring — feed `graphConfig` from the store (graph dimensions are hardcoded today), set the selected node on file-node click (bug 9), and fix the breadcrumb parent name (bug 3).

## Open questions

Most originally-parked questions have been resolved. The table below shows current state.

| # | Question | Status | Resolution |
|---|---|---|---|
| Q1 | LLM provider — Anthropic / OpenAI / Ollama / pluggable? | ✅ **Resolved 2026-05-23** | Multi-provider with first-run picker; initial set Anthropic + OpenAI + Ollama. See [ADR-0005](./adr/0005-llm-provider-and-caching.md). |
| Q2 | CI/CD platform — GitHub Actions vs. alternatives? | ✅ **Resolved 2026-05-23** | GitHub Actions (CI). See [ADR-0008](./adr/0008-ci-cd-pipeline.md). Implementation in A.7. |
| Q3 | LLM cost ceiling per repo — hard cap value? | ⏸️ **Deferred to C.0** | Empirically measured in Phase C.0 spike before any LLM code ships. Default ceiling falls out of that memo. |
| Q4 | JSON Canvas edge labels + Graph-view ingestion of `.canvas` | ✅ **Resolved 2026-05-23** | Edge labels persist (verified in v1.0 spec). Graph view ingests only `[[wikilinks]]`, not `.canvas`. See [research/obsidian-format-deep-dive.md](./research/obsidian-format-deep-dive.md) and [ADR-0006](./adr/0006-obsidian-export-format.md) (now Accepted). |
| Q5 | Public deploy host? | ✅ **Resolved 2026-05-23** | Cloudflare Pages (CD). See [ADR-0008](./adr/0008-ci-cd-pipeline.md). Implementation in G.4. Portfolio-integration style (link / iframe / subdomain) picked in G.5. |

Two small Obsidian items remain open but are minor finalization tasks for Phase F.0, not blockers:

- **Naming-collision policy** for files with the same basename in different folders (Obsidian wikilinks resolve by basename). Decide at F.0.
- **`.canvas` scale limit** — empirically test rendering for a synthetic 5k-node `.canvas`. May inform a "summarize at directory level for >N files" fallback.

## Known broken / deferred

| Item | Status | Resolved by |
|---|---|---|
| Bug 6 — `endsWith` import matcher misses relative paths, aliases, dynamic imports | Interim fix in A.5 | **B.1** — full AST resolution per [ADR-0002](./adr/0002-ast-parser-for-imports.md) |
| Obsidian round-trip (vault → app) | Deferred to post-v1 | TBD; flagged in [research/obsidian-feasibility.md](./research/obsidian-feasibility.md) |
| Non-JS/TS language parsers (Python, Go, etc.) | Deferred to v2 | Out of scope per [ROADMAP § v1 out-of-scope](./ROADMAP.md#explicit-v1-out-of-scope) |
| Multi-repo cross-graphs | Deferred to v2 | Out of scope |
| Real-time collaboration | Deferred to v2 | Out of scope |
| Backend proxy | Deferred to post-v1 | Re-evaluate if Cloudflare Pages free tier becomes limiting; would also enable centrally-managed LLM credentials |

## How this file gets updated

- When a milestone PR lands, the PR's final commit updates this file: move the milestone into "Recently completed," update "You are here," update "Next action."
- When a session encounters a blocker, add it to "Open questions" rather than guessing.
- When a decision is made that resolves an open question, mark it Resolved in the table with a date and a link to the ADR or memo that records the decision.
- Keep this file ≤80 lines. If it grows, move historical items into a `docs/CHANGELOG.md` (not yet needed).
