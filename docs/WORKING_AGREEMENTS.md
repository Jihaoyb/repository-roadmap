---
title: Working Agreements
status: living
audience: contributors (human and AI)
updated: 2026-05-23
---

# Working Agreements

How we work on Repository Roadmap. Every contributor — human or AI — follows these. If you find yourself wanting to break a rule, open an ADR explaining why, don't just deviate.

## Session Startup Ritual

Every coding session begins by reading, in order:

1. [`docs/PROGRESS.md`](./PROGRESS.md) — the "you are here" pointer. Tells you the current phase, the current milestone, and the next action.
2. The current phase's section in [`docs/ROADMAP.md`](./ROADMAP.md).
3. Any ADRs in [`docs/adr/`](./adr/) referenced by the current milestone.
4. The relevant source files (the milestone names them).

Do not start editing code before this loop. Two minutes of reading saves an hour of rework.

## PR Rules

- **One milestone = one PR.** Milestones are defined in [`docs/ROADMAP.md`](./ROADMAP.md). Don't bundle, don't split.
- **PR title** = milestone identifier and short summary, e.g. `A.2 — RepositoryGraph wiring`.
- **PR description** includes: linked milestone, summary of changes, the verification you ran, and any deviations from the plan with rationale.
- **No drive-by changes.** If you spot something unrelated, open a tracked task or follow-up PR.

## Commit Conventions

- **Conventional Commits.** Prefix every commit with one of: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `perf:`, `build:`, `ci:`.
- **Atomic and ordered.** Within a PR, sequence commits as: scaffold → mechanism → wiring → tests → docs. Each commit individually passes `npm run lint && npm run build` (and `npm test` once tests exist).
- **One subject line per commit, ≤72 chars.** Body wraps at 72.
- **No squash on merge.** We keep the atomic history; the PR review surface is the commit list.
- **Co-authored AI commits** include `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` (or appropriate model attribution).

## ADR Rules

- **When required:** any decision with cross-cutting impact, any reversal of an earlier decision, any choice the next contributor would otherwise have to re-litigate.
- **Path:** `docs/adr/NNNN-kebab-title.md`, four-digit zero-padded sequence.
- **Format:** YAML frontmatter (`status`, `date`, `deciders`) + four sections: `Context`, `Decision`, `Consequences`, `Alternatives Considered`.
- **Length cap:** ≤60 lines. ADRs are read often; brevity is a feature.
- **Status values:** `Proposed`, `Accepted`, `Superseded by ADR-NNNN`, `Deprecated`. Never delete an ADR — mark it superseded.
- **ADR-first for new decisions.** Write the ADR, get it merged or at least reviewed, then write the code.

## Definition of Done (per milestone)

Before opening a PR for review:

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm run type-check` passes (once introduced in A.1)
- [ ] `npm test` passes (once introduced in A.3)
- [ ] Every commit individually passes the above (`git rebase --exec`)
- [ ] [`docs/PROGRESS.md`](./PROGRESS.md) is updated: milestone marked done, next action set
- [ ] Any new ADRs are in `docs/adr/`
- [ ] README is touched only if user-visible behavior changed
- [ ] Verification steps from the milestone are run and noted in the PR body

## What to Do When Blocked

- **Don't guess.** Add an entry to the "Open Questions" section of [`docs/PROGRESS.md`](./PROGRESS.md) describing the blocker and what input you need.
- **Don't half-finish.** If a milestone can't complete cleanly, leave the work on the branch, document the partial state in `PROGRESS.md` under "Known broken / deferred," and stop.
- **Scope creep is the enemy.** If a fix uncovers a bigger problem, log it as a future milestone — don't expand the current one.

## File Hygiene

- **Frontmatter on every doc.** YAML at the top with at minimum `title` and `status`. Forward-compatibility with the eventual Obsidian export.
- **Mermaid for diagrams.** Renders on GitHub and in Obsidian.
- **No mock code in `src/`.** Test fixtures live in `test/fixtures/` or co-located `*.test.ts` files.
- **No commented-out code.** Delete it. Git remembers.

## Reading the Roadmap

Phases A–G are sequenced. Detailed atomic-commit plans exist **only for the current phase**. When opening a new phase, the first PR in that phase expands the milestone list with its atomic commits. We do this to avoid plan rot.
