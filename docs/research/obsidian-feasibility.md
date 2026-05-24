---
title: Obsidian Feasibility Research
status: research
audience: contributors
updated: 2026-05-23
informs: adr/0006-obsidian-export-format.md
---

# Obsidian Feasibility — Can we represent a codebase as an Obsidian vault?

This memo captures what we know about Obsidian's data formats and what's feasible for a codebase → vault export. It's the grounding for [ADR-0006](../adr/0006-obsidian-export-format.md).

## Goal

Determine whether a repository analysis (structure, semantics, edges, history) can be exported losslessly into an Obsidian vault that opens and renders correctly without requiring proprietary plugins, and (stretch) whether changes made in Obsidian can round-trip back into our app.

## Findings

### 1. Vault format

A vault is a folder of `.md` files plus a `.obsidian/` config directory plus arbitrary attachments. Frontmatter is YAML between `---` delimiters at the top of each note.

Nested vaults are discouraged; internal links can fail across them. Obsidian maintains a local metadata cache to power Graph view and Outline.

Source: [Obsidian Help — Files & folders](https://help.obsidian.md/Files+and+folders/How+Obsidian+stores+data).

**Verdict:** Trivially compatible. A `docs/`-shaped folder is already a vault.

### 2. Wikilinks

- `[[note]]` — link by note name
- `[[note|alias]]` — display alias
- `[[note#heading]]` — link to heading
- `[[note#^block-id]]` — link to block
- `![[file]]` — embed (markdown, images, audio, video, PDF)

Gotcha: wikilinks render literally on GitHub. Either accept that the GitHub-rendered view of `docs/` is degraded, or generate dual-format links for the user-facing README and pure-wikilink for the exported vault.

Source: [Obsidian Help — Internal links](https://help.obsidian.md/Linking+notes+and+files/Internal+links).

**Verdict:** Compatible. Use wikilinks for repo-internal edges in the exported vault; keep markdown links in `docs/` for GitHub readability (we are not the export target).

### 3. JSON Canvas (`.canvas`)

Open spec at [jsoncanvas.org](https://jsoncanvas.org/), v1.0 released March 2024, MIT-licensed.

Two arrays: `nodes` and `edges`.

**Node types:**
- `file` — references a vault file, can deep-link to a section
- `text` — arbitrary text / markdown
- `link` — external URL
- `group` — visual container, supports background images

**Node attributes:** `x`, `y`, `width`, `height`, `color` (palette index or custom hex).

**Edges:** directional. Attributes documented: `fromNode`, `fromSide`, `toNode`, `toSide`, `color`.

**Edge labels:** *unverified.* The spec does not clearly document a `label` field on edges in the v1.0 schema we surveyed. Obsidian's own Canvas UI does support edge labels — we don't yet know if those persist in the `.canvas` JSON or if they're UI-only.

Sources: [Obsidian blog — JSON Canvas announcement](https://obsidian.md/blog/json-canvas/), [jsoncanvas.org spec](https://jsoncanvas.org/).

**Verdict:** Mostly compatible. We can express our hierarchical+force graph as nodes with positions + colored typed edges. Edge labels need verification before we depend on them.

### 4. Graph view

Obsidian's Graph view is driven primarily by `[[wikilinks]]` between markdown files. Each note is a node, each link is an edge. Frontmatter `tags` participate (graph can color by tag). Custom frontmatter properties can be mapped to colors via Graph view settings.

Whether Graph view ingests `.canvas` file content (i.e., shows Canvas-defined nodes/edges) is *unverified*. Best evidence is that Graph view is wikilink-centric and Canvas is a separate visualization mode.

Source: search-derived from Obsidian community docs and third-party writeups; primary docs at [Obsidian Help — Graph view](https://help.obsidian.md/Plugins/Graph+view).

**Verdict:** Wikilinks are the safe bet for Graph-view visibility. Canvas is a separate, parallel visualization. Plan to ship both.

### 5. Dataview

Dataview is a popular **community** plugin (not core). It queries frontmatter via DQL (Dataview Query Language) and renders tables / lists / calendars inline. Useful for surfacing churn / layer / ownership data we'd put in frontmatter.

Limitation: it's plugin-dependent. A vault we export must render acceptably *without* Dataview installed — otherwise we've shipped a half-working product.

Source: [Dataview docs](https://blacksmithgu.github.io/obsidian-dataview/).

**Verdict:** Don't depend on Dataview for correctness. We may *suggest* it as an enhancement; we must not require it.

### 6. Prior art

GitHub search for "repo to obsidian", "codebase obsidian vault", "github obsidian exporter" surfaces:

- **claude-code-memory-setup** ([repo](https://github.com/lucasrosati/claude-code-memory-setup)) — uses tree-sitter to parse TS codebases and builds a token-efficient memory graph for Claude. Adjacent, not a vault exporter.
- **ts-codebase-analyzer** ([repo](https://github.com/olasunkanmi-SE/ts-codebase-analyzer)) — TS AST analysis tool. Not Obsidian-targeted.
- **Obsidian-CodeSpace** ([repo](https://github.com/UNLINEARITY/Obsidian-CodeSpace)) — plugin to embed/manage code files *inside* Obsidian. Inverse direction.
- **obsidian-export** ([repo](https://github.com/zoni/obsidian-export)) — exports a vault to CommonMark. Inverse direction.

**Verdict:** No published codebase → Obsidian vault exporter found. Our angle is genuinely empty.

## Overall verdict

**Doable, with one verification needed.**

- ✅ Vault format: trivially compatible (folder of `.md`)
- ✅ Wikilinks: full support for our edge types
- ✅ Canvas: covers our graph rendering, modulo edge labels
- ✅ Frontmatter: covers all our per-file metadata (path, sha, language, layer, churn, last-modified)
- ⚠️ Edge labels in `.canvas`: needs verification before Phase F
- ⚠️ Canvas in Graph view: assume parallel, not unified, until verified
- ✅ Dataview: not required; can suggest

**Round-trip (Obsidian → app):** Lossy in v1. Position edits in the `.canvas` would be importable, but if the user edits frontmatter or wikilinks we'd need a diff/merge story that we're not ready to design. Defer to post-v1.

## Open verifications (track in PROGRESS.md)

1. Do `.canvas` files persist edge labels in their JSON, or are labels UI-only? Verify by manually adding a label in Obsidian Canvas, saving, then `cat`-ing the file.
2. Does Obsidian Graph view ingest `.canvas` content, or only `[[wikilinks]]` between `.md` files? Verify with a 5-node test vault containing only a `.canvas` and observe Graph view behavior.
3. What's the largest practical `.canvas` size before Obsidian's renderer chokes? (Relevant for monorepos.) No real source; needs empirical test.

These three verifications should be done in a 30-minute hand-built test vault before [ADR-0006](../adr/0006-obsidian-export-format.md) leaves `Proposed` status.
