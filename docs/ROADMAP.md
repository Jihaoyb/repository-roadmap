---
title: Roadmap
status: living
audience: contributors
updated: 2026-05-23
---

# Roadmap

Phased plan for getting from today's prototype to a v1 worth shipping. Read this alongside [VISION.md](./VISION.md) (the *what*) and the ADRs in [`adr/`](./adr/) (the *because*).

**Convention:** one milestone = one PR with ordered atomic commits, each individually passing `npm run lint && npm run build`. See [WORKING_AGREEMENTS.md](./WORKING_AGREEMENTS.md).

**Plan-rot discipline:** detailed atomic-commit breakdowns exist only for the **current** phase. When a new phase opens, its first PR expands milestones to commit granularity. Don't pre-bake commit sequences that will be stale by the time they execute.

## Phase model

| Phase | Goal | Why this comes next |
|---|---|---|
| **A — Stop the bleeding** | Honest, secure, rate-limit-safe v0 that loads small/medium repos | Nothing else is worth doing if A's bugs persist |
| **B — Foundation** | Real import resolution, durable caching, readable layout, search | Unlocks every later phase needing structured data + scale |
| **C — Semantic layer** | LLM summaries + architectural-layer inference | First "wow" moment; depends on B's parsers and cache |
| **D — Roadmap feature** | AI-generated reading order tailored to role | The product's namesake feature; depends on C's semantics |
| **E — Living memory** | Git-history overlay (churn, recency, co-change) | Differentiator; depends on B's adapter pattern |
| **F — Obsidian bridge** | Export to Obsidian vault | The portability story; depends on C and E for rich content |
| **G — Polish & distribute** | Syntax highlighting, deep links, public deploy | Make it real; last so we polish a complete thing |

**Phase dependencies:** A → B → {C, E} → {D, F}; G last. C and E can parallelize after B; D needs C, F needs C and E.

**Exit criteria** for each phase live at the end of each phase's section below.

---

## Phase A — Stop the bleeding

**Goal:** A v0 that loads a 1000-file repo without melting the rate limit, doesn't ship credentials to visitors, and has zero broken-by-design bugs from the prior review.

**Exit criteria:**
- All 14 prior-review bugs addressed or intentionally deferred with a tracked replacement.
- `npm run lint`, `npm run build`, `npm run type-check`, `npm test` all green.
- CI runs on every PR.
- README accurately describes current behavior.
- `docs/PROGRESS.md` updated, next phase queued.

### Milestones

#### A.0 — Planning foundation *(this PR — docs only)*

Establish the docs/, ADRs, ROADMAP, PROGRESS, WORKING_AGREEMENTS, and Claude entry point. Covered by this PR.

#### A.1 — Project hygiene *(no behavior change)*

Smallest, fastest PR first. No `src/` runtime changes.

- `chore: delete src/types/test.ts` *(bug 8)*
- `chore: fix Vite + React + TS title in index.html` *(bug 11)*
- `chore: replace Tailwind v3 directives with v4 @import in src/index.css` *(bug 10)*
- `chore: add .env.example documenting both token modes` *(bug 13, references ADR-0003)*
- `chore: add type-check script to package.json` *(bug 12)*
- `docs: rewrite README to match current state and link docs/` *(bug 12)*

#### A.2 — RepositoryGraph wiring

- `refactor: make RepositoryGraph consume its declared props` *(bug 1)*
- `fix: import GraphConfig in RepositoryGraph` *(bug 2)*
- `fix: wire setSelectedNode through store on file-node click` *(bug 9)*
- `fix: compute breadcrumb parent so back button shows real name` *(bug 3)*

#### A.3 — URL and content correctness

Introduces Vitest + RTL harness; first tests in the repo.

- `feat: robust GitHub URL parser (strips .git, slash, query, fragment)` *(bug 7)*
- `fix: decode file content via TextDecoder for UTF-8 safety` *(bug 4)*
- `build: introduce Vitest + React Testing Library`
- `test: cover GitHub URL parser`
- `test: cover content decoder`

#### A.4 — Rate-limit survival *(implements [ADR-0001](./adr/0001-lazy-file-content-fetch.md))*

The real fix. Largest PR of Phase A — split commits accordingly.

- `feat: switch initial load to Git Trees API (recursive, structure only)`
- `feat: introduce concurrency-limited fetch queue`
- `refactor: defer file content fetch to node-click event`
- `refactor: relationship analysis only runs on already-fetched files`
- `feat: mark unanalyzed nodes visibly in UI`
- `test: fixture-driven test for fetch ordering and concurrency cap` *(bug 5)*

#### A.5 — Relationship robustness (interim)

Interim fix only — the proper replacement is [ADR-0002](./adr/0002-ast-parser-for-imports.md) in B.1. This milestone exists to honor "every prior-review bug appears in Phase A." PROGRESS.md flags this as **superseded-by-B.1**.

- `fix: relative path resolution and extension probing in import matcher` *(bug 6)*
- `test: cover relative path resolution edge cases`

#### A.6 — Token handling alignment *(implements [ADR-0003](./adr/0003-token-handling.md))*

- `feat: localStorage PAT as primary token source` *(bug 14)*
- `chore: keep VITE_GITHUB_TOKEN as dev-only fallback with console.warn`
- `feat: token-source UI panel with rate-limit headroom`
- `docs: document both token modes in README and .env.example`

#### A.7 — Phase A close-out *(implements [ADR-0008](./adr/0008-ci-cd-pipeline.md) CI half)*

- `ci: add GitHub Actions workflow (lint + type-check + build + test)`
- `docs: update PROGRESS — Phase A complete, Phase B.1 is next`

---

## Phase B — Foundation

**Goal:** Replace the duct-tape Phase A correctness with real foundations: AST-based import resolution, IndexedDB persistence, hybrid layout, search/filter, share-link URL state. All later phases stand on these.

**Exit criteria:**
- JS/TS import edges are correct on a known-good sample of repos.
- Re-opening a repo from cache loads in <2 seconds.
- A 1000-node graph renders in hybrid mode without layout collapse.
- Share-link URLs reproduce the exact view they encoded.

### Milestones (titles + one-line goals; expand to commits at phase open)

- **B.1 — AST-based import resolution.** Implement [ADR-0002](./adr/0002-ast-parser-for-imports.md); supersedes A.5.
- **B.2 — IndexedDB persistence layer.** Implement [ADR-0007](./adr/0007-persistence.md); cache content + parse results.
- **B.3 — Hybrid layout.** Implement [ADR-0004](./adr/0004-layout-strategy.md); ship `tree` / `hybrid` / `force` view modes.
- **B.4 — Search and filter.** Path-glob, language, file-name search; result count visible; keybinding (`Cmd-K`).
- **B.5 — Share-link URL state.** Encode repo, selected node, view mode, role filter in URL; restore on load.

---

## Phase C — Semantic layer

**Goal:** Each module gets a short AI summary and an architectural-layer tag. The UI surfaces both.

**Exit criteria:**
- Every file has a cached summary (or "skipped: too large/binary").
- Every file has an inferred layer (`entry / route / service / data / ui / util / test / config / other`).
- Re-opening a repo doesn't re-summarize anything unchanged.

### Milestones

- **C.0 — Cost-measurement spike** *(resolves PROGRESS Q3)*. Time-boxed (~1 day) empirical run: pick 3 representative public repos at small/medium/large scales (≈50 / 500 / 5000 files); summarize each with 3 providers × 2 models each, including Ollama for the free path; record token counts, wall-clock times, and per-provider costs. Output: a `docs/research/llm-cost-spike.md` memo with a table, plus a recommended default cost ceiling that feeds C.1. **Gate: no LLM code lands in `master` before C.0 closes.**
- **C.1 — Summarizer adapter and provider registry.** Implement [ADR-0005](./adr/0005-llm-provider-and-caching.md); ship initial provider set (Anthropic, OpenAI, Ollama); first-run picker UX; SHA-keyed cache; default cost ceiling from C.0.
- **C.2 — Per-file summary on demand.** Click a file → see its summary; bulk-summarize toggle for whole repo with cost preview.
- **C.3 — Per-directory summary.** Roll up file summaries; cache per-dir at the directory's tree SHA.
- **C.4 — Architectural-layer inference.** Heuristic + LLM fallback; tag every node; color-code in graph.
- **C.5 — Per-node description in UI.** Hover/click reveals summary; share-link includes "show summaries" toggle.

---

## Phase D — Roadmap feature *(the namesake)*

**Goal:** Generate a sequenced reading walkthrough through the codebase, tailored to a role.

**Exit criteria:**
- A user picks a role and gets a 5–10-step ordered reading list with rationale per step.
- "Next" / "Previous" navigation jumps to the file and highlights its row.
- A roadmap is shareable via URL.

### Milestones

- **D.1 — Role definitions and prompts.** `engineer`, `reviewer`, `security-auditor`, `quick-tour`. Per-role prompt templates with versioning.
- **D.2 — Roadmap generation pipeline.** Inputs: graph + layer tags + entry points + file summaries → output: ordered list with rationale.
- **D.3 — Walkthrough UI.** Step-through panel; current-step indicator; "Next" highlights the corresponding node.
- **D.4 — Roadmap sharing.** URL-encoded; reproducible.

---

## Phase E — Living memory

**Goal:** Overlay git history so the user can see what's alive vs. dead.

**Exit criteria:**
- Node size = commits in last N days (configurable window).
- Node halo = recency (gradient from "this week" to "stale").
- Co-change clusters visible as optional view mode.

### Milestones

- **E.1 — Git history adapter.** Fetch commit history per path via GitHub commits API (paginated, cached).
- **E.2 — Churn metric.** Commit count per path in time window; expose in node size.
- **E.3 — Recency overlay.** Last-commit timestamp per file; expose as halo color.
- **E.4 — Co-change cluster view.** Files that change together (same commit) over the time window; render as additional edge layer.
- **E.5 — Hotspot view.** Files in the top decile of churn × number of dependents.

---

## Phase F — Obsidian bridge

**Goal:** Export an enriched analysis to an Obsidian vault.

**Exit criteria:**
- Export produces a working vault (opens in Obsidian, wikilinks resolve, frontmatter parses).
- `.canvas` snapshot opens and is navigable.
- Three pre-Phase-F verifications from the feasibility memo are resolved and ADR-0006 is Accepted.

### Milestones

- **F.0 — Run the three verifications.** Update [`research/obsidian-feasibility.md`](./research/obsidian-feasibility.md) and promote [ADR-0006](./adr/0006-obsidian-export-format.md) to Accepted.
- **F.1 — Exporter adapter.** Implement [ADR-0006](./adr/0006-obsidian-export-format.md) (vault layout, frontmatter shape, wikilinks, `.canvas`).
- **F.2 — Export trigger UI.** "Export to Obsidian Vault" button; produces a `.zip` download.
- **F.3 — Round-trip exploration.** Spike on re-import; outcome may be "post-v1" or "yes, ship F.4".

---

## Phase G — Polish & distribute

**Goal:** Make it a thing people can actually use and share.

### Milestones

- **G.1 — Syntax highlighting** in file preview (Shiki).
- **G.2 — Deep links** to editor (`vscode://`, `cursor://`) and GitHub permalinks.
- **G.3 — Recent repos list** (localStorage).
- **G.4 — Public deploy** *(implements [ADR-0008](./adr/0008-ci-cd-pipeline.md) CD half)*. Connect repo to Cloudflare Pages; configure SPA `_redirects`; verify preview-deploy per PR; pick portfolio-integration style (link / iframe / subdomain).
- **G.5 — Share-UX pass.** Open-graph cards, "Try this repo" demo links, README screencast.

---

## Explicit v1 out-of-scope

- Backend.
- Authentication / multi-user.
- Real-time collaboration.
- Multi-repo cross-graphs.
- Write-back to GitHub.
- Bidirectional Obsidian sync.
- Non-JS/TS language parsers (Python, Go, etc.).
- IDE plugin.

Each of the above is a defensible v2 capability; none is a v1 requirement.
