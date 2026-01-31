import React from 'react';
import { Container, Typography, Box, Button, Stack, Paper } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 600 }}>
          Signs of the Second Coming
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Exploring the order of prophetic signs leading to the return of Christ
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Link href="/signs" passHref legacyBehavior>
            <Button variant="outlined" size="small">
              View Signs List
            </Button>
          </Link>
        </Stack>
      </Container>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: 2, pb: 2 }}>
        <Paper 
          variant="outlined" 
          sx={{ 
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#fafafa',
            minHeight: 500,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/graph.svg" 
            alt="Graph of signs and their relationships"
            style={{ 
              maxWidth: 'none',
              height: 'auto',
              padding: '16px',
            }}
          />
        </Paper>
        <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary', textAlign: 'center' }}>
          Scroll to explore the graph. Each box is a sign; arrows show &quot;before → after&quot; relationships.
        </Typography>
      </Box>
    </Box>
  );
}
