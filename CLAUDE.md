# CLAUDE.md

Guidance for Claude (and Claude Code sessions) working on this repository.

## Start every session by reading

1. [`docs/PROGRESS.md`](docs/PROGRESS.md) — "you are here"
2. The current phase in [`docs/ROADMAP.md`](docs/ROADMAP.md)
3. Any ADRs in [`docs/adr/`](docs/adr/) referenced by the current milestone

Do not edit code before this. See [`docs/WORKING_AGREEMENTS.md`](docs/WORKING_AGREEMENTS.md) for the full session ritual.

## Hard rules

- **One milestone = one PR**, atomic ordered commits inside (`scaffold → mechanism → wiring → tests → docs`). Each commit must individually pass `npm run lint && npm run build`.
- **Conventional Commits** prefix on every commit (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, etc.).
- **No drive-by changes.** Spotted something off-topic? Surface it as a follow-up task, don't bundle.
- **ADR before code** for cross-cutting decisions. Stub as `Status: Proposed` if not ready to commit; expand when the phase opens.
- **When blocked, park.** Add the question to `docs/PROGRESS.md` → "Open Questions". Do not guess.

## Repo-specific quirks

- Tailwind v4 is installed but `src/index.css` still uses v3 directives — flagged for Phase A.1.
- `VITE_GITHUB_TOKEN` is the current token mechanism; Phase A.6 migrates to a PAT-in-localStorage model (ADR-0003).
- `src/services/github.ts` eagerly fetches every file's content on initial load — known rate-limit time-bomb, fixed in A.4 (ADR-0001).
- `.claude/launch.json` defines `vite-dev` (5173) and `vite-preview` (4173) for the Claude Code preview tool.

## Out of scope for any session

Don't add features beyond the current phase. Don't refactor outside the milestone's surface. The roadmap is sequenced for a reason.
