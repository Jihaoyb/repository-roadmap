import { create } from 'zustand';
import type { AppState, RepositoryNode } from '../types';
import { githubService } from '../services/github';

/**
 * Default graph configuration
 */
const defaultGraphConfig = {
  width: window.innerWidth * 0.8,
  height: window.innerHeight * 0.8,
  nodeRadius: 8,
  linkDistance: 100,
  charge: -300,
  gravity: 0.1,
  minZoom: 0.1,
  maxZoom: 4,
  defaultZoom: 1,
};

/**
 * Default repository state
 */
const defaultRepositoryState = {
  nodes: [],
  selectedNode: null,
  loading: false,
  error: null,
  expandedNodes: new Set<string>(),
  zoomLevel: 1,
};

/**
 * Create the application store using Zustand
 */
export const useStore = create<AppState>((set) => ({
  repositoryUrl: '',
  repositoryData: defaultRepositoryState,
  graphConfig: defaultGraphConfig,

  /**
   * Set the repository URL
   */
  setRepositoryUrl: (url: string) => set({ repositoryUrl: url }),

  /**
   * Set the selected node
   */
  setSelectedNode: (node: RepositoryNode | null) => 
    set(state => ({
      repositoryData: {
        ...state.repositoryData,
        selectedNode: node
      }
    })),

  /**
   * Update graph configuration
   */
  setGraphConfig: (config) =>
    set((state) => ({
      graphConfig: { ...state.graphConfig, ...config },
    })),

  /**
   * Toggle node expansion
   */
  toggleNodeExpansion: (nodeId: string) =>
    set((state) => {
      const expandedNodes = new Set(state.repositoryData.expandedNodes);
      if (expandedNodes.has(nodeId)) {
        expandedNodes.delete(nodeId);
      } else {
        expandedNodes.add(nodeId);
      }
      return {
        repositoryData: {
          ...state.repositoryData,
          expandedNodes,
        },
      };
    }),

  /**
   * Set zoom level
   */
  setZoomLevel: (level: number) =>
    set((state) => ({
      repositoryData: {
        ...state.repositoryData,
        zoomLevel: Math.max(
          state.graphConfig.minZoom,
          Math.min(state.graphConfig.maxZoom, level)
        ),
      },
    })),

  /**
   * Fetch repository data
   */
  fetchRepositoryData: async (url: string) => {
    set((state) => ({
      repositoryData: { ...state.repositoryData, loading: true, error: null },
    }));

    try {
      const nodes = await githubService.getRepositoryStructure(url);
      set((state) => ({
        repositoryData: {
          ...state.repositoryData,
          nodes,
          loading: false,
        },
      }));
    } catch (error) {
      set((state) => ({
        repositoryData: {
          ...state.repositoryData,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        },
      }));
    }
  },
})); 