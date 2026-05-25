---
id: ADR-0005
title: LLM provider abstraction and caching
status: Accepted
date: 2026-05-23
deciders: jihao
expand-on: phase-C-open
---

# ADR-0005 — LLM provider abstraction and caching

> Partially accepted: the *abstraction shape* and *caching strategy* are decided. The *initial provider list* and *cost ceiling* still settle at Phase C open after empirical cost measurement (see Phase C.0 in [ROADMAP.md](../ROADMAP.md)).

## Context

Phase C introduces semantic enrichment: per-file summaries, per-directory roll-ups, architectural-layer inference. All require LLM calls.

User-stated requirement (PROGRESS Q1): **multi-provider, user-switchable, no single default.** Different users have different priorities (cost, privacy, cloud-vs-local). Locking in one provider would force-fit all of them.

Cost is unknown without empirical data (PROGRESS Q3): real-world cost on a large OSS repo across providers and models hasn't been measured. Cost ceiling decision is deferred until Phase C.0 (a measurement spike) produces numbers.

## Decision

- **Provider registry.** A `Summarizer` interface (see [ARCHITECTURE.md](../ARCHITECTURE.md)). Multiple implementations live in `src/adapters/summarizer/<provider>.ts`. The app ships with a registry of supported providers and a settings UI that lets the user pick.
- **Supported providers at v1 (planned set; final list at C.1):** Anthropic (Claude), OpenAI (GPT), local-via-Ollama for the zero-cost path. Adding more is one file plus a registry entry.
- **No default provider.** First-run UX prompts the user to pick a provider and supply credentials (stored in `localStorage`, never bundled — same model as [ADR-0003](./0003-token-handling.md)).
- **Cache key.** `summary:<schema-version>:<provider>:<model>:<prompt-version>:<file-SHA>`. Any element changing produces a cache miss. Identical inputs guarantee a hit.
- **Prompt versioning.** Each prompt template carries a semver-like version. Bumping it forces re-summarization.
- **Storage.** Summaries persist in IndexedDB via the `Persistence` adapter ([ADR-0007](./0007-persistence.md)).
- **Cost telemetry.** Each call's token count + provider-reported cost (when available) is recorded; a session-level counter is visible in the UI. Hard cost ceiling is a per-user setting; default value decided at C.0.
- **Privacy.** File content and credentials never leave the provider endpoint the user chose. No third-party analytics.

## Consequences

- Switching providers is a settings change, not a code change.
- Users who care about zero cost can run Ollama locally; users who care about quality can pick a frontier model and pay.
- Cache survives provider/model switches without invalidating other providers' results — the provider/model is part of the key.
- C.0 (cost-measurement spike) must run before C.1 (adapter implementation) so the default cost ceiling reflects reality.
- Adding a new provider in the future is mechanical.

## Alternatives considered

- **Single-provider hard-coded** — simpler short-term, contradicts user-stated multi-provider requirement.
- **Vercel AI SDK** — would eliminate per-provider adapter boilerplate; revisit at C.1 once the interface is concrete. Trade-off: adopts their abstractions and bundle weight.
- **Backend proxy with provider routing** — solves the credential-in-browser surface for centrally-hosted deploys; rejected for v1 because we have no backend ([ADR-0003](./0003-token-handling.md)).
