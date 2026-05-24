---
id: ADR-0002
title: AST parser for import resolution
status: Accepted
date: 2026-05-23
deciders: jihao
---

# ADR-0002 — AST parser for import resolution

## Context

`src/services/github.ts` matches imports with a regex (`/import ... from ['"]([^'"]+)['"]/g`) and resolves them with `node.path.endsWith(importPath)`. That heuristic fails on:

- Relative paths (`./foo`, `../foo/bar`) which need actual path resolution.
- TS path aliases (`@/utils/foo`) from `tsconfig.json`.
- Package-internal `exports` maps in `package.json`.
- Dynamic imports (`await import('...')`).
- Re-exports (`export { x } from './y'`).
- Non-JS/TS files (markdown link detection is the only other matcher today).

For most real repos this produces zero correct edges. Phase A.5 patches the regex enough to handle simple relative paths as an interim; Phase B.1 replaces it.

## Decision

Adopt **[oxc-parser](https://oxc.rs/docs/guide/usage/parser.html)** for JS/TS AST parsing.

- Browser-compatible (WASM), fast, ESM, no Babel runtime baggage.
- Returns standard ESTree AST; we walk it for `ImportDeclaration`, `ExportNamedDeclaration` (with `source`), and `ImportExpression`.
- Module-specifier resolution is a separate pass: consult `tsconfig.json` / `jsconfig.json` `compilerOptions.paths`, then `package.json` `exports` / `main`, then fall back to filesystem-style relative resolution. Implemented in `src/parsers/resolve.ts` (new, Phase B.1).

Non-JS/TS files (Python, Go, Markdown, etc.) get language-specific parsers added incrementally — interface `Parser` (per [ARCHITECTURE.md](../ARCHITECTURE.md)) makes this clean. Phase B ships JS/TS only; other languages are post-v1.

Per-file parse results cache by file SHA in IndexedDB ([ADR-0007](./0007-persistence.md)). A re-fetched unchanged file is a cache hit.

## Consequences

- Edge accuracy for JS/TS repos jumps from "near zero" to "near complete."
- ~1-2 MB WASM bundle weight added to the app. Acceptable for the value.
- Parse cost paid once per file SHA, then cached. Cold-load on a 1000-file repo: not free, but bounded by the lazy-fetch budget ([ADR-0001](./0001-lazy-file-content-fetch.md)).
- Non-JS/TS repos still get hierarchical structure but no import edges until their parser ships.

## Alternatives considered

- **`@babel/parser`** — mature, but slower and brings Babel ecosystem expectations. Rejected for performance.
- **`ts-morph`** — convenient but heavy and tightly coupled to a TypeScript compiler host; overkill for our needs.
- **`@swc/wasm-web`** — fast, but a less convenient AST shape for our walk. Reasonable second choice; switch if oxc proves limiting.
- **Continue with regex, but smarter** — diminishing returns. Real path resolution requires real parsing.
