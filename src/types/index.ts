/**
 * Represents a node in the repository structure graph
 */
interface RepositoryNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: RepositoryNode[];
  parent?: RepositoryNode;
  description?: string;
  size?: number;
  language?: string;
  lastModified?: string;
  content?: string;
  relationships?: {
    type: 'import' | 'dependency' | 'reference' | 'other';
    targetId: string;
    description?: string;
  }[];
}

/**
 * Represents a node in the D3 force simulation
 */
interface D3Node extends RepositoryNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  expanded?: boolean;
  level?: number;
}

/**
 * Represents the state of the repository visualization
 */
interface RepositoryState {
  nodes: RepositoryNode[];
  selectedNode: RepositoryNode | null;
  loading: boolean;
  error: string | null;
  expandedNodes: Set<string>;
  zoomLevel: number;
}

/**
 * Represents the configuration for the graph visualization
 */
interface GraphConfig {
  width: number;
  height: number;
  nodeRadius: number;
  linkDistance: number;
  charge: number;
  gravity: number;
  minZoom: number;
  maxZoom: number;
  defaultZoom: number;
}

/**
 * Represents the response from GitHub's API for content
 */
interface GitHubContentResponse {
  type: 'file' | 'dir' | 'submodule' | 'symlink';
  size: number;
  name: string;
  path: string;
  content?: string;
  sha: string;
  url: string;
  git_url: string | null;
  html_url: string | null;
  download_url: string | null;
  _links: {
    self: string;
    git: string | null;
    html: string | null;
  };
}

/**
 * Represents the application's store state
 */
interface AppState {
  // State
  repositoryUrl: string;
  repositoryData: RepositoryState;
  graphConfig: GraphConfig;

  // Actions
  setRepositoryUrl: (url: string) => void;
  setSelectedNode: (node: RepositoryNode | null) => void;
  setGraphConfig: (config: Partial<GraphConfig>) => void;
  fetchRepositoryData: (url: string) => Promise<void>;
  toggleNodeExpansion: (nodeId: string) => void;
  setZoomLevel: (level: number) => void;
}

export type {
  RepositoryNode,
  RepositoryState,
  GraphConfig,
  GitHubContentResponse,
  AppState,
  D3Node
}; 