# Repository Roadmap

An interactive visualizer for a GitHub repository's file structure. Paste a repo URL
and explore it as a D3 force-directed graph — directories and files as nodes, with
import and Markdown-link relationships drawn as edges.

This is an early-stage project under active, milestone-based development. For the
vision and the phased plan, see [Documentation](#documentation).

## Features

- **Force-directed structure graph** of a GitHub repo (D3), with pan, zoom, and drag.
- **Drill-down navigation** — click a directory node to expand into it; press `Esc` to step back out.
- **File preview** — click a file node to view its fetched contents in an overlay panel.
- **Relationship edges** — detects `import` statements (JS/TS/JSX/TSX) and Markdown links
  and draws them as colored edges (regex-based for now; full AST resolution is planned —
  see [ADR-0002](./docs/adr/0002-ast-parser-for-imports.md)).
- **Node details on hover** — path, size, language, and relationships.
- **GitHub API integration** via Octokit, with optional token auth to raise rate limits.

## Tech Stack

- **UI:** React 19 + TypeScript
- **Build:** Vite 6 (`@vitejs/plugin-react`)
- **State:** Zustand
- **Visualization:** D3 v7 (custom SVG force simulation)
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **GitHub API:** Octokit (`@octokit/rest`)
- **Quality:** ESLint (type-aware) + `tsc` strict mode

## Project Structure

```
repository-roadmap/
├── src/
│   ├── components/Graph/   # RepositoryGraph — the D3 visualization
│   ├── services/           # github.ts — GitHub API + relationship analysis
│   ├── store/              # Zustand store
│   ├── types/              # shared TypeScript types
│   ├── App.tsx             # app shell (URL input, states, layout)
│   └── main.tsx            # entry point
├── docs/                   # vision, roadmap, progress, ADRs, working agreements
└── public/                 # static assets
```

## Documentation

Start here — especially before contributing:

- [`docs/PROGRESS.md`](./docs/PROGRESS.md) — "you are here"; read this first every session.
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — the phased plan and current milestone.
- [`docs/VISION.md`](./docs/VISION.md) — what we're building and why.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — system overview.
- [`docs/WORKING_AGREEMENTS.md`](./docs/WORKING_AGREEMENTS.md) — PR rules, commit conventions, ADR process.
- [`docs/adr/`](./docs/adr/) — Architecture Decision Records.

## Getting Started

### Prerequisites

- Node.js 20+ (Vite 6)
- npm

### Installation

1. Clone and install:
   ```bash
   git clone https://github.com/Jihaoyb/repository-roadmap.git
   cd repository-roadmap
   npm install
   ```

2. (Optional) Configure a GitHub token. Without one, requests are anonymous and capped
   at ~60/hr; a token raises this to 5,000/hr.
   ```bash
   cp .env.example .env
   # then set VITE_GITHUB_TOKEN in .env
   ```
   `VITE_GITHUB_TOKEN` is a **dev-only** fallback that Vite inlines at build time — keep
   it out of public deploy builds. A localStorage-based token (set in the UI) becomes the
   primary mechanism in a later milestone. See [ADR-0003](./docs/adr/0003-token-handling.md).

3. Start the dev server:
   ```bash
   npm run dev
   ```

## Usage

1. Enter a GitHub repository URL (e.g. `https://github.com/facebook/react`) and click **Visualize**.
2. The app fetches the repository and renders its structure as a graph.
3. Interact:
   - **Hover** a node for details.
   - **Click a directory** to drill into it; press **`Esc`** to step back out.
   - **Click a file** to view its contents.
   - **Drag** nodes, **scroll** to zoom, **drag the canvas** to pan.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and build for production
- `npm run type-check` — type-check only, no emit
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build

## Status & Known Limitations

Early-stage; see [`docs/ROADMAP.md`](./docs/ROADMAP.md) for the plan.

- On initial load the GitHub service eagerly fetches **every** file's content, which can
  exhaust API rate limits on large repositories. Lazy, on-demand fetching is planned —
  see [ADR-0001](./docs/adr/0001-lazy-file-content-fetch.md).

## Contributing

This project follows a strict, milestone-based workflow: one milestone = one PR, atomic
[Conventional Commits](https://www.conventionalcommits.org/), and ADRs for cross-cutting
decisions. Before opening a PR, read [`docs/WORKING_AGREEMENTS.md`](./docs/WORKING_AGREEMENTS.md)
and [`docs/PROGRESS.md`](./docs/PROGRESS.md). Every commit must pass
`npm run lint && npm run build`.

## License

MIT-licensed.

## Acknowledgments

- [D3.js](https://d3js.org/) for the visualization
- [Octokit](https://github.com/octokit/octokit.js) for GitHub API access
- [Vite](https://vitejs.dev/) for build tooling
- [Tailwind CSS](https://tailwindcss.com/) for styling
