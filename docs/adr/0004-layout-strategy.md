---
id: ADR-0004
title: Layout strategy
status: Accepted
date: 2026-05-23
deciders: jihao
---

# ADR-0004 — Layout strategy

## Context

Today the entire graph is rendered with a single D3 force simulation (`forceLink`, `forceManyBody`, `forceCenter`, `forceCollide`). For a repo's file tree (which is *primarily hierarchical*) plus import edges (which are *cross-cutting*), pure force is the wrong tool: above ~200 nodes the layout collapses into an unreadable hairball, the directory hierarchy dissolves, and the viewer can't tell which folder a file belongs to.

A repo has two graph structures overlaid: a **tree** (file system) and an **arbitrary DAG** (imports/references). They need different layouts.

## Decision

**Hybrid layout, view-mode switchable.**

- **Tree layer:** hierarchical layout for parent-child (directory → file). Use [`dagre`](https://github.com/dagrejs/dagre) for layered top-down rendering or [`d3-hierarchy`](https://d3js.org/d3-hierarchy) tidy-tree for traditional tree shapes. Default to dagre — denser, scales better for wide repos.
- **Cross-cutting layer:** force-directed overlay for imports/references. Source/target positions are pinned to their tree-layer positions; force only governs edge-routing aesthetics (avoid crossings, smooth curves).
- **Clustering:** nodes are visually grouped by top-level directory (color-coded background or convex hull). Helps the eye locate "where am I" at a glance.

**View modes** exposed in UI:

| Mode | Tree layer | Cross-cutting | Use case |
|---|---|---|---|
| `tree` | dagre | hidden | "show me the structure" |
| `hybrid` (default) | dagre | overlaid, dim | "show me both" |
| `force` | hidden | force-directed | "show me semantic clusters" |

## Consequences

- Readable at 1000+ nodes (tree layouts scale linearly; force overlay only renders visible edges).
- More layout code than today (~300 lines vs. ~40), but isolated to a single render module.
- New per-view-mode keybinding / toolbar control (UI work in Phase B.3).
- Phase C's semantic-layer node coloring composes cleanly: tree positions stay, color encodes inferred layer.
- Phase E's history overlay (churn/recency) composes: size and halo encode history, position stays stable.

## Alternatives considered

- **Cytoscape.js + ELK or dagre extension** — full-featured, but adopts a large new dependency surface and a non-D3 rendering pipeline. We already have D3; sunk cost is real.
- **Pure dagre only, drop force entirely** — cleaner, but cross-cutting edges as straight lines through the tree become unreadable spaghetti. Force-routing those edges is worth the complexity.
- **Stay with pure force, tune harder** — diminishing returns; the fundamental problem is force doesn't respect hierarchy.
- **Treemap / Sunburst** — beautiful for size-encoding but loses the edges-between-files affordance, which is core to our value.
