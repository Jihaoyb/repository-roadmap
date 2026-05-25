---
id: ADR-0008
title: CI/CD pipeline
status: Accepted
date: 2026-05-23
deciders: jihao
---

# ADR-0008 — CI/CD pipeline

## Context

Resolves PROGRESS Q2 (CI/CD platform) and Q5 (deploy host).

User constraints: **free**, **learning value** (has already used Vercel + GitHub Pages), and **portfolio integration** (portfolio lives on GitHub Pages). A Vite SPA has no SSR / no server functions in v1 ([ADR-0003](./0003-token-handling.md)) — any static host works; differentiator is DX, learning, and free-tier headroom.

## Decision

**CI: GitHub Actions.** **CD: Cloudflare Pages.**

### CI — GitHub Actions

- Workflow at `.github/workflows/ci.yml`, added in Phase A.7 per [ROADMAP](../ROADMAP.md).
- Jobs: `lint`, `type-check`, `build`, `test`. All required for merge to `master`.
- Trigger: every PR and every push to `master`.
- Node LTS only; npm cache via `actions/setup-node`.

Why: native to GitHub (zero glue), free for public repos, dominant CI in the JS ecosystem (skill transfers everywhere), and a public action marketplace good for learning composition.

### CD — Cloudflare Pages

- Deploys `dist/` on every push to `master`; preview deploys per PR.
- Repo connected via Cloudflare dashboard; no `wrangler.toml` for pure static.
- SPA fallback via `public/_redirects`.

Why over alternatives:

| Option | Free tier | New to user | Edge platform |
|---|---|---|---|
| Vercel | Restrictive; commercial use technically requires Pro | No | Yes |
| GitHub Pages | Generous but static-only; no preview deploys | No (portfolio lives here) | No |
| Netlify | 100 GB/mo bandwidth cap | No | Yes |
| **Cloudflare Pages** | **Unlimited bandwidth, commercial-OK, 500 builds/mo** | **Yes** | **Yes (Workers, KV, R2)** |

Cloudflare wins on every criterion and opens an on-ramp to a broader edge stack (Workers/KV/R2) worth learning. Portfolio integration (link / iframe / custom subdomain) picked in Phase G.5; no architectural impact.

## Consequences

- Two platform accounts (GitHub already exists; Cloudflare is new). Low overhead.
- The CI workflow is the deploy contract — broken build = no deploy.
- PR preview deploys give reviewers a live URL each.
- Migrating off Cloudflare later is one config change because build output is plain static.

## Alternatives considered

- **Vercel** — most-restrictive free tier; already used.
- **GitHub Pages** — no preview deploys; portfolio lives there (coupling risk).
- **Netlify / self-host** — bandwidth cap or yak-shaving, no learning win.

Sources: [DevToolReviews 2026](https://www.devtoolreviews.com/reviews/vercel-vs-netlify-vs-cloudflare-pages-pricing-comparison-2026), [DanubeData 2026](https://danubedata.ro/blog/cloudflare-pages-vs-netlify-vs-vercel-static-hosting-2026).
