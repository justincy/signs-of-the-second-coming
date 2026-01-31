import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Paper, Typography, Chip, Button, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from 'next/link';
import cytoscape, { Core, NodeSingular } from 'cytoscape';
// @ts-ignore - no types available
import dagre from 'cytoscape-dagre';

import { CytoscapeElements } from '../lib/graphTransformer';

// Register the dagre layout
cytoscape.use(dagre);

interface CytoscapeGraphProps {
  elements: CytoscapeElements;
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

export default function CytoscapeGraph({ elements }: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...elements.nodes,
        ...elements.edges,
      ],
      style: [
        // Node styles
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': '#e3f2fd',
            'border-color': '#1976d2',
            'border-width': 2,
            'font-size': '11px',
            'text-wrap': 'wrap',
            'text-max-width': '120px',
            'width': 'label',
            'height': 'label',
            'padding': '12px',
            'shape': 'roundrectangle',
            'color': '#1565c0',
          },
        },
        // Group node styles
        {
          selector: 'node[?isGroup]',
          style: {
            'background-color': '#fff3e0',
            'border-color': '#f57c00',
            'color': '#e65100',
          },
        },
        // Edge styles
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#90a4ae',
            'target-arrow-color': '#90a4ae',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.8,
          },
        },
        // Hover states
        {
          selector: 'node:active',
          style: {
            'overlay-opacity': 0.1,
          },
        },
        // Selected node
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#1565c0',
          },
        },
      ],
      layout: {
        name: 'dagre',
        // @ts-ignore - dagre-specific options
        rankDir: 'TB', // Top to bottom
        nodeSep: 50,
        rankSep: 80,
        edgeSep: 20,
        spacingFactor: 1.2,
      } as cytoscape.LayoutOptions,
      // Interaction options
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    cyRef.current = cy;

    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target as NodeSingular;
      const data = node.data();
      const renderedPosition = node.renderedPosition();
      const container = containerRef.current;
      
      if (container) {
        const rect = container.getBoundingClientRect();
        setSelectedNode({
          id: data.id,
          label: data.label,
          isGroup: data.isGroup,
          members: data.members,
          aliases: data.aliases,
          references: data.references,
          position: {
            x: rect.left + renderedPosition.x,
            y: rect.top + renderedPosition.y,
          },
        });
      }
    });

    // Click on background to deselect
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    // Cleanup
    return () => {
      cy.destroy();
    };
  }, [elements]);

  // Close popover
  const handleClosePopover = useCallback(() => {
    setSelectedNode(null);
    if (cyRef.current) {
      cyRef.current.$(':selected').unselect();
    }
  }, []);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Cytoscape container */}
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f5f5f5',
        }}
      />

      {/* Node detail popover */}
      {selectedNode && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            left: Math.min(selectedNode.position.x, window.innerWidth - 320),
            top: Math.max(selectedNode.position.y - 200, 10),
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
            <IconButton size="small" onClick={handleClosePopover}>
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
