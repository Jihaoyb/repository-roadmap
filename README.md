# Repository Roadmap

A powerful visualization tool for exploring and understanding repository structures. Built with React, TypeScript, and D3.js, this application provides an interactive graph-based interface to navigate through repository contents, analyze file relationships, and understand code dependencies.

## Features

- Interactive repository structure visualization
- Real-time file content preview
- Dynamic node expansion and collapse
- Relationship analysis between files
- Smart dependency detection
- Modern, responsive UI with smooth animations
- GitHub API integration with authentication

## Tech Stack

- **Frontend Framework**: React + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Data Visualization**: D3.js
- **Styling**: Tailwind CSS
- **API Integration**: Octokit
- **Development Tools**: 
  - ESLint for code quality
  - SWC for fast refresh
  - TypeScript for type safety

## Project Structure

```
repository-roadmap/
├── src/
│   ├── components/     # React components
│   │   └── Graph/     # Graph visualization components
│   ├── services/      # API and external service integrations
│   ├── store/         # State management
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── [config files]     # Project configuration files
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- GitHub account (for API access)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/repository-roadmap.git
   cd repository-roadmap
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_GITHUB_TOKEN=your_github_token
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Usage

1. Enter a GitHub repository URL in the input field
2. The application will fetch and visualize the repository structure
3. Interact with the graph:
   - Hover over nodes to see details
   - Click nodes to expand directories
   - Drag nodes to rearrange the layout
   - Use mouse wheel to zoom in/out
   - Click and drag to pan the view

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

This project uses ESLint with TypeScript support. The configuration includes:

- Type-aware lint rules
- React-specific rules
- Strict TypeScript checking
- Stylistic rules

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [D3.js](https://d3js.org/) for visualization capabilities
- [Octokit](https://github.com/octokit/octokit.js) for GitHub API integration
- [Vite](https://vitejs.dev/) for the build tooling
- [Tailwind CSS](https://tailwindcss.com/) for styling
