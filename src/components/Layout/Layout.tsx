/**
 * Layout Component Guidelines:
 * 1. Basic Structure:
 *    - Import React and required components (Navbar, Footer)
 *    - Create functional component with children props
 *    - Use TypeScript interface for props typing
 * 
 * 2. Layout Implementation:
 *    - Use CSS Flexbox/Grid for main layout
 *    - Create wrapper div with min-height: 100vh
 *    - Structure with three main sections:
 *      - Header (Navbar)
 *      - Main content (flex: 1 for remaining space)
 *      - Footer
 * 
 * 3. Styling:
 *    - Use CSS modules or styled-components
 *    - Set flex direction as column
 *    - Ensure footer stays at bottom
 *    - Add padding/margins for spacing
 * 
 * 4. Usage:
 *    - Wrap app's routes with Layout component
 *    - Pass page content as children
 */

import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      {/* Footer will be added here later */}
    </div>
  );
};

export default Layout;