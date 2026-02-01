import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Paper, Typography, Chip, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from 'next/link';
import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';

import { CytoscapeElements } from '../lib/graphTransformer';

interface ElkGraphProps {
  elements: CytoscapeElements;
}

interface LayoutNode extends ElkNode {
  x: number;
  y: number;
  width: number;
  height: number;
  labels?: { text: string }[];
  isGroup?: boolean;
  members?: string[];
  aliases?: string[];
  references?: string[];
}

interface EdgeSection {
  id?: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  bendPoints?: { x: number; y: number }[];
}

interface LayoutEdge {
  id: string;
  sources: string[];
  targets: string[];
  sections?: EdgeSection[];
}

interface LayoutResult {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

interface SelectedNode {
  id: string;
  label: string;
  isGroup?: boolean;
  members?: string[];
  aliases?: string[];
  references?: string[];
  position: { x: number; y: number };
}

const elk = new ELK();

export default function ElkGraph({ elements }: ElkGraphProps) {
  const [layout, setLayout] = useState<LayoutResult | null>(null);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [transformStart, setTransformStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Estimate text width
  const getTextWidth = (text: string) => Math.min(text.length * 7 + 20, 200);
  const nodeHeight = 30;

  // Run ELK layout
  useEffect(() => {
    const runLayout = async () => {
      const elkGraph: ElkNode = {
        id: 'root',
        layoutOptions: {
          'elk.algorithm': 'layered',
          'elk.direction': 'DOWN',
          'elk.spacing.nodeNode': '30',
          'elk.layered.spacing.nodeNodeBetweenLayers': '50',
          'elk.spacing.edgeNode': '30',
          'elk.spacing.edgeEdge': '20',
          'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
          'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
          'elk.edge.routing': 'SPLINES',
          'elk.layered.mergeEdges': 'true',
        },
        children: elements.nodes.map((node) => ({
          id: node.data.id,
          width: getTextWidth(node.data.label),
          height: nodeHeight,
          labels: [{ text: node.data.label }],
          // Store custom data
          isGroup: node.data.isGroup,
          members: node.data.members,
          aliases: node.data.aliases,
          references: node.data.references,
        })),
        edges: elements.edges.map((edge) => ({
          id: edge.data.id,
          sources: [edge.data.source],
          targets: [edge.data.target],
        })),
      };

      try {
        const layoutResult = await elk.layout(elkGraph);
        setLayout({
          nodes: (layoutResult.children || []) as LayoutNode[],
          edges: (layoutResult.edges || []) as LayoutEdge[],
          width: layoutResult.width || 800,
          height: layoutResult.height || 600,
        });
        
        // Reset transform when layout changes
        setTransform({ x: 50, y: 50, scale: 1 });
      } catch (err) {
        console.error('ELK layout error:', err);
      }
    };

    runLayout();
  }, [elements]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as Element).closest('.node-group')) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setTransformStart({ x: transform.x, y: transform.y });
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setTransform({
      ...transform,
      x: transformStart.x + (e.clientX - dragStart.x),
      y: transformStart.y + (e.clientY - dragStart.y),
    });
  }, [isDragging, dragStart, transformStart, transform]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as Element).closest('.node-group')) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setTransformStart({ x: transform.x, y: transform.y });
  }, [transform]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;

    const touch = e.touches[0];
    setTransform({
      ...transform,
      x: transformStart.x + (touch.clientX - dragStart.x),
      y: transformStart.y + (touch.clientY - dragStart.y),
    });
  }, [isDragging, dragStart, transformStart, transform]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, transform.scale * delta));
    
    // Zoom toward mouse position
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      setTransform({
        scale: newScale,
        x: mouseX - (mouseX - transform.x) * (newScale / transform.scale),
        y: mouseY - (mouseY - transform.y) * (newScale / transform.scale),
      });
    }
  }, [transform]);

  // Node click handler
  const handleNodeClick = (node: LayoutNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setSelectedNode({
        id: node.id,
        label: node.labels?.[0]?.text || node.id,
        isGroup: node.isGroup,
        members: node.members,
        aliases: node.aliases,
        references: node.references,
        position: {
          x: e.clientX,
          y: e.clientY,
        },
      });
    }
  };

  // Build edge path from ELK sections
  const buildEdgePath = (edge: LayoutEdge): string => {
    if (!edge.sections || edge.sections.length === 0) return '';
    
    const section = edge.sections[0];
    let path = `M ${section.startPoint.x} ${section.startPoint.y}`;
    
    if (section.bendPoints && section.bendPoints.length > 0) {
      // Use quadratic curves for smoother bends
      const points = [section.startPoint, ...section.bendPoints, section.endPoint];
      
      for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        
        // Control point at current bend
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        
        if (i === 1) {
          path += ` L ${midX} ${midY}`;
        }
        
        const nextMidX = (curr.x + next.x) / 2;
        const nextMidY = (curr.y + next.y) / 2;
        
        path += ` Q ${curr.x} ${curr.y} ${nextMidX} ${nextMidY}`;
      }
      
      path += ` L ${section.endPoint.x} ${section.endPoint.y}`;
    } else {
      path += ` L ${section.endPoint.x} ${section.endPoint.y}`;
    }
    
    return path;
  };

  if (!layout) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography>Computing layout...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Box
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onClick={() => setSelectedNode(null)}
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        <svg
          ref={svgRef}
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
          }}
          width={layout.width + 100}
          height={layout.height + 100}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
            </marker>
          </defs>

          {/* Edges */}
          {layout.edges.map((edge) => (
            <path
              key={edge.id}
              d={buildEdgePath(edge)}
              fill="none"
              stroke="#90a4ae"
              strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
            />
          ))}

          {/* Nodes */}
          {layout.nodes.map((node) => (
            <g
              key={node.id}
              className="node-group"
              transform={`translate(${node.x}, ${node.y})`}
              onClick={(e) => handleNodeClick(node, e)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                width={node.width}
                height={node.height}
                rx={6}
                fill={node.isGroup ? '#fff3e0' : '#e3f2fd'}
                stroke={node.isGroup ? '#f57c00' : '#1976d2'}
                strokeWidth="2"
              />
              <text
                x={node.width / 2}
                y={node.height / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fill={node.isGroup ? '#e65100' : '#1565c0'}
              >
                {node.labels?.[0]?.text || node.id}
              </text>
            </g>
          ))}
        </svg>
      </Box>

      {/* Node detail popover */}
      {selectedNode && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            left: Math.min(selectedNode.position.x + 10, window.innerWidth - 320),
            top: Math.max(selectedNode.position.y - 100, 10),
            width: 300,
            maxHeight: '60vh',
            overflow: 'auto',
            zIndex: 1000,
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, pr: 2 }}>
              {selectedNode.label}
            </Typography>
            <IconButton size="small" onClick={() => setSelectedNode(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {selectedNode.isGroup && (
            <Chip label="Group" size="small" sx={{ mb: 1, backgroundColor: '#fff3e0' }} />
          )}

          {selectedNode.aliases && selectedNode.aliases.length > 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Also: {selectedNode.aliases.slice(0, 3).join(', ')}
              {selectedNode.aliases.length > 3 && ` +${selectedNode.aliases.length - 3} more`}
            </Typography>
          )}

          {selectedNode.members && selectedNode.members.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Members ({selectedNode.members.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {selectedNode.members.slice(0, 5).map((m, i) => (
                  <Chip key={i} label={m} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                ))}
                {selectedNode.members.length > 5 && (
                  <Chip label={`+${selectedNode.members.length - 5}`} size="small" variant="outlined" />
                )}
              </Box>
            </Box>
          )}

          {selectedNode.references && selectedNode.references.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                References:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {selectedNode.references.slice(0, 4).map((ref, i) => (
                  <Chip key={i} label={ref} size="small" sx={{ fontSize: '0.7rem' }} />
                ))}
                {selectedNode.references.length > 4 && (
                  <Chip label={`+${selectedNode.references.length - 4}`} size="small" />
                )}
              </Box>
            </Box>
          )}

          <Link href={selectedNode.isGroup ? `/groups/${encodeURIComponent(selectedNode.id)}` : `/signs/${encodeURIComponent(selectedNode.id)}`}>
            <Button
              size="small"
              variant="outlined"
              endIcon={<OpenInNewIcon />}
              sx={{ mt: 1 }}
            >
              View Details
            </Button>
          </Link>
        </Paper>
      )}
    </Box>
  );
}
