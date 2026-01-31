import React, { useState, useRef, useCallback } from 'react';
import { Box, IconButton, Paper, Typography, ButtonGroup, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Link from 'next/link';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

export default function Home() {
  const [zoom, setZoom] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);

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
        }}
      >
        <Box>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
            Signs of the Second Coming
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            <Link href="/signs" style={{ color: 'inherit' }}>View signs list</Link>
            {' · '}
            Scroll to pan, Ctrl+scroll to zoom
          </Typography>
        </Box>

        {/* Zoom controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 50, textAlign: 'right' }}>
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

      {/* Graph container */}
      <Box 
        ref={containerRef}
        onWheel={handleWheel}
        sx={{ 
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#f5f5f5',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <Box
          sx={{
            transformOrigin: '0 0',
            transform: `scale(${zoom})`,
            transition: 'transform 0.1s ease-out',
            padding: 2,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/graph.svg" 
            alt="Graph of signs and their relationships"
            style={{ 
              display: 'block',
              maxWidth: 'none',
            }}
            draggable={false}
          />
        </Box>
      </Box>
    </Box>
  );
}
