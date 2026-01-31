import React, { useState, useCallback, useRef } from 'react';
import { Box, IconButton, ButtonGroup, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Link from 'next/link';

interface Relationship {
  sign: string;
  references: string[];
}

interface SignGraphProps {
  name: string;
  comesAfter: Relationship[];
  comesBefore: Relationship[];
}

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.15;

export default function SignGraph({ name, comesAfter, comesBefore }: SignGraphProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout constants
  const width = 800;
  const nodeHeight = 36;
  const nodeRadius = 8;
  const centerX = width / 2;
  const centerY = 150;
  const columnGap = 250;
  const rowGap = 50;

  // Calculate positions
  const beforeNodes = comesAfter.map((rel, i) => ({
    name: rel.sign,
    x: centerX - columnGap,
    y: centerY + (i - (comesAfter.length - 1) / 2) * rowGap,
  }));

  const afterNodes = comesBefore.map((rel, i) => ({
    name: rel.sign,
    x: centerX + columnGap,
    y: centerY + (i - (comesBefore.length - 1) / 2) * rowGap,
  }));

  // Calculate SVG height based on content
  const maxNodes = Math.max(comesAfter.length, comesBefore.length, 1);
  const height = Math.max(200, centerY + (maxNodes * rowGap) / 2 + 50);

  // Truncate long names
  const truncate = (text: string, maxLen: number) => 
    text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;

  // Estimate text width (rough)
  const textWidth = (text: string) => Math.min(text.length * 7, 180);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta)));
    }
  }, []);

  // Pan handlers (mouse)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as Element).closest('a')) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ x: pan.x, y: pan.y });
  }, [pan]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setPan({
        x: panStart.x + deltaX,
        y: panStart.y + deltaY,
      });
    },
    [isDragging, dragStart, panStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Pan handlers (touch)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as Element).closest('a')) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setPanStart({ x: pan.x, y: pan.y });
  }, [pan]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;

      setPan({
        x: panStart.x + deltaX,
        y: panStart.y + deltaY,
      });
    },
    [isDragging, dragStart, panStart]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <Box>
      {/* Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Drag to pan · Ctrl+scroll to zoom
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {Math.round(zoom * 100)}%
          </Typography>
          <ButtonGroup size="small" variant="outlined">
            <Tooltip title="Zoom out">
              <IconButton onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM} size="small">
                <RemoveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset">
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

      {/* Graph container */}
      <Box
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        sx={{
          width: '100%',
          height: 300,
          overflow: 'hidden',
          backgroundColor: '#fafafa',
          borderRadius: 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        <Box
          sx={{
            transformOrigin: '0 0',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            style={{ width, height }}
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

            {/* Arrows from "before" nodes to center */}
            {beforeNodes.map((node, i) => (
              <line
                key={`before-arrow-${i}`}
                x1={node.x + textWidth(truncate(node.name, 28)) / 2 + 10}
                y1={node.y}
                x2={centerX - textWidth(truncate(name, 28)) / 2 - 15}
                y2={centerY}
                stroke="#666"
                strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
              />
            ))}

            {/* Arrows from center to "after" nodes */}
            {afterNodes.map((node, i) => (
              <line
                key={`after-arrow-${i}`}
                x1={centerX + textWidth(truncate(name, 28)) / 2 + 10}
                y1={centerY}
                x2={node.x - textWidth(truncate(node.name, 28)) / 2 - 15}
                y2={node.y}
                stroke="#666"
                strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
              />
            ))}

            {/* "Before" nodes (comesAfter - signs that come before this one) */}
            {beforeNodes.map((node, i) => (
              <Link key={`before-${i}`} href={`/signs/${encodeURIComponent(node.name)}`}>
                <g style={{ cursor: 'pointer' }}>
                  <rect
                    x={node.x - textWidth(truncate(node.name, 28)) / 2 - 10}
                    y={node.y - nodeHeight / 2}
                    width={textWidth(truncate(node.name, 28)) + 20}
                    height={nodeHeight}
                    rx={nodeRadius}
                    fill="#e3f2fd"
                    stroke="#1976d2"
                    strokeWidth="1.5"
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fontSize="13"
                    fill="#1565c0"
                  >
                    {truncate(node.name, 28)}
                  </text>
                </g>
              </Link>
            ))}

            {/* Center node (current sign) */}
            <rect
              x={centerX - textWidth(truncate(name, 28)) / 2 - 12}
              y={centerY - nodeHeight / 2 - 2}
              width={textWidth(truncate(name, 28)) + 24}
              height={nodeHeight + 4}
              rx={nodeRadius}
              fill="#fff3e0"
              stroke="#f57c00"
              strokeWidth="2"
            />
            <text
              x={centerX}
              y={centerY + 5}
              textAnchor="middle"
              fontSize="14"
              fontWeight="600"
              fill="#e65100"
            >
              {truncate(name, 28)}
            </text>

            {/* "After" nodes (comesBefore - signs that come after this one) */}
            {afterNodes.map((node, i) => (
              <Link key={`after-${i}`} href={`/signs/${encodeURIComponent(node.name)}`}>
                <g style={{ cursor: 'pointer' }}>
                  <rect
                    x={node.x - textWidth(truncate(node.name, 28)) / 2 - 10}
                    y={node.y - nodeHeight / 2}
                    width={textWidth(truncate(node.name, 28)) + 20}
                    height={nodeHeight}
                    rx={nodeRadius}
                    fill="#e8f5e9"
                    stroke="#388e3c"
                    strokeWidth="1.5"
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fontSize="13"
                    fill="#2e7d32"
                  >
                    {truncate(node.name, 28)}
                  </text>
                </g>
              </Link>
            ))}

            {/* Labels */}
            {beforeNodes.length > 0 && (
              <text x={centerX - columnGap} y={30} textAnchor="middle" fontSize="12" fill="#666">
                Comes Before
              </text>
            )}
            {afterNodes.length > 0 && (
              <text x={centerX + columnGap} y={30} textAnchor="middle" fontSize="12" fill="#666">
                Comes After
              </text>
            )}
          </svg>
        </Box>
      </Box>
    </Box>
  );
}
