import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Box,
  Stack,
  Breadcrumbs,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { GetStaticProps } from 'next';
import Link from 'next/link';
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
  groups: GroupDetail[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const simpleData = graphDataSimple as Record<string, GroupDetail>;
  
  // Get groups that exist in the simplified graph data
  const groups = (groupsData as Group[])
    .filter(g => simpleData[g.name])
    .map(g => simpleData[g.name])
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    props: { groups },
  };
};

export default function GroupsPage({ groups }: Props) {
  return (
    <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Graph
        </Link>
        <Typography color="text.primary">Groups</Typography>
      </Breadcrumbs>

      <Typography variant="h3" sx={{ mb: 1 }}>
        Groups
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        {groups.length} groups of related signs
      </Typography>

      <Stack spacing={2}>
        {groups.map((group) => (
          <Card key={group.name} variant="outlined">
            <Link 
              href={`/groups/${encodeURIComponent(group.name)}`} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <CardActionArea>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {group.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {group.members.length} members · {group.comesAfter.length} incoming · {group.comesBefore.length} outgoing
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {group.members.slice(0, 5).map((member, i) => (
                      <Chip key={i} label={member} size="small" variant="outlined" />
                    ))}
                    {group.members.length > 5 && (
                      <Chip 
                        label={`+${group.members.length - 5} more`} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontStyle: 'italic' }}
                      />
                    )}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Link>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
