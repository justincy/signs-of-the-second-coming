import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  ButtonGroup,
  Tooltip,
  Popover,
  Paper,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Link as MuiLink,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import graphDataFull from '../data/graph-data.json';
import graphDataSimple from '../data/graph-data-simple.json';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

interface SignDetail {
  name: string;
  references: string[];
  aliases: string[];
  members?: string[];
  comesBefore: { sign: string; references: string[] }[];
  comesAfter: { sign: string; references: string[] }[];
}

interface GraphData {
  [key: string]: SignDetail;
}

interface Props {
  fullGraphData: GraphData;
  simpleGraphData: GraphData;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      fullGraphData: graphDataFull as GraphData,
      simpleGraphData: graphDataSimple as GraphData,
    },
  };
};

type GraphMode = 'full' | 'simple';

export default function Home({ fullGraphData, simpleGraphData }: Props) {
  const [graphMode, setGraphMode] = useState<GraphMode>('simple');
  const [zoom, setZoom] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const [svgContent, setSvgContent] = useState<string>('');
  const [selectedSign, setSelectedSign] = useState<SignDetail | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const graphData = graphMode === 'full' ? fullGraphData : simpleGraphData;
  const svgPath = graphMode === 'full' ? '/graph.svg' : '/graph-simple.svg';

  // Load SVG content
  useEffect(() => {
    setSvgContent(''); // Clear while loading
    fetch(svgPath)
      .then((res) => res.text())
      .then((svg) => setSvgContent(svg))
      .catch((err) => console.error('Failed to load SVG:', err));
  }, [svgPath]);

  // Attach event handlers to SVG nodes
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current) return;

    const container = svgContainerRef.current;
    const nodes = container.querySelectorAll('.node');

    const handleNodeClick = (e: Event) => {
      const node = e.currentTarget as Element;
      const title = node.querySelector('title')?.textContent;
      if (title && graphData[title]) {
        setSelectedSign(graphData[title]);
        const rect = (node as Element).getBoundingClientRect();
        setPopoverAnchor({
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }
    };

    const handleNodeMouseEnter = (e: Event) => {
      const node = e.currentTarget as Element;
      const path = node.querySelector('path');
      if (path) {
        path.setAttribute('data-original-fill', path.getAttribute('fill') || '');
        path.setAttribute('fill', '#bbdefb');
        path.setAttribute('stroke', '#1976d2');
        path.setAttribute('stroke-width', '2');
      }
    };

    const handleNodeMouseLeave = (e: Event) => {
      const node = e.currentTarget as Element;
      const path = node.querySelector('path');
      if (path) {
        path.setAttribute('fill', path.getAttribute('data-original-fill') || '#f0f0f0');
        path.setAttribute('stroke', 'black');
        path.setAttribute('stroke-width', '1');
      }
    };

    nodes.forEach((node) => {
      node.addEventListener('click', handleNodeClick);
      node.addEventListener('mouseenter', handleNodeMouseEnter);
      node.addEventListener('mouseleave', handleNodeMouseLeave);
      (node as HTMLElement).style.cursor = 'pointer';
    });

    return () => {
      nodes.forEach((node) => {
        node.removeEventListener('click', handleNodeClick);
        node.removeEventListener('mouseenter', handleNodeMouseEnter);
        node.removeEventListener('mouseleave', handleNodeMouseLeave);
      });
    };
  }, [svgContent, graphData]);

  const handleGraphModeChange = (_: React.MouseEvent, newMode: GraphMode | null) => {
    if (newMode) {
      setGraphMode(newMode);
      setSelectedSign(null);
      setPopoverAnchor(null);
    }
  };

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(0.5);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta)));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as Element).closest('.node')) return;

    const container = containerRef.current;
    if (!container) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setScrollStart({ x: container.scrollLeft, y: container.scrollTop });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const container = containerRef.current;
      if (!container) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      container.scrollLeft = scrollStart.x - deltaX;
      container.scrollTop = scrollStart.y - deltaY;
    },
    [isDragging, dragStart, scrollStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClosePopover = () => {
    setSelectedSign(null);
    setPopoverAnchor(null);
  };

  const handleSignClick = (signName: string) => {
    if (graphData[signName]) {
      setSelectedSign(graphData[signName]);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    return () => {
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'background.paper',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
            Signs of the Second Coming
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            <Link href="/signs" style={{ color: 'inherit' }}>
              View signs list
            </Link>
            {' · '}
            Click a sign for details · Drag to pan · Ctrl+scroll to zoom
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Graph mode toggle */}
          <ToggleButtonGroup
            value={graphMode}
            exclusive
            onChange={handleGraphModeChange}
            size="small"
          >
            <ToggleButton value="simple">
              <Tooltip title="Simplified (groups collapsed)">
                <span>Simple</span>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="full">
              <Tooltip title="Full (all signs)">
                <span>Full</span>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Zoom controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', minWidth: 50, textAlign: 'right' }}
            >
              {Math.round(zoom * 100)}%
            </Typography>
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Zoom out">
                <IconButton onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM} size="small">
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset zoom">
                <IconButton onClick={handleZoomReset} size="small">
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom in">
                <IconButton onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM} size="small">
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>
          </Box>
        </Box>
      </Box>

      {/* Graph container */}
      <Box
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        sx={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#f5f5f5',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <Box
          ref={svgContainerRef}
          sx={{
            transformOrigin: '0 0',
            transform: `scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            padding: 2,
            '& svg': {
              display: 'block',
            },
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </Box>

      {/* Sign detail popover */}
      <Popover
        open={Boolean(selectedSign && popoverAnchor)}
        anchorReference="anchorPosition"
        anchorPosition={popoverAnchor ? { top: popoverAnchor.y, left: popoverAnchor.x } : undefined}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        disableScrollLock
      >
        {selectedSign && (
          <Paper sx={{ p: 2, maxWidth: 400, maxHeight: '60vh', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, pr: 2 }}>
                {selectedSign.name}
              </Typography>
              <IconButton size="small" onClick={handleClosePopover} sx={{ mt: -0.5, mr: -0.5 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {selectedSign.aliases && selectedSign.aliases.length > 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Also known as: {selectedSign.aliases.join(', ')}
              </Typography>
            )}

            {selectedSign.members && selectedSign.members.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccountTreeIcon fontSize="small" /> Group members
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedSign.members.map((member, i) => (
                    <Chip key={i} label={member} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {selectedSign.references.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  References
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedSign.references.map((ref, i) => (
                    <Chip key={i} label={ref} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {selectedSign.comesAfter.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowBackIcon fontSize="small" /> Comes after
                </Typography>
                {selectedSign.comesAfter.map((rel, i) => (
                  <Box key={i} sx={{ mb: 1 }}>
                    <MuiLink
                      component="button"
                      variant="body2"
                      onClick={() => handleSignClick(rel.sign)}
                      sx={{ textAlign: 'left' }}
                    >
                      {rel.sign}
                    </MuiLink>
                    {rel.references.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {rel.references.map((ref, j) => (
                          <Chip key={j} label={ref} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {selectedSign.comesBefore.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowForwardIcon fontSize="small" /> Comes before
                </Typography>
                {selectedSign.comesBefore.map((rel, i) => (
                  <Box key={i} sx={{ mb: 1 }}>
                    <MuiLink
                      component="button"
                      variant="body2"
                      onClick={() => handleSignClick(rel.sign)}
                      sx={{ textAlign: 'left' }}
                    >
                      {rel.sign}
                    </MuiLink>
                    {rel.references.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {rel.references.map((ref, j) => (
                          <Chip key={j} label={ref} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        )}
      </Popover>
    </Box>
  );
}
