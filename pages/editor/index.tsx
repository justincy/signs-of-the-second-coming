import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Box,
  Alert,
} from '@mui/material';
import Link from 'next/link';

const sections = [
  {
    title: 'Signs',
    description: 'View and manage the signs of the Second Coming',
    href: '/editor/signs',
  },
  {
    title: 'Relationships',
    description: 'Edit before/after relationships between signs',
    href: '/editor/relationships',
  },
  {
    title: 'Synonyms',
    description: 'Manage duplicate sign mappings',
    href: '/editor/synonyms',
  },
  {
    title: 'Groups',
    description: 'Organize signs into logical clusters',
    href: '/editor/groups',
  },
];

export default function EditorHome() {
  return (
    <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Editor
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        This editor is for local use only. It requires the Next.js dev server to be running.
      </Alert>

      <Grid container spacing={3}>
        {sections.map((section) => (
          <Grid item xs={12} sm={6} key={section.title}>
            <Card sx={{ height: '100%' }} variant="outlined">
              <Link href={section.href} passHref legacyBehavior>
                <CardActionArea component="a">
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {section.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                      {section.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Link>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
