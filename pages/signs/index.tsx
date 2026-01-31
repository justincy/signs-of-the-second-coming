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
import graphData from '../../data/graph-data.json';

interface Relationship {
  sign: string;
  references: string[];
}

interface SignDetail {
  name: string;
  references: string[];
  aliases: string[];
  comesBefore: Relationship[];
  comesAfter: Relationship[];
}

interface Props {
  signs: SignDetail[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const signs = Object.values(graphData as Record<string, SignDetail>).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return {
    props: { signs },
  };
};

export default function SignsPage({ signs }: Props) {
  return (
    <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Graph
        </Link>
        <Typography color="text.primary">Signs</Typography>
      </Breadcrumbs>

      <Typography variant="h3" sx={{ mb: 1 }}>
        Signs
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        {signs.length} signs with scripture references
      </Typography>

      <Stack spacing={2}>
        {signs.map((sign) => (
          <Card key={sign.name} variant="outlined">
            <Link 
              href={`/signs/${encodeURIComponent(sign.name)}`} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <CardActionArea>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {sign.name}
                  </Typography>
                  {sign.references.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {sign.references.slice(0, 5).map((ref, i) => (
                        <Chip key={i} label={ref} size="small" variant="outlined" />
                      ))}
                      {sign.references.length > 5 && (
                        <Chip 
                          label={`+${sign.references.length - 5} more`} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontStyle: 'italic' }}
                        />
                      )}
                    </Box>
                  )}
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {sign.comesAfter.length} incoming · {sign.comesBefore.length} outgoing relationships
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Link>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
