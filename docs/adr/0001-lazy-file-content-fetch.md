---
id: ADR-0001
title: Lazy file content fetch
status: Accepted
date: 2026-05-23
deciders: jihao
---

# ADR-0001 — Lazy file content fetch

## Context

Current `src/services/github.ts` walks the repo recursively and fetches every file's content eagerly via `octokit.repos.getContent`, with unbounded `Promise.all` parallelism. For any repo above ~200 files this exhausts the 5000-req/hr authenticated rate limit before the graph renders, and stalls the browser. This is the single biggest blocker to the app being usable on real repos.

## Decision

Two changes:

1. **Initial load fetches structure only.** Use `GET /repos/{owner}/{repo}/git/trees/{sha}?recursive=1` — a single API call that returns the entire tree (paths, blob SHAs, sizes) without content. Sufficient to render the graph.
2. **File content fetched lazily on demand** — when a user clicks a node, or when the Summarizer needs the content for a per-file summary (Phase C). All per-file fetches flow through a concurrency-limited queue (cap 6 concurrent), implemented via `p-limit` or hand-rolled if we want zero deps.

Relationship analysis ([ADR-0002](./0002-ast-parser-for-imports.md)) runs only over already-fetched files. Unanalyzed nodes are visibly marked in the UI so users know what's complete.

## Consequences

- Initial load drops from O(files) requests to O(1).
- First-click latency on a file: ~one round-trip plus parse. Acceptable.
- Relationship edges appear progressively as files are explored. Need a UI affordance (e.g., "Analyze all" button, with rate-limit-aware confirmation).
- Requires a `Persistence` layer ([ADR-0007](./0007-persistence.md)) so re-clicking doesn't refetch.
- The current `analyzeFileRelationships` call inside `fetchContents` moves out — see [ADR-0002](./0002-ast-parser-for-imports.md) for the replacement.

## Alternatives considered

- **Eager fetch with concurrency limit only** — addresses the parallelism bomb but still consumes the rate limit budget; a 1000-file repo still costs 1000 requests. Rejected: bandwidth-and-quota-wasteful for files the user may never open.
- **Backend proxy that caches content** — defers cost but adds infrastructure we don't have ([ADR-0003](./0003-token-handling.md) keeps us browser-only in v1). Rejected for v1.
- **GraphQL `repository.object(expression:"HEAD:") { ... entries { ... } }`** — capable but requires building a custom recursive query and still hits secondary rate limits on large repos. Trees REST API is simpler and sufficient.
