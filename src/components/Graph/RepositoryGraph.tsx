import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { RepositoryNode, D3Node } from '../../types';
import { useStore } from '../../store';

interface D3Link {
  source: D3Node;
  target: D3Node;
  type?: string;
  description?: string;
}

/**
 * Props for the RepositoryGraph component
 */
interface RepositoryGraphProps {
  nodes: RepositoryNode[];
  config: GraphConfig;
  onNodeClick: (node: RepositoryNode) => void;
}

/**
 * RepositoryGraph component for visualizing repository structure
 */
export const RepositoryGraph = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { repositoryData, setSelectedNode, toggleNodeExpansion, setZoomLevel } = useStore();
  const { nodes, expandedNodes, zoomLevel } = repositoryData;
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<D3Node | null>(null);
  const [currentLevel, setCurrentLevel] = useState<D3Node | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [clickedNode, setClickedNode] = useState<D3Node | null>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && currentLevel) {
        handleExitNode();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentLevel]);

  const handleExitNode = useCallback(() => {
    // Find the parent node from the original nodes array
    const parentNode = nodes.find(node => 
      node.children?.some(child => child.id === currentLevel?.id)
    );
    
    setIsExpanding(true);
    setTimeout(() => {
      setCurrentLevel(parentNode as D3Node || null);
      setIsExpanding(false);
    }, 300);
  }, [currentLevel, nodes]);

  const handleNodeClick = useCallback((node: D3Node) => {
    if (node.type === 'directory') {
      setClickedNode(node);
      // First shrink the clicked node
      const clickedElement = d3.select(svgRef.current)
        .selectAll('circle')
        .filter((d: any) => d.id === node.id);
      
      clickedElement
        .transition()
        .duration(150)
        .attr('r', 8) // Back to normal size
        .on('end', () => {
          // Then expand to full screen
          setIsExpanding(true);
          setTimeout(() => {
            setCurrentLevel(node);
            setIsExpanding(false);
          }, 300);
        });
    } else if (node.content) {
      setSelectedContent(node.content);
    }
  }, []);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    const width = window.innerWidth * 0.8;
    const height = window.innerHeight * 0.8;
    const nodeRadius = 8;
    const linkDistance = 100;

    // Create SVG container with zoom behavior
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .call(d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
          setZoomLevel(event.transform.k);
        }));

    // Create a group for all elements
    const g = svg.append('g');

    // Get nodes for current level
    const currentNodes = currentLevel ? currentLevel.children || [] : nodes;
    const d3Nodes: D3Node[] = currentNodes.map(node => ({
      ...node,
      x: Math.random() * width,
      y: Math.random() * height,
      expanded: expandedNodes.has(node.id),
      level: currentLevel ? (currentLevel.level || 0) + 1 : 0
    }));

    // Create node map for efficient lookups
    const nodeMap = new Map(d3Nodes.map(node => [node.id, node]));

    // Create links between nodes
    const links: D3Link[] = [];
    d3Nodes.forEach(node => {
      if (node.children) {
        node.children.forEach(childId => {
          const childNode = nodeMap.get(childId.id);
          if (childNode) {
            links.push({ 
              source: node, 
              target: childNode,
              type: 'parent-child'
            });
          }
        });
      }

      if (node.relationships) {
        node.relationships.forEach(rel => {
          const targetNode = nodeMap.get(rel.targetId);
          if (targetNode) {
            links.push({
              source: node,
              target: targetNode,
              type: rel.type,
              description: rel.description
            });
          }
        });
      }
    });

    // Create force simulation
    const simulation = d3.forceSimulation(d3Nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(linkDistance))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(nodeRadius * 2));

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => {
        switch (d.type) {
          case 'import': return '#3b82f6';
          case 'reference': return '#10b981';
          case 'dependency': return '#f59e0b';
          default: return '#94a3b8';
        }
      })
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => d.type === 'parent-child' ? 'none' : '5,5');

    // Create nodes with hover and click animations
    const node = g.append('g')
      .selectAll<SVGCircleElement, D3Node>('circle')
      .data(d3Nodes)
      .join('circle')
      .attr('r', nodeRadius)
      .attr('fill', d => d.type === 'directory' ? '#64748b' : '#94a3b8')
      .attr('stroke', '#475569')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        // Immediate expansion on hover
        d3.select(event.currentTarget)
          .attr('r', nodeRadius * 1.2);

        const connectedNodes = new Set([d.id]);
        links.forEach(link => {
          if (link.source.id === d.id) connectedNodes.add(link.target.id);
          if (link.target.id === d.id) connectedNodes.add(link.source.id);
        });
        
        node.attr('fill', n => 
          connectedNodes.has(n.id) ? '#3b82f6' : n.type === 'directory' ? '#64748b' : '#94a3b8'
        );
        link.attr('stroke-opacity', l => 
          connectedNodes.has(l.source.id) && connectedNodes.has(l.target.id) ? 0.8 : 0.2
        );
      })
      .on('mouseleave', (event) => {
        setHoveredNode(null);
        // Immediate shrink on mouse leave
        d3.select(event.currentTarget)
          .attr('r', nodeRadius);

        node.attr('fill', d => d.type === 'directory' ? '#64748b' : '#94a3b8');
        link.attr('stroke-opacity', 0.4);
      })
      .call(d3.drag<SVGCircleElement, D3Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        event.stopPropagation();
        handleNodeClick(d);
      });

    // Create labels
    const label = g.append('g')
      .selectAll('text')
      .data(d3Nodes)
      .join('text')
      .text(d => d.name)
      .attr('font-size', '12px')
      .attr('fill', '#475569')
      .attr('text-anchor', 'middle')
      .attr('dy', nodeRadius + 15);

    // Create descriptions
    const description = g.append('g')
      .selectAll('text')
      .data(d3Nodes)
      .join('text')
      .text(d => d.description || '')
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .attr('text-anchor', 'middle')
      .attr('dy', nodeRadius + 30);

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source.x ?? 0))
        .attr('y1', d => (d.source.y ?? 0))
        .attr('x2', d => (d.target.x ?? 0))
        .attr('y2', d => (d.target.y ?? 0));

      node
        .attr('cx', d => (d.x ?? 0))
        .attr('cy', d => (d.y ?? 0));

      label
        .attr('x', d => (d.x ?? 0))
        .attr('y', d => (d.y ?? 0));

      description
        .attr('x', d => (d.x ?? 0))
        .attr('y', d => (d.y ?? 0));
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, expandedNodes, setZoomLevel, currentLevel, handleNodeClick]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <div className={`relative w-[80vw] h-[80vh] transition-all duration-300 ${
        isExpanding ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
      }`}>
        <svg
          ref={svgRef}
          className={`w-full h-full rounded-lg shadow-lg transition-colors duration-300 ${
            currentLevel ? 'bg-slate-800' : 'bg-white'
          }`}
        />
        {selectedContent && (
          <div className="absolute top-4 right-4 w-1/3 h-1/2 bg-white rounded-lg shadow-lg p-4 overflow-auto">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap">
              {selectedContent}
            </pre>
            <button
              className="absolute top-2 right-2 text-slate-500 hover:text-slate-700"
              onClick={() => setSelectedContent(null)}
            >
              ✕
            </button>
          </div>
        )}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 w-1/4 bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{hoveredNode.name}</h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                <span className="font-medium">Type:</span> {hoveredNode.type}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Path:</span> {hoveredNode.path}
              </p>
              {hoveredNode.size && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Size:</span> {hoveredNode.size} bytes
                </p>
              )}
              {hoveredNode.language && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Language:</span> {hoveredNode.language}
                </p>
              )}
              {hoveredNode.lastModified && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Last Modified:</span> {hoveredNode.lastModified}
                </p>
              )}
              {hoveredNode.description && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Description:</span> {hoveredNode.description}
                </p>
              )}
              {hoveredNode.relationships && hoveredNode.relationships.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-slate-600 mb-1">Relationships:</p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {hoveredNode.relationships.map((rel, index) => (
                      <li key={index} className="flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          rel.type === 'import' ? 'bg-blue-500' :
                          rel.type === 'reference' ? 'bg-green-500' :
                          rel.type === 'dependency' ? 'bg-orange-500' :
                          'bg-slate-500'
                        }`} />
                        {rel.description || rel.type}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        {currentLevel && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
            <button
              className="text-sm text-slate-600 hover:text-slate-800 flex items-center"
              onClick={handleExitNode}
            >
              <span className="mr-1">←</span> Back to {currentLevel.parent?.name || 'Root'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 