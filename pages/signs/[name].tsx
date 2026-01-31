import React from 'react';
import {
  Container,
  Typography,
  Box,
  Chip,
  Paper,
  Breadcrumbs,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import graphData from '../../data/graph-data.json';

interface Relationship {
  sign: string;
  references: string[];
}

interface SignDetail {
  name: string;
  references: string[];
  aliases: string[];
  members?: string[];
  comesBefore: Relationship[];
  comesAfter: Relationship[];
}

interface Props {
  sign: SignDetail;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.keys(graphData).map((name) => ({
    params: { name },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const name = params?.name as string;
  const sign = (graphData as Record<string, SignDetail>)[name];

  if (!sign) {
    return { notFound: true };
  }

  return {
    props: { sign },
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

export default function SignDetailPage({ sign }: Props) {
  return (
    <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Graph
        </Link>
        <Link href="/signs" style={{ color: 'inherit', textDecoration: 'none' }}>
          Signs
        </Link>
        <Typography color="text.primary">{sign.name}</Typography>
      </Breadcrumbs>

      {/* Title */}
      <Typography variant="h3" sx={{ mb: 1, fontWeight: 600 }}>
        {sign.name}
      </Typography>

      {/* Aliases */}
      {sign.aliases && sign.aliases.length > 0 && (
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Also known as: {sign.aliases.join(', ')}
        </Typography>
      )}

      {/* References */}
      {sign.references.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Scripture References
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {sign.references.map((ref, i) => (
              <Chip key={i} label={ref} variant="outlined" />
            ))}
          </Box>
        </Paper>
      )}

      {/* Comes After */}
      {sign.comesAfter.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArrowBackIcon /> Comes After
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            These signs occur before &quot;{sign.name}&quot;
          </Typography>
          <List disablePadding>
            {sign.comesAfter.map((rel, i) => (
              <ListItem key={i} disablePadding sx={{ display: 'block', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  <SignLink name={rel.sign} />
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
      {sign.comesBefore.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArrowForwardIcon /> Comes Before
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            These signs occur after &quot;{sign.name}&quot;
          </Typography>
          <List disablePadding>
            {sign.comesBefore.map((rel, i) => (
              <ListItem key={i} disablePadding sx={{ display: 'block', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  <SignLink name={rel.sign} />
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
      {sign.comesAfter.length === 0 && sign.comesBefore.length === 0 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            No relationships have been defined for this sign yet.
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
