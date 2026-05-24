---
title: Vision
status: approved
audience: all
updated: 2026-05-23
---

# Vision

## The one-liner

**Repository Roadmap is a second brain for codebases** — an interactive knowledge graph that turns any GitHub repo into something you can navigate, understand, and own.

## Why this exists

Reading an unfamiliar codebase is brutal. File trees show you everything and tell you nothing. LLM "summarize this repo" tools give you a paragraph you'll forget by tomorrow. Semantic search engines answer questions but don't give you a *map*. Dependency graphs render hairballs.

What you actually want is the thing a senior engineer gives you on day one: "start here, then read this, this connects to that, ignore that whole folder for now." Nobody ships that.

## What it is

- A **structure-aware graph** of a GitHub repo: directories, files, and the import/reference edges between them.
- A **semantic layer** on top: each module gets a short AI-generated description, each file is tagged with an architectural role (entry / route / service / data / ui / util / test).
- A **history overlay**: node size reflects code churn, color reflects recency. You can see what's alive and what's stale.
- A **guided reading order** ("the roadmap"): pick a role (engineer / reviewer / security auditor) and get a sequenced walkthrough — "read these 5 files in this order to grok the auth flow."
- An **Obsidian-portable export**: drop the analysis into your own Obsidian vault as a folder of markdown notes with `[[wikilinks]]` and an embedded `.canvas` graph. Your codebase knowledge becomes a node in your second brain, durable beyond this tool.

## What it is not

- Not a code search engine. (Use Sourcegraph or `rg`.)
- Not an IDE. (Use VS Code.)
- Not a chatbot that answers questions about your repo. (LLM summaries are an ingredient, not the product.)
- Not a hosted service in v1. (Local-first. Public deploy is a future decision — see ADR-0003.)

## Differentiation

| Tool | Structure | Semantics | History | Reading order | Portable export |
|---|---|---|---|---|---|
| GitHub Repo Visualizer | ✓ | — | — | — | — |
| Sourcegraph | — | ✓ | — | — | — |
| GitIngest / gitdiagram | — | partial | — | — | — |
| CodeSee (defunct) | ✓ | partial | partial | — | — |
| dependency-cruiser, madge | imports only | — | — | — | — |
| **Repository Roadmap** | ✓ | ✓ | ✓ | ✓ | ✓ |

The combination is the moat. Web research (see [`research/obsidian-feasibility.md`](./research/obsidian-feasibility.md)) confirms no published tool currently exports a codebase analysis into an Obsidian vault.

## Who it's for

- **The new engineer on day one.** Three weeks of bewildered grepping compressed into a 20-minute guided walkthrough.
- **The code reviewer of an unfamiliar PR.** Surface the affected modules in context — what they touch, what touches them, how risky a change here typically is.
- **The security or architecture auditor.** Find the entry points, follow the data, spot the load-bearing files everyone depends on.

## v1 success criteria

A v1 ships when a new contributor can:

1. Drop in a GitHub URL of a repo they've never seen and get a usable map within **60 seconds** (initial load), without burning their rate-limit budget.
2. Click "Generate roadmap for: New Engineer" and get a sequenced reading list of **5–10 files** with one-paragraph rationale per step.
3. Export the analysis to an Obsidian vault and have wikilinks resolve, frontmatter parse cleanly, and the embedded `.canvas` open as a navigable graph.

Anything beyond that is Phase G polish.
