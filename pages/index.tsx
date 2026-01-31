import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Box,
} from '@mui/material';
import Link from 'next/link';

const sections = [
  {
    title: 'Signs',
    description: 'View and manage the signs of the Second Coming',
    href: '/signs',
    ready: true,
  },
  {
    title: 'Relationships',
    description: 'Edit before/after relationships between signs',
    href: '/relationships',
    ready: true,
  },
  {
    title: 'Synonyms',
    description: 'Manage duplicate sign mappings',
    href: '/synonyms',
    ready: true,
  },
  {
    title: 'Groups',
    description: 'Organize signs into logical clusters',
    href: '/groups',
    ready: true,
  },
];

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Signs of the Second Coming
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Editor for managing signs, relationships, and scripture references
      </Typography>

      <Grid container spacing={3}>
        {sections.map((section) => (
          <Grid item xs={12} sm={6} key={section.title}>
            <Card sx={{ height: '100%' }} variant="outlined">
              {section.ready ? (
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
              ) : (
                <CardContent sx={{ opacity: 0.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                    {section.description}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Coming soon
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
