import React from 'react';
import {
  Container,
  Typography,
  Box,
  Chip,
  Paper,
  Breadcrumbs,
  List,
  ListItem,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import graphDataSimple from '../../data/graph-data-simple.json';
import groupsData from '../../data/groups.json';

interface Relationship {
  sign: string;
  references: string[];
}

interface GroupDetail {
  name: string;
  references: string[];
  members: string[];
  comesBefore: Relationship[];
  comesAfter: Relationship[];
}

interface Group {
  name: string;
  members: string[];
}

interface Props {
  group: GroupDetail;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = (groupsData as Group[]).map((group) => ({
    params: { name: group.name },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const name = params?.name as string;
  const simpleData = graphDataSimple as Record<string, GroupDetail>;
  const group = simpleData[name];

  if (!group) {
    return { notFound: true };
  }

  return {
    props: { group },
  };
};

function SignLink({ name }: { name: string }) {
  return (
    <Link 
      href={`/signs/${encodeURIComponent(name)}`}
      style={{ color: '#1976d2', textDecoration: 'none' }}
    >
      {name}
    </Link>
  );
}

function GroupLink({ name }: { name: string }) {
  return (
    <Link 
      href={`/groups/${encodeURIComponent(name)}`}
      style={{ color: '#1976d2', textDecoration: 'none' }}
    >
      {name}
    </Link>
  );
}

export default function GroupDetailPage({ group }: Props) {
  // Check if related signs are groups themselves
  const groupNames = new Set((groupsData as Group[]).map(g => g.name));
  
  const renderRelationLink = (signName: string) => {
    if (groupNames.has(signName)) {
      return <GroupLink name={signName} />;
    }
    return <SignLink name={signName} />;
  };

  return (
    <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Graph
        </Link>
        <Link href="/groups" style={{ color: 'inherit', textDecoration: 'none' }}>
          Groups
        </Link>
        <Typography color="text.primary">{group.name}</Typography>
      </Breadcrumbs>

      {/* Title */}
      <Typography variant="h3" sx={{ mb: 1, fontWeight: 600 }}>
        {group.name}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
        Group of {group.members.length} related signs
      </Typography>

      {/* Members */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Members
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {group.members.map((member, i) => (
            <Chip
              key={i}
              label={member}
              component={Link}
              href={`/signs/${encodeURIComponent(member)}`}
              clickable
              variant="outlined"
              sx={{ backgroundColor: 'white' }}
            />
          ))}
        </Box>
      </Paper>

      {/* References */}
      {group.references.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Scripture References
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {group.references.map((ref, i) => (
              <Chip key={i} label={ref} variant="outlined" />
            ))}
          </Box>
        </Paper>
      )}

      {/* Comes After */}
      {group.comesAfter.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArrowBackIcon /> Comes After
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            This group occurs after these signs/groups
          </Typography>
          <List disablePadding>
            {group.comesAfter.map((rel, i) => (
              <ListItem key={i} disablePadding sx={{ display: 'block', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {renderRelationLink(rel.sign)}
                </Typography>
                {rel.references.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {rel.references.map((ref, j) => (
                      <Chip key={j} label={ref} size="small" sx={{ fontSize: '0.75rem' }} />
                    ))}
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Comes Before */}
      {group.comesBefore.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArrowForwardIcon /> Comes Before
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            This group occurs before these signs/groups
          </Typography>
          <List disablePadding>
            {group.comesBefore.map((rel, i) => (
              <ListItem key={i} disablePadding sx={{ display: 'block', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {renderRelationLink(rel.sign)}
                </Typography>
                {rel.references.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {rel.references.map((ref, j) => (
                      <Chip key={j} label={ref} size="small" sx={{ fontSize: '0.75rem' }} />
                    ))}
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* No relationships */}
      {group.comesAfter.length === 0 && group.comesBefore.length === 0 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            No relationships have been defined for this group yet.
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
