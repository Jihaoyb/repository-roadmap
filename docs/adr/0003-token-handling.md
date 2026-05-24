---
id: ADR-0003
title: GitHub token handling
status: Accepted
date: 2026-05-23
deciders: jihao
---

# ADR-0003 — GitHub token handling

## Context

Today, `VITE_GITHUB_TOKEN` is read at build time via `import.meta.env`. Vite inlines this string into the bundle. For local development this is fine; for any public deploy it ships the developer's PAT to every visitor — a serious credential leak.

We need a model that supports two realities:

- **Local dev:** the developer wants frictionless access via `.env`.
- **Public deploy:** each visitor must use their own credentials, and our build must not contain any token.

We are deferring a backend ([VISION non-goals](../ARCHITECTURE.md)), so token handling stays browser-side in v1.

## Decision

Two modes, ordered by precedence at runtime:

1. **localStorage PAT** — if a key `github-pat` is set in `localStorage`, use it. UI provides a "Set GitHub token" affordance to populate this. Per-browser, per-user.
2. **`VITE_GITHUB_TOKEN`** — if (1) is absent and the env var was present at build time, fall back to it, with a `console.warn` flagging this as dev-only.
3. **Anonymous** — if neither is present, send unauthenticated requests (60 req/hr rate limit, suitable only for tiny demos).

Builds intended for public deploy must omit `VITE_GITHUB_TOKEN` from the environment at build time so it can't be inlined.

UI requirements:
- A clear "Token" panel showing source (localStorage / env / anonymous) and current rate-limit headroom.
- A "Clear token" button for the localStorage entry.

## Consequences

- Public deploys are safe: zero credentials in the bundle.
- Each user supplies a PAT or accepts severe rate limits. Documented in README.
- Token never leaves the browser; no logging, no analytics capture.
- A future backend (post-v1) can be introduced without changing the contract — `RepoSource` adapter implementation swaps; everything above is unchanged.

## Alternatives considered

- **Backend proxy in v1** — Right answer eventually, but premature now: deploy target undecided (parked open question), team is one person, infra cost > zero. Defer.
- **GitHub OAuth (device or web flow) in v1** — Requires a registered app and server-side client secret. Same backend dependency. Defer.
- **Build-time env var only** — Status quo. Unsafe for public deploy. Rejected.
- **Prompt for PAT every session** — User-hostile and incompatible with shareable URLs.
