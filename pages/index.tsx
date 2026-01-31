import React from 'react';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ pt: 8, pb: 8 }}>
      <Typography variant="h2" sx={{ mb: 2, fontWeight: 600 }}>
        Signs of the Second Coming
      </Typography>
      <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary', fontWeight: 400 }}>
        Exploring the order of prophetic signs leading to the return of Christ
      </Typography>
      
      <Stack direction="row" spacing={2}>
        <Link href="/signs" passHref legacyBehavior>
          <Button variant="contained" size="large">
            View Signs
          </Button>
        </Link>
      </Stack>
    </Container>
  );
}
