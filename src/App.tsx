import React, { useState } from 'react';
import type { RepositoryNode } from './types';
import { useStore } from './store';
import { RepositoryGraph } from './components/Graph/RepositoryGraph';

/**
 * Main App component
 */
function App() {
  const [inputUrl, setInputUrl] = useState('');
  const {
    repositoryUrl,
    repositoryData,
    graphConfig,
    setRepositoryUrl,
    setSelectedNode,
    fetchRepositoryData,
  } = useStore();

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl) {
      setRepositoryUrl(inputUrl);
      fetchRepositoryData(inputUrl);
    }
  };

  /**
   * Handle node click in the graph
   */
  const handleNodeClick = (node: RepositoryNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Repository Roadmap
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* URL Input Form */}
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter GitHub repository URL"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Visualize
              </button>
            </form>
          </div>
        </div>

        {/* Loading State */}
        {repositoryData.loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading repository data...</p>
          </div>
        )}

        {/* Error State */}
        {repositoryData.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{repositoryData.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Graph Visualization */}
        {!repositoryData.loading && repositoryData.nodes.length > 0 && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <RepositoryGraph
                nodes={repositoryData.nodes}
                config={graphConfig}
                onNodeClick={handleNodeClick}
              />
            </div>
          </div>
        )}

        {/* Selected Node Details */}
        {repositoryData.selectedNode && (
          <div className="mt-6 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">
                {repositoryData.selectedNode.name}
              </h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>Type: {repositoryData.selectedNode.type}</p>
                <p>Path: {repositoryData.selectedNode.path}</p>
                {repositoryData.selectedNode.size && (
                  <p>Size: {repositoryData.selectedNode.size} bytes</p>
                )}
                {repositoryData.selectedNode.language && (
                  <p>Language: {repositoryData.selectedNode.language}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 