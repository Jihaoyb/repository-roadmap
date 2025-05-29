import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import { RepositoryGraph } from './components/Graph/RepositoryGraph';
import { useStore } from './store';

function App() {
  const [inputUrl, setInputUrl] = useState('');
  const { repositoryData, fetchRepositoryData } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl) {
      fetchRepositoryData(inputUrl);
    }
  };

  return (
    <Layout>
      <div className="w-full h-[calc(100vh-10rem)] bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
        {/* URL Input Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter GitHub repository URL"
              className="flex-1 px-5 py-2.5 rounded-xl border-2 border-cream-100 focus:outline-none focus:ring-2 focus:ring-cream-800/20 focus:border-cream-800 bg-white/80 backdrop-blur-sm text-cream-800 placeholder-cream-600/50 transition-all duration-300"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-cream-800 text-white rounded-xl hover:bg-cream-700 transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
            >
              Visualize
            </button>
          </div>
        </form>

        {/* Loading State */}
        {repositoryData.loading && (
          <div className="flex items-center justify-center h-[calc(100%-4rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-cream-800 border-t-transparent"></div>
          </div>
        )}

        {/* Error State */}
        {repositoryData.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
          <div className="h-[calc(100%-4rem)]">
            <RepositoryGraph
              nodes={repositoryData.nodes}
              config={{
                nodeRadius: 8,
                linkDistance: 100,
                zoomLevel: repositoryData.zoomLevel
              }}
              onNodeClick={(node) => console.log('Node clicked:', node)}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App; 