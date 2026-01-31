import React from 'react';
import { Box } from '@mui/material';
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

export default function SignGraph({ name, comesAfter, comesBefore }: SignGraphProps) {
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

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        style={{ width: '100%', maxWidth: width, height: 'auto', minHeight: 200 }}
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
  );
}
