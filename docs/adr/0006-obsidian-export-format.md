---
id: ADR-0006
title: Obsidian export format
status: Accepted
date: 2026-05-23
deciders: jihao
informed-by: ../research/obsidian-feasibility.md, ../research/obsidian-format-deep-dive.md
---

# ADR-0006 — Obsidian export format

## Context

Phase F ships the export-to-Obsidian feature that distinguishes Repository Roadmap from every other repo visualizer. The deep-dive memo [`research/obsidian-format-deep-dive.md`](../research/obsidian-format-deep-dive.md) evaluates three options (wikilinks-only, Canvas-only, both) and recommends both. The earlier `Proposed` version of this ADR is superseded by this `Accepted` version now that the underlying open verifications are resolved.

## Decision

**Hybrid export — Option C in the deep-dive memo.**

- **Vault layout.** A user-named root folder containing:
  - Subfolders mirroring the source repo's directory structure.
  - One `.md` note per file or directory.
  - A top-level `repo.canvas` containing the visual graph snapshot.
  - A top-level `README.md` (vault entry point).
  - No `.obsidian/` config (Obsidian creates it on first open).

- **Per-note frontmatter (YAML).** Includes at minimum: `path`, `sha`, `language`, `layer` (entry/route/service/etc.), `size`, `last-modified`, `summary-version`. Forward-compatible with future Dataview queries without depending on Dataview.

- **Edges.** `[[wikilinks]]` between `.md` notes for every import / reference / parent-child relationship. Wikilinks render in Obsidian's native Graph view.

- **Visual graph.** A single `repo.canvas` per snapshot. Conforms to [jsoncanvas.org v1.0](https://jsoncanvas.org/spec/1.0/) literally — no proprietary extensions. Node positions match the user's last-saved layout in the app. Colors encode architectural layer. Edge labels (verified to persist in spec) carry the relationship type ("imports", "references").

- **No Dataview / plugin dependency.** Vault must render usefully without any plugins installed. Plugins suggested in vault `README.md` as enhancements.

- **Round-trip.** v1 is export-only. Re-import is post-v1 (flagged lossy in feasibility memo).

## Consequences

- Plugin-free user gets: wikilink-driven Graph view + a navigable `.canvas` snapshot + queryable frontmatter.
- Dataview-enabled user can build custom queries over our frontmatter.
- Each export overwrites prior notes — user hand-edits are lost. Post-v1 round-trip ADR must address merge.
- Adds the `Exporter` adapter ([ARCHITECTURE.md](../ARCHITECTURE.md)) implementing the `'obsidian-vault'` export target.
- Some edge information is duplicated between `.md` wikilinks and `.canvas` edges; our exporter is the single writer so duplication doesn't drift in practice.

## Verifications resolved (2026-05-23)

- ✅ Edge labels persist in `.canvas` JSON (spec confirms `label: string` on edges).
- ✅ Graph view does not ingest `.canvas` natively (Option C is the right choice).

## Minor finalization tasks for Phase F.0

- Choose naming-collision policy for files with the same basename in different folders (Obsidian wikilinks resolve by basename by default). Options: path-prefix in link text, fully-qualified path as note title, alias trick. Decide at F.0; no architectural impact.
- Empirically test `.canvas` rendering for a synthetic 5k-node export to find Obsidian's practical scale limit. May inform a "summarize at directory level for >N files" fallback.

## Alternatives considered

- **Wikilinks only** — discards spatial layout.
- **Canvas only** — discards Graph view and frontmatter queryability.

See [deep-dive memo](../research/obsidian-format-deep-dive.md) for full reasoning.
