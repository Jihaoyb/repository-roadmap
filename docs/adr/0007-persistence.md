---
id: ADR-0007
title: Browser persistence
status: Accepted
date: 2026-05-23
deciders: jihao
---

# ADR-0007 — Browser persistence

## Context

Several capabilities want to survive a page reload:

- Fetched file content (per [ADR-0001](./0001-lazy-file-content-fetch.md), each fetch is rate-limited; refetching the same SHA is waste).
- Parse results (per [ADR-0002](./0002-ast-parser-for-imports.md), AST + import resolution is non-trivial cost).
- LLM summaries (per [ADR-0005](./0005-llm-provider-and-caching.md), each summary is paid).
- Layout snapshots (so a user revisiting the same repo sees stable positions).

`localStorage` (~5 MB, synchronous, string-only) is wrong for any of these. `IndexedDB` is the only serious option in the browser.

## Decision

A thin `Persistence` adapter wrapping `IndexedDB` (via [`idb-keyval`](https://github.com/jakearchibald/idb-keyval) — small, well-maintained, no schema needed).

- **Key shape:** `<namespace>:<schema-version>:<resource-key>`. Namespaces: `content`, `parse`, `summary`, `layout`, `meta`.
- **Resource key examples:** `content:1:<blobSHA>`; `summary:1:<provider>:<model>:<promptVersion>:<fileSHA>`.
- **TTL:** optional per record. Default forever (content is content-addressable; SHA = correctness).
- **Eviction:** LRU when storage quota approaches limit. Detect via `navigator.storage.estimate()`; evict oldest non-pinned entries.
- **Schema versioning:** every key includes a schema version. Bumping a version makes old entries dead-but-not-deleted (they age out via LRU). Hard migrations not needed for v1.
- **Cross-tab safety:** writes use a single tab's adapter; no locking. Last write wins. Acceptable for v1 (single-user, single-tab is the assumption per [ARCHITECTURE.md](../ARCHITECTURE.md) non-goals).

## Consequences

- App works offline after first load of a repo (modulo enrichments not yet computed).
- Re-opening a repo is near-instant from cache; ground-truth refresh is a deliberate user action.
- Browser quota (typically 60% of free disk, but per-origin limits apply) caps how many repos can be cached. LRU eviction handles overflow.
- No cross-device sync. Acceptable for v1. Post-v1 could add user-bring-your-own-storage (file system access API, R2 bucket, etc.).
- Schema-versioned keys mean we never have to write a migration in v1 — just bump the version when a shape changes, accept some cache churn.

## Alternatives considered

- **`localStorage`** — too small, synchronous, strings only. Rejected.
- **Cache API / Service Worker** — designed for HTTP resources; awkward fit for our typed-payload caching.
- **Raw `IndexedDB` (no helper)** — verbose; `idb-keyval` is ~1 KB and removes 80% of the boilerplate.
- **Memory-only cache** — no cross-session benefit; would re-pay every cost on reload. Rejected.
- **Backend storage** — requires backend; out of scope per [ADR-0003](./0003-token-handling.md).
