import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import dynamic from 'next/dynamic';

import { transformGraphData, CytoscapeElements } from '../lib/graphTransformer';

// Import raw data
import signsData from '../data/signs.json';
import relationshipsData from '../data/relationships.json';
import groupsData from '../data/groups.json';
import synonymsData from '../data/synonyms.json';

// Dynamic import for Cytoscape (no SSR - it needs DOM)
const CytoscapeGraph = dynamic(() => import('../components/CytoscapeGraph'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Typography>Loading graph...</Typography>
    </Box>
  ),
});

interface Sign {
  name: string;
  references: string[];
}

interface Relationship {
  before: string;
  after: string;
  references: string[];
}

interface Group {
  name: string;
  members: string[];
}

interface Synonym {
  duplicate: string;
  synonym: string;
}

interface Props {
  signs: Sign[];
  relationships: Relationship[];
  groups: Group[];
  synonyms: Synonym[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      signs: signsData as Sign[],
      relationships: relationshipsData as Relationship[],
      groups: groupsData as Group[],
      synonyms: synonymsData as Synonym[],
    },
  };
};

export default function Home({ signs, relationships, groups, synonyms }: Props) {
  const [collapseGroups, setCollapseGroups] = useState(true);
  const [collapseSynonyms, setCollapseSynonyms] = useState(true);

  // Transform data based on current options
  const elements: CytoscapeElements = useMemo(() => {
    return transformGraphData(signs, relationships, groups, synonyms, {
      collapseGroups,
      collapseSynonyms,
    });
  }, [signs, relationships, groups, synonyms, collapseGroups, collapseSynonyms]);

  // Stats
  const nodeCount = elements.nodes.length;
  const edgeCount = elements.edges.length;
  const groupCount = elements.nodes.filter(n => n.data.isGroup).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <img src="/logo.svg" alt="" width={36} height={36} />
          <Box>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
              Signs of the Second Coming
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              <Link href="/signs" style={{ color: 'inherit' }}>
                Signs
              </Link>
              {' · '}
              <Link href="/groups" style={{ color: 'inherit' }}>
                Groups
              </Link>
              {' · '}
              {nodeCount} nodes · {edgeCount} edges
              {groupCount > 0 && ` · ${groupCount} groups`}
            </Typography>
          </Box>
        </Box>

        {/* Options */}
        <Paper variant="outlined" sx={{ px: 2, py: 0.5, display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={collapseGroups}
                onChange={(e) => setCollapseGroups(e.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="body2">Collapse Groups</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={collapseSynonyms}
                onChange={(e) => setCollapseSynonyms(e.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="body2">Collapse Synonyms</Typography>}
          />
        </Paper>
      </Box>

      {/* Graph */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <CytoscapeGraph elements={elements} />
      </Box>
    </Box>
  );
}
