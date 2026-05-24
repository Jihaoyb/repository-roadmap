---
id: ADR-0005
title: LLM provider and caching
status: Proposed
date: 2026-05-23
deciders: jihao
expand-on: phase-C-open
---

# ADR-0005 — LLM provider and caching

> **Status: Proposed.** This ADR is a stub. The provider choice is parked as an open question in [`PROGRESS.md`](../PROGRESS.md). The full design — provider selection, cost ceiling, prompt versioning conventions — will be expanded when Phase C opens. We are landing a stub now to reserve the ADR number and to commit to the cache shape, which informs [ADR-0007](./0007-persistence.md).

## Context

Phase C introduces semantic enrichment: per-file and per-directory summaries, architectural-layer inference (entry / route / service / data / ui / util / test), and per-node descriptions in the UI. All of these require LLM calls.

Three concerns:

1. **Provider lock-in.** Hard-coding one provider makes swapping costly. Different users will want different providers (cost, privacy, local-vs-cloud).
2. **Cost.** A 1000-file repo at one summary per file plus aggregations is real money if uncached.
3. **Determinism.** A summary should be stable across reloads as long as the file content hasn't changed.

## Decision (provisional)

- **Adapter interface.** `Summarizer` (see [ARCHITECTURE.md](../ARCHITECTURE.md)). Implementations live in `src/adapters/summarizer/<provider>.ts`. Default provider: **TBD** — parked open question.
- **Cache key.** `summary:<schema-version>:<provider>:<model>:<prompt-version>:<file-SHA>`. Any one of those changing produces a cache miss; identical-content + same prompt + same model = guaranteed cache hit.
- **Prompt versioning.** Each prompt template carries a semver-like version. Bumping it forces re-summarization for the affected resource type.
- **Storage.** Summaries persist in IndexedDB via the `Persistence` adapter ([ADR-0007](./0007-persistence.md)).
- **Cost ceiling.** Enforced at adapter level: configurable max-tokens-per-session, max-calls-per-session, with a visible counter in the UI. Hard cap also parked as an open question.
- **Privacy.** PAT and file content never leave the configured provider endpoint. No analytics.

## Consequences

- Swapping providers is a config change, not a refactor.
- Re-opening a repo whose files haven't changed is free.
- Bumping a prompt forces a paid recompute. That's intentional — prompt changes are the unit of "the summary semantics changed."

## Alternatives considered (sketches; revisit at phase open)

- **Single-provider hard-coded** — simpler short-term, painful long-term.
- **Provider-agnostic via Vercel AI SDK or LangChain.js** — eliminates the adapter we'd write, but adopts their abstractions and dependencies. Reasonable.
- **Local-only via Ollama** — viable for privacy-conscious users, but no zero-config story.

## To be decided before Accepted

- Default provider.
- Cost ceiling default value.
- Whether to bundle the Vercel AI SDK vs. roll our own adapter.
- Prompt-version cadence (per-release? per-prompt?).
