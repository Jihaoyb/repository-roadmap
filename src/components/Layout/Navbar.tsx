// Create a navbar that includes:
// - Logo/Title
// - Navigation links
// - Repository URL input
// - Any other global controls

import React, { useState } from 'react';

const Navbar: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Handle repository URL submission
    setTimeout(() => setIsLoading(false), 1000); // Temporary loading simulation
  };

  return (
    <nav className="bg-cream-50/80 backdrop-blur-sm border-b border-cream-100/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-20">
          {/* Logo and Title */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-3 group">
              <span className="text-3xl font-bold text-cream-800 group-hover:text-cream-700 transition-all duration-300">
                RepoMap
              </span>
            </a>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="/" 
              className="text-cream-800 hover:text-cream-700 transition-all duration-300 text-lg font-medium hover:scale-105"
            >
              Home
            </a>
            <a 
              href="/about" 
              className="text-cream-800 hover:text-cream-700 transition-all duration-300 text-lg font-medium hover:scale-105"
            >
              About
            </a>
            <a 
              href="/docs" 
              className="text-cream-800 hover:text-cream-700 transition-all duration-300 text-lg font-medium hover:scale-105"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

