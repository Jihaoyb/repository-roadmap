---
title: Obsidian Export Format — Deep Dive
status: research
audience: all
updated: 2026-05-23
informs: adr/0006-obsidian-export-format.md
companion-to: obsidian-feasibility.md
---

# Obsidian Export Format — Deep Dive

> This memo answers the question: *"When we export a repo analysis to Obsidian, what data format should we use, and why?"* Written in plain English with one analogy. Pairs with [obsidian-feasibility.md](./obsidian-feasibility.md) (which establishes what's technically possible) by explaining **which option to pick and how it works**.

## The question we're answering

Our app holds three kinds of information about a repo:

1. **Structure** — directories and files (a tree).
2. **Relationships** — file A imports file B; file C references file D (a graph).
3. **Metadata** — language, size, churn, AI-generated summary, architectural layer (key-value pairs per file).

Obsidian gives us three different containers to put this stuff in. Each container has different strengths. We have to pick **which container holds what** — or commit to a hybrid.

## The three containers

| Container | What it is | What it's good at | What it's bad at |
|---|---|---|---|
| **Markdown notes with `[[wikilinks]]`** | One `.md` file per repo file/directory; `[[other-note]]` makes a clickable link | Native to Obsidian. Powers the built-in Graph view. Searchable. Editable by hand. | No spatial layout — Obsidian arranges Graph view automatically, your saved positions are lost. |
| **Frontmatter (YAML)** | Key-value block at the top of each `.md` note | Queryable (with the Dataview plugin), forward-compatible, human-readable | Doesn't render anywhere visual without a plugin |
| **JSON Canvas (`.canvas`)** | A separate file containing nodes-with-positions and edges-with-labels | Preserves the exact visual layout you saw in our app. Spatial relationships matter. | The native Graph view ignores it (verified in Phase 0 research; some community plugins bridge it). Edit-by-hand is painful. |

## The analogy

Think of exporting a repo to Obsidian like exporting a research paper to a library.

- **Wikilinks** are like the **citations and footnotes** in the paper. They let a reader jump from one idea to a referenced one. The library's catalog (Obsidian's Graph view) is built entirely from these citations.
- **Frontmatter** is like the **bibliographic record** on the back of the title page — author, date, abstract, keywords. Boring to look at, but lets a librarian (Dataview, or future tools) find the paper later.
- **JSON Canvas** is like a **fold-out diagram** included with the paper. It shows the same information as the citations but laid out *visually* — boxes with arrows, sized and colored to convey shape at a glance. The library card catalog doesn't index it, but anyone who opens the paper sees the diagram immediately.

A reader who only reads the prose still gets the gist (the citations link everything together). A reader who flips to the diagram understands the structure faster. Sophisticated tools can query the bibliographic record. Each container reinforces the others.

## The three options for our export

### Option A — Wikilinks only

Generate one `.md` note per file/directory with `[[wikilinks]]` for every import or reference. Skip Canvas entirely.

- ✅ Native Graph view "just works."
- ✅ Smallest export footprint.
- ❌ Loses our spatial layout — Obsidian's Graph view re-arranges nodes its own way.
- ❌ The user loses the visual map they were just looking at in our app. Information loss.

### Option B — Canvas only

Generate one big `.canvas` file with all nodes positioned and labeled. Skip the individual `.md` notes.

- ✅ Perfectly preserves the visual layout.
- ✅ Edge labels (e.g., "imports," "references") render in Canvas.
- ❌ Native Graph view ignores it. The user can't browse the repo as notes.
- ❌ No frontmatter → no Dataview queries → no metadata layer.
- ❌ For repos with thousands of files, a single giant `.canvas` may strain Obsidian's renderer (unverified — flagged in feasibility memo).

### Option C — Both (recommended)

Generate one `.md` note per file/directory **plus** a top-level `repo.canvas` that overlays the visual graph.

- ✅ Graph view works (driven by wikilinks).
- ✅ Visual layout preserved (in Canvas).
- ✅ Frontmatter on every note enables metadata queries.
- ✅ The user can open either visualization depending on their need.
- ❌ Larger export footprint.
- ❌ Two representations of the same edges can drift if the user hand-edits one without the other. (Our exporter regenerates both each time, so drift is only a problem if the user edits the export.)

## Why we recommend Option C

Repository Roadmap's value proposition (per [VISION.md](../VISION.md)) is *combining* structure + semantics + history + reading order + portable knowledge. Throwing away the visual layout on export (Option A) gives the user back less than what we showed them. Throwing away the semantic-navigation channel (Option B) makes the export inert outside of Canvas view.

Option C ships both. Cost is some duplicated information in the export folder — acceptable for the value.

This decision is made formal in **[ADR-0006](../adr/0006-obsidian-export-format.md)**.

## How it works — a concrete example

Suppose our app analyzed a tiny repo with three files:

```
src/
  App.tsx       (imports Header.tsx and useUser.ts)
  Header.tsx    (imports useUser.ts)
  useUser.ts
```

The export produces this vault:

```
my-repo-roadmap/
├── README.md                    ← vault entry point
├── repo.canvas                  ← visual graph (positions + colors + edge labels)
└── src/
    ├── App.md
    ├── Header.md
    └── useUser.md
```

### `src/App.md`

```markdown
---
path: src/App.tsx
sha: abc123…
language: typescript
layer: entry
size: 2048
last-modified: 2026-05-20
summary-version: 1
---

# App.tsx

The application root. Sets up React StrictMode, renders <Header/>, and
provides the user context to children.

## Imports

- [[Header]]
- [[useUser]]

## Imported by

(nothing — this is an entry point)

## Summary

App.tsx wires together the layout and authentication. It is the
top-level React component mounted by main.tsx.
```

When the user opens the vault in Obsidian:

- **Graph view** (driven by wikilinks): shows three nodes (`App`, `Header`, `useUser`) with edges from `App → Header`, `App → useUser`, `Header → useUser`. Obsidian arranges them automatically.
- **Open `repo.canvas`**: shows the same three nodes in the exact positions our app last laid them out, color-coded by architectural layer (entry / service / etc.), with labeled edges ("imports", "references").
- **Dataview query** (if user has the plugin): `LIST FROM "src" WHERE layer = "entry"` returns `App.md`. The frontmatter we generated makes this possible.

The user can edit any note by hand — they own their notes — and the next time we re-export, our exporter regenerates everything from scratch (we don't try to merge user edits in v1; that's the post-v1 round-trip work).

## Verifications resolved

The feasibility memo flagged two open verifications. Both are now answered:

1. **Do `.canvas` files persist edge labels in their JSON?** ✅ **Yes.** [The v1.0 spec](https://jsoncanvas.org/spec/1.0/) defines `label` as an optional string property on every edge. Verified by reading the spec directly.
2. **Does Obsidian's Graph view ingest `.canvas` content?** ❌ **No, not natively.** Graph view is driven by `[[wikilinks]]` between `.md` files. Plugins like [Advanced Canvas](https://github.com/Developer-Mike/obsidian-advanced-canvas) bridge `.canvas` content to Graph view, but we won't depend on plugins. This validates Option C: ship both `.md` (Graph view) and `.canvas` (visual layout) as parallel, independent representations.

A third verification — naming-collision policy for files with the same basename in different folders — is still open and is a small finalization task in Phase F.0.

## Bottom line

We ship **Option C**: one `.md` note per file/directory with frontmatter and `[[wikilinks]]`, plus a top-level `repo.canvas` for the visual layout. No plugin required. Power-user enhancements (Dataview, Advanced Canvas) are suggested, never required.

## Sources

- [JSON Canvas v1.0 spec](https://jsoncanvas.org/spec/1.0/) — authoritative on the format
- [Obsidian Help — Internal links](https://help.obsidian.md/Linking+notes+and+files/Internal+links) — wikilinks
- [Obsidian Help — Graph view](https://help.obsidian.md/Plugins/Graph+view)
- [Obsidian forum — Canvas display on graph view](https://forum.obsidian.md/t/canvas-display-on-a-graph-view/68648) — feature-request status
- [Advanced Canvas plugin](https://github.com/Developer-Mike/obsidian-advanced-canvas) — third-party bridge between Canvas and Graph view
