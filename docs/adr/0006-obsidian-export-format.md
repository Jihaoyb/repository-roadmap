---
id: ADR-0006
title: Obsidian export format
status: Proposed
date: 2026-05-23
deciders: jihao
informed-by: ../research/obsidian-feasibility.md
expand-on: phase-F-open
---

# ADR-0006 — Obsidian export format

> **Status: Proposed.** This ADR is a stub. The full design will be expanded when Phase F opens, after the three open verifications in [`research/obsidian-feasibility.md`](../research/obsidian-feasibility.md) are settled. We are landing a stub now to reserve the ADR number and to commit to the broad shape of the export.

## Context

Phase F ships the export-to-Obsidian feature that distinguishes Repository Roadmap from every other repo visualizer. The feasibility memo concluded the export is doable with one verification needed (do `.canvas` files persist edge labels in their JSON?) and one ambiguity (does Obsidian's Graph view ingest `.canvas` content or only `[[wikilinks]]`?).

## Decision (provisional)

- **Vault layout.** A user-named root folder containing:
  - Subfolders mirroring the source repo's directory structure.
  - One `.md` note per file or directory.
  - A top-level `repo.canvas` containing the visual graph snapshot.
  - A top-level `README.md` (vault entry point).
  - No `.obsidian/` config (Obsidian creates it on first open).

- **Per-note frontmatter (YAML).** Includes at minimum: `path`, `sha`, `language`, `layer` (entry/route/service/etc.), `size`, `last-modified`, `summary-version`. Forward-compatible with future Dataview queries without depending on Dataview.

- **Edges.** `[[wikilinks]]` between `.md` notes for every import / reference / parent-child relationship. Wikilinks render in Obsidian Graph view; that's the safe, plugin-free visualization channel.

- **Visual graph.** A single `repo.canvas` per snapshot. Conforms to [jsoncanvas.org v1.0](https://jsoncanvas.org/) literally — no proprietary extensions. Node positions match the user's last-saved layout in the app. Colors encode architectural layer.

- **No Dataview dependency.** Vault must render usefully without any plugins installed. Dataview is a suggestion, not a requirement.

- **Round-trip.** v1 is export-only. Re-import is a post-v1 concern; the feasibility memo flags it as lossy.

## Consequences

- A user with no plugins gets a navigable vault with wikilink graph view and a parallel `.canvas` view.
- A user with Dataview can build their own queries over our frontmatter.
- Re-running the export overwrites notes that the user may have edited. The post-v1 round-trip ADR has to address merge/conflict.
- Adds `Exporter` adapter to the codebase ([ARCHITECTURE.md](../ARCHITECTURE.md)).

## To be decided before Accepted

- Do `.canvas` files persist edge labels in their JSON? (Verify with a 5-node test vault.)
- Does Obsidian Graph view ingest `.canvas`? (Same test vault.)
- Naming collision policy when two files in different folders share a name (Obsidian wikilinks resolve by basename by default).
- Whether export is "snapshot" (single timestamped folder) or "in-place update" (overwrites the previous export).
